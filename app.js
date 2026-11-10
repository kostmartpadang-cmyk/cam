'use strict';
/* Cam-Awa — kamera web dengan filter WebGL2. Tanpa dependensi, tanpa build. */

const $ = (s) => document.querySelector(s);

/* ---------- Ikon ---------- */
const ICONS = {
  flip: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
};
document.querySelectorAll('svg[data-i]').forEach((el) => {
  el.setAttribute('viewBox', '0 0 24 24');
  el.classList.add('i');
  el.innerHTML = ICONS[el.dataset.i] || '';
});

/* ---------- Preset filter ---------- */
const BASE = {
  exposure: 0, contrast: 1, sat: 1, temp: 0, tint: 0, fade: 0, bw: 0, vig: 0,
  sharp: 0.15, leak: 0, toneAmt: 0,
  shadow: [0.5, 0.5, 0.5], high: [0.5, 0.5, 0.5], date: false, frame: 'none',
  // efek khusus / lucu
  bulge: 0, swirl: 0, pixel: 0, poster: 0, thermal: 0,
  mfx: 0, duo: 0, invert: 0, scan: 0,
  duoA: [0, 0, 0], duoB: [1, 1, 1], deco: '', pat: '',
};
const PRESETS = [
  { name: 'Asli', sw: ['#d9d4cc', '#7d776e'], p: {} },
  { name: 'Kodak Gold', sw: ['#ffd36a', '#c4651f'], p: {
      contrast: 1.1, sat: 1.22, temp: 0.5, fade: 0.08, vig: 0.22, sharp: 0.4,
      toneAmt: 0.6, shadow: [0.5, 0.48, 0.45], high: [0.66, 0.55, 0.38] } },
  { name: 'Fuji Hijau', sw: ['#9ad6b0', '#2e6f5c'], p: {
      contrast: 1.12, sat: 1.12, temp: -0.1, tint: 0.4, fade: 0.06, vig: 0.2, sharp: 0.4,
      toneAmt: 0.6, shadow: [0.4, 0.55, 0.52], high: [0.55, 0.55, 0.5] } },
  { name: 'Sinematik', sw: ['#2f6f7e', '#e49b5a'], p: {
      contrast: 1.2, sat: 1.1, fade: 0.04, vig: 0.38, sharp: 0.45,
      toneAmt: 1.0, shadow: [0.36, 0.52, 0.62], high: [0.66, 0.5, 0.36] } },
  { name: 'Hitam Putih', sw: ['#eeeeee', '#2a2a2a'], p: {
      contrast: 1.3, bw: 1, fade: 0.04, vig: 0.3, sharp: 0.5 } },
  { name: 'Sepia', sw: ['#e8cfa5', '#5f3d22'], p: {
      contrast: 1.12, bw: 1, fade: 0.12, vig: 0.4, toneAmt: 1.3, sharp: 0.3,
      shadow: [0.38, 0.3, 0.22], high: [0.7, 0.56, 0.4] } },
  { name: 'Pastel Matte', sw: ['#f6d6e0', '#a9c9e8'], p: {
      exposure: 0.15, contrast: 0.9, sat: 0.8, temp: 0.1, tint: -0.2, fade: 0.35, vig: 0.1, 
      toneAmt: 0.4, shadow: [0.5, 0.48, 0.58], high: [0.6, 0.52, 0.5] } },
  { name: 'Vivid HD', sw: ['#27d17f', '#ff4d6d'], p: {
      contrast: 1.25, sat: 1.4, sharp: 1.0, vig: 0.1 } },

  /* ===== Estetik ===== */
  { c: 'Estetik', e: '🌇', name: 'Golden Hour', sw: ['#ffd08a', '#ff7a3d'], p: {
      exposure: 0.1, contrast: 1.1, sat: 1.2, temp: 0.65, fade: 0.06, vig: 0.2, leak: 0.25, sharp: 0.4,
      toneAmt: 0.7, shadow: [0.48, 0.46, 0.5], high: [0.7, 0.54, 0.36] } },
  { c: 'Estetik', e: '🌫️', name: 'Moody', sw: ['#2c3b44', '#8aa0a8'], p: {
      exposure: -0.25, contrast: 1.3, sat: 0.75, temp: -0.2, fade: 0.12, vig: 0.5, sharp: 0.5,
      toneAmt: 0.8, shadow: [0.38, 0.5, 0.58], high: [0.55, 0.52, 0.5] } },
  { c: 'Estetik', e: '🎞️', name: 'Noir', sw: ['#f2f2f2', '#000'], p: {
      contrast: 1.55, bw: 1, vig: 0.65, fade: 0.02, sharp: 0.6 } },
  { c: 'Estetik', e: '🌃', name: 'Cyberpunk', sw: ['#ff2bd6', '#17e6ff'], p: {
      contrast: 1.25, sat: 1.5, vig: 0.35, sharp: 0.6,
      toneAmt: 1.6, shadow: [0.62, 0.34, 0.7], high: [0.34, 0.62, 0.7] } },
  { c: 'Estetik', e: '🌴', name: 'Vaporwave', sw: ['#3a1a8a', '#ff8fd0'], p: {
      duo: 0.8, duoA: [0.16, 0.05, 0.42], duoB: [1, 0.62, 0.92], scan: 0.3, contrast: 1.1, } },
  { c: 'Estetik', e: '🟩', name: 'Matrix', sw: ['#031a06', '#4dff5e'], p: {
      duo: 1, duoA: [0, 0.03, 0], duoB: [0.3, 1, 0.35], scan: 0.6, contrast: 1.15 } },

  /* ===== Lucu ===== */
  { c: 'Lucu', e: '🐟', name: 'Mata Ikan', sw: ['#9ad4ff', '#1d5fa8'], p: {
      bulge: 0.85, vig: 0.3, sharp: 0.5, sat: 1.1 } },
  { c: 'Lucu', e: '🥴', name: 'Mengkerut', sw: ['#ffd0a8', '#a85a3a'], p: {
      bulge: -0.8, sharp: 0.4, sat: 1.1 } },
  { c: 'Lucu', e: '🌀', name: 'Pusaran', sw: ['#c9a8ff', '#4a2a9a'], p: {
      swirl: 3.2, sat: 1.15, sharp: 0.3 } },
  { c: 'Lucu', e: '🪞', name: 'Cermin Kembar', sw: ['#e0e0e0', '#8a8a8a'], p: { mfx: 1 } },
  { c: 'Lucu', e: '🧩', name: 'Cermin 4', sw: ['#ffd36a', '#5aa8ff'], p: { mfx: 3, sat: 1.1 } },
  { c: 'Lucu', e: '👾', name: 'Pixel 8-bit', sw: ['#3a3a8a', '#ffd23a'], p: {
      pixel: 80, poster: 5, sat: 1.4, sharp: 0 } },
  { c: 'Lucu', e: '🔥', name: 'Termal', sw: ['#2a0a6a', '#ffe14d'], p: { thermal: 1, sharp: 0.3 } },
  { c: 'Lucu', e: '🧪', name: 'Negatif', sw: ['#ffffff', '#111'], p: { invert: 1, contrast: 1.1 } },
  { c: 'Stiker', e: '✨', name: 'Sparkle', sw: ['#fff3b0', '#ffb3e6'], p: {
      deco: 'sparkle', exposure: 0.12, fade: 0.1, sat: 1.1, temp: 0.1, vig: 0.1 } },
  { c: 'Stiker', e: '💖', name: 'Cinta', sw: ['#ffc2d9', '#ff4d88'], p: {
      deco: 'hearts', temp: 0.15, tint: -0.15, exposure: 0.1, fade: 0.08, sat: 1.1,
      toneAmt: 0.6, shadow: [0.5, 0.46, 0.52], high: [0.66, 0.5, 0.54] } },
  { c: 'Stiker', e: '🌸', name: 'Taman Bunga', sw: ['#ffd6e8', '#a8e6a8'], p: {
      deco: 'flowers', exposure: 0.12, fade: 0.2, sat: 0.95, temp: 0.12, tint: -0.1 } },
  { c: 'Stiker', e: '🎉', name: 'Pesta', sw: ['#ff6a6a', '#6a9aff'], p: {
      deco: 'party', sat: 1.3, contrast: 1.1, } },

  /* ===== Stiker pola: bentuk kecil-kecil, putih, agak buram, memenuhi layar ===== */
  { c: 'Stiker', e: '💗', name: 'Love Buram', sw: ['#ffe3ee', '#ffffff'], p: {
      pat: 'love', exposure: 0.08, fade: 0.08, sat: 1.05, temp: 0.08, sharp: 0.3 } },
  { c: 'Stiker', e: '🩷', name: 'Love Pink', sw: ['#ffb0cd', '#ff7aa8'], p: {
      pat: 'lovePink', exposure: 0.1, fade: 0.1, tint: -0.12, temp: 0.12, sharp: 0.3,
      toneAmt: 0.5, shadow: [0.5, 0.46, 0.52], high: [0.66, 0.5, 0.54] } },
  { c: 'Stiker', e: '⭐', name: 'Bintang Buram', sw: ['#1d2a5a', '#ffffff'], p: {
      pat: 'stars', exposure: -0.03, contrast: 1.08, vig: 0.2, sharp: 0.4,
      toneAmt: 0.6, shadow: [0.42, 0.48, 0.64], high: [0.56, 0.54, 0.54] } },
  { c: 'Stiker', e: '💫', name: 'Glitter', sw: ['#fff6c8', '#ffffff'], p: {
      pat: 'glitter', exposure: 0.08, sharp: 0.4 } },
  { c: 'Stiker', e: '🫧', name: 'Gelembung', sw: ['#bfeaff', '#ffffff'], p: {
      pat: 'bubbles', temp: -0.08, sat: 1.1, exposure: 0.1, sharp: 0.4,
      toneAmt: 0.5, shadow: [0.44, 0.54, 0.62], high: [0.52, 0.58, 0.62] } },
  { c: 'Stiker', e: '❄️', name: 'Salju', sw: ['#d8ecff', '#ffffff'], p: {
      pat: 'snow', temp: -0.25, exposure: 0.12, contrast: 1.05, fade: 0.05, sharp: 0.4 } },
  { c: 'Stiker', e: '🌼', name: 'Kelopak', sw: ['#fff3c4', '#ffffff'], p: {
      pat: 'petals', exposure: 0.1, fade: 0.12, temp: 0.1, sharp: 0.3 } },
  { c: 'Stiker', e: '🍬', name: 'Campur Manis', sw: ['#ffd1e6', '#c9e4ff'], p: {
      pat: 'mix', sat: 1.15, exposure: 0.08, sharp: 0.3 } },
  { c: 'Stiker', e: '🟡', name: 'Bokeh Emas', sw: ['#ffe3a8', '#ff9d3a'], p: {
      pat: 'bokeh', temp: 0.35, exposure: 0.05, vig: 0.2, sharp: 0.3 } },
  { c: 'Stiker', e: '🔵', name: 'Bokeh Biru', sw: ['#cfe6ff', '#5a8ae0'], p: {
      pat: 'bokehCool', temp: -0.25, exposure: 0.05, vig: 0.2, sharp: 0.3 } },

  /* ===== Jernih ===== */
  { c: 'Jernih', e: '🍃', name: 'Jernih Alami', sw: ['#b9e0c4', '#4a8a5a'], p: {
      exposure: 0.05, contrast: 1.08, sat: 1.08, sharp: 0.7, vig: 0.08 } },
  { c: 'Jernih', e: '🌤️', name: 'Fresh Bright', sw: ['#fffbe0', '#9fd4ff'], p: {
      exposure: 0.2, contrast: 1.05, sat: 1.15, temp: -0.05, fade: 0.03, sharp: 0.6 } },
  { c: 'Jernih', e: '🙂', name: 'Potret Jernih', sw: ['#ffe0cc', '#e8a98a'], p: {
      exposure: 0.1, contrast: 1.06, sat: 1.05, temp: 0.12, sharp: 0.55, vig: 0.12,
      toneAmt: 0.4, shadow: [0.48, 0.5, 0.54], high: [0.6, 0.52, 0.46] } },
  { c: 'Jernih', e: '🏖️', name: 'Pantai', sw: ['#7fd8ff', '#ffe8b0'], p: {
      exposure: 0.1, contrast: 1.15, sat: 1.3, temp: -0.1, sharp: 0.75, 
      toneAmt: 0.5, shadow: [0.44, 0.54, 0.66], high: [0.6, 0.56, 0.5] } },
  { c: 'Jernih', e: '🌅', name: 'Senja Jernih', sw: ['#ffb066', '#ff5a7a'], p: {
      contrast: 1.15, sat: 1.3, temp: 0.45, sharp: 0.65, vig: 0.18,
      toneAmt: 0.8, shadow: [0.46, 0.46, 0.58], high: [0.7, 0.52, 0.38] } },
  { c: 'Jernih', e: '🏙️', name: 'Kota Malam', sw: ['#16214a', '#ff9a3a'], p: {
      exposure: 0.1, contrast: 1.25, sat: 1.2, sharp: 0.8, vig: 0.3,
      toneAmt: 1.0, shadow: [0.38, 0.5, 0.62], high: [0.66, 0.52, 0.38] } },
  { c: 'Jernih', e: '🍵', name: 'Matcha', sw: ['#cfe8b0', '#6a9a4a'], p: {
      exposure: 0.08, sat: 1.1, tint: 0.25, temp: 0.05, fade: 0.06, sharp: 0.55, contrast: 1.05 } },
  { c: 'Jernih', e: '📷', name: 'Analog Jernih', sw: ['#f0dcb4', '#7a9a8a'], p: {
      contrast: 1.08, sat: 1.05, temp: 0.15, sharp: 0.7, fade: 0.05, vig: 0.15,
      toneAmt: 0.4, shadow: [0.46, 0.52, 0.56], high: [0.6, 0.53, 0.44] } },
  { c: 'Jernih', e: '🧊', name: 'Es Biru', sw: ['#d4f0ff', '#4a8ac8'], p: {
      exposure: 0.08, contrast: 1.12, sat: 1.1, temp: -0.45, sharp: 0.7,
      toneAmt: 0.6, shadow: [0.42, 0.52, 0.68], high: [0.54, 0.58, 0.64] } },
  { c: 'Jernih', e: '🌲', name: 'Hijau Hutan', sw: ['#9ad08a', '#1f5a3a'], p: {
      contrast: 1.15, sat: 1.25, tint: 0.3, temp: 0.05, sharp: 0.7, vig: 0.15,
      toneAmt: 0.5, shadow: [0.4, 0.55, 0.5], high: [0.58, 0.56, 0.46] } },
  { c: 'Estetik', e: '🍑', name: 'Pink Haze', sw: ['#ffd9e0', '#f2a9b8'], p: {
      exposure: 0.15, temp: 0.1, tint: -0.2, fade: 0.2, sat: 0.95, sharp: 0.2,
      toneAmt: 0.7, shadow: [0.52, 0.46, 0.54], high: [0.68, 0.52, 0.54] } },

  /* ===== Tambahan ringan (hanya pengolahan warna) ===== */
  { c: 'Jernih', e: '☕', name: 'Krem Hangat', sw: ['#f3e2c6', '#c79a6a'], p: {
      exposure: 0.08, contrast: 1.06, sat: 0.95, temp: 0.3, fade: 0.05, sharp: 0.5,
      toneAmt: 0.5, shadow: [0.48, 0.48, 0.52], high: [0.64, 0.54, 0.42] } },
  { c: 'Jernih', e: '🩵', name: 'Langit Biru', sw: ['#bfe3ff', '#3a86d8'], p: {
      exposure: 0.1, contrast: 1.1, sat: 1.2, temp: -0.2, sharp: 0.6,
      toneAmt: 0.5, shadow: [0.42, 0.5, 0.66], high: [0.54, 0.58, 0.66] } },
  { c: 'Jernih', e: '🌿', name: 'Mint Segar', sw: ['#d2f5e0', '#4cbf8a'], p: {
      exposure: 0.12, sat: 1.05, tint: 0.3, temp: -0.1, fade: 0.05, sharp: 0.5 } },
  { c: 'Jernih', e: '💜', name: 'Lavender', sw: ['#e6d8ff', '#9a7ad8'], p: {
      exposure: 0.1, sat: 1.0, tint: -0.25, temp: -0.15, fade: 0.08, sharp: 0.4,
      toneAmt: 0.6, shadow: [0.5, 0.46, 0.62], high: [0.6, 0.52, 0.66] } },
  { c: 'Jernih', e: '🥭', name: 'Mangga Cerah', sw: ['#ffe27a', '#ff9a2e'], p: {
      exposure: 0.1, contrast: 1.1, sat: 1.35, temp: 0.4, sharp: 0.6 } },
  { c: 'Estetik', e: '🤎', name: 'Mocha', sw: ['#d8b898', '#6b4a35'], p: {
      contrast: 1.12, sat: 0.75, temp: 0.3, fade: 0.12, sharp: 0.4,
      toneAmt: 0.7, shadow: [0.46, 0.4, 0.36], high: [0.66, 0.56, 0.44] } },
  { c: 'Estetik', e: '🧡', name: 'Coral Sunset', sw: ['#ff9a78', '#8a4a9a'], p: {
      contrast: 1.08, sat: 1.25, temp: 0.35, tint: -0.12, sharp: 0.5,
      toneAmt: 0.9, shadow: [0.5, 0.44, 0.62], high: [0.72, 0.52, 0.46] } },
  { c: 'Estetik', e: '🌹', name: 'Dusty Rose', sw: ['#e8b8c0', '#a8707a'], p: {
      exposure: 0.08, sat: 0.8, tint: -0.2, temp: 0.12, fade: 0.15, sharp: 0.3,
      toneAmt: 0.6, shadow: [0.52, 0.46, 0.5], high: [0.68, 0.54, 0.56] } },
  { c: 'Estetik', e: '🍂', name: 'Autumn', sw: ['#e8a85a', '#8a4a2a'], p: {
      contrast: 1.12, sat: 1.1, temp: 0.5, fade: 0.06, sharp: 0.5,
      toneAmt: 0.7, shadow: [0.46, 0.44, 0.4], high: [0.7, 0.54, 0.38] } },
  { c: 'Estetik', e: '🌙', name: 'Midnight Blue', sw: ['#1a2a5a', '#6a8ac8'], p: {
      exposure: -0.15, contrast: 1.2, sat: 0.9, temp: -0.35, vig: 0.3, sharp: 0.5,
      toneAmt: 0.9, shadow: [0.36, 0.44, 0.68], high: [0.5, 0.56, 0.68] } },
  { c: 'Estetik', e: '⚪', name: 'Chrome', sw: ['#e6e8ea', '#6a7078'], p: {
      sat: 0.5, contrast: 1.35, temp: -0.05, sharp: 0.8 } },
  { c: 'Estetik', e: '🖤', name: 'Matte Black', sw: ['#4a4a4e', '#1c1c20'], p: {
      exposure: -0.05, sat: 0.7, contrast: 0.95, fade: 0.3, sharp: 0.3 } },
  { c: 'Estetik', e: '🔷', name: 'Biru Monokrom', sw: ['#a8c4e8', '#2a3a5a'], p: {
      bw: 1, contrast: 1.2, sharp: 0.5, toneAmt: 1.4, shadow: [0.38, 0.44, 0.62], high: [0.52, 0.58, 0.7] } },
  { c: 'Estetik', e: '🍓', name: 'Rosy Cheek', sw: ['#ffc4cc', '#e8707a'], p: {
      exposure: 0.12, contrast: 1.05, sat: 1.15, temp: 0.15, tint: -0.2, fade: 0.05, sharp: 0.4 } },
  { c: 'Lucu', e: '🟣', name: 'Duotone Ungu', sw: ['#1f0a4d', '#f2ccff'], p: {
      duo: 1, duoA: [0.12, 0.04, 0.3], duoB: [0.95, 0.8, 1] } },
  { c: 'Lucu', e: '🟠', name: 'Duotone Oranye', sw: ['#3a0e00', '#ffd980'], p: {
      duo: 1, duoA: [0.2, 0.05, 0.0], duoB: [1, 0.85, 0.5] } },
  { c: 'Lucu', e: '🍀', name: 'Duotone Mint', sw: ['#00262a', '#ccffe6'], p: {
      duo: 1, duoA: [0.0, 0.15, 0.15], duoB: [0.8, 1, 0.9] } },
  { c: 'Lucu', e: '🎈', name: 'Pop Kuning-Biru', sw: ['#1a26a0', '#ffe633'], p: {
      duo: 1, duoA: [0.1, 0.15, 0.6], duoB: [1, 0.9, 0.2], contrast: 1.1 } },
  { c: 'Lucu', e: '🍭', name: 'Pastel Poster', sw: ['#ffc4e0', '#a8d8ff'], p: {
      poster: 6, sat: 1.3, exposure: 0.1 } },
  { c: 'Lucu', e: '🕹️', name: 'Retro 4 Warna', sw: ['#1a0d33', '#ffd9a0'], p: {
      poster: 4, duo: 0.6, duoA: [0.1, 0.05, 0.2], duoB: [1, 0.85, 0.6] } },
  { c: 'Lucu', e: '🔴', name: 'Sinema Merah', sw: ['#000', '#ff5a4d'], p: {
      duo: 0.9, duoA: [0, 0, 0], duoB: [1, 0.35, 0.3], contrast: 1.2 } },

  /* ===== Warna-warni (ringan: hanya pengolahan warna) ===== */
  { c: 'Warna', e: '🌈', name: 'Pelangi Cerah', sw: ['#ff6a8a', '#4ad0ff'], p: { sat: 1.5, contrast: 1.1, sharp: 0.6 } },
  { c: 'Warna', e: '🍥', name: 'Cotton Candy', sw: ['#ffc4dc', '#bcd8ff'], p: { duo: 0.45, duoA: [0.45, 0.5, 0.8], duoB: [1, 0.8, 0.9], sat: 1.2, contrast: 1.05, sharp: 0.5, exposure: 0.1, sat: 1.0 } },
  { c: 'Warna', e: '🦩', name: 'Flamingo', sw: ['#ffb0c8', '#e8508a'], p: { duo: 0.5, duoA: [0.5, 0.1, 0.3], duoB: [1, 0.7, 0.8], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🌊', name: 'Biru Laut', sw: ['#7ad8ff', '#0a5a9a'], p: { duo: 0.5, duoA: [0, 0.1, 0.35], duoB: [0.5, 0.9, 1], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🐸', name: 'Hijau Neon', sw: ['#a8ff5a', '#1a8a3a'], p: { duo: 0.5, duoA: [0, 0.2, 0.05], duoB: [0.7, 1, 0.4], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🍋', name: 'Kuning Lemon', sw: ['#fff27a', '#e8b800'], p: { duo: 0.5, duoA: [0.2, 0.15, 0], duoB: [1, 0.95, 0.4], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🍊', name: 'Oranye Jeruk', sw: ['#ffb050', '#e86a00'], p: { duo: 0.5, duoA: [0.25, 0.05, 0], duoB: [1, 0.7, 0.3], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🍒', name: 'Merah Cherry', sw: ['#ff5a6a', '#9a0a2a'], p: { duo: 0.5, duoA: [0.2, 0, 0.05], duoB: [1, 0.4, 0.45], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🔮', name: 'Ungu Galaxy', sw: ['#b08aff', '#2a0a6a'], p: { duo: 0.5, duoA: [0.15, 0, 0.4], duoB: [0.8, 0.6, 1], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🧿', name: 'Tosca', sw: ['#7af0e0', '#0a7a80'], p: { duo: 0.5, duoA: [0, 0.2, 0.22], duoB: [0.5, 1, 0.95], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🌄', name: 'Sunrise', sw: ['#ffc07a', '#ff7a9a'], p: { duo: 0.45, duoA: [0.4, 0.1, 0.3], duoB: [1, 0.75, 0.5], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🍦', name: 'Ice Cream', sw: ['#fff0e0', '#ffc0d0'], p: { duo: 0.35, duoA: [0.8, 0.65, 0.75], duoB: [1, 0.97, 0.9], sat: 1.2, contrast: 1.05, sharp: 0.5, exposure: 0.15, sat: 0.95 } },
  { c: 'Warna', e: '🥤', name: 'Soda Biru', sw: ['#9ae8ff', '#2a8ad8'], p: { duo: 0.45, duoA: [0, 0.2, 0.4], duoB: [0.7, 0.95, 1], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🌱', name: 'Rumput', sw: ['#b8f07a', '#3a9a2a'], p: { duo: 0.5, duoA: [0.05, 0.2, 0], duoB: [0.75, 1, 0.4], sat: 1.2, contrast: 1.05, sharp: 0.5 } },
  { c: 'Warna', e: '🟥', name: 'Merah Biru', sw: ['#0d1a66', '#ff4d4d'], p: { duo: 1, duoA: [0.05, 0.1, 0.4], duoB: [1, 0.3, 0.3] } },
  { c: 'Warna', e: '🍉', name: 'Semangka', sw: ['#0d4018', '#ff738c'], p: { duo: 1, duoA: [0.05, 0.25, 0.1], duoB: [1, 0.45, 0.55] } },
  { c: 'Warna', e: '🎃', name: 'Teal Jingga', sw: ['#00333d', '#ffa64d'], p: { duo: 1, duoA: [0.0, 0.2, 0.25], duoB: [1, 0.65, 0.3] } },
  { c: 'Warna', e: '🌻', name: 'Bunga Matahari', sw: ['#261a00', '#fff266'], p: { duo: 1, duoA: [0.15, 0.1, 0.0], duoB: [1, 0.95, 0.4] } },
];
const START_PRESET = Math.max(0, PRESETS.findIndex((p) => p.name === 'Jernih Alami'));
const TABS = ['Klasik', 'Jernih', 'Estetik', 'Warna', 'Lucu', 'Stiker'];

/* ---------- Pola stiker (digambar sendiri, dengan blur lembut) ---------- */
const PATTERNS = {
  love: { shapes: ['heart'], n: 70, size: [0.016, 0.045], rgb: '255,255,255' },
  lovePink: { shapes: ['heart'], n: 70, size: [0.016, 0.045], rgb: '255,170,205' },
  stars: { shapes: ['star'], n: 70, size: [0.014, 0.04], rgb: '255,255,255' },
  glitter: { shapes: ['sparkle'], n: 80, size: [0.012, 0.04], rgb: '255,255,255' },
  bubbles: { shapes: ['bubble'], n: 55, size: [0.02, 0.07], rgb: '255,255,255' },
  snow: { shapes: ['snow', 'dot'], n: 90, size: [0.012, 0.04], rgb: '255,255,255' },
  petals: { shapes: ['flower'], n: 55, size: [0.02, 0.055], rgb: '255,255,255' },
  mix: { shapes: ['heart', 'star', 'sparkle', 'bubble'], n: 75, size: [0.016, 0.045], rgb: '255,255,255' },
  bokeh: { shapes: ['dot'], n: 42, size: [0.03, 0.11], rgb: '255,222,160', alpha: [0.18, 0.42], soft: 1 },
  bokehCool: { shapes: ['dot'], n: 42, size: [0.03, 0.11], rgb: '200,225,255', alpha: [0.18, 0.42], soft: 1 },
};
const SHAPES = (() => {
  const heart = new Path2D();
  heart.moveTo(0, -0.2);
  heart.bezierCurveTo(0, -0.5, -0.5, -0.5, -0.5, -0.15);
  heart.bezierCurveTo(-0.5, 0.15, -0.1, 0.3, 0, 0.5);
  heart.bezierCurveTo(0.1, 0.3, 0.5, 0.15, 0.5, -0.15);
  heart.bezierCurveTo(0.5, -0.5, 0, -0.5, 0, -0.2);
  heart.closePath();
  const star = new Path2D();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.21 : 0.5;
    star[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
  }
  star.closePath();
  const sparkle = new Path2D();
  sparkle.moveTo(0, -0.5);
  sparkle.quadraticCurveTo(0.06, -0.06, 0.5, 0);
  sparkle.quadraticCurveTo(0.06, 0.06, 0, 0.5);
  sparkle.quadraticCurveTo(-0.06, 0.06, -0.5, 0);
  sparkle.quadraticCurveTo(-0.06, -0.06, 0, -0.5);
  const dot = new Path2D();
  dot.arc(0, 0, 0.5, 0, Math.PI * 2);
  const flower = new Path2D();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5, x = Math.cos(a) * 0.26, y = Math.sin(a) * 0.26;
    flower.moveTo(x + 0.22, y);
    flower.arc(x, y, 0.22, 0, Math.PI * 2);
  }
  const snow = new Path2D();
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    snow.moveTo(Math.cos(a) * -0.5, Math.sin(a) * -0.5);
    snow.lineTo(Math.cos(a) * 0.5, Math.sin(a) * 0.5);
  }
  return {
    heart: { p: heart, mode: 'fill' }, star: { p: star, mode: 'fill' }, sparkle: { p: sparkle, mode: 'fill' },
    dot: { p: dot, mode: 'fill' }, flower: { p: flower, mode: 'fill' },
    bubble: { p: dot, mode: 'bubble' }, snow: { p: snow, mode: 'stroke' },
  };
})();

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function drawPattern(ctx, name, w, h) {
  const def = PATTERNS[name];
  const rnd = mulberry([...name].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  const m = Math.min(w, h);
  const n = Math.max(60, Math.min(260, Math.round(def.n * 1.7 * (w * h) / 1e6)));
  const cols = Math.ceil(Math.sqrt((n * w) / h)), rows = Math.ceil(n / cols);
  const BIG = w * 2 + 2000;
  const [amin, amax] = def.alpha || [0.3, 0.75];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + rnd()) / cols) * w, y = ((r + rnd()) / rows) * h;
      const s = m * (def.size[0] + rnd() * (def.size[1] - def.size[0]));
      const a = amin + rnd() * (amax - amin);
      const sh = SHAPES[def.shapes[Math.floor(rnd() * def.shapes.length)]];
      const rot = (rnd() - 0.5) * 0.9;
      const blurry = def.soft || rnd() < 0.55; // sebagian benar-benar buram, sebagian tajam dengan glow
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = `rgba(${def.rgb},1)`;
      ctx.shadowBlur = blurry ? s * (0.35 + rnd() * 0.3) : s * 0.22;
      ctx.shadowOffsetX = blurry ? BIG : 0;
      ctx.translate(blurry ? x - BIG : x, y);
      ctx.rotate(rot);
      ctx.scale(s, s);
      ctx.fillStyle = `rgb(${def.rgb})`;
      ctx.strokeStyle = `rgb(${def.rgb})`;
      ctx.lineCap = 'round';
      if (sh.mode === 'fill') ctx.fill(sh.p);
      else if (sh.mode === 'stroke') { ctx.lineWidth = 0.08; ctx.stroke(sh.p); }
      else { ctx.fillStyle = `rgba(${def.rgb},.18)`; ctx.fill(sh.p); ctx.lineWidth = 0.06; ctx.stroke(sh.p); }
      ctx.restore();
    }
  }
}
PRESETS.forEach((p) => { p.c = p.c || 'Klasik'; });
// Tampilan lebih bersih: grain dikecilkan banyak, pudar & vignette dibuat lebih halus.
// (Nilainya tetap bisa dinaikkan lewat slider "Atur Filter".)
PRESETS.forEach((pr) => {
  const q = pr.p;
  if (q.fade) q.fade = +(q.fade * 0.7).toFixed(3);
  if (q.vig) q.vig = +(q.vig * 0.75).toFixed(3);
});

const DECO = {
  sparkle: ['✨', '⭐', '✨'],
  hearts: ['💖', '💕', '💗'],
  flowers: ['🌸', '🌼', '🌷'],
  party: ['🎉', '🎈', '✨'],
};
// posisi relatif [x, y, skala, rotasi] — di pinggir supaya wajah tidak tertutup
const DECO_SPOTS = [
  [0.08, 0.1, 1.0, -0.3], [0.9, 0.12, 0.8, 0.3], [0.5, 0.05, 0.6, 0.1], [0.14, 0.88, 0.8, 0.2],
  [0.87, 0.84, 1.1, -0.2], [0.04, 0.5, 0.6, -0.1], [0.96, 0.48, 0.7, 0.2], [0.3, 0.94, 0.6, 0.3], [0.7, 0.07, 0.6, -0.2],
];

const SLIDERS = [
  ['exposure', 'Cahaya', -1, 1, 0.01],
  ['contrast', 'Kontras', 0.6, 1.6, 0.01],
  ['sat', 'Warna', 0, 2, 0.01],
  ['temp', 'Hangat/Dingin', -1, 1, 0.01],
  ['tint', 'Tint (hijau)', -1, 1, 0.01],
  ['fade', 'Pudar', 0, 1, 0.01],
  ['vig', 'Vignette', 0, 1, 0.01],
  ['sharp', 'Ketajaman', 0, 2, 0.01],
  ['leak', 'Light leak', 0, 1, 0.01],
  ['bulge', 'Cembung/Cekung', -1, 1, 0.01],
  ['swirl', 'Pusaran', -4, 4, 0.01],
  ['pixel', 'Pixel', 0, 200, 1],
  ['poster', 'Posterize', 0, 12, 1],
  ['scan', 'Scanline', 0, 1, 0.01],
  ['duo', 'Duotone', 0, 1, 0.01],
];

/* ---------- Shader ---------- */
const VERT = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uOvl;   // lapisan stiker/tanggal (premultiplied)
uniform float uOvlOn;
uniform vec4 uRect;      // x,y,w,h (uv sumber, origin kiri-atas)
uniform float uMirror;
uniform vec2 uPx;        // 1/lebar, 1/tinggi output
uniform float uTime, uAspect;
uniform float uExposure, uContrast, uSat, uTemp, uTint, uFade, uBw, uVig, uSharp, uLeak, uToneAmt;
uniform vec3 uShadow, uHigh, uDuoA, uDuoB;
uniform float uBulge, uSwirl, uPixel, uPoster, uThermal, uMfx, uDuo, uInvert, uScan, uClock, uLite, uHQ;
in vec2 vUv;
out vec4 o;

float hash(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
const vec3 LUM = vec3(0.299, 0.587, 0.114);

// distorsi ringan pada koordinat (cermin, cembung/cekung, pusaran, pixel)
vec2 warp(vec2 uv){
  vec2 p = uv;
  if (uMfx > 0.5) {
    if (uMfx < 1.5 || uMfx > 2.5) p.x = p.x > 0.5 ? 1.0 - p.x : p.x;
    if (uMfx > 1.5) p.y = p.y > 0.5 ? 1.0 - p.y : p.y;
  }
  if (uBulge != 0.0 || uSwirl != 0.0) {
    vec2 q = (p - 0.5) * vec2(uAspect, 1.0);
    float r = length(q);
    q *= 1.0 - uBulge * (1.0 - smoothstep(0.0, 0.8, r));
    if (uSwirl != 0.0) {
      float a = uSwirl * (1.0 - smoothstep(0.0, 0.7, r));
      float sn = sin(a), cs = cos(a);
      q = mat2(cs, -sn, sn, cs) * q;
    }
    p = q / vec2(uAspect, 1.0) + 0.5;
  }
  if (uPixel > 0.5) {
    vec2 cells = vec2(uPixel * uAspect, uPixel);
    p = (floor(p * cells) + 0.5) / cells;
  }
  return clamp(p, 0.0, 1.0);
}

vec2 srcUv(vec2 uv){
  uv = warp(uv);
  float x = mix(uv.x, 1.0 - uv.x, uMirror);
  return vec2(uRect.x + x * uRect.z, uRect.y + (1.0 - uv.y) * uRect.w);
}
vec3 tex(vec2 uv){ return texture(uTex, srcUv(uv)).rgb; }

// Catmull-Rom 9 sampel: perbesaran mulus & tajam (hanya dipakai saat memperbesar foto)
vec3 texCR(vec2 s){
  vec2 tsz = vec2(textureSize(uTex, 0));
  vec2 pos = s * tsz;
  vec2 c = floor(pos - 0.5) + 0.5;
  vec2 f = pos - c;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (c - 1.0) / tsz, t3 = (c + 2.0) / tsz, t12 = (c + w2 / w12) / tsz;
  vec3 r = vec3(0.0);
  r += texture(uTex, vec2(t0.x,  t0.y )).rgb * w0.x  * w0.y;
  r += texture(uTex, vec2(t12.x, t0.y )).rgb * w12.x * w0.y;
  r += texture(uTex, vec2(t3.x,  t0.y )).rgb * w3.x  * w0.y;
  r += texture(uTex, vec2(t0.x,  t12.y)).rgb * w0.x  * w12.y;
  r += texture(uTex, vec2(t12.x, t12.y)).rgb * w12.x * w12.y;
  r += texture(uTex, vec2(t3.x,  t12.y)).rgb * w3.x  * w12.y;
  r += texture(uTex, vec2(t0.x,  t3.y )).rgb * w0.x  * w3.y;
  r += texture(uTex, vec2(t12.x, t3.y )).rgb * w12.x * w3.y;
  r += texture(uTex, vec2(t3.x,  t3.y )).rgb * w3.x  * w3.y;
  return max(r, 0.0);
}
vec3 texHQ(vec2 uv){ return uHQ > 0.5 ? texCR(srcUv(uv)) : tex(uv); }

void main(){
  vec2 c = vUv - 0.5;
  vec3 col = texHQ(vUv);

  // ketajaman: pratinjau 2 sampel, hasil foto 4 sampel
  if (uSharp > 0.0) {
    vec3 blur;
    if (uLite > 0.5) {
      blur = (tex(vUv + uPx * 0.7) + tex(vUv - uPx * 0.7)) * 0.5;
    } else {
      blur = (tex(vUv + vec2(uPx.x, 0.0)) + tex(vUv - vec2(uPx.x, 0.0))
            + tex(vUv + vec2(0.0, uPx.y)) + tex(vUv - vec2(0.0, uPx.y))) * 0.25;
    }
    col += (col - blur) * uSharp * (uHQ > 0.5 ? 0.8 : 1.6);
  }

  // tone dasar
  col *= exp2(uExposure);
  col = (col - 0.5) * uContrast + 0.5;
  float l = dot(col, LUM);
  col = mix(vec3(l), col, uSat);
  col.r += uTemp * 0.09;  col.b -= uTemp * 0.09;
  col.g += uTint * 0.05;

  // split toning
  l = clamp(dot(col, LUM), 0.0, 1.0);
  vec3 tone = mix(uShadow, uHigh, smoothstep(0.15, 0.85, l));
  col += (tone - 0.5) * uToneAmt * 0.45;

  // pudar (angkat hitam)
  col = mix(vec3(uFade * 0.26), vec3(1.0 - uFade * 0.06), clamp(col, 0.0, 1.0));

  // hitam putih (+ warna nada bila ada)
  l = dot(col, LUM);
  col = mix(col, vec3(l) + (tone - 0.5) * uToneAmt * 0.45 * step(0.99, uBw), uBw);

  // light leak (screen)
  if (uLeak > 0.0) {
    float k1 = 1.0 - smoothstep(0.0, 0.85, length((vUv - vec2(1.0, 0.85)) * vec2(uAspect, 1.0)));
    float k2 = 1.0 - smoothstep(0.0, 0.7, length((vUv - vec2(0.0, 0.1)) * vec2(uAspect, 1.0)));
    vec3 lk = vec3(1.0, 0.42, 0.12) * k1 + vec3(0.95, 0.2, 0.35) * k2 * 0.5;
    col = 1.0 - (1.0 - col) * (1.0 - lk * uLeak * 0.75);
  }

  // efek warna lucu (murah: tanpa sampel tambahan)
  if (uInvert > 0.0) col = mix(col, 1.0 - col, uInvert);
  if (uDuo > 0.0) {
    float ld = dot(col, LUM);
    col = mix(col, mix(uDuoA, uDuoB, smoothstep(0.05, 0.95, ld)), uDuo);
  }
  if (uThermal > 0.0) {
    float t = clamp(dot(col, LUM), 0.0, 1.0);
    vec3 th = t < 0.25 ? mix(vec3(0.0, 0.0, 0.15), vec3(0.4, 0.0, 0.6), t / 0.25)
            : t < 0.5  ? mix(vec3(0.4, 0.0, 0.6), vec3(0.9, 0.1, 0.1), (t - 0.25) / 0.25)
            : t < 0.75 ? mix(vec3(0.9, 0.1, 0.1), vec3(1.0, 0.9, 0.1), (t - 0.5) / 0.25)
                       : mix(vec3(1.0, 0.9, 0.1), vec3(1.0), (t - 0.75) / 0.25);
    col = mix(col, th, uThermal);
  }
  if (uPoster > 1.5) col = floor(clamp(col, 0.0, 1.0) * uPoster + 0.5) / uPoster;
  if (uScan > 0.0) col *= 1.0 - uScan * 0.22 * (0.5 + 0.5 * sin(vUv.y * 720.0 * 3.14159265));

  // vignette
  float d = length(c);
  col *= mix(1.0, 1.0 - uVig, smoothstep(0.28, 0.78, d));

  // lapisan stiker/tanggal digabung di GPU (tanpa canvas tambahan / salinan 2D)
  if (uOvlOn > 0.5) {
    vec4 ov = texture(uOvl, vec2(vUv.x, 1.0 - vUv.y));
    col = ov.rgb + col * (1.0 - ov.a);
  }

  // dither anti-banding
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const UNIFORMS = {
  exposure: 'uExposure', contrast: 'uContrast', sat: 'uSat', temp: 'uTemp', tint: 'uTint', fade: 'uFade',
  bw: 'uBw', vig: 'uVig', sharp: 'uSharp', leak: 'uLeak', toneAmt: 'uToneAmt',
  bulge: 'uBulge', swirl: 'uSwirl', pixel: 'uPixel', poster: 'uPoster', thermal: 'uThermal', mfx: 'uMfx',
  duo: 'uDuo', invert: 'uInvert', scan: 'uScan',
};

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.lost = false;
    // GPU mobile sering membuang konteks saat aplikasi di latar belakang: pulihkan, jangan layar hitam
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; });
    canvas.addEventListener('webglcontextrestored', () => {
      try { this.setup(); this.lost = false; if (typeof S !== 'undefined') S.dirty = true; } catch (err) { console.error(err); }
    });
    this.setup();
  }
  setup() {
    const canvas = this.canvas;
    this.loc = {};
    this.tw = this.th = 0;
    const gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 tidak tersedia');
    this.gl = gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    this.prog = prog;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.maxSize = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    // tekstur kedua (unit 1) untuk overlay; diisi 1x1 transparan supaya selalu lengkap
    this.otex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.otex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    this.ovLayer = null; this.ovOn = false;
  }
  // layer = canvas hasil overlayLayer() atau null. Diunggah ke GPU hanya saat layer berganti.
  setOverlay(layer) {
    this.ovOn = !!layer;
    if (!layer || layer === this.ovLayer) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.otex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.activeTexture(gl.TEXTURE0);
    this.ovLayer = layer;
  }
  u(name) {
    if (!(name in this.loc)) this.loc[name] = this.gl.getUniformLocation(this.prog, name);
    return this.loc[name];
  }
  draw(src, rect, w, h, p, mirror, mip) {
    if (this.lost) return false;
    const gl = this.gl;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    const tw = src.videoWidth || src.width, th = src.videoHeight || src.height;
    if (this.tw !== tw || this.th !== th) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      this.tw = tw; this.th = th;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, src); // lebih cepat dari realokasi
    }
    if (mip) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.uniform1i(this.u('uTex'), 0);
    gl.uniform1i(this.u('uOvl'), 1);
    gl.uniform1f(this.u('uOvlOn'), this.ovOn ? 1 : 0);
    gl.uniform4f(this.u('uRect'), rect.x, rect.y, rect.w, rect.h);
    gl.uniform1f(this.u('uMirror'), mirror ? 1 : 0);
    gl.uniform2f(this.u('uPx'), 1 / w, 1 / h);
    gl.uniform1f(this.u('uTime'), Math.random());
    gl.uniform1f(this.u('uAspect'), w / h);
    for (const k in UNIFORMS) gl.uniform1f(this.u(UNIFORMS[k]), k === 'sharp' && this.noSharp ? 0 : p[k]);
    gl.uniform1f(this.u('uClock'), (performance.now() / 1000) % 1000);
    gl.uniform1f(this.u('uLite'), this.lite ? 1 : 0);
    gl.uniform1f(this.u('uHQ'), this.hq ? 1 : 0);
    gl.uniform3fv(this.u('uDuoA'), p.duoA);
    gl.uniform3fv(this.u('uDuoB'), p.duoB);
    gl.uniform3fv(this.u('uShadow'), p.shadow);
    gl.uniform3fv(this.u('uHigh'), p.high);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }
}

/* ---------- Tingkat perangkat ---------- */
// HP lemah (RAM kecil / CPU sedikit) otomatis memakai pengaturan paling ringan; tetap bisa diubah di Pengaturan.
const COARSE = matchMedia('(pointer:coarse)').matches;
const LOW = COARSE && ((navigator.deviceMemory || 4) <= 3 || (navigator.hardwareConcurrency || 8) <= 4);

/* ---------- State ---------- */
const S = {
  params: { ...BASE },
  preset: 0,
  mode: 'camera', // 'camera' | 'image'
  img: null, // ImageBitmap/Image saat mode image
  facing: 'environment',
  isFront: false,
  camRes: LOW ? 'hd' : 'fhd', // pratinjau 1080p supaya ringan; hasil Ultra HD tetap lewat ekspor / mode sensor
  exportSize: matchMedia('(pointer:coarse)').matches ? 'gallery' : 'uhd', // ukuran saat DIUNDUH/DIBAGIKAN; foto di galeri sengaja ringan
  format: 'jpeg',
  ratio: 'native',
  mirror: true,
  grid: false,
  sensor: false, // kualitas maksimal (lebih lambat) — opsional di Pengaturan
  eco: matchMedia('(pointer:coarse)').matches, // mode hemat: pratinjau 720 px, 24 fps
  vidRes: LOW ? '480' : '720', vidAudio: true, shootMode: 'foto',
  autoSave: true, // otomatis unduh ke HP setelah jepret
  date: true, // cap tanggal pada foto (bisa dimatikan langsung di layar kamera)
  dateStyle: 'minimal',
  imgDate: 0,
  sound: true,
  timer: 0,
  dirty: true,
};
const SAVED_KEYS = ['camRes', 'exportSize', 'format', 'ratio', 'mirror', 'grid', 'sensor', 'sound', 'facing', 'eco', 'date', 'dateStyle', 'autoSave', 'vidRes', 'vidAudio'];
try {
  const sv = JSON.parse(localStorage.getItem('camawa4') || '{}');
  SAVED_KEYS.forEach((k) => { if (k in sv) S[k] = sv[k]; });
} catch (e) { /* abaikan */ }
const saveSettings = () => {
  try { localStorage.setItem('camawa4', JSON.stringify(Object.fromEntries(SAVED_KEYS.map((k) => [k, S[k]])))); } catch (e) { /* abaikan */ }
};

const view = $('#view');
const elStage = $('#stage'), elGrid = $('#grid'), elFlash = $('#flash'), elViewer = $('#viewer');
const vctx = view.getContext('2d');
const video = document.createElement('video');
video.playsInline = true;
video.muted = true;
video.setAttribute('playsinline', '');
video.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
document.body.appendChild(video);
let stream = null;
let track = null;
let previewR = null;
let exportR = null;
let glOK = true;

/* ---------- Helpers ---------- */
function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function srcSize() {
  if (S.mode === 'image' && S.img) return [S.img.width, S.img.height];
  return [video.videoWidth, video.videoHeight];
}

function cropInfo(sw, sh, ratio = S.ratio) {
  let r = sw / sh;
  if (ratio !== 'native') {
    const [a, b] = ratio.split(':').map(Number);
    r = a / b;
  }
  let rect;
  if (sw / sh > r) {
    const cw = (sh * r) / sw;
    rect = { x: (1 - cw) / 2, y: 0, w: cw, h: 1 };
  } else {
    const ch = sw / (r * sh);
    rect = { x: 0, y: (1 - ch) / 2, w: 1, h: ch };
  }
  return { rect, pw: rect.w * sw, ph: rect.h * sh };
}

/* ---------- Komposisi (bingkai + cap tanggal) ---------- */
function compose(dst, glc, p) {
  const w = glc.width, h = glc.height;
  let W = w, H = h, ox = 0, oy = 0;
  if (p.frame === 'polaroid') {
    const b = Math.round(w * 0.05);
    W = w + b * 2; H = h + b + Math.round(w * 0.17); ox = b; oy = b;
  } else if (p.frame === 'film') {
    const bh = Math.round(h * 0.09), sb = Math.round(w * 0.02);
    W = w + sb * 2; H = h + bh * 2; ox = sb; oy = bh;
  }
  if (dst.width !== W || dst.height !== H) { dst.width = W; dst.height = H; }
  const ctx = dst.getContext('2d', { alpha: false });
  if (p.frame === 'polaroid') {
    ctx.fillStyle = '#f3efe6';
    ctx.fillRect(0, 0, W, H);
  } else if (p.frame === 'film') {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    const bh = oy, hw = bh * 0.34, hh = bh * 0.48, gap = bh * 0.95;
    ctx.fillStyle = '#e9e2cf';
    for (let x = gap * 0.5; x < W - hw; x += gap) {
      [bh * 0.26, H - bh * 0.26 - hh].forEach((y) => {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, hw, hh, hw * 0.25) : ctx.rect(x, y, hw, hh);
        ctx.fill();
      });
    }
  }
  ctx.drawImage(glc, ox, oy, w, h);
  const ov = overlayLayer(p, w, h);
  if (ov) ctx.drawImage(ov, ox, oy, w, h);
  if (p.date) {
    if (p.frame === 'polaroid') drawPolaroidDate(ctx, w, h, ox, oy, p);
    else if (!(ov && ov.width === w)) drawDate(ctx, w, h, ox, oy, p); // overlay resolusi penuh sudah memuat tanggal
  }
}

// Pola & stiker digambar SEKALI dengan resolusi rendah (maks 1400 px, cukup karena memang buram) lalu
// diskalakan. Cap tanggal digambar tajam langsung di ukuran akhir.
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DATE_STYLES = { minimal: 'Minimal', digicam: 'Digicam', elegan: 'Elegan', tulisan: 'Tulisan tangan', film: 'Film' };
const HAND_FONT = '"Segoe Script","Bradley Hand","Brush Script MT","Dancing Script",cursive';

// teks dengan jarak antar huruf (letter-spacing) yang bekerja di semua browser
function spaced(ctx, text, x, y, sp, align) {
  const chars = [...text], ws = chars.map((ch) => ctx.measureText(ch).width);
  const total = ws.reduce((t, v) => t + v, 0) + sp * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += ws[i] + sp; });
  ctx.textAlign = prev;
}

function dateParts(p) {
  const d = new Date((p && p.dateTime) || Date.now()), pad = (n) => String(n).padStart(2, '0');
  return { d, dd: pad(d.getDate()), mm: pad(d.getMonth() + 1), yy: String(d.getFullYear()).slice(2), yyyy: d.getFullYear(),
           hh: pad(d.getHours()), mi: pad(d.getMinutes()) };
}

// tanggal di dalam area foto (ox,oy = sudut kiri-atas foto, w,h = ukuran foto)
function drawDate(ctx, w, h, ox, oy, p) {
  const t = dateParts(p), u = Math.min(w, h), st = (p && p.dateStyle) || 'minimal';
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  if (st === 'digicam' || st === 'film') {
    const fs = Math.max(12, Math.round(u * 0.05));
    ctx.font = 'bold ' + fs + 'px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(255,110,0,.85)'; ctx.shadowBlur = fs * 0.4;
    ctx.fillStyle = '#ff9d2e';
    const txt = "'" + t.yy + ' ' + t.mm + ' ' + t.dd + (st === 'film' ? '   ' + t.hh + ':' + t.mi : '');
    ctx.fillText(txt, ox + w - fs * 0.9, oy + h - fs * 0.9);
  } else if (st === 'minimal') {
    const fs = Math.max(11, Math.round(u * 0.03));
    ctx.font = '300 ' + fs + 'px "Helvetica Neue",Helvetica,Arial,sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = fs * 0.6;
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    spaced(ctx, t.dd + ' · ' + t.mm + ' · ' + t.yyyy, ox + w / 2, oy + h - fs * 1.8, fs * 0.38, 'center');
  } else if (st === 'elegan') {
    const fs = Math.max(12, Math.round(u * 0.042));
    ctx.font = 'italic ' + fs + 'px Georgia,"Times New Roman",serif';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = fs * 0.5;
    ctx.fillStyle = '#fff6e6';
    ctx.fillText(t.d.getDate() + ' ' + BULAN[t.d.getMonth()] + ' ' + t.yyyy, ox + w - fs * 0.9, oy + h - fs * 0.9);
  } else { // tulisan tangan
    const fs = Math.max(14, Math.round(u * 0.062));
    ctx.font = fs + 'px ' + HAND_FONT;
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = fs * 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.translate(ox + fs * 0.8, oy + h - fs * 0.8);
    ctx.rotate(-0.05);
    ctx.fillText(t.d.getDate() + ' ' + BULAN[t.d.getMonth()].slice(0, 3) + ' ' + t.yyyy, 0, 0);
  }
  ctx.restore();
}

// bingkai Polaroid: tanggal ditulis tangan di bagian putih bawah
function drawPolaroidDate(ctx, w, h, ox, oy, p) {
  const t = dateParts(p), strip = Math.round(w * 0.17), fs = Math.round(strip * 0.34);
  ctx.save();
  ctx.font = fs + 'px ' + HAND_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3b342e';
  ctx.translate(ox + w / 2, oy + h + strip * 0.5);
  ctx.rotate(-0.03);
  ctx.fillText(t.d.getDate() + ' ' + BULAN[t.d.getMonth()] + ' ' + t.yyyy, 0, 0);
  ctx.restore();
}

// Pola & stiker digambar SEKALI dengan resolusi rendah (maks 1400 px, cukup karena memang buram) lalu
// diskalakan. Tanggal digambar tajam di ukuran akhir (di overlay hanya bila ukurannya tidak diperkecil).
let ovCache = { key: '', cv: null };
function overlayLayer(p, w, h, full) {
  const hasPat = p.pat && PATTERNS[p.pat], hasDeco = p.deco && DECO[p.deco];
  const k = full ? 1 : Math.min(1, 1400 / Math.max(w, h));
  const dateHere = p.date && k === 1 && p.frame !== 'polaroid';
  if (!hasPat && !hasDeco && !dateHere) return null;
  const lw = Math.round(w * k), lh = Math.round(h * k);
  const key = [p.pat, p.deco, dateHere, p.dateStyle, Math.floor(((p.dateTime) || Date.now()) / 60000), lw, lh].join('|');
  if (ovCache.key === key) return ovCache.cv;
  const cv = document.createElement('canvas');
  cv.width = lw; cv.height = lh;
  const ctx = cv.getContext('2d');
  if (hasPat) drawPattern(ctx, p.pat, lw, lh);
  if (hasDeco) {
    const set = DECO[p.deco];
    const base = Math.min(lw, lh) * 0.12;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    DECO_SPOTS.forEach(([x, y, kk, rot], i) => {
      ctx.save();
      ctx.translate(x * lw, y * lh);
      ctx.rotate(rot);
      ctx.font = Math.round(base * kk) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      ctx.fillText(set[i % set.length], 0, 0);
      ctx.restore();
    });
  }
  if (dateHere) drawDate(ctx, lw, lh, 0, 0, p);
  ovCache = { key, cv };
  return cv;
}

/* ---------- Loop pratinjau ---------- */
// Resolusi pratinjau menyesuaikan diri: turun otomatis kalau perangkat kewalahan.
const perfCeil = () => (S.eco ? (LOW ? 540 : 720) : COARSE ? 960 : 1280);
const PERF = { max: perfCeil(), last: 0, drawn: 0, ema: 16, calm: 0, cool: 0, t0: 0, n: 0, base: 1e9, cpu: 0, lastDown: 0, lastUp: 0, upWait: 20000, camDowned: false };
let exportBusy = 0; // >0 saat ekspor foto sedang jalan (adaptasi kualitas pratinjau dijeda)
let newFrame = true;
const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
if (hasRVFC) {
  // Render dipicu langsung oleh kedatangan frame kamera -> ritme frame rata (tidak ikut jitter rAF).
  const cb = (t) => { newFrame = true; video.requestVideoFrameCallback(cb); render(performance.now()); };
  video.requestVideoFrameCallback(cb);
}

// Turun cepat bila tersendat, naik sangat hati-hati (tiap perubahan ukuran canvas = hentakan kecil).
function camDown() {
  if (PERF.camDowned || !track || S.mode !== 'camera' || video.videoWidth <= 1300) return false;
  PERF.camDowned = true;
  const asp = video.videoWidth / video.videoHeight;
  track.applyConstraints({ width: { ideal: 1280 }, height: { ideal: Math.round(1280 / asp) } })
    .then(() => toast('Kamera diturunkan ke HD supaya lancar')).catch(() => {});
  return true;
}
function tunePerf(now) {
  if (REC.on) { PERF.last = now; return; }
  const dt = Math.min(100, now - PERF.last);
  PERF.last = now;
  if (document.hidden || dt <= 0 || PERF.cool > now || exportBusy) return;
  if (!PERF.t0) PERF.t0 = now;
  if (now - PERF.t0 < 2500) return; // pemanasan kamera & shader: jangan dinilai
  PERF.ema = PERF.n++ ? PERF.ema * 0.92 + dt * 0.08 : dt;
  if (PERF.n > 60 && PERF.ema > 6) PERF.base = Math.min(PERF.base, PERF.ema); // refresh rate layar (60/90/120 Hz atau hemat daya 30 Hz)
  const base = Math.min(PERF.base, 40), floor = LOW ? 400 : 480;
  const bad = PERF.n > 60 && (PERF.ema > Math.max(26, base * 1.6) || PERF.cpu > 11);
  if (bad) {
    if (PERF.cpu > 11 && camDown()) { /* unggah video 1080p terlalu mahal: kecilkan kamera */ }
    else if (PERF.max > floor) PERF.max = Math.max(floor, Math.round(PERF.max * 0.8 / 16) * 16);
    else camDown();
    if (now - PERF.lastUp < 15000) PERF.upWait = Math.min(PERF.upWait * 2, 300000); // naik tadi gagal -> tunggu lebih lama
    PERF.lastDown = now; PERF.ema = base; PERF.cpu = 0; PERF.calm = 0; PERF.cool = now + 2500;
  } else if (PERF.ema < base * 1.15 + 3 && PERF.cpu < 5) {
    if (++PERF.calm > 600 && PERF.max < perfCeil() && now - PERF.lastDown > PERF.upWait) {
      PERF.max = Math.min(perfCeil(), Math.round(PERF.max * 1.2 / 16) * 16);
      PERF.lastUp = now; PERF.calm = 0; PERF.cool = now + 2500;
    }
  } else PERF.calm = 0;
}

const ovl = $('#ovl');

let fitKey = '', ovW = 0, ovH = 0, ovT = 0, ovCur = null;
function fitView() {
  const st = elStage, gc = previewR.canvas;
  const cur = gc.hidden ? view : gc;
  if (!cur.width || !cur.height) return;
  const cw = st.clientWidth, ch = st.clientHeight, a = cur.width / cur.height;
  const key = cw + '|' + ch + '|' + cur.width + '|' + cur.height;
  if (key === fitKey) return;
  fitKey = key;
  const w = Math.min(cw, ch * a), h = w / a;
  [view, gc, ovl, elGrid, elFlash].forEach((el) => { el.style.width = w + 'px'; el.style.height = h + 'px'; });
}
// ResizeObserver lebih akurat di HP (bilah alamat naik-turun, rotasi layar) daripada event resize
if ('ResizeObserver' in window) new ResizeObserver(() => { fitKey = ''; S.dirty = true; }).observe(elStage);
else window.addEventListener('resize', () => { fitKey = ''; S.dirty = true; });

function frame(now) {
  requestAnimationFrame(frame);
  if (!glOK || !previewR || previewR.lost) return;
  if (!elViewer.hidden && !REC.on) { PERF.last = now; return; }
  tunePerf(now);
  render(now); // untuk mode foto / perubahan filter; kamera sudah dirender oleh rVFC (di sini langsung berhenti bila tak ada yang baru)
}

function render(now) {
  if (!glOK || !previewR || previewR.lost) return;
  if (!elViewer.hidden && !REC.on) return; // galeri menutupi layar: jangan buang GPU/baterai
  let src = null;
  if (S.mode === 'camera') {
    if (video.readyState >= 2 && video.videoWidth) {
      if (hasRVFC && !newFrame && !S.dirty) return; // tidak ada frame baru -> jangan render ulang
      src = video;
    }
  } else if (S.img && S.dirty) {
    src = S.img;
  }
  if (!src) return;
  PERF.drawn = now;
  newFrame = false;
  const wasDirty = S.dirty;
  S.dirty = false;
  const [sw, sh] = srcSize();
  const { rect, pw, ph } = cropInfo(sw, sh);
  const sc = Math.min(1, PERF.max / Math.max(pw, ph));
  const w = Math.max(2, Math.round(pw * sc / 2) * 2), h = Math.max(2, Math.round(ph * sc / 2) * 2);
  const mirror = S.mode === 'camera' && S.isFront && S.mirror;
  try {
    // stiker/tanggal masuk ke shader (dihitung ulang hanya bila perlu, bukan membuat string kunci tiap frame)
    if (S.params.frame === 'none') {
      if (wasDirty || w !== ovW || h !== ovH || now - ovT > 1000) { ovW = w; ovH = h; ovT = now; ovCur = overlayLayer(S.params, w, h, true); }
    } else ovCur = null;
    previewR.setOverlay(ovCur);
    // mipmap saat sumber jauh lebih besar dari pratinjau (mencegah gerigi/glitch)
    // (ambang 2x: generateMipmap tiap frame mahal di GPU HP, selisih visual kecil di bawah 2x)
    const t0 = performance.now();
    if (!previewR.draw(src, rect, w, h, S.params, mirror, sw > w * (S.mode === 'image' ? 1.4 : 3))) return;
    if (S.mode === 'camera') PERF.cpu = PERF.cpu * 0.9 + (performance.now() - t0) * 0.1;
    // tanpa bingkai/overlay: tampilkan canvas WebGL langsung (hemat satu salinan per frame)
    const p = S.params, gc = previewR.canvas;
    if (p.frame === 'none') {
      gc.hidden = false; view.hidden = true; // tampilkan canvas WebGL langsung
    } else { // bingkai Polaroid/film: perlu digabung (lebih berat)
      compose(view, gc, p);
      view.hidden = false; gc.hidden = true;
    }
    fitView();
    if (REC.on) recDraw(p, gc);
  } catch (e) { console.error(e); }
}

/* ---------- Kamera ---------- */
const RES = { max: [4096, 2160], '4k': [3840, 2160], fhd: [1920, 1080], hd: [1280, 720] };

// Bentuk (aspek) kamera = bentuk hasil foto. "Asli" = 4:3 seperti kamera bawaan HP.
function streamAspect() {
  const r = S.ratio;
  if (r === '16:9' || r === '9:16') return 16 / 9;
  if (r === '3:2') return 3 / 2;
  return 4 / 3;
}
function camSize() {
  const rw = (RES[S.camRes] || RES.fhd)[0], asp = streamAspect();
  const cap = S.camRes === 'fhd' || S.camRes === 'hd'; // jangan diam-diam memakai 4K
  const dim = (v) => (cap ? { ideal: v, max: 2560 } : { ideal: v });
  return { width: dim(rw), height: dim(Math.round(rw / asp)), aspectRatio: { ideal: asp }, frameRate: { ideal: 30 } };
}

function showMsg(text) {
  $('#msgText').textContent = text;
  $('#msg').hidden = false;
}

function stopCamera() {
  if (track) track.onended = null;
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null; track = null;
  video.srcObject = null;
}

let camGen = 0;
async function startCamera() {
  const gen = ++camGen;
  stopCamera();
  $('#msg').hidden = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMsg('Browser ini tidak mendukung akses kamera, atau halaman tidak dibuka lewat HTTPS. Kamu tetap bisa membuka foto dari galeri.');
    return;
  }
  S.streamAsp = streamAspect();
  try {
    const st0 = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: S.facing }, ...camSize() },
    });
    if (gen !== camGen || S.mode !== 'camera') { st0.getTracks().forEach((t) => t.stop()); return; } // ada permintaan lebih baru
    stream = st0;
  } catch (e) {
    if (gen !== camGen) return;
    const denied = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
    showMsg(denied
      ? 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan browser, lalu coba lagi.'
      : 'Kamera tidak ditemukan atau sedang dipakai aplikasi lain.');
    return;
  }
  track = stream.getVideoTracks()[0];
  track.onended = () => {
    if (gen !== camGen || S.mode !== 'camera') return;
    stopRecording();
    showMsg('Kamera terputus (mungkin dipakai aplikasi lain atau ada panggilan masuk). Tekan "Coba lagi".');
  };
  if (S.camRes === 'max' && track.getCapabilities) {
    try {
      const caps = track.getCapabilities();
      if (caps.width && caps.height) {
        await track.applyConstraints({ width: { ideal: caps.width.max }, height: { ideal: caps.height.max }, aspectRatio: { ideal: streamAspect() } });
      }
    } catch (e) { /* tetap pakai resolusi default */ }
  }
  const st = track.getSettings ? track.getSettings() : {};
  S.isFront = st.facingMode ? st.facingMode === 'user' : S.facing === 'user';
  if (gen !== camGen) return;
  video.srcObject = stream;
  try { await video.play(); } catch (e) { /* diabaikan */ }
  S.mode = 'camera';
  PERF.t0 = 0; PERF.n = 0; PERF.cpu = 0; PERF.camDowned = false;
  $('#btnBackCam').hidden = true;
  const upd = () => {
    if (video.videoWidth) $('#resInfo').textContent = `${video.videoWidth}×${video.videoHeight}`;
  };
  video.onloadedmetadata = upd;
  upd();
}

async function flipCamera() {
  S.facing = S.facing === 'user' ? 'environment' : 'user';
  saveSettings();
  await startCamera();
}

/* ---------- Rekam video ---------- */
const REC = { on: false, direct: false, w: 0, h: 0, tc: null, tx: null, tcT: 0, mr: null, chunks: [], c: null, x: null, t0: 0, timer: 0, mic: null, lock: null, mime: '', ext: 'webm' };
const VID = { '480': 480, '720': 720, '1080': 1080 }; // sisi PENDEK (4:3 -> 960x720, bukan 1280x960)

function pickMime() {
  const list = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for (const m of list) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { /* lanjut */ } }
  return '';
}

// salin satu frame (canvas WebGL + lapisan stiker/tanggal, atau hasil bingkai) ke canvas rekam
// Jalur langsung (tanpa bingkai): MediaRecorder merekam canvas WebGL itu sendiri, nol salinan per frame.
// Jalur bingkai: gabungan bingkai disalin ke canvas 2D rekam.
function recDraw(p, gc) {
  const src = p.frame === 'none' ? gc : view;
  if (!REC.direct) REC.x.drawImage(src, 0, 0, REC.c.width, REC.c.height);
  const t = performance.now(); // gambar mini galeri: diperbarui jarang (WebGL tidak bisa dibaca setelah frame lewat)
  if (t - REC.tcT > 2000) { REC.tcT = t; REC.tx.drawImage(src, 0, 0, REC.tc.width, REC.tc.height); }
}

function recTick() {
  if (!REC.on) return;
  const sec = Math.floor((performance.now() - REC.t0) / 1000);
  $('#recTime').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  REC.timer = setTimeout(recTick, 500);
}

async function startRecording() {
  if (REC.on || !glOK) return;
  if (S.mode !== 'camera' || !(video.readyState >= 2 && video.videoWidth)) { toast('Kamera belum siap'); return; }
  if (typeof MediaRecorder === 'undefined') { toast('Browser ini belum mendukung rekam video'); return; }
  const mime = pickMime();
  // ukuran rekaman tetap (genap) sesuai bentuk pratinjau
  const [sw, sh] = srcSize();
  const { pw, ph } = cropInfo(sw, sh);
  const T = VID[S.vidRes] || 720, sc = Math.min(1, T / Math.min(pw, ph));
  const w = Math.max(2, Math.round(pw * sc / 2) * 2), h = Math.max(2, Math.round(ph * sc / 2) * 2);
  const L = Math.max(w, h);
  REC.direct = S.params.frame === 'none';
  REC.tc = document.createElement('canvas'); REC.tc.width = 320; REC.tc.height = Math.round(320 * h / w);
  REC.tx = REC.tc.getContext('2d'); REC.tcT = 0;
  PERF.max = L; // pratinjau dirender pada ukuran rekaman, dikunci selama merekam
  PERF.cool = performance.now() + 4000; // jangan biarkan penyetel otomatis mengubah ukuran saat persiapan
  S.dirty = true;
  if (REC.direct) {
    // tunggu 2 frame supaya canvas WebGL sudah berukuran final sebelum perekam menangkapnya
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    REC.w = previewR.canvas.width; REC.h = previewR.canvas.height;
  } else {
    REC.c = document.createElement('canvas'); REC.c.width = w; REC.c.height = h;
    REC.x = REC.c.getContext('2d', { alpha: false });
    REC.w = w; REC.h = h;
  }
  // suara (opsional): jika izin ditolak, video tetap direkam tanpa suara
  REC.mic = null;
  if (S.vidAudio) {
    try { REC.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false }); }
    catch (e) { toast('Tanpa suara (izin mikrofon tidak diberikan)'); }
  }
  const out = (REC.direct ? previewR.canvas : REC.c).captureStream(30);
  if (REC.mic) REC.mic.getAudioTracks().forEach((t) => out.addTrack(t));
  const opts = { videoBitsPerSecond: T >= 1080 ? 6e6 : T >= 720 ? 3.5e6 : 2e6, audioBitsPerSecond: 128e3 };
  if (mime) opts.mimeType = mime;
  try { REC.mr = new MediaRecorder(out, opts); } catch (e) { REC.mr = new MediaRecorder(out); }
  REC.mime = REC.mr.mimeType || mime || 'video/webm';
  REC.ext = REC.mime.includes('mp4') ? 'mp4' : 'webm';
  REC.chunks = [];
  REC.mr.ondataavailable = (e) => { if (e.data && e.data.size) REC.chunks.push(e.data); };
  REC.mr.onstop = finishRecording;
  S.dirty = true;
  REC.on = true;
  if (!REC.direct) recDraw(S.params, previewR.canvas);
  REC.mr.start(1000);
  try { if (navigator.wakeLock) REC.lock = await navigator.wakeLock.request('screen'); } catch (e) { /* abaikan */ }
  REC.t0 = performance.now();
  document.body.classList.add('recording');
  $('#recTime').textContent = '00:00';
  $('#recBadge').hidden = false;
  recTick();
}

function stopRecording() {
  if (!REC.on) return;
  REC.on = false;
  clearTimeout(REC.timer);
  document.body.classList.remove('recording');
  $('#recBadge').hidden = true;
  try { REC.mr.stop(); } catch (e) { finishRecording(); }
}

async function finishRecording() {
  if (REC.lock) { try { REC.lock.release(); } catch (e) { /* abaikan */ } REC.lock = null; }
  if (REC.mic) { REC.mic.getTracks().forEach((t) => t.stop()); REC.mic = null; }
  PERF.max = perfCeil();
  const dur = performance.now() - REC.t0;
  if (!REC.chunks.length) { toast('Rekaman kosong'); return; }
  const blob = new Blob(REC.chunks, { type: REC.mime.split(';')[0] });
  REC.chunks = [];
  // gambar mini untuk galeri
  const thumb = await new Promise((r) => REC.tc.toBlob(r, 'image/jpeg', 0.7));
  const shot = { blob, w: REC.w, h: REC.h, source: null, hd: null, isVideo: true, dur,
    url: URL.createObjectURL(blob), thumb: URL.createObjectURL(thumb),
    name: 'cam-awa-' + stamp() + '.' + REC.ext };
  shots.push(shot);
  refreshThumb();
  if (S.autoSave) { saveToDevice(shot, { blob, url: shot.url }); toast('Video tersimpan di HP (' + (blob.size / 1048576).toFixed(1) + ' MB)'); }
  else toast('Video tersimpan di galeri');
}

async function onShutter() {
  if (S.shootMode !== 'video') { capture(); return; }
  if (REC.on) { stopRecording(); return; }
  if (busy) return;
  busy = true;
  try {
    if (S.timer > 0) await countdown(S.timer);
    await startRecording();
  } finally { busy = false; }
}

function setShootMode(m) {
  if (REC.on) return;
  S.shootMode = m;
  document.body.classList.toggle('vidmode', m === 'video');
  $('#mdFoto').classList.toggle('on', m === 'foto');
  $('#mdVideo').classList.toggle('on', m === 'video');
  $('#btnShutter').setAttribute('aria-label', m === 'video' ? 'Mulai rekam' : 'Ambil foto');
}

/* ---------- Ambil foto ---------- */
let audioCtx = null;
function shutterSound() {
  if (!S.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    if (!shutterSound.buf) {
      const nb = audioCtx.createBuffer(1, Math.round(audioCtx.sampleRate * 0.12), audioCtx.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      shutterSound.buf = nb;
    }
    const buf = shutterSound.buf;
    const src = audioCtx.createBufferSource();
    const g = audioCtx.createGain();
    g.gain.value = 0.25;
    src.buffer = buf;
    src.connect(g).connect(audioCtx.destination);
    src.start(t);
  } catch (e) { /* abaikan */ }
}

function countdown(n) {
  return new Promise((res) => {
    const el = $('#count');
    let i = n;
    const tick = () => {
      if (i <= 0) { res(); return; }
      el.textContent = i;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
      i--;
      setTimeout(tick, 1000);
    };
    tick();
  });
}

// potong tengah supaya framing sama dengan pratinjau
async function cropToAspect(bmp, vr) {
  const br = bmp.width / bmp.height;
  if (!vr || Math.abs(vr - br) / vr <= 0.01) return bmp;
  let cw = bmp.width, ch = bmp.height;
  if (br > vr) cw = Math.round(bmp.height * vr); else ch = Math.round(bmp.width / vr);
  const out = await createImageBitmap(bmp, Math.round((bmp.width - cw) / 2), Math.round((bmp.height - ch) / 2), cw, ch);
  bmp.close();
  return out;
}

// minta kamera naik ke resolusi tinggi sesaat, ambil frame, lalu kembalikan ke resolusi pratinjau
async function burstHiRes(vr) {
  const before = video.videoWidth * video.videoHeight;
  const caps = (track.getCapabilities && track.getCapabilities()) || {};
  const L = Math.min(4096, Math.max((caps.width && caps.width.max) || 0, (caps.height && caps.height.max) || 0) || 3840);
  const want = vr < 1 ? { width: { ideal: Math.round(L * vr) }, height: { ideal: L } }
                      : { width: { ideal: L }, height: { ideal: Math.round(L / vr) } };
  try {
    await track.applyConstraints({ ...want, aspectRatio: { ideal: vr } });
    await new Promise((res) => {
      const t0 = performance.now();
      const chk = () => {
        if (video.videoWidth * video.videoHeight > before * 1.3 && video.readyState >= 2) { setTimeout(res, 300); return; }
        if (performance.now() - t0 > 1800) { res(); return; }
        setTimeout(chk, 80);
      };
      chk();
    });
    if (video.videoWidth * video.videoHeight > before * 1.3) return await createImageBitmap(video);
    return null;
  } finally {
    try { await track.applyConstraints(camSize()); } catch (e) { /* abaikan */ }
  }
}

async function grabSource() {
  if (S.mode === 'image') return { src: S.img, sw: S.img.width, sh: S.img.height, mirror: false };
  const mirror = S.isFront && S.mirror;
  const vr = video.videoWidth / video.videoHeight;
  if (S.sensor && track) {
    if ('ImageCapture' in window) {
      try {
        const ic = new ImageCapture(track);
        const caps = await ic.getPhotoCapabilities();
        const opt = {};
        if (caps.imageWidth && caps.imageHeight) { opt.imageWidth = caps.imageWidth.max; opt.imageHeight = caps.imageHeight.max; }
        const bmp = await cropToAspect(await createImageBitmap(await ic.takePhoto(opt)), vr);
        return { src: bmp, sw: bmp.width, sh: bmp.height, mirror };
      } catch (e) { /* coba cara lain */ }
    }
    if (video.videoWidth * video.videoHeight < 5e6) {
      try {
        const hi = await burstHiRes(vr);
        if (hi) { const bmp = await cropToAspect(hi, vr); return { src: bmp, sw: bmp.width, sh: bmp.height, mirror }; }
      } catch (e) { /* pakai frame pratinjau */ }
    }
  }
  const sw = video.videoWidth, sh = video.videoHeight;
  let src = video;
  try { src = await createImageBitmap(video); } catch (e) { /* pakai video langsung */ }
  return { src, sw, sh, mirror };
}

function renderExport({ src, sw, sh, mirror, params, ratio, exportSize }) {
  if (!exportR || exportR.lost) exportR = new Renderer(document.createElement('canvas'));
  const { rect, pw, ph } = cropInfo(sw, sh, ratio);
  let scale = 1;
  if (exportSize === 'gallery') scale = Math.min(1, 1920 / Math.max(pw, ph));
  else if (exportSize === 'uhd') scale = 3840 / Math.max(pw, ph);
  else if (exportSize === 'fhd') scale = 1920 / Math.max(pw, ph);
  scale = Math.min(scale, 2); // jangan memperbesar lebih dari 2x: piksel palsu hanya bikin pecah
  exportR.hq = scale > 1.02;
  let w = pw * scale, h = ph * scale;
  const maxSide = Math.min(exportR.maxSize, 8192), maxArea = 16e6;
  const k = Math.min(1, maxSide / Math.max(w, h), Math.sqrt(maxArea / (w * h)));
  w = Math.max(2, Math.round(w * k)); h = Math.max(2, Math.round(h * k));
  exportR.draw(src, rect, w, h, params, mirror, sw > w * 1.5);
  const plain = params.frame === 'none' && !(params.pat && PATTERNS[params.pat]) && !(params.deco && DECO[params.deco]) && !params.date;
  if (plain) return exportR.canvas; // simpan langsung dari canvas WebGL, tanpa salinan besar
  const out = document.createElement('canvas');
  compose(out, exportR.canvas, params);
  return out;
}

// Tombol rana langsung siap lagi setelah frame "diambil"; pemrosesan berat jalan di belakang, berurutan.
let busy = false;
let exportChain = Promise.resolve();
let pendingSaves = 0;

// Render satu foto jadi file. toBlob dipanggil di task yang sama dengan render WebGL (tanpa await di antaranya).
let shrinkTimer = 0;
async function renderToBlob(shot) {
  exportBusy++;
  clearTimeout(shrinkTimer);
  try {
    await new Promise((r) => setTimeout(r, 0)); // beri napas ke UI
    const out = renderExport(shot);
    const w = out.width, h = out.height;
    const mime = shot.format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((r) => out.toBlob(r, mime, 0.92));
    if (!blob) throw new Error('Gagal membuat file');
    if (out !== exportR.canvas) out.width = out.height = 0;
    return { blob, w, h };
  } finally {
    exportBusy--;
    // lepas memori GPU ukuran besar hanya setelah benar-benar menganggur (hindari alokasi ulang antar foto)
    shrinkTimer = setTimeout(() => {
      if (!exportBusy && exportR) { exportR.canvas.width = exportR.canvas.height = 1; ovCache = { key: '', cv: null }; }
    }, 5000);
  }
}

const SIZE_LABEL = { uhd: 'Ultra HD', fhd: 'Full HD', orig: 'resolusi penuh', gallery: 'ukuran cepat' };

// Foto galeri dibuat ringan (cepat). Sumber aslinya disimpan supaya Ultra HD bisa dibuat saat diunduh.
async function saveShot(shot) {
  let keep = null;
  try {
    const r = await renderToBlob({ ...shot, exportSize: 'gallery' });
    if (typeof ImageBitmap !== 'undefined' && shot.src instanceof ImageBitmap) {
      keep = { src: shot.src, sw: shot.sw, sh: shot.sh, mirror: shot.mirror, params: shot.params,
               ratio: shot.ratio, format: shot.format, own: shot.src !== S.img };
    }
    addShot(r.blob, r.w, r.h, keep);
    const added = shots[shots.length - 1];
    const fast = S.exportSize === 'gallery';
    if (S.autoSave) {
      if (keep && !fast) { added.auto = true; autoPending++; updateSaving(); } // Ultra HD disiapkan lalu diunduh otomatis
      else { // mode Cepat (atau tanpa sumber): langsung unduh versi galeri
        saveToDevice(added, { blob: added.blob, url: added.url });
        toast('Tersimpan di HP ' + added.w + '×' + added.h);
      }
    }
    if (!fast) queueHD(added);
    pendingSaves--;
    if (pendingSaves > 0) toast('Tersimpan • ' + pendingSaves + ' lagi diproses…');
    else if (!S.autoSave && S.exportSize !== 'gallery') toast('Tersimpan — ' + SIZE_LABEL[S.exportSize] + ' dibuat saat diunduh');
  } catch (e) {
    pendingSaves--;
    console.error(e);
    toast('Gagal menyimpan foto: ' + (e.message || e));
  } finally {
    if (!keep && shot.src && shot.src.close && shot.src !== S.img) shot.src.close();
  }
}

async function capture() {
  if (busy || !glOK) return;
  if (S.mode === 'camera' && !(video.readyState >= 2 && video.videoWidth)) { toast('Kamera belum siap'); return; }
  busy = true;
  $('#btnShutter').classList.add('busy');
  let source;
  try {
    if (S.timer > 0 && S.mode === 'camera') await countdown(S.timer);
    const f = $('#flash');
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    shutterSound();
    source = await grabSource(); // ambil frame secepatnya
  } catch (e) {
    console.error(e);
    toast('Gagal mengambil foto: ' + (e.message || e));
    return;
  } finally {
    busy = false;
    $('#btnShutter').classList.remove('busy');
  }
  // simpan snapshot pengaturan supaya tidak berubah kalau filter diganti saat diproses
  const when = S.mode === 'image' && S.imgDate ? S.imgDate : Date.now(); // foto dari galeri memakai tanggal filenya
  const shot = { ...source, params: { ...S.params, dateTime: when }, ratio: S.ratio, exportSize: S.exportSize, format: S.format };
  pendingSaves++;
  toast(pendingSaves > 1 ? 'Memproses ' + pendingSaves + ' foto…' : 'Memproses foto…');
  exportChain = exportChain.then(() => saveShot(shot));
}

/* ---------- Galeri ---------- */
const shots = [];
let viewIdx = -1;
function stamp() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function releaseSource(s) {
  if (s.source) {
    if (s.source.own) { try { s.source.src.close(); } catch (e) { /* abaikan */ } }
    s.source = null;
  }
  s.hd = null;
  s.jobs = null;
}
function addShot(blob, w, h, source) {
  const ext = blob.type === 'image/png' ? 'png' : 'jpg';
  shots.push({ blob, w, h, source, hd: null, url: URL.createObjectURL(blob), name: `cam-awa-${stamp()}.${ext}` });
  // simpan sumber hanya untuk 8 foto terakhir agar memori tidak bengkak
  const withSrc = shots.filter((x) => x.source);
  while (withSrc.length > 8) releaseSource(withSrc.shift());
  refreshThumb();
}
function refreshThumb() {
  const last = shots[shots.length - 1];
  $('#thumbImg').src = last ? (last.thumb || last.url) : '';
  if (!last) $('#thumbImg').removeAttribute('src');
  $('#thumbCount').textContent = shots.length || '';
}
function openViewer(i) {
  if (!shots.length) { toast('Belum ada foto'); return; }
  viewIdx = (i + shots.length) % shots.length;
  const s = shots[viewIdx];
  const vv = $('#viewerVid'), vi = $('#viewerImg');
  vv.pause();
  if (s.isVideo) { vi.hidden = true; vv.hidden = false; vv.src = s.url; }
  else { vv.hidden = true; vv.removeAttribute('src'); vi.hidden = false; vi.src = s.url; }
  $('#viewerInfo').textContent = `${viewIdx + 1}/${shots.length} • ${s.isVideo ? 'Video ' : ''}${s.w}×${s.h} • ${(s.blob.size / 1048576).toFixed(1)} MB`;
  $('#viewer').hidden = false;
}
function download(s) {
  const a = document.createElement('a');
  a.href = s.url; a.download = s.name;
  document.body.appendChild(a); a.click(); a.remove();
}

function saveToDevice(s, r) {
  const url = r.url || URL.createObjectURL(r.blob);
  download({ url, name: s.name });
  if (!r.url) setTimeout(() => URL.revokeObjectURL(url), 20000);
  s.saved = true;
}

// indikator kecil (tidak memblokir) saat foto sedang disiapkan & diunduh otomatis
let autoPending = 0;
function updateSaving() {
  $('#saving').hidden = autoPending <= 0;
  $('#savingText').textContent = 'Menyimpan ke HP…' + (autoPending > 1 ? ' (' + autoPending + ')' : '');
}

function showLoading(text) { $('#loadingText').textContent = text; $('#loading').hidden = false; }
function hideLoading() { $('#loading').hidden = true; }

// File untuk diunduh: dirender dari sumber asli dengan ukuran pilihan (Ultra HD dst).
// Satu pekerjaan per ukuran: bila sudah disiapkan di latar belakang, tombol Unduh langsung memakainya.
function hdBlobFor(s) {
  const target = S.exportSize;
  if (!s.source || target === 'gallery') return Promise.resolve({ blob: s.blob, w: s.w, h: s.h, url: s.url, target });
  s.jobs = s.jobs || {};
  if (s.jobs[target]) return s.jobs[target];
  const job = new Promise((resolve, reject) => {
    exportChain = exportChain.then(async () => {
      try {
        if (!s.source) throw new Error('sumber foto sudah dilepas');
        resolve({ ...(await renderToBlob({ ...s.source, exportSize: target })), target });
      } catch (e) { if (s.jobs) delete s.jobs[target]; reject(e); }
    });
  });
  s.jobs[target] = job;
  return job;
}

// Antrean persiapan di latar belakang: jalan hanya saat tidak sedang menjepret / menyimpan / mengunduh.
const hdQueue = [];
let hdRunning = false;
function queueHD(sh) {
  if (!sh || !sh.source) return;
  hdQueue.push(sh);
  pumpHD();
}
async function pumpHD() {
  if (hdRunning) return;
  hdRunning = true;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    while (hdQueue.length) {
      if (pendingSaves > 0 || busy || dlBusy || REC.on) { await sleep(400); continue; }
      const sh = hdQueue.shift();
      if (!sh.source || !shots.includes(sh)) {
        if (sh.auto) { autoPending = Math.max(0, autoPending - 1); updateSaving(); }
        continue;
      }
      await sleep(sh.auto ? 100 : 300); // beri ruang untuk UI dan jepretan berikutnya
      if (pendingSaves > 0 || busy) { hdQueue.unshift(sh); continue; }
      try {
        const r = await hdBlobFor(sh);
        if (sh.auto) {
          saveToDevice(sh, r);
          autoPending = Math.max(0, autoPending - 1); updateSaving();
          toast(autoPending > 0 ? 'Tersimpan di HP • ' + autoPending + ' lagi…' : 'Tersimpan di HP ' + r.w + '×' + r.h);
        }
      } catch (e) {
        if (sh.auto) { autoPending = Math.max(0, autoPending - 1); updateSaving(); toast('Gagal menyimpan otomatis — buka galeri lalu tekan Unduh'); }
      }
    }
  } finally { hdRunning = false; }
}

let dlBusy = false;
async function exportVideo(s, mode) {
  if (mode === 'share') {
    const file = new File([s.blob], s.name, { type: s.blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Cam-Awa' }); } catch (e) { /* dibatalkan */ } }
    else toast('Berbagi tidak didukung, gunakan Unduh');
  } else { saveToDevice(s, { blob: s.blob, url: s.url }); toast('Video diunduh'); }
}

async function exportCurrent(mode) {
  if (dlBusy) return;
  const s = shots[viewIdx];
  if (!s) return;
  dlBusy = true;
  if (s.isVideo) { dlBusy = false; return exportVideo(s, mode); }
  showLoading(s.source ? 'Menyiapkan foto ' + SIZE_LABEL[S.exportSize] + '…' : 'Menyiapkan foto…');
  try {
    await new Promise((r) => setTimeout(r, 60)); // biarkan layar loading tampil dulu
    const r = await hdBlobFor(s);
    if (mode === 'share') {
      const file = new File([r.blob], s.name, { type: r.blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Cam-Awa' }); } catch (e) { /* dibatalkan */ }
      } else toast('Berbagi tidak didukung, gunakan Unduh');
    } else {
      saveToDevice(s, r);
      toast('Diunduh ' + r.w + '×' + r.h + (s.source ? '' : ' (sumber asli sudah dilepas)'));
    }
  } catch (e) {
    console.error(e);
    toast('Gagal menyiapkan foto: ' + (e.message || e));
  } finally {
    hideLoading();
    dlBusy = false;
  }
}

/* ---------- UI ---------- */
function applyPreset(i) {
  S.preset = i;
  S.params = { ...BASE, ...PRESETS[i].p, date: S.date, dateStyle: S.dateStyle };
  if (S.mode === 'image' && S.imgDate) S.params.dateTime = S.imgDate;
  S.dirty = true;
  document.querySelectorAll('.chip').forEach((c, j) => c.classList.toggle('active', j === i));
  if (S.tab !== PRESETS[i].c) showTab(PRESETS[i].c);
  syncControls();
}

const fmt = (k, v) => (SLIDERS.find((s) => s[0] === k)[4] >= 1 ? Number(v).toFixed(0) : Number(v).toFixed(2));

function showTab(tab) {
  S.tab = tab;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.chip').forEach((c) => { c.hidden = c.dataset.tab !== tab; });
}

function syncDateUI() {
  $('#btnDate').classList.toggle('on', S.date);
  $('#btnDate span').textContent = S.date ? 'Tanggal: ON' : 'Tanggal: OFF';
  $('#btnDateStyle').hidden = !S.date;
  $('#btnDateStyle').textContent = DATE_STYLES[S.dateStyle] + ' ›';
  $('#setDate').checked = S.date;
  $('#setDateStyle').value = S.dateStyle;
}
function setDate(on) {
  S.date = on; S.params.date = on; S.dirty = true;
  saveSettings(); syncDateUI();
  toast(on ? 'Tanggal akan ikut di foto' : 'Tanggal tidak ikut di foto');
}
function setDateStyle(st) {
  S.dateStyle = st; S.params.dateStyle = st; S.dirty = true;
  saveSettings(); syncDateUI();
}

function syncControls() {
  SLIDERS.forEach(([k]) => {
    const inp = $(`#sl-${k}`);
    if (inp) { inp.value = S.params[k]; inp.nextElementSibling.textContent = fmt(k, S.params[k]); }
  });
  syncDateUI();
  $('#setFrame').value = S.params.frame;
}

function buildUI() {
  const f = $('#filters');
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.dataset.tab = p.c;
    b.setAttribute('role', 'option');
    b.innerHTML = `<i style="background:linear-gradient(135deg,${p.sw[0]},${p.sw[1]})">${p.e || ''}</i>${p.name}`;
    b.onclick = () => { applyPreset(i); b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); };
    f.appendChild(b);
  });
  const tabs = $('#tabs');
  TABS.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.dataset.tab = t;
    b.textContent = t;
    b.onclick = () => { showTab(t); f.scrollLeft = 0; };
    tabs.appendChild(b);
  });
  showTab(PRESETS[START_PRESET].c);

  const sl = $('#sliders');
  SLIDERS.forEach(([k, label, min, max, step]) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span>${label}</span><input type="range" id="sl-${k}" min="${min}" max="${max}" step="${step}"><output></output>`;
    sl.appendChild(row);
    const inp = row.querySelector('input');
    inp.oninput = () => {
      S.params[k] = parseFloat(inp.value);
      inp.nextElementSibling.textContent = fmt(k, S.params[k]);
      S.dirty = true;
    };
  });

  // pengaturan
  const bind = (id, key, type) => {
    const el = $(id);
    if (type === 'check') el.checked = !!S[key]; else el.value = S[key];
    el.onchange = () => {
      if (REC.on && (key === 'camRes' || key === 'ratio')) { toast('Hentikan rekaman dulu'); el.value = S[key]; return; }
      S[key] = type === 'check' ? el.checked : el.value;
      saveSettings();
      S.dirty = true;
      if (key === 'camRes' && S.mode === 'camera') startCamera();
      if (key === 'ratio' && S.mode === 'camera' && streamAspect() !== S.streamAsp) startCamera();
    };
  };
  bind('#setCamRes', 'camRes'); bind('#setExport', 'exportSize'); bind('#setFormat', 'format');
  bind('#setRatio', 'ratio'); bind('#setMirror', 'mirror', 'check'); bind('#setGrid', 'grid', 'check');
  bind('#setSensor', 'sensor', 'check'); bind('#setSound', 'sound', 'check'); bind('#setEco', 'eco', 'check');
  $('#setEco').addEventListener('change', () => { PERF.max = perfCeil(); });
  $('#setGrid').addEventListener('change', () => $('#grid').classList.toggle('on', S.grid));
  $('#grid').classList.toggle('on', S.grid);
  $('#setDate').onchange = (e) => setDate(e.target.checked);
  $('#setAuto').checked = S.autoSave;
  $('#setAuto').onchange = (e) => { S.autoSave = e.target.checked; saveSettings(); toast(S.autoSave ? 'Foto otomatis terunduh ke HP' : 'Foto tidak diunduh otomatis'); };
  $('#setDateStyle').onchange = (e) => setDateStyle(e.target.value);
  $('#btnDate').onclick = () => setDate(!S.date);
  $('#btnDateStyle').onclick = () => {
    const keys = Object.keys(DATE_STYLES);
    setDateStyle(keys[(keys.indexOf(S.dateStyle) + 1) % keys.length]);
  };
  $('#setFrame').onchange = (e) => {
    if (REC.on && REC.direct && e.target.value !== 'none') { toast('Bingkai tidak bisa diganti saat merekam'); e.target.value = 'none'; return; }
    S.params.frame = e.target.value; S.dirty = true;
  };

  // tombol
  $('#btnShutter').onclick = onShutter;
  $('#mdFoto').onclick = () => setShootMode('foto');
  $('#mdVideo').onclick = () => setShootMode('video');
  $('#setVidRes').value = S.vidRes;
  $('#setVidRes').onchange = (e) => { S.vidRes = e.target.value; saveSettings(); };
  $('#setVidAudio').checked = S.vidAudio;
  $('#setVidAudio').onchange = (e) => { S.vidAudio = e.target.checked; saveSettings(); };
  $('#btnFlip').onclick = () => { if (REC.on) { toast('Hentikan rekaman dulu'); return; } if (S.mode === 'camera') flipCamera(); else toast('Kembali ke kamera dulu'); };
  $('#btnTimer').onclick = () => {
    S.timer = S.timer === 0 ? 3 : S.timer === 3 ? 10 : 0;
    $('#timerLabel').textContent = S.timer;
    $('#btnTimer').classList.toggle('on', S.timer > 0);
  };
  const pick = () => $('#file').click();
  $('#btnOpen').onclick = pick;
  $('#btnOpenMsg').onclick = pick;
  $('#btnRetry').onclick = startCamera;
  $('#btnBackCam').onclick = () => {
    S.mode = 'camera'; S.img = null; S.imgDate = 0; delete S.params.dateTime; startCamera();
  };
  $('#file').onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      let bmp = await createImageBitmap(file);
      const lim = Math.min(previewR ? previewR.maxSize : 4096, 8192), big = Math.max(bmp.width, bmp.height);
      if (big > lim) { // foto raksasa melebihi batas tekstur GPU -> perkecil
        const k = lim / big;
        const nb = await createImageBitmap(bmp, { resizeWidth: Math.round(bmp.width * k), resizeHeight: Math.round(bmp.height * k), resizeQuality: 'high' });
        bmp.close(); bmp = nb;
      }
      if (S.img && S.img.close && !shots.some((x) => x.source && x.source.src === S.img)) { try { S.img.close(); } catch (e2) { /* abaikan */ } }
      S.img = bmp;
      S.imgDate = file.lastModified || Date.now();
      S.params.dateTime = S.imgDate;
    } catch (err) {
      toast('Gambar tidak bisa dibuka'); return;
    }
    stopCamera();
    S.mode = 'image';
    S.dirty = true;
    $('#msg').hidden = true;
    $('#btnBackCam').hidden = false;
    $('#resInfo').textContent = `${S.img.width}×${S.img.height}`;
  };
  $('#btnReset').onclick = () => applyPreset(S.preset);

  const sheet = (id) => {
    const el = $(id);
    ['#adjust', '#settings'].forEach((o) => { if (o !== id) $(o).hidden = true; });
    el.hidden = !el.hidden;
  };
  $('#btnAdjust').onclick = () => sheet('#adjust');
  $('#btnSettings').onclick = () => sheet('#settings');
  document.querySelectorAll('[data-close]').forEach((b) => {
    b.onclick = () => { $('#viewerVid').pause(); $('#adjust').hidden = true; $('#settings').hidden = true; $('#viewer').hidden = true; };
  });

  $('#btnGallery').onclick = () => openViewer(shots.length - 1);
  $('#vPrev').onclick = () => openViewer(viewIdx - 1);
  $('#vNext').onclick = () => openViewer(viewIdx + 1);
  $('#vDownload').onclick = () => exportCurrent('download');
  $('#vShare').onclick = () => exportCurrent('share');
  $('#vDelete').onclick = () => {
    const s = shots.splice(viewIdx, 1)[0];
    releaseSource(s);
    URL.revokeObjectURL(s.url);
    if (s.thumb) URL.revokeObjectURL(s.thumb);
    $('#viewerVid').pause();
    refreshThumb();
    if (!shots.length) $('#viewer').hidden = true; else openViewer(Math.min(viewIdx, shots.length - 1));
  };

  // geser kiri/kanan di galeri (HP)
  let tx = 0, ty = 0;
  const vwrap = $('.viewer-img');
  vwrap.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  vwrap.addEventListener('touchend', (e) => {
    if (e.target.closest && e.target.closest('video')) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) openViewer(viewIdx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input,select,textarea')) return;
    if (e.code === 'Space') {
      if (e.target.closest && e.target.closest('button')) return; // tombol yang difokus menangani sendiri
      e.preventDefault(); if (elViewer.hidden) onShutter();
    }
    if (e.key === 'Escape') document.querySelectorAll('[data-close]')[0].click();
    if (!$('#viewer').hidden) {
      if (e.key === 'ArrowLeft') openViewer(viewIdx - 1);
      if (e.key === 'ArrowRight') openViewer(viewIdx + 1);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopRecording(); if (S.mode === 'camera') stopCamera(); }
    else if (S.mode === 'camera' && !stream) startCamera();
  });
}

/* ---------- Mulai ---------- */
(function init() {
  buildUI();
  applyPreset(START_PRESET); // mulai dengan Jernih Alami
  try {
    const gc = document.createElement('canvas');
    gc.className = 'view';
    gc.hidden = true;
    $('#stage').insertBefore(gc, $('#ovl'));
    previewR = new Renderer(gc);
    previewR.lite = true; // shader pratinjau lebih ringan; ekspor tetap kualitas penuh
    previewR.noSharp = LOW; // HP lemah: lewati ketajaman di pratinjau (hasil foto tetap tajam)
  } catch (e) {
    glOK = false;
    showMsg('Browser ini belum mendukung WebGL2, yang dibutuhkan untuk filter. Coba Chrome, Edge, Firefox, atau Safari versi terbaru.');
    return;
  }
  requestAnimationFrame(frame);
  startCamera();
})();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
