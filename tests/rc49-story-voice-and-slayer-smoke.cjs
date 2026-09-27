const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const manager = fs.readFileSync(path.join(root, 'assets/rc49/story-voice.js'), 'utf8');

async function run() {
  let gesture = true, fetches = 0, starts = 0, plays = 0, blocks = 0, ends = 0;
  const nodes = [];
  class AudioContextMock {
    constructor() {
      AudioContextMock.instance = this;
      this.state = 'suspended';
      this.sampleRate = 24000;
      this.currentTime = 0;
      this.destination = {};
    }
    resume() {
      if (!gesture && this.state === 'suspended') return Promise.reject(new Error('gesture required'));
      this.state = 'running';
      return Promise.resolve();
    }
    createBuffer() {return {};}
    createBufferSource() {
      const node = {
        connect() {}, disconnect() {}, stop() {},
        start: (_when, offset = 0) => {starts++; node.offset = offset;},
      };
      nodes.push(node);
      return node;
    }
    createGain() {return {gain: {value: 0}, connect() {}, disconnect() {}};}
    decodeAudioData() {return Promise.resolve({duration: 12});}
  }
  const win = {
    AudioContext: AudioContextMock,
    fetch: async () => {fetches++; return {ok: true, arrayBuffer: async () => new ArrayBuffer(8)};},
  };
  const audioFallback = () => {throw new Error('unlocked WebAudio must handle delayed scene playback');};
  vm.runInNewContext(manager, {window: win, Audio: audioFallback});
  const voice = win.__HAPIL_STORY_VOICE_RC49__;
  assert(voice.unlock('./assets/rc26/audio/opening-memory.wav'), 'start gesture primes WebAudio');
  assert(nodes.length, 'a silent buffer starts inside the user gesture');
  gesture = false; // Scene image loading finishes after transient activation has expired.
  const clip = voice.create('./assets/rc26/audio/opening-memory.wav', {
    volume: .68, onPlaying: () => plays++, onBlocked: () => blocks++, onEnded: () => ends++,
  });
  assert.equal(await clip.play(), true, 'the delayed scene plays through the unlocked context');
  assert.equal(clip.playing, true);
  assert.equal(fetches, 1, 'the early prefetch is shared by scene playback');
  assert.equal(nodes.at(-1).offset, 0);
  // Pause and resume preserve narration position, including when a tab hides.
  const active = nodes.at(-1);
  assert.equal(starts, 2, 'one silent unlock and one narrated start');
  active.onended();
  assert.equal(ends, 1);
  assert.equal(clip.ended, true);
  assert.equal(await clip.play(), true, 'replay begins from the start after ending');
  assert.equal(nodes.at(-1).offset, 0);
  AudioContextMock.instance.currentTime = 3.25;
  clip.pause();
  assert.equal(clip.paused, true);
  assert.equal(await clip.play(), true);
  assert.equal(nodes.at(-1).offset, 3.25, 'resume continues at the paused timestamp');
  assert.equal(clip.playing, true);
  clip.stop();
  assert.equal(clip.playing, false);
  assert.equal(await clip.play(), false, 'disposed scenes never restart');
  assert.equal(plays, 3);
  assert.equal(blocks, 0);

  let mediaBlocked = true, fallbackBlocked = 0;
  const fallbackWindow = {};
  class MediaMock {
    constructor(src) {this.src = src; this.paused = true; this.events = new Map();}
    setAttribute() {}
    addEventListener(name, cb) {this.events.set(name, cb);}
    play() {
      if (mediaBlocked) return Promise.reject(new Error('autoplay blocked'));
      this.paused = false;
      this.events.get('playing')?.();
      return Promise.resolve();
    }
    pause() {this.paused = true;}
    removeAttribute() {this.src = '';}
    load() {}
  }
  vm.runInNewContext(manager, {window: fallbackWindow, Audio: MediaMock});
  const manual = fallbackWindow.__HAPIL_STORY_VOICE_RC49__.create('/voice.wav', {
    onBlocked: () => fallbackBlocked++,
  });
  assert.equal(await manual.play(), false);
  assert.equal(manual.status, 'blocked');
  assert.equal(fallbackBlocked, 1, 'blocked autoplay remains visible to the scene');
  mediaBlocked = false;
  assert.equal(await manual.play(), true, 'voice button can retry after a user gesture');
  manual.stop();

  const marker = '/* HAPIL FINAL RC5: canonical on-screen Hwando and Slayer bodies.';
  const start = bundle.indexOf(marker), codeStart = bundle.indexOf(' const root=', start);
  const codeEnd = bundle.indexOf(' let installed=false,attempts=0;', codeStart);
  assert(start > 0 && codeStart > start && codeEnd > codeStart);
  const drawCalls = [];
  const image = {complete: true, naturalWidth: 1774, naturalHeight: 887};
  const motion = new Function('window','MONGSE_queueImage','G',
    bundle.slice(codeStart, codeEnd) + '\nreturn {state,draw,sheets};')(
      {__HAPIL_AUTHORED_MOTION_RC4__: {direction: motion => motion.direction}},
      (_cache, file) => {assert(file.endsWith('slayer-down-cleave.png')); return image;},
      (x, y) => ({x: 27 * (x-y), y: 13.5 * (x+y)}));
  const downward = {kind: 'attack', direction: 'front', dx: 1, dy: 1, started: 1, until: 1.38};
  const prepare = motion.state('slayer', downward, 1.04);
  const strike = motion.state('slayer', downward, 1.13);
  assert.equal(prepare.sheet, 'down');
  assert.equal(prepare.frame, 0);
  assert.equal(strike.frame, 1);
  assert.equal(motion.state('slayer', {...downward, direction: 'left', dx: -1, dy: 1}, 1.13).sheet, 'action',
    'side strikes retain their authored side frames');
  assert.equal(motion.state('slayer', {...downward, kind: 'skill'}, 1.13).sheet, 'down',
    'downward skills use the same visible authored strike');
  const ctx = {
    globalAlpha: 1, save() {}, restore() {}, translate(x, y) {drawCalls.push(['at', x, y]);},
    drawImage(...args) {drawCalls.push(['image', ...args]);},
  };
  assert(motion.draw(ctx, {}, 100, 200, 66, {}, prepare));
  assert(motion.draw(ctx, {}, 100, 200, 66, {}, strike));
  const frames = drawCalls.filter(call => call[0] === 'image');
  assert.deepEqual(frames.map(frame => frame[2]), [0, 887], 'two complete, separate frames are drawn');
  assert(Math.abs(frames[0][6] + 546 * 66 / 605) < .001);
  assert(Math.abs(frames[1][6] + 366 * 66 / 605) < .001);
  assert(Math.abs(frames[0][7] + 860 * 66 / 605) < .001);
  assert(Math.abs(frames[1][7] + 875 * 66 / 605) < .001);
  const png = fs.readFileSync(path.join(root, 'assets/hero-authored-v314rc49/slayer-down-cleave.png'));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1774);
  assert.equal(png.readUInt32BE(20), 887);
  assert.equal(png[25], 6, 'the new two-frame attack sprite has alpha transparency');
  assert(html.includes('./assets/rc49/story-voice.js?v=34901'));
  assert(bundle.includes('window.__HAPIL_STORY_VOICE_RC49__?.unlock('));
  assert(bundle.includes('a.id === `slayer` ? 0.11'));
  assert(/slayer: Object\.freeze\(\{\s*front: \[19, -45\][^}]*A: Object\.freeze\(\{ front: \[0, -8\] \}\)/.test(bundle),
    'only the Slayer basic down cleave uses the new sword-tip origin');
  console.log('RC49: unlocked narration, retry, scene lifecycle, and measured Slayer down cleave OK');
}

run().catch(error => {console.error(error); process.exitCode = 1;});
