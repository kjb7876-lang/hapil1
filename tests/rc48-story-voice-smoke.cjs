const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'assets/index-v31526.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const storyContext = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/rc26/story.js'), 'utf8'), storyContext);
const story = storyContext.window.__HAPIL_STORY_RC26__;

assert(!html.includes('./assets/rc26/story.js?v=35201'), 'the superseded opening/interlude module must not load in the game');
assert(html.includes('./data/story-rc51.js?v=202610022'), 'the uploaded monologue data must be the active story source');
assert(bundle.includes('if(window.__HAPIL_STORY_RC51__?.replacesLegacy)return false;'), 'legacy interlude requests must be inert');
assert(/\.\/assets\/index-v31526\.js\?v=\d+/.test(html));
assert(bundle.includes('storySound: v.sound'));
assert(bundle.includes('storyVolume: v.sfxVolume'));
for (const [kind, file, frames] of [
  ['opening', 'opening-memory.wav', 1311600],
  ['root', 'root-memory.wav', 318000],
]) {
  const source = story.voice[kind];
  assert.equal(source, `./assets/rc26/audio/${file}`);
  const wav = fs.readFileSync(path.join(root, source));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(20), 1, 'audio must stay uncompressed PCM');
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), frames * 2);
  let sum = 0, peak = 0;
  for (let pos = wav.length - 2400; pos < wav.length; pos += 2) {
    const sample = wav.readInt16LE(pos) / 32768;
    sum += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  assert(Math.sqrt(sum / 1200) < .002 && peak < .01, `${kind} must end quietly`);
  assert.equal(story.scene(kind).slides[0].body, story.text[kind].join('\n'));
}

const start = bundle.indexOf('function HAPIL_StoryCardRC26(');
const end = bundle.indexOf('function MONGSE_InterludeScene(', start);
assert(start > 0 && end > start);
const effects = [], audioInstances = [], timers = new Map(), listeners = new Map();
let nextTimer = 1, proceeds = 0, ducks = 0;
class FakeClip {
  static blockNext = false;
  constructor(src, options) {
    this.src = src;
    this.volume = options.volume;
    this.options = options;
    this.paused = true;
    this.ended = false;
    this.playCount = 0;
    audioInstances.push(this);
  }
  play() {
    this.playCount++;
    if (FakeClip.blockNext) {
      FakeClip.blockNext = false;
      this.options.onBlocked();
      return Promise.resolve(false);
    }
    this.paused = false;
    this.ended = false;
    this.options.onPlaying();
    return Promise.resolve(true);
  }
  pause() {this.paused = true;}
  stop() {this.pause(); this.src = '';}
}
const l = {
  useRef: value => ({current: value}),
  useState: value => [value, () => {}],
  useEffect: fn => effects.push(fn),
  useLayoutEffect: () => {},
};
const q = {jsx: (type, props) => ({type, props}), jsxs: (type, props) => ({type, props})};
const windowMock = {
  __HAPIL_STORY_RC26__: story,
  __HAPIL_STORY_VOICE_RC49__: {create: (src, options) => new FakeClip(src, options)},
  setInterval: fn => {const id = nextTimer++; timers.set(id, fn); return id;},
  clearInterval: id => timers.delete(id),
};
const documentMock = {
  hidden: false,
  addEventListener: (name, cb) => listeners.set(name, cb),
  removeEventListener: name => listeners.delete(name),
};
const Component = new Function('l','q','window','document','MONGSE_assetUrl',
  bundle.slice(start, end) + '\nreturn HAPIL_StoryCardRC26;')(
    l, q, windowMock, documentMock, path => path + '?v=31332');
const find = (tree, className) => {
  if (!tree || typeof tree !== 'object') return null;
  if (tree.props?.className === className) return tree;
  const children = tree.props?.children;
  return [children].flat(Infinity).map(node => find(node, className)).find(Boolean) ?? null;
};
for (const kind of ['opening', 'root']) {
  const card = Component({scene: story.scene(kind), proceed: () => proceeds++, sound: true,
    voiceVolume: .8, duckBgm: () => ducks++});
  const cleanup = effects.shift()();
  const clip = audioInstances.at(-1);
  assert(clip.src.includes(story.voice[kind]));
  assert.equal(clip.playCount, 1, 'voice starts when its scene opens');
  assert.equal(clip.volume, .68);
  assert(ducks >= 1);
  assert.equal(timers.size, 1);
  const voiceButton = find(card, 'rc26-story-voice');
  assert(voiceButton, 'blocked autoplay needs a manual play button');
  voiceButton.props.onClick();
  assert.equal(clip.paused, true, 'the voice button pauses playback');
  voiceButton.props.onClick();
  assert.equal(clip.playCount, 2, 'the voice button resumes playback');
  if (kind === 'opening') {
    documentMock.hidden = true;
    listeners.get('visibilitychange')();
    assert.equal(clip.paused, true, 'hidden tabs pause narration');
    documentMock.hidden = false;
    listeners.get('visibilitychange')();
    assert.equal(clip.playCount, 3, 'returning to the scene resumes narration');
  }
  const continueButton = find(card, 'rc26-story-continue');
  continueButton.props.onClick();
  assert.equal(clip.paused, true, 'continuing must stop narration immediately');
  cleanup();
  assert.equal(timers.size, 0);
  assert.equal(listeners.size, 0);
  assert.equal(clip.src, '', 'scene cleanup releases audio');
}
assert.equal(proceeds, 2);
const before = audioInstances.length;
const muted = Component({scene: story.scene('opening'), proceed: () => {}, sound: false, voiceVolume: .8});
effects.shift()();
assert.equal(audioInstances.length, before, 'muted scenes must stay silent');
assert.equal(find(muted, 'rc26-story-voice'), null);
FakeClip.blockNext = true;
const fallback = Component({scene: story.scene('opening'), proceed: () => {}, sound: true, voiceVolume: .8});
const cleanupFallback = effects.shift()();
const fallbackClip = audioInstances.at(-1);
assert.equal(fallbackClip.paused, true, 'blocked autoplay stays silent');
find(fallback, 'rc26-story-voice').props.onClick();
assert.equal(fallbackClip.playCount, 2, 'a user gesture can start blocked autoplay');
cleanupFallback();

console.log('RC48: two trimmed PCM lines, scene playback, fallback, pause, cleanup, and mute OK');
