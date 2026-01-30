/**
 * PT (Português) translations
 * Food database labels + UI strings
 */

export const translations = {
  // Categories
  category_manual: "🎯 Manual",
  category_beef: "🥩 Boi",
  category_veal: "🐄 Vitela",
  category_lamb: "🐑 Cordeiro",
  category_pork: "🐷 Porco",
  category_poultry: "🍗 Aves",
  category_duck: "🦆 Pato",
  category_game: "🦌 Caça",
  category_foie_gras: "🍳 Foie Gras",
  category_fish: "🐟 Peixe",
  category_other: "🥘 Outros",

  // Foods - Manual
  food_manual: "Manual",

  // Foods - Beef
  food_beef_filet: "Filé",
  food_beef_roast: "Assado",
  food_beef_rib: "Costela",
  food_beef_chuck_roast: "Acém",
  food_beef_beef_roulade: "Rolê de Carne",
  food_beef_steak: "Bife",
  food_beef_ribeye: "Ribeye",
  food_beef_burger: "Hambúrguer",
  food_beef_brisket: "Peito",
  food_beef_tenderloin: "Filé Mignon",

  // Foods - Veal
  food_veal_filet_mignon: "Filé Mignon",
  food_veal_rump_roast: "Alcatra",
  food_veal_rack: "Carré de Vitela",
  food_veal_shoulder: "Paleta de Vitela",
  food_veal_veal_roulade: "Rolê de Vitela",
  food_veal_roast: "Assado de Vitela",
  food_veal_chop: "Costela de Vitela",
  food_veal_cutlet: "Escalope de Vitela",

  // Foods - Lamb
  food_lamb_rack: "Carré de Cordeiro",
  food_lamb_saddle: "Sela de Cordeiro",
  food_lamb_leg: "Pernil de Cordeiro",
  food_lamb_shoulder: "Paleta de Cordeiro",
  food_lamb_chops: "Costeletas de Cordeiro",
  food_lamb_shank: "Canela de Cordeiro",

  // Foods - Pork
  food_pork_tenderloin: "Filé de Porco",
  food_pork_rack: "Carré de Porco",
  food_pork_roast: "Pernil de Porco",
  food_pork_ham: "Presunto",
  food_pork_chop: "Costeleta de Porco",
  food_pork_ribs: "Costelas de Porco",
  food_pork_pulled_pork: "Pulled Pork",
  food_pork_belly: "Panceta",

  // Foods - Poultry
  food_poultry_chicken_breast: "Peito de Frango",
  food_poultry_chicken_thigh: "Coxa de Frango",
  food_poultry_stuffed_poultry: "Ave Recheada",
  food_poultry_whole_poultry: "Ave Inteira",
  food_poultry_guinea_fowl_breast: "Peito de Galinha d'Angola",
  food_poultry_guinea_fowl_thigh: "Coxa de Galinha d'Angola",
  food_poultry_chicken_whole: "Frango Inteiro",
  food_poultry_turkey_whole: "Peru Inteiro",
  food_poultry_turkey_breast: "Peito de Peru",

  // Foods - Duck
  food_duck_breast: "Peito de Pato",
  food_duck_thigh: "Coxa de Pato",
  food_duck_confit: "Confit de Pato",

  // Foods - Game
  food_game_venison: "Veado",
  food_game_wild_boar_thigh: "Coxa de Javali",
  food_game_rabbit: "Coelho",

  // Foods - Foie Gras
  food_foie_gras_foie_gras: "Foie Gras",

  // Foods - Fish
  food_fish_cod: "Bacalhau",
  food_fish_monkfish: "Tamboril",
  food_fish_pike_perch: "Lúcio/Rodovalho",
  food_fish_salmon: "Salmão",
  food_fish_tuna: "Atum",
  food_fish_swordfish: "Peixe-Espada/Marlim",
  food_fish_whole_fish: "Peixe Inteiro",
  food_fish_sea_bass: "Robalo",
  food_fish_halibut: "Alabote",
  food_fish_shrimp: "Camarões",
  food_fish_lobster: "Lagosta",

  // Foods - Other
  food_other_squash: "Abóbora",
  food_other_meat_terrine: "Terrina de Carne/Patê",
  food_other_fish_terrine: "Terrina de Peixe",
  food_other_brioche: "Brioche",
  food_other_chocolate_lava_dark: "Petit Gâteau de Chocolate Amargo",
  food_other_chocolate_lava_milk: "Petit Gâteau de Chocolate ao Leite/Branco",

  // Doneness levels
  doneness_manual: "Manual",
  doneness_blue: "Mal Passado",
  doneness_rare: "Mal Passado",
  doneness_medium_rare: "Ao Ponto para Mal",
  doneness_medium: "Ao Ponto",
  doneness_medium_well: "Ao Ponto para Bem",
  doneness_well_done: "Bem Passado",
  doneness_pink: "Rosado",
  doneness_mi_cuit: "Mi-Cuit",
  doneness_tender: "Macio",
  doneness_fondant: "Derretendo",
  doneness_fall_off_bone: "Solta do Osso",
  doneness_done: "Cozido",
  doneness_pulled: "Desfiado",
  doneness_safe: "Seguro",
  doneness_reheated: "Reaquecido",
  doneness_very_tender: "Muito Macio",
  doneness_confit: "Confit",
  doneness_braised: "Braseado",
  doneness_baked: "Assado",
  doneness_runny: "Cremoso",

  // UI strings
  disconnected: "Desconectado",
  connect_probe: "Por favor conecte a sonda",
  idle: "Pronto",
  cooking: "Cozinhando",
  done: "Pronto!",
  start: "Iniciar",
  stop: "Parar",
  target_temp: "Temperatura Alvo",
  compensation: "Compensação Térmica",
  compensation_help_title: "Compensação Térmica",
  compensation_help_text: "Quando você remove a comida do calor, a temperatura interna continua a subir por vários minutos devido ao calor residual (inércia térmica).\n\nQuando ativado, o cartão calcula automaticamente a temperatura na qual remover a comida para que ela atinja exatamente sua temperatura alvo após o descanso.\n\nExemplo: Para um bife com alvo de 55°C, o cartão pode indicar para removê-lo a 52°C.",
  elapsed: "Decorrido",
  remaining: "Restante",
  started_at: "Iniciado",
  ends_at: "Termina às",
  rate: "Taxa",
  ambient: "Ambiente",
  probe: "Sonda",
  target: "Alvo",
  projection: "Projeção",
  withdrawal: "Retirada",
  calculating: "~",
  manual_mode: "Modo Manual",
  close: "Fechar",
  disconnect_since: "Sonda desconectada desde"
};
