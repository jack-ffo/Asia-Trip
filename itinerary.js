/* ==========================================================================
   Three Weeks East — itinerary data + scroll-driven map
   Plain script (no modules) so the page works straight from file://
   ========================================================================== */

/* --------------------------------------------------------------------------
   DATA
   Coordinates are [lat, lon].
   -------------------------------------------------------------------------- */

const TRIP = {
  start: '2027-05-26',
  end: '2027-06-17',
  days: 23,
};

// label: offset in screen px from the dot; minS: hide the label when the map
// is zoomed out past this many SVG units per pixel (keeps clusters readable).
const CITIES = {
  jfk: { name: 'New York', sub: 'JFK', ll: [40.64, -73.78], label: [10, -9, 'start'], minS: Infinity },
  doh: { name: 'Doha', ll: [25.27, 51.52], label: [10, 14, 'start'], minS: Infinity },
  bkk: { name: 'Bangkok', ll: [13.75, 100.5], label: [11, 15, 'start'], minS: Infinity },
  cnx: { name: 'Chiang Mai', ll: [18.79, 98.98], label: [-11, 4, 'end'], minS: 0.6 },
  han: { name: 'Hanoi', ll: [21.03, 105.85], label: [-11, 15, 'end'], minS: Infinity },
  cbg: { name: 'Cao Bang', ll: [22.67, 106.25], label: [-11, -6, 'end'], minS: 0.12 },
  lhb: { name: 'Lan Ha Bay', ll: [20.73, 107.05], label: [11, 16, 'start'], minS: 0.12 },
  tyo: { name: 'Tokyo', ll: [35.68, 139.69], label: [11, 5, 'start'], minS: Infinity },
  kyo: { name: 'Kyoto', ll: [35.01, 135.77], label: [4, -12, 'start'], minS: 0.25 },
  osa: { name: 'Osaka', ll: [34.69, 135.5], label: [-11, 2, 'end'], minS: 0.05 },
  kix: { name: 'Kansai Airport', ll: [34.43, 135.23], label: [-9, 15, 'end'], minS: 0.05 },
};

// Points that only shape a route. Ones with a name get a small label once seen.
const WAYPOINTS = {
  phongnam: { name: 'Phong Nam valley', ll: [22.8, 106.58], label: [-8, -8, 'end'] },
  nguomngao: { name: 'Nguom Ngao cave', ll: [22.846, 106.703], label: [-6, 14, 'end'] },
  bangioc: { name: 'Ban Gioc falls', ll: [22.856, 106.724], label: [8, -7, 'start'] },
  odawara: { ll: [35.26, 139.15] },
  shizuoka: { ll: [34.97, 138.39] },
  hamamatsu: { ll: [34.7, 137.73] },
  nagoya: { ll: [35.17, 136.88] },
  cbg_n: { ll: [22.74, 106.41] },
  cbg_s: { ll: [22.62, 106.45] },
  halang: { ll: [22.72, 106.66] },
  pier: { ll: [20.79, 106.77] },
  bay_w: { ll: [20.72, 106.93] },
  bay_s: { ll: [20.67, 107.03] },
  bay_e: { ll: [20.72, 107.13] },
  bay_n: { ll: [20.78, 107.12] },
  bay_r1: { ll: [20.7, 107.09] },
  bay_r2: { ll: [20.69, 106.98] },
};

// Route "hops": each is drawn as its own path. kind:
//   curve — gentle arc from → to (bend = sideways bow, fraction of distance)
//   gc    — great-circle, sampled (long flights)
//   via   — smooth curve through a list of points
const ITINERARY = [
  {
    type: 'travel', mode: 'plane', dates: 'May 26 – 27', start: '2027-05-26', end: '2027-05-27',
    place: 'New York → Bangkok', from: 'jfk', to: 'bkk', country: 'th', countryFrom: 'us', color: 'transit',
    arrival: 'Qatar Airways via Doha · about 22 hours with the connection',
    body: 'The long haul out. JFK to Doha overnight, a leg-stretch in Hamad International, then the second flight east over the Arabian Sea and the Bay of Bengal. Bangkok is eleven hours ahead of New York, so the clock does most of the damage — you land late in the evening of the 27th.',
    todo: [
      'Sleep on the Doha leg, stay awake on the Bangkok one',
      'Use the Doha layover to walk, shower and reset',
      'Get an eSIM and a little baht sorted before landing',
      'Pre-book the airport transfer — it will be late',
    ],
    note: 'First night is a write-off. Keep it to a late dinner near the hotel.',
    route: [
      { mode: 'plane', kind: 'gc', from: 'jfk', to: 'doh' },
      { mode: 'plane', kind: 'gc', from: 'doh', to: 'bkk' },
    ],
  },
  {
    type: 'stay', dates: 'May 27 – 30', start: '2027-05-27', end: '2027-05-30', nights: 3,
    place: 'Bangkok', city: 'bkk', country: 'th', color: 'th', zoom: 6.5,
    arrival: 'Arrived by plane from New York, via Doha',
    body: 'Three nights to take the city in the right order: temples in the cool of the morning, the river in the afternoon, and Chinatown’s street food once the sun is down. Everything worth doing here rewards an early start.',
    todo: [
      'Grand Palace and Wat Pho before 9am, ahead of the heat and the tour groups',
      'Cross the Chao Phraya on the little ferry to Wat Arun',
      'Yaowarat (Chinatown) street food at night',
      'A Muay Thai card at Rajadamnern Stadium',
      'Covered shoulders and knees for the Grand Palace',
    ],
    note: 'Skip Khao San Road.',
  },
  {
    type: 'travel', mode: 'plane', dates: 'May 30', start: '2027-05-30', end: '2027-05-30',
    place: 'Bangkok → Chiang Mai', from: 'bkk', to: 'cnx', country: 'th', color: 'th',
    arrival: 'Domestic flight · about 70 minutes',
    body: 'A short hop north into the hills. Flights run all day from both Suvarnabhumi and Don Mueang, so pick whichever airport is kinder to the hotel and take a morning departure to win back half a day.',
    todo: [
      'Morning flight, afternoon in the old city',
      'Chiang Mai airport is about 15 minutes from the old city',
      'Keep liquids in the checked bag — domestic security is still strict',
    ],
    note: 'Alternative: the overnight sleeper train. Roughly 11–13 hours, a lower berth, and you wake up in the north. Slower, but it’s a proper experience and saves a hotel night.',
    route: [{ mode: 'plane', kind: 'curve', from: 'bkk', to: 'cnx', bend: 0.22 }],
  },
  {
    type: 'stay', dates: 'May 30 – Jun 2', start: '2027-05-30', end: '2027-06-02', nights: 3,
    place: 'Chiang Mai', city: 'cnx', country: 'th', color: 'th', zoom: 5,
    arrival: 'Arrived by plane from Bangkok',
    body: 'Slower and greener than Bangkok. The old city is a moated square you can cross on foot, with a temple on nearly every block and the mountain of Doi Suthep watching over it from the west.',
    todo: [
      'Half-day cooking class — most start with a market walk',
      'Doi Suthep at sunset, looking back over the city',
      'Wat Chedi Luang and Wat Phra Singh inside the old walls',
      'Elephant Nature Park — no riding, and book weeks ahead',
      'Khao soi, repeatedly',
    ],
    note: 'Elephant Nature Park sells out. Book it weeks ahead, not days.',
  },
  {
    type: 'travel', mode: 'plane', dates: 'Jun 2', start: '2027-06-02', end: '2027-06-02',
    place: 'Chiang Mai → Hanoi', from: 'cnx', to: 'han', country: 'vn', countryFrom: 'th', color: 'vn',
    arrival: 'Flight, usually connecting via Bangkok',
    body: 'Into Vietnam. Direct flights come and go, so this usually means connecting through Bangkok — budget most of the day and treat it as a travel day.',
    todo: [
      'Check the connection is on one ticket, so a delay is protected',
      'Vietnam e-visa approved and printed before you fly',
      'Change a little money into dong at the airport',
    ],
    route: [{ mode: 'plane', kind: 'curve', from: 'cnx', to: 'han', bend: 0.2 }],
  },
  {
    type: 'stay', dates: 'Jun 2 – 4', start: '2027-06-02', end: '2027-06-04', nights: 2,
    place: 'Hanoi', city: 'han', country: 'vn', color: 'vn', zoom: 3,
    arrival: 'Arrived by plane from Chiang Mai',
    body: 'Two nights in the Old Quarter, where each street was once named for the goods sold on it. Motorbikes, pho steam and tiny plastic stools, with Hoan Kiem Lake in the middle to catch your breath.',
    todo: [
      'The Old Quarter on foot — early morning is best',
      'Train Street: coffee on the tracks as the train squeezes past',
      'Bun cha for lunch, the way Hanoians eat it',
      'Egg coffee, at least once',
      'Hoan Kiem Lake at dusk',
    ],
    note: 'Crossing the street: walk at a steady pace and let the traffic flow around you.',
  },
  {
    type: 'travel', mode: 'van', dates: 'Jun 4', start: '2027-06-04', end: '2027-06-04',
    place: 'Hanoi → Cao Bang', from: 'han', to: 'cbg', country: 'vn', color: 'vn',
    arrival: 'Limousine van · 6–7 hours',
    body: 'North toward the Chinese border. There is no train and no airport, so it’s road only — a limousine van (a converted minibus with big reclining seats) does it in six to seven hours with a stop or two.',
    todo: [
      'Book through the hotel; most vans do door-to-door pickup',
      'Motion-sickness tablets for the last mountain stretch',
      'Download offline maps — signal thins out',
      'Small cash for roadside stops',
    ],
    note: 'No train, no airport — road only.',
    route: [{ mode: 'van', kind: 'curve', from: 'han', to: 'cbg', bend: -0.18 }],
  },
  {
    type: 'loop', mode: 'van', dates: 'Jun 5 – 7', start: '2027-06-05', end: '2027-06-07',
    place: 'Cao Bang loop', city: 'cbg', country: 'vn', color: 'vn',
    arrival: 'Private car, or pillion with a local guide',
    body: 'Three days looping the karst country east of Cao Bang: rice valleys, river caves, and a vast curtain of a waterfall that straddles the border with China. Few foreign visitors make it this far north.',
    todo: [
      'Ban Gioc waterfall — go early, before the day-trippers',
      'Nguom Ngao cave, just up the road from the falls',
      'Phong Nam valley — a green bowl of paddies and limestone',
      'A night in a village homestay to break up the loop',
    ],
    note: 'Riding by private car or pillion with a guide, because US-issued IDPs aren’t valid in Vietnam.',
    route: [{
      mode: 'van', kind: 'via',
      points: ['cbg', 'cbg_n', 'phongnam', 'nguomngao', 'bangioc', 'halang', 'cbg_s', 'cbg'],
    }],
  },
  {
    type: 'travel', mode: 'van', dates: 'Jun 8', start: '2027-06-08', end: '2027-06-08',
    place: 'Cao Bang → Hanoi', from: 'cbg', to: 'han', country: 'vn', color: 'vn',
    arrival: 'Limousine van · 6–7 hours',
    body: 'Back down through the hills to Hanoi for one more night in the city before heading out to the bay.',
    todo: [
      'Morning departure to reach Hanoi by late afternoon',
      'Repack a small overnight bag for the boat',
      'One more bowl of pho for dinner',
    ],
    route: [{ mode: 'van', kind: 'curve', from: 'cbg', to: 'han', bend: -0.18 }],
  },
  {
    type: 'travel', mode: 'boat', dates: 'Jun 9 – 10', start: '2027-06-09', end: '2027-06-10', nights: 1,
    place: 'Lan Ha Bay', from: 'han', to: 'lhb', city: 'lhb', country: 'vn', color: 'vn', camByHop: true,
    arrival: 'Road to the pier, then a private boat overnight',
    body: 'One night on a private boat in Lan Ha Bay, just south of Cat Ba Island. Quieter than Ha Long proper, with the same limestone karsts rising out of jade-green water — and far fewer boats around you.',
    todo: [
      'Kayak between the karsts and into hidden lagoons',
      'Swim off the boat at golden hour',
      'Seafood dinner on deck',
      'Sunrise from the top deck',
    ],
    note: 'Back ashore midday on the 10th.',
    route: [
      { mode: 'van', kind: 'curve', from: 'han', to: 'pier', bend: 0.12 },
      { mode: 'boat', kind: 'via', points: ['pier', 'bay_w', 'bay_s', 'bay_e', 'bay_n', 'bay_r1', 'bay_r2', 'bay_w', 'pier'] },
      { mode: 'van', kind: 'curve', from: 'pier', to: 'han', bend: 0.12 },
    ],
  },
  {
    type: 'travel', mode: 'plane', dates: 'Jun 10 – 11', start: '2027-06-10', end: '2027-06-11',
    place: 'Hanoi → Tokyo', from: 'han', to: 'tyo', country: 'jp', countryFrom: 'vn', color: 'jp',
    arrival: 'Overnight flight · arrive in the morning',
    body: 'Back ashore, a last dinner in Hanoi, then the red-eye to Tokyo. About five hours in the air and two hours of time difference — you land in the morning with the whole day ahead of you.',
    todo: [
      'A proper dinner before the airport',
      'Sleep on the plane — you land into a full day',
      'Add a Suica card to your phone for trains and konbini',
      'Forward big bags from the airport to the hotel',
    ],
    route: [{ mode: 'plane', kind: 'gc', from: 'han', to: 'tyo' }],
  },
  {
    type: 'stay', dates: 'Jun 11 – 14', start: '2027-06-11', end: '2027-06-14', nights: 3,
    place: 'Tokyo', city: 'tyo', country: 'jp', color: 'jp', zoom: 3,
    arrival: 'Arrived by overnight plane from Hanoi',
    body: 'Three nights in the biggest city on earth, which somehow runs quieter than anywhere else on the trip. Pick a few neighborhoods and go deep rather than wide; the trains make everything else easy.',
    todo: [
      'Tsukiji Outer Market for breakfast',
      'Meiji Jingu and a walk through Yoyogi Park',
      'Yanaka and Nezu for a slower, older Tokyo',
      'Shinjuku at night: Omoide Yokocho and Golden Gai',
      'A depachika food hall for a picnic',
    ],
  },
  {
    type: 'travel', mode: 'train', dates: 'Jun 14', start: '2027-06-14', end: '2027-06-14',
    place: 'Tokyo → Kyoto', from: 'tyo', to: 'kyo', country: 'jp', color: 'jp',
    arrival: 'Tokaido shinkansen · about 2h 15m',
    body: 'West along the coast on the shinkansen, past Mount Fuji if the clouds allow. It leaves on the minute and arrives on the minute.',
    todo: [
      'Sit on the right (E seats) for Fuji on the way west',
      'Buy an ekiben — a station bento — before boarding',
      'Oversized bags need a reserved luggage seat',
    ],
    route: [{ mode: 'train', kind: 'via', points: ['tyo', 'odawara', 'shizuoka', 'hamamatsu', 'nagoya', 'kyo'] }],
  },
  {
    type: 'stay', dates: 'Jun 14 – 16', start: '2027-06-14', end: '2027-06-16', nights: 2,
    place: 'Kyoto', city: 'kyo', country: 'jp', color: 'jp', zoom: 1.4,
    arrival: 'Arrived by shinkansen from Tokyo',
    body: 'Rainy season — and that’s fine. Temples and gardens hold up well in rain: the moss turns vivid, the crowds thin out and the stone paths shine.',
    todo: [
      'Fushimi Inari at dawn, before anyone else',
      'Kiyomizu-dera and the lanes of Higashiyama',
      'A moss garden — rain is the best weather for one',
      'Nishiki Market for snacks',
      'Gion and Pontocho at dusk',
    ],
    note: 'Tsuyu (rainy season): pack a proper umbrella. The gardens repay it.',
  },
  {
    type: 'travel', mode: 'train', dates: 'Jun 16', start: '2027-06-16', end: '2027-06-16',
    place: 'Kyoto → Osaka', from: 'kyo', to: 'osa', country: 'jp', color: 'jp',
    arrival: 'Train · about 15 minutes',
    body: 'Barely a hop — fifteen minutes by shinkansen to Shin-Osaka, or a little longer on the JR special rapid straight into the city.',
    todo: [
      'Drop bags at the hotel and head straight out',
      'No reservation needed on the local lines',
    ],
    route: [{ mode: 'train', kind: 'curve', from: 'kyo', to: 'osa', bend: 0.15 }],
  },
  {
    type: 'stay', dates: 'Jun 16 – 17', start: '2027-06-16', end: '2027-06-17', nights: 1,
    place: 'Osaka', city: 'osa', country: 'jp', color: 'jp', zoom: 1.2,
    arrival: 'Arrived by train from Kyoto',
    body: 'One night, and it’s for eating and nightlife. Osaka’s old motto is kuidaore — eat until you drop — and the city still takes it seriously.',
    todo: [
      'Dotonbori after dark',
      'Takoyaki and okonomiyaki, standing up',
      'Kushikatsu in Shinsekai',
      'Kuromon Market',
      'Tiny bars in Ura-Namba',
    ],
    note: 'Eating and nightlife, not a third base. Travel light for one night.',
  },
  {
    type: 'travel', mode: 'plane', dates: 'Jun 17', start: '2027-06-17', end: '2027-06-17',
    place: 'Kansai → New York', from: 'kix', to: 'jfk', country: 'us', countryFrom: 'jp', color: 'transit',
    arrival: 'Train to Kansai Airport, then the flight home',
    body: 'Out to Kansai Airport on its island in Osaka Bay, then east across the Pacific. You cross the date line on the way and land in New York on the same calendar day you left.',
    todo: [
      'Nankai rapi:t or JR Haruka out to the airport',
      'Spend the last yen at the airport',
      'Stay up until bedtime at home to beat the jet lag',
    ],
    note: 'Home same day.',
    route: [
      { mode: 'train', kind: 'curve', from: 'osa', to: 'kix', bend: 0.2 },
      { mode: 'plane', kind: 'gc', from: 'kix', to: 'jfk' },
    ],
  },
];


// What the crew is up to on each leg, in order through the card.
// [pixel scene, caption]. The scene advances as you scroll through the card.
const SCENES = [
  [['plane-day', 'Wheels up at JFK'], ['airport', 'Leg stretch in Doha'], ['plane-night', 'Night flight to Bangkok']],
  [['temple', 'Grand Palace before 9am'], ['ferry', 'Ferry across to Wat Arun'], ['streetfood', 'Yaowarat street food'], ['muaythai', 'Muay Thai at Rajadamnern']],
  [['plane-day', 'Short hop north']],
  [['cooking', 'Cooking class'], ['sunset', 'Doi Suthep at sunset'], ['temple2', 'Wat Chedi Luang'], ['elephants', 'Elephant Nature Park'], ['khaosoi', 'Khao soi, again']],
  [['airport', 'Connecting in Bangkok'], ['plane-dusk', 'Into Vietnam']],
  [['oldquarter', 'Old Quarter on foot'], ['trainstreet', 'Train Street'], ['buncha', 'Bun cha for lunch'], ['coffee', 'Egg coffee'], ['lake', 'Hoan Kiem Lake at dusk']],
  [['van', 'Limousine van north']],
  [['waterfall', 'Ban Gioc waterfall'], ['cave', 'Nguom Ngao cave'], ['valley', 'Pillion through Phong Nam'], ['homestay', 'Homestay night']],
  [['van', 'Back down to Hanoi']],
  [['van', 'Road to the pier'], ['bay', 'Aboard in Lan Ha Bay'], ['kayak', 'Kayaking the karsts'], ['swim', 'Golden hour swim'], ['deckdinner', 'Dinner on deck'], ['sunrise', 'Sunrise from the top deck']],
  [['plane-night', 'Red-eye to Tokyo']],
  [['tsukiji', 'Tsukiji breakfast'], ['shrine', 'Meiji Jingu'], ['yanaka', 'Yanaka backstreets'], ['neon', 'Shinjuku at night'], ['depachika', 'Depachika picnic']],
  [['shinkansen', 'Shinkansen past Fuji']],
  [['inari', 'Fushimi Inari at dawn'], ['kiyomizu', 'Kiyomizu-dera'], ['moss', 'Moss garden in the rain'], ['nishiki', 'Nishiki Market'], ['gion', 'Gion at dusk']],
  [['shinkansen', 'Fifteen minutes to Osaka']],
  [['dotonbori', 'Dotonbori after dark'], ['takoyaki', 'Takoyaki'], ['shinsekai', 'Kushikatsu in Shinsekai'], ['bar', 'Tiny bars in Ura-Namba']],
  [['plane-dusk', 'Leaving Kansai'], ['plane-night', 'Across the Pacific'], ['home', 'Home the same day']],
];

/* --------------------------------------------------------------------------
   PIXEL CREW — four stick-figure friends acting out each stop.
   Everything is drawn with fillRect on a 160×100 canvas, scaled up with
   image-rendering: pixelated. Animation steps at 10 frames per second.
   -------------------------------------------------------------------------- */

const CREW = [
  { name: 'Pink', c: '#ff4fa3', d: '#b8246e' },
  { name: 'Blue', c: '#1fa2ff', d: '#0b5fa8' },
  { name: 'Sunny', c: '#ffc619', d: '#b07d00' },
  { name: 'Violet', c: '#a45cff', d: '#6a2bc0' },
];

const PixelCrew = (function () {
  'use strict';
  const W = 160, H = 100;
  const C = {
    ink: '#1d1b33', navy: '#29366f', night: '#1a1c3a', purple: '#5d275d', plum: '#8b3a7a',
    red: '#e43b44', verm: '#ff4b2b', orange: '#f77622', yellow: '#feae34', gold: '#ffcd4b',
    cream: '#fff3c7', white: '#f4f4f4', green: '#38b764', dkgreen: '#257179', lime: '#a7f070',
    jungle: '#1f7a4a', sky: '#73eff7', blue: '#3b5dc9', lblue: '#41a6f6', pink: '#ff6fb5',
    peach: '#ffb88a', gray: '#94b0c2', dgray: '#566c86', stone: '#b8b0a0', brown: '#8f563b',
    tan: '#d9a066', wood: '#a0522d', teal: '#1fbfae', sea: '#2c9ac9', deep: '#1f5f99',
  };

  let ctx = null, canvas = null, capEl = null;
  let cur = null, curKind = '', changedAt = 0, tick = 0, reduced = false, raf = 0, lastDraw = -1;

  /* ---------- primitives ---------- */
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (x, y, c) => R(x, y, 1, 1, c);
  function L(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    ctx.fillStyle = c;
    for (;;) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  function disk(cx, cy, r, c) {
    for (let y = -r; y <= r; y++) {
      const w = Math.round(Math.sqrt(r * r - y * y + r * 0.8));
      R(cx - w, cy + y, w * 2 + 1, 1, c);
    }
  }
  function dither(x, y, w, h, c, off = 0) {
    ctx.fillStyle = c;
    for (let j = 0; j < h; j++) for (let i = (j + off) % 2; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  }
  function sky(stops, y0 = 0, y1 = H) {
    const n = stops.length, bh = (y1 - y0) / n;
    stops.forEach((c, k) => R(0, y0 + k * bh, W, bh + 1, c));
    for (let k = 1; k < n; k++) dither(0, Math.round(y0 + k * bh) - 1, W, 2, stops[k - 1]);
  }
  function stars(t, n = 26, seed = 7) {
    for (let k = 0; k < n; k++) {
      const x = (k * 53 + seed * 11) % W, y = (k * 29 + seed) % 46;
      if ((k + (t >> 2)) % 7 !== 0) P(x, y, k % 3 ? C.white : C.gold);
    }
  }
  function cloud(x, y, c = C.white, s = 1) {
    R(x, y + 2 * s, 18 * s, 4 * s, c); R(x + 3 * s, y, 8 * s, 3 * s, c); R(x + 9 * s, y - s, 6 * s, 3 * s, c);
  }
  function clouds(t, speed, y, c, count = 4) {
    for (let k = 0; k < count; k++) {
      const x = ((k * 57 - t * speed) % (W + 40) + W + 40) % (W + 40) - 30;
      cloud(x, y + (k % 3) * 9, c, k % 2 ? 1 : 2);
    }
  }
  function water(y, c1, c2, t, h = H - y) {
    R(0, y, W, h, c1);
    for (let k = 0; k < 22; k++) {
      const x = (k * 37 + (t >> 1) * (k % 2 ? 1 : -1) * 2 + 400) % W;
      const yy = y + 2 + ((k * 13) % Math.max(2, h - 3));
      R(x, yy, 4 + (k % 3) * 2, 1, c2);
    }
  }
  function hills(y, c, amp, freq, phase = 0) {
    ctx.fillStyle = c;
    for (let x = 0; x < W; x++) {
      const h = Math.round(amp * (0.6 + 0.4 * Math.sin((x + phase) * freq) * Math.cos((x + phase) * freq * 0.37)));
      ctx.fillRect(x, y - h, 1, H - y + h);
    }
  }
  function sun(x, y, r, c) { disk(x, y, r, c); }
  function karst(x, base, w, h, c, top) {
    for (let j = 0; j < h; j++) {
      const f = j / h, ww = Math.round(w * (0.55 + 0.45 * Math.sin(f * Math.PI * 0.9 + 0.3)));
      R(x - ww / 2 + Math.round(Math.sin(j * 0.7) * 1), base - j, ww, 1, c);
    }
    if (top) { R(x - w * 0.3, base - h, w * 0.6, 2, top); dither(x - w * 0.35, base - h + 2, w * 0.7, 3, top); }
  }
  function tree(x, y, c = C.green, trunk = C.brown) { R(x, y - 4, 2, 4, trunk); disk(x + 1, y - 7, 3, c); }
  function palm(x, y) { L(x, y, x + 1, y - 12, C.brown); L(x + 1, y - 12, x - 4, y - 9, C.green); L(x + 1, y - 12, x + 6, y - 9, C.green); L(x + 1, y - 12, x - 2, y - 15, C.green); L(x + 1, y - 12, x + 5, y - 15, C.green); }
  function lanterns(y, t, colors = [C.red, C.orange], gap = 14) {
    L(0, y, W, y + 2, C.ink);
    for (let x = 6, k = 0; x < W; x += gap, k++) {
      const sw = ((t + k) >> 2) % 2;
      R(x + sw, y + 2, 4, 5, colors[k % colors.length]); P(x + 1 + sw, y + 3, C.gold);
      if ((t + k * 3) % 11 === 0) R(x - 1 + sw, y + 1, 6, 7, 'rgba(255,220,120,0.35)');
    }
  }
  function steam(x, y, t, n = 3) {
    for (let k = 0; k < n; k++) {
      const yy = y - ((t + k * 4) % 12);
      P(x + k * 2 + (((t + k) >> 1) % 2), yy, 'rgba(255,255,255,0.8)');
    }
  }
  function zzz(x, y, t) {
    const k = t % 16, yy = y - (k >> 1);
    [[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]].forEach(([a, b]) => P(x + a + (k >> 2), yy + b, C.white));
  }
  function word(txt, x, y, c) {
    // 3×5 mini font, just the letters we need
    const G = { H: '101101111101101', O: '111101101101111', M: '101111111101101', E: '111100111100111', J: '001001001101111', F: '111100111100100', K: '101110100110101', X: '101101010101101', '!': '010010010000010', A: '010101111101101', T: '111010010010010', I: '111010010010111', N: '101111111111101', G: '111100101101111', R: '110101110101101', S: '111100111001111', C: '111100100100111', D: '110101101101110', L: '100100100100111', Y: '101101010010010', U: '101101101101111', P: '110101110100100', B: '110101110101110', W: '101101111111101', '1': '010110010010111', '5': '111100111001111', '2': '111001111100111', '3': '111001111001111', '0': '111101101101111', ' ': '000000000000000' };
    let cx = x;
    for (const ch of txt) {
      const g = G[ch] || G[' '];
      for (let i = 0; i < 15; i++) if (g[i] === '1') P(cx + (i % 3), y + ((i / 3) | 0), c);
      cx += 4;
    }
  }

  /* ---------- the friends ---------- */
  const base = () => ({ hip: [0, -6], neck: [0, -11], head: [0, -14], lh: [-3, -7], rh: [3, -7], lf: [-2, 0], rf: [2, 0], oy: 0, x: [] });
  const POSES = {
    stand: (t, i) => { const p = base(); if (((t >> 3) + i) % 5 === 0) p.rh = [4, -15]; return p; },
    walk: (t, i) => {
      const k = (t + i * 2) % 4, s = [-2, 0, 2, 0][k], p = base();
      p.lf = [s, 0]; p.rf = [-s, 0]; p.lh = [-s - (s ? 0 : 1), -7]; p.rh = [s + (s ? 0 : 1), -7]; p.oy = k % 2 ? -1 : 0; return p;
    },
    wave: (t, i) => { const p = base(); p.rh = (t + i) % 4 < 2 ? [3, -16] : [5, -15]; return p; },
    cheer: (t, i) => { const p = base(), k = (t + i) % 4; p.oy = -[0, 1, 3, 1][k]; p.lh = [-4, -16]; p.rh = [4, -16]; p.lf = [-1, 0]; p.rf = [1, 0]; return p; },
    eat: (t, i) => { const p = base(); p.lh = [2, -8]; p.rh = (t + i) % 6 < 3 ? [1, -13] : [4, -9]; p.x.push('bowl'); return p; },
    punch: (t, i) => { const p = base(), k = (t + i) % 4; p.hip = [0, -5]; p.lf = [-3, 0]; p.rf = [3, 0]; p.rh = k < 2 ? [7, -11] : [3, -10]; p.lh = k >= 2 ? [6, -12] : [2, -11]; p.oy = k === 1 ? -1 : 0; return p; },
    stir: (t, i) => { const p = base(), k = (t + i) % 4; p.rh = [5 + [0, 1, 0, -1][k], -8 + [-1, 0, 1, 0][k]]; p.lh = [3, -7]; return p; },
    photo: (t, i) => { const p = base(); p.lh = [3, -12]; p.rh = [4, -12]; p.x.push('camera'); if ((t + i * 7) % 18 === 0) p.x.push('flash'); return p; },
    peace: (t, i) => { const p = base(); p.rh = [3, -16]; p.x.push('v'); p.oy = ((t >> 2) + i) % 2 ? -1 : 0; return p; },
    bow: (t, i) => { const p = base(), k = ((t >> 1) + i) % 6 < 3; if (k) { p.neck = [1, -10]; p.head = [3, -12]; } p.lh = [2, -8]; p.rh = [2, -8]; return p; },
    point: (t, i) => { const p = base(); p.rh = [7, -12 + (((t >> 2) + i) % 2)]; return p; },
    sit: (t, i) => { const p = base(); p.hip = [0, -4]; p.neck = [0, -9]; p.head = [0, -12]; p.lf = [3, 0]; p.rf = [4, 0]; p.lh = [3, -5]; p.rh = [4, -5]; p.x.push('knee'); return p; },
    sitEat: (t, i) => { const p = POSES.sit(t, i); p.lh = [3, -6]; p.rh = (t + i) % 6 < 3 ? [1, -11] : [4, -7]; p.x.push('bowl'); return p; },
    sip: (t, i) => { const p = POSES.sit(t, i); p.rh = ((t >> 1) + i) % 5 < 2 ? [1, -11] : [4, -6]; p.x.push('cup'); return p; },
    paddle: (t, i) => { const p = base(), k = (t + i) % 4 < 2; p.hip = [0, -3]; p.neck = [0, -8]; p.head = [0, -11]; p.lh = k ? [4, -5] : [-1, -7]; p.rh = k ? [-1, -7] : [4, -5]; p.lf = [3, -3]; p.rf = [4, -3]; p.x.push('paddle'); return p; },
    dance: (t, i) => { const p = base(), k = (t + i) % 4; p.lh = k < 2 ? [-4, -15] : [-3, -6]; p.rh = k < 2 ? [3, -6] : [4, -15]; p.hip = [k % 2 ? 1 : -1, -6]; p.oy = k % 2 ? -1 : 0; return p; },
    stretch: (t, i) => { const p = base(), k = ((t >> 2) + i) % 2; p.lh = k ? [-2, -17] : [-3, -7]; p.rh = k ? [3, -7] : [2, -17]; return p; },
    umbrella: (t, i) => { const p = POSES.walk(t, i); p.rh = [2, -14]; p.x.push('umbrella'); return p; },
    ride: (t, i) => { const p = POSES.sit(t, i); p.lh = [4, -8]; p.rh = [5, -8]; p.oy = (t + i) % 3 === 0 ? -1 : 0; return p; },
    swim: (t, i) => { const p = base(), k = (t + i) % 4; p.lh = [[-4, -13], [-5, -10], [-4, -8], [-2, -11]][k]; p.rh = [[4, -8], [2, -11], [4, -13], [5, -10]][k]; p.oy = k % 2 ? 1 : 0; return p; },
    headlamp: (t, i) => { const p = POSES.walk(t >> 1, i); p.x.push('lamp'); return p; },
    skewer: (t, i) => { const p = base(); p.rh = (t + i) % 6 < 3 ? [2, -13] : [4, -10]; p.x.push('stick'); return p; },
    toast: (t, i) => { const p = base(); p.rh = (t + i) % 8 < 3 ? [4, -14] : [3, -9]; p.x.push('glass'); return p; },
  };

  function head(x, y, i, dir = 1, sleepy = false) {
    const f = CREW[i];
    R(x - 1, y - 2, 3, 1, f.c); R(x - 2, y - 1, 5, 3, f.c); R(x - 1, y + 2, 3, 1, f.c);
    if (sleepy) R(x, y, 2 * dir, 1, f.d); else P(x + dir, y, C.white);
    if (i === 0) { R(x - 2, y - 3, 4, 1, C.navy); R(x - 1, y - 4, 3, 1, C.navy); R(x + (dir > 0 ? 2 : -3), y - 3, 2, 1, C.navy); }
    if (i === 1) { P(x - 3 * dir, y - 1, f.d); P(x - 3 * dir, y, f.d); P(x - 4 * dir, y + 1, f.d); }
    if (i === 2) { P(x + dir, y, C.ink); P(x + 2 * dir, y, C.ink); P(x, y, C.ink); }
    if (i === 3) { P(x - 1, y - 3, f.d); P(x, y - 4, f.d); P(x + 1, y - 3, f.d); }
  }

  function fig(x, y, pose, i, t, dir = 1) {
    const p = (POSES[pose] || POSES.stand)(t, i);
    const f = CREW[i], X = (v) => x + v[0] * dir, Y = (v) => y + v[1] + p.oy;
    if (i === 3 && pose !== 'swim' && pose !== 'paddle') R(X([-3, 0]) - (dir > 0 ? 1 : 0), Y([0, -10]), 2, 4, C.brown);
    L(X(p.neck), Y(p.neck), X(p.hip), Y(p.hip), f.c);
    L(X(p.hip), Y(p.hip), X(p.lf), Y(p.lf), f.c);
    L(X(p.hip), Y(p.hip), X(p.rf), Y(p.rf), f.c);
    if (p.x.includes('knee')) { L(X(p.hip), Y(p.hip), X([3, -4]), Y([3, -4]), f.c); }
    L(X(p.neck), Y(p.neck), X(p.lh), Y(p.lh), f.c);
    L(X(p.neck), Y(p.neck), X(p.rh), Y(p.rh), f.c);
    head(X(p.head), Y(p.head), i, dir);
    for (const e of p.x) {
      if (e === 'bowl') { R(X(p.lh) - 2, Y(p.lh), 5, 1, C.white); R(X(p.lh) - 1, Y(p.lh) + 1, 3, 1, C.white); if (t % 4 === 0) P(X(p.lh), Y(p.lh) - 2, C.white); }
      if (e === 'camera') R(X(p.rh) - (dir > 0 ? 0 : 2), Y(p.rh) - 2, 3, 2, C.ink);
      if (e === 'flash') { const fx = X(p.rh) + 2 * dir, fy = Y(p.rh) - 2; P(fx, fy, C.white); P(fx - 1, fy, C.gold); P(fx + 1, fy, C.gold); P(fx, fy - 1, C.gold); P(fx, fy + 1, C.gold); }
      if (e === 'v') { P(X(p.rh) - 1, Y(p.rh) - 1, f.c); P(X(p.rh) + 1, Y(p.rh) - 1, f.c); }
      if (e === 'cup') { R(X(p.rh) - 1, Y(p.rh) - 1, 2, 2, C.cream); P(X(p.rh), Y(p.rh) - 2, C.gold); }
      if (e === 'paddle') L(X(p.lh) - 3 * dir, Y(p.lh) + 3, X(p.rh) + 3 * dir, Y(p.rh) - 3, C.wood);
      if (e === 'umbrella') { const ux = X(p.rh), uy = Y(p.rh) - 3; R(ux - 5, uy, 11, 1, f.c); R(ux - 4, uy - 1, 9, 1, f.c); R(ux - 2, uy - 2, 5, 1, f.c); L(ux, uy, ux, Y(p.rh), C.ink); }
      if (e === 'lamp') { const hx = X(p.head) + 2 * dir, hy = Y(p.head); for (let k = 1; k < 16; k++) R(hx + k * dir, hy - (k >> 2), 1, 1 + (k >> 1), 'rgba(255,230,120,0.45)'); P(hx, hy - 1, C.gold); }
      if (e === 'stick') { L(X(p.rh), Y(p.rh), X(p.rh) + 2 * dir, Y(p.rh) - 4, C.tan); P(X(p.rh) + 1 * dir, Y(p.rh) - 2, C.orange); P(X(p.rh) + 2 * dir, Y(p.rh) - 3, C.orange); }
      if (e === 'glass') { R(X(p.rh) - 1, Y(p.rh) - 3, 2, 3, C.gold); P(X(p.rh) - 1, Y(p.rh) - 3, C.white); }
    }
  }
  function sleeper(x, y, i, t) {
    // lying down, on a seat back or the deck
    const f = CREW[i];
    L(x - 3, y, x + 5, y, f.c); L(x + 5, y, x + 9, y + 1, f.c); L(x + 5, y, x + 9, y - 1, f.c);
    head(x - 6, y - 1, i, -1, true); zzz(x - 6, y - 6, t + i * 5);
  }
  const crew = (xs, y, pose, t, dirs = [1, 1, -1, -1]) => xs.forEach((x, i) => fig(x, y, Array.isArray(pose) ? pose[i] : pose, i, t, dirs[i]));

  /* ---------- vehicles for travel scenes ---------- */
  function planeSide(x, y, t, sleepy) {
    const b = (t >> 2) % 2;
    y += b;
    R(x + 8, y, 84, 14, C.white); R(x + 92, y + 2, 6, 10, C.white); R(x + 98, y + 5, 3, 6, C.white);
    R(x + 4, y + 3, 4, 10, C.white); R(x, y - 12, 12, 16, C.white); R(x + 2, y - 12, 8, 3, C.red);
    R(x + 8, y + 10, 90, 2, C.lblue); R(x + 94, y + 3, 3, 3, C.navy);
    R(x + 40, y + 12, 26, 4, C.gray); R(x + 46, y + 16, 12, 5, C.dgray); R(x + 57, y + 17, 2, 3, C.ink);
    for (let k = 0; k < 4; k++) {
      const wx = x + 26 + k * 16;
      R(wx - 4, y + 2, 9, 7, C.sky);
      if (sleepy && k % 2) head(wx, y + 6, k, 1, true); else head(wx, y + 6 + (((t >> 2) + k) % 3 === 0 ? -1 : 0), k, 1, sleepy);
    }
    if (sleepy) zzz(x + 44, y - 8, t);
  }
  function van(x, y, t, c = C.white) {
    const b = t % 4 === 0 ? -1 : 0;
    R(x, y + b, 46, 16, c); R(x + 46, y + 5 + b, 8, 11, c); R(x + 47, y + 6 + b, 5, 5, C.sky);
    R(x + 2, y + 11 + b, 50, 2, C.red);
    for (let k = 0; k < 4; k++) { R(x + 3 + k * 11, y + 2 + b, 9, 7, C.sky); head(x + 7 + k * 11, y + 6 + b, k, 1); }
    for (const wx of [x + 10, x + 42]) { disk(wx, y + 17, 3, C.ink); P(wx + ((t % 2) ? 1 : -1), y + 17, C.gray); }
  }
  function bike(x, y, t, i, guide = true) {
    for (const wx of [x, x + 12]) { disk(wx, y - 2, 2, C.ink); P(wx, y - 2, C.gray); }
    L(x, y - 3, x + 12, y - 3, C.red); R(x + 3, y - 6, 7, 3, C.red); L(x + 11, y - 3, x + 12, y - 9, C.ink);
    if (guide) { const gx = x + 8; L(gx, y - 6, gx, y - 11, C.dgray); L(gx, y - 10, x + 12, y - 9, C.dgray); head(gx, y - 14, 0, 1); R(gx - 2, y - 17, 5, 2, C.dgray); }
    fig(x + 3, y - 1, 'ride', i, t, 1);
  }
  function junk(x, y, t, people = true) {
    const b = (t >> 2) % 2;
    R(x, y + b, 56, 6, C.brown); R(x + 3, y + 6 + b, 50, 2, C.wood); R(x + 10, y - 7 + b, 30, 7, C.cream); R(x + 12, y - 5 + b, 26, 3, C.tan);
    R(x + 18, y - 26 + b, 1, 19, C.ink); R(x + 19, y - 25 + b, 14, 16, C.orange); for (let k = 0; k < 4; k++) R(x + 19, y - 22 + k * 4 + b, 14, 1, C.brown);
    if (people) for (let k = 0; k < 4; k++) fig(x + 42 + (k % 2) * 6 - (k > 1 ? 28 : 0), y - 7 + b, k % 2 ? 'wave' : 'point', k, t, 1);
  }
  function shinkansen(x, y, t) {
    R(x, y, 120, 12, C.white); R(x + 120, y + 3, 10, 9, C.white); R(x + 130, y + 7, 6, 5, C.white);
    R(x, y + 8, 136, 2, C.blue); R(x, y + 11, 136, 1, C.gray);
    for (let k = 0; k < 4; k++) { R(x + 30 + k * 18, y + 2, 10, 5, C.sky); head(x + 35 + k * 18, y + 5, k, 1); }
    R(x + 124, y + 4, 4, 3, C.navy);
  }
  function speedLines(t, y0, y1, c = C.white) {
    for (let k = 0; k < 10; k++) { const x = ((k * 43 - t * 9) % (W + 30) + W + 30) % (W + 30) - 20; R(x, y0 + ((k * 17) % (y1 - y0)), 12, 1, c); }
  }

  /* ---------- places ---------- */
  function skyline(y, c, win) {
    const bs = [[6, 30], [16, 20], [26, 44], [38, 26], [48, 36], [60, 56], [70, 30], [82, 40], [94, 24], [104, 48], [118, 32], [130, 22], [142, 38], [152, 26]];
    bs.forEach(([x, h], k) => { R(x, y - h, 10, h, c); if (k === 5) { R(x + 3, y - h - 8, 4, 8, c); R(x + 4, y - h - 14, 2, 6, c); } if (win) for (let j = 4; j < h - 2; j += 5) for (let i = 2; i < 9; i += 3) if ((i + j + k) % 3) P(x + i, y - h + j, win); });
  }
  function thaiTemple(x, y, gold = true) {
    R(x, y - 10, 44, 10, C.white); for (let k = 0; k < 5; k++) R(x + 4 + k * 8, y - 8, 3, 8, C.gold);
    [[x - 4, 52, C.red], [x + 2, 40, C.orange], [x + 8, 28, C.red]].forEach(([rx, rw, rc], k) => {
      for (let j = 0; j < 6; j++) R(rx + j, y - 16 - k * 6 + j, rw - j * 2, 1, rc);
      R(rx, y - 11 - k * 6, rw, 1, C.gold);
    });
    if (gold) { R(x + 20, y - 40, 4, 8, C.gold); R(x + 21, y - 48, 2, 8, C.gold); P(x + 21, y - 50, C.gold); }
  }
  function chedi(x, y, c = C.gold, w = 22) {
    for (let j = 0; j < 30; j++) { const ww = Math.max(1, Math.round(w * (1 - j / 30) ** 1.4)); R(x - ww / 2, y - j, ww, 1, c); }
    for (let k = 0; k < 3; k++) R(x - w / 2 - 3 + k * 2, y - k * 2, w + 6 - k * 4, 2, k % 2 ? C.stone : C.cream);
  }
  function prang(x, y) {
    for (let j = 0; j < 44; j++) { const ww = Math.max(2, Math.round(20 * (1 - j / 48))); R(x - ww / 2, y - j, ww, 1, j % 6 < 3 ? C.cream : C.stone); if (j % 5 === 0) P(x - ww / 4, y - j, C.pink), P(x + ww / 4, y - j, C.lblue); }
    R(x - 1, y - 50, 2, 6, C.gold);
  }
  function torii(x, y, h = 30, c = C.verm, w = 30) {
    R(x, y - h, 3, h, c); R(x + w - 3, y - h, 3, h, c);
    R(x - 4, y - h - 2, w + 8, 3, c); R(x - 5, y - h - 3, w + 10, 1, C.ink); R(x - 1, y - h + 5, w + 2, 2, c);
  }
  function shophouses(y, t) {
    const cs = [C.yellow, C.pink, C.lblue, C.lime, C.peach, C.teal, C.gold, C.pink];
    for (let k = 0; k < 8; k++) {
      const x = k * 20, h = 44 + (k % 3) * 8;
      R(x, y - h, 20, h, cs[k]); R(x + 3, y - h + 6, 6, 8, C.brown); R(x + 11, y - h + 6, 6, 8, C.brown);
      R(x + 2, y - h + 16, 16, 1, C.ink); R(x + 2, y - h + 20, 16, 7, C.dkgreen); R(x + 6, y - 14, 8, 14, C.ink);
      if (k % 2) { R(x + 14, y - h + 3, 1, 8, C.ink); R(x + 15, y - h + 3, 5, 3, C.red); P(x + 17, y - h + 4, C.gold); }
    }
  }
  function motorbikes(y, t) {
    for (let k = 0; k < 4; k++) {
      const dir = k % 2 ? -1 : 1, x = ((k * 61 + t * 3 * dir) % (W + 40) + W + 40) % (W + 40) - 20;
      disk(x, y - 2, 2, C.ink); disk(x + 10, y - 2, 2, C.ink); R(x, y - 6, 11, 3, [C.red, C.blue, C.orange, C.purple][k]);
      L(x + 4, y - 7, x + 4, y - 12, C.ink); disk(x + 4, y - 14, 2, C.dgray);
    }
  }
  function machiya(y) {
    for (let k = 0; k < 5; k++) {
      const x = k * 34 - 4;
      R(x, y - 34, 32, 34, C.brown); R(x - 2, y - 36, 36, 3, C.ink); R(x - 2, y - 20, 36, 2, C.ink);
      for (let i = 2; i < 30; i += 3) R(x + i, y - 18, 1, 16, C.wood);
      R(x + 4, y - 32, 24, 10, C.tan); for (let i = 5; i < 28; i += 3) R(x + i, y - 32, 1, 10, C.brown);
    }
  }
  function waterfall(t) {
    sky([C.lblue, C.sky]);
    hills(40, C.jungle, 14, 0.07); R(0, 40, W, 60, C.jungle);
    for (let tier = 0; tier < 3; tier++) {
      const y0 = 34 + tier * 16, x0 = 20 + tier * 6, w = 120 - tier * 12;
      R(x0 - 4, y0 - 3, w + 8, 3, C.dkgreen);
      for (let x = x0; x < x0 + w; x += 3) {
        R(x, y0, 2, 14, C.white);
        const s = (t * 2 + x * 7) % 14; R(x, y0 + s, 2, 3, C.sky);
      }
    }
    water(82, C.teal, C.sky, t, 18);
    for (let k = 0; k < 12; k++) P((k * 23 + t * 2) % W, 78 + (k % 4), C.white);
  }

  /* ---------- scene table ---------- */
  const S = {
    intro(t) {
      sky([C.lblue, C.sky, '#b8f3ff']); clouds(t, 0.3, 8, C.white, 3);
      skyline(80, C.blue, C.gold); R(0, 80, W, 20, C.gray); R(0, 80, W, 2, C.dgray);
      R(8, 58, 22, 10, C.navy); word('JFK', 11, 60, C.white); R(18, 68, 2, 12, C.dgray);
      const xs = [52, 72, 92, 112];
      xs.forEach((x, i) => { R(x + 5 * (i < 2 ? 1 : -1) - 2, 88, 5, 5, [C.red, C.teal, C.orange, C.purple][i]); R(x + 5 * (i < 2 ? 1 : -1) - 1, 87, 3, 1, C.ink); });
      crew(xs, 92, ['wave', 'cheer', 'wave', 'peace'], t);
    },
    home(t) {
      sky([C.purple, C.plum, C.orange, C.yellow]); sun(120, 72, 12, C.gold);
      skyline(82, C.navy, C.gold); R(0, 82, W, 18, C.dgray); R(0, 82, W, 1, C.gray);
      R(40, 40, 1, 20, C.ink); R(41, 40, 22, 12, C.red); word('HOME', 44, 43, C.white);
      crew([60, 78, 96, 114], 94, ['cheer', 'cheer', 'dance', 'cheer'], t);
    },
    'plane-day'(t) { sky([C.lblue, C.sky, '#b8f3ff']); clouds(t, 2, 60, C.white, 5); clouds(t, 1, 12, '#e8fbff', 3); planeSide(24, 40, t); },
    'plane-dusk'(t) { sky([C.purple, C.plum, C.orange, C.yellow]); sun(130, 80, 10, C.gold); clouds(t, 2, 62, C.pink, 5); planeSide(24, 40, t); },
    'plane-night'(t) { sky([C.night, C.navy, C.purple]); stars(t); sun(130, 16, 5, C.cream); P(128, 14, C.gray); clouds(t, 1.5, 66, C.dgray, 4); planeSide(24, 42, t, true); },
    airport(t) {
      R(0, 0, W, 70, C.dgray); R(6, 6, 148, 50, C.sky); for (let x = 6; x < 154; x += 21) R(x, 6, 2, 50, C.gray);
      R(30, 36, 60, 8, C.white); R(84, 38, 8, 5, C.white); R(24, 28, 10, 10, C.white); R(46, 44, 20, 3, C.gray); R(30, 42, 60, 1, C.lblue);
      R(108, 12, 40, 16, C.ink); for (let k = 0; k < 3; k++) for (let i = 0; i < 9; i++) if ((i + k + (t >> 2)) % 4) P(111 + i * 4, 15 + k * 4, C.gold);
      R(0, 70, W, 30, C.tan); dither(0, 70, W, 30, C.peach);
      crew([34, 58, 90, 118], 92, ['stretch', 'walk', 'stretch', 'sip'], t);
    },
    temple(t) {
      sky(['#ffd6a5', C.cream, '#fff7e0']); sun(24, 22, 7, C.yellow);
      R(0, 80, W, 20, C.stone); dither(0, 80, W, 20, C.cream);
      thaiTemple(58, 80); chedi(26, 80, C.gold, 18); chedi(134, 80, C.gold, 16);
      for (let k = 0; k < 3; k++) { const bx = (k * 50 + t) % W; P(bx, 14 + k * 4, C.ink); P(bx + 1, 13 + k * 4, C.ink); P(bx - 1, 13 + k * 4, C.ink); }
      crew([30, 46, 116, 130], 94, ['walk', 'photo', 'peace', 'walk'], t, [1, 1, -1, -1]);
    },
    temple2(t) {
      sky([C.sky, '#c9f6ff']); R(0, 82, W, 18, C.stone);
      chedi(80, 82, C.brown, 60); R(62, 44, 36, 2, C.tan); for (let k = 0; k < 5; k++) R(64 + k * 7, 48, 4, 6, C.gold);
      tree(14, 82, C.green); tree(140, 82, C.green); tree(150, 82, C.jungle);
      crew([28, 40, 118, 132], 94, ['bow', 'bow', 'photo', 'point'], t, [1, 1, -1, -1]);
    },
    ferry(t) {
      sky([C.sky, '#d9fbff']); R(0, 46, W, 8, C.green); prang(120, 50); prang(100, 50); tree(20, 50); tree(34, 50); palm(60, 50);
      water(52, C.sea, C.sky, t);
      const bx = ((t * 0.6) % 190) - 30;
      R(bx, 78, 50, 6, C.red); R(bx + 2, 84, 46, 2, C.brown); R(bx + 6, 66, 38, 2, C.blue); R(bx + 6, 66, 1, 12, C.ink); R(bx + 43, 66, 1, 12, C.ink);
      for (let k = 0; k < 4; k++) fig(bx + 12 + k * 9, 79, k % 2 ? 'wave' : 'point', k, t, 1);
      water(86, C.sea, C.sky, t, 14);
    },
    streetfood(t) {
      sky([C.night, C.navy]); stars(t, 12);
      R(0, 30, W, 50, C.purple); for (let k = 0; k < 6; k++) R(k * 28 + 4, 36, 18, 10, (k + (t >> 3)) % 3 ? C.gold : C.orange);
      lanterns(26, t);
      R(10, 56, 70, 4, C.red); for (let x = 10; x < 80; x += 10) R(x, 56, 5, 4, C.white); R(14, 60, 60, 20, C.brown); R(22, 62, 12, 3, C.dgray); steam(26, 60, t); R(50, 62, 14, 3, C.dgray); steam(54, 60, t + 3);
      R(0, 80, W, 20, C.dgray); dither(0, 80, W, 20, C.ink);
      [96, 112, 128, 144].forEach((x) => R(x - 2, 88, 6, 4, C.red));
      crew([94, 110, 126, 142], 92, 'sitEat', t, [1, 1, -1, -1]);
    },
    muaythai(t) {
      R(0, 0, W, H, C.night); for (let k = 0; k < 40; k++) P((k * 37) % W, 20 + ((k * 17) % 30), (k + (t >> 1)) % 5 ? C.dgray : C.gold);
      for (let j = 0; j < 40; j++) R(80 - j, j, j * 2, 1, 'rgba(255,240,180,0.08)');
      R(24, 70, 112, 16, C.blue); R(24, 86, 112, 6, C.navy);
      [[C.red, 50], [C.white, 58], [C.blue, 66]].forEach(([c, y]) => R(24, y, 112, 1, c));
      R(24, 46, 3, 40, C.gray); R(133, 46, 3, 40, C.gray);
      fig(66, 72, 'punch', 0, t, 1); fig(92, 72, 'punch', 1, t + 2, -1);
      fig(12, 98, 'cheer', 2, t); fig(148, 98, 'cheer', 3, t, -1);
    },
    cooking(t) {
      R(0, 0, W, 60, C.cream); for (let y = 0; y < 60; y += 6) for (let x = (y / 6) % 2 * 6; x < W; x += 12) R(x, y, 6, 6, '#ffe7b0');
      R(0, 60, W, 40, C.wood); R(0, 60, W, 3, C.tan);
      for (let k = 0; k < 4; k++) {
        const x = 18 + k * 36; R(x - 6, 66, 14, 3, C.ink); R(x - 4, 69, 10, 2, C.ink);
        for (let j = 0; j < 3; j++) P(x - 3 + j * 3 + ((t + j) % 2), 71 + ((t + j) % 2), j % 2 ? C.orange : C.yellow);
        steam(x - 2, 64, t + k);
        R(x + 10, 62, 2, 4, C.red); R(x + 13, 63, 2, 3, C.lime);
      }
      crew([14, 50, 86, 122], 64, 'stir', t);
    },
    sunset(t) {
      sky([C.purple, C.plum, C.red, C.orange, C.yellow]); sun(110, 62, 14, C.gold);
      hills(64, C.purple, 16, 0.05, 20); hills(72, C.plum, 12, 0.08, 3);
      chedi(40, 44, C.gold, 12); if ((t >> 2) % 3 === 0) P(40, 14, C.white);
      R(0, 80, W, 20, C.ink); for (let k = 0; k < 30; k++) if ((k + (t >> 2)) % 4) P((k * 29) % W, 84 + (k % 12), C.gold);
      crew([70, 84, 128, 142], 80, ['sit', 'point', 'sit', 'sip'], t, [1, 1, -1, -1]);
    },
    elephants(t) {
      sky([C.sky, '#c9f6ff']); for (let k = 0; k < 9; k++) tree(k * 19, 62, k % 2 ? C.green : C.jungle);
      R(0, 62, W, 16, C.lime); water(78, C.teal, C.sky, t, 22);
      const ex = 70;
      R(ex, 60, 34, 18, C.gray); R(ex + 30, 56, 14, 14, C.gray); R(ex + 34, 54, 8, 6, C.dgray); P(ex + 40, 60, C.ink);
      R(ex + 2, 78, 6, 8, C.gray); R(ex + 24, 78, 6, 8, C.gray); R(ex + 42, 66, 3, 12, C.gray); R(ex - 2, 62, 2, 8, C.dgray);
      for (let k = 0; k < 7; k++) { const s = (t * 2 + k * 5) % 30; P(ex + 44 - s, 64 - Math.round(12 * Math.sin((s / 30) * Math.PI)) - k % 2, C.white); }
      crew([22, 38, 54, 128], 88, ['cheer', 'point', 'cheer', 'wave'], t, [1, 1, 1, -1]);
    },
    khaosoi(t) {
      R(0, 0, W, 70, C.orange); dither(0, 0, W, 70, C.yellow);
      R(10, 10, 40, 22, C.cream); word('KHAO', 14, 14, C.red); word('SOI', 18, 22, C.red);
      const tally = 1 + ((t >> 3) % 4); for (let k = 0; k < tally; k++) R(120 + k * 5, 14, 2, 10, C.ink);
      R(0, 70, W, 30, C.wood); R(0, 70, W, 3, C.tan);
      crew([28, 60, 100, 132], 70, 'eat', t, [1, 1, -1, -1]);
      [28, 60, 100, 132].forEach((x, i) => { R(x - 5, 74, 11, 3, C.gold); R(x - 4, 77, 9, 2, C.white); steam(x - 2, 72, t + i); });
    },
    oldquarter(t) {
      sky([C.sky, C.lblue]); shophouses(84, t);
      R(0, 84, W, 16, C.dgray); for (let x = 0; x < W; x += 12) R(x, 92, 6, 1, C.gray);
      motorbikes(98, t); crew([40, 54, 68, 82], 88, 'walk', t, [1, 1, 1, 1]);
    },
    trainstreet(t) {
      sky([C.sky, C.lblue]); shophouses(70, t);
      R(0, 70, W, 30, C.stone); R(0, 84, W, 2, C.brown); R(0, 90, W, 2, C.brown); for (let x = 0; x < W; x += 6) R(x, 84, 2, 8, C.wood);
      const cyc = t % 90, tx = W - cyc * 5;
      [22, 44, 110, 132].forEach((x) => R(x - 2, 76, 6, 4, C.red));
      crew([20, 42, 108, 130], 78, 'sip', t, [1, 1, -1, -1]);
      if (cyc < 60) { R(tx, 72, 130, 16, C.blue); R(tx, 74, 130, 2, C.gold); for (let k = 0; k < 8; k++) R(tx + 6 + k * 15, 77, 8, 5, C.sky); R(tx - 4, 76, 4, 12, C.blue); }
    },
    buncha(t) {
      R(0, 0, W, 70, C.teal); dither(0, 0, W, 70, C.dkgreen);
      R(10, 6, 30, 30, C.cream); word('BUN', 16, 12, C.red); word('CHA', 16, 20, C.red);
      R(56, 40, 30, 6, C.ink); for (let k = 0; k < 6; k++) R(58 + k * 5, 38, 3, 2, (t + k) % 3 ? C.orange : C.red); for (let k = 0; k < 5; k++) { const s = (t + k * 3) % 20; P(60 + k * 6 + (s >> 3), 36 - s, 'rgba(255,255,255,0.7)'); }
      R(0, 70, W, 30, C.dgray); R(20, 76, 120, 4, C.lblue); R(22, 80, 2, 10, C.lblue); R(136, 80, 2, 10, C.lblue);
      [20, 52, 108, 140].forEach((x) => R(x - 2, 90, 6, 4, C.red));
      crew([22, 54, 106, 138], 92, 'sitEat', t, [1, 1, -1, -1]);
    },
    coffee(t) {
      R(0, 0, W, 72, C.brown); dither(0, 0, W, 72, C.wood);
      R(60, 8, 40, 24, C.cream); R(70, 16, 12, 10, C.white); R(82, 18, 3, 5, C.white); R(71, 14, 10, 3, C.gold); steam(74, 12, t);
      lanterns(40, t, [C.gold, C.red], 20);
      R(0, 72, W, 28, C.wood); R(0, 72, W, 2, C.tan);
      [26, 56, 104, 134].forEach((x) => R(x - 2, 90, 6, 4, C.blue));
      crew([24, 54, 102, 132], 92, 'sip', t, [1, 1, -1, -1]);
    },
    lake(t) {
      sky([C.purple, C.pink, C.peach]); water(58, C.deep, C.pink, t, 26);
      R(66, 50, 20, 10, C.green); R(70, 38, 12, 12, C.stone); R(68, 36, 16, 2, C.brown); R(73, 32, 6, 4, C.stone); R(72, 30, 8, 2, C.brown);
      for (let k = 0; k < 12; k++) R(100 + k * 5, 54 - Math.round(4 * Math.sin((k / 11) * Math.PI)), 5, 2, C.red);
      R(0, 84, W, 16, C.green); for (let k = 0; k < 5; k++) tree(10 + k * 36, 84, C.jungle);
      crew([40, 54, 90, 104], 94, 'walk', t, [1, 1, 1, 1]);
    },
    van(t) {
      sky([C.sky, '#c9f6ff']); clouds(t, 0.4, 6, C.white, 3);
      hills(50, C.dkgreen, 20, 0.05, t * 0.5); hills(64, C.jungle, 16, 0.08, t * 1.2); hills(74, C.green, 10, 0.12, t * 2.2);
      R(0, 80, W, 20, C.dgray); for (let k = 0; k < 8; k++) R(((k * 30 - t * 4) % 200 + 200) % 200 - 20, 89, 12, 2, C.gold);
      van(48, 64, t);
    },
    waterfall(t) { waterfall(t); crew([20, 34, 124, 138], 96, ['photo', 'peace', 'point', 'cheer'], t, [1, 1, -1, -1]); },
    cave(t) {
      R(0, 0, W, H, C.night);
      for (let k = 0; k < 16; k++) { const x = k * 11 + 3, h = 6 + (k * 7) % 14; for (let j = 0; j < h; j++) R(x - Math.max(0, 2 - (j >> 2)), j, Math.max(1, 5 - (j >> 1)), 1, C.dgray); }
      R(0, 86, W, 14, C.dgray); for (let k = 0; k < 8; k++) R(k * 22 + 6, 80 - (k % 3) * 3, 4, 8 + (k % 3) * 3, C.gray);
      R(100, 30, 50, 40, 'rgba(115,239,247,0.10)'); for (let k = 0; k < 8; k++) P(104 + k * 6, 40 + ((t + k) % 20), C.sky);
      crew([30, 46, 62, 78], 90, 'headlamp', t, [1, 1, 1, 1]);
    },
    valley(t) {
      sky([C.lblue, C.sky]);
      for (let k = 0; k < 6; k++) karst(12 + k * 28, 60, 18, 26 + (k % 3) * 8, k % 2 ? C.dkgreen : C.jungle, C.green);
      for (let j = 0; j < 5; j++) R(0, 60 + j * 8, W, 8, j % 2 ? C.lime : C.green);
      for (let j = 0; j < 5; j++) for (let x = (j * 7) % 14; x < W; x += 14) R(x, 62 + j * 8, 1, 3, C.jungle);
      [0, 1, 2, 3].forEach((i) => bike(((i * 44 + t * 2) % (W + 40)) - 20, 92 - (i % 2) * 6, t, i));
    },
    homestay(t) {
      sky([C.night, C.navy]); stars(t, 30); hills(56, C.ink, 14, 0.06);
      R(90, 40, 56, 26, C.brown); for (let k = 0; k < 4; k++) R(92 + k * 16, 66, 3, 16, C.wood); R(84, 34, 68, 6, C.tan); R(100, 46, 10, 8, C.gold); R(124, 46, 10, 8, C.gold);
      R(0, 82, W, 18, C.dkgreen); R(56, 86, 12, 3, C.brown);
      for (let k = 0; k < 5; k++) P(58 + ((t + k) % 8), 84 - ((t * 2 + k * 3) % 9), k % 2 ? C.orange : C.yellow); R(58, 83, 8, 3, C.orange);
      crew([24, 40, 78, 94 - 30], 92, ['sit', 'sip', 'sit', 'sit'], t, [1, 1, -1, -1]);
    },
    bay(t) {
      sky([C.sky, '#d9fbff']);
      [[14, 26, 40], [40, 20, 28], [128, 30, 46], [150, 18, 30], [100, 14, 22]].forEach(([x, w, h], k) => karst(x, 70, w, h, k % 2 ? C.dkgreen : C.jungle, C.green));
      water(68, C.teal, C.sky, t); junk(52, 70, t);
    },
    kayak(t) {
      sky([C.sky, '#d9fbff']); [[20, 30, 56], [140, 34, 60], [80, 18, 30]].forEach(([x, w, h], k) => karst(x, 64, w, h, k % 2 ? C.dkgreen : C.jungle, C.green));
      water(62, C.teal, C.sky, t);
      for (let i = 0; i < 4; i++) { const x = 24 + i * 32 + (((t >> 3) + i) % 2), y = 82 + (i % 2) * 8; R(x - 8, y, 18, 3, [C.red, C.yellow, C.lblue, C.pink][i]); fig(x, y, 'paddle', i, t, 1); }
    },
    swim(t) {
      sky([C.orange, C.yellow, C.peach]); sun(128, 52, 10, C.gold); karst(30, 62, 26, 40, C.plum, C.purple);
      junk(96, 64, t, false); water(66, C.sea, C.gold, t);
      [30, 52, 74, 96].forEach((x, i) => fig(x, 86 + (i % 2) * 3, 'swim', i, t, i % 2 ? -1 : 1));
      water(84, C.sea, C.gold, t, 16);
      for (let k = 0; k < 4; k++) if ((t + k * 3) % 8 < 2) P(28 + k * 22, 82, C.white);
    },
    deckdinner(t) {
      sky([C.night, C.navy]); stars(t); karst(20, 60, 30, 40, C.ink); karst(140, 60, 28, 34, C.ink);
      water(60, C.navy, C.dgray, t); lanterns(20, t, [C.red, C.gold], 18);
      R(0, 74, W, 26, C.brown); R(0, 74, W, 2, C.tan); R(46, 78, 68, 4, C.cream); R(50, 82, 2, 10, C.wood); R(108, 82, 2, 10, C.wood);
      R(70, 75, 12, 3, C.white); R(72, 74, 8, 1, C.orange); steam(74, 73, t);
      crew([40, 58, 104, 122], 92, 'eat', t, [1, 1, -1, -1]);
    },
    sunrise(t) {
      sky([C.lblue, C.pink, C.peach, C.yellow]); sun(80, 70 - Math.min(14, t >> 3), 12, C.gold);
      [[20, 28, 40], [50, 18, 24], [118, 24, 36], [146, 20, 28]].forEach(([x, w, h]) => karst(x, 70, w, h, C.plum));
      water(70, C.sea, C.pink, t); R(40, 84, 80, 16, C.brown); R(40, 84, 80, 2, C.tan);
      crew([52, 70, 92, 110], 86, ['stretch', 'stretch', 'point', 'sip'], t);
    },
    tsukiji(t, v = 0) {
      R(0, 0, W, 60, v ? C.yellow : C.lblue); for (let k = 0; k < 16; k++) R(k * 10, 0, 5, 8, v ? C.red : C.white);
      for (let k = 0; k < 4; k++) {
        const x = 4 + k * 40; R(x, 20, 34, 12, v ? [C.red, C.pink, C.orange, C.purple][k] : [C.navy, C.red, C.navy, C.red][k]); R(x + 4, 24, 26, 2, C.white);
        R(x, 40, 34, 20, C.brown); for (let i = 0; i < 6; i++) R(x + 2 + i * 5, 36, 4, 4, [C.pink, C.orange, C.white, C.gold, C.lime, C.red][(i + k) % 6]);
      }
      R(0, 60, W, 40, C.stone); dither(0, 60, W, 40, C.gray);
      crew([26, 60, 100, 134], 92, ['skewer', 'eat', 'skewer', 'photo'], t, [1, 1, -1, -1]);
    },
    shrine(t) {
      sky([C.sky, '#c9f6ff']); for (let k = 0; k < 10; k++) tree(k * 17, 72, k % 2 ? C.jungle : C.dkgreen, C.ink);
      R(0, 72, W, 28, C.cream); dither(0, 72, W, 28, C.stone);
      torii(50, 84, 52, C.brown, 60);
      crew([56, 70, 88, 102], 94, 'bow', t, [1, 1, -1, -1]);
    },
    yanaka(t) {
      sky([C.sky, '#e0fbff']); machiya(80); R(0, 80, W, 20, C.stone);
      const cx = ((t * 1) % (W + 20)) - 10; R(cx, 88, 6, 3, C.orange); P(cx + 5, 87, C.orange); P(cx + 6, 87, C.orange); P(cx - 1, 86, C.orange);
      crew([30, 46, 110, 126], 96, ['walk', 'point', 'photo', 'walk'], t, [1, 1, -1, -1]);
    },
    neon(t, v = 0) {
      R(0, 0, W, H, C.night);
      const signs = [[6, 10, 20, 34, C.pink], [30, 16, 16, 26, C.sky], [52, 6, 22, 40, C.gold], [80, 12, 18, 30, C.lime], [104, 8, 20, 36, C.pink], [130, 14, 24, 28, C.sky]];
      signs.forEach(([x, y, w, h, c], k) => { const on = (t + k * 5) % 23 !== 0; R(x, y, w, h, on ? c : C.dgray); for (let j = 4; j < h - 2; j += 6) R(x + 3, y + j, w - 6, 2, C.night); });
      if (v) { R(70, 0, 20, 60, C.dgray); R(64, 20, 32, 6, C.gold); R(76, 60, 8, 20, C.dgray); }
      lanterns(56, t, [C.red, C.red], 12);
      R(0, 82, W, 18, C.ink); for (let k = 0; k < 20; k++) P((k * 17) % W, 84 + (k % 14), [C.pink, C.sky, C.gold][k % 3]);
      crew([40, 60, 96, 116], 92, v ? ['skewer', 'skewer', 'toast', 'skewer'] : ['dance', 'cheer', 'dance', 'toast'], t, [1, 1, -1, -1]);
    },
    depachika(t) {
      R(0, 0, W, H, C.cream); for (let k = 0; k < 5; k++) R(k * 32, 0, 16, 6, C.pink);
      for (let k = 0; k < 3; k++) { const x = 8 + k * 50; R(x, 40, 44, 26, C.white); R(x, 40, 44, 2, C.gray); for (let i = 0; i < 6; i++) disk(x + 5 + i * 7, 52, 2, [C.pink, C.lime, C.gold, C.red, C.lblue, C.orange][(i + k) % 6]); R(x, 66, 44, 4, C.wood); }
      R(0, 70, W, 30, C.peach);
      crew([30, 58, 104, 132], 92, ['point', 'eat', 'point', 'cheer'], t, [1, 1, -1, -1]);
    },
    shinkansen(t) {
      sky([C.lblue, C.sky, '#c9f6ff']);
      for (let j = 0; j < 30; j++) { const w = 4 + j * 3; R(110 - w / 2, 22 + j, w, 1, j < 8 ? C.white : C.blue); }
      hills(64, C.green, 8, 0.1, t * 3); R(0, 64, W, 36, C.lime);
      for (let k = 0; k < 10; k++) R(((k * 23 - t * 6) % 200 + 200) % 200 - 20, 90 + (k % 3) * 3, 3, 3, C.green);
      shinkansen(8, 62, t); speedLines(t, 50, 80);
    },
    inari(t) {
      R(0, 0, W, H, C.dkgreen); dither(0, 0, W, 40, C.jungle);
      const off = (t * 2) % 16;
      for (let x = -16 + off; x < W + 16; x += 16) { R(x, 18, 5, 70, C.verm); R(x, 88, 5, 4, C.ink); R(x - 4, 16, 13, 4, C.ink); R(x - 3, 20, 11, 2, C.verm); }
      R(0, 90, W, 10, C.stone);
      crew([46, 62, 78, 94], 94, 'walk', t, [1, 1, 1, 1]);
    },
    kiyomizu(t) {
      sky([C.sky, '#ffe6f0']); hills(60, C.green, 18, 0.05); R(0, 60, W, 40, C.green);
      R(30, 36, 70, 6, C.brown); for (let k = 0; k < 8; k++) R(32 + k * 9, 42, 2, 40, C.wood); for (let j = 48; j < 82; j += 8) R(30, j, 70, 1, C.wood);
      R(40, 24, 50, 12, C.verm); R(34, 20, 62, 4, C.ink);
      for (let k = 0; k < 4; k++) { R(122 - k * 2, 64 - k * 12, 16 + k * 4, 2, C.ink); R(124, 52 - k * 12, 12, 10, C.verm); }
      crew([42, 54, 72, 86], 36, ['photo', 'peace', 'point', 'wave'], t, [1, 1, 1, -1]);
    },
    moss(t) {
      sky([C.dgray, C.gray]);
      R(0, 60, W, 40, C.green); for (let k = 0; k < 8; k++) disk(k * 22 + 8, 66 + (k % 2) * 4, 8, k % 2 ? C.lime : C.jungle);
      R(126, 50, 12, 4, C.stone); R(129, 54, 6, 8, C.stone); R(128, 62, 8, 4, C.stone); R(130, 55, 4, 3, C.gold);
      for (let k = 0; k < 50; k++) { const x = (k * 31 + t * 2) % W, y = (k * 17 + t * 5) % H; P(x, y, C.white); P(x - 1, y - 1, 'rgba(255,255,255,0.5)'); }
      crew([30, 50, 76, 96], 92, 'umbrella', t, [1, 1, 1, 1]);
    },
    nishiki(t) { S.tsukiji(t, 1); },
    gion(t) {
      sky([C.purple, C.plum, C.orange]); machiya(86); R(0, 86, W, 14, C.stone); dither(0, 86, W, 14, C.gray);
      for (let k = 0; k < 5; k++) { const x = k * 34 + 22; R(x, 60, 5, 7, C.red); P(x + 2, 62, C.gold); if ((t + k) % 9 === 0) R(x - 1, 59, 7, 9, 'rgba(255,220,120,0.4)'); }
      crew([30, 44, 100, 114], 96, 'walk', t, [1, 1, 1, 1]);
    },
    dotonbori(t) {
      R(0, 0, W, 64, C.night);
      [[4, 6, 30, 40, C.red], [40, 2, 26, 30, C.gold], [72, 10, 36, 34, C.pink], [114, 4, 40, 44, C.sky]].forEach(([x, y, w, h, c], k) => { R(x, y, w, h, (t + k * 7) % 29 ? c : C.dgray); for (let j = 5; j < h - 3; j += 7) R(x + 4, y + j, w - 8, 3, C.night); });
      R(78, 6, 24, 10, C.orange); for (let k = 0; k < 4; k++) L(78, 10 + k * 2, 70 - ((t + k) % 3), 6 + k * 3, C.orange); for (let k = 0; k < 4; k++) L(102, 10 + k * 2, 110 + ((t + k) % 3), 6 + k * 3, C.orange);
      water(64, C.navy, C.pink, t, 18); for (let k = 0; k < 10; k++) R((k * 17 + (t >> 1)) % W, 68 + (k % 5) * 3, 6, 1, [C.red, C.gold, C.sky][k % 3]);
      R(0, 82, W, 18, C.dgray);
      crew([30, 48, 108, 126], 94, ['skewer', 'cheer', 'eat', 'skewer'], t, [1, 1, -1, -1]);
    },
    takoyaki(t) {
      R(0, 0, W, 64, C.red); dither(0, 0, W, 64, C.orange); lanterns(10, t, [C.white, C.gold], 16);
      R(40, 44, 80, 20, C.ink); for (let k = 0; k < 12; k++) { const x = 46 + (k % 6) * 12, y = 48 + ((k / 6) | 0) * 8; disk(x, y, 2, (t + k) % 6 ? C.tan : C.brown); }
      steam(60, 42, t); steam(92, 42, t + 4);
      R(0, 64, W, 36, C.wood); crew([20, 36, 126, 142], 94, ['skewer', 'eat', 'skewer', 'cheer'], t, [1, 1, -1, -1]);
    },
    shinsekai(t) { S.neon(t, 1); },
    bar(t) {
      R(0, 0, W, 70, C.plum); dither(0, 0, W, 70, C.purple);
      for (let k = 0; k < 10; k++) R(10 + k * 14, 14, 6, 14, [C.gold, C.lime, C.sky, C.pink][k % 4]); R(0, 28, W, 3, C.brown);
      R(0, 66, W, 6, C.wood); R(0, 72, W, 28, C.brown);
      crew([30, 56, 104, 130], 66, 'toast', t, [1, 1, -1, -1]);
    },
  };

  /* ---------- loop ---------- */
  function draw() {
    const t = reduced ? 6 : tick;
    const fn = S[curKind] || S.intro;
    ctx.save();
    fn(t);
    ctx.restore();
    // pixel wipe on scene change
    const since = tick - changedAt;
    if (!reduced && since < 6) {
      ctx.fillStyle = C.ink;
      for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 6 - since);
    }
  }
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const k = Math.floor(ts / 100);
    if (k === lastDraw) return;
    lastDraw = k; tick++;
    draw();
  }

  return {
    init(canvasEl, captionEl) {
      canvas = canvasEl; capEl = captionEl;
      canvas.width = W; canvas.height = H;
      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
    },
    show(kind, caption, isReduced) {
      reduced = !!isReduced;
      if (kind !== curKind || caption !== cur) {
        curKind = kind; cur = caption; changedAt = tick;
        if (capEl) capEl.textContent = caption;
      }
      if (reduced) { cancelAnimationFrame(raf); raf = 0; draw(); }
      else if (!raf) raf = requestAnimationFrame(loop);
    },
    kinds: () => Object.keys(S),
    CREW,
  };
})();

/* --------------------------------------------------------------------------
   ENGINE
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  // Equirectangular. Must match tools/build-map.js.
  const PROJ = { lon0: -100, lon1: 165, lat0: 72, lat1: -15, kx: 9, ky: 10 };
  const PW = (PROJ.lon1 - PROJ.lon0) * PROJ.kx; // 2385
  const PH = (PROJ.lat0 - PROJ.lat1) * PROJ.ky; // 870

  const COUNTRY_NAMES = { th: 'Thailand', vn: 'Vietnam', jp: 'Japan', us: 'Home' };
  const MODE_LABEL = { plane: 'Plane', train: 'Train', van: 'Van', boat: 'Boat' };
  const DAY_MS = 86400000;
  const t0 = Date.parse(TRIP.start + 'T00:00:00Z');
  const dayOf = (iso) => Math.round((Date.parse(iso + 'T00:00:00Z') - t0) / DAY_MS) + 1;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const project = ([lat, lon]) => [(lon - PROJ.lon0) * PROJ.kx, (PROJ.lat0 - lat) * PROJ.ky];
  const llOf = (ref) => (Array.isArray(ref) ? ref : (CITIES[ref] || WAYPOINTS[ref]).ll);
  const ptOf = (ref) => project(llOf(ref));
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const f2 = (v) => Math.round(v * 100) / 100;

  const svg = document.getElementById('map');
  const gGrat = document.getElementById('graticule');
  const gRoutes = document.getElementById('routes');
  const gCities = document.getElementById('cities');
  const gVeh = document.getElementById('vehicle');
  const vehUse = gVeh.querySelector('.veh-glyph');
  const vehShadow = gVeh.querySelector('.veh-shadow use');
  const panel = document.querySelector('.map-panel');
  const content = document.getElementById('segments');
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileMQ = window.matchMedia('(max-width: 820px)');
  let reduced = reduceMQ.matches;

  const N = ITINERARY.length;

  /* ---------- geometry ---------- */

  function gcSamples(a, b, n) {
    const D = Math.PI / 180;
    const v = ([lat, lon]) => [Math.cos(lat * D) * Math.cos(lon * D), Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D)];
    const va = v(a), vb = v(b);
    const om = Math.acos(clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1));
    const out = [];
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
      const x = va[0] * s1 + vb[0] * s2, y = va[1] * s1 + vb[1] * s2, z = va[2] * s1 + vb[2] * s2;
      let lon = Math.atan2(y, x) / D;
      const lat = Math.asin(clamp(z, -1, 1)) / D;
      if (prev !== null) {
        while (lon - prev > 180) lon -= 360;
        while (lon - prev < -180) lon += 360;
      }
      prev = lon;
      out.push([lat, lon]);
    }
    return out;
  }

  const polyD = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1])).join('');

  function smoothD(pts) {
    // Catmull-Rom → cubic Bézier
    let d = 'M' + f2(pts[0][0]) + ' ' + f2(pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + [c1, c2, p2].map((p) => f2(p[0]) + ' ' + f2(p[1])).join(' ');
    }
    return d;
  }

  // Expand a hop description into concrete drawable pieces {mode, d, pts, jump, ends}
  function buildHops(route) {
    const out = [];
    for (const h of route) {
      if (h.kind === 'curve') {
        const A = ptOf(h.from), B = ptOf(h.to);
        const dx = B[0] - A[0], dy = B[1] - A[1];
        const bend = h.bend || 0;
        const C = [(A[0] + B[0]) / 2 - dy * bend, (A[1] + B[1]) / 2 + dx * bend];
        const mid = [0.25 * A[0] + 0.5 * C[0] + 0.25 * B[0], 0.25 * A[1] + 0.5 * C[1] + 0.25 * B[1]];
        out.push({ mode: h.mode, d: `M${f2(A[0])} ${f2(A[1])}Q${f2(C[0])} ${f2(C[1])} ${f2(B[0])} ${f2(B[1])}`, pts: [A, mid, B], end: h.to });
      } else if (h.kind === 'via') {
        const pts = h.points.map(ptOf);
        out.push({ mode: h.mode, d: smoothD(pts), pts, end: h.points[h.points.length - 1] });
      } else if (h.kind === 'gc') {
        const ll = gcSamples(llOf(h.from), llOf(h.to), 90);
        const maxLon = Math.max(...ll.map((p) => p[1]));
        if (maxLon > 180) {
          // Across the Pacific: fly off the east edge, come back in from the west.
          const east = ll.filter((p) => p[1] <= 174).map(project);
          const west = ll.filter((p) => p[1] - 360 >= -110).map((p) => project([p[0], p[1] - 360]));
          out.push({ mode: h.mode, d: polyD(east), pts: east.filter((p) => p[0] <= PW) });
          out.push({ mode: h.mode, d: polyD(west), pts: west.filter((p) => p[0] >= 0), jump: true, end: h.to });
        } else {
          const pts = ll.map(project);
          out.push({ mode: h.mode, d: polyD(pts), pts, end: h.to });
        }
      }
    }
    return out;
  }

  /* ---------- build the map ---------- */

  // Graticule every 10°
  (function graticule() {
    let d = '';
    for (let lon = -90; lon < PROJ.lon1; lon += 10) {
      const x = (lon - PROJ.lon0) * PROJ.kx;
      d += `M${x} 0V${PH}`;
    }
    for (let lat = -10; lat < PROJ.lat0; lat += 10) {
      const y = (PROJ.lat0 - lat) * PROJ.ky;
      d += `M0 ${y}H${PW}`;
    }
    el('path', { d }, gGrat);
    const eq = (PROJ.lat0 - 0) * PROJ.ky;
    el('path', { d: `M0 ${eq}H${PW}`, class: 'equator' }, gGrat);
    const tropic = (PROJ.lat0 - 23.44) * PROJ.ky;
    el('path', { d: `M0 ${tropic}H${PW}`, class: 'tropic' }, gGrat);
  })();

  // Segments: routes + derived timing
  const SEGS = ITINERARY.map((s, i) => {
    const seg = Object.assign({}, s, { i });
    seg.day0 = dayOf(s.start);
    seg.hops = [];
    if (s.route) {
      const g = el('g', { class: `seg-route c-${s.color}`, 'data-i': i }, gRoutes);
      let acc = 0;
      for (const h of buildHops(s.route)) {
        const path = el('path', { d: h.d, class: 'hop' }, g);
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len} ${len + 10}`;
        path.style.strokeDashoffset = len;
        seg.hops.push(Object.assign(h, { el: path, len, start: acc, last: -1 }));
        acc += len;
      }
      seg.total = acc;
      const all = seg.hops.flatMap((h) => h.pts);
      seg.bbox = [
        Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])),
        Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1])),
      ];
    }
    return seg;
  });
  SEGS.forEach((s, i) => { s.day1 = i + 1 < N ? SEGS[i + 1].day0 : TRIP.days; });

  // Where along a travel segment's scroll range the vehicle has covered fraction r of the path
  const INSET0 = 0.1, INSET1 = 0.85;
  const drawFrac = (p) => ease(clamp((p - INSET0) / (INSET1 - INSET0), 0, 1));
  const posForFrac = (r) => INSET0 + (INSET1 - INSET0) * (Math.acos(1 - 2 * clamp(r, 0, 1)) / Math.PI);

  // Cities
  const reach = { jfk: -Infinity };
  SEGS.forEach((s) => {
    if (s.type === 'stay') reach[s.city] = Math.min(reach[s.city] ?? Infinity, s.i);
    s.hops.forEach((h) => {
      if (h.end && !(h.end in reach)) reach[h.end] = s.i + posForFrac((h.start + h.len) / s.total);
    });
    if (s.type === 'loop') {
      s.route[0].points.forEach((p) => { if (WAYPOINTS[p] && WAYPOINTS[p].name && !(p in reach)) reach[p] = s.i + 0.5; });
    }
  });

  const marks = [];
  function addMark(key, def, minor) {
    const [x, y] = project(def.ll);
    const g = el('g', { class: 'city' + (minor ? ' city--minor' : ''), 'data-key': key }, gCities);
    const sq = (cls, r) => el('rect', { class: cls, x: -r, y: -r, width: r * 2, height: r * 2 }, g);
    if (!minor) sq('pulse', 6);
    sq('ring', minor ? 3 : 6);
    sq('dot', minor ? 1.5 : 3);
    const [dx, dy, anchor] = def.label || [10, 4, 'start'];
    const t = el('text', { x: dx, y: dy, 'text-anchor': anchor, class: 'label' }, g);
    t.textContent = def.name;
    if (def.sub) {
      const s = el('tspan', { class: 'sub', dx: 4 }, t);
      s.textContent = def.sub;
    }
    marks.push({ key, g, x, y, minS: minor ? 0.03 : def.minS, reach: reach[key] ?? Infinity, minor, lastT: '', lastCls: '' });
  }
  for (const k in WAYPOINTS) if (WAYPOINTS[k].name) addMark(k, WAYPOINTS[k], true);
  for (const k in CITIES) addMark(k, CITIES[k], false);

  // Pixel vehicle sprites, drawn top-down with the nose pointing +x.
  // k = outline, w = body, a = country accent.
  const SPRITES = {
    plane: [
      '.......kk........',
      '.......kak.......',
      '........kak......',
      '..k.....kaak.....',
      '..kk....kaaak....',
      '..kakkkkkaaaakkk.',
      '.kkwwwwwwwwwwwwwk',
      '..kakkkkkaaaakkk.',
      '..kk....kaaak....',
      '..k.....kaak.....',
      '........kak......',
      '.......kak.......',
      '.......kk........',
    ],
    train: [
      '.kkkkkkkkkkkkkkkkkkk....',
      'kwwwwwwwwkwwwwwwwwwwkk..',
      'kaaaaaaaakaaaaaaaaaaaakk',
      'kwwwwwwwwkwwwwwwwwwwwwwk',
      'kaaaaaaaakaaaaaaaaaaaakk',
      'kwwwwwwwwkwwwwwwwwwwkk..',
      '.kkkkkkkkkkkkkkkkkkk....',
    ],
    van: [
      '.kkkkkkkkkkkk..',
      'kaaaaaaaaakwwk.',
      'kawwawwawakwwwk',
      'kaaaaaaaaakwwwk',
      'kawwawwawakwwwk',
      'kaaaaaaaaakwwk.',
      '.kkkkkkkkkkkk..',
    ],
    boat: [
      '..kkkkkkkkkkk....',
      '.kwwwwwwwwwwwkk..',
      'kwwaaaaaawwwwwwkk',
      'kwwaaaaaawwwwwwwk',
      'kwwaaaaaawwwwwwkk',
      '.kwwwwwwwwwwwkk..',
      '..kkkkkkkkkkk....',
    ],
  };
  const SPRITE_FILL = { k: 'fill:var(--vb)', w: 'fill:var(--vw2,#fff)', a: 'fill:var(--va)' };
  function spriteInto(g, rows, cell) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const ox = -(w * cell) / 2, oy = -(h * cell) / 2;
    for (const ch of 'kwa') {
      let d = '';
      rows.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] !== ch) continue;
          let run = 1;
          while (row[x + run] === ch) run++;
          d += `M${f2(ox + x * cell)} ${f2(oy + y * cell)}h${f2(run * cell)}v${cell}h${f2(-run * cell)}z`;
          x += run - 1;
        }
      });
      if (d) el('path', { d, style: SPRITE_FILL[ch], 'shape-rendering': 'crispEdges' }, g);
    }
  }
  for (const mode in SPRITES) {
    const g = document.getElementById('v-' + mode);
    while (g.firstChild) g.removeChild(g.firstChild);
    spriteInto(g, SPRITES[mode], 2);
  }

  // The crew on the map: four tiny pixel friends that hop around the current stop
  const FIG = ['.xxx.', '.xxx.', '..x..', 'xxxxx', '..x..', '..x..', '.x.x.', 'x...x'];
  const gCrew = el('g', { id: 'crew', class: 'crew' }, gCities);
  CREW.forEach((f, i) => {
    const holder = el('g', { transform: `translate(${i * 8} 0)` }, gCrew);
    const hop = el('g', { class: 'crew-fig', style: `animation-delay:${-i * 0.15}s` }, holder);
    let d = '';
    FIG.forEach((row, y) => { for (let x = 0; x < 5; x++) if (row[x] === 'x') d += `M${x * 1.4} ${y * 1.4}h1.4v1.4h-1.4z`; });
    el('path', { d, fill: f.c, stroke: '#1d1b33', 'stroke-width': 0.35, 'shape-rendering': 'crispEdges', transform: 'translate(0 -11.2)' }, hop);
  });
  let crewKey = '';

  /* ---------- build the cards ---------- */

  const modeIcon = (mode) =>
    `<svg class="mode-icon" viewBox="-17 -13 34 26" aria-hidden="true"><use href="#v-${mode}"/></svg>`;

  function prevTravel(i) {
    for (let j = i - 1; j >= 0; j--) if (ITINERARY[j].mode) return ITINERARY[j];
    return null;
  }

  const frag = document.createDocumentFragment();
  SEGS.forEach((s, i) => {
    const sec = document.createElement('section');
    sec.className = `seg seg--${s.type} c-${s.color}`;
    sec.dataset.pos = i;
    sec.id = 'leg-' + String(i + 1).padStart(2, '0');
    const arriveMode = s.mode || (prevTravel(i) || {}).mode;
    const kind = s.type === 'stay' ? 'Stay' : s.type === 'loop' ? 'Loop' : MODE_LABEL[s.mode];
    const nights = s.nights ? ` · ${s.nights} night${s.nights > 1 ? 's' : ''}` : '';
    const list = s.todo.map((t) => `<li>${t}</li>`).join('');
    sec.innerHTML = `
      <article class="card">
        <span class="tape" aria-hidden="true"></span>
        <header class="card__head">
          <span class="card__num">${String(i + 1).padStart(2, '0')}</span>
          <span class="card__meta"><span class="card__kind">${kind}</span><span class="card__dates">${s.dates}, 2027${nights}</span></span>
        </header>
        <h2 class="card__place">${s.place}</h2>
        <p class="card__arrival">${arriveMode ? modeIcon(arriveMode) : ''}<span>${s.arrival}</span></p>
        <p class="card__body">${s.body}</p>
        <h3 class="card__listhead">${s.type === 'travel' ? 'On the way' : 'Things to do'}</h3>
        <ul class="card__list">${list}</ul>
        ${s.note ? `<p class="card__note">${s.note}</p>` : ''}
      </article>`;
    frag.appendChild(sec);
  });
  content.appendChild(frag);

  // Rail: country bands positioned by day
  const rail = document.querySelector('.rail__track');
  const bands = {};
  ['th', 'vn', 'jp'].forEach((c) => {
    const segs = SEGS.filter((s) => s.country === c && s.type !== 'travel' || (s.country === c && !s.countryFrom));
    const d0 = Math.min(...SEGS.filter((s) => s.country === c).map((s) => (s.countryFrom ? s.day1 : s.day0)));
    const d1 = Math.max(...SEGS.filter((s) => s.country === c).map((s) => s.day1));
    const top = ((d0 - 1) / (TRIP.days - 1)) * 100, h = ((d1 - d0) / (TRIP.days - 1)) * 100;
    const b = document.createElement('a');
    b.className = `rail__band c-${c}`;
    b.href = '#' + document.querySelector(`.seg.c-${c}`).id;
    b.style.top = top + '%';
    b.style.height = h + '%';
    b.innerHTML = `<span>${COUNTRY_NAMES[c]}</span>`;
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const first = segs[0] || SEGS.find((s) => s.country === c);
      document.getElementById('leg-' + String(first.i + 1).padStart(2, '0')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
    rail.appendChild(b);
    bands[c] = b;
  });
  // One pixel block per trip day, colored by where you wake up
  const railFill = document.querySelector('.rail__fill');
  const dayBlocks = [];
  for (let d = 1; d <= TRIP.days; d++) {
    const seg = SEGS.filter((s) => s.day0 <= d).pop();
    const c = d === 1 ? 'transit' : seg.country === 'us' ? 'transit' : seg.country;
    const b = document.createElement('i');
    b.className = 'rail__day-block c-' + c;
    railFill.appendChild(b);
    dayBlocks.push(b);
  }
  const sceneWhere = document.getElementById('sceneWhere');
  PixelCrew.init(document.getElementById('scene'), document.getElementById('sceneCap'));
  const dayNum = document.getElementById('dayNum');
  const caption = document.getElementById('mapCaption');

  /* ---------- scroll → position ---------- */

  const sections = Array.from(document.querySelectorAll('[data-pos]'));
  let activeSec = sections[0];
  let io = null;
  let panelW = 1, panelH = 1, aspect = 1, trigger = 0;

  function measure() {
    const r = panel.getBoundingClientRect();
    panelW = Math.max(1, r.width);
    panelH = Math.max(1, r.height);
    aspect = panelW / panelH;
    const vh = window.innerHeight;
    trigger = mobileMQ.matches ? panelH + (vh - panelH) * 0.45 : vh * 0.55;
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) activeSec = e.target;
      kick();
    }, { rootMargin: `${-Math.round(trigger)}px 0px ${-Math.round(vh - trigger - 1)}px 0px` });
    sections.forEach((s) => io.observe(s));
  }

  function readTarget() {
    const r = activeSec.getBoundingClientRect();
    const p = clamp((trigger - r.top) / r.height, 0, 1);
    return clamp(+activeSec.dataset.pos + p, -1, N);
  }

  /* ---------- camera ---------- */

  function fit(x0, y0, x1, y1, pad, minDeg) {
    const w = Math.max((x1 - x0) * (1 + pad), (y1 - y0) * (1 + pad) * aspect, minDeg * PROJ.kx, minDeg * PROJ.ky * aspect);
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w };
  }
  const overview = () => ({ cx: PW / 2, cy: PH / 2, w: Math.max(PW * 1.04, PH * 1.04 * aspect) });
  function clampView(v) {
    const h = v.w / aspect;
    v.cx = v.w >= PW ? PW / 2 : clamp(v.cx, v.w / 2, PW - v.w / 2);
    v.cy = h >= PH ? PH / 2 : clamp(v.cy, h / 2, PH - h / 2);
    return v;
  }
  const FOLLOW_MAX = 1000;
  const VEH_SCALE = { plane: 1.35, train: 1.2, van: 1.3, boat: 1.3 }; // wider than this (SVG units) and the camera follows the vehicle

  /* ---------- per-frame render ---------- */

  let target = -1, shown = -1, cam = null, lastTs = 0, raf = 0, lastHopKey = '';
  const veh = { x: 0, y: 0, a: 0, visible: false, mode: '', hopKey: '' };
  let lastCountry = null, lastSeg = null, lastDay = -1, lastS = -1;

  function vehicleAt(seg, f) {
    const L = f * seg.total;
    let hop = seg.hops[seg.hops.length - 1];
    for (const h of seg.hops) if (L <= h.start + h.len) { hop = h; break; }
    const l = clamp(L - hop.start, 0, hop.len);
    const d = Math.max(0.05, Math.min(hop.len * 0.02, 3));
    const p = hop.el.getPointAtLength(l);
    const a = hop.el.getPointAtLength(Math.max(0, l - d));
    const b = hop.el.getPointAtLength(Math.min(hop.len, l + d));
    return { x: p.x, y: p.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, mode: hop.mode, hop };
  }

  function camTarget(pos) {
    if (pos < 0 || pos >= N) return { v: overview() };
    const i = Math.floor(pos), p = pos - i, seg = SEGS[i];
    if (seg.type === 'stay') {
      const [x, y] = ptOf(seg.city);
      const v = fit(x, y, x, y, 0, seg.zoom * (1 - 0.14 * ease(p)));
      return { v };
    }
    if (seg.camByHop) {
      // Frame whichever hop is under way (road out, the cruise, road back)
      const hop = vehicleAt(seg, drawFrac(p)).hop;
      const xs = hop.pts.map((q) => q[0]), ys = hop.pts.map((q) => q[1]);
      return { v: fit(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 0.6, 0.45), fit: true };
    }
    const [x0, y0, x1, y1] = seg.bbox;
    const v = fit(x0, y0, x1, y1, seg.type === 'loop' ? 0.35 : 0.45, seg.type === 'loop' ? 0.9 : 1.6);
    if (v.w > FOLLOW_MAX) {
      const vp = vehicleAt(seg, drawFrac(p));
      return { v: { cx: vp.x, cy: vp.y, w: 900 }, cutKey: i + ':' + seg.hops.indexOf(vp.hop), jumpHop: vp.hop.jump };
    }
    return { v, fit: true };
  }

  function render(ts) {
    raf = 0;
    const dt = lastTs ? Math.min(64, ts - lastTs) : 16;
    lastTs = ts;
    target = readTarget();

    // Smooth the scroll position a touch so the vehicle glides rather than steps
    if (reduced) shown = target;
    else {
      const k = 1 - Math.exp(-dt / 70);
      shown += (target - shown) * k;
      if (Math.abs(target - shown) < 0.0005) shown = target;
    }
    const pos = shown;
    const iSeg = Math.floor(pos), p = pos - iSeg;

    // Routes
    for (const seg of SEGS) {
      if (!seg.hops.length) continue;
      let f, state;
      if (reduced) { f = 1; state = 'static'; }
      else if (seg.i < iSeg) { f = 1; state = 'done'; }
      else if (seg.i > iSeg) { f = 0; state = 'todo'; }
      else { f = drawFrac(p); state = f >= 1 ? 'arrived' : 'active'; }
      if (seg.state !== state) {
        seg.hops[0].el.parentNode.setAttribute('data-state', state);
        seg.state = state;
      }
      const L = f * seg.total;
      for (const h of seg.hops) {
        const local = clamp((L - h.start) / h.len, 0, 1);
        if (local !== h.last) {
          h.el.style.strokeDashoffset = h.len * (1 - local);
          h.el.style.visibility = local > 0 ? 'visible' : 'hidden';
          h.last = local;
        }
      }
    }

    // Vehicle
    const seg = iSeg >= 0 && iSeg < N ? SEGS[iSeg] : null;
    let showVeh = false;
    if (!reduced && seg && seg.hops.length) {
      const vp = vehicleAt(seg, drawFrac(p));
      showVeh = true;
      veh.x = vp.x; veh.y = vp.y; veh.a = vp.a;
      // Hide while it's off the edge of the map (Pacific crossing)
      if (vp.x < -2 || vp.x > PW + 2) showVeh = false;
      if (veh.mode !== vp.mode) {
        veh.mode = vp.mode;
        vehUse.setAttribute('href', '#v-' + vp.mode);
        vehShadow.setAttribute('href', '#v-' + vp.mode);
        gVeh.setAttribute('data-mode', vp.mode);
        gVeh.setAttribute('class', 'c-' + seg.color);
      }
    }
    if (showVeh !== veh.visible) {
      gVeh.style.opacity = showVeh ? 1 : 0;
      veh.visible = showVeh;
    }

    // Camera
    const ct = camTarget(pos);
    // Keep the point of interest up and to the left, clear of the scene window
    if (pos >= 0 && pos < N) {
      if (ct.fit) ct.v.w *= 1.3;
      const k = (ct.fit ? 0.08 : 0.12) * (mobileMQ.matches ? 1.5 : 1);
      ct.v.cx += ct.v.w * k; ct.v.cy += (ct.v.w / aspect) * k * (mobileMQ.matches ? 1.1 : 0.8);
    }
    const tv = clampView(ct.v);
    if (!cam || reduced) cam = Object.assign({}, tv);
    else if (ct.cutKey && ct.jumpHop && ct.cutKey !== lastHopKey && lastHopKey.split(':')[0] === ct.cutKey.split(':')[0]) {
      cam = Object.assign({}, tv); // hard cut across the date line
    } else {
      const k = 1 - Math.exp(-dt / 260);
      cam.cx += (tv.cx - cam.cx) * k;
      cam.cy += (tv.cy - cam.cy) * k;
      cam.w = Math.exp(Math.log(cam.w) + (Math.log(tv.w) - Math.log(cam.w)) * k);
    }
    lastHopKey = ct.cutKey || '';
    const w = cam.w, h = w / aspect;
    const prec = w < 50 ? 1000 : 100;
    svg.setAttribute('viewBox', [cam.cx - w / 2, cam.cy - h / 2, w, h].map((v) => Math.round(v * prec) / prec).join(' '));

    // Screen-constant sizing: s = SVG units per CSS pixel
    const s = w / panelW;
    if (Math.abs(s - lastS) / s > 0.002) {
      gRoutes.setAttribute('stroke-width', f2(2.6 * s * 1000) / 1000);
      lastS = s;
    }
    const focus = new Set();
    if (seg) {
      if (seg.city) focus.add(seg.city);
      if (seg.to) focus.add(seg.to);
      if (seg.from && p < 0.5) focus.add(seg.from);
    }
    for (const m of marks) {
      const t = `translate(${f2(m.x)} ${f2(m.y)}) scale(${Math.round(s * 1e5) / 1e5})`;
      if (t !== m.lastT) { m.g.setAttribute('transform', t); m.lastT = t; }
      const visited = reduced || pos >= m.reach;
      const here = seg && !reduced && seg.type === 'stay' && seg.city === m.key;
      const showLabel = (m.minor ? visited : true) && (s < m.minS || focus.has(m.key));
      const cls = (visited ? ' is-visited' : '') + (here ? ' is-here' : '') + (showLabel ? ' show-label' : '') + (focus.has(m.key) ? ' is-focus' : '');
      if (cls !== m.lastCls) { m.g.setAttribute('class', 'city' + (m.minor ? ' city--minor' : '') + cls); m.lastCls = cls; }
    }
    if (veh.visible) {
      gVeh.setAttribute('transform', `translate(${f2(veh.x)} ${f2(veh.y)}) scale(${Math.round(s * (VEH_SCALE[veh.mode] || 1) * 1e5) / 1e5})`);
      const r = `rotate(${f2(veh.a)})`;
      vehUse.setAttribute('transform', r);
      vehShadow.setAttribute('transform', r);
    }

    // Country, day, caption
    let country = null;
    if (seg) country = seg.countryFrom && drawFrac(p) < 0.5 ? seg.countryFrom : seg.country;
    if (country !== lastCountry) {
      document.body.dataset.country = country || 'none';
      for (const c in bands) bands[c].classList.toggle('is-on', c === country);
      lastCountry = country;
    }
    let day = 1;
    if (pos >= N) day = TRIP.days;
    else if (seg) day = seg.day0 + (seg.day1 - seg.day0) * p;
    const frac = (day - 1) / (TRIP.days - 1);
    const dn = clamp(Math.floor(day + 1e-6), 1, TRIP.days);
    if (dn !== lastDay) {
      dayNum.textContent = dn;
      dayBlocks.forEach((b, k) => b.classList.toggle('is-on', k < dn));
      lastDay = dn;
    }

    // Pixel scene: the crew's current activity
    let kind = 'intro', cap = 'The crew, packed and ready', where = 'New York';
    if (pos >= N) { kind = 'home'; cap = 'Home the same day'; where = 'New York'; }
    else if (seg) {
      const list = SCENES[iSeg];
      const [k2, c2] = list[Math.min(list.length - 1, Math.floor(p * list.length))];
      kind = k2; cap = c2; where = seg.place;
    }
    PixelCrew.show(kind, cap, reduced);
    if (sceneWhere.textContent !== where) sceneWhere.textContent = where;

    // Crew marker hops beside the city you're staying in
    const crewCity = seg && (seg.type === 'stay' || seg.type === 'loop') ? seg.city : pos >= N ? 'jfk' : pos < 0 ? 'jfk' : null;
    const ck = crewCity ? crewCity + ':' + Math.round(s * 1e5) : 'none';
    if (ck !== crewKey) {
      crewKey = ck;
      if (crewCity) {
        const [cx, cy] = ptOf(crewCity);
        gCrew.setAttribute('transform', `translate(${f2(cx)} ${f2(cy)}) scale(${Math.round(s * 1e5) / 1e5}) translate(-25 36) scale(1.6)`);
        gCrew.style.opacity = 1;
      } else gCrew.style.opacity = 0;
    }
    const segKey = pos < 0 ? 'intro' : pos >= N ? 'outro' : iSeg;
    if (segKey !== lastSeg) {
      lastSeg = segKey;
      if (segKey === 'intro') caption.innerHTML = '<b>The route</b> New York · Thailand · Vietnam · Japan';
      else if (segKey === 'outro') caption.innerHTML = '<b>Complete</b> 23 days, three countries, home';
      else {
        const sg = SEGS[segKey];
        caption.innerHTML = `<b>${String(segKey + 1).padStart(2, '0')}</b> ${sg.place}`;
      }
    }

    const settling =
      Math.abs(target - shown) > 0 ||
      Math.abs(tv.cx - cam.cx) > w * 0.0005 ||
      Math.abs(tv.cy - cam.cy) > h * 0.0005 ||
      Math.abs(Math.log(tv.w / cam.w)) > 0.0005;
    if (settling) raf = requestAnimationFrame(render);
    else lastTs = 0;
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  // Cards fade in as they arrive
  const cardIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add('in-view');
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.card, .intro__inner, .outro__inner').forEach((c) => cardIO.observe(c));

  function onMotionChange() {
    reduced = reduceMQ.matches;
    document.documentElement.classList.toggle('reduced', reduced);
    kick();
  }
  reduceMQ.addEventListener ? reduceMQ.addEventListener('change', onMotionChange) : reduceMQ.addListener(onMotionChange);
  document.documentElement.classList.toggle('reduced', reduced);

  window.addEventListener('scroll', kick, { passive: true });
  let rz = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => { measure(); lastS = -1; kick(); });
  });

  measure();
  shown = readTarget();
  kick();
  document.documentElement.classList.add('ready');

  // Exposed for debugging / tests
  window.__trip = { get pos() { return shown; }, get target() { return target; }, get cam() { return cam; }, SEGS };
})();
