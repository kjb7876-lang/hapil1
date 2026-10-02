'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const file='assets/index-v31526.js';let src=fs.readFileSync(file,'utf8');
function replaceOne(pattern,replacement){const matches=[...src.matchAll(new RegExp(pattern.source,pattern.flags.includes('g')?pattern.flags:pattern.flags+'g'))];assert.equal(matches.length,1,'expected one exact source anchor: '+pattern);src=src.replace(pattern,replacement);}
if(!src.includes('RC122_AUTO_CAST_OWNERSHIP')){
 replaceOne(/MONGSE_manualMotion31223 =\s*o\.heroMotion\?\.until > o\.time &&\s*!o\.heroMotion\?\.autoEvade31223 &&\s*\[`skill`, `ultimate`, `hurt`, `dash`, `guard`\]\.includes\(\s*o\.heroMotion\?\.kind,\s*\)/,
  'MONGSE_manualMotion31223 =\n                window.__HAPIL_AUTOPLAY_POLICY_RC122__.manualMotion(o, !!Re.current) /* RC122_AUTO_CAST_OWNERSHIP */');
 replaceOne(/!!\(o\.target && o\.target\.autoProgressV31301 !== !0\)/,'window.__HAPIL_AUTOPLAY_POLICY_RC122__.manualTarget(o)');
 fs.writeFileSync(file,src);
}
let html=fs.readFileSync('index.html','utf8');
if(!html.includes('rc122/autoplay-policy.js')){
 const anchor='<script type="module" crossorigin src="./assets/index-v31526.js';assert(html.includes(anchor));
 html=html.replace(anchor,'<script src="./assets/rc122/autoplay-policy.js?v=42201"></script>\n    '+anchor);
}
html=html.replace(/(index-v31526\.js\?v=)\d+/,'$1'+'42201').replace(/(rc115\/map-advance\.js\?v=)\d+/,'$1'+'42201');fs.writeFileSync('index.html',html);
for(const p of [file,'assets/rc122/autoplay-policy.js','assets/rc115/map-advance.js','tests/rc115-map-advance-smoke.cjs'])cp.execFileSync(process.execPath,['--check',p],{stdio:'inherit'});
assert(src.includes('window.__HAPIL_MOVEMENT_V31336__?.movementLocked(o,o) ? 0 : 1'),'native hard movement lock must remain');
console.log('RC122 exact candidate applied: cast/input ownership and proximity-only map recovery.');
