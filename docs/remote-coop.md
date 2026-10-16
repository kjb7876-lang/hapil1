# RC222 remote co-op setup and operating limits

RC222 is a candidate on `codex/rc222-remote-coop`. The recorded public baseline is [`fd9728958b23cdd271d6d1bf6078f0e54184165a`](https://github.com/kjb7876-lang/hapil1/commit/fd9728958b23cdd271d6d1bf6078f0e54184165a); the existing game URL is <https://kjb7876-lang.github.io/hapil1/>. That baseline predates RC222. A baseline reference is not evidence that this candidate is publicly deployed or verified.

No Render service or working public relay URL has been created for this change. `render.yaml` prepares a Free service. The workflow verifies candidate commits only. Obtain separate owner approval for the exact reviewed frontend and relay revisions, service creation/deployment, and any `main` or Pages publication. The latest user request explicitly requires approval before public reflection, so this candidate is not covered by the earlier single-player deployment approval. Record the approved SHAs, approval, actual service URL, and CI evidence before deployment.

## Create the Free relay after approval

1. Open the Render Dashboard and choose **New → Web Service**. Connect the HAPIL GitHub repository and select the approved branch/revision. Creating the service triggers its initial deployment; complete the approval above before clicking **Create Web Service**. A Blueprint using the root `render.yaml` is an equivalent prepared configuration, and also requires approval before creation.
2. Choose the Node runtime, **Free** instance, and a nearby region. Set **Root Directory** to `server`, **Build Command** to `npm ci --omit=dev --cache /tmp/hapil-npm-cache`, **Start Command** to `npm start`, and **Health Check Path** to `/healthz`. Set **Auto-Deploy** to **Off**. For an existing service, **Manual Deploy → Deploy a specific commit** selects the approved SHA. Check the deployed SHA in Render; branch tip alone is insufficient. See [Render service creation](https://render.com/docs/web-services) and [manual deployments](https://render.com/docs/deploys#manual-deploys).
3. Use the following environment values. The origin contains no path or trailing slash. For a different frontend host, replace it with that exact origin; multiple approved origins are comma separated. Never use `*`.

   | Setting | Value |
   | --- | --- |
   | `NODE_VERSION` | `22` |
   | `NODE_ENV` | `production` |
   | `ALLOWED_ORIGINS` | `https://kjb7876-lang.github.io` |
   | `ALLOWED_GAME_IDS` | `hapil` |
   | `MAX_ROOMS` | `16` |
   | `MAX_CONNECTIONS` | `128` |
   | `MAX_CONNECTIONS_PER_IP` | `16` |

4. Keep one instance. Add no payment method, paid plan, database, persistent disk, external scheduler, uptime monitor, or artificial wake-up requests. If the account cannot create the Free service under these constraints, stop and report the account restriction.
5. Once approved deployment finishes, open `https://<actual-service>.onrender.com/healthz` once and require HTTP 200 with `{"ok":true,"protocol":1}`. A successful health check confirms the HTTP process; test the actual browser WebSocket connection separately. Record the real endpoint as `wss://<actual-service>.onrender.com/relay`; `<actual-service>` is a placeholder, not an available server.

The process binds `0.0.0.0` on Render's `PORT`, default `10000`. There is no `HOST` environment option. Render terminates TLS and forwards HTTP/WebSocket upgrades to this same internal port. Clients use the service's public WSS address without `:10000`; no certificate or port forwarding changes are required. See [Render port binding](https://render.com/docs/web-services#port-binding) and [public WebSocket connections](https://render.com/docs/websocket#connecting-from-clients).

The relay uses the actual socket peer address for quotas and ignores forwarded IP headers. Render's reverse proxy can aggregate players behind one peer quota. Do not enable arbitrary proxy trust or assume these limits identify individual Internet users. If an approved deployment hits this limit, record ingress behavior and review a bounded quota change before deploying it. Protocol, validation, and backpressure limits are documented in [server/protocol.md](../server/protocol.md).

## Configure the static frontend and play

The game frontend remains static; its host does not need to run Node. Every player must load the same approved RC222 frontend revision. The baseline Pages URL will not acquire these controls until a separately approved publication has happened.

1. Open **방 만들기** or **방 코드로 참가**, expand **연결 설정**, and paste `wss://<actual-service>.onrender.com/relay` into **중계 서버 주소**. Click **서버 주소 저장** on each browser/device. This stores the endpoint locally; it does not connect until create, join, or resume.
2. The host chooses a nickname, hero, and mode, then creates a room. Share only its room code with guests. Each guest sets the same relay URL, enters the room code, selects a hero, and clicks **준비하기**. The host clicks **파티 출발** when everyone is ready. The host counts toward the four-player maximum; a fifth player is denied. A guest may join an ongoing room and receives a full state snapshot.
3. Each player selects their own manual, semi automatic, or full automatic combat mode. Keep the host tab open and active. Host pause/tab visibility and stale-state indicators are shown to guests. Guest controls drive their assigned native actor on the host; the host owns combat, rewards, and map transitions.
4. A disconnected guest can use **이전 참가 연결 복원** within the server's 60 second reservation, including a refresh in the same tab. This requires the same running relay and retained per-tab credentials. Explicit leave, expired credentials, a relay restart, or host departure requires a new room. Host authority does not migrate; host disconnection closes the room.

An operator can also supply the endpoint before transport initialization with `window.__HAPIL_REMOTE_CONFIG_RC222__ = { relayURL: 'wss://<actual-service>.onrender.com/relay' }`, or a URL `relay` query parameter. Precedence is query parameter, RC222 config, legacy config, saved browser setting, then empty. URL encode the query value. Do not include session credentials in URLs. Public endpoints require `wss://`; `ws://` is accepted only for loopback development. There is no hardcoded hosted relay or background connection on the solo screen.

## Saves, revival, and recovery

Solo state is captured before entry and restored when leaving co-op. Host checkpoints use a separate co-op namespace and can be saved, loaded, exported, and imported from the online lobby. Guests cannot write campaign progress or host checkpoints. The host can load a saved slot. File import validates the file, stores it in the selected slot, then loads it through the same transition barrier. Export before closing the browser if persistence is unavailable. See [the complete storage contract](remote-coop-storage.md) for keys, fallback persistence, rollback, and file validation.

The existing native revival choices and their wording remain in place. When another player survives, a downed human uses the native eight second cooperative timer and returns at 50% health. A downed guest in DREAM can request the original `사몽 위기 부활` action while its native eligibility conditions allow it. When everyone is down, the host's existing death choice pauses battle and the host resolves Samong or checkpoint revival; guests do not independently restart the shared map. Host native title exit ends the room. Earlier approved replacement wording could not be recovered, so the existing native labels are preserved. This is distinct from the 60 second network reconnection reservation. No account, relay persistence, or recovery from an older unsaved session is provided. Exported host checkpoints preserve progress, not active room codes or resume credentials.

## Free hosting and support limits

Render Free can sleep after 15 minutes without inbound traffic and take about a minute to wake. Its 750 free instance hours are shared across the workspace monthly; bandwidth and build allowances also apply. Without a payment method, exceeding included allowances can suspend service or builds. See [current Render Free limits](https://render.com/docs/free), reviewed 2026-10-16. Allow a user initiated connection to wake the service and retry manually if needed. There are no scheduled wake-ups; protocol heartbeats exist only for active clients.

Relay room/session state is memory only. Service sleep, restart, replacement, and deployment lose rooms and credentials. The relay also expires rooms after 15 minutes without room activity; heartbeats alone do not preserve a room. Single instance operation is required because clients must reach the same in-memory room. The host is a trusted game authority: the relay validates transport and role permissions but is not an independent combat referee or anti-cheat system. Do not promise continuous availability, persistent rooms, hostile-host protection, arbitrary player counts, or mobile/browser parity without evidence.

## Verification and evidence boundaries

The [candidate workflow](../.github/workflows/rc222-remote-coop.yml) runs only on pushes to `codex/rc222-remote-coop`. It checks the exact commit and clean checkout, runs the relay Node tests, `rc222-storage-unit`, `rc222-runtime-unit`, `rc222-transport-unit`, and the coverage inventory. Its independent browser job uses the runner's official Google Chrome with the standard sandbox. Dependencies, npm cache, and video tooling are installed under `/tmp`; the ignored `server/node_modules` symlink resolves the locked relay dependency from that temporary directory.

Artifacts retain installation/test logs, exact SHA, CPU exit codes, coverage JSON, Chrome version/sandbox report, and available browser `results.json`, screenshots, and videos for 14 days, including failed or blocked runs. A blocked browser launch is not a pass. A candidate branch push does not deploy a relay or publish Pages. The workflow has no manual dispatch or deployment job.

The browser test uses four isolated contexts and a temporary fifth context on one computer with an actual loopback WebSocket relay. Some combat fixtures stage health, positions, or native QA map entry; inventory snapshot roundtrips do not fight every map, hero, mode, or owner. This suite does not establish a natural campaign playthrough, all encounter parity, four physical devices, or four Internet networks. [remote-coop-verification.md](remote-coop-verification.md) records actual execution status, fixture disclosures, and the required independent network acceptance procedure. Do not claim that all game tests or all combat combinations passed from RC222 checks alone.

Before public availability, preserve the exact frontend/relay SHAs, CI run and artifact links, UTC interval, and four-device/four-network acceptance results. Exercise two-player start, late join to four, fifth denial, simultaneous damage, boss death/rewards, map barrier, guest down/revival, guest refresh/resume, and host departure. Keep staged fixtures distinct from natural gameplay in every report.

## Rollback after an approved deployment

1. Record the failing frontend SHA, relay SHA, actual endpoint, UTC interval, browser errors, and CI artifacts. Export a host checkpoint if available. Omit bearer resume credentials from shared reports.
2. For immediate local recovery, leave the room and clear **중계 서버 주소** in **연결 설정**. Solo play uses the captured solo state. Clearing the endpoint does not roll back a deployed frontend.
3. With owner approval, restore the frontend from the recorded baseline SHA above using the repository's normal reviewed publication process. Confirm published bytes and record the resulting publication evidence. Do not reset `main` or rewrite history as a shortcut.
4. For relay rollback, use Render's manual deployment of a previously approved compatible relay SHA with auto-deploys kept Off. The public pre-RC222 baseline has no relay and cannot serve as a relay rollback target. If no compatible approved relay exists, disable the relay service with owner approval and use solo play. Any restart or rollback ends current rooms; checkpoint progress must be loaded into a newly created room.
5. Restore the exact origin allowlist and Free configuration, then repeat health, WebSocket, and relevant acceptance checks before announcing recovery. Do not add billing or wake-up jobs to work around an incident.
