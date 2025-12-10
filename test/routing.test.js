import { describe, it, expect } from "vitest";

// Simple stand-in functions copied from the app for testing core routing helpers.
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pathHasLongSegment(path, maxKm = Infinity, cityStrict = false) {
  if (!Number.isFinite(maxKm) || maxKm === Infinity) return false;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = haversine(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    if (seg > maxKm) return true;
    if (
      cityStrict &&
      path[i][0] < -31.5 &&
      path[i][0] > -32.2 &&
      path[i][1] > 115.6 &&
      path[i][1] < 116.1 &&
      seg > 1
    ) {
      return true;
    }
  }
  return false;
}

function densifyPathPoints(path, stepKm = 0.15) {
  if (!Array.isArray(path) || path.length < 2) return path || [];
  const dense = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dist = haversine(a[0], a[1], b[0], b[1]);
    const steps = Math.max(1, Math.ceil(dist / stepKm));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      dense.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  dense.push(path[path.length - 1]);
  return dense;
}

describe("routing helpers", () => {
  it("rejects city segments over 1km when cityStrict is true", () => {
    const coarse = [
      [-31.95, 115.86],
      [-31.94, 115.96] // ~9 km east-west
    ];
    expect(pathHasLongSegment(coarse, 2.5, true)).toBe(true);
  });

  it("densifies a coarse path into many points", () => {
    const coarse = [
      [-31.95, 115.86],
      [-31.90, 115.90]
    ];
    const dense = densifyPathPoints(coarse, 0.2);
    expect(dense.length).toBeGreaterThan(5);
  });

  it("flags Scarborough to CBD coarse straight hop as invalid in cityStrict", () => {
    const scarbToCbd = [
      [-31.894, 115.751],
      [-31.9523, 115.8590]
    ];
    expect(pathHasLongSegment(scarbToCbd, 2.5, true)).toBe(true);
  });

  it("densifies a 10km path into 10+ segments for smooth sim", () => {
    const start = [-31.95, 115.7];
    const end = [-31.95, 115.9];
    const dense = densifyPathPoints([start, end], 0.2);
    expect(dense.length).toBeGreaterThan(10);
  });

  it("allows long segments when cityStrict is false", () => {
    const coarse = [
      [-32.5, 115.7],
      [-31.9, 115.8]
    ];
    expect(pathHasLongSegment(coarse, 2.5, false)).toBe(true);
    expect(pathHasLongSegment(coarse, Infinity, false)).toBe(false);
  });
});

// Minimal graph harness copied from the app for routing sanity checks.
function nearestNodeKey(nodes, lat, lon) {
  let best = null;
  let bestDist = Infinity;
  nodes.forEach((n, k) => {
    const d = haversine(lat, lon, n.lat, n.lon);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  });
  return best;
}

function buildRouteGraph(routes) {
  const nodes = new Map();
  const key = (lat, lon) => `${lat.toFixed(5)},${lon.toFixed(5)}`;
  function addEdge(a, b) {
    const ka = key(a[0], a[1]);
    const kb = key(b[0], b[1]);
    const d = haversine(a[0], a[1], b[0], b[1]);
    if (!nodes.has(ka)) nodes.set(ka, { lat: a[0], lon: a[1], edges: [] });
    if (!nodes.has(kb)) nodes.set(kb, { lat: b[0], lon: b[1], edges: [] });
    nodes.get(ka).edges.push({ k: kb, w: d });
    nodes.get(kb).edges.push({ k: ka, w: d });
  }
  routes.forEach((r) => {
    (r.paths || []).forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        addEdge(path[i], path[i + 1]);
      }
    });
  });
  return { nodes, routes };
}

function shortestPath(graph, start, goal) {
  const nodes = graph.nodes;
  const startKey = nearestNodeKey(nodes, start.lat, start.lon);
  const goalKey = nearestNodeKey(nodes, goal.lat, goal.lon);
  if (!startKey || !goalKey) return null;
  const dist = new Map();
  const prev = new Map();
  const pq = [];
  function push(k, d) {
    pq.push({ k, d });
    pq.sort((a, b) => a.d - b.d);
  }
  nodes.forEach((_, k) => dist.set(k, Infinity));
  dist.set(startKey, 0);
  push(startKey, 0);
  while (pq.length) {
    const { k } = pq.shift();
    if (k === goalKey) break;
    const n = nodes.get(k);
    if (!n) continue;
    n.edges.forEach((e) => {
      const alt = dist.get(k) + e.w;
      if (alt < dist.get(e.k)) {
        dist.set(e.k, alt);
        prev.set(e.k, k);
        push(e.k, alt);
      }
    });
  }
  if (!prev.has(goalKey) && startKey !== goalKey) return null;
  const path = [];
  let u = goalKey;
  while (u) {
    const n = nodes.get(u);
    if (!n) break;
    path.unshift([n.lat, n.lon]);
    if (u === startKey) break;
    u = prev.get(u);
  }
  return path;
}

function buildGridRoutes(size = 10, step = 0.01, origin = [-32.0, 115.8]) {
  const paths = [];
  const [lat0, lon0] = origin;
  // horizontal lines
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push([lat0 + r * step, lon0 + c * step]);
    }
    paths.push(row);
  }
  // vertical lines
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) {
      col.push([lat0 + r * step, lon0 + c * step]);
    }
    paths.push(col);
  }
  return [{ name: "grid", paths }];
}

describe("grid routing sanity", () => {
  it("routes across a 10x10 grid with many segments", () => {
    const routes = buildGridRoutes(10, 0.01);
    const graph = buildRouteGraph(routes);
    const start = { lat: -32.0, lon: 115.8 };
    const goal = { lat: -31.91, lon: 115.89 };
    const path = shortestPath(graph, start, goal);
    expect(path).toBeTruthy();
    expect(path.length).toBeGreaterThan(10);
    const dense = densifyPathPoints(path, 0.2);
    expect(dense.length).toBeGreaterThan(10);
    expect(pathHasLongSegment(dense, 1, true)).toBe(false);
  });
});
