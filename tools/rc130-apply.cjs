'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const bundle='assets/index-v31526.js',geometry='assets/combat-v31402/contact-geometry.js',html='index.html',visual='assets/rc130/visual-policy.js';
const protectedFiles=['assets/rc77/connected-laser.js','assets/rc127/combat-policy.js','assets/rc127/dark-jelly.js','assets/rc129/danmaku-director.js','assets/rc129/danmaku-hud.js','assets/rc95/combat-flow.js','assets/combat-v31412/skill-completion.js','assets/rc128/combat-feedback.js','assets/rc23/feedback.js','assets/story-narration/v1/player.js','assets/story-narration/v1/surfaces.js','data/story-rc51.js'];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),before=Object.fromEntries(protectedFiles.map(f=>[f,hash(f)]));
const original=Object.fromEntries([bundle,geometry,html,visual].map(f=>[f,fs.readFileSync(f,'utf8')])),next={...original};
function replace(file,from,to){assert.equal(next[file].split(from).length-1,1,'Exact RC130 integration anchor: '+file+' '+from.slice(0,90));next[file]=next[file].replace(from,to);}
if(!next[bundle].includes('/* RC130_NATIVE_PRESENTATION:')){
 assert(next[bundle].includes('__HAPIL_POLICY_RC127__.speed'),'Native fixed-speed policy must exist before integration');
 replace(bundle,'e = MONGSE_mapMonsterSfxV31343(e);','e = MONGSE_mapMonsterSfxV31343(e);\n      if(window.__HAPIL_AUDIO_RC130__?.permitNative(e)===false)return;\n      t = (t??1)*(window.__HAPIL_AUDIO_RC130__?.nativeGain(e)??1);');
 next[bundle]+='\n'+fs.readFileSync('tools/rc130-native-hook.js','utf8');
 replace(geometry,'const r=Math.max(physical,visual);',"const policy=root.__HAPIL_VISUAL_RC130__,raw=Math.max(physical,visual);\n if(policy?.contactReady(s,q,raw)===false)return{hit:false,heart:false,t:Infinity,d:Infinity,kind:'awaiting-visible-barrage'};\n const r=policy?.contactRadius(s,q,raw)??raw;");
 replace(geometry,'r=cfg.bodyRadius+Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1));','r=cfg.bodyRadius+(root.__HAPIL_VISUAL_RC130__?.contactRadius(s,q,Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1)))??Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1)));');
 replace(html,'    <script type="module" crossorigin src="./assets/index-v31526.js?v=42701"></script>','    <script src="./assets/rc130/visual-policy.js?v=43001"></script>\n    <script src="./assets/rc130/audio-focus.js?v=43001"></script>\n    <script type="module" crossorigin src="./assets/index-v31526.js?v=43001"></script>');
 replace(html,'./assets/combat-v31402/contact-geometry.js?v=42602','./assets/combat-v31402/contact-geometry.js?v=43001');
}
if(!next[visual].includes('function contactReady(')){
 replace(visual,' function contactRadius(s,p,r){',' function contactReady(s,p,r){return!barrage(p)||layouts.has(p)||r<=48;}\n function contactRadius(s,p,r){');
 replace(visual,'drawProjectile,contactRadius,stationary','drawProjectile,contactReady,contactRadius,stationary');
}
assert(next[bundle].includes('permitNative(e)')&&next[geometry].includes('contactReady(s,q,raw)'));
assert(next[html].indexOf('assets/rc130/visual-policy.js')<next[html].indexOf('type="module" crossorigin'));
if(process.argv.includes('--check')){for(const f of Object.keys(next))assert.equal(next[f],original[f],'RC130 generated file not committed: '+f);}
else for(const [f,text]of Object.entries(next))if(text!==original[f])fs.writeFileSync(f,text);
for(const f of [bundle,geometry,visual,'assets/rc130/audio-focus.js'])cp.execFileSync(process.execPath,['--check',f]);
for(const [f,h]of Object.entries(before))assert.equal(hash(f),h,'Protected file changed: '+f);
console.log('RC130_INTEGRATION',JSON.stringify({changed:Object.keys(next).filter(f=>next[f]!==original[f]),protectedFiles:before,files:Object.fromEntries([bundle,geometry,html,visual,'assets/rc130/audio-focus.js'].map(f=>[f,hash(f)]))}));
