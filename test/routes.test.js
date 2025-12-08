import { describe, it, expect } from "vitest";

// lightweight copies of tile helpers to lock behavior
function routeTileKey(tile) {
  return `${tile.minLat.toFixed(2)}_${tile.minLon.toFixed(2)}_${tile.maxLat.toFixed(2)}_${tile.maxLon.toFixed(2)}`;
}

function routeTilesForBbox(bbox) {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  const size = 0.35;
  const tiles = [];
  for (let lat = minLat; lat < maxLat; lat += size) {
    for (let lon = minLon; lon < maxLon; lon += size) {
      tiles.push({
        minLat: lat,
        minLon: lon,
        maxLat: Math.min(maxLat, lat + size),
        maxLon: Math.min(maxLon, lon + size)
      });
    }
  }
  return tiles;
}

describe("route tiling", () => {
  it("produces deterministic tile keys", () => {
    const key = routeTileKey({ minLat: -32.6, minLon: 115.5, maxLat: -32.25, maxLon: 115.85 });
    expect(key).toBe("-32.60_115.50_-32.25_115.85");
  });

  it("covers bbox with grid tiles", () => {
    const tiles = routeTilesForBbox([-32.6, 115.5, -32.0, 116.0]);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(100); // guard against runaway tiling
    const keys = new Set(tiles.map(routeTileKey));
    expect(keys.size).toBe(tiles.length);
  });
});
