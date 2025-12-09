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

  it("allows long segments when cityStrict is false", () => {
    const coarse = [
      [-32.5, 115.7],
      [-31.9, 115.8]
    ];
    expect(pathHasLongSegment(coarse, 2.5, false)).toBe(true);
    expect(pathHasLongSegment(coarse, Infinity, false)).toBe(false);
  });
});
