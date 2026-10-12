// Cores de fábrica das bikes novas Specialized.
//
// Tabela gerada a partir das páginas de produto do site da Specialized Brasil
// (nome oficial da colorway, as cores exatas das bolinhas e a foto daquela cor).
// Para atualizar: pegar colorName / colorValues / plpImageID da página do
// modelo em specialized.com/br/pt e acrescentar aqui.
//
// Sem dependência de servidor: pode ser importado em Client Components.

export const CORES_POR_MODELO = [
  {
    modelo: "S-Works Tarmac SL9 LTD – Remco Evenepoel",
    cores: [
      { nome: "GLOSS METALLIC WHITE SILVER/GOLD PERAL/DEEP BULE", hex: ["#BAA060", "#E5E5D9"], foto: "94927-06_TARMAC-SL9-SW-REMCO-RB-TEAM-REPLICA-METWHTSIL-GLDPRL-DPBLU_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Tarmac SL9 – Shimano Dura-Ace Di2",
    cores: [
      { nome: "SATIN CARBON / SATIN WHITE", hex: ["#0A0A09", "#6C645F"], foto: "94927-02_TARMAC-SL9-SW-DI2-CARB-WHT_HERO-SQUARE" },
      { nome: "GLOSS WHITE SILVER METALLIC / OBSIDIAN METALLIC", hex: ["#E4E6E4", "#232322"], foto: "94927-03_TARMAC-SL9-SW-DI2-METWHTSIL-GLDPRL-METOBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Tarmac SL9 – SRAM RED AXS",
    cores: [
      { nome: "SATIN SILVER DUST / GLOSS CHROME", hex: ["#CBCDD1", "#7D8081"], foto: "94927-00_TARMAC-SL9-SW-AXS-SILDST-SPCTFLR-CHRM_HERO-SQUARE" },
      { nome: "GLOSS WHITE SILVER METALLIC / GLOSS RUBY METALLIC / OBSIDIAN METALLIC", hex: ["#F0EFF2", "#C50118"], foto: "94927-01_TARMAC-SL9-SW-AXS-DUNEWHT-VIVRED-METOBSD_HERO-SQUARE" },
      { nome: "GLOSS RUBY METALLIC / WHITE SILVER METALLIC", hex: ["#8C3138", "#D4D9D9"], foto: "94927-07_TARMAC-SL9-SW-AXS-RBYMET-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Epic 9",
    cores: [
      { nome: "GLOSS RED TINT OVER RED REFLEX PEARL EDGE FADE / METALLIC WHITE SILVER", hex: ["#720620", "#FFFFFF"], foto: "90327-01_EPIC-9-SW-REDTNT-REDPRL-METWHTSIL_HERO-SQUARE" },
      { nome: "GLOSS METALLIC OBSIDIAN MULTI COLOR DRY IMPASTO/ METALLIC WHITE SILVER", hex: ["#191718", "#909FA0"], foto: "90327-00_EPIC-9-SW-METOBSD-SHDWSIL-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Aethos 2 - SRAM RED AXS",
    cores: [
      { nome: "SATIN CARBON / GLOSS DOLOMITE METALLIC", hex: ["#545254"], foto: "97226-02_AETHOS-SW-AXS-CARB-DLMMET_HERO-SQUARE" },
      { nome: "SANDSTONE METALLIC BASE / RED TINT", hex: ["#D10D1E", "#F3E6E3"], foto: "97226-03_AETHOS-SW-AXS-SNDSTNMET-REDTNT-SILPRL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Turbo Levo 4",
    cores: [
      { nome: "GLOSS GLACIAL METALLIC / RED PEARL / BLACK PEARL", hex: ["#6B818E", "#FFFFFF"], foto: "95224-00_LEVO-SW-CARBON-G4-GCLMET-REDPRL-BLKPRL_HERO-SQUARE" },
      { nome: "GLOSS RED PEARL / BLACK / METALLIC WHITE SILVER", hex: ["#52313A", "#FFFFFF"], foto: "95224-01_LEVO-SW-CARBON-G4-REDPRL-BLK-METWHTSIL_HERO-SQUARE" },
      { nome: "GLOSS LAUREL GREEN / BURNT GOLD / CHROME", hex: ["#614219"], foto: "95226-06_LEVO-SW-CARBON-G4-LRLGRNMET-BNTGLDMET-CHRM_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL9 S-Level – SRAM RED AXS",
    cores: [
      { nome: "SATIN CARBON / SILVER DUST", hex: ["#1E1C1C", "#CBBCB7"], foto: "94927-14_TARMAC-SL9-S-LEVEL-AXS-CARB-REDGSTPRL-SILDST_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Tarmac SL9 LTD - Built for Legends",
    cores: [
      { nome: "RACE RED/VAPOR", hex: ["#AA0115", "#FFFFFF"], foto: "94927-04_TARMAC-SL9-SW-LTD-MADE-IN-RACING-REDTNT-BLKTNT-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL9 Expert – SRAM Force AXS",
    cores: [
      { nome: "SATIN WARM SMOKE METALLIC / SILVER DUST", hex: ["#373333", "#E0DCDC"], foto: "94927-30_TARMAC-SL9-EXPERT-AXS-WRMSMKMET-SILDST_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Turbo Levo R Ultralight",
    cores: [
      { nome: "SATIN CARBON / SILVER FOIL", hex: ["#323033"], foto: "95727-04_LEVO-R-SW-LTD-UL-CARB-SILHLG-S2--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo R Pro",
    cores: [
      { nome: "GLOSS BLACK RED CHAMELEON / DOLOMITE", hex: ["#572B2C"], foto: "95727-10_LEVO-R-PRO-REDBLKCMLN-BLK-DLMMET-S2--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Turbo Levo R",
    cores: [
      { nome: "GLOSS SHADOW SILVER BLENDED SPECKLE OVER CARBON / SILVER DUST", hex: ["#232323", "#898989"], foto: "95226-00_LEVO-R-4-SW-SHDWSIL-CARB-SILDST-S2--_HERO-SQUARE" },
      { nome: "GLOSS PREMIUM FJORD METALLIC / WHITE", hex: ["#516557", "#FFFFFF"], foto: "95226-01_LEVO-R-4-SW-FJDMET-WHT-S2--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo 4 Comp",
    cores: [
      { nome: "GLOSS ORANGE TINT OVER SILVER DUST / DARK NAVY", hex: ["#C82E00", "#000000"], foto: "95224-57_LEVO-COMP-CARBON-G4-ORGTNT-SILDST-DKNVY_HERO-SQUARE" },
      { nome: "SATIN CHAMPAGNE / METALLIC OBSIDIAN", hex: ["#9D7977", "#000000"], foto: "95224-56_LEVO-COMP-CARBON-G4-CHAM-METOBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 9 Pro",
    cores: [
      { nome: "GLOSS CARBON / CHAOS GLITTER PEARL / CHROME", hex: ["#2D323C", "#C0C0C0"], foto: "90327-10_EPIC-9-PRO-CARB-PRL-CHRM_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Epic 9 LTD - Built for Legends",
    cores: [
      { nome: "MADE IN RACING", hex: ["#A50216", "#FFFFFF"], foto: "90327-03_EPIC-9-SW-LTD-MADE-IN-RACING-CMLNREDGLD-RBYMET-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Rockhopper Sport",
    cores: [
      { nome: "SATIN METALLIC OBSIDIAN / SHADOW SILVER", hex: ["#2E2E30", "#FFFFFF"], foto: "91827-65_ROCKHOPPER-SPORT-KH-METOBSD-SHDWSIL-M---29_HERO-SQUARE" },
      { nome: "SATIN BOTTLE GREEN / OAK GREEN METALLIC", hex: ["#404B3D"], foto: "91827-64_ROCKHOPPER-SPORT-KH-BTLGRN-OAKGRNMET-M---29_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Rockhopper Comp",
    cores: [
      { nome: "SATIN SHADOW SILVER / SILVER DUST", hex: ["#696E6F"], foto: "91827-55_ROCKHOPPER-COMP-KH-SHDWSIL-SILDST-M---29_HERO-SQUARE" },
      { nome: "GLOSS CAYENNE METALLIC / STALLION METALLIC", hex: ["#951613"], foto: "91827-53_ROCKHOPPER-COMP-KH-CAYNMET-STLNMET-M---29_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 9 Expert",
    cores: [
      { nome: "GLOSS CARBON / WHITE", hex: ["#2D2724", "#FFFFFF"], foto: "90327-30_EPIC-9-EXPERT-CARB-WHT_HERO-SQUARE" },
      { nome: "GLOSS AGAVE GREY / METALLIC WHITE SILVER", hex: ["#7A908B", "#FFFFFF"], foto: "90327-31_EPIC-9-EXPERT-AGVE-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Roubaix SL8 Comp - SRAM Rival AXS",
    cores: [
      { nome: "Gloss Glacial Metallic/White", hex: ["#3A83AC"], foto: "94426-50_ROUBAIX-COMP-AXS-GCLMET-WHT_HERO-SQUARE" },
      { nome: "Gloss Quartz Metallic/Dolomite Metallic", hex: ["#925B77"], foto: "94426-51_ROUBAIX-COMP-AXS-QTZMET-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo 4 Comp Alloy",
    cores: [
      { nome: "Gloss Deep Lake Metallic / Dune White", hex: ["#0A2C40", "#FFFFFF"], foto: "95226-50_LEVO-COMP-ALLOY-G4-DPLAKEMET-DUNEWHT_HERO-SQUARE" },
      { nome: "Satin Dusky Pink / Cypress Metallic", hex: ["#CE9AA7", "#2A2724"], foto: "95226-51_LEVO-COMP-ALLOY-G4-DSKPNK-CYPRMET_HERO-SQUARE" },
      { nome: "Satin Gunmetal / Obsidian", hex: ["#625B59", "#000000"], foto: "95226-52_LEVO-COMP-ALLOY-G4-GUN-OBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL9 Comp – SRAM Rival AXS",
    cores: [
      { nome: "GLOSS VIVID RED / WHITE", hex: ["#FE1018", "#EBECEE"], foto: "94927-50_TARMAC-SL9-COMP-AXS-VIVRED-WHT_HERO-SQUARE" },
      { nome: "GLOSS CHARCOAL TINT / DOLOMITE METALLIC", hex: ["#393740", "#D8DBDD"], foto: "94927-51_TARMAC-SL9-COMP-AXS-CHAR-LQDMET-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Tarmac SL8 - SRAM RED AXS",
    cores: [
      { nome: "GLOSS PREMIUM FJORD METALLIC / WHITE METALLIC SILVER", hex: ["#8B9F96", "#FFFFFF"], foto: "94926-02_TARMAC-SL8-SW-AXS-PRMFJDMET-METWHT_HERO-SQUARE" },
      { nome: "GLOSS REDSKY SHDWSIL WHT IMPASTO", hex: ["#A3092E", "#E4E4E2"], foto: "94926-03_TARMAC-SL8-SW-AXS-REDSKY-SHDWSIL-WHT_HERO-SQUARE" },
      { nome: "GLOSS METALLIC WHITE SILVER / PEARL / BLACK", hex: ["#FFFFFF", "#440E17"], foto: "94926-07_TARMAC-SL8-SW-AXS-METWHTSIL-CMLNREDGLD-BLK_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Crux 5 - SRAM RED XPLR",
    cores: [
      { nome: "Fjord Gold Sandstone Blurred Impasto/Gloss Flake Silver", hex: ["#1D1E20", "#656565"], foto: "91427-00_CRUX-5-SW-AXS-FJDMET-SNDSTNMET-FLKSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Epic 9 Ultralight LTD",
    cores: [
      { nome: "SATIN CARBON / SILVER FOIL", hex: ["#2C2A2D", "#C8C6C1"], foto: "90327-02_EPIC-9-SW-LTD-UL-CARB-SILHLG_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Epic 8 - SRAM XX SL AXS, RockShox Ultimate Flight Attendant",
    cores: [
      { nome: "Gloss Cyan Blue Pearl / Metallic White Silver", hex: ["#2F4159"], foto: "90326-00_EPIC-8-SW-CARB-BLUPRL-METWHTSIL_HERO-SQUARE" },
      { nome: "Gloss Fiery Red Dry Impasto / Metallic White Silver", hex: ["#9F140E"], foto: "90326-01_EPIC-8-SW-MRN-REDWD-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo R Comp Alloy",
    cores: [
      { nome: "Satin East Sierras / Sandstone Metallic", hex: ["#8A7A58"], foto: "95727-52_LEVO-R-COMP-ALLOY-ESTSRS-SNDSTNMET-S1--_HERO-SQUARE" },
      { nome: "Satin Metallic Deep Marine / Shadow Silver", hex: ["#1E202E"], foto: "95727-53_LEVO-R-COMP-ALLOY-METDPMRNBLU-SHDWSIL-S1--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo R Expert",
    cores: [
      { nome: "GLOSS CARBON / BURNT GOLD METALLIC", hex: ["#000000", "#78542A"], foto: "95226-30_LEVO-R-4-EXPERT-CARB-BNTGLDMET-S1--_HERO-SQUARE" },
      { nome: "SATIN PISTACHIO / DARK MOSS GREEN", hex: ["#6F8D6E", "#071B0A"], foto: "95226-31_LEVO-R-4-EXPERT-PST-DKMOS-S1--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo 4 Expert",
    cores: [
      { nome: "GLOSS CYPRESS METALLIC / SILVER DUST", hex: ["#45593D", "#9DA1A2"], foto: "95224-31_LEVO-EXPERT-CARBON-G4-CYPRMET-SILDST_HERO-SQUARE" },
      { nome: "SATIN BURNT GOLD METALLIC / DOPPIO", hex: ["#A88B71", "#000000"], foto: "95224-30_LEVO-EXPERT-CARBON-G4-BNTGLDMET-DOP_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL7 Sport - Shimano 105",
    cores: [
      { nome: "GLOSS DUNE WHITE / 10% CHAOS PEARL", hex: ["#FFFFFF"], foto: "90623-61_TARMAC-SL7-SPORT-DUNEWHT-PRL_HERO-SQUARE" },
      { nome: "GLOSS CARBON / METALLIC DARK NAVY", hex: ["#373531", "#181516"], foto: "90623-60_TARMAC-SL7-SPORT-CARB-METDKNVY_HERO-SQUARE" },
      { nome: "GLOSS DUNE WHITE / GLACIAL METALLIC", hex: ["#E2E3DC", "#7A9FBB"], foto: "90626-61_TARMAC-SL7-SPORT-DUNEWHT-GCLMET_HERO-SQUARE" },
      { nome: "GLOSS WHITE / DARK NAVY METALLIC", hex: ["#FFFFFF", "#1B242C"], foto: "90626-63_TARMAC-SL7-SPORT-WHT-METDKNVY_HERO-SQUARE" },
      { nome: "SATIN MAUVE METALLIC / MIDNIGHT SHADOW METALLIC", hex: ["#655887", "#343139"], foto: "90626-65_TARMAC-SL7-SPORT-MVEMET-MNSHDWMET_HERO-SQUARE" },
      { nome: "GLOSS BLACK / DOLOMITE METALLIC", hex: ["#000000", "#C5C8CE"], foto: "90626-64_TARMAC-SL7-SPORT-BLK-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Chisel Hardtail",
    cores: [
      { nome: "SATIN SMOKE / WHITE", hex: ["#4F4B4A", "#FFFFFF"], foto: "93826-73_CHISEL-HT-SMK-WHT_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Crux 5 S-Level - SRAM RED XPLR",
    cores: [
      { nome: "Redwood Metallic/White", hex: ["#880101", "#000000"], foto: "91427-10_CRUX-5-S-LEVEL-AXS-REDPRL-REDWD-BRCH_HERO-SQUARE" },
      { nome: "Deep Marine Metallic/Dolomite Metallic", hex: ["#4B5051", "#AAB0B2"], foto: "91427-11_CRUX-5-S-LEVEL-AXS-METDPMRNBLU-SHDWSIL-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Pro LTD SRAM RED",
    cores: [
      { nome: "Gloss Vivid Red Yellow LTD", hex: ["#FD000D", "#F5D902"], foto: "95426-11_DIVERGE-PRO-LTD-FLORED-YEL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 3 Alloy - Shimano CUES",
    cores: [
      { nome: "GLOSS DUNE WHITE/ASHEN", hex: ["#F4F2F0", "#555354"], foto: "95426-70_DIVERGE-E5-DUNEWHT-ASHGRY_HERO-SQUARE" },
      { nome: "SATIN CAST BLUE METALLIC/SEA FOAM", hex: ["#3A4252", "#E3E9EE"], foto: "95426-72_DIVERGE-E5-CSTBLUMET-SEA_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Chisel Comp",
    cores: [
      { nome: "GLOSS RUBY METALLIC / METALLIC WHITE SILVER", hex: ["#7F020E", "#FFFFFF"], foto: "93827-50_CHISEL-COMP-RBYMET-METWHTSIL_HERO-SQUARE" },
      { nome: "Satin Metallic Deep Lake / Gloss White", hex: ["#20262C"], foto: "93825-53_CHISEL-COMP-DPLAKEMET-WHT_HERO-SQUARE" },
      { nome: "Gloss Ion / Smoke Liquid Metal", hex: ["#B8C508"], foto: "93825-52_CHISEL-COMP-IONMET-SMKLQDMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 8 Pro",
    cores: [
      { nome: "Glacial Metallic Pearl / Metallic White Silver", hex: ["#9DA0AD"], foto: "90326-10_EPIC-8-PRO-GCLMET-GLDPRL-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo 4 Alloy",
    cores: [
      { nome: "Gloss Deep Orange / Deep Lake", hex: ["#CC2110", "#000000"], foto: "95226-70_LEVO-ALLOY-G4-DPORG-DPLAKE_HERO-SQUARE" },
      { nome: "Gloss Metallic Obsidian / Silver Dust", hex: ["#2D2D2F", "#A09CA0"], foto: "95226-71_LEVO-ALLOY-G4-METOBSD-SILDST_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 9 Comp",
    cores: [
      { nome: "SATIN CAST BLUE METALLIC / WHITE", hex: ["#324D62", "#FFFFFF"], foto: "90327-51_EPIC-9-COMP-CSTBLUMET-WHT_HERO-SQUARE" },
      { nome: "GLOSS RUBY METALLIC / METALLIC WHITE SILVER", hex: ["#CA1217", "#FFFFFF"], foto: "90327-50_EPIC-9-COMP-RBYMET-METWHTSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL9 Comp – Shimano 105 Di2",
    cores: [
      { nome: "GLOSS CHARCOAL TINT / DOLOMITE METALLIC", hex: ["#393740", "#D8DBDD"], foto: "94927-53_TARMAC-SL9-COMP-DI2-CHAR-LQDMET-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Aethos 2 Expert - Shimano Ultegra Di2",
    cores: [
      { nome: "GLOSS DOLOMITE METALLIC / BLUE PEARL OVER SHADOW SILVER", hex: ["#D6D8D5"], foto: "97226-31_AETHOS-EXPERT-DI2-DLMMET-SHDWSIL-BLUPRL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo R Comp",
    cores: [
      { nome: "GLOSS GUNMETAL / WHITE MOUNTAINS", hex: ["#513C2F"], foto: "95226-80_LEVO-R-4-COMP-GUN-WHTMTN-S1--_HERO-SQUARE" },
      { nome: "SATIN BURNT GOLD METALLIC / SANDSTONE METALLIC", hex: ["#A8815C"], foto: "95226-81_LEVO-R-4-COMP-BNTGLDMET-SNDSTNMET-S1--_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Expert AXS",
    cores: [
      { nome: "Fjord Metallic/Emerald Metallic", hex: ["#91B3B0", "#186862"], foto: "95426-31_DIVERGE-EXPERT-AXS-FJDMET-GRNPRL-EMDMET_HERO-SQUARE" },
      { nome: "Nebula Metallic/Sandstone Metallic", hex: ["#635862", "#BBAB9B"], foto: "95426-32_DIVERGE-EXPERT-AXS-NBLMET-SNDSTNMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Tarmac SL8 Pro - Shimano Ultegra Di2",
    cores: [
      { nome: "Gloss Carbon / Metallic White Silver", hex: ["#222124", "#F1F0F2"], foto: "94925-12_TARMAC-SL8-PRO-UDI2-CARB-METWHTSIL_HERO-SQUARE" },
      { nome: "Gloss Liquid Silver / Satin Blue Pearl Over Black Liquid Metal", hex: ["#CECED0", "#4E5770"], foto: "94925-13_TARMAC-SL8-PRO-UDI2-LQDMET-BLUPRL-BLKLQDMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Chisel",
    cores: [
      { nome: "Gloss Maroon / White", hex: ["#672225"], foto: "93825-71_CHISEL-MRN-WHT_PLP-HERO-SQUARE" },
      { nome: "Gloss Dove Grey / Ashen Grey", hex: ["#A0A0A0"], foto: "93825-70_CHISEL-DOVGRY-ASHGRY_PLP-HERO-SQUARE" },
    ],
  },
  {
    modelo: "Roubaix SL8 Comp - Shimano 105 Di2",
    cores: [
      { nome: "Satin Solidity Metallic/Obsidian Metallic Fade/Smoke", hex: ["#79606D"], foto: "94426-53_ROUBAIX-COMP-DI2-SLDMET-METOBSD-SMK_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Crux 5 Expert - SRAM Force XPLR",
    cores: [
      { nome: "Burnt Gold/Dolomite Metallic/Obsidian Metallic", hex: ["#ADB0AB", "#715037"], foto: "91427-31_CRUX-5-EXPERT-AXS-GLDPRL-DLMMET-METOBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Aethos 2 Expert - SRAM Force AXS",
    cores: [
      { nome: "GLOSS DOLOMITE METALLIC / BLUE PEARL OVER SHADOW SILVER", hex: ["#D6D8D5"], foto: "97226-32_AETHOS-EXPERT-AXS-DLMMET-SHDWSIL-BLUPRL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 8 Expert - Shimano XT Di2, RockShox Select+",
    cores: [
      { nome: "Gloss Dolomite Metallic / Obsidian", hex: ["#BEBFB8", "#000000"], foto: "90326-32_EPIC-8-EXPERT-DI2-DLMMET-OBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 8 Expert",
    cores: [
      { nome: "Satin Bordeaux Metallic / White", hex: ["#504148"], foto: "90326-31_EPIC-8-EXPERT-AXS-BDXMET-WHT_HERO-SQUARE" },
      { nome: "Gloss Dolomite Metallic / Obsidian", hex: ["#C0C0C2"], foto: "90326-30_EPIC-8-EXPERT-AXS-DLMMET-OBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 9 Sport",
    cores: [
      { nome: "GLOSS DOLOMITE METALLIC / METALLIC OBSIDIAN", hex: ["#FFFFFF", "#000000"], foto: "90327-60_EPIC-9-SPORT-DLMMET-METOBSD_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Crux 5 Comp - SRAM Rival XPLR",
    cores: [
      { nome: "Obsidian Metallic/Dune White", hex: ["#0B0A09", "#CACACA"], foto: "91427-51_CRUX-5-COMP-METOBSD-DUNEWHT_HERO-SQUARE" },
      { nome: "Amethyst Frost/Deep Marine/Shadow Silver", hex: ["#AEA9B5", "#383F62"], foto: "91427-50_CRUX-5-COMP-BLUPRL-AMTHFRST-SHDWSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Expert - Shimano GRX Di2",
    cores: [
      { nome: "Fjord Metallic/Emerald Metallic", hex: ["#769F93", "#0C3645"], foto: "95426-30_DIVERGE-EXPERT-DI2-FJDMET-GRNPRL-EMDMET_HERO-SQUARE" },
      { nome: "Nebula Metallic/Sandstone Metallic", hex: ["#635862", "#BBAB9B"], foto: "95426-33_DIVERGE-EXPERT-DI2-NBLMET-SNDSTNMET_HERO-SQUARE" },
      { nome: "Quartz Metallic/Nebula Metallic", hex: ["#B2748D", "#412B32"], foto: "95426-35_DIVERGE-EXPERT-DI2-QTZMET-REDPRL-NBLMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Epic 8 Comp",
    cores: [
      { nome: "Gloss Emerald Metallic / White", hex: ["#074B5D", "#FFFFFF"], foto: "90326-50_EPIC-8-COMP-EMDMET-WHT_HERO-SQUARE" },
      { nome: "Satin Nebula Metallic / White", hex: ["#38333E", "#FFFFFF"], foto: "90326-51_EPIC-8-COMP-NBLMET-WHT_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Comp SRAM Apex/S1000",
    cores: [
      { nome: "Dolomite Metallic/Orange Zest", hex: ["#C2C2BA", "#ED6D07"], foto: "95426-50_DIVERGE-COMP-DLMMET-ORGZST_HERO-SQUARE" },
      { nome: "Laurel Green Metallic/Dolomite Metallic", hex: ["#A29C41"], foto: "95426-53_DIVERGE-COMP-LRLGRNMET-GLDPRL-DLMMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Sport Shimano GRX 600",
    cores: [
      { nome: "Emerald Metallic/Silver Dust", hex: ["#2A7792"], foto: "95426-60_DIVERGE-SPORT-EMDMET-SILDST_HERO-SQUARE" },
      { nome: "Obsidian Metallic/Quartz Metallic", hex: ["#4B494C", "#BE7892"], foto: "95426-65_DIVERGE-SPORT-METOBSD-QTZMET_HERO-SQUARE" },
      { nome: "Deep Orange/Dune White", hex: ["#EE4712"], foto: "95426-64_DIVERGE-SPORT-DPORG-DUNEWHT_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Comp Alloy SRAM Apex",
    cores: [
      { nome: "Gloss Mauve Metallic / Obsidian", hex: ["#8D87C0"], foto: "95426-51_DIVERGE-E5-COMP-MVEMET-OBSD_HERO-SQUARE" },
      { nome: "Satin Shadow Silver / Fjord Metallic", hex: ["#A6ACAF"], foto: "95426-52_DIVERGE-E5-COMP-SHDWSIL-FJDMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Diverge 4 Sport Alloy Shimano CUES",
    cores: [
      { nome: "Satin Burnt Gold Metallic / Shadow Silver", hex: ["#BB8B51"], foto: "95426-62_DIVERGE-E5-SPORT-BNTGLDMET-SHDWSIL_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Turbo Levo 4 Pro",
    cores: [
      { nome: "GLOSS BLUE ONYX / DARK NAVY / BIRCH", hex: ["#1B3856", "#FFFFFF"], foto: "95224-10_LEVO-PRO-CARBON-G4-BLUONYX-DKNVY-BLUGSTPRL_HERO-SQUARE" },
      { nome: "GLOSS METALLIC OBSIDIAN / BURNT GOLD METALLIC", hex: ["#2B282B"], foto: "95224-13_LEVO-PRO-CARBON-G4-METOBSD-BNTGLDMET_HERO-SQUARE" },
    ],
  },
  {
    modelo: "Roubaix SL8 - Shimano Tiagra",
    cores: [
      { nome: "Gloss Mauve Metallic/Dolomite Metallic", hex: ["#8679B4"], foto: "94426-70_ROUBAIX-BASE-MVEMET-DLMMET_HERO-SQUARE" },
      { nome: "Satin Shadow Silver/Black", hex: ["#B3B9BC"], foto: "94426-72_ROUBAIX-BASE-SHDWSIL-BLK_HERO-SQUARE" },
      { nome: "Gloss White/Pistachio", hex: ["#F7F7F9", "#809E81"], foto: "94426-71_ROUBAIX-BASE-WHT-PST_HERO-SQUARE" },
    ],
  },
  {
    modelo: "S-Works Roubaix SL8 - SRAM RED AXS",
    cores: [
      { nome: "GLOSS SMOKE/SATIN BLACK PEARL", hex: ["#565553", "#64635D"], foto: "94423-00_ROUBAIX-SW-SMK-BLKPRL_HERO-SQUARE" },
    ],
  },
];


// "S-Works Tarmac SL9 – SRAM RED AXS" e "s-works tarmac sl9 - sram red axs"
// têm de dar na mesma: tira acento, iguala os tipos de travessão e deixa só
// letras e números separados por um espaço.
export function chaveModelo(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const INDICE = CORES_POR_MODELO.map((m) => ({ ...m, chave: chaveModelo(m.modelo) }));

// Cores do modelo pelo nome cadastrado no admin. Primeiro tenta o nome exato;
// se não achar, pega o modelo mais específico cujo nome começa o da bike
// (assim "Turbo Levo 4 Comp Alloy 2026" cai em "Turbo Levo 4 Comp Alloy" e
// nunca em "Turbo Levo 4 Comp").
export function coresDoModelo(nomeDaBike) {
  const chave = chaveModelo(nomeDaBike);
  if (!chave) return [];
  const exato = INDICE.find((m) => m.chave === chave);
  if (exato) return exato.cores;
  const prefixos = INDICE.filter(
    (m) => chave === m.chave || chave.startsWith(m.chave + " ")
  ).sort((a, b) => b.chave.length - a.chave.length);
  return prefixos.length ? prefixos[0].cores : [];
}

// Foto oficial daquela cor, no CDN da Specialized.
export function fotoDaCor(foto, largura = 800) {
  if (!foto) return null;
  return `https://resources.specialized.com/image/${foto}?w=${largura}&q=80`;
}

// Os nomes vêm do catálogo da Specialized em caixa alta ou misturados
// ("GLOSS CARBON / WHITE", "Gloss Dove Grey / Ashen Grey"). Aqui viram
// "Gloss Carbon / White" para ficarem iguais na página.
const MINUSCULAS = new Set(["over", "in", "base", "fade"]);

export function nomeDaCor(nome) {
  return String(nome || "")
    .toLowerCase()
    .replace(/[a-z0-9]+/g, (p, i) =>
      i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}
