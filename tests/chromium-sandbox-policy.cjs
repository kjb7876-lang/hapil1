'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const paths = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '--', '.github/workflows', 'qa', 'tests', 'tools'], {
  cwd: root,
  encoding: 'utf8',
}).split(/\r?\n/).filter(Boolean);
const sourceExtensions = new Set(['.js', '.cjs', '.mjs', '.sh', '.yml', '.yaml']);
const disabledSwitch = new RegExp('--' + '(?:no|disable)[A-Za-z0-9_-]*sandbox', 'i');
const literalDisabledSwitch = ['--no', '-sandbox'].join('');
const badSwitches = [];
const badOptions = [];
const badRunnerMutations = [];
const launchers = [];
const chromeStableLaunchers = [];
const activeBranch = 'codex/rc152-image-combat';
const chromeStableWorkflowFiles = [
  'tests/rc153-chrome-sandbox-smoke.cjs',
  'tests/rc153-combat-browser.cjs', 'tests/rc153-boundary-input-browser.cjs',
  'tests/rc153-portrait-composition-browser.cjs', 'tests/rc154-mobile-layout-browser.cjs',
  'tests/rc138-arena-browser.cjs', 'tests/rc152-image-browser.cjs', 'tests/rc137-audit-browser.cjs',
  'tests/rc139-narration-browser.cjs', 'tests/rc137-boss-lifecycle-browser.cjs',
  'tests/rc134-persona-effects-browser.cjs', 'tests/rc137-direct-admission-browser.cjs',
  'tests/rc142-gameplay-browser.cjs', 'tests/rc143-persona-live-browser.cjs',
  'tests/rc142-persona-volley-browser.cjs', 'tests/rc143-mobile-viewport-browser.cjs',
  'tests/rc137-direction-input-browser.cjs', 'tests/rc137-death-choice-browser.cjs',
  'tests/rc147-camera-finale-browser.cjs', 'tests/rc148-six-cosmic-perf-browser.cjs',
  'tests/rc148-persona-memory-browser.cjs', 'tests/rc150-live-browser.cjs',
  'tests/rc147-auto-defense-browser.cjs', 'tests/rc86-samong-cosmic-browser.cjs',
  'tests/rc88-danmaku-rpg-browser.cjs', 'tests/dream-death-dialog-browser.cjs',
  'tests/rc121-connected-topology-browser.cjs', 'tests/rc121-dream-regression-browser.cjs',
  'tests/rc142-movement-space-browser.cjs', 'tests/story-narration-browser.cjs',
  'tests/story-narration-surfaces-browser.cjs', 'tests/story-narration-audio-browser.cjs',
  'tests/story-narration-webaudio-browser.cjs', 'tests/story-narration-decoder-edges.cjs',
  'tests/combat-audio-browser.cjs', 'tests/rc119-laser-body-browser.cjs',
  'tests/rc118-laser-phase-browser.cjs', 'tests/rc116-laser-continuity-browser.cjs',
  'tests/rc116-laser-telegraph-browser.cjs', 'tests/rc108-combat-browser.cjs',
  'tests/rc115-natural-story-portal-browser.cjs', 'tests/rc128-browser.cjs',
  'tests/rc127-browser.cjs', 'tests/rc126-combat-browser.cjs',
  'tests/rc125-adaptive-battlefield-browser.cjs', 'tests/rc125-first-frame-browser.cjs',
  'tests/rc123-boundary-browser.cjs', 'tests/rc122-autoplay-browser.cjs',
  'tests/rc129-browser.cjs', 'qa/rc130/public-smoke.cjs', 'qa/rc133/published.cjs'
];
const activeWorkflows = [
  '.github/workflows/rc137-integration.yml',
  '.github/workflows/rc147-camera-finale.yml',
  '.github/workflows/story-narration-audit.yml',
  '.github/workflows/rc133-published.yml'
];

for (const relative of paths) {
  const file = path.join(root, relative);
  if (!sourceExtensions.has(path.extname(relative)) || !fs.statSync(file).isFile()) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(literalDisabledSwitch) || disabledSwitch.test(text)) badSwitches.push(relative);
  if (/chromiumSandbox\s*:\s*false\b/.test(text)) badOptions.push(relative);
  if (relative.startsWith('.github/workflows/') && text.includes(activeBranch) &&
      /\b(?:chown|chmod|chgrp|setcap|sysctl|unshare)\b/i.test(text)) {
    badRunnerMutations.push(relative);
  }
  if (!/\.(?:js|cjs|mjs)$/.test(relative)) continue;

  const pattern = /chromium\.launch\s*\(/g;
  for (let match; (match = pattern.exec(text));) {
    const options = text.slice(pattern.lastIndex).match(/^\s*\{\s*chromiumSandbox\s*:\s*true\s*,/);
    if (!options) badOptions.push(`${relative}: chromium.launch must explicitly enable chromiumSandbox`);
    launchers.push(relative);
  }
}

assert.deepEqual(badSwitches, [], `sandbox-disabling Chromium switches: ${badSwitches.join(', ')}`);
assert.deepEqual(badOptions, [], `Chromium launches without explicit sandbox: ${badOptions.join(', ')}`);
assert.deepEqual(badRunnerMutations, [], `active workflows alter OS ownership, permissions, or kernel settings: ${badRunnerMutations.join(', ')}`);
assert(launchers.length > 0, 'the audit must find Chromium launch sites');
const pngPacker = fs.readFileSync(path.join(root, 'tools/rc154-pack-visual-evidence.cjs'), 'utf8');
assert(pngPacker.includes('chrome-sandbox-smoke.json') && pngPacker.includes('browserVersionFromSmoke'), 'the PNG packer must use exact sandbox-smoke evidence for Chrome version');
assert(!/HAPIL_CHROMIUM|\/usr\/bin\/chromium/.test(pngPacker), 'the PNG packer must not launch or inspect bundled Chromium');
for (const relative of chromeStableWorkflowFiles) {
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  const launchCount = [...text.matchAll(/chromium\.launch\s*\(/g)].length;
  const channelCount = [...text.matchAll(/\bchannel\s*:\s*(['"])chrome\1/g)].length;
  assert(launchCount > 0, `${relative}: expected a browser launch`);
  assert.equal(channelCount, launchCount, `${relative}: every launch must explicitly use channel 'chrome'`);
  assert(!/\bexecutablePath\s*:/.test(text), `${relative}: executablePath can silently select bundled Chromium`);
  chromeStableLaunchers.push({ file: relative, launches: launchCount });
}
for (const relative of activeWorkflows) {
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  assert(!/playwright\/cli\.js[^\n]*install[^\n]*chromium/i.test(text), `${relative}: do not install or select bundled Chromium`);
  assert(!/HAPIL_CHROMIUM\s*=/.test(text), `${relative}: do not inject a bundled Chromium executable path`);
  assert(text.includes('command -v google-chrome') && text.includes('google-chrome --version'), `${relative}: require the preinstalled Chrome Stable command`);
  assert(text.includes('tests/rc153-chrome-sandbox-smoke.cjs'), `${relative}: exact workflow must require Chrome sandbox smoke`);
}
console.log(JSON.stringify({ status: 'passed', chromiumLaunches: launchers.length, chromeStableLaunchers, scannedPaths: paths.length, activeWorkflows: activeWorkflows.length, explicitSandbox: true, chromeChannel: true, fallback: false, runnerPrivilegeMutation: false }));
