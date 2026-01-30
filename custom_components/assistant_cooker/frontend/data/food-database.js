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
      filet: {
        foodKey: "food_beef_filet",
        doneness: {
          blue: { donenessKey: "doneness_blue", temp: 50 },
          rare: { donenessKey: "doneness_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 60 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      roast: {
        foodKey: "food_beef_roast",
        doneness: {
          blue: { donenessKey: "doneness_blue", temp: 50 },
          rare: { donenessKey: "doneness_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 60 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      rib: {
        foodKey: "food_beef_rib",
        doneness: {
          blue: { donenessKey: "doneness_blue", temp: 50 },
          rare: { donenessKey: "doneness_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 60 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      chuck_roast: {
        foodKey: "food_beef_chuck_roast",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 60 }
        }
      },
      beef_roulade: {
        foodKey: "food_beef_beef_roulade",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
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
  veal: {
    categoryKey: "category_veal",
    foods: {
      filet_mignon: {
        foodKey: "food_veal_filet_mignon",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 59 },
          medium: { donenessKey: "doneness_medium", temp: 63 }
        }
      },
      rump_roast: {
        foodKey: "food_veal_rump_roast",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 61 }
        }
      },
      rack: {
        foodKey: "food_veal_rack",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 55 },
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      shoulder: {
        foodKey: "food_veal_shoulder",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 63 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      veal_roulade: {
        foodKey: "food_veal_veal_roulade",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
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
  lamb: {
    categoryKey: "category_lamb",
    foods: {
      rack: {
        foodKey: "food_lamb_rack",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 61 }
        }
      },
      saddle: {
        foodKey: "food_lamb_saddle",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 60 },
          medium: { donenessKey: "doneness_medium", temp: 61 }
        }
      },
      leg: {
        foodKey: "food_lamb_leg",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 60 },
          medium: { donenessKey: "doneness_medium", temp: 61 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
        }
      },
      shoulder: {
        foodKey: "food_lamb_shoulder",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 61 },
          well_done: { donenessKey: "doneness_well_done", temp: 66 }
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
      shank: {
        foodKey: "food_lamb_shank",
        doneness: {
          braised: { donenessKey: "doneness_braised", temp: 85 }
        }
      }
    }
  },
  pork: {
    categoryKey: "category_pork",
    foods: {
      tenderloin: {
        foodKey: "food_pork_tenderloin",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 61 }
        }
      },
      rack: {
        foodKey: "food_pork_rack",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 70 }
        }
      },
      roast: {
        foodKey: "food_pork_roast",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 70 }
        }
      },
      ham: {
        foodKey: "food_pork_ham",
        doneness: {
          well_done: { donenessKey: "doneness_well_done", temp: 70 }
        }
      },
      chop: {
        foodKey: "food_pork_chop",
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
      chicken_breast: {
        foodKey: "food_poultry_chicken_breast",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 69 }
        }
      },
      chicken_thigh: {
        foodKey: "food_poultry_chicken_thigh",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 71 }
        }
      },
      stuffed_poultry: {
        foodKey: "food_poultry_stuffed_poultry",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 69 },
          well_done: { donenessKey: "doneness_well_done", temp: 73 }
        }
      },
      whole_poultry: {
        foodKey: "food_poultry_whole_poultry",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 66 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 }
        }
      },
      guinea_fowl_breast: {
        foodKey: "food_poultry_guinea_fowl_breast",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 70 }
        }
      },
      guinea_fowl_thigh: {
        foodKey: "food_poultry_guinea_fowl_thigh",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
        }
      },
      chicken_whole: {
        foodKey: "food_poultry_chicken_whole",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 74 }
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
      }
    }
  },
  duck: {
    categoryKey: "category_duck",
    foods: {
      breast: {
        foodKey: "food_duck_breast",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 59 }
        }
      },
      thigh: {
        foodKey: "food_duck_thigh",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 71 }
        }
      },
      confit: {
        foodKey: "food_duck_confit",
        doneness: {
          confit: { donenessKey: "doneness_confit", temp: 79 }
        }
      }
    }
  },
  game: {
    categoryKey: "category_game",
    foods: {
      venison: {
        foodKey: "food_game_venison",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 60 },
          medium: { donenessKey: "doneness_medium", temp: 61 },
          well_done: { donenessKey: "doneness_well_done", temp: 71 }
        }
      },
      wild_boar_thigh: {
        foodKey: "food_game_wild_boar_thigh",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 71 },
          well_done: { donenessKey: "doneness_well_done", temp: 77 }
        }
      },
      rabbit: {
        foodKey: "food_game_rabbit",
        doneness: {
          done: { donenessKey: "doneness_done", temp: 67 }
        }
      }
    }
  },
  foie_gras: {
    categoryKey: "category_foie_gras",
    foods: {
      foie_gras: {
        foodKey: "food_foie_gras_foie_gras",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 58 },
          mi_cuit: { donenessKey: "doneness_mi_cuit", temp: 63 },
          medium: { donenessKey: "doneness_medium", temp: 72 }
        }
      }
    }
  },
  fish: {
    categoryKey: "category_fish",
    foods: {
      cod: {
        foodKey: "food_fish_cod",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 51 },
          well_done: { donenessKey: "doneness_well_done", temp: 54 }
        }
      },
      monkfish: {
        foodKey: "food_fish_monkfish",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 52 },
          well_done: { donenessKey: "doneness_well_done", temp: 54 }
        }
      },
      pike_perch: {
        foodKey: "food_fish_pike_perch",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 51 },
          well_done: { donenessKey: "doneness_well_done", temp: 54 }
        }
      },
      salmon: {
        foodKey: "food_fish_salmon",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 40 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 48 },
          medium: { donenessKey: "doneness_medium", temp: 50 },
          well_done: { donenessKey: "doneness_well_done", temp: 52 }
        }
      },
      tuna: {
        foodKey: "food_fish_tuna",
        doneness: {
          rare: { donenessKey: "doneness_rare", temp: 42 },
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 48 },
          medium: { donenessKey: "doneness_medium", temp: 50 },
          well_done: { donenessKey: "doneness_well_done", temp: 52 }
        }
      },
      swordfish: {
        foodKey: "food_fish_swordfish",
        doneness: {
          medium_rare: { donenessKey: "doneness_medium_rare", temp: 48 },
          medium: { donenessKey: "doneness_medium", temp: 50 },
          well_done: { donenessKey: "doneness_well_done", temp: 52 }
        }
      },
      whole_fish: {
        foodKey: "food_fish_whole_fish",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 49 }
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
  other: {
    categoryKey: "category_other",
    foods: {
      squash: {
        foodKey: "food_other_squash",
        doneness: {
          tender: { donenessKey: "doneness_tender", temp: 85 },
          fondant: { donenessKey: "doneness_fondant", temp: 90 }
        }
      },
      meat_terrine: {
        foodKey: "food_other_meat_terrine",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 72 },
          well_done: { donenessKey: "doneness_well_done", temp: 78 }
        }
      },
      fish_terrine: {
        foodKey: "food_other_fish_terrine",
        doneness: {
          medium: { donenessKey: "doneness_medium", temp: 65 },
          well_done: { donenessKey: "doneness_well_done", temp: 70 }
        }
      },
      brioche: {
        foodKey: "food_other_brioche",
        doneness: {
          baked: { donenessKey: "doneness_baked", temp: 92 },
          well_done: { donenessKey: "doneness_well_done", temp: 96 }
        }
      },
      chocolate_lava_dark: {
        foodKey: "food_other_chocolate_lava_dark",
        doneness: {
          runny: { donenessKey: "doneness_runny", temp: 65 }
        }
      },
      chocolate_lava_milk: {
        foodKey: "food_other_chocolate_lava_milk",
        doneness: {
          runny: { donenessKey: "doneness_runny", temp: 70 }
        }
      }
    }
  }
};
