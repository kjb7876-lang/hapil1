'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../assets/rc126/combat-readability.js');let checks=0;const ok=(value,label)=>{assert(value,label);checks++;};
const state=(zone='dist03')=>({zone,time:20,x:27,y:27,enemies:[],effects:[],hostileProjectiles:[]});
const shot=(id=1)=>({id,sourceId:'actor',x:10,y:10,previousX:10,previousY:10,originX:10,originY:10,vx:5,vy:1,radius:.28,born:20,expiresAt:27,sprite:'./assets/generated-v31342-rc39/axe_projectile_bloodied.webp',damage:17});
let s=state(),q=shot(),p=shot(2);R.assign(s,q);R.assign(s,p);ok(q.sprite!==R.JELLY&&p.sprite===R.JELLY,'one physical special instance; remaining bullet not removed');ok(q.damage===17&&p.damage===17,'damage preserved');
const count=s.rc126AssetLedger.used.length;for(let i=0;i<100;i++){q.sprite='wrong';R.enforce(q);R.assign(s,q);}ok(s.rc126AssetLedger.used.length===count&&q.sprite===q.rc126Sprite,'draw-independent idempotent assignment');
R.assign(s,{...shot(3),sprite:q.rc126Sprite+'?v=999'});ok(s.rc126AssetLedger.used.length===1,'query strings do not evade ledger');
const saved=R.snapshot(s),resumed=state();ok(R.restore(resumed,saved),'bounded ledger restore helper');let again=shot(7);R.assign(resumed,again);ok(again.sprite===R.JELLY,'restored used bitmap not reallocated');
s.zone='dist04';const next=shot(4);R.assign(s,next);ok(next.sprite!==R.JELLY&&s.rc126AssetLedger.zone==='dist04','map change resets per-visit ledger');
for(let i=0;i<400;i++)R.assign(s,{...shot(20+i),sprite:'./assets/test/a'+i+'.webp'});ok(s.rc126AssetLedger.used.length===256,'ledger bounded');
const poison=R.sanitize({version:1,zone:s.zone,used:['__proto__','assets/../../bad.png','assets/a.webp','assets/a.webp']},s.zone);ok(poison.used.length===1,'restore filters malformed paths');
for(const property of['reflected','friendly','danmakuV31316','cosmicShotV31318']){const excluded={...shot(),[property]:true};R.assign(s,excluded);ok(!excluded.rc126AssetFinal,'authored/owned path preserved '+property);}
let maxDelay=0;for(const family of['rage','envy','obsession','greed','order','petal']){
 s=state();const a={id:'test-boss',x:10,y:10},rows=Array.from({length:7},(_,i)=>({...shot(i+1),rc95Bullet:true,rc97Grammar:family,vx:Math.cos(i*.17)*5,vy:Math.sin(i*.17)*5})),speeds=rows.map(q=>Math.hypot(q.vx,q.vy));R.volley(s,a,rows);
 ok(rows.length===7&&rows.every(q=>q.damage===17),'volley count/damage preserved '+family);ok(new Set(rows.map(q=>q.rc126ReleaseAt)).size===7,'staggered launch '+family);
 ok(rows.every((q,i)=>Math.abs(Math.hypot(q.vx,q.vy)-speeds[i])<1e-9),'base velocity speed preserved '+family);ok(rows.every(q=>q.homingMode31212==='none'),'authored aim not silently switched to delayed homing');
 for(const q of rows){ok(!R.waiting(q,q.rc126ReleaseAt),'release boundary enabled');if(q.rc126ReleaseAt>20)ok(R.waiting(q,q.rc126ReleaseAt-1e-5),'pre-release disabled');maxDelay=Math.max(maxDelay,q.rc126ReleaseAt-20);}
 ok(rows.some(q=>q.x!==10||q.y!==10),'adjacent launch positions separated');const before=JSON.stringify(rows);R.volley(s,a,rows);ok(JSON.stringify(rows)===before,'re-entrant volley has no double delay');
}
ok(maxDelay<.4,'maximum added launch delay less than .4 seconds');
let finiteCases=0;for(let degree=0;degree<360;degree+=5)for(const length of[.5,3,20]){
 const a=degree*Math.PI/180,h={originX:8,originY:9,x:8+Math.cos(a)*2,y:9+Math.sin(a)*2,width:.4,radius:length,shape:'line'},before=JSON.stringify(h),line=R.line(h),segments=R.native(h);
 ok(Math.abs(Math.hypot(line.x-h.originX,line.y-h.originY)-length)<1e-8,'finite radius is render length');ok(JSON.stringify(h)===before,'native hazard not mutated by geometry');ok(segments.length===2&&segments[0].b.x===segments[1].a.x&&segments[0].b.y===segments[1].a.y,'joined finite midpoint');finiteCases++;
}
for(const invalid of[null,{originX:0,originY:0,x:0,y:0,width:.5,radius:4},{originX:0,originY:0,x:2,y:0,width:.5,radius:NaN}])ok(R.line(invalid)===null,'invalid/degenerate finite geometry rejected');
s=state();s.effects=[0,1].map(id=>({id,themeTerminalV31323:true,x:2,y:2,born:20,damage:0}));ok(!R.allowCosmetic(s,{themeTerminalV31323:true,x:2,y:2}),'dense cosmetic terminals coalesced');ok(R.allowCosmetic(s,{themeTerminalV31323:true,x:2,y:2,damage:5}),'damaging effect never dropped by cosmetic gate');
// Run the real collision module with an explicit deterministic native projection.
const G=(x,y)=>({x:(x-y)*27,y:(x+y)*13.5}),window={__HAPIL_COMBAT_V31333__:{core:a=>G(a.x,a.y),frozen:()=>false,piercing:()=>false,seen:()=>false}};window.window=window;
vm.runInNewContext(fs.readFileSync(require.resolve('../assets/combat-v31402/contact-geometry.js'),'utf8'),{window,globalThis:window});
const C=window.__HAPIL_GEOMETRY_V31402__.create({project:G,heroes:()=>[{id:'hwando'}],combat:null});s={zone:'dist00',time:10,hp:240,x:0,y:0,activeHeroId:'hwando'};
const at=px=>({x:px/54,y:-px/54,previousX:px/54,previousY:-px/54,vx:1,vy:0,radius:.2,visualYV31333:0,sprite:'asset',boss:true,sourceId:'boss'});
q=at(39);ok(C.projectile(s,s,q).hit,'real enlarged bitmap contact');ok(!C.graze(s,q),'actual hit must not also be a graze');q=at(62);ok(!C.projectile(s,s,q).hit&&C.graze(s,q),'true near-miss retains graze');
q=at(200);ok(!C.graze(s,q),'distant shot not graze');q={...at(-150),previousX:150/54,previousY:-150/54};ok(C.projectile(s,s,q).hit,'fast swept crossing does not tunnel');
for(const degree of[0,30,90,140,225,315]){const a=degree*Math.PI/180,h={shape:'line',originX:0,originY:0,x:Math.cos(a)*2,y:Math.sin(a)*2,radius:10,width:.4},inside={...s,x:Math.cos(a)*8,y:Math.sin(a)*8},outside={...s,x:Math.cos(a)*11,y:Math.sin(a)*11};ok(C.area(s,inside,h).hit&&!C.area(s,outside,h).hit,'native area uses same finite radius '+degree);}
console.log('RC126_UNIT',JSON.stringify({checks,finiteCases,maxDelay,metrics:R.metrics()}));
