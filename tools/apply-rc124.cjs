'use strict';
// One-time, hash-checked integration. Only the two explicitly listed files change.
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const bundle='assets/index-v31526.js',html='index.html';
const hash=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
assert.equal(hash(bundle),'eecd59b1e5abd0f75855fc992ddc85902f694a79','native bundle changed: reconcile before applying');
assert.equal(hash(html),'40f241a8b9bef8754939286257c2793d3863eb5e','entrypoint changed: reconcile before applying');
let source=fs.readFileSync(bundle,'utf8'),entry=fs.readFileSync(html,'utf8');
function once(text,from,to){assert.equal(text.split(from).length-1,1,'expected one exact patch anchor: '+from.slice(0,100));return text.replace(from,to);}
source=once(source,'  if (i.showCombatInfo !== !1) {\n  let C = Math.min(142,','  // RC124: health is mandatory; optional combat labels remain hidden.\n  let C = Math.min(142,');
const old='  ((e.fillStyle = `rgba(4,8,14,.94)`),\n    e.fillRect(w - 1, ee - 1, C + 2, n.boss ? 9 : 8),\n    (e.fillStyle = n.boss ? `#ff3b66` : n.midboss ? `#ff9d3d` : `#ff795e`),\n    e.fillRect(w, ee, C * Math.max(0, n.hp / n.maxHp), n.boss ? 7 : 6));\n  let te =';
const replacement='  if (Number.isFinite(n.hp) && n.hp > 0 && Number.isFinite(n.maxHp) && n.maxHp > 0 && !n.visualOnly && !n.friendly) {\n    e.save();\n    e.globalAlpha = 1; e.filter = `none`; e.shadowBlur = 0;\n    e.fillStyle = `rgba(230,235,245,.9)`;\n    e.fillRect(w - 2, ee - 2, C + 4, n.boss ? 11 : 10);\n    e.fillStyle = `rgba(4,8,14,.98)`;\n    e.fillRect(w - 1, ee - 1, C + 2, n.boss ? 9 : 8);\n    e.fillStyle = n.boss ? `#ff3b66` : n.midboss ? `#ff9d3d` : `#ff795e`;\n    e.fillRect(w, ee, C * Math.max(0, Math.min(1, n.hp / n.maxHp)), n.boss ? 7 : 6);\n    e.restore();\n  }\n  if (i.showCombatInfo !== !1) {\n  let te =';
source=once(source,old,replacement);
source+='\n/* RC124 shared map-edge overscan; G is the native world projection. */\nwindow.__HAPIL_LASER_OVERRUN_RC124__?.install(G);\n';
entry=once(entry,'    <script type="module" crossorigin src="./assets/index-v31526.js?v=42201"></script>','    <script src="./assets/rc124/laser-overrun.js?v=42401"></script>\n    <script type="module" crossorigin src="./assets/index-v31526.js?v=42401"></script>');
fs.writeFileSync(bundle,source);fs.writeFileSync(html,entry);
execFileSync(process.execPath,['--check',bundle],{stdio:'inherit'});
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').sort();
assert.deepEqual(changed,[bundle,html].sort());
console.log('RC124_INTEGRATION',JSON.stringify({changed,bundleBlob:hash(bundle),entryBlob:hash(html),approvedRendererBlob:hash('assets/rc77/connected-laser.js')}));
