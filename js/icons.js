/* ==========================================================================
   Sustainable Rush - vector icons
   Every icon is plain SVG written in code, so the game needs no image files.
   BootScene turns each SVG into a Phaser texture at start-up.
   ========================================================================== */

/* Icon artwork on a 24 x 24 grid. `c` is the colour the icon is drawn in. */
const ICON_ART = {
  /* ---- the five tile symbols (drawn white on a coloured tile) ---- */
  tree: c => `<path d="M12 2.2 17.6 9.6H14.8L19.6 16H4.4L9.2 9.6H6.4Z" fill="${c}"/><rect x="10.4" y="16" width="3.2" height="5.4" rx="1" fill="${c}"/>`,
  water: c => `<path d="M12 2.4C9 6.4 5.6 10.2 5.6 14.4a6.4 6.4 0 0 0 12.8 0C18.4 10.2 15 6.4 12 2.4Z" fill="${c}"/>` +
              `<path d="M9 14.6a3.2 3.2 0 0 0 2.6 3" fill="none" stroke="#0277BD" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>`,
  solar: c => `<circle cx="12" cy="12" r="4.4" fill="${c}"/>` +
              [0, 45, 90, 135, 180, 225, 270, 315].map(a =>
                `<line x1="12" y1="2.6" x2="12" y2="5.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round" transform="rotate(${a} 12 12)"/>`).join(''),
  recycle: c => `<g fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">` +
                 `<path d="M5.2 11A7 7 0 0 1 17.4 6.6"/><path d="M18.8 13A7 7 0 0 1 6.6 17.4"/></g>` +
                 `<path d="M19 3.4 18.4 8.6 13.4 7.4Z" fill="${c}"/><path d="M5 20.6 5.6 15.4 10.6 16.6Z" fill="${c}"/>`,
  wind: c => `<path d="M11.4 11.2 10.7 22H13.3L12.6 11.2Z" fill="${c}"/>` +
              [20, 140, 260].map(a => `<path d="M12 9.8C9.4 7.8 9.5 4.4 12 1.2C14.5 4.4 14.6 7.8 12 9.8Z" fill="${c}" transform="rotate(${a} 12 9.8)"/>`).join('') +
              `<circle cx="12" cy="9.8" r="2" fill="${c}" stroke="#C62828" stroke-opacity=".5" stroke-width=".8"/>`,

  /* ---- interface icons (stroke style) ---- */
  hint: c => `<g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
              `<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z"/></g>`,
  shuffle: c => `<g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
                `<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/></g>`,
  soundOn: c => `<path d="M4 9v6h4l5 4V5L8 9Z" fill="${c}"/><g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M16 8.5a5 5 0 0 1 0 7M18.6 5.8a8.6 8.6 0 0 1 0 12.4"/></g>`,
  soundOff: c => `<path d="M4 9v6h4l5 4V5L8 9Z" fill="${c}"/><g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M17 9.5l5 5M22 9.5l-5 5"/></g>`,
  download: c => `<g fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10.5l5 5 5-5M4 20h16"/></g>`,
  home: c => `<g fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 3.5l9 8M5.5 10v10.5h4.8v-6h3.4v6h4.8V10"/></g>`,
  play: c => `<path d="M7 4.2 20 12 7 19.8Z" fill="${c}" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>`,
  retry: c => `<g fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5.2h-5.2"/></g>`,
  next: c => `<g fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12h15M13.5 6l6 6-6 6"/></g>`,
  lock: c => `<rect x="5" y="11" width="14" height="10" rx="2.4" fill="${c}"/><path d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
  info: c => `<g fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6h.01" stroke-width="2.6"/></g>`,
  close: c => `<g fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></g>`,
  leaf: c => `<path d="M20.5 3.5C10 3.5 4 9 4 16.4c0 1.2.2 2.4.6 3.4C12.6 20 21 14.6 20.5 3.5Z" fill="${c}"/>` +
             `<path d="M4.6 19.8 13 11" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>`,
  star: c => `<path d="M12 2.6l2.9 6.2 6.7.8-4.9 4.6 1.3 6.7L12 17.5l-6 3.4 1.3-6.7L2.4 9.6l6.7-.8Z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`,
  trophy: c => `<g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8.5 20.5h7"/></g>`
};

/* Wrap artwork in a 24-grid SVG string. */
function iconSVG(name, color, px) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">${ICON_ART[name](color)}</svg>`;
}

/* A glossy rounded tile with its symbol in the middle (64-unit design, drawn at 128px). */
function tileSVG(def, px) {
  const id = def.key;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${def.top}"/><stop offset="1" stop-color="${def.bottom}"/></linearGradient>
      <linearGradient id="h-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="3" y="5" width="58" height="56" rx="15" fill="#000" opacity=".22"/>
    <rect x="3" y="3" width="58" height="56" rx="15" fill="url(#g-${id})"/>
    <rect x="3" y="3" width="58" height="56" rx="15" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
    <rect x="7" y="5.5" width="50" height="22" rx="11" fill="url(#h-${id})"/>
    <g transform="translate(14 12) scale(1.5)">${ICON_ART[def.key]('#ffffff')}</g>
  </svg>`;
}

/* Small decorative pieces. */
function earthSVG(px) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 64 64">
    <defs><radialGradient id="eg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#4FC3F7"/><stop offset="1" stop-color="#0D47A1"/></radialGradient></defs>
    <circle cx="32" cy="32" r="30" fill="url(#eg)"/>
    <path d="M17 19C23 12 33 14 35 21C37 27 29 29 27 35C25 41 16 39 14 31C13 26 14 22 17 19Z" fill="#66BB6A"/>
    <path d="M38 38C44 34 53 38 51 46C49 53 40 54 37 48C35 44 35 41 38 38Z" fill="#43A047"/>
    <path d="M42 13C46 11 51 14 50 19C48 23 42 22 41 18Z" fill="#81C784"/>
    <ellipse cx="22" cy="17" rx="9" ry="4" fill="#fff" opacity=".25" transform="rotate(-25 22 17)"/>
    <circle cx="32" cy="32" r="30" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/></svg>`;
}

function leafSVG(px) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">
    <path d="M20.5 3.5C10 3.5 4 9 4 16.4c0 1.2.2 2.4.6 3.4C12.6 20 21 14.6 20.5 3.5Z" fill="#fff"/>
    <path d="M4.6 19.8 13 11" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.2" stroke-linecap="round"/></svg>`;
}

function sparkSVG(px) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">
    <path d="M12 1l2.4 8.6L23 12l-8.6 2.4L12 23l-2.4-8.6L1 12l8.6-2.4Z" fill="#fff"/></svg>`;
}

function miniTreeSVG(px) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 32">
    <path d="M12 1 19 11H15.5L21.5 20H2.5L8.5 11H5Z" fill="#2E7D32"/><path d="M12 1 19 11H15.5L21.5 20H12Z" fill="#1B5E20" opacity=".45"/>
    <rect x="10.4" y="20" width="3.2" height="9" rx="1" fill="#5D4037"/></svg>`;
}

/* Register every texture the game needs (resolves when all are ready). */
function buildAllTextures(textures) {
  const jobs = [];
  const add = (key, svg) => jobs.push(new Promise(resolve => {
    if (textures.exists(key)) { resolve(); return; }
    const img = new Image();
    img.onload = () => { if (!textures.exists(key)) textures.addImage(key, img); resolve(); };
    img.onerror = () => { console.warn('Could not build texture', key); resolve(); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }));

  TILE_DEFS.forEach((d, i) => add('tile-' + i, tileSVG(d, 128)));
  TILE_DEFS.forEach((d, i) => add('symbol-' + i, iconSVG(d.key, '#ffffff', 96)));

  Object.keys(ICON_ART).forEach(name => {
    if (['tree', 'water', 'solar', 'recycle', 'wind'].includes(name)) return;
    add('ui-' + name + '-w', iconSVG(name, '#ffffff', 96));
    add('ui-' + name + '-d', iconSVG(name, '#1B5E20', 96));
  });
  add('ui-star-gold', iconSVG('star', '#FFC107', 96));
  add('ui-star-grey', iconSVG('star', '#B0BEC5', 96));
  add('ui-leaf-green', iconSVG('leaf', '#43A047', 96));

  add('earth', earthSVG(128));
  add('leaf', leafSVG(48));
  add('spark', sparkSVG(48));
  add('mini-tree', miniTreeSVG(64));

  return Promise.all(jobs);
}
