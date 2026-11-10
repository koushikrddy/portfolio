// Temporary: drive headless Chrome over CDP for layout probes + screenshots.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9444;
const [, , URL = "http://localhost:5173/", W = "1440", H = "1000", SHOT = "", SCROLL = "0", EXPR = "null", CLIP = ""] =
  process.argv;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.cwd()}/.chrome-probe-${Date.now()}`,
    `--window-size=${W},${H}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = await res.json();
      const page = pages.find((p) => p.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error("no devtools");
}

const ws = new WebSocket(await getWs());
await new Promise((res) => ws.addEventListener("open", res, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) => {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((r) => pending.set(mid, r));
};

await send("Emulation.setDeviceMetricsOverride", {
  width: Number(W),
  height: Number(H),
  deviceScaleFactor: 1,
  mobile: Number(W) < 800,
});
await send("Page.enable");
await send("Page.navigate", { url: URL });
await sleep(3500);
if (Number(SCROLL)) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${SCROLL})` });
  await sleep(1200);
}
const probe = await send("Runtime.evaluate", { returnByValue: true, expression: EXPR });
console.log(JSON.stringify(probe.result?.result?.value ?? probe, null, 2));

if (SHOT) {
  const clip = CLIP ? JSON.parse(CLIP) : undefined;
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: clip ? { ...clip, scale: clip.scale ?? 2 } : undefined,
    captureBeyondViewport: Boolean(clip),
  });
  writeFileSync(SHOT, Buffer.from(shot.result.data, "base64"));
  console.log("saved", SHOT);
}
ws.close();
chrome.kill();
process.exit(0);
