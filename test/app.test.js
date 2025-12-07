import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");

describe("index.html basics", () => {
  it("queries SLIP PTA stops with metro bounding box", () => {
    expect(html).toContain("Transport_Public_PT_Stops/FeatureServer/14/query");
    expect(html).toContain("geometry=-32.6,115.5,-31.4,116.2");
    expect(html).toContain("outFields=stopid,stopname");
  });

  it("targets Perth CBD coordinates", () => {
    expect(html).toContain("target = { lat: -31.9523, lon: 115.8590 }");
  });

  it("contains corridor and hills adjustments for non-radial travel", () => {
    expect(html).toMatch(/const corridors\s*=\s*\[/);
    expect(html).toMatch(/hillsZone/);
  });

  it("renders legend and debug overlay", () => {
    expect(html).toContain("legend-bar");
    expect(html).toContain("Debug");
  });
});
