import { chromium } from "playwright-chromium";

async function main() {
  const url = process.env.LIVE_URL || "https://nebgor.github.io/imamap/";
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const summary = {};
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("#status", { timeout: 30000 });
    await page.waitForFunction(
      () => {
        const meta = document.getElementById("debug-meta");
        const status = document.getElementById("status");
        return (
          meta &&
          /Stops: \d+/.test(meta.textContent || "") &&
          status &&
          /(Ready|Rendered|Using)/.test(status.textContent || "")
        );
      },
      { timeout: 30000 }
    );
    const metaText = await page.textContent("#debug-meta");
    summary.meta = metaText;
    if (/Stops: 0/.test(metaText || "")) {
      throw new Error("Stops still zero after load");
    }
    await page.click("#demoRun");
    await page.waitForFunction(
      () => {
        const dp = document.getElementById("debug-path");
        return dp && /Path pts: \d+/.test(dp.textContent || "") && !(dp.textContent || "").includes("No path");
      },
      { timeout: 15000 }
    );
    const debugPath = await page.textContent("#debug-path");
    summary.debugPath = debugPath;
    if (/Path pts: 0|Path pts: 1|Path pts: 2/.test(debugPath || "")) {
      throw new Error(`Too few path points: ${debugPath}`);
    }
    if (/Errors:\s*[1-9]/.test(metaText || "")) {
      throw new Error(`Errors present: ${metaText}`);
    }
    console.log("LIVE DEBUG OK", summary);
    process.exit(0);
  } catch (err) {
    console.error("LIVE DEBUG FAIL", { err: err.message, summary });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
