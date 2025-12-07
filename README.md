# Perth PT Commute Sketch

Leaflet-based single-page map that sketches approximate public transport commute times into Perth CBD using PTA stop data from WA SLIP.

- Live map: https://nebgor.github.io/imamap/
- Data: WA SLIP Transport_Public_PT_Stops (feature layer 14)
- Target: Perth Station / Perth Underground (lat -31.9523, lon 115.8590)

## Running locally

Open `index.html` in a modern browser; it fetches data directly from the WA SLIP API.

## Quality checks

- Lint: `npm run lint`
- Test: `npm test` (basic contract checks on the HTML)
- CI: see `.github/workflows/ci.yml`
