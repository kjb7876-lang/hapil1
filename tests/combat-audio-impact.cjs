'use strict';
// Exercise the actual native telegraph admission and impact functions.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),test=require('node:test');
const source=fs.readFileSync(path.resolve(__dirname,'../assets/index-v31526.js'),'utf8');
const section=(first,last)=>{const a=source.indexOf(first),b=source.indexOf(last,a);assert(a>=0&&b>a);return source.slice(a,b)};
const code=section('function MONGSE_bossBarrageTheme(e)','function MONGSE_bossBarragePalette(e)')+
 section('function MONGSE_impactClearGap(e)','function Di(e, t)')+
 section('function MONGSE_queueReadyTelegraphs(e, t)','function Oi(e, t)');
function run({absorption=false,evaded=false,suppressed=false,cancelled=false,dead=false,line=false,unrelatedDrain=false}={}){
 const emissions=[],actor={id:absorption?'u203-boss':'dist06-boss',patternSet:absorption?'final-u2':'final-dist',boss:true,hp:dead?0:100,x:5,y:5};
 const state={time:1,fxSerial:1,zone:absorption?'u203':'dist06',hp:100,effects:[],impactQueue:[],enemies:[actor]};
 const context={window:{__HAPIL_COMBAT_AUDIO_V1__:{emit:(...args)=>emissions.push(args)}},Jt:()=>'',MONGSE_bossBarragePalette:()=>({theme:'infernal-signature'}),MONGSE_BOSS_CAST_VFX:{demonSkull:''},Oi:()=>evaded};
 vm.createContext(context);vm.runInContext(code,context);
 const hit={id:1,sourceId:actor.id,boss:true,patternSet:actor.patternSet,shape:line?'line':'circle',x:5,y:5,originX:2,originY:2,radius:3,width:1,label:absorption?(unrelatedDrain?'ordinary drain':'공허 기억흡입'):'발록 지옥 충격',damage:20,status:unrelatedDrain?'drain':'none',cancelled};
 context.MONGSE_queueReadyTelegraphs(state,[hit]);const admitted=state.impactQueue[0];if(suppressed)admitted.damageSuppressedV31226=true;
 context.MONGSE_spawnTelegraphedImpact(state,admitted);return{state,actor,emissions,admitted};
}
test('a real infernal signature owner receives one dark accent after radial impact admission',()=>{
 const r=run();assert.equal(r.state.effects.length,1);assert.deepEqual(r.emissions.map(x=>x[0]),['dark']);assert.equal(r.emissions[0][2],r.actor);assert.equal(r.emissions[0][3],1);
});
test('an exact native absorption attack receives its effect without broad drain matching',()=>{
 assert.deepEqual(run({absorption:true}).emissions.map(x=>x[0]),['blackHole']);assert.equal(run({absorption:true,unrelatedDrain:true}).emissions.length,0);
});
test('native perfect-evade suppression silences both uploaded impact accents',()=>{
 for(const absorption of [false,true]){const r=run({absorption,evaded:true});assert.equal(r.admitted.damageSuppressedV31226,true);assert.equal(r.state.effects.length,1,'native visual behavior is unchanged');assert.equal(r.emissions.length,0);}
});
test('phase-cancelled, explicit-cancelled and dead-owner impacts cannot play uploaded accents',()=>{
 for(const flags of [{suppressed:true},{cancelled:true},{dead:true}])for(const absorption of [false,true])assert.equal(run({...flags,absorption}).emissions.length,0);
});
test('infernal line attacks do not borrow the rare heavy radial accent',()=>assert.equal(run({line:true}).emissions.length,0));
