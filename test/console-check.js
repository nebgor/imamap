// Headless console check for the deployed site.
import { chromium } from "playwright-chromium";

const URL = "https://nebgor.github.io/imamap/";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000); // allow scripts to init
  await browser.close();
  if (errors.length) {
    console.error("Console errors:", errors);
    process.exit(1);
  }
  console.log("Console clean for", URL);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
