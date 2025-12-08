import { describe, it, expect } from "vitest";

// lightweight versions of helpers used in index.html for deterministic tests
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestPointIndex(points, lat, lon) {
  let idx = 0;
  let best = Infinity;
  points.forEach((p, i) => {
    const d = haversine(lat, lon, p[0], p[1]);
    if (d < best) {
      best = d;
      idx = i;
    }
  });
  return { idx, distKm: best };
}

function pathLength(path) {
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) {
    d += haversine(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
  }
  return d;
}

describe("helpers", () => {
  it("haversine is symmetric and non-zero for distant points", () => {
    const d1 = haversine(-31.95, 115.86, -32.05, 115.85);
    const d2 = haversine(-32.05, 115.85, -31.95, 115.86);
    expect(Math.abs(d1 - d2)).toBeLessThan(1e-6);
    expect(d1).toBeGreaterThan(10);
  });

  it("nearestPointIndex picks the closest vertex", () => {
    const pts = [
      [-31.95, 115.86],
      [-32.0, 115.86],
      [-32.1, 115.86]
    ];
    const near = nearestPointIndex(pts, -32.02, 115.86);
    expect(near.idx).toBe(1);
  });

  it("pathLength sums multiple segments", () => {
    const p = [
      [-31.95, 115.86],
      [-32.0, 115.86],
      [-32.05, 115.86]
    ];
    const len = pathLength(p);
    expect(len).toBeGreaterThan(10);
  });
});
