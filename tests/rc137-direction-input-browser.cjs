"use strict";
// Native rAF locomotion and trusted keyboard/touch controls. Staged route, legal
// starting point and player invulnerability; no natural campaign completion claim.
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  assert = require("node:assert/strict"),
  cp = require("node:child_process");
const { chromium } = require(
  path.join(
    process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "/tmp/pw155/node_modules",
    "playwright",
  ),
);
const root = path.resolve(
    process.env.HAPIL_SOURCE_ROOT || path.join(__dirname, ".."),
  ),
  out = process.env.HAPIL_QA_OUTPUT || "/tmp/hapil-rc137-direction-input";
fs.mkdirSync(out, { recursive: true });
const bridge = `\nwindow.__RC137_DIRECTION_QA__={project:(...a)=>G(...a),move:(...a)=>ft(...a),camera:s=>HAPIL_viewCameraRC104(s.x,s.y,s),blink:HAPIL_blinkVectorV31345};`;
const mime = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  try {
    const f = path.resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(req.url, "http://localhost").pathname.replace(
            /^\/$/,
            "/index.html",
          ),
        ),
    );
    if (!f.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader(
      "Content-Type",
      mime[path.extname(f)] || "application/octet-stream",
    );
    const data = fs.readFileSync(f);
    res.end(
      f.endsWith("/assets/index-v31526.js")
        ? Buffer.from(
            data
              .toString()
              .replace(
                "window.__HAPIL_SIMPLE_V31368__=Object.freeze({installed:true,tick",
                "window.__RC137_NATIVE_DODGE__=dodge;window.__HAPIL_SIMPLE_V31368__=Object.freeze({installed:true,tick",
              ) + bridge,
          )
        : data,
    );
  } catch {
    res.writeHead(404).end();
  }
});
const report = {
  status: "running",
  commit: cp
    .execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" })
    .trim(),
  scope:
    "Native staged movement, combat manual override, touch ownership and real CDP orientation; separate deterministic 30/60/120Hz coverage",
  profiles: [],
};
const save = () =>
  fs.writeFileSync(
    path.join(out, "direction-input-results.json"),
    JSON.stringify(report, null, 2),
  );
async function prepare(page, mode, zone = "dist04") {
  await page.evaluate(
    ({ mode, zone }) => {
      const C = window.__HAPIL_CONTROLS_V31329__,
        s = C.binding.state.current,
        Q = window.__RC137_DIRECTION_QA__,
        D = window.__HAPIL_DIRECTION_INPUT_RC137__;
      C.setMode(mode);
      const entered = window.__HAPIL_RC69__.enter(s, zone);
      if (s.zone !== zone)
        throw Error(
          "native route did not enter " + zone + ": " + JSON.stringify(entered),
        );
      C.binding.input.current.clear();
      const R=window.__HAPIL_BATTLE_ARENA_RC138__;
      let point = null;
      for(let r=0;r<8&&!point;r++)for(const [x,y]of [[13.8+r,24.2],[13.8-r,24.2],[13.8,24.2+r],[13.8,24.2-r]]){
        const a={x,y};if(R.contains(a,'left',.8)&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].every(key=>{const v=D.read(new Set([key]));return R.contains({x:x+v.x*2.6,y:y+v.y*2.6},'left',.8);}))point=a;
      }
      if (!point) throw Error("no native clear movement fixture");
      s.x = point.x;
      s.y = point.y;
      s.moveVx = s.moveVy = 0;
      s.invulnerableUntil = s.time + 90;
      s.target = null;
      s.path = [];
      s.heroMotion = { ...s.heroMotion, kind: "idle", until: s.time };
      window.__RC137_START__ = point;
    },
    { mode, zone },
  );
  await page.waitForTimeout(250);
}
async function sample(page, keys, duration = 220) {
  await page.evaluate(() => {
    const s = window.__MONGSE_QA_STATE__,
      p = window.__RC137_START__;
    s.x = p.x;
    s.y = p.y;
    s.moveVx = 3;
    s.moveVy = -2;
    s.target = { x: p.x + 1, y: p.y - 1, autoProgressV31301: true };
    s.path = [s.target];
    s.autoEvadeUntil31223 = s.time + 1;
  });
  for (const key of keys) await page.keyboard.down(key);
  await page.evaluate(() => {
    const s = window.__MONGSE_QA_STATE__;
    if (window.__HAPIL_CONTROLS_V31329__.effective() === "full") {
      const before = { x: s.x, y: s.y, last: s.lastDodgeAt },
        invulnerable = s.invulnerableUntil;
      s.invulnerableUntil = 0;
      const result = window.__RC137_NATIVE_DODGE__(s);
      s.invulnerableUntil = invulnerable;
      if (
        result ||
        s.x !== before.x ||
        s.y !== before.y ||
        s.lastDodgeAt !== before.last
      )
        throw Error("late full-auto dodge overwrote held input");
    }
    window.__RC137_SAMPLES__ = [];
    window.__RC137_RECORD__ = true;const epoch=(window.__RC137_RECORD_EPOCH__??0)+1;window.__RC137_RECORD_EPOCH__=epoch;
    const q = window.__RC137_DIRECTION_QA__;
    let prior = null,last = 0;
    function frame(at) {
      if (!window.__RC137_RECORD__||window.__RC137_RECORD_EPOCH__!==epoch) return;
      const state = window.__MONGSE_QA_STATE__;
      if(!prior){prior={x:state.x,y:state.y};last=at;requestAnimationFrame(frame);return;}
      const a = q.project(prior.x, prior.y),
        b = q.project(state.x, state.y),
        cam = q.camera(state);
      window.__RC137_SAMPLES__.push({
        dx: b.x - a.x,
        dy: b.y - a.y,
        dt: at - last,
        time: state.time,
        target: !!state.target,
        dodge: state.autoEvadeUntil31223 > state.time,
        keys: [...window.__HAPIL_CONTROLS_V31329__.binding.input.current],
        velocity: [state.moveVx, state.moveVy],
        camera: cam,
        zone: state.zone,
      });
      prior = { x: state.x, y: state.y };
      last = at;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
  await page.waitForTimeout(duration);
  await page.waitForFunction(()=>window.__RC137_SAMPLES__.length>=3,null,{timeout:10000});
  const rows = await page.evaluate(() => {
    window.__RC137_RECORD__ = false;
    return window.__RC137_SAMPLES__;
  });
  for (const key of keys) await page.keyboard.up(key);
  return rows;
}
function verify(rows, x, y, label) {
  assert(rows.length >= 2, label + " native frames");
  let progress = 0;
  for (const r of rows) {
    if (!x)
      assert(
        Math.abs(r.dx) < 1e-5,
        label + " unexpected horizontal " + JSON.stringify(r),
      );
    if (!y)
      assert(
        Math.abs(r.dy) < 1e-5,
        label + " unexpected vertical " + JSON.stringify(r),
      );
    if (x && y)
      assert(
        Math.abs(Math.abs(r.dx) - Math.abs(r.dy)) < 1e-5,
        label + " diagonal slope",
      );
    assert(r.dx * x + r.dy * y >= -1e-5, label + " wrong heading");
    assert.equal(r.target, false, label + " auto route cleared");
    assert.equal(r.dodge, false, label + " auto dodge cancelled");
    progress += r.dx * x + r.dy * y;
  }
  if (x || y) assert(progress > 0.1, label + " moves");
  return {
    frames: rows.length,
    progress,
    maxOrthogonal: Math.max(
      ...rows.map((r) =>
        !x
          ? Math.abs(r.dx)
          : !y
            ? Math.abs(r.dy)
            : Math.abs(Math.abs(r.dx) - Math.abs(r.dy)),
      ),
    ),
    meanFrameMs: rows.reduce((n, r) => n + r.dt, 0) / rows.length,
    camera: rows.at(-1).camera,
  };
}
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.HAPIL_CHROMIUM || "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    report.browser = browser.version();
    for (const [name, width, height, mobile, cpu] of [
      ["pc", 1180, 757, false, 1],
      ["mobile", 390, 844, true, 1],
      ["mobile-cpu4", 390, 844, true, 4],
    ].filter(
      (p) =>
        !process.env.HAPIL_QA_DIRECTION_PROFILE ||
        p[0] === process.env.HAPIL_QA_DIRECTION_PROFILE,
    )) {
      const context = await browser.newContext({
          viewport: { width, height },
          isMobile: mobile,
          hasTouch: mobile,
          deviceScaleFactor: mobile ? 2 : 1,
        }),
        page = await context.newPage(),
        row = { name, status: "running", errors: [], missing: [], cases: [] };
      report.profiles.push(row);
      save();
      page.on("pageerror", (e) => row.errors.push(String(e)));
      page.on("response", (r) => {
        if (r.status() >= 400) row.missing.push(r.url());
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
      await page.waitForFunction(
        () =>
          window.__HAPIL_RC133_NATIVE__?.installed &&
          window.__HAPIL_DIRECTION_INPUT_RC137__,
        null,
        { timeout: 60000 },
      );
      await page.keyboard.press("Escape");
      await page.evaluate(() =>
        window.__HAPIL_SAMONG_RC91__.unlock(null, "777"),
      );
      await page
        .getByRole("button", { name: "새 게임 시작", exact: true })
        .click();
      await page.locator('[data-game-mode-v31354="DREAM"]').click();
      await page
        .getByRole("button", { name: "이 편성으로 접속", exact: true })
        .click();
      await page.waitForFunction(
        () => window.__HAPIL_CONTROLS_V31329__?.binding?.phase === "game",
      );
      for (
        let i = 0;
        i < 20 && (await page.locator("#hapil-story-rc51").count());
        i++
      ) {
        await page.keyboard.press("Enter");
        await page.waitForTimeout(70);
      }
      for (const mode of ["manual", "semi", "full"]) {
        await prepare(page, mode);
        for (const [keys, x, y] of [
          [["ArrowUp"], 0, -1],
          [["ArrowDown"], 0, 1],
          [["ArrowLeft"], -1, 0],
          [["ArrowRight"], 1, 0],
          [["ArrowUp", "ArrowRight"], 1, -1],
          [["ArrowUp", "ArrowDown"], 0, 0],
        ]) {
          const rows = await sample(page, keys);
          row.cases.push({
            mode,
            keys,
            ...verify(rows, x, y, name + "/" + mode + "/" + keys),
          });
          save();
        }
      }
      await prepare(page, "manual");
      await page.keyboard.down("ArrowUp");
      await page.keyboard.down("ArrowRight");
      await page.waitForTimeout(100);
      await page.keyboard.up("ArrowRight");
      const transition = await page.evaluate(async () => {
        const s = window.__MONGSE_QA_STATE__,
          Q = window.__RC137_DIRECTION_QA__;
        const start = Q.project(s.x, s.y);
        await new Promise((r) => setTimeout(r, 160));
        const end = Q.project(s.x, s.y);
        return { dx: end.x - start.x, dy: end.y - start.y };
      });
      assert(
        Math.abs(transition.dx) < 1e-5 && transition.dy < 0,
        "one key released: Up stays vertical",
      );
      await page.keyboard.up("ArrowUp");
      await page.waitForTimeout(30);
      const stop = await page.evaluate(async () => {
        const s = window.__MONGSE_QA_STATE__,
          Q = window.__RC137_DIRECTION_QA__,
          start = Q.project(s.x, s.y);
        await new Promise((r) => setTimeout(r, 120));
        const end = Q.project(s.x, s.y);
        return {
          dx: end.x - start.x,
          dy: end.y - start.y,
          velocity: [s.moveVx, s.moveVy],
          held: [...window.__HAPIL_CONTROLS_V31329__.binding.input.current],
        };
      });
      assert(
        Math.abs(stop.dx) < 1e-5 && Math.abs(stop.dy) < 1e-5,
        "key release stops inertia " + JSON.stringify(stop),
      );
      assert.deepEqual(stop.velocity, [0, 0]);
      row.release = { transition, stop };
      if (mobile) {
        await prepare(page, "manual");
        const pad = page.locator("[data-mobile-stick]");
        assert.equal(await pad.count(), 1, "native movement stick");
        const box = await pad.boundingBox();
        assert(box);
        const touch = { x: box.x + box.width / 2, y: box.y + box.height * 0.2 };
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ ...touch, id: 1 }],
        });
        await page.waitForTimeout(90);
        assert(
          await page.evaluate(() =>
            window.__HAPIL_CONTROLS_V31329__.binding.input.current.has(
              "ArrowUp",
            ),
          ),
          "trusted native touch owns Up",
        );
        const touchMove = await page.evaluate(async () => {
          const s = window.__MONGSE_QA_STATE__,
            Q = window.__RC137_DIRECTION_QA__,
            start = Q.project(s.x, s.y);
          await new Promise((r) => setTimeout(r, 120));
          const end = Q.project(s.x, s.y);
          return { dx: end.x - start.x, dy: end.y - start.y };
        });
        assert(
          Math.abs(touchMove.dx) < 1e-5 && touchMove.dy < 0,
          "native manual stick Up is vertical",
        );
        await page.keyboard.down("ArrowUp");
        await page.keyboard.up("ArrowUp");
        assert(
          await page.evaluate(() =>
            window.__HAPIL_CONTROLS_V31329__.binding.input.current.has(
              "ArrowUp",
            ),
          ),
          "keyboard release preserves the held touch",
        );
        const rt = { x: box.x + box.width * 0.8, y: box.y + box.height * 0.2 };
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ ...rt, id: 1 }],
        });
        await page.waitForTimeout(40);
        const diagonal = await page.evaluate(async () => {
          const s = window.__MONGSE_QA_STATE__,
            Q = window.__RC137_DIRECTION_QA__,
            start = Q.project(s.x, s.y);
          await new Promise((r) => setTimeout(r, 90));
          const end = Q.project(s.x, s.y);
          return {
            dx: end.x - start.x,
            dy: end.y - start.y,
            held: [...window.__HAPIL_CONTROLS_V31329__.binding.input.current],
          };
        });
        assert(
          diagonal.dx > 0 &&
            diagonal.dy < 0 &&
            Math.abs(diagonal.dx + diagonal.dy) < 1e-5,
          "native stick diagonal uses screen headings " +
            JSON.stringify(diagonal),
        );
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ ...touch, id: 1 }],
        });
        await page.waitForTimeout(40);
        assert(
          await page.evaluate(() => {
            const k = window.__HAPIL_CONTROLS_V31329__.binding.input.current;
            return k.has("ArrowUp") && !k.has("ArrowRight");
          }),
          "stick diagonal-to-Up transition releases Right",
        );
        await page.keyboard.down("ArrowUp");
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        assert(
          await page.evaluate(() =>
            window.__HAPIL_CONTROLS_V31329__.binding.input.current.has(
              "ArrowUp",
            ),
          ),
          "touch release preserves the held keyboard",
        );
        await page.keyboard.up("ArrowUp");
        await prepare(page, "manual");
        const attack = await page
          .locator('[data-mobile-action="A"]')
          .boundingBox();
        assert(attack);
        const at = {
          x: attack.x + attack.width / 2,
          y: attack.y + attack.height / 2,
        };
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ ...touch, id: 5 }],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            { ...touch, id: 5 },
            { ...at, id: 6 },
          ],
        });
        await page.waitForTimeout(50);
        assert(
          await page.evaluate(
            () =>
              window.__HAPIL_MOBILE_V31366__.snapshot().pointers.length === 2,
          ),
          "simultaneous native stick and attack pointers",
        );
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [{ ...at, id: 6 }],
        });
        assert(
          await page.evaluate(() =>
            window.__HAPIL_CONTROLS_V31329__.binding.input.current.has(
              "ArrowUp",
            ),
          ),
          "attack-pointer release preserves movement stick",
        );
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        row.multiTouch = {
          diagonal,
          hybridOwnership: true,
          stickAndAttack: true,
        };
        row.stickAxes = [];
        for (const [key, sx, sy] of [
          ["ArrowUp", 0, -1],
          ["ArrowDown", 0, 1],
          ["ArrowLeft", -1, 0],
          ["ArrowRight", 1, 0],
        ]) {
          await prepare(page, "semi");
          const t = {
            x: box.x + box.width * (0.5 + sx * 0.3),
            y: box.y + box.height * (0.5 + sy * 0.3),
          };
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ ...t, id: 8 }],
          });
          await page.waitForTimeout(50);
          const observed = await page.evaluate(async () => {
            const s = window.__MONGSE_QA_STATE__,
              Q = window.__RC137_DIRECTION_QA__,
              start = Q.project(s.x, s.y),
              keys = [
                ...window.__HAPIL_CONTROLS_V31329__.binding.input.current,
              ];
            await new Promise((r) => setTimeout(r, 180));
            const end = Q.project(s.x, s.y);
            return { dx: end.x - start.x, dy: end.y - start.y, keys };
          });
          assert(observed.keys.includes(key), key + " trusted stick input");
          if (!sx) assert(Math.abs(observed.dx) < 1e-5);
          if (!sy) assert(Math.abs(observed.dy) < 1e-5);
          assert(
            observed.dx * sx + observed.dy * sy > 0.1,
            key + " trusted stick moves",
          );
          row.stickAxes.push({ key, ...observed });
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
        }
        await prepare(page, "full");
        const canvas = await page.locator(".game-stage canvas").boundingBox();
        assert(canvas);
        const drag = {
          x: canvas.x + canvas.width * 0.42,
          y: canvas.y + canvas.height * 0.76,
        };
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ ...drag, id: 2 }],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: drag.x, y: drag.y - 65, id: 2 }],
        });
        await page.waitForTimeout(60);
        const fullAutoTouch = await page.evaluate(async () => {
          const s = window.__MONGSE_QA_STATE__,
            Q = window.__RC137_DIRECTION_QA__,
            start = Q.project(s.x, s.y),
            keys = [...window.__HAPIL_CONTROLS_V31329__.binding.input.current];
          await new Promise((r) => setTimeout(r, 120));
          const end = Q.project(s.x, s.y);
          return { dx: end.x - start.x, dy: end.y - start.y, keys };
        });
        assert(
          fullAutoTouch.keys.includes("ArrowUp") &&
            Math.abs(fullAutoTouch.dx) < 1e-5 &&
            fullAutoTouch.dy < 0,
          "full-auto native battlefield Up drag " +
            JSON.stringify(fullAutoTouch),
        );
        row.fullAutoTouch = fullAutoTouch;
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: 844,
          height: 390,
          deviceScaleFactor: 2,
          mobile: true,
          screenOrientation: { type: "landscapePrimary", angle: 90 },
        });
        await page.waitForTimeout(250);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        assert.equal(
          await page.evaluate(() =>
            window.__HAPIL_CONTROLS_V31329__.binding.input.current.has(
              "ArrowUp",
            ),
          ),
          false,
          "real orientation clears held touch",
        );
        await prepare(page, "full");
        const rows = await sample(page, ["ArrowDown"]);
        row.rotation = {
          touchMove,
          landscape: verify(rows, 0, 1, name + "/landscape"),
        };
      }
      row.fixedSpeed = await page.evaluate(
        () => window.__HAPIL_POLICY_RC127__.fixedSpeed,
      );
      assert.equal(row.fixedSpeed, 4.75 * (1 + 3 * 0.07) * (1 + 7 * 0.018));
      assert.deepEqual(row.errors, []);
      assert.deepEqual(row.missing, []);
      row.status = "pass";
      save();
      await context.close();
    }
    report.status = "pass";
    save();
    console.log(
      "PASS RC137 native directions",
      JSON.stringify(
        report.profiles.map((r) => ({
          name: r.name,
          cases: r.cases.length,
          release: r.release,
          rotation: r.rotation,
        })),
      ),
    );
  } finally {
    await browser?.close();
    server.close();
  }
})().catch((e) => {
  report.status = "fail";
  report.error = String(e.stack || e);
  save();
  console.error(e);
  server.close();
  process.exitCode = 1;
});
