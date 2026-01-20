"""Food database for Assistant Cooker integration.

IMPORTANT: After modifying this file, you MUST run:
    python scripts/generate_food_database.py

This regenerates the frontend food-database.js to keep it synchronized.
"""
from __future__ import annotations

from typing import Final

# Food database structure:
# {
#     "category_id": {
#         "foods": {
#             "food_id": {
#                 "doneness": {
#                     "doneness_id": temperature_celsius
#                 },
#                 "carryover_type": "type_for_compensation"
#             }
#         }
#     }
# }

FOOD_DATABASE: Final[dict] = {
    "beef": {
        "foods": {
            "steak": {
                "doneness": {
                    "blue": 46,
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                    "well_done": 68,
                },
                "carryover_type": "beef_steak",
            },
            "roast": {
                "doneness": {
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                    "well_done": 68,
                },
                "carryover_type": "beef_roast",
            },
            "prime_rib": {
                "doneness": {
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                    "well_done": 68,
                },
                "carryover_type": "beef_roast",
            },
            "filet_mignon": {
                "doneness": {
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                },
                "carryover_type": "beef_steak",
            },
            "ribeye": {
                "doneness": {
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                    "well_done": 68,
                },
                "carryover_type": "beef_steak",
            },
            "burger": {
                "doneness": {
                    "medium": 63,
                    "well_done": 71,
                    "safe": 71,
                },
                "carryover_type": "other",
            },
            "brisket": {
                "doneness": {
                    "pulled": 93,
                },
                "carryover_type": "beef_roast",
            },
            "tenderloin": {
                "doneness": {
                    "rare": 52,
                    "medium_rare": 55,
                    "medium": 57,
                    "medium_well": 63,
                },
                "carryover_type": "beef_roast",
            },
        },
    },
    "pork": {
        "foods": {
            "chop": {
                "doneness": {
                    "medium": 63,
                    "well_done": 71,
                },
                "carryover_type": "pork_other",
            },
            "tenderloin": {
                "doneness": {
                    "medium": 63,
                    "well_done": 68,
                },
                "carryover_type": "pork_other",
            },
            "roast": {
                "doneness": {
                    "medium": 63,
                    "well_done": 71,
                },
                "carryover_type": "pork_roast",
            },
            "ribs": {
                "doneness": {
                    "tender": 88,
                    "fall_off_bone": 93,
                },
                "carryover_type": "pork_other",
            },
            "pulled_pork": {
                "doneness": {
                    "pulled": 93,
                },
                "carryover_type": "pork_roast",
            },
            "ham": {
                "doneness": {
                    "reheated": 60,
                },
                "carryover_type": "pork_roast",
            },
            "belly": {
                "doneness": {
                    "tender": 77,
                    "very_tender": 85,
                },
                "carryover_type": "pork_other",
            },
        },
    },
    "poultry": {
        "foods": {
            "chicken_whole": {
                "doneness": {
                    "done": 74,
                },
                "carryover_type": "poultry",
            },
            "chicken_breast": {
                "doneness": {
                    "done": 74,
                },
                "carryover_type": "poultry",
            },
            "chicken_thigh": {
                "doneness": {
                    "done": 74,
                    "tender": 76,
                },
                "carryover_type": "poultry",
            },
            "turkey_whole": {
                "doneness": {
                    "done": 74,
                },
                "carryover_type": "poultry",
            },
            "turkey_breast": {
                "doneness": {
                    "done": 74,
                },
                "carryover_type": "poultry",
            },
            "duck_breast": {
                "doneness": {
                    "pink": 57,
                    "medium": 63,
                },
                "carryover_type": "poultry",
            },
            "duck_leg_confit": {
                "doneness": {
                    "confit": 82,
                },
                "carryover_type": "poultry",
            },
        },
    },
    "lamb": {
        "foods": {
            "leg": {
                "doneness": {
                    "rare": 52,
                    "pink": 57,
                    "medium": 63,
                    "well_done": 68,
                },
                "carryover_type": "lamb_roast",
            },
            "chops": {
                "doneness": {
                    "rare": 52,
                    "pink": 57,
                    "medium": 63,
                },
                "carryover_type": "lamb_other",
            },
            "rack": {
                "doneness": {
                    "rare": 52,
                    "pink": 57,
                    "medium": 63,
                },
                "carryover_type": "lamb_other",
            },
            "shank": {
                "doneness": {
                    "braised": 85,
                },
                "carryover_type": "lamb_other",
            },
            "shoulder": {
                "doneness": {
                    "pulled": 88,
                },
                "carryover_type": "lamb_roast",
            },
        },
    },
    "veal": {
        "foods": {
            "roast": {
                "doneness": {
                    "medium": 63,
                    "well_done": 68,
                },
                "carryover_type": "veal",
            },
            "chop": {
                "doneness": {
                    "medium": 63,
                },
                "carryover_type": "veal",
            },
            "cutlet": {
                "doneness": {
                    "medium": 63,
                },
                "carryover_type": "veal",
            },
        },
    },
    "fish": {
        "foods": {
            "salmon": {
                "doneness": {
                    "mi_cuit": 46,
                    "medium": 52,
                    "well_done": 60,
                },
                "carryover_type": "fish",
            },
            "tuna": {
                "doneness": {
                    "rare": 43,
                    "medium": 52,
                },
                "carryover_type": "fish",
            },
            "cod": {
                "doneness": {
                    "medium": 55,
                    "well_done": 60,
                },
                "carryover_type": "fish",
            },
            "sea_bass": {
                "doneness": {
                    "medium": 55,
                },
                "carryover_type": "fish",
            },
            "halibut": {
                "doneness": {
                    "medium": 55,
                    "well_done": 60,
                },
                "carryover_type": "fish",
            },
            "shrimp": {
                "doneness": {
                    "safe": 63,
                },
                "carryover_type": "fish",
            },
            "lobster": {
                "doneness": {
                    "medium": 60,
                },
                "carryover_type": "fish",
            },
        },
    },
    "game": {
        "foods": {
            "wild_boar": {
                "doneness": {
                    "medium": 63,
                    "well_done": 68,
                },
                "carryover_type": "other",
            },
            "venison": {
                "doneness": {
                    "rare": 52,
                    "pink": 57,
                    "medium": 63,
                },
                "carryover_type": "other",
            },
            "rabbit": {
                "doneness": {
                    "medium": 63,
                    "well_done": 71,
                },
                "carryover_type": "other",
            },
        },
    },
    "other": {
        "foods": {
            "egg_soft_boiled": {
                "doneness": {
                    "soft": 64,
                },
                "carryover_type": "other",
            },
            "egg_poached": {
                "doneness": {
                    "perfect": 67,
                },
                "carryover_type": "other",
            },
            "egg_hard_boiled": {
                "doneness": {
                    "hard": 77,
                },
                "carryover_type": "other",
            },
        },
    },
}


def get_categories() -> list[str]:
    """Get list of all food categories."""
    return list(FOOD_DATABASE.keys())


def get_foods_for_category(category: str) -> list[str]:
    """Get list of foods for a given category."""
    if category not in FOOD_DATABASE:
        return []
    return list(FOOD_DATABASE[category]["foods"].keys())


def get_doneness_for_food(category: str, food: str) -> list[str]:
    """Get list of doneness options for a given food."""
    if category not in FOOD_DATABASE:
        return []
    if food not in FOOD_DATABASE[category]["foods"]:
        return []
    return list(FOOD_DATABASE[category]["foods"][food]["doneness"].keys())


def get_temperature(category: str, food: str, doneness: str) -> int | None:
    """Get target temperature for a given food and doneness."""
    if category not in FOOD_DATABASE:
        return None
    if food not in FOOD_DATABASE[category]["foods"]:
        return None
    food_data = FOOD_DATABASE[category]["foods"][food]
    if doneness not in food_data["doneness"]:
        return None
    return food_data["doneness"][doneness]


def get_carryover_type(category: str, food: str) -> str:
    """Get carryover compensation type for a given food."""
    if category not in FOOD_DATABASE:
        return "other"
    if food not in FOOD_DATABASE[category]["foods"]:
        return "other"
    return FOOD_DATABASE[category]["foods"][food].get("carryover_type", "other")


def get_all_foods_flat() -> list[dict]:
    """Get flattened list of all foods with their data."""
    result = []
    for category_id, category_data in FOOD_DATABASE.items():
        for food_id, food_data in category_data["foods"].items():
            for doneness_id, temperature in food_data["doneness"].items():
                result.append({
                    "category": category_id,
                    "food": food_id,
                    "doneness": doneness_id,
                    "temperature": temperature,
                    "carryover_type": food_data.get("carryover_type", "other"),
                })
    return result


def is_manual_mode(category: str, food: str) -> bool:
    """Check if the current selection is manual mode."""
    return category == "manual" and food == "manual"


# Manual mode constant
MANUAL_CATEGORY = "manual"
MANUAL_FOOD = "manual"
MANUAL_DONENESS = "manual"
