/**
 * ES (Español) translations
 * Food database labels + UI strings
 */

export const translations = {
  // Categories
  category_manual: "🎯 Manual",
  category_beef: "🥩 Ternera",
  category_veal: "🐄 Ternera Lechal",
  category_lamb: "🐑 Cordero",
  category_pork: "🐷 Cerdo",
  category_poultry: "🍗 Aves",
  category_duck: "🦆 Pato",
  category_game: "🦌 Caza",
  category_foie_gras: "🍳 Foie Gras",
  category_fish: "🐟 Pescado",
  category_other: "🥘 Otros",

  // Foods - Manual
  food_manual: "Manual",

  // Foods - Beef
  food_beef_filet: "Filete",
  food_beef_roast: "Asado",
  food_beef_rib: "Costilla",
  food_beef_chuck_roast: "Aguja",
  food_beef_beef_roulade: "Rollo de Ternera",
  food_beef_steak: "Bistec",
  food_beef_ribeye: "Ribeye",
  food_beef_burger: "Hamburguesa",
  food_beef_brisket: "Pecho",
  food_beef_tenderloin: "Solomillo",

  // Foods - Veal
  food_veal_filet_mignon: "Filet Mignon",
  food_veal_rump_roast: "Cadera",
  food_veal_rack: "Costillar de Ternera",
  food_veal_shoulder: "Paletilla de Ternera",
  food_veal_veal_roulade: "Rollo de Ternera Lechal",
  food_veal_roast: "Asado de Ternera",
  food_veal_chop: "Chuleta de Ternera",
  food_veal_cutlet: "Escalope de Ternera",

  // Foods - Lamb
  food_lamb_rack: "Costillar de Cordero",
  food_lamb_saddle: "Silla de Cordero",
  food_lamb_leg: "Pierna de Cordero",
  food_lamb_shoulder: "Paletilla de Cordero",
  food_lamb_chops: "Chuletas de Cordero",
  food_lamb_shank: "Jarrete de Cordero",

  // Foods - Pork
  food_pork_tenderloin: "Solomillo de Cerdo",
  food_pork_rack: "Costillar de Cerdo",
  food_pork_roast: "Asado de Cerdo",
  food_pork_ham: "Jamón",
  food_pork_chop: "Chuleta de Cerdo",
  food_pork_ribs: "Costillas de Cerdo",
  food_pork_pulled_pork: "Pulled Pork",
  food_pork_belly: "Panceta",

  // Foods - Poultry
  food_poultry_chicken_breast: "Pechuga de Pollo",
  food_poultry_chicken_thigh: "Muslo de Pollo",
  food_poultry_stuffed_poultry: "Ave Rellena",
  food_poultry_whole_poultry: "Ave Entera",
  food_poultry_guinea_fowl_breast: "Pechuga de Pintada",
  food_poultry_guinea_fowl_thigh: "Muslo de Pintada",
  food_poultry_chicken_whole: "Pollo Entero",
  food_poultry_turkey_whole: "Pavo Entero",
  food_poultry_turkey_breast: "Pechuga de Pavo",

  // Foods - Duck
  food_duck_breast: "Magret de Pato",
  food_duck_thigh: "Muslo de Pato",
  food_duck_confit: "Confit de Pato",

  // Foods - Game
  food_game_venison: "Venado",
  food_game_wild_boar_thigh: "Muslo de Jabalí",
  food_game_rabbit: "Conejo",

  // Foods - Foie Gras
  food_foie_gras_foie_gras: "Foie Gras",

  // Foods - Fish
  food_fish_cod: "Bacalao",
  food_fish_monkfish: "Rape",
  food_fish_pike_perch: "Lucioperca/Rodaballo",
  food_fish_salmon: "Salmón",
  food_fish_tuna: "Atún",
  food_fish_swordfish: "Pez Espada/Marlín",
  food_fish_whole_fish: "Pescado Entero",
  food_fish_sea_bass: "Lubina",
  food_fish_halibut: "Fletán",
  food_fish_shrimp: "Gambas",
  food_fish_lobster: "Langosta",

  // Foods - Other
  food_other_squash: "Calabaza",
  food_other_meat_terrine: "Terrina de Carne/Paté",
  food_other_fish_terrine: "Terrina de Pescado",
  food_other_brioche: "Brioche",
  food_other_chocolate_lava_dark: "Coulant de Chocolate Negro",
  food_other_chocolate_lava_milk: "Coulant de Chocolate con Leche/Blanco",

  // Doneness levels
  doneness_manual: "Manual",
  doneness_blue: "Azul",
  doneness_rare: "Poco Hecho",
  doneness_medium_rare: "Poco Hecho+",
  doneness_medium: "Al Punto",
  doneness_medium_well: "Hecho",
  doneness_well_done: "Muy Hecho",
  doneness_pink: "Rosado",
  doneness_mi_cuit: "Mi-Cuit",
  doneness_tender: "Tierno",
  doneness_fondant: "Fundente",
  doneness_fall_off_bone: "Se Cae del Hueso",
  doneness_done: "Hecho",
  doneness_pulled: "Deshilachado",
  doneness_safe: "Seguro",
  doneness_reheated: "Recalentado",
  doneness_very_tender: "Muy Tierno",
  doneness_confit: "Confitado",
  doneness_braised: "Estofado",
  doneness_baked: "Horneado",
  doneness_runny: "Líquido",

  // UI strings
  disconnected: "Desconectado",
  connect_probe: "Por favor conecte la sonda",
  idle: "Listo",
  cooking: "Cocinando",
  done: "¡Listo!",
  start: "Iniciar",
  stop: "Detener",
  target_temp: "Temperatura Objetivo",
  compensation: "Compensación Térmica",
  compensation_help_title: "Compensación Térmica",
  compensation_help_text: "Cuando retira la comida del calor, su temperatura interna continúa subiendo durante varios minutos debido al calor residual (inercia térmica).\n\nCuando está activado, la tarjeta calcula automáticamente la temperatura a la que debe retirar la comida para que alcance exactamente su temperatura objetivo después del reposo.\n\nEjemplo: Para un bistec con objetivo de 55°C, la tarjeta podría indicarle que lo retire a 52°C.",
  elapsed: "Transcurrido",
  remaining: "Restante",
  started_at: "Iniciado",
  ends_at: "Termina a las",
  rate: "Velocidad",
  ambient: "Ambiente",
  probe: "Sonda",
  target: "Objetivo",
  projection: "Proyección",
  withdrawal: "Retirar",
  calculating: "~",
  manual_mode: "Modo Manual",
  close: "Cerrar",
  disconnect_since: "Sonda desconectada desde"
};
