'use strict';
// One-time integration into the inspected RC124 bundle. Never re-run after applying.
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const bundle='assets/index-v31526.js',html='index.html';
const hash=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
assert.equal(hash(bundle),'788b554fb7d4df5f346436ed6710c7705acf0fc8','native bundle changed; reconcile before applying');
assert.equal(hash(html),'0a03e71fdc295e4f85b60c4fda29b456aa8e3e76','entrypoint changed; reconcile before applying');
assert.equal(hash('assets/rc77/connected-laser.js'),'6bb4a891eb541734ef4c86f4d46dfb6ea94a44df','approved laser art changed');
let source=fs.readFileSync(bundle,'utf8'),entry=fs.readFileSync(html,'utf8');
function once(text,from,to){assert.equal(text.split(from).length-1,1,'expected one exact anchor: '+from.slice(0,100));return text.replace(from,to);}
source=once(source,'  (c.save(), c.translate(p, m));','  (c.save(), window.__HAPIL_ADAPTIVE_RC125__?.applyWorld(c, e, t), c.translate(p, m));');
source+='\n/* RC125: rendering and inverse pointer projection only; native simulation is unchanged. */\nwindow.__HAPIL_ADAPTIVE_RC125__?.install();\n';
entry=once(entry,'    <script type="module" crossorigin src="./assets/index-v31526.js?v=42401"></script>','    <script src="./assets/rc125/adaptive-battlefield.js?v=42501"></script>\n    <script type="module" crossorigin src="./assets/index-v31526.js?v=42501"></script>');
entry=once(entry,'</head>','<link rel="stylesheet" href="./assets/rc125/adaptive-battlefield.css?v=42501">\n</head>');
fs.writeFileSync(bundle,source);fs.writeFileSync(html,entry);
execFileSync(process.execPath,['--check',bundle],{stdio:'inherit'});
execFileSync(process.execPath,['--check','assets/rc125/adaptive-battlefield.js'],{stdio:'inherit'});
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').sort();
assert.deepEqual(changed,[bundle,html].sort());
console.log('RC125_INTEGRATION',JSON.stringify({changed,bundleBlob:hash(bundle),entryBlob:hash(html),approvedRendererBlob:hash('assets/rc77/connected-laser.js')}));
