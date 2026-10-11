'use strict';
// Committed damage presentation contract; unit canvas/audio spies, not native play.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let wall=1,played=0,checks=0;const window={__HAPIL_INNER_FINAL_RC133__:{encounter:s=>s.persona===true,red:s=>s.red===true},__HAPIL_MEDIA_AUDIO_RC133__:{feedback(){played++;return true;}},matchMedia:()=>({matches:false})};
vm.runInNewContext(fs.readFileSync('assets/rc128/combat-feedback.js','utf8'),{window,performance:{now:()=>wall*1000}});
const F=window.__HAPIL_FEEDBACK_RC128__,state=extra=>({zone:'cult04',time:100,hp:100,maxHp:100,activeHeroId:'hwando',x:0,y:0,...extra}),enemy={id:'inner-evil-rc133',x:8,y:7,hp:100,maxHp:100,boss:true};
const row=(sequence,extra)=>({epoch:1,sequence,kind:'OUTGOING',result:'HIT',targetId:enemy.id,attackerHeroId:'hwando',appliedDamage:10,hpBefore:100,hpAfter:90,criticalRequested:true,source:{family:'projectile',vx:1,vy:0},...extra});
function eq(a,b,label){assert.equal(a,b,label);checks++;}
const s=state({persona:true,red:true});for(let i=1;i<=40;i++){wall+=.03;eq(F.record(s,enemy,row(i),{}),true,'admitted critical remains acknowledged');}
eq(F.snapshot(s).effects,1,'one contact flash on repeated same-target critical');eq(F.snapshot(s).recent[0].color,'#e2e8ef','Hwando silver in Persona');eq(F.snapshot(s).stopBudget,0,'Persona outgoing does not interrupt battle clock');assert(played<=15,'bounded sound admission');checks++;
const count=played;wall+=.001;eq(F.record(s,s,row(41,{kind:'CONTACT',targetId:'__host',attackerHeroId:undefined}),{}),true,'incoming hit admitted independently');eq(played,count+1,'incoming hurt cannot be masked by outgoing sound throttle');eq(F.snapshot(s).stopBudget,0,'red hurt does not freeze mutual battle');
wall+=1;const ordinary=state();F.record(ordinary,enemy,row(1),{});eq(F.snapshot(ordinary).recent[0].color,'#ec5267','other combat color preserved');assert(F.snapshot(ordinary).stopBudget>0,'ordinary hit pause retained');checks++;
wall+=1;const miss=state({persona:true});eq(F.record(miss,enemy,row(1,{result:'MISS',appliedDamage:0}),{}),false,'miss has no contact presentation');eq(F.snapshot(miss).effects,0,'miss emits no flash');eq(F.record(s,enemy,row(40),{}),false,'duplicate transaction cannot emit feedback');eq(s.hp,100,'presentation never changes HP');eq(enemy.hp,100,'enemy HP owned by reducer');
console.log('RC161_PERSONA_FEEDBACK_UNIT',JSON.stringify({checks,status:'passed',scope:'unit presentation admission; no native/physical-device claim'}));
