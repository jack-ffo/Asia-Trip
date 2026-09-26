// One-off helper (not needed at runtime): converts Natural Earth (world-atlas
// TopoJSON, public domain) into inline SVG paths for index.html using the same
// equirectangular projection as itinerary.js. Usage:
//   node tools/build-map.js path/to/countries-10m.json > map-paths.svg
const fs = require('fs');
const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

// Must match PROJ in itinerary.js
const LON0 = -100, LAT0 = 72, K = 10, KX = 9;
const px = lon => (lon - LON0) * KX;
const py = lat => (LAT0 - lat) * K;
const REGION = { lon0: -100, lon1: 170, lat0: -15, lat1: 72 };
const DETAIL = { lon0: 94, lon1: 146, lat0: 5, lat1: 42 };
// Extra-fine boxes where the camera zooms right in
const FINE = [
  [97, 11.5, 102.5, 20.5], // Bangkok, Chiang Mai
  [104.3, 19.8, 108.2, 23.4], // Hanoi, Cao Bang, Lan Ha Bay
  [134.2, 33.6, 140.8, 36.6], // Kansai, Tokyo
];
const inBox = (lon, lat, [a, b, c, d]) => lon > a && lon < c && lat > b && lat < d;
const tolAt = (lon, lat) => FINE.some((f) => inBox(lon, lat, f)) ? 0.004 : inDetail(lon, lat) ? 0.03 : 0.18;

const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => {
  let x = 0, y = 0;
  return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; });
});
const inDetail = (lon, lat) => lon > DETAIL.lon0 && lon < DETAIL.lon1 && lat > DETAIL.lat0 && lat < DETAIL.lat1;

function dp(pts) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let md = 1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      // closed arcs (islands) have equal endpoints: fall back to point distance
      const d = len ? Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len : Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
      const score = d / tolAt(pts[i][0], pts[i][1]);
      if (score > md) { md = score; mi = i; }
    }
    if (mi >= 0) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const simp = arcs.map(a => {
  const detail = a.some(([lon, lat]) => inDetail(lon, lat));
  return { pts: dp(a), detail };
});

function ring(idx) {
  let out = [], detail = false;
  for (const i of idx) {
    const s = i < 0 ? simp[~i] : simp[i];
    const pts = i < 0 ? s.pts.slice().reverse() : s.pts;
    detail = detail || s.detail;
    out.push(...(out.length ? pts.slice(1) : pts));
  }
  // rings that cross the antimeridian (Russia, Fiji): keep longitudes continuous
  for (let i = 1; i < out.length; i++) {
    let lon = out[i][0];
    while (lon - out[i - 1][0] > 180) lon -= 360;
    while (lon - out[i - 1][0] < -180) lon += 360;
    if (lon !== out[i][0]) out[i] = [lon, out[i][1]];
  }
  return { pts: out, detail };
}
function area(p) { let s = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s / 2); }
function bboxHit(p) {
  return p.some(([lon, lat]) => lon > REGION.lon0 && lon < REGION.lon1 && lat > REGION.lat0 && lat < REGION.lat1);
}
function toPath(rings) {
  return rings.map(({ pts }) => {
    let d = '', lx = null, ly = null;
    pts.forEach(([lon, lat], i) => {
      const f = inDetail(lon, lat) ? 100 : 10;
      const x = Math.round(px(lon) * f) / f, y = Math.round(py(lat) * f) / f;
      if (x === lx && y === ly) return;
      d += (i ? 'L' : 'M') + x + ' ' + y; lx = x; ly = y;
    });
    return d + 'Z';
  }).join('');
}

const ids = { '764': 'th', '704': 'vn', '392': 'jp', '840': 'us', '634': 'qa' };
const out = [];
for (const g of topo.objects.countries.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  const rings = [];
  for (const poly of polys) {
    const outer = ring(poly[0]);
    if (!bboxHit(outer.pts)) continue;
    const a = area(outer.pts);
    const fine = outer.pts.some(([lon, lat]) => FINE.some((f) => inBox(lon, lat, f)));
    if (a < (fine ? 0.0003 : outer.detail ? 0.02 : 0.25)) continue;
    rings.push(outer);
    for (const h of poly.slice(1)) { const hr = ring(h); if (area(hr.pts) > 0.05) rings.push(hr); }
  }
  if (!rings.length) continue;
  const cls = ids[g.id] ? ` class="c-${ids[g.id]}"` : '';
  out.push(`<path${cls} data-name="${g.properties.name}" d="${toPath(rings)}"/>`);
}
process.stdout.write(out.join('\n') + '\n');
