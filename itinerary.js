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
    if (!minor) el('circle', { class: 'pulse', r: 6 }, g);
    el('circle', { class: 'ring', r: minor ? 3.2 : 6.5 }, g);
    el('circle', { class: 'dot', r: minor ? 1.6 : 3.4 }, g);
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
  const railFill = document.querySelector('.rail__fill');
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
  const VEH_SCALE = { plane: 1.1, train: 1.2, van: 1.4, boat: 1.35 }; // wider than this (SVG units) and the camera follows the vehicle

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
      return { v: fit(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), 0.6, 0.45) };
    }
    const [x0, y0, x1, y1] = seg.bbox;
    const v = fit(x0, y0, x1, y1, seg.type === 'loop' ? 0.35 : 0.45, seg.type === 'loop' ? 0.9 : 1.6);
    if (v.w > FOLLOW_MAX) {
      const vp = vehicleAt(seg, drawFrac(p));
      return { v: { cx: vp.x, cy: vp.y, w: 900 }, cutKey: i + ':' + seg.hops.indexOf(vp.hop), jumpHop: vp.hop.jump };
    }
    return { v };
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
    railFill.style.transform = `scaleY(${f2(frac * 1000) / 1000})`;
    const dn = clamp(Math.floor(day + 1e-6), 1, TRIP.days);
    if (dn !== lastDay) { dayNum.textContent = dn; lastDay = dn; }
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
