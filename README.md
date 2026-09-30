# Three Weeks East

A scroll-driven field-journal itinerary for Thailand, Vietnam and Japan (May 26 – June 17, 2027).

- `index.html`: the page, with the hand-drawn map inlined as SVG
- `itinerary.js`: the trip data (`ITINERARY`, plus `SCENES` for what the crew does on each leg), the pixel scene renderer (`PixelCrew`) and the scroll/map engine
- `styles.css`: the styles

There's no build step: open `index.html` directly, or serve the folder as static files.

The coastlines come from Natural Earth (public domain) through `world-atlas`. `tools/build-map.js` regenerates the inline paths:

```
npm pack world-atlas@2 && tar xzf world-atlas-2.0.2.tgz
node tools/build-map.js package/countries-10m.json   # paste output between LAND:START / LAND:END
```
