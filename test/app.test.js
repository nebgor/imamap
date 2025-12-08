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

  it("preloads major road corridors into the bus graph", () => {
    expect(html).toContain("const majorRoads");
    expect(html).toContain("Kwinana Fwy BUS");
    expect(html).toContain("Mitchell Fwy BUS");
  });

  it("surfaces graph metadata in the debug panel", () => {
    expect(html).toContain("Graphs: bus");
  });

  it("routes via bus/rail graphs instead of straight lines", () => {
    expect(html).toContain("graphRouteToCBD");
    expect(html).toContain("shortestPath(graph, src, dst, goalKey)");
    expect(html).toContain("pathFromGraph(localBusGraph");
  });

  it("random sims favor bus-to-rail paths with multi-point routes", () => {
    expect(html).toContain("busToRailRoute");
    expect(html).toContain("randomTravelPlan");
    expect(html).toContain("travel.path.length < 3");
  });

  it("renders legend and debug overlay", () => {
    expect(html).toContain("legend-bar");
    expect(html).toContain("Debug");
    expect(html).toContain("debug-path");
  });
});
