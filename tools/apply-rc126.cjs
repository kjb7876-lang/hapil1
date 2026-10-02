'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const hash=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
const files={bundle:'assets/index-v31526.js',html:'index.html',flow:'assets/rc95/combat-flow.js',geometry:'assets/combat-v31402/contact-geometry.js'};
const expected={bundle:'1ec55166ecd43bcdc510f0b6d3ec1cca131ff098',html:'7a28159ad9575f9d90731021f7ec91994cee9f0c',flow:'880cbd927acfb16070e67c7c1ed43feae326cc8c',geometry:'6c1c3866695816d9a6828c1f44d8d562be5ae95f'};
const src={};for(const [k,p] of Object.entries(files)){assert.equal(hash(p),expected[k],'changed baseline: '+p);src[k]=fs.readFileSync(p,'utf8');}
function once(k,a,b){
 let target=a;
 if(!src[k].includes(a)){
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp(a.trim().split('\n').map(l=>escape(l.trim())).join('[ \\t]*\\r?\\n[ \\t]*'),'g'),matches=[...src[k].matchAll(re)];
  assert.equal(matches.length,1,'unique whitespace-independent anchor '+k+': '+a.slice(0,100));target=matches[0][0];b=b.trim();
 }
 assert.equal(src[k].split(target).length-1,1,'unique anchor missing '+k+': '+a.slice(0,100));src[k]=src[k].replace(target,b);
}
once('bundle','let s = new Set();\nfor (let e of o.hostileProjectiles) {','window.__HAPIL_COMBAT_READABILITY_RC126__?.prepare(o);\n               let s = new Set();\n               for (let e of o.hostileProjectiles) {');
once('bundle','if (e.projectileRemovalReason31215 || e.parriedV31356 || e.cancelled) { s.add(e); continue; }','if (e.projectileRemovalReason31215 || e.parriedV31356 || e.cancelled) { s.add(e); continue; }\n                if (window.__HAPIL_COMBAT_READABILITY_RC126__?.waiting(e,o.time)) continue;');
once('bundle',"if(row&&moving&&flight){const sprite=flight.assetFor(s,e);if(sprite){e.sprite=sprite;e.fallbackSprite=sprite;if(e.bossImpactTransitV31232)e.bloodiedFlightRC43=sprite;}}\nreturn e;}","if(row&&moving&&flight){const sprite=flight.assetFor(s,e);if(sprite){e.sprite=sprite;e.fallbackSprite=sprite;if(e.bossImpactTransitV31232)e.bloodiedFlightRC43=sprite;}}\nwindow.__HAPIL_COMBAT_READABILITY_RC126__?.enforce(e);return e;}");
once('bundle',"function mapAsset(row,p,purpose='projectile'){p=clean(p);if(!row)return p;","function mapAsset(row,p,purpose='projectile'){p=clean(p);if(p===clean(window.__HAPIL_COMBAT_READABILITY_RC126__?.JELLY))return p;if(!row)return p;");
once('bundle',"window.__HAPIL_BLOODIED_FLIGHT_RC43__?.prepareTransit(s,h,effect);return effect;","window.__HAPIL_BLOODIED_FLIGHT_RC43__?.prepareTransit(s,h,effect);window.__HAPIL_COMBAT_READABILITY_RC126__?.assign(s,effect);return effect;");
once('bundle',"window.__HAPIL_MATERIAL_V31362__?.decorate(fx,e,row);s.effects.push(fx);metrics.terminal++;}","window.__HAPIL_MATERIAL_V31362__?.decorate(fx,e,row);if(window.__HAPIL_COMBAT_READABILITY_RC126__?.allowCosmetic(s,fx)!==false){s.effects.push(fx);metrics.terminal++;}}");
once('bundle','MONGSE_tickThemedBossSummons(o);','(()=>{const prior=[...(o.enemies??[])],result=MONGSE_tickThemedBossSummons(o);window.__HAPIL_COMBAT_READABILITY_RC126__?.separateNew(o,prior);return result;})();');
src.bundle+='\n/* RC126: simulation-owned readability and matching finite damage/render endpoints. */\nwindow.__HAPIL_COMBAT_READABILITY_RC126__?.install({project:G,place:(s,p)=>dt(s.zone,p,.42)});\n';
once('flow','  run(s,()=>{for(let i=0;i<(authored?.length??shots);i++){','  const rc126Before=(s.hostileProjectiles??[]).length;\n  run(s,()=>{for(let i=0;i<(authored?.length??shots);i++){');
once('flow','  const planned=authored?.length??shots;','  window.__HAPIL_COMBAT_READABILITY_RC126__?.volley(s,a,(s.hostileProjectiles??[]).slice(rc126Before));\n  const planned=authored?.length??shots;');
once('geometry',"cfg.bodyRadius+r,cfg.heartRadius+r),kind:'projectile'};}","cfg.bodyRadius+r,cfg.heartRadius+r),kind:'projectile',bodyRadius:cfg.bodyRadius+r};}");
once('geometry','function graze(s,q){const e=projectile(s,s,q),r=cfg.bodyRadius+Math.max(0,N(q.radius,.2))*27*Math.max(1,N(q.visualScaleV31224,1));return e.d>r&&e.d<=r+19.44;}','function graze(s,q){const e=projectile(s,s,q),r=e.bodyRadius;return !e.hit&&Number.isFinite(r)&&e.d>r&&e.d<=r+19.44;}');
once('html','    <script type="module" crossorigin src="./assets/index-v31526.js?v=42502"></script>','    <script src="./assets/rc126/combat-readability.js?v=42601"></script>\n    <script type="module" crossorigin src="./assets/index-v31526.js?v=42601"></script>');
once('html','./assets/rc95/combat-flow.js?v=39701','./assets/rc95/combat-flow.js?v=42601');
once('html','./assets/combat-v31402/contact-geometry.js?v=33501','./assets/combat-v31402/contact-geometry.js?v=42601');
for(const [k,p]of Object.entries(files))fs.writeFileSync(p,src[k]);
for(const p of [files.bundle,files.flow,files.geometry,'assets/rc126/combat-readability.js'])execFileSync(process.execPath,['--check',p],{stdio:'inherit'});
assert.equal(hash('assets/rc77/connected-laser.js'),'6bb4a891eb541734ef4c86f4d46dfb6ea94a44df');
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').sort();assert.deepEqual(changed,Object.values(files).sort());
console.log('RC126_APPLIED',JSON.stringify({changed,hashes:Object.fromEntries(Object.values(files).map(p=>[p,hash(p)]))}));
