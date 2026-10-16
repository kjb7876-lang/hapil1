import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';

const HEROES = new Set(['hwando', 'gunner', 'seoha', 'neon', 'michaela', 'lauren', 'hunter', 'slayer']);
const ACTIONS = new Set(['attack', 'q', 'w', 'e', 'r', 'dash', 'time', 'guard', 'parry', 'ego', 'awakening', 'resonance', 'collab', 'chargeStart', 'chargeRelease', 'reviveSamong', 'reviveCheckpoint', 'autoMode']);
const FIELDS = {
  create: ['nickname', 'heroId', 'mode'], join: ['code', 'nickname', 'heroId'], resume: ['sessionId', 'resumeToken'],
  profile: ['nickname', 'heroId'], ready: ['ready'], start: [],
  input: ['seq', 'moveX', 'moveY', 'aimX', 'aimY', 'actions', 'autoMode', 'combatMode'],
  snapshot: ['seq', 'epoch', 'snapshot'], transition: ['seq', 'epoch', 'zone', 'snapshot'],
  loaded: ['epoch'], host_status: ['hidden', 'paused'], leave: [], ping: ['sentAt'],
};
const BASE = ['v', 'gameId', 'type', 'requestId'];
const poison = new Set(['__proto__', 'prototype', 'constructor']);
const token = (bytes) => randomBytes(bytes).toString('hex');
const int = (x) => Number.isSafeInteger(x) && x >= 0;
const str = (x, max) => typeof x === 'string' && x.length > 0 && x.length <= max && !/[\u0000-\u001f\u007f]/u.test(x);
const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
const positive = (value, fallback, min = 1, max = 1e9) => {
  const n = Number(value ?? fallback);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`Invalid relay setting: ${value}`);
  return n;
};
const list = (value, fallback) => new Set((value ?? fallback).split(',').map((x) => x.trim()).filter(Boolean));
function safeTree(value, depth = 0, budget = { n: 0 }) {
  if (++budget.n > 120000 || depth > 48) fail('invalid_payload', 'JSON is too complex.');
  if (typeof value === 'number' && !Number.isFinite(value)) fail('invalid_payload', 'Numbers must be finite.');
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (poison.has(key)) fail('invalid_payload', 'Reserved JSON property.');
    safeTree(value[key], depth + 1, budget);
  }
}

export function createServer(options = {}) {
  const env = options.env ?? process.env;
  const cfg = {
    allowedOrigins: options.allowedOrigins ? new Set(options.allowedOrigins) : list(env.ALLOWED_ORIGINS, 'https://kjb7876-lang.github.io,http://localhost:8080,http://127.0.0.1:8080'),
    allowedGames: options.allowedGames ? new Set(options.allowedGames) : list(env.ALLOWED_GAME_IDS, 'hapil'),
    maxRooms: positive(options.maxRooms ?? env.MAX_ROOMS, 16, 1, 128),
    maxConnections: positive(options.maxConnections ?? env.MAX_CONNECTIONS, 128, 1, 1024),
    maxConnectionsPerIp: positive(options.maxConnectionsPerIp ?? env.MAX_CONNECTIONS_PER_IP, 16, 1, 128),
    maxPayload: positive(options.maxPayload, 2 * 1024 * 1024, 1024, 2 * 1024 * 1024),
    guestGraceMs: positive(options.guestGraceMs, 60000), roomIdleMs: positive(options.roomIdleMs ?? env.ROOM_IDLE_MS, 900000),
    unauthIdleMs: positive(options.unauthIdleMs, 30000), heartbeatMs: positive(options.heartbeatMs, 15000), sweepMs: positive(options.sweepMs, 1000),
    maxBuffered: positive(options.maxBuffered, 512 * 1024), hardBuffered: positive(options.hardBuffered, 2 * 1024 * 1024),
    messageRate: positive(options.messageRate, 180), byteRate: positive(options.byteRate, 8 * 1024 * 1024), controlRate: positive(options.controlRate, 24),
  };
  if (!cfg.allowedOrigins.size || !cfg.allowedGames.size || cfg.allowedOrigins.has('*')) throw new Error('Explicit origin and game allowlists are required.');
  const rooms = new Map(), sessions = new Map(), connections = new Set(), ipAttempts = new Map();
  let closing = false;
  const server = http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'GET' && req.url === '/healthz') {
      res.writeHead(closing ? 503 : 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: !closing, protocol: 1 }));
    } else { res.writeHead(404); res.end('Not found'); }
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: cfg.maxPayload, perMessageDeflate: false });
  function send(c, data, droppable = false) {
    if (!c || c.ws.readyState !== WebSocket.OPEN) return false;
    if (c.ws.bufferedAmount > cfg.hardBuffered) { c.ws.close(1013, 'Backpressure; reconnect to resync'); return false; }
    if (droppable && c.ws.bufferedAmount > cfg.maxBuffered) { c.needsResync = true; return false; }
    c.ws.send(JSON.stringify({ v: 1, gameId: c.gameId ?? 'hapil', ...data })); return true;
  }
  const error = (c, requestId, code, message) => send(c, { type: 'error', ...(requestId ? { requestId } : {}), code, message });
  const ack = (c, m) => { if (m.requestId) send(c, { type: 'ack', requestId: m.requestId, operation: m.type }); };
  const roster = (r) => [...r.members.values()].map((p) => ({ slotId: p.slotId, nickname: p.nickname, heroId: p.heroId, ready: p.ready, connected: !!p.connection, isHost: p.isHost, loaded: p.loadedEpoch === r.epoch && r.epoch > 0 }));
  const roomState = (r) => ({ type: 'room', phase: r.phase, roster: roster(r), epoch: r.epoch, roomCode: r.code, mode: r.mode, hostStatus: r.hostStatus });
  function broadcast(r, data, guestsOnly = false, droppable = false) {
    for (const p of r.members.values()) if (!guestsOnly || !p.isHost) send(p.connection, data, droppable);
  }
  function barrier(r) {
    if (r.phase !== 'loading' || r.epoch === 0 || [...r.members.values()].some((p) => p.connection && p.loadedEpoch !== r.epoch)) return;
    r.phase = 'playing'; broadcast(r, { type: 'barrier', phase: 'playing', epoch: r.epoch }); broadcast(r, roomState(r));
  }
  function removeGuest(p) {
    const r = p.room; r.members.delete(p.slotId); sessions.delete(p.sessionId);
    if (p.connection) { p.connection.member = null; p.connection.needsResync = false; }
    p.connection = null; broadcast(r, roomState(r)); barrier(r);
  }
  function closeRoom(r, reason) {
    if (!rooms.delete(`${r.gameId}:${r.code}`)) return;
    for (const p of r.members.values()) {
      sessions.delete(p.sessionId);
      if (p.connection) { send(p.connection, { type: 'closed', reason }); p.connection.member = null; p.connection.needsResync = false; }
      p.connection = null;
    }
    r.members.clear(); r.latest = null;
  }
  function attach(c, p, m) {
    c.gameId = p.room.gameId; c.member = p; p.connection = c; p.disconnectedAt = null; p.loadedEpoch = -1; p.inputSeq = -1;
    send(c, { type: 'session', requestId: m.requestId, sessionId: p.sessionId, resumeToken: p.resumeToken, slotId: p.slotId, isHost: p.isHost,
      roomCode: p.room.code, phase: p.room.phase, roster: roster(p.room), mode: p.room.mode, epoch: p.room.epoch, seq: p.room.seq,
      hostStatus: p.room.hostStatus, ...(p.room.latest ? { snapshot: p.room.latest.snapshot, zone: p.room.latest.zone } : {}) });
    broadcast(p.room, roomState(p.room));
  }
  function profile(m, gameId, old = {}) {
    const nickname = m.nickname === undefined ? old.nickname ?? 'Player' : m.nickname;
    const heroId = m.heroId === undefined ? old.heroId ?? 'hwando' : m.heroId;
    if (!str(nickname, 24) || !nickname.trim() || !str(heroId, 64)) fail('invalid_profile', 'Nickname or hero is invalid.');
    if (gameId === 'hapil' && !HEROES.has(heroId)) fail('invalid_profile', 'Unknown HAPIL hero.');
    return { nickname: nickname.trim(), heroId };
  }
  function addMember(c, r, m, isHost) {
    const slotId = ['p1', 'p2', 'p3', 'p4'].find((id) => !r.members.has(id));
    if (!slotId) fail('room_full', 'Four player slots are occupied or reserved.');
    const p = { ...profile(m, r.gameId), slotId, isHost, ready: isHost, sessionId: token(16), resumeToken: token(32), room: r, inputSeq: -1, loadedEpoch: -1, connection: null, disconnectedAt: null };
    r.members.set(slotId, p); sessions.set(p.sessionId, p); attach(c, p, m);
  }
  function handle(c, m) {
    if (m.v !== 1 || !cfg.allowedGames.has(m.gameId)) fail('wrong_namespace', 'Unsupported game or protocol.');
    if (c.gameId && c.gameId !== m.gameId) fail('wrong_namespace', 'Connection belongs to another game.');
    c.gameId ??= m.gameId;
    if (!Object.hasOwn(FIELDS, m.type)) fail('invalid_message', 'Unsupported message type.');
    if (Object.keys(m).some((k) => !BASE.includes(k) && !FIELDS[m.type].includes(k))) fail('invalid_message', 'Unexpected message property.');
    if (m.requestId !== undefined && !str(m.requestId, 64)) fail('invalid_message', 'Invalid requestId.');
    if (m.requestId) {
      if (c.requests.has(m.requestId)) fail('duplicate_request', 'requestId was already used.');
      c.requests.add(m.requestId); if (c.requests.size > 128) c.requests.delete(c.requests.values().next().value);
    }
    if (!['input', 'snapshot', 'ping'].includes(m.type) && ++c.controlCount > cfg.controlRate) fail('rate_limited', 'Control message rate exceeded.');
    if (m.type === 'ping') {
      if (!Number.isFinite(m.sentAt)) fail('invalid_message', 'sentAt must be finite.');
      send(c, { type: 'pong', requestId: m.requestId, sentAt: m.sentAt, serverTime: Date.now() }); return;
    }
    if (['create', 'join', 'resume'].includes(m.type)) {
      if (c.member) fail('already_in_room', 'Leave the current room first.');
      if (m.type === 'create') {
        if (rooms.size >= cfg.maxRooms) fail('room_limit', 'Relay room capacity reached.');
        profile(m, m.gameId); if (m.mode !== undefined && (!str(m.mode, 32) || m.gameId === 'hapil' && !['STORY', 'DREAM'].includes(m.mode))) fail('invalid_message', 'Invalid mode.');
        let code; do { code = token(8).toUpperCase(); } while (rooms.has(`${m.gameId}:${code}`));
        const r = { code, gameId: m.gameId, mode: m.mode ?? 'STORY', phase: 'lobby', members: new Map(), epoch: 0, seq: -1, latest: null, hostStatus: { hidden: false, paused: false }, lastActive: Date.now() };
        rooms.set(`${m.gameId}:${code}`, r); addMember(c, r, m, true);
      } else if (m.type === 'join') {
        if (typeof m.code !== 'string' || !/^[A-Fa-f0-9]{16}$/.test(m.code)) fail('invalid_code', 'Room code must contain 16 hexadecimal characters.');
        const r = rooms.get(`${m.gameId}:${m.code.toUpperCase()}`);
        if (!r) fail('room_not_found', 'Room was not found in this game.');
        addMember(c, r, m, false); r.lastActive = Date.now();
      } else {
        if (!/^[a-f0-9]{32}$/.test(m.sessionId ?? '') || !/^[a-f0-9]{64}$/.test(m.resumeToken ?? '')) fail('resume_denied', 'Session cannot be resumed.');
        const p = sessions.get(m.sessionId);
        if (!p || p.room.gameId !== m.gameId || !timingSafeEqual(Buffer.from(m.resumeToken), Buffer.from(p.resumeToken))) fail('resume_denied', 'Session cannot be resumed.');
        if (p.connection) fail('session_active', 'Session is connected already.');
        if (p.isHost || Date.now() - p.disconnectedAt >= cfg.guestGraceMs) fail('resume_denied', 'Session has expired.');
        p.resumeToken = token(32); attach(c, p, m); p.room.lastActive = Date.now();
      }
      return;
    }
    const p = c.member;
    if (!p) fail('not_in_room', 'Create, join or resume a room first.');
    const r = p.room;
    const hostOnly = () => { if (!p.isHost) fail('host_only', 'Only the host can send this message.'); };
    switch (m.type) {
      case 'profile':
        if (r.phase !== 'lobby') fail('wrong_phase', 'Profiles are locked after starting.');
        Object.assign(p, profile(m, r.gameId, p)); if (!p.isHost) p.ready = false;
        broadcast(r, roomState(r)); break;
      case 'ready':
        if (r.phase !== 'lobby' || typeof m.ready !== 'boolean') fail('wrong_phase', 'Ready requires a lobby and a boolean.');
        p.ready = m.ready; broadcast(r, roomState(r)); break;
      case 'start':
        hostOnly(); if (r.phase !== 'lobby') fail('wrong_phase', 'Room has already started.');
        if ([...r.members.values()].some((q) => !q.connection || (!q.isHost && !q.ready))) fail('not_ready', 'Every guest must be connected and ready.');
        r.phase = 'loading'; broadcast(r, roomState(r)); break;
      case 'input': {
        if (r.phase !== 'playing' || p.loadedEpoch !== r.epoch) fail('not_loaded', 'Load the current epoch before sending input.');
        if (p.isHost) fail('guest_only', 'The host applies its own input locally.');
        if (!int(m.seq) || m.seq <= p.inputSeq) fail('stale_sequence', 'Input sequence must increase.');
        for (const k of ['moveX', 'moveY', 'aimX', 'aimY']) {
          const value = m[k] === undefined ? 0 : m[k];
          if (!Number.isFinite(value) || Math.abs(value) > (k.startsWith('move') ? 1 : 1e7)) fail('invalid_input', 'Input coordinates are invalid.');
        }
        if (m.autoMode !== undefined && typeof m.autoMode !== 'boolean') fail('invalid_input', 'autoMode must be boolean.');
        if (m.combatMode !== undefined && !['manual', 'semi', 'full'].includes(m.combatMode)) fail('invalid_input', 'Unknown combatMode.');
        const actions = m.actions === undefined ? [] : m.actions;
        if (!Array.isArray(actions) || actions.length > ACTIONS.size || new Set(actions).size !== actions.length || actions.some((x) => !ACTIONS.has(x))) fail('invalid_input', 'Unknown or duplicate input action.');
        p.inputSeq = m.seq;
        send(r.members.get('p1')?.connection, { type: 'input', slotId: p.slotId, seq: m.seq, epoch: r.epoch, moveX: m.moveX ?? 0, moveY: m.moveY ?? 0, aimX: m.aimX ?? 0, aimY: m.aimY ?? 0, actions, autoMode: m.autoMode ?? false, combatMode: m.combatMode ?? 'manual' }); break;
      }
      case 'snapshot':
      case 'transition':
        hostOnly(); if (r.phase === 'lobby') fail('wrong_phase', 'Start the room first.');
        if (!int(m.seq) || m.seq <= r.seq) fail('stale_sequence', 'Snapshot sequence must increase.');
        if (!int(m.epoch) || (m.type === 'transition' ? m.epoch !== r.epoch + 1 : m.epoch !== r.epoch || r.epoch === 0)) fail('stale_epoch', 'Invalid snapshot epoch.');
        if (!m.snapshot || typeof m.snapshot !== 'object' || Array.isArray(m.snapshot)) fail('invalid_snapshot', 'Snapshot must be a JSON object.');
        if (m.type === 'transition' && !str(m.zone, 128)) fail('invalid_message', 'A transition requires a zone.');
        r.seq = m.seq;
        if (m.type === 'transition') { r.epoch = m.epoch; r.phase = 'loading'; for (const q of r.members.values()) q.loadedEpoch = -1; }
        r.latest = { type: 'snapshot', seq: r.seq, epoch: r.epoch, snapshot: m.snapshot, zone: m.zone ?? r.latest?.zone };
        broadcast(r, { ...r.latest, type: m.type }, true, m.type === 'snapshot');
        if (m.type === 'transition') broadcast(r, roomState(r)); break;
      case 'loaded':
        if (!int(m.epoch) || m.epoch !== r.epoch || r.epoch === 0 || !r.latest) fail('stale_epoch', 'No current transition to acknowledge.');
        p.loadedEpoch = r.epoch;
        if (r.phase === 'playing') send(c, { type: 'barrier', phase: 'playing', epoch: r.epoch }); else barrier(r);
        broadcast(r, roomState(r)); break;
      case 'host_status':
        hostOnly(); if (typeof m.hidden !== 'boolean' || typeof m.paused !== 'boolean') fail('invalid_message', 'Host status requires booleans.');
        r.hostStatus = { hidden: m.hidden, paused: m.paused }; broadcast(r, { type: 'host_status', ...r.hostStatus }, true); break;
      case 'leave': if (p.isHost) closeRoom(r, 'host_left'); else removeGuest(p); break;
      default: fail('invalid_message', 'Unsupported message.');
    }
    r.lastActive = Date.now(); ack(c, m);
  }
  server.on('upgrade', (req, socket, head) => {
    const reject = (status) => socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
    if (closing) return reject('503 Service Unavailable');
    if (!['/', '/relay'].includes(req.url)) return reject('404 Not Found');
    if (!cfg.allowedOrigins.has(req.headers.origin)) return reject('403 Forbidden');
    // Trust the actual peer address, never arbitrary X-Forwarded-For headers.
    const ip = req.socket.remoteAddress ?? 'unknown', now = Date.now();
    let attempts = ipAttempts.get(ip);
    if (!attempts || now - attempts.at >= 60000) { attempts = { at: now, count: 0 }; ipAttempts.set(ip, attempts); }
    if (++attempts.count > 40 || connections.size >= cfg.maxConnections || [...connections].filter((c) => c.ip === ip).length >= cfg.maxConnectionsPerIp) return reject('429 Too Many Requests');
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, ip));
  });
  wss.on('connection', (ws, req, ip) => {
    const c = { ws, ip, gameId: null, member: null, alive: true, at: Date.now(), windowAt: Date.now(), count: 0, bytes: 0, controlCount: 0, requests: new Set(), needsResync: false };
    connections.add(c); send(c, { type: 'welcome', protocol: 1, maxPlayers: 4, maxPayload: cfg.maxPayload, guestGraceMs: cfg.guestGraceMs });
    ws.on('pong', () => { c.alive = true; }); ws.on('error', () => {});
    ws.on('message', (data, binary) => {
      if (c.blocked) return;
      let m;
      try {
        const now = Date.now();
        if (now - c.windowAt >= 1000) { c.windowAt = now; c.count = 0; c.bytes = 0; c.controlCount = 0; }
        c.at = now;
        if (++c.count > cfg.messageRate || (c.bytes += data.length) > cfg.byteRate) fail('rate_limited', 'Message or byte rate exceeded.');
        if (binary) fail('invalid_message', 'Send JSON text messages.');
        m = JSON.parse(data.toString());
        if (!m || typeof m !== 'object' || Array.isArray(m)) fail('invalid_message', 'Expected a JSON object.');
        if (!['snapshot', 'transition'].includes(m.type) && data.length > 4096) fail('payload_too_large', 'Control and input messages are limited to 4096 bytes.');
        safeTree(m); handle(c, m);
      } catch (e) {
        error(c, str(m?.requestId, 64) ? m.requestId : undefined, e.code ?? 'invalid_message', e.code ? e.message : 'Invalid JSON message.');
        if (e.code === 'rate_limited') { c.blocked = true; ws.close(1008, 'Rate limit'); }
      }
    });
    ws.on('close', () => {
      connections.delete(c); const p = c.member;
      if (!p || p.connection !== c) return;
      c.member = null; p.connection = null;
      if (p.isHost) closeRoom(p.room, 'host_disconnected');
      else { p.disconnectedAt = Date.now(); p.loadedEpoch = -1; broadcast(p.room, roomState(p.room)); barrier(p.room); }
    });
  });
  const heartbeat = setInterval(() => {
    for (const c of connections) {
      if (!c.alive) { c.ws.terminate(); continue; }
      c.alive = false; c.ws.ping();
    }
  }, cfg.heartbeatMs);
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const c of connections) {
      if (!c.member && now - c.at >= cfg.unauthIdleMs) c.ws.close(1008, 'Inactive connection');
      if (c.needsResync && c.ws.bufferedAmount <= cfg.maxBuffered && c.member?.room.latest) {
        c.needsResync = false; send(c, { type: 'resync_required', epoch: c.member.room.epoch, reason: 'backpressure' }); send(c, { ...c.member.room.latest, resync: true }, true);
      }
    }
    for (const r of rooms.values()) {
      if (now - r.lastActive >= cfg.roomIdleMs) { closeRoom(r, 'idle_timeout'); continue; }
      for (const p of r.members.values()) if (!p.connection && p.disconnectedAt !== null && now - p.disconnectedAt >= cfg.guestGraceMs) removeGuest(p);
    }
    for (const [ip, a] of ipAttempts) if (now - a.at >= 60000) ipAttempts.delete(ip);
  }, cfg.sweepMs);
  heartbeat.unref(); sweep.unref();
  async function close() {
    if (closing) return;
    closing = true; clearInterval(heartbeat); clearInterval(sweep);
    for (const r of rooms.values()) closeRoom(r, 'server_shutdown');
    for (const c of connections) c.ws.close(1001, 'Server shutting down');
    const timer = setTimeout(() => { for (const c of connections) c.ws.terminate(); }, 500); timer.unref();
    await new Promise((resolve) => wss.close(resolve)); clearTimeout(timer);
    if (server.listening) await new Promise((resolve, reject) => server.close((e) => e ? reject(e) : resolve()));
  }
  return { server, wss, close, config: cfg, stats: () => ({ rooms: rooms.size, sessions: sessions.size, connections: connections.size }) };
}
export async function start(options = {}) {
  const relay = createServer(options), port = options.port ?? positive((options.env ?? process.env).PORT, 10000, 1, 65535);
  await new Promise((resolve, reject) => {
    relay.server.once('error', reject);
    relay.server.listen(port, options.host ?? '0.0.0.0', () => { relay.server.off('error', reject); resolve(); });
  });
  return relay;
}
