'use strict';
// Unit/stub tests only. Native browser and natural progression are separate suites.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let wall=0,checks=0;const storage=new Map(),timers=[],window={console:{warn(){}},dispatchEvent(){},matchMedia:()=>({matches:false})};
const c={window,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},performance:{now:()=>wall*1000},setTimeout:fn=>timers.push(fn),Event:class{}};
vm.createContext(c);for(const f of ['assets/rc128/awakening-policy.js','assets/rc128/combat-feedback.js','assets/rc91/samong-awakening.js','assets/rc23/feedback.js','assets/combat-v31402/combat-core.js'])vm.runInContext(read(f),c,{filename:f});
const A=window.__HAPIL_SAMONG_RC91__,P=window.__HAPIL_AWAKENING_POLICY_RC128__,F=window.__HAPIL_FEEDBACK_RC128__,C=window.__HAPIL_COMBAT_CORE_V31401__;
const ok=(v,label)=>{checks++;assert(v,label);},eq=(a,b,label)=>{checks++;assert.equal(a,b,label);},close=(a,b)=>Math.abs(a-b)<1e-7;
const fresh=(hero='hwando',mode='DREAM')=>({zone:'first',time:10,x:4,y:4,activeHeroId:hero,gameModeV31346:mode,samongUnlockedRC91:true,hp:100,maxHp:100,enemies:[],fxSerial:1,effects:[],floatTexts:[]});
for(const hero of A.heroes)for(const mode of ['STORY','HELL','DREAM']){
 const s=fresh(hero,mode);s.hp=0;const result=A.chooseRevival(s,'samong');eq(result,mode==='DREAM',hero+' '+mode+' gating');
 if(mode!=='DREAM')continue;
 eq(s.hp,50,'native half-HP revival');eq(s.samongPassiveRC91.active,7,'seven seconds');eq(s.samongPassiveRC91.cooldown,77,'77-second cooldown');eq(s.samongPassiveRC91.activations,1,'one activation');
 s.hp=0;ok(!A.chooseRevival(s,'samong'),'re-entrant lethal hit cannot duplicate revival');s.hp=50;
 A.advance(s,3.5,true);eq(s.samongPassiveRC91.active,7,'pause preserves timers');
 A.advance(s,3.5,false);ok(close(s.samongPassiveRC91.active,3.5),'unscaled partial duration');
 const saved=JSON.parse(JSON.stringify(A.snapshot(s))),loaded=fresh(hero);A.restore(loaded,saved);
 ok(loaded.samongPassiveRC91.encounterRC128.used,'save retains spent charge');ok(close(loaded.samongPassiveRC91.active,3.5),'save retains active timer');
 for(let i=0;i<150;i++)A.advance(loaded,.5,false);loaded.hp=0;
 ok(!A.chooseRevival(loaded,'samong'),'cooldown expiry alone never refills the same encounter');eq(A.status(loaded).ready,false,'HUD does not advertise a spent charge');
 loaded.hp=50;loaded.zone='second';A.advance(loaded,.01,false);loaded.hp=0;ok(A.chooseRevival(loaded,'samong'),'new encounter can revive after cooldown');eq(loaded.samongPassiveRC91.activations,2,'cumulative counter preserved');
 const legacy={...saved};delete legacy.encounterRC128;const old=fresh(hero);A.restore(old,legacy);ok(old.samongPassiveRC91.encounterRC128.used,'legacy save does not grant a free charge');
}
{
 const s=fresh();s.hp=NaN;ok(!A.chooseRevival(s,'samong'),'NaN health is not a revival');s.hp=0;s.maxHp=0;ok(!A.chooseRevival(s,'samong'),'invalid max HP rejected');
 const guest=fresh();guest.hp=0;window.__HAPIL_PARTY_V31322__={state:guest,status:{role:'guest'}};ok(!A.chooseRevival(guest,'samong'),'guest cannot resurrect authoritative host');delete window.__HAPIL_PARTY_V31322__;
 const a=fresh();a.hp=0;A.chooseRevival(a,'samong');A.advance(a,2,false);const cd=a.samongPassiveRC91.cooldown;a.zone='next';A.advance(a,.1,false);
 eq(a.samongPassiveRC91.active,0,'map transition clears active window');eq(a.samongPassiveRC91.grace,0,'map transition clears grace');ok(close(a.samongPassiveRC91.cooldown,cd-.1),'map transition keeps cooldown');ok(a.awakeningUntil<=a.time,'owned EGO does not leak past a map transition');
 const b=fresh();b.hp=0;A.chooseRevival(b,'samong');b.awakeningUntil=100;A.advance(b,7,false);eq(b.awakeningUntil,100,'independent EGO extension is never removed');
 const h=fresh();h.hp=0;A.chooseRevival(h,'samong');h.activeHeroId='slayer';A.advance(h,.1,false);eq(h.samongPassiveRC91.active,0,'hero switch cannot transfer the active buff');ok(h.samongPassiveRC91.encounterRC128.used,'hero switch does not grant a fresh charge');
 const m=fresh();m.hp=0;A.chooseRevival(m,'samong');m.gameModeV31346='STORY';A.advance(m,.1,true);eq(m.samongPassiveRC91.active,0,'mode change clears DREAM buff even while paused');
 const raw=P.sanitize({version:1,zone:'a',encounter:-8,used:true,beforeUntil:NaN,ownedUntil:Infinity});eq(raw.encounter,0,'sanitized counter');eq(raw.ownedUntil,0,'nonfinite ownership rejected');
}
function row(i,extra={}){return{epoch:1,sequence:i,kind:'OUTGOING',result:'HIT',targetId:'enemy',attackerHeroId:'hwando',source:{family:'actor'},appliedDamage:10,hpBefore:100,hpAfter:90,criticalRequested:false,...extra};}
{
 const s=fresh('hwando','STORY'),enemy={id:'enemy',hp:100,maxHp:100,x:8,y:8,boss:true};
 const hp=s.hp,position=[s.x,s.y];ok(F.record(s,enemy,row(1),{}),'accepted damage produces feedback');const count=F.snapshot(s).effects;
 ok(!F.record(s,enemy,row(1),{}),'same journal row is not played twice');eq(F.snapshot(s).effects,count,'duplicate adds no VFX');
 ok(!F.record(s,enemy,row(2,{result:'REJECTED',appliedDamage:0}),{}),'rejected hit has no impact effect');
 eq(s.hp,hp,'feedback cannot change health');assert.deepEqual([s.x,s.y],position,'feedback cannot move hitboxes');checks++;
 const laser=fresh('hwando','STORY'),before=F.snapshot().totals.pauses;
 for(let i=1;i<=50;i++){wall+=.2;F.record(laser,enemy,row(i,{source:{family:'laser'},criticalRequested:true}),{});}
 eq(F.snapshot().totals.pauses,before,'laser ticks never generate repeated hit pauses');
 const rapid=fresh('hwando','STORY');for(let i=1;i<=100;i++){wall+=.001;F.record(rapid,enemy,row(i,{criticalRequested:true}),{});}
 ok(F.snapshot(rapid).effects<=32,'bounded effect pool');ok(F.snapshot(rapid).stopBudget<=.09,'maximum 90ms enemy-side pause budget per second');
 const guard=fresh('hwando','STORY');wall+=1;const pa=F.snapshot().totals.pauses;F.record(guard,guard,row(1,{kind:'CONTACT',targetId:'__host',result:'INVULNERABLE',appliedDamage:0}),{});eq(F.snapshot().totals.pauses,pa,'invulnerability is not a damage hitstop');
}
{
 const S=window.__HAPIL_FEEDBACK_RC22__,s=fresh('hwando','STORY'),played=[];c.document={hidden:false};
 ok(S.impact(s,{key:'heavy',priority:7,gain:.4}),'valid sound event queued');ok(!S.impact(s,{key:'not-a-pool',priority:7,gain:.4}),'unknown sound cannot play');
 S.tick(s,{sound:false,sfxVolume:1},(...a)=>played.push(a),true);eq(played.length,0,'mute respected');
 S.impact(s,{key:'heavy',priority:7,gain:.4});S.tick(s,{sound:true,sfxVolume:1},(...a)=>played.push(a),false);eq(played.length,0,'audio-unlock respected');
 wall+=1;S.impact(s,{key:'heavy',priority:7,gain:.4});S.tick(s,{sound:true,sfxVolume:1},(...a)=>played.push(a),true);eq(played.length,1,'uses the existing unlocked audio path');delete c.document;
}
{
 const original=window.__HAPIL_FEEDBACK_RC128__,s=fresh('hwando','STORY'),enemy={id:'enemy',hp:100,maxHp:100};s.enemies=[enemy];
 window.__HAPIL_FEEDBACK_RC128__={record(){throw Error('intentional unit-test presentation failure');}};
 C.enemy(s,enemy,10,{},()=>{enemy.hp-=10;C.mark(s,enemy,'HIT','unit',{appliedDamage:10});});
 eq(enemy.hp,90,'feedback exception cannot cancel committed damage');eq(C.metrics().feedbackFaults,1,'presentation failure is counted, not hidden');window.__HAPIL_FEEDBACK_RC128__=original;
}
{
 const styles=new Set(Object.values(F.heroes).map(h=>h.motif));eq(styles.size,8,'eight distinct owner motifs');eq(new Set(Object.values(F.heroes).map(h=>h.color)).size,8,'eight distinct primary colors');
 let depth=0;const noop=()=>{},ctx={save(){depth++;},restore(){depth--;},setTransform:noop,beginPath:noop,rect:noop,clip:noop,drawImage:noop,translate:noop,scale:noop,rotate:noop,moveTo:noop,lineTo:noop,stroke:noop,arc:noop,fillRect:noop,strokeRect:noop,strokeText:noop,fillText:noop,createRadialGradient(){return{addColorStop:noop};}};
 const canvas={width:1280,height:720,getBoundingClientRect:()=>({width:1180,height:664})},before=F.snapshot().totals.drawErrors;
 for(const hero of A.heroes){const s=fresh(hero);s.hp=0;A.chooseRevival(s,'samong');F.draw(ctx,s,canvas,{});eq(depth,0,'canvas state restored for '+hero);}
 eq(F.snapshot().totals.drawErrors,before,'all hero motifs draw without context errors');
}
const laser=fs.readFileSync(path.join(root,'assets/rc77/connected-laser.js'));
const gitHash=crypto.createHash('sha1').update(Buffer.from('blob '+laser.length+'\0')).update(laser).digest('hex');
eq(gitHash,'6bb4a891eb541734ef4c86f4d46dfb6ea94a44df','approved laser renderer unchanged');
console.log('RC128_UNIT_RESULT',JSON.stringify({checks,scope:'unit/stub tests; not native rendering or natural play',status:'passed',heroes:A.heroes.length,feedback:F.snapshot()}));
