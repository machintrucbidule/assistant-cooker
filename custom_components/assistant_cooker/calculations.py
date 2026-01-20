"""Cooking time calculation algorithms for Assistant Cooker."""
from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class CookingCalculator:
    """Calculator for cooking time estimations."""

    def __init__(self) -> None:
        """Initialize the calculator."""
        self._smoothing_factor = 0.3  # For exponential smoothing
        self._min_history_points = 2  # Reduced for earlier estimates
        self._history_window_minutes = 3  # Shorter window for faster response
        self._last_estimate: float | None = None
        self._estimate_smoothing = 0.7  # Smoothing for estimate stability

    def calculate_heating_rate(
        self,
        temp_history: list[tuple[datetime, float]],
    ) -> float | None:
        """
        Calculate the current heating rate in °C/min.
        
        Uses linear regression over the last 5 minutes of data.
        """
        if len(temp_history) < self._min_history_points:
            return None

        # Get data from last 5 minutes
        now = temp_history[-1][0] if temp_history else datetime.now()
        cutoff = now - timedelta(minutes=self._history_window_minutes)
        recent_data = [(t, v) for t, v in temp_history if t > cutoff]

        if len(recent_data) < self._min_history_points:
            return None

        # Calculate linear regression
        n = len(recent_data)
        
        # Convert times to minutes from first point
        t0 = recent_data[0][0]
        x_vals = [(t - t0).total_seconds() / 60 for t, _ in recent_data]
        y_vals = [v for _, v in recent_data]

        # Calculate means
        x_mean = sum(x_vals) / n
        y_mean = sum(y_vals) / n

        # Calculate slope (rate)
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
        denominator = sum((x - x_mean) ** 2 for x in x_vals)

        if denominator == 0:
            return None

        rate = numerator / denominator
        
        # Round to 2 decimal places
        return round(rate, 2)

    def calculate_remaining_time(
        self,
        current_temp: float,
        target_temp: float,
        temp_history: list[tuple[datetime, float]],
        ambient_temp: float | None = None,
        ambient_history: list[tuple[datetime, float]] | None = None,
    ) -> float | None:
        """
        Calculate remaining cooking time in minutes.
        
        Uses multiple approaches:
        1. Newton's law when ambient temp available (most accurate for longer cooks)
        2. Linear extrapolation as fallback
        3. Early estimation with minimal data
        
        Applies smoothing to prevent jumpy estimates.
        """
        if current_temp >= target_temp:
            self._last_estimate = 0.0
            return 0.0

        remaining_temp = target_temp - current_temp
        raw_estimate = None

        # Try Newton's law first if we have ambient temp
        if ambient_temp is not None and ambient_temp > current_temp:
            raw_estimate = self._calculate_newton_remaining(
                current_temp=current_temp,
                target_temp=target_temp,
                ambient_temp=ambient_temp,
                temp_history=temp_history,
            )

        # Fall back to linear if Newton didn't work
        if raw_estimate is None:
            raw_estimate = self._calculate_linear_remaining(
                remaining_temp=remaining_temp,
                temp_history=temp_history,
                current_temp=current_temp,
            )

        # Early estimate: if we have at least 1 minute of data
        if raw_estimate is None and len(temp_history) >= 2:
            raw_estimate = self._calculate_early_estimate(
                current_temp=current_temp,
                target_temp=target_temp,
                temp_history=temp_history,
            )

        if raw_estimate is None:
            return self._last_estimate  # Return last known estimate

        # Sanity checks
        if raw_estimate < 0:
            raw_estimate = 0.0
        if raw_estimate > 1440:  # Max 24 hours
            raw_estimate = 1440.0

        # Apply smoothing to prevent jumpy estimates
        if self._last_estimate is not None and self._last_estimate > 0:
            # Weighted average: more weight on new estimate as we get closer
            progress = 1 - (remaining_temp / max(target_temp - 20, 1))  # Rough progress
            weight = min(0.9, 0.3 + progress * 0.5)  # More responsive as we progress
            smoothed = weight * raw_estimate + (1 - weight) * self._last_estimate
            self._last_estimate = smoothed
            return round(smoothed, 1)
        else:
            self._last_estimate = raw_estimate
            return round(raw_estimate, 1)

    def _calculate_early_estimate(
        self,
        current_temp: float,
        target_temp: float,
        temp_history: list[tuple[datetime, float]],
    ) -> float | None:
        """
        Calculate early estimate when we don't have much data.
        Uses the first and last point to estimate rate.
        """
        if len(temp_history) < 2:
            return None

        first_time, first_temp = temp_history[0]
        last_time, last_temp = temp_history[-1]

        elapsed_min = (last_time - first_time).total_seconds() / 60
        if elapsed_min < 0.5:  # Need at least 30 seconds
            return None

        temp_change = last_temp - first_temp
        if temp_change <= 0:
            return None

        rate = temp_change / elapsed_min
        remaining = target_temp - current_temp

        return remaining / rate

    def _calculate_linear_remaining(
        self,
        remaining_temp: float,
        temp_history: list[tuple[datetime, float]],
        current_temp: float = None,
    ) -> float | None:
        """Calculate remaining time using linear extrapolation."""
        rate = self.calculate_heating_rate(temp_history)
        
        if rate is None or rate <= 0.01:  # Minimum rate threshold
            return None

        remaining_minutes = remaining_temp / rate
        
        # Sanity check - max 24 hours
        if remaining_minutes > 1440:
            return None
            
        return remaining_minutes

    def _calculate_newton_remaining(
        self,
        current_temp: float,
        target_temp: float,
        ambient_temp: float,
        temp_history: list[tuple[datetime, float]],
    ) -> float | None:
        """
        Calculate remaining time using Newton's law of heating.
        
        T(t) = T_ambient - (T_ambient - T_0) * e^(-k*t)
        
        Where k is the heating constant calculated from historical data.
        """
        if len(temp_history) < self._min_history_points:
            return None

        # We need at least 2 points to estimate k
        # Get recent points
        now = temp_history[-1][0]
        cutoff = now - timedelta(minutes=self._history_window_minutes)
        recent_data = [(t, v) for t, v in temp_history if t > cutoff]

        if len(recent_data) < 2:
            return None

        # Estimate k from two points
        t1, temp1 = recent_data[0]
        t2, temp2 = recent_data[-1]
        
        delta_t = (t2 - t1).total_seconds() / 60  # minutes
        
        if delta_t <= 0:
            return None

        # From Newton's law:
        # (T_ambient - T2) / (T_ambient - T1) = e^(-k * delta_t)
        # k = -ln((T_ambient - T2) / (T_ambient - T1)) / delta_t
        
        diff1 = ambient_temp - temp1
        diff2 = ambient_temp - temp2
        
        if diff1 <= 0 or diff2 <= 0:
            # Temperature already at or above ambient - shouldn't happen for heating
            return None
            
        if diff2 >= diff1:
            # Temperature not increasing - fall back to linear
            return None

        try:
            ratio = diff2 / diff1
            if ratio <= 0 or ratio >= 1:
                return None
            k = -math.log(ratio) / delta_t
        except (ValueError, ZeroDivisionError):
            return None

        if k <= 0:
            return None

        # Now calculate time to reach target
        # T_target = T_ambient - (T_ambient - T_current) * e^(-k*t)
        # Solving for t:
        # (T_ambient - T_target) / (T_ambient - T_current) = e^(-k*t)
        # t = -ln((T_ambient - T_target) / (T_ambient - T_current)) / k
        
        diff_current = ambient_temp - current_temp
        diff_target = ambient_temp - target_temp
        
        if diff_current <= 0:
            return 0.0  # Already at or above ambient
            
        if diff_target <= 0:
            # Target is at or above ambient - will never reach with heating alone
            # This is actually common (e.g., target 74°C with oven at 180°C)
            # In this case, Newton's law says it WILL reach eventually
            # But we need to handle the math differently
            pass
        
        if diff_target >= diff_current:
            # Target is further from ambient than current temp
            # This means we're moving away from target (cooling scenario) - shouldn't happen
            return None

        try:
            ratio = diff_target / diff_current
            if ratio <= 0:
                return None
            remaining_minutes = -math.log(ratio) / k
        except (ValueError, ZeroDivisionError):
            return None

        # Sanity check
        if remaining_minutes < 0 or remaining_minutes > 1440:
            return None

        return round(remaining_minutes, 1)

    def get_heating_trend(
        self,
        temp_history: list[tuple[datetime, float]],
    ) -> str:
        """
        Determine if temperature is increasing, stable, or decreasing.
        
        Returns: "increasing", "stable", or "decreasing"
        """
        rate = self.calculate_heating_rate(temp_history)
        
        if rate is None:
            return "stable"
        
        if rate > 0.1:
            return "increasing"
        elif rate < -0.1:
            return "decreasing"
        else:
            return "stable"

    def estimate_total_cooking_time(
        self,
        start_temp: float,
        target_temp: float,
        current_rate: float | None,
    ) -> float | None:
        """
        Estimate total cooking time from start to target.
        
        This is used for initial estimates before we have much history.
        """
        if current_rate is None or current_rate <= 0:
            return None
            
        total_temp_change = target_temp - start_temp
        if total_temp_change <= 0:
            return 0.0
            
        return round(total_temp_change / current_rate, 1)
