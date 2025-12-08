# Project Context

- Purpose: Static Leaflet map that sketches Perth public transport commute times to the CBD using WA SLIP PTA stop data. All logic lives in `index.html` (fetches SLIP stops/routes, caches locally, draws heat/paths, has debug panel and `?status=json` mode).
- Routing: Bus and rail graphs are preloaded; major bus corridors (e.g., Kwinana Fwy BUS, Mitchell Fwy BUS, Albany Hwy) feed the bus graph. Click/random simulations should follow graph paths toward the CBD, preferring corridor/graph routing over straight lines. Fallback is corridor-based legacy routing if graphs fail.
- Commands: `npm run lint`, `npm test`, `npm run coverage`, `npm run e2e` (smoke fetch of deployed status JSON). Local dev: open `index.html` directly in a browser.
- CI/CD: GitHub Actions CI on main/master runs lint + vitest. Pages deploys the repo contents on push to main/master.
- Current state: Local change to `test/app.test.js` adds assertions about major road corridors and graph-based routing; not committed/pushed yet. Working tree: `master` tracking `origin/master`, clean except for that modified test.
