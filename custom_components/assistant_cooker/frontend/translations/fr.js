/**
 * FR (Français) translations
 * Food database labels + UI strings
 */

export const translations = {
  // Categories
  category_manual: "🎯 Manuel",
  category_beef: "🥩 Bœuf",
  category_veal: "🐄 Veau",
  category_lamb: "🐑 Agneau",
  category_pork: "🐷 Porc",
  category_poultry: "🍗 Volaille",
  category_duck: "🦆 Canard",
  category_game: "🦌 Gibier",
  category_foie_gras: "🍳 Foie Gras",
  category_fish: "🐟 Poisson",
  category_other: "🥘 Divers",

  // Foods - Manual
  food_manual: "Manuel",

  // Foods - Beef
  food_beef_filet: "Filet",
  food_beef_roast: "Rôti",
  food_beef_rib: "Côte de Bœuf",
  food_beef_chuck_roast: "Paleron",
  food_beef_beef_roulade: "Paupiettes de Bœuf",
  food_beef_steak: "Steak",
  food_beef_ribeye: "Entrecôte",
  food_beef_burger: "Burger",
  food_beef_brisket: "Poitrine",
  food_beef_tenderloin: "Filet (Tenderloin)",

  // Foods - Veal
  food_veal_filet_mignon: "Filet Mignon",
  food_veal_rump_roast: "Quasi ou Noix",
  food_veal_rack: "Carré de Veau",
  food_veal_shoulder: "Épaule de Veau",
  food_veal_veal_roulade: "Paupiettes de Veau",
  food_veal_roast: "Rôti de Veau",
  food_veal_chop: "Côtelette de Veau",
  food_veal_cutlet: "Escalope de Veau",

  // Foods - Lamb
  food_lamb_rack: "Carré d'Agneau",
  food_lamb_saddle: "Selle d'Agneau",
  food_lamb_leg: "Gigot d'Agneau",
  food_lamb_shoulder: "Épaule d'Agneau",
  food_lamb_chops: "Côtelettes d'Agneau",
  food_lamb_shank: "Souris d'Agneau",

  // Foods - Pork
  food_pork_tenderloin: "Filet Mignon de Porc",
  food_pork_rack: "Carré de Porc",
  food_pork_roast: "Rôti de Porc",
  food_pork_ham: "Jambon",
  food_pork_chop: "Côtelette de Porc",
  food_pork_ribs: "Côtes de Porc",
  food_pork_pulled_pork: "Porc Effiloché",
  food_pork_belly: "Poitrine de Porc",

  // Foods - Poultry
  food_poultry_chicken_breast: "Blanc de Poulet",
  food_poultry_chicken_thigh: "Cuisse de Poulet",
  food_poultry_stuffed_poultry: "Volaille Farcie",
  food_poultry_whole_poultry: "Volaille Entière",
  food_poultry_guinea_fowl_breast: "Suprême de Pintade",
  food_poultry_guinea_fowl_thigh: "Cuisse de Pintade",
  food_poultry_chicken_whole: "Poulet Entier",
  food_poultry_turkey_whole: "Dinde Entière",
  food_poultry_turkey_breast: "Blanc de Dinde",

  // Foods - Duck
  food_duck_breast: "Magret de Canard",
  food_duck_thigh: "Cuisse de Canard",
  food_duck_confit: "Confit de Canard",

  // Foods - Game
  food_game_venison: "Noix de Cerf/Chevreuil",
  food_game_wild_boar_thigh: "Cuisse de Sanglier",
  food_game_rabbit: "Lapin",

  // Foods - Foie Gras
  food_foie_gras_foie_gras: "Foie Gras",

  // Foods - Fish
  food_fish_cod: "Cabillaud/Lieu",
  food_fish_monkfish: "Lotte",
  food_fish_pike_perch: "Sandre/Turbot",
  food_fish_salmon: "Saumon",
  food_fish_tuna: "Thon",
  food_fish_swordfish: "Espadon/Marlin",
  food_fish_whole_fish: "Poisson Entier",
  food_fish_sea_bass: "Bar",
  food_fish_halibut: "Flétan",
  food_fish_shrimp: "Crevettes",
  food_fish_lobster: "Homard",

  // Foods - Other
  food_other_squash: "Courge",
  food_other_meat_terrine: "Terrine de Viande/Pâté",
  food_other_fish_terrine: "Terrine de Poisson",
  food_other_brioche: "Brioche",
  food_other_chocolate_lava_dark: "Coulant Chocolat Noir",
  food_other_chocolate_lava_milk: "Coulant Chocolat Lait/Blanc",

  // Doneness levels
  doneness_manual: "Manuel",
  doneness_blue: "Bleu",
  doneness_rare: "Saignant",
  doneness_medium_rare: "Rosé",
  doneness_medium: "À Point",
  doneness_medium_well: "Bien Cuit",
  doneness_well_done: "Très Bien Cuit",
  doneness_pink: "Rose",
  doneness_mi_cuit: "Mi-Cuit",
  doneness_tender: "Tendre",
  doneness_fondant: "Fondant",
  doneness_fall_off_bone: "Se Détache de l'Os",
  doneness_done: "Cuit",
  doneness_pulled: "Effiloché",
  doneness_safe: "Sécuritaire",
  doneness_reheated: "Réchauffé",
  doneness_very_tender: "Très Tendre",
  doneness_confit: "Confit",
  doneness_braised: "Braisé",
  doneness_baked: "Cuit au Four",
  doneness_runny: "Coulant",

  // UI strings
  disconnected: "Déconnecté",
  connect_probe: "Veuillez connecter la sonde",
  idle: "Prêt",
  cooking: "Cuisson en cours",
  done: "Cuit!",
  start: "Démarrer",
  stop: "Arrêter",
  target_temp: "Température Cible",
  compensation: "Compensation Thermique",
  compensation_help_title: "Compensation Thermique",
  compensation_help_text: "Lorsque vous retirez l'aliment de la chaleur, sa température interne continue d'augmenter pendant quelques minutes en raison de la chaleur rémanente (inertie thermique).\n\nLorsque cette option est activée, la carte calcule automatiquement la température à laquelle retirer l'aliment pour qu'il atteigne exactement votre température cible après le repos.\n\nExemple : Pour un steak visant 55°C, la carte pourrait vous dire de le retirer à 52°C.",
  elapsed: "Écoulé",
  remaining: "Restant",
  started_at: "Démarré",
  ends_at: "Se termine",
  rate: "Taux",
  ambient: "Ambiante",
  probe: "Sonde",
  target: "Cible",
  projection: "Projection",
  withdrawal: "Retrait",
  calculating: "~",
  manual_mode: "Mode Manuel",
  close: "Fermer",
  disconnect_since: "Sonde déconnectée depuis"
};
