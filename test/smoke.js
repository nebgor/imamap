// Minimal smoke test: load live page status JSON and assert OK
import https from "https";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

(async () => {
  const url = "https://nebgor.github.io/imamap/?status=json";
  const json = await fetchJson(url);
  if (!json || json.status !== "ok") {
    console.error("Smoke fail:", json);
    process.exit(1);
  }
  console.log("Smoke ok", { heatCount: json.heatCount, stopCacheCount: json.stopCacheCount });
})();
