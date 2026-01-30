/**
 * IT (Italiano) translations
 * Food database labels + UI strings
 */

export const translations = {
  // Categories
  category_manual: "🎯 Manuale",
  category_beef: "🥩 Manzo",
  category_veal: "🐄 Vitello",
  category_lamb: "🐑 Agnello",
  category_pork: "🐷 Maiale",
  category_poultry: "🍗 Pollame",
  category_duck: "🦆 Anatra",
  category_game: "🦌 Selvaggina",
  category_foie_gras: "🍳 Foie Gras",
  category_fish: "🐟 Pesce",
  category_other: "🥘 Altro",

  // Foods - Manual
  food_manual: "Manuale",

  // Foods - Beef
  food_beef_filet: "Filetto",
  food_beef_roast: "Arrosto",
  food_beef_rib: "Costata",
  food_beef_chuck_roast: "Brasato",
  food_beef_beef_roulade: "Involtino di Manzo",
  food_beef_steak: "Bistecca",
  food_beef_ribeye: "Ribeye",
  food_beef_burger: "Hamburger",
  food_beef_brisket: "Petto",
  food_beef_tenderloin: "Filetto",

  // Foods - Veal
  food_veal_filet_mignon: "Filetto Mignon",
  food_veal_rump_roast: "Noce",
  food_veal_rack: "Carré di Vitello",
  food_veal_shoulder: "Spalla di Vitello",
  food_veal_veal_roulade: "Involtino di Vitello",
  food_veal_roast: "Arrosto di Vitello",
  food_veal_chop: "Costoletta di Vitello",
  food_veal_cutlet: "Scaloppina di Vitello",

  // Foods - Lamb
  food_lamb_rack: "Carré d'Agnello",
  food_lamb_saddle: "Sella d'Agnello",
  food_lamb_leg: "Cosciotto d'Agnello",
  food_lamb_shoulder: "Spalla d'Agnello",
  food_lamb_chops: "Costolette d'Agnello",
  food_lamb_shank: "Stinco d'Agnello",

  // Foods - Pork
  food_pork_tenderloin: "Filetto di Maiale",
  food_pork_rack: "Carré di Maiale",
  food_pork_roast: "Arrosto di Maiale",
  food_pork_ham: "Prosciutto",
  food_pork_chop: "Costoletta di Maiale",
  food_pork_ribs: "Costine di Maiale",
  food_pork_pulled_pork: "Pulled Pork",
  food_pork_belly: "Pancetta",

  // Foods - Poultry
  food_poultry_chicken_breast: "Petto di Pollo",
  food_poultry_chicken_thigh: "Coscia di Pollo",
  food_poultry_stuffed_poultry: "Pollame Farcito",
  food_poultry_whole_poultry: "Pollame Intero",
  food_poultry_guinea_fowl_breast: "Petto di Faraona",
  food_poultry_guinea_fowl_thigh: "Coscia di Faraona",
  food_poultry_chicken_whole: "Pollo Intero",
  food_poultry_turkey_whole: "Tacchino Intero",
  food_poultry_turkey_breast: "Petto di Tacchino",

  // Foods - Duck
  food_duck_breast: "Petto d'Anatra",
  food_duck_thigh: "Coscia d'Anatra",
  food_duck_confit: "Confit d'Anatra",

  // Foods - Game
  food_game_venison: "Cervo/Capriolo",
  food_game_wild_boar_thigh: "Coscia di Cinghiale",
  food_game_rabbit: "Coniglio",

  // Foods - Foie Gras
  food_foie_gras_foie_gras: "Foie Gras",

  // Foods - Fish
  food_fish_cod: "Merluzzo",
  food_fish_monkfish: "Rana Pescatrice",
  food_fish_pike_perch: "Lucioperca/Rombo",
  food_fish_salmon: "Salmone",
  food_fish_tuna: "Tonno",
  food_fish_swordfish: "Pesce Spada/Marlin",
  food_fish_whole_fish: "Pesce Intero",
  food_fish_sea_bass: "Branzino",
  food_fish_halibut: "Halibut",
  food_fish_shrimp: "Gamberi",
  food_fish_lobster: "Aragosta",

  // Foods - Other
  food_other_squash: "Zucca",
  food_other_meat_terrine: "Terrina di Carne/Paté",
  food_other_fish_terrine: "Terrina di Pesce",
  food_other_brioche: "Brioche",
  food_other_chocolate_lava_dark: "Tortino al Cioccolato Fondente",
  food_other_chocolate_lava_milk: "Tortino al Cioccolato al Latte/Bianco",

  // Doneness levels
  doneness_manual: "Manuale",
  doneness_blue: "Al Sangue",
  doneness_rare: "Poco Cotta",
  doneness_medium_rare: "Media Cottura",
  doneness_medium: "Al Punto",
  doneness_medium_well: "Ben Cotta",
  doneness_well_done: "Molto Cotta",
  doneness_pink: "Rosa",
  doneness_mi_cuit: "Mi-Cuit",
  doneness_tender: "Tenero",
  doneness_fondant: "Fondente",
  doneness_fall_off_bone: "Si Stacca dall'Osso",
  doneness_done: "Cotto",
  doneness_pulled: "Sfilacciato",
  doneness_safe: "Sicuro",
  doneness_reheated: "Riscaldato",
  doneness_very_tender: "Molto Tenero",
  doneness_confit: "Confit",
  doneness_braised: "Brasato",
  doneness_baked: "Al Forno",
  doneness_runny: "Liquido",

  // UI strings
  disconnected: "Disconnesso",
  connect_probe: "Collegare la sonda",
  idle: "Pronto",
  cooking: "Cottura",
  done: "Fatto!",
  start: "Avvia",
  stop: "Ferma",
  target_temp: "Temperatura Target",
  compensation: "Compensazione Termica",
  compensation_help_title: "Compensazione Termica",
  compensation_help_text: "Quando si toglie il cibo dal calore, la temperatura interna continua a salire per diversi minuti a causa del calore residuo (inerzia termica).\n\nQuando attivato, la card calcola automaticamente la temperatura alla quale togliere il cibo affinché raggiunga esattamente la temperatura target dopo il riposo.\n\nEsempio: Per una bistecca con target 55°C, la card potrebbe indicare di toglierla a 52°C.",
  elapsed: "Trascorso",
  remaining: "Rimanente",
  started_at: "Iniziato",
  ends_at: "Finisce alle",
  rate: "Velocità",
  ambient: "Ambiente",
  probe: "Sonda",
  target: "Target",
  projection: "Proiezione",
  withdrawal: "Ritiro",
  calculating: "~",
  manual_mode: "Modalità Manuale",
  close: "Chiudi",
  disconnect_since: "Sonda disconnessa da"
};
