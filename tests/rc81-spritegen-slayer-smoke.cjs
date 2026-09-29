const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
for (const side of ['left', 'right']) {
  const dir = path.join(root, 'assets', 'hero-authored-v314rc81', `slayer-side-${side}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const inspect = JSON.parse(fs.readFileSync(path.join(dir, 'sprite-inspect.report.json'), 'utf8'));
  const frames = JSON.parse(fs.readFileSync(path.join(dir, 'frames', 'frames-manifest.json'), 'utf8'));
  const atlas = fs.readFileSync(path.join(dir, 'sprite-sheet-alpha.png'));
  assert.equal(manifest.engine, 'component-row');
  assert.equal(manifest.cell.width, 640);
  assert.equal(manifest.cell.height, 640);
  assert.equal(manifest.animation.rows.attack.frames, 4);
  assert.equal(manifest.animation.rows.attack.loop, false);
  assert.equal(inspect.ok, true, `${side} atlas inspection must pass`);
  assert.deepEqual(inspect.errors, []);
  assert.deepEqual(inspect.warnings, []);
  assert.equal(frames.rows[0].frame_records.length, 4);
  assert(frames.rows[0].frame_records.every(frame => frame.edge_pixels === 0),
    `${side} sword/body silhouettes must stay inside every atlas cell`);
  assert(frames.rows[0].frame_records.every(frame => frame.chroma_adjacent_pixels === 0),
    `${side} sprite edges must contain no chroma-key fringe`);
  assert.equal(atlas.toString('hex', 0, 8), '89504e470d0a1a0a', `${side} atlas must be a valid PNG`);
  assert.equal(atlas.readUInt32BE(16), 2560);
  assert.equal(atlas.readUInt32BE(20), 640);
  assert.equal(atlas[25], 6, `${side} atlas must retain an alpha channel`);
  assert(fs.statSync(path.join(dir, 'exports', 'attack.gif')).size > 1000,
    `${side} QA animation is missing`);
}

console.log('RC81 PASS: both sprite-gen Slayer atlases have four clean, uncut RGBA frames and valid QA previews.');
