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
{
window.__HAPIL_ADAPTIVE_RC125__={installed:true};window.__HAPIL_VIEWPORT_RC104__={camera:()=>({x:0,y:0,scale:1}),view:()=>({x:0,y:0,k:1})};assert(F.install());
const G=(x,y)=>({x:(x-y)*32,y:(x+y)*16}),angles=[],sizes=[],canvas={width:1280,height:720,getBoundingClientRect:()=>({width:1280,height:720})};let depth=0,rotation=0;const transforms=[];const ctx=new Proxy({save(){depth++;transforms.push(rotation);},restore(){depth--;rotation=transforms.pop();},rotate(a){angles.push(a);rotation+=a;},fillText(){assert.equal(rotation,0,'combat label remains upright');},drawImage(im,...args){sizes.push(args.slice(-2));},createRadialGradient(){return{addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(()=>{})});window.__HAPIL_MEDIA_ART_RC133__={effect:()=>({})};
for(const v of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){wall+=1;const s={zone:'cult04',time:100,hp:100,maxHp:100,activeHeroId:'hwando',x:0,y:0,persona:true},target={x:10,y:10};window.__HAPIL_VIEWPORT_RC104__.camera(s,{},G);F.record(s,target,{epoch:1,sequence:1,kind:'OUTGOING',result:'HIT',targetId:'boss',attackerHeroId:'hwando',appliedDamage:10,hpBefore:100,hpAfter:90,criticalRequested:true,source:{vx:v[0],vy:v[1]}},{});F.draw(ctx,s,canvas,{});const d=G(v[0],v[1]);assert(Math.abs(angles.at(-1)-Math.atan2(d.y,d.x))<1e-10);assert.deepEqual(sizes.at(-1),[30,30]);assert.equal(depth,0);checks+=3;}
assert.equal(F.snapshot().totals.drawErrors,0);checks++;
}
{
 const hit=state({persona:true,red:true});wall+=1;
 eq(F.playerFlash(hit),1,'no hit means no body flash');
 F.record(hit,hit,row(1,{kind:'CONTACT',targetId:'__host',attackerHeroId:undefined}),{});
 eq(F.playerFlash(hit),.58,'accepted positive damage gives one short body dip');
 wall+=.1;eq(F.playerFlash(hit),1,'body returns after 90ms');
 F.record(hit,hit,row(2,{kind:'CONTACT',targetId:'__host',result:'HIT'}),{});
 eq(F.playerFlash(hit),1,'rapid repeat damage cannot strobe the body');
 wall+=.4;F.record(hit,hit,row(3,{kind:'CONTACT',targetId:'__host',result:'EVADE',appliedDamage:0}),{});
 eq(F.playerFlash(hit),1,'evade never emits damage flash');
 wall+=.4;F.record(hit,hit,row(4,{kind:'CONTACT',targetId:'__host',result:'PARRY',appliedDamage:0}),{});
 eq(F.playerFlash(hit),1,'parry never emits damage flash');
}
console.log('RC161_PERSONA_FEEDBACK_UNIT',JSON.stringify({checks,status:'passed',scope:'unit presentation admission; no native/physical-device claim'}));
