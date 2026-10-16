# HAPIL WebSocket relay

A small Node.js + `ws` relay for up to four players including the browser host. It keeps only ephemeral room/session state and the latest host snapshot. Read [protocol.md](protocol.md) for the wire contract.

## Local operation

Requires Node.js 22 or newer. From this directory:

```sh
npm ci --cache /tmp/hapil-npm-cache
npm test
npm start
```

The server binds `0.0.0.0:${PORT}` (default 10000), exposes WebSocket `/relay` and `/`, and returns `{"ok":true,"protocol":1}` from `GET /healthz`. Local client origin defaults include `http://localhost:8080` and `http://127.0.0.1:8080`. Set the exact origin if serving the game on a different port. No account credentials or secrets are needed; [.env.example](.env.example) lists operator settings. Environment files are ignored; Node does not automatically load them. Export environment variables through the shell/service or use Node's `--env-file` flag if desired.

Modules can import `createServer(options)` or `await start(options)` from `src/relay.js`. Both return `{server,wss,close,config,stats}`; `start` also listens, and tests may use `{port:0,host:'127.0.0.1',allowedOrigins:[...]}`. `await close()` stops the service. Test-only options allow short grace/sweep intervals and small quotas without changing production defaults.

## Prepared Render Free configuration

The repository root `render.yaml` defines one Node web service with `plan: free`, `rootDir: server`, `npm ci`, `npm start`, `/healthz`, the HAPIL Pages origin allowlist and automatic deploys disabled. This file prepares a deployment; it does not create a service. Public creation/deployment and choosing an actual relay URL require the owner's approval.

After approval, choose a Free web service using that blueprint and the reviewed source revision. Confirm the exact `ALLOWED_ORIGINS` value is `https://kjb7876-lang.github.io` for the existing Pages game (origins have no path or trailing slash). Keep `ALLOWED_GAME_IDS=hapil` until a separate game's client is ready. Verify health over HTTPS, then put the approved `wss://<service>.onrender.com/relay` URL into the client configuration. Connect two through four independent browsers, start, change maps, reconnect a guest and close the host before announcing availability.

Render terminates TLS at its ingress and forwards HTTP to the process; this server binds the provided `PORT` on `0.0.0.0`. Public browsers use WSS. [Render port binding/TLS](https://render.com/docs/web-services#port-binding), [WebSockets](https://render.com/docs/websocket).

Render Free can spin down after 15 minutes without inbound traffic, take about a minute to wake, and restart at any time. The workspace shares 750 free instance hours per month. Bandwidth and build allowances also apply; with no payment method, exhausted allowances suspend free services or builds. Keep the Free plan and do not add billing, databases or paid services for this relay. [Render Free limits](https://render.com/docs/free).

A restart loses every room and all resume credentials. A host disconnect closes its room. Guests get 60 seconds to resume on the same running process. The process sends protocol heartbeats only to active sockets and never runs an external wake-up/keepalive job. Room inactivity still expires after 15 minutes even if a socket pings. This is a single instance design, so do not enable horizontal scaling. [Blueprint specification](https://render.com/docs/blueprint-spec).

## Dependency and validation evidence

`ws` is pinned to `8.22.0` with its registry integrity hash in `package-lock.json`. Checked the npm registry and upstream [ws documentation](https://github.com/websockets/ws) on 2026-10-16; `npm audit --omit=dev --json --cache /tmp/hapil-npm-cache` reported zero vulnerabilities. No global npm or system security settings were changed.

`npm test` runs real local WebSocket integration tests for four player capacity and a fifth denial, spoof/authority rejection, duplicate operations, game isolation, guest reconnect/token rotation, guest expiry and host closure, transition barriers and late join, origin/JSON/depth/prototype/size limits, message rate limits, room/idle cleanup, graceful shutdown, snapshot backpressure coalescing, reliable transitions and hard buffer disconnect/resume.
