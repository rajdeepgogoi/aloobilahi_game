// Dynamic Pixel-Art Canvas Texture Generator for Phaser 3
import Phaser from 'phaser';

// Standardized color palette
const COLORS = {
  trans: 'rgba(0,0,0,0)',
  black: '#000000',
  darkOutline: '#2d1808',
  white: '#ffffff',
  
  // Aloo (Potato) colors
  potatoSkin: '#c8963e',
  potatoLight: '#e4b665',
  potatoDark: '#a17424',
  scarfRed: '#e63946',
  scarfDark: '#b21c27',
  mustache: '#1b1b1b',
  
  // Bilahi (Tomato) colors
  tomatoRed: '#d92c2c',
  tomatoLight: '#ff4d4d',
  tomatoDark: '#a61c1c',
  leafGreen: '#38b000',
  leafLight: '#70e000',
  ribbonPink: '#ff7096',
  ribbonLight: '#ff9ebb',
  dressBlue: '#457b9d',
  dressBlueLight: '#a8dadc',

  // Villain (Count Eggplant)
  eggplantPurple: '#560bad',
  eggplantLight: '#7209b7',
  eggplantDark: '#3f0770',
  stemGreen: '#38b000',
  capeYellow: '#ffb703',
  capeDark: '#fb8500',

  // Enemies
  garlicWhite: '#f8f9fa',
  garlicShade: '#dee2e6',
  garlicFeet: '#e7c169',
  beanGreen: '#2a9d8f',
  beanLight: '#a7c957',
  beanEye: '#e63946',

  // Environment Tiles
  grassGreen: '#4ade80',
  grassLight: '#bbf7d0',
  dirtBrown: '#7c2d12',
  dirtDark: '#451a03',
  brickGrey: '#6b7280',
  brickLight: '#9ca3af',
  brickDark: '#374151',
  woodBrown: '#a16207',
  leafPlatform: '#15803d',
  spikeMetal: '#94a3b8',
  spikeShade: '#475569',
  cageIron: '#94a3b8',
  cageDark: '#475569',
  switchBase: '#4b5563',
  switchLever: '#dc2626',

  // Items
  coinGold: '#fbbf24',
  coinLight: '#fef08a',
  coinDark: '#d97706',
  giftRed: '#ef4444',
  giftGold: '#fbbf24',
  giftBlue: '#3b82f6',
  giftGreen: '#22c55e',
  giftPurple: '#a855f7',

  // Cake
  cakePlatter: '#cbd5e1',
  cakeFrosting: '#f472b6',
  cakeBread: '#fef08a',
  cakeCherry: '#dc2626',
  flameYellow: '#f59e0b',
  flameOrange: '#ef4444'
};

// Helper: draws a pixel matrix grid to canvas context
function drawPixelGrid(
  ctx: CanvasRenderingContext2D, 
  pixelSize: number, 
  grid: string[], 
  colorMap: { [key: string]: string }
) {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char !== '.' && colorMap[char]) {
        ctx.fillStyle = colorMap[char];
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

export const TextureGenerator = {
  generateAll(scene: Phaser.Scene) {
    const drawToTexture = (key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
      // If texture already exists, delete it first
      if (scene.textures.exists(key)) {
        scene.textures.remove(key);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        scene.textures.addCanvas(key, canvas);
      }
    };

    // Helper color mappings
    const alooColorMap = {
      '.': COLORS.trans,
      'X': COLORS.darkOutline,
      'd': COLORS.potatoSkin,
      'l': COLORS.potatoLight,
      's': COLORS.potatoDark,
      'w': COLORS.white,
      'b': COLORS.black,
      'm': COLORS.mustache,
      'r': COLORS.scarfRed,
      'o': COLORS.scarfDark
    };

    const bilahiColorMap = {
      '.': COLORS.trans,
      'X': COLORS.darkOutline,
      'r': COLORS.tomatoRed,
      'l': COLORS.tomatoLight,
      'd': COLORS.tomatoDark,
      'g': COLORS.leafGreen,
      'h': COLORS.leafLight,
      'p': COLORS.dressBlue,
      'o': COLORS.dressBlueLight,
      'w': COLORS.white,
      'b': COLORS.black,
      'k': COLORS.ribbonPink
    };

    // --- ALOO SPRITES (24x24 px) ---
    // Aloo Idle
    drawToTexture('aloo-idle', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "........................",
        ".........XXXXXX.........",
        ".......XXllllllXX.......",
        "......XllslllllldX......",
        ".....XllllllllllldX.....",
        "....XllllllllllllldX....",
        "....XllllllllllllldX....",
        "....XlllwlllwlllllldX...", // eyes top
        "....XlllbbllbbllllldX...", // eyes bottom
        "....XlllllrrllllllldX...", // mouth
        "....XllllllllllllldX....",
        "....XllllsllllllllldX...",
        "....XllllllllllllldX....",
        ".....XlllllllllllldX....",
        ".....XlllllllllllldX....",
        "......XlllllllllldX.....",
        "......XlllllllllldX.....",
        ".......XXllllllXX.......",
        ".........XXXXXX.........",
        "........XX....XX........", // tiny feet wider apart
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, alooColorMap);
    });

    // Aloo Walk 1
    drawToTexture('aloo-walk1', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "........................",
        "........................",
        ".........XXXXXX.........",
        ".......XXllllllXX.......",
        "......XllslllllldX......",
        ".....XllllllllllldX.....",
        "....XllllllllllllldX....",
        "....XllllllllllllldX....",
        "....XlllwlllwlllllldX...",
        "....XlllbbllbbllllldX...",
        "....XlllllrrllllllldX...",
        "....XllllllllllllldX....",
        "....XllllsllllllllldX...",
        "....XllllllllllllldX....",
        ".....XlllllllllllldX....",
        ".....XlllllllllllldX....",
        "......XlllllllllldX.....",
        "......XlllllllllldX.....",
        ".......XXllllllXX.......",
        "........XX...X..........", // walking feet
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, alooColorMap);
    });

    // Aloo Walk 2
    drawToTexture('aloo-walk2', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "........................",
        "........................",
        ".........XXXXXX.........",
        ".......XXllllllXX.......",
        "......XllslllllldX......",
        ".....XllllllllllldX.....",
        "....XllllllllllllldX....",
        "....XllllllllllllldX....",
        "....XlllwlllwlllllldX...",
        "....XlllbbllbbllllldX...",
        "....XlllllrrllllllldX...",
        "....XllllllllllllldX....",
        "....XllllsllllllllldX...",
        "....XllllllllllllldX....",
        ".....XlllllllllllldX....",
        ".....XlllllllllllldX....",
        "......XlllllllllldX.....",
        "......XlllllllllldX.....",
        ".......XXllllllXX.......",
        ".........X..XX..........", // walking feet
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, alooColorMap);
    });

    // Aloo Hurt
    drawToTexture('aloo-hurt', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "........................",
        ".........XXXXXX.........",
        ".......XXssssssXX.......",
        "......XsssssssssdX......",
        ".....XssssssssssdX.....",
        "....XssssssssssssdX....",
        "....XssssssssssssdX....",
        "....XsssXXssXXssssdX...", // hurt eyes cross
        "....XssssXXssXssssdX...",
        "....XsssXXssXXssssdX...",
        "....XssssssssssssdX....",
        "....XssssssssssssdX....",
        "....XssssssssssssdX....",
        ".....XssssssssssdX....",
        ".....XssssssssssdX....",
        "......XssssssssdX.....",
        "......XssssssssdX.....",
        ".......XXsssssXX........",
        ".........XXXXXX.........",
        "........XX....XX........",
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, alooColorMap);
    });

    // Aloo Hostage (tied up)
    drawToTexture('aloo-hostage', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "........................",
        ".........XXXXXX.........",
        ".......XXllllllXX.......",
        "......XllslllllldX......",
        ".....XllllllllllldX.....",
        "....XllllllllllllldX....",
        "....XllllllllllllldX....",
        "....XlllwlllwlllllldX...",
        "....XlllbbllbbllllldX...",
        "....XlllllrrllllllldX...",
        "....XXXXGGGGGXXXXG......", // Rope
        "....XllllsllllllllldX...",
        "....XXXXGGGGGXXXXG......", // Rope
        ".....XlllllllllllldX....",
        ".....XlllllllllllldX....",
        "......XlllllllllldX.....",
        "......XXdddddXX.........",
        "........XX...XX.........",
        "........XXXXXXX.........", // Chair
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      const hostageMap = { ...alooColorMap, 'G': '#cbd5e1' };
      drawPixelGrid(ctx, 1, grid, hostageMap);
    });

    // --- BILAHI SPRITES (24x24 px) ---
    // Bilahi Idle
    drawToTexture('bilahi-idle', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "............gg..........", // Stem top
        "............gg..........",
        "..........gggggg........",
        "...........XXXX.........",
        ".........XXXXXXXX.......",
        ".......XXllllllXX.......",
        "......XrrlllllllllldX...",
        ".....XrrllwllwllrrrddX..", // eyes top
        "....XrrlllbbllbbrrrddX..", // eyes bottom
        "....XrrlllkkrrkkrrrddX..", // blush and mouth
        "....XrrrrrrrrrrrrrrddX..",
        ".....XrrrrrrrrrrrrddX...",
        ".....XrrrrrrrrrrrrddX...",
        "......XrrrrrrrrrrddX....",
        ".......XXddddddddXX.....",
        ".........XXXXXXXX.......",
        "........XX......XX......", // feet
        "........XX......XX......",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, bilahiColorMap);
    });

    // Bilahi Walk 1
    drawToTexture('bilahi-walk1', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "............gg..........",
        "............gg..........",
        "..........gggggg........",
        "...........XXXX.........",
        ".........XXXXXXXX.......",
        ".......XXllllllXX.......",
        "......XrrlllllllllldX...",
        ".....XrrllwllwllrrrddX..",
        "....XrrlllbbllbbrrrddX..",
        "....XrrlllkkrrkkrrrddX..",
        "....XrrrrrrrrrrrrrrddX..",
        ".....XrrrrrrrrrrrrddX...",
        ".....XrrrrrrrrrrrrddX...",
        "......XrrrrrrrrrrddX....",
        ".......XXddddddddXX.....",
        ".........XXXXXXXX.......",
        "........XX......X.......", // walking feet
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, bilahiColorMap);
    });

    // Bilahi Walk 2
    drawToTexture('bilahi-walk2', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "............gg..........",
        "............gg..........",
        "..........gggggg........",
        "...........XXXX.........",
        ".........XXXXXXXX.......",
        ".......XXllllllXX.......",
        "......XrrlllllllllldX...",
        ".....XrrllwllwllrrrddX..",
        "....XrrlllbbllbbrrrddX..",
        "....XrrlllkkrrkkrrrddX..",
        "....XrrrrrrrrrrrrrrddX..",
        ".....XrrrrrrrrrrrrddX...",
        ".....XrrrrrrrrrrrrddX...",
        "......XrrrrrrrrrrddX....",
        ".......XXddddddddXX.....",
        ".........XXXXXXXX.......",
        ".........X......XX......", // walking feet
        "........................",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, bilahiColorMap);
    });

    // Bilahi Hurt
    drawToTexture('bilahi-hurt', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "............gg..........",
        "............gg..........",
        "..........gggggg........",
        "...........XXXX.........",
        ".........XXXXXXXX.......",
        ".......XXddddddXX.......", // hurt skin
        "......XddddddddddddhX...",
        ".....XddddXXddXXddddhX..", // hurt eyes cross
        "....XddddddXXddXdddddhX.",
        "....XddddXXddXXddddddhX.",
        "....XddddddddddddddddhX.",
        ".....XddddddddddddddhX..",
        ".....XddddddddddddddhX..",
        "......XddddddddddddhX...",
        ".......XXddddddddXX.....",
        ".........XXXXXXXX.......",
        "........XX......XX......",
        "........XX......XX......",
        "........................",
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      drawPixelGrid(ctx, 1, grid, bilahiColorMap);
    });

    // Bilahi Hostage
    drawToTexture('bilahi-hostage', 24, 24, (ctx) => {
      const grid = [
        "........................",
        "............gg..........",
        "............gg..........",
        "..........gggggg........",
        "...........XXXX.........",
        ".........XXXXXXXX.......",
        ".......XXllllllXX.......",
        "......XrrlllllllllldX...",
        ".....XrrllwllwllrrrddX..",
        "....XrrlllbbllbbrrrddX..",
        "....XrrlllkkrrkkrrrddX..",
        "....XXXXXGGGGGGGGXXXXG..", // Rope
        ".....XrrrrrrrrrrrrddX...",
        "....XXXXXGGGGGGGGXXXXG..", // Rope
        "......XrrrrrrrrrrddX....",
        ".......XXddddddddXX.....",
        ".........XXdddddXX......",
        "........XX......XX......",
        "........XXXXXXX.........", // Chair
        "........................",
        "........................",
        "........................",
        "........................",
        "........................"
      ];
      const hostageMap = { ...bilahiColorMap, 'G': '#cbd5e1' };
      drawPixelGrid(ctx, 1, grid, hostageMap);
    });

    // --- ENEMY 1: GARLIC BULB (16x16 px) ---
    drawToTexture('enemy-garlic', 16, 16, (ctx) => {
      const grid = [
        "......XXXX......",
        ".....XwwwwX.....",
        "....XwwwwwX.....",
        "...XwwwwwwwX....",
        "...XwwwwwswX....",
        "..XwwwwwssswX...",
        "..XwwXwwwwwXwX..",
        "..XwbbwwwwwbbX..",
        "..XwwwwwwwwwX...",
        "..XwwwwwwwwwX...",
        "...XsssssssX....",
        "....XsssssX.....",
        ".....XXXXX......",
        ".....XfffX......",
        "....Xff.ffX.....",
        "....XX...XX....."
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'w': COLORS.garlicWhite,
        's': COLORS.garlicShade,
        'b': COLORS.black,
        'f': COLORS.garlicFeet
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- ENEMY 2: JUMPING BEAN (16x16 px) ---
    drawToTexture('enemy-bean', 16, 16, (ctx) => {
      const grid = [
        ".....XXXXX......",
        "....XbbbbbX.....",
        "...XbbbbbbbX....",
        "..XbblllbbbbX...",
        "..XblllbbbbbX...",
        "..XbllwwllwwbX..",
        "..XbllrrllrrbX..",
        "..XblllbbbbbbX..",
        "..XbbbbbbbbbbX..",
        "...XbbbbbbbbX....",
        "....XbbbbbbX.....",
        ".....XbbbbX......",
        "......XXXX.......",
        "......XbbX.......",
        ".....Xb..bX......",
        ".....XX..XX......"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'b': COLORS.beanGreen,
        'l': COLORS.beanLight,
        'r': COLORS.beanEye,
        'w': COLORS.white
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- ENVIRONMENT TILES (16x16 px) ---
    
    // Grass Tile
    drawToTexture('tile-grass', 16, 16, (ctx) => {
      const grid = [
        "gggggggggggggggg",
        "gggggggggggggggg",
        "glllglglglllglll",
        "XddXXdXdXXddXXdX",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "ddssddddddssdddd",
        "ddssddddddssdddd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "ddddssddddddssdd",
        "ddddssddddddssdd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "dddddddddddddddd"
      ];
      const map = {
        'g': COLORS.grassGreen,
        'l': COLORS.grassLight,
        'd': COLORS.dirtBrown,
        's': COLORS.dirtDark,
        'X': COLORS.darkOutline
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Dirt Tile
    drawToTexture('tile-dirt', 16, 16, (ctx) => {
      const grid = [
        "dddddddddddddddd",
        "dddddddddddddddd",
        "ddssddddddssdddd",
        "ddssddddddssdddd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "ddddssddddddssdd",
        "ddddssddddddssdd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "ddssddddddssdddd",
        "ddssddddddssdddd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "dddddddddddddddd",
        "dddddddddddddddd"
      ];
      const map = {
        'd': COLORS.dirtBrown,
        's': COLORS.dirtDark
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Castle Brick
    drawToTexture('tile-castle', 16, 16, (ctx) => {
      const grid = [
        "bbbbbbbbbbbbbbbb",
        "blllllllbllllllb",
        "blbbbbblblbbbbbl",
        "blllllllbllllllb",
        "bbbbbbbbbbbbbbbb",
        "lllllblllllllbll",
        "lbbbbblblbbbbblb",
        "lllllblllllllbll",
        "bbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbb",
        "blllllllbllllllb",
        "blbbbbblblbbbbbl",
        "blllllllbllllllb",
        "bbbbbbbbbbbbbbbb",
        "dddddddddddddddd",
        "dddddddddddddddd"
      ];
      const map = {
        'b': COLORS.brickGrey,
        'l': COLORS.brickLight,
        'd': COLORS.brickDark
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Dungeon Brick
    drawToTexture('tile-dungeon', 16, 16, (ctx) => {
      const grid = [
        "bbbbbbbbbbbbbbbb",
        "blllllllbllllllb",
        "blbbbbblblbbbbbl",
        "blllllllbllllllb",
        "bbbbbbbbbbbbbbbb",
        "lllllblllllllbll",
        "lbbbbblblbbbbblb",
        "lllllblllllllbll",
        "bbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbb",
        "blllllllbllllllb",
        "blbbbbblblbbbbbl",
        "blllllllbllllllb",
        "bbbbbbbbbbbbbbbb",
        "dddddddddddddddd",
        "dddddddddddddddd"
      ];
      const map = {
        'b': '#3f37c9', // deep indigo/purple brick
        'l': '#4cc9f0', // neon blue highlight
        'd': '#1a1c4b'  // dark space shadows
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Warp Pipe (32x32 px)
    drawToTexture('tile-pipe', 32, 32, (ctx) => {
      const grid = [
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XggggggggggggggggggggggggggggggX",
        "XghhhhhhhhhhhhhhhhhhhhhhhhhhhhX",
        "XghggggggggggggggggggggggggggghX",
        "XghggggggggggggggggggggggggggghX",
        "XghggggggggggggggggggggggggggghX",
        "XghggggggggggggggggggggggggggghX",
        "XghggggggggggggggggggggggggggghX",
        "XghggggggggggggggggggggggggggghX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "....XXXXXXXXXXXXXXXXXXXXXXXX....",
        "....XggggggggggggggggggggggX....",
        "....XghhhhhhhhhhhhhhhhhhhhX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XghgggggggggggggggggghX....",
        "....XXXXXXXXXXXXXXXXXXXXXXXX...."
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'g': COLORS.leafGreen,
        'h': COLORS.leafLight
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Spikes (16x16)
    drawToTexture('tile-spikes', 16, 16, (ctx) => {
      const grid = [
        "..../\\..../\\....",
        "..../\\..../\\....",
        ".../##\\../##\\...",
        ".../##\\../##\\...",
        "../####\\/####\\..",
        "../####\\/####\\..",
        "./######/######\\.",
        "./######/######\\.",
        "/##############\\",
        "/##############\\",
        "XXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXX",
        "................",
        "................",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        '/': COLORS.spikeShade,
        '\\': COLORS.darkOutline,
        '#': COLORS.spikeMetal,
        'X': COLORS.darkOutline
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Forest Wood Tree trunk block (16x16)
    drawToTexture('tile-wood', 16, 16, (ctx) => {
      const grid = [
        "wwwwwwwwwwwwwwww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wwwwwwwwwwwwwwww"
      ];
      const map = {
        'w': COLORS.woodBrown,
        'd': COLORS.darkOutline
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // 3x Forest Wood Platform (48x16 px)
    drawToTexture('tile-wood-3x', 48, 16, (ctx) => {
      const patternGrid = [
        "wwwwwwwwwwwwwwww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wddwddwddwddwddw",
        "wdwwdwwdwwdwwdww",
        "wwwwwwwwwwwwwwww"
      ];
      const map: { [key: string]: string } = {
        'w': COLORS.woodBrown,
        'd': COLORS.darkOutline
      };
      for (let i = 0; i < 3; i++) {
        for (let r = 0; r < patternGrid.length; r++) {
          const row = patternGrid[r];
          for (let c = 0; c < row.length; c++) {
            const char = row[c];
            if (char !== '.' && map[char]) {
              ctx.fillStyle = map[char];
              ctx.fillRect(i * 16 + c, r, 1, 1);
            }
          }
        }
      }
    });

    // Forest Leaves block
    drawToTexture('tile-leaves', 16, 16, (ctx) => {
      const grid = [
        "gggggggggggggggg",
        "ghhhhhgghhhhhggh",
        "ghggggghghgggggh",
        "ghhhhhgghhhhhggh",
        "gghhhhhgghhhhhgg",
        "ghhhhhgghhhhhggh",
        "ghggggghghgggggh",
        "ghhhhhgghhhhhggh",
        "gggggggggggggggg",
        "gggggggggggggggg",
        "ghhhhhgghhhhhggh",
        "ghggggghghgggggh",
        "ghhhhhgghhhhhggh",
        "gggggggggggggggg",
        "gggggggggggggggg",
        "gggggggggggggggg"
      ];
      const map = {
        'g': COLORS.leafPlatform,
        'h': COLORS.leafLight
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- COLLECTIBLES (16x16 px) ---
    // Coin Potato (Gold)
    drawToTexture('coin-aloo', 16, 16, (ctx) => {
      const grid = [
        "......XXXX......",
        "....XXggggXX....",
        "...XggggggggX...",
        "..XggggggggggX..",
        "..XggwwggggggX..",
        ".XggwbbwggggggX.",
        ".XggwbbwggggggX.",
        ".XggggggggggggX.",
        ".XggggddddggggX.",
        "..XgggddddggX...",
        "..XgggggggggX...",
        "...XgggggggX....",
        "....XXgggXX.....",
        "......XXX.......",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'g': COLORS.coinGold,
        'w': COLORS.white,
        'b': COLORS.black,
        'd': COLORS.coinDark
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Coin Tomato (Red)
    drawToTexture('coin-bilahi', 16, 16, (ctx) => {
      const grid = [
        "......ll........",
        "....llll........",
        "....XXXXXX......",
        "...XrrrrrrX.....",
        "..XrrrrrrrrX....",
        "..XrrrrrrrrX....",
        ".XrrrrwwrrrrX...",
        ".XrrrrbbrrrrX...",
        ".XrrrrwwrrrrX...",
        ".XrrrrrrrrrdX...",
        "..XrrrrrrrrdX...",
        "...XddddddX.....",
        "....XXXXXX......",
        "................",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'r': COLORS.tomatoRed,
        'l': COLORS.leafGreen,
        'w': COLORS.white,
        'b': COLORS.black,
        'd': COLORS.tomatoDark
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Momo dumpling (16x16 px)
    drawToTexture('momo', 16, 16, (ctx) => {
      const grid = [
        "................",
        ".......XX.......",
        "......XyyX......",
        "....XXyyyyXX....",
        "...XyyyyyyyyX...",
        "..XyyyyyyyyyyX..",
        ".XyyywwywwyyyX..",
        ".XyyybbwbbwyyX..",
        ".XyyyyyyyyyyyyX.",
        ".XyyyyvvvvyyyyX.",
        "..XyyyyyyyyyyX..",
        "...XyyyyyyyyX...",
        "....XXXXXXXX....",
        "................",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'y': '#fdf0d5', // Momo cream color
        'w': COLORS.white,
        'b': COLORS.black,
        'v': COLORS.ribbonPink // pink blush/smile
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // Gift Box (16x16, custom colors passed in or draw standard red/blue/green/purple/gold)
    const drawGiftBox = (name: string, bodyColor: string, ribbonColor: string) => {
      drawToTexture(name, 16, 16, (ctx) => {
        const grid = [
          "......rr........",
          "....rrrrrr......",
          "....rr..rr......",
          "...XXXXXXXXX....",
          "..XbbbbbXbbbX...",
          "..XbbbbbXbbbX...",
          ".XXXXXXXXXXXXX..",
          ".XbbbbbbXbbbbX..",
          ".XbbbbbbXbbbbX..",
          ".XbbbbbbXbbbbX..",
          ".XbbbbbbXbbbbX..",
          ".XbbbbbbXbbbbX..",
          ".XbbbbbbXbbbbX..",
          "..XXXXXXXXXX....",
          "................",
          "................"
        ];
        const map = {
          '.': COLORS.trans,
          'X': COLORS.darkOutline,
          'b': bodyColor,
          'r': ribbonColor
        };
        drawPixelGrid(ctx, 1, grid, map);
      });
    };

    drawGiftBox('gift-1', COLORS.tomatoRed, COLORS.capeYellow);
    drawGiftBox('gift-2', COLORS.giftBlue, COLORS.white);
    drawGiftBox('gift-3', COLORS.giftGreen, COLORS.tomatoRed);
    drawGiftBox('gift-4', COLORS.giftPurple, COLORS.giftGold);
    drawGiftBox('gift-5', COLORS.giftGold, COLORS.ribbonPink);

    // --- CHECKPOINT FLAG (16x24 px) ---
    const drawCheckpoint = (name: string, flagColor: string, flagShade: string) => {
      drawToTexture(name, 16, 24, (ctx) => {
        const grid = [
          "....XX..........",
          "....XpX.ffffff..",
          "....XpXfffffff..",
          "....XpXfffffff..",
          "....XpXfffffff..",
          "....XpX.ffffff..",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XpX.........",
          "....XXX.........",
          "....XXX........."
        ];
        const map = {
          '.': COLORS.trans,
          'X': COLORS.darkOutline,
          'p': COLORS.woodBrown,
          'f': flagColor,
          's': flagShade
        };
        drawPixelGrid(ctx, 1, grid, map);
      });
    };
    drawCheckpoint('checkpoint-empty', COLORS.white, COLORS.garlicShade);
    drawCheckpoint('checkpoint-active', COLORS.grassGreen, COLORS.leafPlatform);

    // --- SWITCH (16x16 px) ---
    drawToTexture('switch-up', 16, 16, (ctx) => {
      const grid = [
        "......XX........",
        ".....XrrX.......",
        ".....XrrX.......",
        "......XX........",
        "......XX........",
        ".....X..X.......",
        "....X....X......",
        "...X......X.....",
        "..X........X....",
        ".XXXXXXXXXXXX...",
        "XbbbbbbbbbbbbX..",
        "XbbbbbbbbbbbbX..",
        "XbbbbbbbbbbbbX..",
        ".XXXXXXXXXXXX...",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'r': COLORS.switchLever,
        'b': COLORS.switchBase
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    drawToTexture('switch-down', 16, 16, (ctx) => {
      const grid = [
        "................",
        "................",
        "................",
        "................",
        "................",
        ".....X..X.......",
        "....X....X......",
        "...X......X.....",
        "..X..XX....X....",
        ".XXXXrrXXXXXX...",
        "XbbbbXrrbbbbbX..",
        "XbbbbbXXbbbbbX..",
        "XbbbbbbbbbbbbX..",
        ".XXXXXXXXXXXX...",
        "................",
        "................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'r': COLORS.switchLever,
        'b': COLORS.switchBase
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- CAGE (32x32 px) ---
    drawToTexture('cage', 32, 32, (ctx) => {
      const grid = [
        "....XXXXXXXXXXXXXXXXXXXXXXXX....",
        "...XwwwwwwwwwwwwwwwwwwwwwwwwX...",
        "..XwwwwwwwwwwwwwwwwwwwwwwwwwwX..",
        ".XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XccXXccXXccXXccXXccXXccXXccXXc.",
        ".XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.",
        "..XddddddddddddddddddddddddddX..",
        "...XddddddddddddddddddddddddX...",
        "....XXXXXXXXXXXXXXXXXXXXXXXX...."
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'w': COLORS.woodBrown,
        'c': COLORS.cageIron,
        'd': COLORS.cageDark
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- VILLAIN: COUNT EGGPLANT (32x32 px) ---
    drawToTexture('villain', 32, 32, (ctx) => {
      const grid = [
        ".............ggggg..............",
        "............gghhhgg.............",
        "............gghhhgg.............",
        "...........XXXXppXXXX...........",
        "..........XppppppppppX..........",
        ".........XppppppppppppX.........",
        "........XppppppppppppppX........",
        ".......XppppppppppppppppX.......",
        "......XppppppppppppppppppX......",
        ".....XpppppXXppppppXXpppppX.....",
        ".....XpppppXwwppppwwXpppppX.....",
        ".....XpppppXwbppppbwXpppppX.....",
        ".....XpppppXXXppppXXXpppppX.....",
        ".....XpppppXXXXXXXXXXpppppX.....",
        "......XpppppXXXXXXXXpppppX......",
        "......XppppppppppppppppppX......",
        ".......XppppppppppppppppX.......",
        "......ccXppppppppppppppXcc......",
        ".....ccccXppppppppppppXcccc.....",
        "....ccccccXXXXXXXXXXXXcccccc....",
        "....ccccccXddddddddddXcccccc....",
        "....ccccccXddddddddddXcccccc....",
        "....ccccccXddddddddddXcccccc....",
        "....ccccccXddddddddddXcccccc....",
        ".....ccccXddddddddddddXcccc.....",
        "......ccXddddddddddddddXcc......",
        "........XddddddddddddddX........",
        "........XddddddddddddddX........",
        ".........XXXXXXXXXXXXXX.........",
        "...........Xbb....bbX...........",
        "............XX....XX............",
        "................................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'p': COLORS.eggplantPurple,
        'd': COLORS.eggplantDark,
        'g': COLORS.stemGreen,
        'h': COLORS.leafLight,
        'w': COLORS.white,
        'b': COLORS.black,
        'c': COLORS.capeYellow
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- BIRTHDAY CAKE (48x48 px) ---
    drawToTexture('cake', 48, 48, (ctx) => {
      const grid = [
        "................................................",
        "..................f......f......f...............",
        ".................fo.....fo.....fo...............",
        ".................ff.....ff.....ff...............",
        ".................cc.....cc.....cc...............",
        ".................cc.....cc.....cc...............",
        "..............XXXXXXXXXXXXXXXXXXXX..............",
        ".............XffffffffffffffffffffX.............",
        "............XffffffffffffffffffffffX............",
        "............XffrrrrrrffrrrrrrffrrrrX............",
        "............XfbbbbbbbbbbbbbbbbbbbbdX............",
        "............XfbbbbbbbbbbbbbbbbbbbbdX............",
        ".............XXXXXXXXXXXXXXXXXXXXX..............",
        "...........XXXXXXXXXXXXXXXXXXXXXXXXXX...........",
        "..........XffffffffffffffffffffffffffX..........",
        ".........XffffffffffffffffffffffffffffX.........",
        "........XffrrrrrrffrrrrrrffrrrrrrffrrrrX........",
        "........XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX........",
        "........XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX........",
        "........XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX........",
        ".........XXXXXXXXXXXXXXXXXXXXXXXXXXXXX..........",
        ".......XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.......",
        "......XffffffffffffffffffffffffffffffffffX......",
        ".....XffffffffffffffffffffffffffffffffffffX.....",
        "....XffrrrrrrffrrrrrrffrrrrrrffrrrrrrffrrrrX....",
        "....XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX....",
        "....XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX....",
        "....XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX....",
        "....XfbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbdX....",
        ".....XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX......",
        "....XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX....",
        "...XppppppppppppppppppppppppppppppppppppppppX...",
        "..XppppppppppppppppppppppppppppppppppppppppppX..",
        "..XppppppppppppppppppppppppppppppppppppppppppX..",
        "...XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'p': COLORS.cakePlatter,
        'f': COLORS.cakeFrosting,
        'b': COLORS.cakeBread,
        'd': COLORS.woodBrown,
        'r': COLORS.cakeCherry,
        'c': COLORS.white,
        'o': COLORS.flameOrange,
        'g': COLORS.flameYellow
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- BOUQUET OF FLOWERS (48x48 px) ---
    drawToTexture('bouquet', 48, 48, (ctx) => {
      const grid = [
        "................................................",
        "..................XXXX....XXXX..................",
        ".................XrrrrX..XrrrrX.................",
        "................XrrddrrXXrrddrrX................",
        "................XrrddrrXXrrddrrX................",
        ".................XrrrrX..XrrrrX.................",
        "..............XXXXX..XXXXXX..XXXXX..............",
        "............XXwwwwwXXyyyyyyXXwwwwwXX............",
        "...........XwwpwwpwwXyyoyoyyXwwpwwpwwX...........",
        "...........XwwpppppwwXyoyooyXwwpppppwwX..........",
        "............XXwwwwwXXyyyyyyXXwwwwwXX............",
        "..........XXXXX..XXXXX..XXXXX..XXXXX..XXXXX.....",
        "........XXrrrrrXXwwwwwXXrrrrrXXyyyyyXXrrrrrXX...",
        ".......XrrrddrrXwwpwwpXrrrddrrXyyoyoXrrrddrrX..",
        ".......XrrrddrrXwwpppwwXrrrddrrXyoyoXrrrddrrX..",
        "........XXrrrrrXXwwwwwXXrrrrrXXyyyyyXXrrrrrXX...",
        "..........XXXXX..XXXXX..XXXXX..XXXXX..XXXXX.....",
        "............XXXXXgghhggXXXXXgghhggXXXXX.........",
        "...........XgggggXhhhhhXggggXhhhhhXggggX........",
        "...........XgghhggXgghgXgghgXgghhgXgghgX........",
        "............XXXXXgghhggXXXXXgghhggXXXXX.........",
        "..............XXXXgghhggXXXgghhggXXXX...........",
        "................XXgghhggXXXgghhgXX..............",
        "..................XXXXXggggXXXXX................",
        "..................XkkkkkkkkkkkX.................",
        ".................XkkkkkkkkkkkkkX................",
        ".................XkkkmmmmmmkkkkX................",
        "..................XkkkkkkkkkkkX.................",
        "...................XXXgggggXXX..................",
        ".....................XgggggX....................",
        "....................XggXgggX....................",
        "...................XggX.XgggX...................",
        "..................XggX...XgggX..................",
        ".................XggX.....XgggX.................",
        "................XggX.......XgggX................",
        "................XX..........XX..................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................",
        "................................................"
      ];
      const map = {
        '.': COLORS.trans,
        'X': COLORS.darkOutline,
        'g': COLORS.leafGreen,
        'h': COLORS.leafLight,
        'y': COLORS.coinGold,        // Sunflower yellow
        'o': COLORS.coinDark,        // Sunflower center orange/brown
        'w': COLORS.white,           // Daisy/Lily white
        'p': COLORS.flameYellow,     // Daisy/Lily yellow center
        'r': COLORS.tomatoRed,       // Rose red
        'd': COLORS.tomatoDark,      // Rose dark red
        'k': COLORS.ribbonPink,      // Ribbon pink
        'm': COLORS.scarfDark        // Ribbon shadow
      };
      drawPixelGrid(ctx, 1, grid, map);
    });

    // --- CLOUD FOR PARALLAX (64x32 px) ---
    drawToTexture('cloud', 64, 32, (ctx) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(16, 20, 10, 0, Math.PI * 2);
      ctx.arc(32, 16, 14, 0, Math.PI * 2);
      ctx.arc(48, 20, 10, 0, Math.PI * 2);
      ctx.arc(24, 20, 12, 0, Math.PI * 2);
      ctx.arc(40, 20, 12, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    });

    // --- MOUNTAIN FOR PARALLAX (128x64 px) ---
    drawToTexture('mountain', 128, 64, (ctx) => {
      ctx.fillStyle = 'rgba(29, 53, 87, 0.15)'; // Very faint blue/dark color
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(40, 20);
      ctx.lineTo(70, 45);
      ctx.lineTo(100, 10);
      ctx.lineTo(128, 64);
      ctx.closePath();
      ctx.fill();
    });

    // --- SIMPLE PARTICLE (2x2 px) ---
    drawToTexture('particle', 2, 2, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 2, 2);
    });
  }
};
export default TextureGenerator;
