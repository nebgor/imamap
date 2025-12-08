// Minimal smoke test: load live page status JSON and assert OK
import https from "https";

function fetchBody(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

(async () => {
  const url = "https://nebgor.github.io/imamap/?status=json";
  const res = await fetchBody(url);
  if (res.status !== 200) {
    console.error("Smoke fail: non-200", res.status);
    process.exit(1);
  }
  try {
    const parsed = JSON.parse(res.body);
    if (parsed.status === "ok") {
      console.log("Smoke ok", { heatCount: parsed.heatCount, stopCacheCount: parsed.stopCacheCount });
      return;
    }
  } catch {
    // fall through to HTML validation
  }
  if (res.body.includes("Perth PT commute sketch")) {
    console.log("Smoke ok (html)", { length: res.body.length });
    return;
  }
  console.error("Smoke fail: unexpected body");
  process.exit(1);
})();
