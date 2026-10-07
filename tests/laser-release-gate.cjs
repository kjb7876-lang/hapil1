'use strict';
// Read-only release audit. Does not change game state, gameplay files or saves.
// RC128 candidate integration is tested only in a disposable local worktree.
// Linux + Chromium at /usr/bin/chromium are required by the existing suites.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.env.HAPIL_RELEASE_OUTPUT || path.join(root, 'qa-results', 'laser-release'));
fs.mkdirSync(output, { recursive: true });
const suites = [
  ['rc128-candidate', ['tests/rc128-candidate.cjs']],
  ['renderer-syntax', ['--check', 'assets/rc77/connected-laser.js']],
  ['bundle-syntax', ['--check', 'assets/index-v31526.js']],
  ['approved-art', ['tests/rc119-laser-body-browser.cjs']],
  ['laser-phases', ['tests/rc118-laser-phase-browser.cjs']],
  ['laser-continuity', ['tests/rc116-laser-continuity-browser.cjs']],
  ['laser-telegraph', ['tests/rc116-laser-telegraph-browser.cjs']],
  ['combat', ['tests/rc108-combat-browser.cjs']],
  ['map-advance', ['tests/rc115-map-advance-smoke.cjs']],
  ['natural-story', ['tests/rc115-natural-story-portal-browser.cjs']]
];
const rows = [];
const git = (...args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
};
const report = {
  startedAt: new Date().toISOString(),
  testedCommit: git('rev-parse', 'HEAD'),
  worktreeCleanAtStart: git('status', '--porcelain') === '',
  approvedVisualCommit: '19a4c1f92df16559e43ba822ae0f7b8e74a5c47a',
  restoredGameplayCommit: 'f159c8f8e5f53c8f570baf97d9491a60f8507745',
  node: process.version,
  status: 'running',
  suites: rows
};
function save() {
  fs.writeFileSync(path.join(output, 'release-summary.json'), JSON.stringify(report, null, 2) + '\n');
}
save();
for (const [name, args] of suites) {
  const directory = path.join(output, name);
  fs.mkdirSync(directory, { recursive: true });
  const started = Date.now();
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    // The isolated historical candidate checks out the full asset tree in a
    // disposable worktree; on hosted runners it can exceed the old 15-minute
    // cap while Git is still materializing a few thousand unchanged files.
    timeout: name === 'rc128-candidate' ? 1800000 : name === 'natural-story' ? 210000 : 180000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, HAPIL_QA_OUTPUT: directory, HAPIL_NATURAL_LIMIT_MS: '150000' }
  });
  fs.writeFileSync(path.join(directory, 'stdout.log'), result.stdout || '');
  fs.writeFileSync(path.join(directory, 'stderr.log'), result.stderr || '');
  if (name === 'rc128-candidate') console.log(result.stdout || 'RC128 candidate produced no stdout.');
  const row = {
    name, command: ['node', ...args].join(' '),
    status: result.status === 0 && !result.error ? 'passed' : 'failed',
    exitCode: result.status, signal: result.signal,
    durationMs: Date.now() - started,
    error: result.error ? String(result.error) : null
  };
  // The original browser suite only asserts absence of JS/HTTP errors.
  // A stalled initial map must NOT be reported as successful progression.
  if (name === 'natural-story' && row.status === 'passed') {
    try {
      const natural = JSON.parse(fs.readFileSync(path.join(directory, 'natural-story-results.json'), 'utf8'));
      row.progression = {
        usedProgressCheats: natural.usedProgressCheats,
        changedZone: natural.changedZone,
        firstZone: natural.first?.zone,
        finalZone: natural.final?.zone,
        finalHp: natural.final?.hp,
        elapsedMs: natural.final?.elapsedMs
      };
      if (natural.standardStory !== true || natural.usedProgressCheats !== false ||
          natural.changedZone !== true || !natural.first?.zone || !natural.final?.zone ||
          natural.final.zone === natural.first.zone || !(natural.final.hp > 0) ||
          !Array.isArray(natural.errors) || natural.errors.length !== 0 ||
          !Array.isArray(natural.failedResponses) || natural.failedResponses.length !== 0) {
        row.status = 'failed';
        row.error = 'Natural Story progression was not demonstrated without state cheats within 150 seconds. Inspect the JSON and screenshots; do not label the release progression-safe.';
      }
    } catch (error) {
      row.status = 'failed';
      row.error = 'Missing or invalid natural progression evidence: ' + String(error);
    }
  }
  rows.push(row);
  console.log(`${row.status.toUpperCase()} ${name} (${row.durationMs} ms)`);
  if (row.error) console.error(row.error);
  if (row.status === 'failed' && result.stderr) console.error(result.stderr.slice(-4000));
  save();
}
report.finishedAt = new Date().toISOString();
report.passed = rows.filter(row => row.status === 'passed').length;
report.failed = rows.filter(row => row.status !== 'passed').length;
report.status = report.failed === 0 ? 'passed' : 'failed';
save();
console.log(`LASER_RELEASE ${report.status.toUpperCase()} ${report.passed}/${rows.length} ${report.testedCommit}`);
process.exitCode = report.failed === 0 ? 0 : 1;
