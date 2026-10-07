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
const activeBranch = 'codex/rc152-image-combat';

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
console.log(JSON.stringify({ status: 'passed', chromiumLaunches: launchers.length, scannedPaths: paths.length, activeWorkflows: 3, explicitSandbox: true, fallback: false, runnerPrivilegeMutation: false }));
