import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { start } from '../src/relay.js';

const ORIGIN = 'http://localhost:8080';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function fixture(t, options = {}) {
  const relay = await start({ port: 0, host: '127.0.0.1', allowedOrigins: [ORIGIN], ...options });
  const clients = [];
  t.after(async () => { for (const c of clients) c.ws.terminate(); await relay.close(); });
  async function connect(gameId = 'hapil', origin = ORIGIN) {
    const ws = new WebSocket(`ws://127.0.0.1:${relay.server.address().port}/relay`, { origin });
    const queue = [], waits = [];
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString()), i = waits.findIndex((w) => w.predicate(m));
      if (i >= 0) { const [w] = waits.splice(i, 1); clearTimeout(w.timer); w.resolve(m); } else queue.push(m);
    });
    const client = { ws, queue, send(type, fields = {}) { ws.send(JSON.stringify({ v: 1, gameId, type, ...fields })); },
      take(predicate = () => true, ms = 1200) {
        const i = queue.findIndex(predicate); if (i >= 0) return Promise.resolve(queue.splice(i, 1)[0]);
        return new Promise((resolve, reject) => {
          const w = { predicate, resolve, timer: setTimeout(() => { const j = waits.indexOf(w); if (j >= 0) waits.splice(j, 1); reject(new Error('Timed out waiting for relay event')); }, ms) }; waits.push(w);
        });
      },
      async request(type, fields = {}) {
        const requestId = `r${++client.n}`; client.send(type, { ...fields, requestId }); return client.take((m) => m.requestId === requestId);
      }, n: 0,
      async disconnect() { const end = once(ws, 'close'); ws.close(); await end; },
    };
    ws.on('error', () => {}); clients.push(client); await once(ws, 'open'); await client.take((m) => m.type === 'welcome'); return client;
  }
  return { relay, connect };
}
async function pair(t, options = {}) {
  const f = await fixture(t, options), host = await f.connect(), hs = await host.request('create', { nickname: 'Host', heroId: 'hwando', mode: 'STORY' });
  const guest = await f.connect(), gs = await guest.request('join', { code: hs.roomCode, nickname: 'Guest', heroId: 'gunner' });
  return { ...f, host, guest, hs, gs };
}
async function play(f) {
  assert.equal((await f.guest.request('ready', { ready: true })).type, 'ack');
  assert.equal((await f.host.request('start')).type, 'ack');
  assert.equal((await f.host.request('transition', { seq: 1, epoch: 1, zone: 'zone1', snapshot: { players: ['p1', 'p2'], hp: 100 } })).type, 'ack');
  await f.guest.take((m) => m.type === 'transition');
  await f.host.request('loaded', { epoch: 1 }); await f.guest.request('loaded', { epoch: 1 });
  await f.host.take((m) => m.type === 'barrier'); await f.guest.take((m) => m.type === 'barrier');
}

test('two through four slots, fifth rejected, disconnected slots reserved, credentials separate', async (t) => {
  const f = await pair(t);
  assert.match(f.hs.roomCode, /^[A-F0-9]{16}$/); assert.match(f.hs.sessionId, /^[a-f0-9]{32}$/); assert.match(f.hs.resumeToken, /^[a-f0-9]{64}$/);
  assert.notEqual(f.hs.roomCode, f.hs.sessionId); assert.equal(f.hs.slotId, 'p1'); assert.equal(f.gs.slotId, 'p2');
  for (const slotId of ['p3', 'p4']) { const c = await f.connect(); assert.equal((await c.request('join', { code: f.hs.roomCode })).slotId, slotId); }
  const fifth = await f.connect(); assert.equal((await fifth.request('join', { code: f.hs.roomCode })).code, 'room_full');
  await f.guest.disconnect(); await f.host.take((m) => m.type === 'room' && m.roster.find((p) => p.slotId === 'p2')?.connected === false);
  assert.equal((await fifth.request('join', { code: f.hs.roomCode })).code, 'room_full');
  assert.deepEqual(f.relay.stats(), { rooms: 1, sessions: 4, connections: 4 });
});

test('readiness, host authority, input identity, sequence replay and namespace isolation', async (t) => {
  const f = await pair(t, { allowedGames: ['hapil', 'storyworld'] });
  assert.equal((await f.host.request('start')).code, 'not_ready');
  assert.equal((await f.guest.request('start')).code, 'host_only');
  assert.equal((await f.guest.request('create')).code, 'already_in_room');
  f.guest.send('ready', { requestId: 'unique', ready: true }); await f.guest.take((m) => m.requestId === 'unique');
  f.guest.send('ready', { requestId: 'unique', ready: true }); assert.equal((await f.guest.take((m) => m.requestId === 'unique')).code, 'duplicate_request');
  await play(f);
  assert.equal((await f.guest.request('snapshot', { seq: 2, epoch: 1, snapshot: { hp: 999 } })).code, 'host_only');
  assert.equal((await f.guest.request('input', { seq: 1, slotId: 'p1', moveX: 1 })).code, 'invalid_message');
  assert.equal((await f.guest.request('input', { seq: 1, moveX: 1, actions: ['attack'], combatMode: 'semi' })).type, 'ack');
  const input = await f.host.take((m) => m.type === 'input'); assert.equal(input.slotId, 'p2'); assert.equal(input.combatMode, 'semi');
  assert.equal((await f.guest.request('input', { seq: 1 })).code, 'stale_sequence');
  assert.equal((await f.guest.request('input', { seq: 2, moveX: 2 })).code, 'invalid_input');
  assert.equal((await f.guest.request('input', { seq: 2, moveX: null })).code, 'invalid_input');
  assert.equal((await f.guest.request('input', { seq: 2, actions: null })).code, 'invalid_input');
  assert.equal((await f.host.request('snapshot', { seq: 1, epoch: 1, snapshot: {} })).code, 'stale_sequence');
  const other = await f.connect('storyworld'); assert.equal((await other.request('join', { code: f.hs.roomCode })).code, 'room_not_found');
  assert.equal((await other.request('resume', { sessionId: f.gs.sessionId, resumeToken: f.gs.resumeToken })).code, 'resume_denied');
  const unsupported = await f.connect('anothergame'); assert.equal((await unsupported.request('create')).code, 'wrong_namespace');
});

test('guest resumes within grace with rotated token and latest snapshot, duplicate connection denied', async (t) => {
  const f = await pair(t); await play(f);
  await f.guest.request('input', { seq: 50 });
  await f.host.request('snapshot', { seq: 2, epoch: 1, snapshot: { hp: 42 } });
  await f.guest.disconnect(); await f.host.take((m) => m.type === 'room' && m.roster.some((p) => p.slotId === 'p2' && !p.connected));
  const replacement = await f.connect();
  const session = await replacement.request('resume', { sessionId: f.gs.sessionId, resumeToken: f.gs.resumeToken });
  assert.equal(session.slotId, 'p2'); assert.equal(session.sessionId, f.gs.sessionId); assert.notEqual(session.resumeToken, f.gs.resumeToken); assert.deepEqual(session.snapshot, { hp: 42 });
  assert.equal((await replacement.request('input', { seq: 1 })).code, 'not_loaded');
  await replacement.request('loaded', { epoch: 1 }); await replacement.take((m) => m.type === 'barrier');
  assert.equal((await replacement.request('input', { seq: 1 })).type, 'ack');
  const attacker = await f.connect();
  assert.equal((await attacker.request('resume', { sessionId: session.sessionId, resumeToken: f.gs.resumeToken })).code, 'resume_denied');
  assert.equal((await attacker.request('resume', { sessionId: session.sessionId, resumeToken: session.resumeToken })).code, 'session_active');
});

test('guest grace expires and host departure destroys room without handover', async (t) => {
  const f = await pair(t, { guestGraceMs: 50, sweepMs: 10 });
  await f.guest.disconnect(); await pause(90);
  assert.equal(f.relay.stats().sessions, 1);
  const c = await f.connect(); assert.equal((await c.request('resume', { sessionId: f.gs.sessionId, resumeToken: f.gs.resumeToken })).code, 'resume_denied');
  assert.equal((await c.request('join', { code: f.hs.roomCode })).slotId, 'p2');
  await f.host.disconnect(); assert.equal((await c.take((m) => m.type === 'closed')).reason, 'host_disconnected');
  assert.equal((await c.request('join', { code: f.hs.roomCode })).code, 'room_not_found');
  assert.equal(f.relay.stats().rooms, 0);
});

test('transition waits for every connected member; late join loads privately; reconnect mid barrier', async (t) => {
  const f = await pair(t); await play(f);
  const late = await f.connect(); const session = await late.request('join', { code: f.hs.roomCode, heroId: 'seoha' });
  assert.equal(session.phase, 'playing'); assert.equal(session.epoch, 1); assert.equal(session.snapshot.hp, 100);
  assert.equal((await late.request('input', { seq: 1 })).code, 'not_loaded');
  assert.equal((await f.guest.request('input', { seq: 1 })).type, 'ack'); // Late loading does not stop existing players.
  await late.request('loaded', { epoch: 1 }); await late.take((m) => m.type === 'barrier' && m.epoch === 1);
  await f.host.request('transition', { seq: 2, epoch: 2, zone: 'zone2', snapshot: { hp: 90 } });
  await f.host.request('loaded', { epoch: 2 }); await f.guest.request('loaded', { epoch: 2 });
  assert.equal((await f.guest.request('input', { seq: 2 })).code, 'not_loaded');
  assert.equal((await late.request('loaded', { epoch: 1 })).code, 'stale_epoch');
  await late.disconnect(); // Disconnected guest cannot deadlock the barrier.
  await f.host.take((m) => m.type === 'barrier' && m.epoch === 2);
  const re = await f.connect(); const rs = await re.request('resume', { sessionId: session.sessionId, resumeToken: session.resumeToken });
  assert.equal(rs.epoch, 2); assert.equal(rs.snapshot.hp, 90);
  assert.equal((await re.request('input', { seq: 1 })).code, 'not_loaded');
  await re.request('loaded', { epoch: 2 }); assert.equal((await re.request('input', { seq: 1 })).type, 'ack');
});

test('origin, namespace, profile, malformed, prototype, depth and control-size validation', async (t) => {
  const f = await fixture(t);
  const bad = new WebSocket(`ws://127.0.0.1:${f.relay.server.address().port}/relay`, { origin: 'https://evil.example' });
  bad.on('error', () => {});
  const [err] = await once(bad, 'error'); assert.match(err.message, /403/);
  const c = await f.connect();
  assert.equal((await c.request('create', { heroId: 'unknown' })).code, 'invalid_profile');
  assert.equal((await c.request('create', { nickname: 'x'.repeat(25) })).code, 'invalid_profile');
  assert.equal((await c.request('create', { mode: 'UNKNOWN' })).code, 'invalid_message');
  assert.equal((await c.request('create', { mode: null })).code, 'invalid_message');
  c.ws.send('{'); assert.equal((await c.take((m) => m.type === 'error')).code, 'invalid_message');
  c.ws.send('{"v":1,"gameId":"hapil","type":"create","__proto__":{"polluted":true}}');
  assert.equal((await c.take((m) => m.type === 'error')).code, 'invalid_payload'); assert.equal({}.polluted, undefined);
  let deep = {}; for (let i = 0; i < 52; i++) deep = { child: deep };
  c.send('snapshot', { snapshot: deep }); assert.equal((await c.take((m) => m.type === 'error')).code, 'invalid_payload');
  assert.equal((await c.request('ping', { sentAt: 1, padding: 'x'.repeat(4200) })).code, 'payload_too_large');
  c.ws.send(Buffer.from('binary')); assert.equal((await c.take((m) => m.type === 'error')).code, 'invalid_message');
  const health = await fetch(`http://127.0.0.1:${f.relay.server.address().port}/healthz`); assert.deepEqual(await health.json(), { ok: true, protocol: 1 });
});

test('rates close the offender and oversized websocket messages close with 1009', async (t) => {
  const f = await fixture(t, { messageRate: 3, maxPayload: 2048 }); const c = await f.connect();
  for (let i = 0; i < 4; i++) c.send('ping', { sentAt: i });
  assert.equal((await c.take((m) => m.type === 'error')).code, 'rate_limited');
  const [code] = await once(c.ws, 'close'); assert.equal(code, 1008);
  const big = await f.connect(), closed = once(big.ws, 'close'); big.ws.send('x'.repeat(2049));
  assert.equal((await closed)[0], 1009);
});

test('max room capacity, guest leave, host status, idle cleanup and graceful shutdown', async (t) => {
  const f = await pair(t, { maxRooms: 1, roomIdleMs: 120, sweepMs: 10 });
  const c = await f.connect(); assert.equal((await c.request('create')).code, 'room_limit');
  await f.host.request('host_status', { hidden: true, paused: true });
  assert.equal((await f.guest.take((m) => m.type === 'host_status')).hidden, true);
  await f.guest.request('leave'); assert.equal(f.relay.stats().sessions, 1);
  await f.host.take((m) => m.type === 'closed' && m.reason === 'idle_timeout'); assert.equal(f.relay.stats().rooms, 0);
  await f.relay.close(); assert.equal(f.relay.server.listening, false);
});

test('snapshot backpressure coalesces to latest, signals resync, and preserves transitions', async (t) => {
  const f = await pair(t, { sweepMs: 10 }); await play(f);
  // Model a slow guest deterministically without relying on platform TCP buffer sizes.
  const serverGuest = [...f.relay.wss.clients].find((ws) => ws._socket.remotePort === f.guest.ws._socket.localPort);
  let buffered = f.relay.config.maxBuffered + 1;
  Object.defineProperty(serverGuest, 'bufferedAmount', { configurable: true, get: () => buffered });
  await f.host.request('snapshot', { seq: 2, epoch: 1, snapshot: { hp: 80 } });
  await f.host.request('snapshot', { seq: 3, epoch: 1, snapshot: { hp: 70 } });
  assert.equal(f.guest.queue.some((m) => m.type === 'snapshot' && m.seq === 2), false);
  buffered = 0;
  assert.equal((await f.guest.take((m) => m.type === 'resync_required')).reason, 'backpressure');
  const latest = await f.guest.take((m) => m.type === 'snapshot' && m.resync); assert.equal(latest.seq, 3); assert.equal(latest.snapshot.hp, 70);
  buffered = f.relay.config.maxBuffered + 1;
  await f.host.request('transition', { seq: 4, epoch: 2, zone: 'next', snapshot: { hp: 60 } });
  assert.equal((await f.guest.take((m) => m.type === 'transition' && m.epoch === 2)).seq, 4);
  buffered = 0;
});

test('backpressure hard limit disconnects guest for authenticated resync', async (t) => {
  const f = await pair(t); await play(f);
  const serverGuest = [...f.relay.wss.clients].find((ws) => ws._socket.remotePort === f.guest.ws._socket.localPort);
  Object.defineProperty(serverGuest, 'bufferedAmount', { configurable: true, get: () => f.relay.config.hardBuffered + 1 });
  const closed = once(f.guest.ws, 'close');
  await f.host.request('snapshot', { seq: 2, epoch: 1, snapshot: { hp: 50 } });
  assert.equal((await closed)[0], 1013);
  const re = await f.connect(); const s = await re.request('resume', { sessionId: f.gs.sessionId, resumeToken: f.gs.resumeToken });
  assert.equal(s.snapshot.hp, 50);
});
