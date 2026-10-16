import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { WebSocket } from 'ws';
import { start } from '../src/relay.js';

const require = createRequire(import.meta.url);
const { RemoteTransport } = require('../../assets/rc222/transport.js');
const ORIGIN = 'http://localhost:8080';
async function until(predicate, message) {
  const deadline = Date.now() + 1500;
  while (!predicate()) {
    if (Date.now() >= deadline) assert.fail(message);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

test('actual guest transport reacknowledges a cached loaded transition after authenticated resume', async t => {
  const relay = await start({ port: 0, host: '127.0.0.1', allowedOrigins: [ORIGIN] });
  const endpoint = `ws://127.0.0.1:${relay.server.address().port}/relay`;
  const host = new WebSocket(endpoint, { origin: ORIGIN }), hostMessages = [];
  host.on('message', raw => hostMessages.push(JSON.parse(raw)));
  const values = new Map(), store = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  class BrowserSocket extends WebSocket { constructor(url) { super(url, { origin: ORIGIN }); } }
  let applications = 0;
  const guest = new RemoteTransport({ WebSocket: BrowserSocket, endpoint, sessionStorage: store, localStorage: store,
    runtimeAdapter: { attach() {}, updateRoom() {}, start() { return true; }, role() {}, releaseInputs() {}, leave() {}, snapshot() { applications++; return true; } } });
  t.after(async () => { guest.finish(); host.terminate(); await relay.close(); });
  await once(host, 'open');
  let requestSeq = 0;
  async function request(type, data = {}) {
    const requestId = `audit-${++requestSeq}`;
    host.send(JSON.stringify({ v: 1, gameId: 'hapil', type, ...data, requestId }));
    await until(() => hostMessages.some(m => m.requestId === requestId), `No ${type} reply`);
    const reply = hostMessages.find(m => m.requestId === requestId);
    assert.notEqual(reply.type, 'error', JSON.stringify(reply));
    return reply;
  }
  const room = await request('create');
  await guest.join({ code: room.roomCode }); await guest.ready(); await request('start');
  await request('transition', { epoch: 1, seq: 1, zone: 'one', snapshot: { zone: 'one' } });
  const guestRow = () => hostMessages.filter(m => m.type === 'room').at(-1)?.roster.find(p => p.slotId === 'p2');
  await until(() => guestRow()?.loaded, 'Initial genuine snapshot must be acknowledged');
  assert.equal(applications, 1);
  const original = { ...guest.session };
  const socketClosed = once(guest.socket, 'close'); guest.socket.close(); await socketClosed;
  guest.cancelTimer('reconnect');
  await until(() => guestRow()?.connected === false, 'Relay must observe actual guest disconnect');
  // The host deliberately has not loaded yet: the relay retains exactly seq 1.
  await guest.resume();
  assert.equal(guest.session.sessionId, original.sessionId);
  assert.notEqual(guest.session.resumeToken, original.resumeToken);
  assert.equal(guest.receivedSeq, 1);
  assert.equal(applications, 1, 'Identical already applied native state is not replayed');
  await until(() => guestRow()?.loaded === true, 'Resumed guest must reacknowledge the same cached transition');
  assert.equal(guest.phase, 'loading');
  await request('loaded', { epoch: 1 });
  await until(() => guest.phase === 'playing', 'The real relay barrier must release after both acknowledgements');
  assert.equal((await request('loaded', { epoch: 1 })).type, 'ack', 'Repeated current loaded is harmless');
  guest.sendInput({ moveX: 1 });
  await until(() => hostMessages.some(m => m.type === 'input' && m.slotId === 'p2'), 'Resumed guest input is accepted by actual relay');
});
