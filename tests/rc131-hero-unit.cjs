'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/rc131/hero-images.js'),'utf8'),{window:root});
const A=root.__HAPIL_HERO_RECOVERY_RC131__,sectors=['e','se','s','sw','w','nw','n','ne'];let checks=0;
const check=(condition,message)=>{assert(condition,message);checks++;};
const good=()=>({complete:true,naturalWidth:512,naturalHeight:512}),pending={complete:false,naturalWidth:0,naturalHeight:0};
for(const id of A.ids){
 const paths=Object.fromEntries(sectors.map(s=>[s,`./assets/hero_direction334/${id}/${s}.webp`]));
 for(const s of sectors){check(A.owner(paths[s]+'?v=31332')===id,'hero identity');check(A.sectorOf(paths[s])===s,'direction identity');
  const cache={};for(const t of sectors)cache[paths[t]]=good();check(A.direction(cache,id,s,paths).sector===s,'prefer exact decoded direction');cache[paths[s]]=pending;
  const selected=A.direction(cache,id,s,paths);check(selected&&selected.hero===id&&selected.sector!==s,'pending direction uses own ready art');
  for(const t of sectors)cache[paths[t]]=pending;check(A.direction(cache,id,s,paths)===null,'all unavailable is not fabricated success');
 }
 const other=id==='hwando'?'slayer':'hwando',wrong=`./assets/hero_direction334/${other}/s.webp`;check(A.direction({[wrong]:good()},id,'s',{s:wrong})===null,'never borrow a different hero');
}
for(const p of ['./assets/vfx/hwando-impact.png','./assets/actors/rian.webp','./assets/hero_direction334/ion/s.webp',null,''])check(A.owner(p)===null,'unrelated/nonplayable scope unchanged');
check(!A.decoded({complete:true,naturalWidth:0,naturalHeight:512}),'broken width rejected');check(!A.decoded({complete:true,naturalWidth:512,naturalHeight:0}),'broken height rejected');
let draws=[],optionCalls=0;const primary='./assets/hero_direction334/neon/e.webp',fallback='./assets/hero_direction334/neon/ne.webp';
root.__HAPIL_DIRECTION_V31334__={assetsFor:id=>id==='neon'?[primary,fallback]:[]};
const draw=A.wrap({draw(...args){draws.push({receiver:this,args});return 'native';},queue:(cache,p)=>cache[p],hero:id=>({id}),options(_,hero,m,p){optionCalls++;return{scaleX:2,canonicalHeroRC5:{},authoredWalkV31345:{},uploadedHeroMotionRC4:{},forPath:p,heroId:hero.id,sector:m.characterSectorV31342};}});
const cache={[primary]:good(),[fallback]:good()},ctx={},opts={alpha:.4,hit:true},receiver={};
check(draw.call(receiver,ctx,cache,primary,5,6,90,opts)==='native','normal native result');check(draws.length===1&&draws[0].args[2]===primary&&draws[0].args[6]===opts&&draws[0].receiver===receiver&&optionCalls===0,'normal parameters and receiver exact');
cache[primary]=pending;draws=[];draw(ctx,cache,primary,5,6,90,opts);const r=draws[0].args[6];check(draws.length===1&&draws[0].args[2]===fallback,'single same-hero fallback draw');check(r.alpha===.4&&r.hit===true&&r.forPath===fallback&&r.sector==='ne','replacement metadata belongs to actual direction');check(!r.canonicalHeroRC5&&!r.authoredWalkV31345&&!r.uploadedHeroMotionRC4,'no stale atlas crop');check(cache[primary]===pending&&opts.alpha===.4&&Object.keys(opts).length===2,'loader cache and caller options untouched');
cache[fallback]=pending;draws=[];draw(ctx,cache,primary,5,6,90,opts);check(draws.length===0,'no cross-hero legacy fallback when all own art is absent');
cache[primary]=good();draws=[];draw(ctx,cache,primary,5,6,90,opts);check(draws.length===1&&draws[0].args[2]===primary&&draws[0].args[6]===opts,'original pose restored immediately');
const enemy='./assets/actors/monster.png';draws=[];draw(ctx,cache,enemy,5,6,90,opts);check(draws[0].args[2]===enemy,'enemy route untouched');
console.log('RC131_UNIT_RESULT',JSON.stringify({status:'passed',checks,scope:'unit/mocks; not native rendering',snapshot:A.snapshot()}));
