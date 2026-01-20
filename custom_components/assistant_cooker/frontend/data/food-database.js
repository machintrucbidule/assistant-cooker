/**
 * Universal Food Database (language-agnostic)
 * AUTO-GENERATED from food_data.py - DO NOT EDIT MANUALLY
 * 
 * To update this file:
 * 1. Modify custom_components/assistant_cooker/food_data.py
 * 2. Run: python scripts/generate_food_database.py
 * 
 * Uses keys for all labels - translations handled in language-specific files
 * Each category/food/doneness level references a translation key
 */
export const FOOD_DATABASE = {
  manual: {
    categoryKey: "category_manual",
    foods: {
      manual: {
        foodKey: "food_manual",
        doneness: {
          manual: { donenessKey: "doneness_manual", temp: null }
        }
      }
    }
  },
  beef: {
    categoryKey: "category_beef",
    foods: {
      steak: {
        foodKey: "food_beef_steak",
        doneness: {
          blue: { donenessKey: "doneness_blue", temp: 46 },
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      roast: {
        foodKey: "food_beef_roast",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      prime_rib: {
        foodKey: "food_beef_prime_rib",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      filet_mignon: {
        foodKey: "food_beef_filet_mignon",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 }
        }
      },
      ribeye: {
        foodKey: "food_beef_ribeye",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      burger: {
        foodKey: "food_beef_burger",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 },
          safe: { donenessKey: "doneness_safe", temp: 71 }
        }
      },
      brisket: {
        foodKey: "food_beef_brisket",
        doneness: {
          pulled: { donenessKey: "doneness_pulled", temp: 93 }
        }
      },
      tenderloin: {
        foodKey: "food_beef_tenderloin",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 57 },
          medium_well: { donenessKey: "doneness_medium_well", temp: 63 }
        }
      }
    }
  },
  pork: {
    categoryKey: "category_pork",
    foods: {
      chop: {
        foodKey: "food_pork_chop",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 }
        }
      },
      tenderloin: {
        foodKey: "food_pork_tenderloin",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      roast: {
        foodKey: "food_pork_roast",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 }
        }
      },
      ribs: {
        foodKey: "food_pork_ribs",
        doneness: {
          tender: { donenessKey: "doneness_tender", temp: 88 },
          fall_off_bone: { donenessKey: "doneness_fall_off_bone", temp: 93 }
        }
      },
      pulled_pork: {
        foodKey: "food_pork_pulled_pork",
        doneness: {
          pulled: { donenessKey: "doneness_pulled", temp: 93 }
        }
      },
      ham: {
        foodKey: "food_pork_ham",
        doneness: {
          reheated: { donenessKey: "doneness_reheated", temp: 60 }
        }
      },
      belly: {
        foodKey: "food_pork_belly",
        doneness: {
          tender: { donenessKey: "doneness_tender", temp: 77 },
          very_tender: { donenessKey: "doneness_very_tender", temp: 85 }
        }
      }
    }
  },
  poultry: {
    categoryKey: "category_poultry",
    foods: {
      chicken_whole: {
        foodKey: "food_poultry_chicken_whole",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
        }
      },
      chicken_breast: {
        foodKey: "food_poultry_chicken_breast",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
        }
      },
      chicken_thigh: {
        foodKey: "food_poultry_chicken_thigh",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 },
          tender: { donenessKey: "doneness_tender", temp: 76 }
        }
      },
      turkey_whole: {
        foodKey: "food_poultry_turkey_whole",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
        }
      },
      turkey_breast: {
        foodKey: "food_poultry_turkey_breast",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
        }
      },
      duck_breast: {
        foodKey: "food_poultry_duck_breast",
        doneness: {
          pink: { donenessKey: "doneness_pink", temp: 57 },
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      duck_leg_confit: {
        foodKey: "food_poultry_duck_leg_confit",
        doneness: {
          confit: { donenessKey: "doneness_confit", temp: 82 }
        }
      }
    }
  },
  lamb: {
    categoryKey: "category_lamb",
    foods: {
      leg: {
        foodKey: "food_lamb_leg",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          pink: { donenessKey: "doneness_pink", temp: 57 },
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      chops: {
        foodKey: "food_lamb_chops",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          pink: { donenessKey: "doneness_pink", temp: 57 },
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      rack: {
        foodKey: "food_lamb_rack",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          pink: { donenessKey: "doneness_pink", temp: 57 },
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      shank: {
        foodKey: "food_lamb_shank",
        doneness: {
          braised: { donenessKey: "doneness_braised", temp: 85 }
        }
      },
      shoulder: {
        foodKey: "food_lamb_shoulder",
        doneness: {
          pulled: { donenessKey: "doneness_pulled", temp: 88 }
        }
      }
    }
  },
  veal: {
    categoryKey: "category_veal",
    foods: {
      roast: {
        foodKey: "food_veal_roast",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      chop: {
        foodKey: "food_veal_chop",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      cutlet: {
        foodKey: "food_veal_cutlet",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      }
    }
  },
  fish: {
    categoryKey: "category_fish",
    foods: {
      salmon: {
        foodKey: "food_fish_salmon",
        doneness: {
          mi_cuit: { donenessKey: "doneness_mi_cuit", temp: 46 },
          medium: { donenessKey: "doneness_medium", temp: 52 },
          well_done: { donenessKey: "doneness_well_done", temp: 60 }
        }
      },
      tuna: {
        foodKey: "food_fish_tuna",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 43 },
          medium: { donenessKey: "doneness_medium", temp: 52 }
        }
      },
      cod: {
        foodKey: "food_fish_cod",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 55 },
          well_done: { donenessKey: "doneness_well_done", temp: 60 }
        }
      },
      sea_bass: {
        foodKey: "food_fish_sea_bass",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 55 }
        }
      },
      halibut: {
        foodKey: "food_fish_halibut",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 55 },
          well_done: { donenessKey: "doneness_well_done", temp: 60 }
        }
      },
      shrimp: {
        foodKey: "food_fish_shrimp",
        doneness: {
          safe: { donenessKey: "doneness_safe", temp: 63 }
        }
      },
      lobster: {
        foodKey: "food_fish_lobster",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 60 }
        }
      }
    }
  },
  game: {
    categoryKey: "category_game",
    foods: {
      wild_boar: {
        foodKey: "food_game_wild_boar",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 68 }
        }
      },
      venison: {
        foodKey: "food_game_venison",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 52 },
          pink: { donenessKey: "doneness_pink", temp: 57 },
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      rabbit: {
        foodKey: "food_game_rabbit",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 }
        }
      }
    }
  },
  other: {
    categoryKey: "category_other",
    foods: {
      egg_soft_boiled: {
        foodKey: "food_other_egg_soft_boiled",
        doneness: {
          soft: { donenessKey: "doneness_soft", temp: 64 }
        }
      },
      egg_poached: {
        foodKey: "food_other_egg_poached",
        doneness: {
          perfect: { donenessKey: "doneness_perfect", temp: 67 }
        }
      },
      egg_hard_boiled: {
        foodKey: "food_other_egg_hard_boiled",
        doneness: {
          hard: { donenessKey: "doneness_hard", temp: 77 }
        }
      }
    }
  }
};
