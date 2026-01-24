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
        
        # Detection of probe insertion (sudden temp drop)
        self._temp_drop_threshold = -5.0  # °C drop threshold
        self._temp_drop_check_seconds = 30  # Time window to check for drop
        
        # Detection of actual cooking start (temp rising)
        self._min_rising_duration_seconds = 20  # Stable rise before calculations
        
        # Stability threshold for display (CONFIGURABLE)
        self._stability_threshold_seconds = 30  # Max acceptable deviation
        self._stability_period_seconds = 60  # Observation period
        
        # Internal state
        self._cooking_start_time: datetime | None = None  # When stable rise began
        self._estimate_history: list[tuple[datetime, float]] = []  # [(timestamp, estimate_in_min), ...]
        self._is_stable = False
        self._last_temp_for_drop_detection: float | None = None
        self._last_temp_time: datetime | None = None

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
        Includes probe insertion detection and estimate stability checking.
        """
        now = datetime.now()
        
        # Step 1: Detect probe insertion (sudden temp drop)
        if self._detect_temp_drop(current_temp, now):
            self._reset_for_new_cooking()
            self._last_temp_for_drop_detection = current_temp
            self._last_temp_time = now
            return None  # Don't display anything during reset
        
        self._last_temp_for_drop_detection = current_temp
        self._last_temp_time = now
        
        if current_temp >= target_temp:
            self._last_estimate = 0.0
            self._is_stable = True
            return 0.0

        # Step 2: Check if temperature is rising
        if not self._is_temperature_rising(temp_history):
            self._cooking_start_time = None
            self._is_stable = False
            return None
        
        # Step 3: Check minimum rising duration
        if self._cooking_start_time is None:
            self._cooking_start_time = now
        
        rising_duration = (now - self._cooking_start_time).total_seconds()
        if rising_duration < self._min_rising_duration_seconds:
            return None  # Wait for stable rise

        remaining_temp = target_temp - current_temp
        raw_estimate = None

        # Try exponential model first (more accurate for cooking physics)
        # This estimates the heating constant k from the curve shape
        raw_estimate = self._calculate_exponential_remaining(
            current_temp=current_temp,
            target_temp=target_temp,
            ambient_temp=ambient_temp,
            temp_history=temp_history,
        )

        # Fall back to linear if exponential didn't work
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
            return self._last_estimate if self._is_stable else None

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
            final_estimate = round(smoothed, 1)
        else:
            self._last_estimate = raw_estimate
            final_estimate = round(raw_estimate, 1)

        # Step 4: We have a valid estimate - display it
        # The temp drop detection + 20s rising requirement + smoothing 
        # already handle the edge cases. No need for additional delay.
        self._is_stable = True
        return final_estimate
    
    def _detect_temp_drop(self, current_temp: float, now: datetime) -> bool:
        """
        Detect if probe was just inserted into cold food.
        
        Returns True if temperature dropped significantly.
        """
        if self._last_temp_for_drop_detection is None or self._last_temp_time is None:
            return False
        
        elapsed = (now - self._last_temp_time).total_seconds()
        if elapsed > self._temp_drop_check_seconds:
            return False  # Too much time passed, not a probe insertion
        
        temp_change = current_temp - self._last_temp_for_drop_detection
        return temp_change < self._temp_drop_threshold
    
    def _reset_for_new_cooking(self) -> None:
        """Reset all state for a new cooking session."""
        self._last_estimate = None
        self._cooking_start_time = None
        self._estimate_history = []
        self._is_stable = False
    
    def _is_temperature_rising(self, temp_history: list[tuple[datetime, float]]) -> bool:
        """Check if temperature is currently rising."""
        rate = self.calculate_heating_rate(temp_history)
        return rate is not None and rate > 0.1  # At least 0.1°C/min
    
    def _check_estimate_stability(self) -> bool:
        """
        Check if the estimate has been stable over the stability period.
        
        Compares overall trend (first vs last estimate) instead of every
        consecutive pair, which was too strict.
        
        Stability means: the difference between expected and actual decline
        over the full period is less than _stability_threshold_seconds.
        """
        if len(self._estimate_history) < 2:
            return False
        
        # Need at least stability_period_seconds of data
        first_time, first_estimate = self._estimate_history[0]
        last_time, last_estimate = self._estimate_history[-1]
        duration = (last_time - first_time).total_seconds()
        
        if duration < self._stability_period_seconds:
            return False
        
        # Expected natural decline = time elapsed (in minutes)
        expected_decline_min = duration / 60
        
        # Actual decline = first_estimate - last_estimate
        actual_decline_min = first_estimate - last_estimate
        
        # Deviation from expected (in seconds)
        deviation_min = abs(actual_decline_min - expected_decline_min)
        deviation_sec = deviation_min * 60
        
        return deviation_sec <= self._stability_threshold_seconds

    def _calculate_exponential_remaining(
        self,
        current_temp: float,
        target_temp: float,
        ambient_temp: float | None,
        temp_history: list[tuple[datetime, float]],
    ) -> float | None:
        """
        Calculate remaining time using exponential model (Newton's law of heating).
        
        The temperature follows: T(t) = T_ambient - (T_ambient - T_0) * e^(-k*t)
        
        We estimate k from the observed heating curve, which gives us the rate
        at which the temperature approaches its asymptote.
        
        If ambient_temp is not provided, we estimate it from the curve's behavior.
        """
        if len(temp_history) < 3:
            return None
        
        # Get recent data (last 3 minutes for responsiveness)
        now = temp_history[-1][0]
        cutoff = now - timedelta(minutes=self._history_window_minutes)
        recent_data = [(t, v) for t, v in temp_history if t > cutoff]
        
        if len(recent_data) < 3:
            return None
        
        # Use provided ambient temp or estimate it
        effective_ambient = ambient_temp
        if effective_ambient is None or effective_ambient <= current_temp:
            # Estimate ambient from heating acceleration
            # If heating is slowing down, we can infer the asymptote
            effective_ambient = self._estimate_ambient_from_curve(recent_data, current_temp)
        
        if effective_ambient is None or effective_ambient <= current_temp:
            return None  # Can't estimate, fall back to linear
        
        if effective_ambient <= target_temp:
            return None  # Target is above ambient, will never reach (shouldn't happen for cooking)
        
        # Calculate k from multiple point pairs for robustness
        k_values = []
        for i in range(len(recent_data) - 1):
            t1, temp1 = recent_data[i]
            t2, temp2 = recent_data[-1]  # Always compare to most recent
            
            delta_t = (t2 - t1).total_seconds() / 60
            if delta_t < 0.25:  # Need at least 15 seconds between points
                continue
            
            diff1 = effective_ambient - temp1
            diff2 = effective_ambient - temp2
            
            if diff1 <= 0 or diff2 <= 0 or diff2 >= diff1:
                continue
            
            try:
                ratio = diff2 / diff1
                if 0 < ratio < 1:
                    k = -math.log(ratio) / delta_t
                    if k > 0:
                        k_values.append(k)
            except (ValueError, ZeroDivisionError):
                continue
        
        if not k_values:
            return None
        
        # Use median k for robustness against outliers
        k_values.sort()
        k = k_values[len(k_values) // 2]
        
        # Calculate remaining time to target
        diff_current = effective_ambient - current_temp
        diff_target = effective_ambient - target_temp
        
        if diff_current <= 0 or diff_target <= 0:
            return 0.0
        
        try:
            ratio = diff_target / diff_current
            if ratio <= 0:
                return None
            remaining_minutes = -math.log(ratio) / k
        except (ValueError, ZeroDivisionError):
            return None
        
        if remaining_minutes < 0 or remaining_minutes > 1440:
            return None
        
        return round(remaining_minutes, 1)
    
    def _estimate_ambient_from_curve(
        self,
        temp_history: list[tuple[datetime, float]],
        current_temp: float,
    ) -> float | None:
        """
        Estimate the effective ambient temperature from the heating curve.
        
        Uses the fact that as temp approaches ambient, the rate decreases.
        We can estimate ambient by looking at how the rate changes over time.
        """
        if len(temp_history) < 4:
            return None
        
        # Calculate rate at beginning and end of the window
        mid_point = len(temp_history) // 2
        
        # Early portion
        early_data = temp_history[:mid_point + 1]
        # Late portion
        late_data = temp_history[mid_point:]
        
        if len(early_data) < 2 or len(late_data) < 2:
            return None
        
        # Calculate rates
        def calc_rate(data):
            if len(data) < 2:
                return None
            t1, temp1 = data[0]
            t2, temp2 = data[-1]
            dt = (t2 - t1).total_seconds() / 60
            if dt < 0.1:
                return None
            return (temp2 - temp1) / dt
        
        rate_early = calc_rate(early_data)
        rate_late = calc_rate(late_data)
        
        if rate_early is None or rate_late is None:
            return None
        
        if rate_early <= 0 or rate_late <= 0:
            return None
        
        # If rate is decreasing (normal for heating), estimate ambient
        # Using: rate = k * (T_ambient - T)
        # rate_early / rate_late = (T_ambient - T_early) / (T_ambient - T_late)
        
        temp_early = early_data[-1][1]
        temp_late = late_data[-1][1]
        
        if rate_late >= rate_early:
            # Rate not decreasing, can't estimate
            # Use a high default (typical oven temp)
            return current_temp + 150  # Rough estimate
        
        # Solve for T_ambient:
        # r1 / r2 = (Ta - Te) / (Ta - Tl)
        # r1 * (Ta - Tl) = r2 * (Ta - Te)
        # r1*Ta - r1*Tl = r2*Ta - r2*Te
        # Ta * (r1 - r2) = r1*Tl - r2*Te
        # Ta = (r1*Tl - r2*Te) / (r1 - r2)
        
        try:
            t_ambient = (rate_early * temp_late - rate_late * temp_early) / (rate_early - rate_late)
        except ZeroDivisionError:
            return None
        
        # Sanity check: ambient should be higher than current temp
        if t_ambient <= current_temp:
            # Use default estimate
            return current_temp + 100
        
        # Sanity check: ambient shouldn't be unreasonably high
        if t_ambient > 400:  # Max reasonable oven temp
            return 300  # Default high temp
        
        return t_ambient

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
