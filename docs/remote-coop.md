# RC222 remote co-op setup and operating limits

RC222 frontend [`199402a0ece0747d2d354e8881e4a77910fb2423`](https://github.com/kjb7876-lang/hapil1/commit/199402a0ece0747d2d354e8881e4a77910fb2423) was published after the user's explicit approval. [Pages run38878946328](https://github.com/kjb7876-lang/hapil1/actions/runs/38878946328) completed successfully at **2026-10-16 09:19:12 UTC**. The game URL is <https://kjb7876-lang.github.io/hapil1/>. The previous single-player rollback baseline is [`fd9728958b23cdd271d6d1bf6078f0e54184165a`](https://github.com/kjb7876-lang/hapil1/commit/fd9728958b23cdd271d6d1bf6078f0e54184165a). Additional RC223 voice/camera changes remain a separate unpublished candidate and require separate approval.

No Render service or working public relay URL has been confirmed. `render.yaml` prepares a HAPIL-only Free service. The user has requested its creation/connection, but this workspace has no connected Render account tool; account creation and service creation must be completed by the user. Send only the public HTTPS service URL for health and actual WSS verification. Never send passwords, API tokens or payment information. Do not change any StoryWorld service. Record the actual relay SHA, service URL and public WSS evidence before reporting Internet co-op as available.

## Create the Free relay after approval

1. Open the [HAPIL deployment Blueprint](https://render.com/deploy?repo=https://github.com/kjb7876-lang/hapil1), sign in, and review that it contains only the new HAPIL service on the **Free** plan. The current `main` contains the approved RC222 relay. Do not select or update an existing StoryWorld service. Alternatively choose **New → Web Service**, connect this repository and select the approved RC222 revision. Creating the service starts its initial deployment.
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

The game frontend remains static; its host does not need to run Node. Every player must load the same approved frontend revision. The published RC222 Pages version includes these controls, but needs a working public relay URL before remote room creation can work.

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

## Remaining parity and acceptance work

The shared native adapter is common to the authored maps, canonical heroes and modes. The browser encounter sample is not an exhaustive skill, boss phase or natural progression certification.

The published RC222 release mirrors guest story text only. The unpublished RC223 candidate adds guest audio for one current host cue: the primary native story reader, or—when that is absent—an allowlisted shared `death:verse` / `ending:title` narration surface. Guests get a text reader using the existing V1 player; private journal pages and host progression callbacks are not transmitted. The first accepted native snapshot sets a manual baseline: an active cue in that snapshot stays manual, while a cue-less baseline allows a later fresh cue to start after a trusted gesture. Repeated snapshots of the same cue do not restart playback, user pause is respected, and cue replacement, epoch change or leave cancels old playback. Pending recordings stay unavailable. The candidate's voice job passed eight official Chrome cases, including a two-context loopback-relay check of the active native cue and shared death surface; `ending:title` has source/unit coverage but no separate official Chrome relay case. The candidate remains unpublished and requires separate approval. Guest narration does not mirror host-only DOM film/cinematic sequences; original host/solo narration and cinematics remain native. See [the exact verification record](remote-coop-verification.md#rc223-guest-voice-candidate-unpublished).

Some supplemental patterns and ground hazards pause/reset during the host's eight-second down window, while native enemy AI and surviving remote actor damage continue. A dedicated surviving-guest boss defeat while the host is down has not been exercised end to end. Full per-hero skill/pattern parity and real four-network/mobile acceptance remain follow-up work; snapshot inventory results alone do not establish them.

## Rollback after an approved deployment

1. Record the failing frontend SHA, relay SHA, actual endpoint, UTC interval, browser errors, and CI artifacts. Export a host checkpoint if available. Omit bearer resume credentials from shared reports.
2. For immediate local recovery, leave the room and clear **중계 서버 주소** in **연결 설정**. Solo play uses the captured solo state. Clearing the endpoint does not roll back a deployed frontend.
3. With owner approval, restore the frontend from the recorded baseline SHA above using the repository's normal reviewed publication process. Confirm published bytes and record the resulting publication evidence. Do not reset `main` or rewrite history as a shortcut.
4. For relay rollback, use Render's manual deployment of a previously approved compatible relay SHA with auto-deploys kept Off. The public pre-RC222 baseline has no relay and cannot serve as a relay rollback target. If no compatible approved relay exists, disable the relay service with owner approval and use solo play. Any restart or rollback ends current rooms; checkpoint progress must be loaded into a newly created room.
5. Restore the exact origin allowlist and Free configuration, then repeat health, WebSocket, and relevant acceptance checks before announcing recovery. Do not add billing or wake-up jobs to work around an incident.
