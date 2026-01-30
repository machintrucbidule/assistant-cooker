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
            "filet": {
                "doneness": {
                    "blue": 50,
                    "rare": 55,
                    "medium": 60,
                    "well_done": 66,
                },
                "carryover_type": "beef_steak",
            },
            "roast": {
                "doneness": {
                    "blue": 50,
                    "rare": 55,
                    "medium": 60,
                    "well_done": 66,
                },
                "carryover_type": "beef_roast",
            },
            "rib": {
                "doneness": {
                    "blue": 50,
                    "rare": 55,
                    "medium": 60,
                    "well_done": 66,
                },
                "carryover_type": "beef_roast",
            },
            "chuck_roast": {
                "doneness": {
                    "well_done": 60,
                },
                "carryover_type": "beef_roast",
            },
            "beef_roulade": {
                "doneness": {
                    "well_done": 66,
                },
                "carryover_type": "beef_roast",
            },
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
    "veal": {
        "foods": {
            "filet_mignon": {
                "doneness": {
                    "medium_rare": 59,
                    "medium": 63,
                },
                "carryover_type": "veal",
            },
            "rump_roast": {
                "doneness": {
                    "medium": 61,
                },
                "carryover_type": "veal",
            },
            "rack": {
                "doneness": {
                    "medium_rare": 55,
                    "medium": 63,
                    "well_done": 66,
                },
                "carryover_type": "veal",
            },
            "shoulder": {
                "doneness": {
                    "medium": 63,
                    "well_done": 66,
                },
                "carryover_type": "veal",
            },
            "veal_roulade": {
                "doneness": {
                    "well_done": 66,
                },
                "carryover_type": "veal",
            },
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
    "lamb": {
        "foods": {
            "rack": {
                "doneness": {
                    "medium": 61,
                },
                "carryover_type": "lamb_other",
            },
            "saddle": {
                "doneness": {
                    "medium_rare": 60,
                    "medium": 61,
                },
                "carryover_type": "lamb_roast",
            },
            "leg": {
                "doneness": {
                    "medium_rare": 60,
                    "medium": 61,
                    "well_done": 66,
                },
                "carryover_type": "lamb_roast",
            },
            "shoulder": {
                "doneness": {
                    "medium": 61,
                    "well_done": 66,
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
            "shank": {
                "doneness": {
                    "braised": 85,
                },
                "carryover_type": "lamb_other",
            },
        },
    },
    "pork": {
        "foods": {
            "tenderloin": {
                "doneness": {
                    "medium": 61,
                },
                "carryover_type": "pork_other",
            },
            "rack": {
                "doneness": {
                    "well_done": 70,
                },
                "carryover_type": "pork_other",
            },
            "roast": {
                "doneness": {
                    "well_done": 70,
                },
                "carryover_type": "pork_roast",
            },
            "ham": {
                "doneness": {
                    "well_done": 70,
                },
                "carryover_type": "pork_roast",
            },
            "chop": {
                "doneness": {
                    "medium": 63,
                    "well_done": 71,
                },
                "carryover_type": "pork_other",
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
            "chicken_breast": {
                "doneness": {
                    "done": 69,
                },
                "carryover_type": "poultry",
            },
            "chicken_thigh": {
                "doneness": {
                    "done": 71,
                },
                "carryover_type": "poultry",
            },
            "stuffed_poultry": {
                "doneness": {
                    "medium": 69,
                    "well_done": 73,
                },
                "carryover_type": "poultry",
            },
            "whole_poultry": {
                "doneness": {
                    "medium": 66,
                    "well_done": 71,
                },
                "carryover_type": "poultry",
            },
            "guinea_fowl_breast": {
                "doneness": {
                    "done": 70,
                },
                "carryover_type": "poultry",
            },
            "guinea_fowl_thigh": {
                "doneness": {
                    "done": 74,
                },
                "carryover_type": "poultry",
            },
            "chicken_whole": {
                "doneness": {
                    "done": 74,
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
        },
    },
    "duck": {
        "foods": {
            "breast": {
                "doneness": {
                    "medium": 59,
                },
                "carryover_type": "duck",
            },
            "thigh": {
                "doneness": {
                    "done": 71,
                },
                "carryover_type": "duck",
            },
            "confit": {
                "doneness": {
                    "confit": 79,
                },
                "carryover_type": "duck",
            },
        },
    },
    "game": {
        "foods": {
            "venison": {
                "doneness": {
                    "medium_rare": 60,
                    "medium": 61,
                    "well_done": 71,
                },
                "carryover_type": "other",
            },
            "wild_boar_thigh": {
                "doneness": {
                    "medium": 71,
                    "well_done": 77,
                },
                "carryover_type": "other",
            },
            "rabbit": {
                "doneness": {
                    "done": 67,
                },
                "carryover_type": "other",
            },
        },
    },
    "foie_gras": {
        "foods": {
            "foie_gras": {
                "doneness": {
                    "rare": 58,
                    "mi_cuit": 63,
                    "medium": 72,
                },
                "carryover_type": "foie_gras",
            },
        },
    },
    "fish": {
        "foods": {
            "cod": {
                "doneness": {
                    "medium": 51,
                    "well_done": 54,
                },
                "carryover_type": "fish",
            },
            "monkfish": {
                "doneness": {
                    "medium": 52,
                    "well_done": 54,
                },
                "carryover_type": "fish",
            },
            "pike_perch": {
                "doneness": {
                    "medium": 51,
                    "well_done": 54,
                },
                "carryover_type": "fish",
            },
            "salmon": {
                "doneness": {
                    "rare": 40,
                    "medium_rare": 48,
                    "medium": 50,
                    "well_done": 52,
                },
                "carryover_type": "fish",
            },
            "tuna": {
                "doneness": {
                    "rare": 42,
                    "medium_rare": 48,
                    "medium": 50,
                    "well_done": 52,
                },
                "carryover_type": "fish",
            },
            "swordfish": {
                "doneness": {
                    "medium_rare": 48,
                    "medium": 50,
                    "well_done": 52,
                },
                "carryover_type": "fish",
            },
            "whole_fish": {
                "doneness": {
                    "medium": 49,
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
    "other": {
        "foods": {
            "squash": {
                "doneness": {
                    "tender": 85,
                    "fondant": 90,
                },
                "carryover_type": "other",
            },
            "meat_terrine": {
                "doneness": {
                    "medium": 72,
                    "well_done": 78,
                },
                "carryover_type": "terrine",
            },
            "fish_terrine": {
                "doneness": {
                    "medium": 65,
                    "well_done": 70,
                },
                "carryover_type": "terrine",
            },
            "brioche": {
                "doneness": {
                    "baked": 92,
                    "well_done": 96,
                },
                "carryover_type": "pastry",
            },
            "chocolate_lava_dark": {
                "doneness": {
                    "runny": 65,
                },
                "carryover_type": "pastry",
            },
            "chocolate_lava_milk": {
                "doneness": {
                    "runny": 70,
                },
                "carryover_type": "pastry",
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
