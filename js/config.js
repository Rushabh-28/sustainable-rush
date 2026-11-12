/* ==========================================================================
   Sustainable Rush - game configuration
   All tunable numbers (board size, levels, tile types, eco facts) live here,
   so the game can be rebalanced without touching any scene code.
   ========================================================================== */

const GAME_W = 480;
const GAME_H = 800;

const GRID = 8;          // 8 x 8 board
const TILE = 54;         // pixel size of one cell
const BOARD_X = 24;      // left edge of the board
const BOARD_Y = 196;     // top edge of the board

const FONT = '"Trebuchet MS","Segoe UI",Roboto,Helvetica,Arial,sans-serif';

/* Five eco tiles. `unit` + `per` describe the "impact" every cleared tile adds
   to the player's environmental score (shown on the result screen). */
const TILE_DEFS = [
  { key: 'tree',    name: 'Tree',       top: '#66BB6A', bottom: '#2E7D32', color: 0x43A047,
    per: 1,   unit: 'trees planted',      gain: 'Plants 1 tree',            short: 'Trees' },
  { key: 'water',   name: 'Water',      top: '#4FC3F7', bottom: '#0277BD', color: 0x039BE5,
    per: 5,   unit: 'litres saved',       gain: 'Saves 5 litres of water',  short: 'Water' },
  { key: 'solar',   name: 'Solar',      top: '#FFD54F', bottom: '#F57C00', color: 0xFFA000,
    per: 2,   unit: 'kWh clean energy',   gain: 'Makes 2 kWh clean energy', short: 'Solar' },
  { key: 'recycle', name: 'Recycle',    top: '#BA68C8', bottom: '#6A1B9A', color: 0x8E24AA,
    per: 0.5, unit: 'kg waste recycled',  gain: 'Recycles 0.5 kg of waste', short: 'Recycle' },
  { key: 'wind',    name: 'Wind',       top: '#FF8A80', bottom: '#C62828', color: 0xE53935,
    per: 3,   unit: 'kWh wind power',     gain: 'Makes 3 kWh wind power',   short: 'Wind' }
];

/* Six levels. `types` = how many different tiles appear (fewer = easier).
   `theme` picks the sky / scenery from THEMES below. */
const LEVELS = [
  { name: 'Seedling Park',  goal: 1200, moves: 16, types: 4, theme: 'dawn'   },
  { name: 'Clean River',    goal: 1400, moves: 20, types: 5, theme: 'day'    },
  { name: 'Solar Valley',   goal: 1700, moves: 20, types: 5, theme: 'noon'   },
  { name: 'Windy Coast',    goal: 1900, moves: 22, types: 5, theme: 'sunset' },
  { name: 'Recycle City',   goal: 2150, moves: 23, types: 5, theme: 'dusk'   },
  { name: 'Green Planet',   goal: 2400, moves: 26, types: 5, theme: 'night'  }
];

const THEMES = {
  dawn:   { sky: ['#FFE0B2', '#FFF8E1'], text: '#1B5E20', sub: '#33691E', orb: 0xFFB74D, orbPos: [380, 150], stars: false, hills: [0x81C784, 0x66BB6A] },
  day:    { sky: ['#81D4FA', '#E1F5FE'], text: '#0D47A1', sub: '#1B5E20', orb: 0xFFF59D, orbPos: [70, 168],  stars: false, hills: [0x81C784, 0x4CAF50] },
  noon:   { sky: ['#4FC3F7', '#FFF9C4'], text: '#01579B', sub: '#33691E', orb: 0xFFEE58, orbPos: [240, 90],  stars: false, hills: [0xAED581, 0x7CB342] },
  sunset: { sky: ['#FF8A65', '#FFE0B2'], text: '#4E342E', sub: '#33691E', orb: 0xFF7043, orbPos: [400, 170], stars: false, hills: [0x8D6E63, 0x558B2F] },
  dusk:   { sky: ['#5C6BC0', '#F8BBD0'], text: '#FFFFFF', sub: '#E8F5E9', orb: 0xFFCC80, orbPos: [90, 160],  stars: true,  hills: [0x4E7D5B, 0x2E5E3E] },
  night:  { sky: ['#0D1B3E', '#1B5E6B'], text: '#FFFFFF', sub: '#C8E6C9', orb: 0xECEFF1, orbPos: [390, 120], stars: true,  hills: [0x1F5E43, 0x14452F] },
  menu:   { sky: ['#4FC3F7', '#E8F5E9'], text: '#1B5E20', sub: '#33691E', orb: 0xFFF59D, orbPos: [400, 110], stars: false, hills: [0x81C784, 0x43A047] }
};

const ECO_FACTS = [
  'One tree can absorb roughly 20 kg of CO₂ every year.',
  'Recycling aluminium saves about 95% of the energy needed to make it new.',
  'LED bulbs use up to 80% less electricity than old incandescent bulbs.',
  'Less than 3% of Earth’s water is fresh water. Every drop counts!',
  'The sun delivers more energy to Earth in one hour than we use in a year.',
  'A dripping tap can waste thousands of litres of water every year.',
  'Plastic bottles can take hundreds of years to break down in nature.',
  'Wind power produces electricity without burning any fuel.',
  'Composting food scraps keeps methane out of landfills.',
  'Walking, cycling and public transport cut your carbon footprint.',
  'Unplug idle chargers. Standby power still uses energy.',
  'Recycling one tonne of paper can save about 17 trees.',
  'Solar panels make clean electricity with no emissions while running.',
  'Reusable bags and bottles keep single-use plastic out of oceans.'
];

const SCORING = {
  perTile: 10,          // points for each cleared tile
  longRunBonus: 15,     // extra per tile beyond 3 in a single run
  chainStep: 0.5,       // each cascade adds +50% to the multiplier
  leftoverMoveBonus: 20 // points for each unused move when a level is won
};

const START_HINTS = 5;
const START_SHUFFLES = 2;
const IDLE_HINT_MS = 8000;
