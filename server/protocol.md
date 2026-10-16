# HAPIL relay protocol 1

This process owns rooms, connection sessions and forwarding. The browser host owns all gameplay, hit tests, damage, HP, enemies, projectiles, drops, inventory, saves and game completion. The relay does not interpret gameplay snapshots. Run one process/instance: all rooms are in memory and disappear on restart. HAPIL's four slots include the host.

## Transport and envelope

Connect using WebSocket `/relay` (or `/`). Public clients use `wss://<approved-service>.onrender.com/relay`; local clients use `ws://127.0.0.1:10000/relay`. The HTTP `Origin` must exactly match `ALLOWED_ORIGINS`; missing origins are rejected. The initial server `welcome` advertises `{protocol:1,maxPlayers:4,maxPayload:2097152,guestGraceMs:60000}`.

All messages are JSON text objects, with `v:1`, `gameId:"hapil"` and `type`. Clients may add `requestId`, a unique string of 1–64 characters. A connection is bound to the first supported game namespace it selects. Every subsequent message must use that game and protocol. Room lookup, credentials and broadcasts are isolated by game ID; a code from a different game cannot join a room. Only `hapil` is allowed by default. An operator can explicitly add a future game ID to `ALLOWED_GAME_IDS` without modifying another game's code. HAPIL hero validation applies only to HAPIL; future namespaces currently get the generic bounded string validation.

Client properties outside the base envelope and the message's listed fields are rejected. Unknown server fields should be ignored for forward compatibility. A `requestId` gets either a response below or `{type:"error",requestId,code,message}`. Successful mutations return `{type:"ack",requestId,operation:<client type>}`. `create`, `join`, `resume`, and `ping` return their dedicated response. Server broadcasts may arrive before an ack. The last 128 request IDs per connection are retained for duplicate rejection.

## Identity and lobby

| Client type | Additional fields | Result |
| --- | --- | --- |
| `create` | `nickname?`, `heroId?`, `mode?` | Creates a room, assigns host `p1`, returns `session`. |
| `join` | `code`, `nickname?`, `heroId?` | Assigns the lowest free `p2`–`p4` slot, returns `session`. Works during lobby, loading or gameplay. |
| `resume` | `sessionId`, `resumeToken` | Reattaches a disconnected guest during its 60 second reservation, rotates the token, returns `session`. |
| `profile` | `nickname?`, `heroId?` | Changes lobby profile, clears guest ready flag, broadcasts `room`. |
| `ready` | `ready:boolean` | Updates lobby readiness, broadcasts `room`. |
| `start` | none | Host only. Requires every reserved member connected and every guest ready. Moves lobby to loading, epoch stays 0. |
| `leave` | none | Guest slot is released immediately. Host closes the entire room. |

Nickname defaults to `Player`; it is trimmed and limited to 24 characters with no control characters. HAPIL `heroId` is one of `hwando`, `gunner`, `seoha`, `neon`, `michaela`, `lauren`, `hunter`, `slayer`; default `hwando`. Mode defaults to `STORY` and is an opaque nonempty string up to 32 characters; the game validates supported modes. Mode cannot change during a room's life.

A `session` response has flat fields:

```json
{"v":1,"gameId":"hapil","type":"session","requestId":"r1","sessionId":"<32 lowercase hex>","resumeToken":"<64 lowercase hex>","slotId":"p2","isHost":false,"roomCode":"<16 uppercase hex>","phase":"playing","epoch":1,"seq":23,"mode":"STORY","roster":[],"hostStatus":{"hidden":false,"paused":false},"zone":"village","snapshot":{}}
```

The room code has 64 random bits; a session ID has 128 random bits and its separate bearer resume token has 256 random bits. Share only the room code. Never put resume credentials in invite URLs, chat, logs or snapshots. Joining a room never reveals another member's credentials. A session already connected cannot be resumed by another socket. The old resume token stops working after a successful resume. Keep the latest credentials in per-tab browser storage; clear them on leave/room closure. Input sequence acceptance resets after authenticated reattachment; snapshot sequence does not reset.

`phase` is `lobby`, `loading` or `playing`. `seq` starts at -1 and `epoch` at 0. `snapshot` and `zone` are absent until the first host transition. `room` broadcasts include `{phase,roster,epoch,roomCode,mode,hostStatus}`. Every roster entry is `{slotId,nickname,heroId,ready,connected,isHost,loaded}`. Use nickname as text, never HTML. Disconnected guests stay visible with `connected:false`, and count toward the four slot limit until 60 seconds expire. There is no host handover: any host socket loss closes the room immediately, clears all credentials, and emits `{type:"closed",reason:"host_disconnected"}`. Other closure reasons are `host_left`, `idle_timeout`, `server_shutdown`.

## Host snapshots and loading barriers

| Client type | Additional fields | Relay behavior |
| --- | --- | --- |
| `transition` | `seq`, `epoch`, `zone`, `snapshot` | Host only. Epoch must be exactly current + 1; moves room to loading, clears loaded flags, caches and reliably forwards to guests. |
| `snapshot` | `seq`, `epoch`, `snapshot` | Host only. Current epoch only; caches latest full snapshot and forwards to guests. |
| `loaded` | `epoch` | Marks this member loaded for the current epoch after its assets/state are ready. |
| `host_status` | `hidden:boolean`, `paused:boolean` | Host only. Caches status and forwards to guests so UI can display a paused/background host. |

`seq` is a nonnegative safe integer strictly increasing across both host snapshot and transition messages for the entire room. An epoch is a nonnegative safe integer. Zone is a nonempty string up to 128 characters. Snapshot is a JSON object; the relay adds no gameplay state and performs no HP computations. Both transition and snapshot forwarding include `seq`, `epoch`, `zone`, `snapshot` and their corresponding `type`.

Start flow: `start` → room loading epoch 0 → host applies its starting map locally and publishes `transition` with epoch 1 → every connected member, including host, sends `loaded` at epoch 1 → relay broadcasts `{type:"barrier",phase:"playing",epoch:1}` and playing `room`. Do not send `loaded` at epoch 0. For another map, the host publishes the next transition with the next epoch, then all connected members acknowledge it. Inputs are rejected during the barrier. Disconnected guests do not block it; reconnecting guests must load the cached current epoch before sending inputs.

A player joining during gameplay receives the current cached snapshot, seq, epoch and zone in `session`. It must load that state, send `loaded`, and wait for its private `barrier` before input. Existing members keep playing while this player loads. A player joining during a global loading barrier participates in that barrier. When a transition arrives, clients must discard old epoch work and acknowledge the new epoch only after loading it.

## Guest input

`input` accepts only `{seq,moveX?,moveY?,aimX?,aimY?,actions?,autoMode?,combatMode?}`. `seq` is required and must increase for that connection's session. Movement numbers are finite within [-1,1]; aim numbers are finite within [-10000000,10000000]. Missing coordinates default to zero. Actions default to `[]`, may appear once each, and are limited to:

`attack`, `q`, `w`, `e`, `r`, `dash`, `time`, `guard`, `parry`, `ego`, `awakening`, `resonance`, `collab`, `chargeStart`, `chargeRelease`, `reviveSamong`, `reviveCheckpoint`, `autoMode`.

`autoMode` is boolean (default false). Optional `combatMode` is `manual`, `semi` or `full` (default manual). The relay forwards only to the host, stamps the sender's server assigned `slotId` and current `epoch`, and never accepts a client supplied slot ID. The host applies its own input locally. Input cannot supply player positions, HP, damage, inventory, rewards or saves. The native host game validates each requested action against current gameplay conditions. It must release a disconnected player's held input when roster connected becomes false.

`ping` with finite numeric `sentAt` returns `pong` carrying `sentAt` and `serverTime` in Unix milliseconds, for optional UI latency estimates. WebSocket protocol heartbeat ping/pong also runs on active sockets.

## Limits and recovery

Default limits: 16 rooms, 128 sockets, 16 sockets per actual peer IP, 40 upgrade attempts per peer IP per minute. Proxy forwarding headers are deliberately ignored. A reverse proxy may aggregate peer addresses; this conservative peer quota can therefore cap aggregate concurrency. Raise `MAX_CONNECTIONS_PER_IP` only after reviewing the deployment's ingress behavior. `MAX_ROOMS`, `MAX_CONNECTIONS` and `MAX_CONNECTIONS_PER_IP` are configurable with documented hard caps (128, 1024, 128).

Each socket allows 180 messages and 8 MiB incoming bytes per one second window; control operations allow 24 per window. Rate violations emit `rate_limited` and close with 1008. Controls and inputs are limited to 4096 JSON bytes. Snapshot/transition frames are limited to 2 MiB including the full envelope; larger frames close with 1009. Payloads reject nesting over 48, more than 120000 JSON nodes, nonfinite numbers and `__proto__`, `constructor`, `prototype` keys anywhere. Compression is disabled. Use smaller snapshots at a sensible host tick rate; these limits are ceilings, not recommended bandwidth targets.

When a guest has over 512 KiB queued outgoing data, ordinary snapshots are coalesced to the room's latest full snapshot. On drain, the relay sends `{type:"resync_required",reason:"backpressure",epoch}` followed by `snapshot` with `resync:true`. Clients release held inputs and replace local state with that snapshot. Transitions, barriers, credentials and control messages are never intentionally dropped; a connection already over 2 MiB buffered closes with 1013, retaining guest resume rights. Resuming fetches the latest complete current snapshot. A slow host may cause room closure if its socket cannot recover; authority never migrates.

Rooms with no accepted session/game operation for 15 minutes expire (`ROOM_IDLE_MS`); ping and health traffic do not extend this room TTL. Unbound idle sockets close after 30 seconds. Heartbeats detect dead active sockets; guest reservation starts when disconnect is detected. SIGTERM/SIGINT announces room closure, closes active sockets, then terminates any unresponsive sockets. No database, account authentication, payment, TURN, external poller or keepalive service is used.

Errors include `wrong_namespace`, `invalid_message`, `invalid_payload`, `invalid_profile`, `invalid_code`, `room_not_found`, `room_full`, `room_limit`, `not_in_room`, `already_in_room`, `resume_denied`, `session_active`, `duplicate_request`, `host_only`, `guest_only`, `wrong_phase`, `not_ready`, `not_loaded`, `invalid_input`, `invalid_snapshot`, `stale_sequence`, `stale_epoch`, `payload_too_large`, `rate_limited`. Treat errors as protocol outcomes, never as permission to simulate gameplay locally as a guest.
