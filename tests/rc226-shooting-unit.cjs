'use strict';
// Native delivery functions plus shipped RC225/226. Audio playback, controller
// binding and damage application are fixtures; this is not browser evidence.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const bundle=fs.readFileSync('assets/index-v31526.js','utf8');let clock=100;
const w={setInterval:()=>1,clearInterval(){},setTimeout(){},performance:{now:()=>clock*1000}};w.window=w;
const context=vm.createContext({window:w,performance:w.performance,Set,WeakMap,Map,Math,Number,Object,Array,JSON,F:['hwando','seoha','rian','ion','neon','michaela','lauren','hunter','slayer','gunner'].map(id=>({id})),G:(x,y)=>({x:640+(x-y)*27,y:(x+y)*13.5}),MONGSE_enemyTorsoOffset:()=>({x:0,y:-44}),W:(id,key)=>id+'/'+key+'.webp'});
const deliveryAt=bundle.indexOf('/* HAPIL v3.13.22 — queue-owned skill delivery.'),prefixAt=bundle.indexOf(" const VERSION='3.13.22'",deliveryAt),prefixEnd=bundle.indexOf(' const muzzles=new WeakMap()',prefixAt);
assert(prefixAt>0&&prefixEnd>prefixAt);const muzzleEnd=bundle.indexOf(' function sprite(',prefixEnd);assert(muzzleEnd>prefixEnd);vm.runInContext('(()=>{'+bundle.slice(prefixAt,muzzleEnd)+'window.__HAPIL_CONTINUITY_V31322__={partyRoute,prepareStrikes,plans,muzzle};})();',context);
const contactAt=bundle.indexOf(' function bindRoute(h,r){'),contactEnd=bundle.indexOf(' function branchGeometry(',contactAt);assert(contactAt>0&&contactEnd>contactAt);
vm.runInContext('(()=>{const Nn=(v,d=0)=>Number.isFinite(v)?v:d,stats={missedCommitted:0},MONGSE_enemyHitRadius=()=>.65;'+bundle.slice(contactAt,contactEnd)+'window.__HAPIL_COMBAT_V31333__={bindRoute,strikeValid};})();',context);
const sounds=[],C={binding:{state:{current:null},actions:{sound:(...args)=>sounds.push(args)},settings:{current:{sound:true,sfxVolume:1}}}},D={metrics:()=>({contacts:D.count}),count:0,tryParry(){D.count++;return true;},blockDamage(){D.count++;return true;},credit(){D.count++;return true;}};
C.effective=()=>C.binding.state.current?.combatModeV31329??'manual';w.__HAPIL_CONTROLS_V31329__=C;w.__HAPIL_DEFENSE_V31356__=D;
w.__HAPIL_LOOP_V31365__={decorateAttack(){},afterHit(){}};w.__HAPIL_FLOW_V31343__={profile:()=>null,waveAdvanceReady:()=>true};w.__HAPIL_ADDITIONAL_AUDIO_RC141__={routeHeroAttack:id=>'./audio/test-'+id+'.wav'};
for(const file of ['assets/rc225/shooter.js','assets/rc226/shooting-completion.js','assets/rc128/combat-feedback.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const adaptiveAt=bundle.indexOf('function MONGSE_EP1B_adaptivePower('),adaptiveEnd=bundle.indexOf('\nfunction ki(',adaptiveAt);assert(adaptiveAt>0&&adaptiveEnd>adaptiveAt);vm.runInContext(bundle.slice(adaptiveAt,adaptiveEnd),context);
const L=w.__HAPIL_LOOP_V31365__,H=w.__HAPIL_SHOOTER_RC226__,N=w.__HAPIL_CONTINUITY_V31322__;
assert(H.metrics().installed&&L.rc225Wrapped&&L.rc226Wrapped,'both wrappers remain installed without wrapping one another again');
function fresh(hero='gunner',ego=false){const s={zone:'dist01',time:10,hp:240,x:13,y:24,moveVx:0,moveVy:0,activeHeroId:hero,combatModeV31329:'manual',awakeningUntil:ego?17:0,resonance:42,fxSerial:10,floatTexts:[],pendingStrikes:[],effects:[],enemies:[{id:'primary',hp:1000,x:24,y:12},{id:'secondary',hp:1000,x:26.2,y:9.6},{id:'third',hp:1000,x:24,y:14},{id:'friend',hp:100,x:24.1,y:12,ally:true}]};s.targetEnemyId='primary';C.binding.state.current=s;return s;}
function fire(s){const row={id:s.fxSerial++,at:s.time+.34,targetId:'primary',power:100,heroId:s.activeHeroId,actionKey:'A',color:'#fff',critical:false},effect={id:s.fxSerial++,kind:'projectile',x:s.x,y:s.y,tx:24,ty:12,born:s.time,duration:.54,heroArrivalAtV31312:s.time+.34,heroProjectileTransient31213:true,heroId31213:s.activeHeroId,heroActionKey31213:'A',sprite:s.activeHeroId+'/a.webp',deliverySeedV31322:{heroId:s.activeHeroId,key:'A',x:s.x,y:s.y,tx:24,ty:12,born:s.time}};s.pendingStrikes.push(row);s.effects.push(effect);L.decorateAttack(s,new Set());return row;}
let profiles=0,routeChecks=0;
for(const [hero,profile]of Object.entries(H.weapons))for(const ego of [false,true]){
 const s=fresh(hero,ego),row=fire(s);assert.equal(row.rc225ShotStyle,w.__HAPIL_SHOOTER_RC225__.shotProfiles[hero]);
 if(['pierce','ricochet'].includes(profile.kind)){assert.equal(s.pendingStrikes.length,1,'pierce/bounce waits for a real accepted primary hit');s.time=row.at;L.afterHit(s,s.enemies[0],row.power,row.power,row);assert.equal(s.pendingStrikes.length,2);const count=s.pendingStrikes.length;L.afterHit(s,s.enemies[0],row.power,row.power,row);assert.equal(s.pendingStrikes.length,count,'an accepted strike cannot bounce repeatedly');}
 assert(Math.abs(s.pendingStrikes.reduce((v,r)=>v+r.power,0)-100)<1e-9,'splitting a volley preserves its planned raw power: '+hero);
 assert(s.pendingStrikes.length<=3);assert(!s.pendingStrikes.some(r=>r.targetId==='friend'),'friendly actors never become additional shooting targets');
 N.prepareStrikes(s);
 for(const strike of s.pendingStrikes){const effect=s.effects.find(e=>e.deliveryRoutesV31322?.some(r=>r.strikeId===strike.id));assert(effect,'every real strike has a native rendered route');assert.equal(effect.sprite,hero+'/a.webp','normal and EGO retain the same weapon art');assert.equal(effect.homing,profile.homing);
  const plan=N.plans(effect,strike.at).find(p=>p.route.strikeId===strike.id);assert(plan?.arrived);assert.equal(plan.u,1);assert.equal(plan.x,plan.end.x);assert.equal(plan.y,plan.end.y);routeChecks++;
  assert(strike.committedRouteV31333,'native delivery captures a committed damage route');assert(w.__HAPIL_COMBAT_V31333__.strikeValid(s,strike,s.enemies.find(t=>t.id===strike.targetId)));
  if(effect.rc226ContactOrigin){const p=effect.rc226ContactOrigin,m=N.muzzle(effect,{},s.time,plan.route),q=context.G(p.x,p.y);assert.equal(m.x,q.x+p.offsetX);assert.equal(m.y,q.y+p.offsetY,'pierce/bounce launch at the captured impact point, not a virtual hero muzzle');}
 }
 if(['orb','bolt','fan','burst'].includes(profile.kind)){
  const target=s.enemies[0],effect=s.effects.find(e=>e.deliveryRoutesV31322?.some(r=>r.strikeId===row.id)),r=effect.deliveryRoutesV31322.find(r=>r.strikeId===row.id),old=r.tx;s.time=10.05;target.x+=.75;N.prepareStrikes(s);assert.equal(r.tx,profile.homing?target.x:old,'native homing follows while ballistic shots keep the committed line');
  target.x+=3;assert.equal(w.__HAPIL_COMBAT_V31333__.strikeValid(s,row,target),profile.homing,'the actual native contact helper misses a moved ballistic target and retains homing contact');
 }
 profiles++;
}
{
 const s=fresh(),row=fire(s);assert.deepEqual(s.pendingStrikes.map(r=>+(r.at-row.at).toFixed(3)),[0,.065,.13]);assert.equal(sounds.at(-1)[1],.23);
 C.binding.settings.current.sound=false;const count=sounds.length;fire(fresh());assert.equal(sounds.length,count,'launch obeys sound settings');C.binding.settings.current.sound=true;
}
{
 const s=fresh('hwando'),row=fire(s);s.time=row.at;L.afterHit(s,s.enemies[0],row.power,0,row);assert.equal(s.pendingStrikes.length,1,'a rejected primary contact cannot cause ghost piercing damage');
}
{
 for(const hero of ['gunner','hwando']){const s=fresh(hero);s.effects=Array.from({length:64},()=>({kind:'fixture'}));const row=fire(s);assert.equal(s.pendingStrikes.length,1,'effect limit never adds more shots');assert.equal(row.power,100,'queue pressure keeps the original raw strike power');}
 for(const hero of ['hwando','rian'])for(const stale of ['dead','removed','queue-full','expired']){const s=fresh(hero);s.enemies=s.enemies.filter(t=>t.id!=='third');const row=fire(s);assert.equal(row.power,78);s.time=row.at;if(stale==='dead')s.enemies[1].hp=0;if(stale==='removed')s.enemies=s.enemies.filter(t=>t.id!=='secondary');if(stale==='queue-full')s.effects=Array.from({length:64},()=>({kind:'fixture'}));if(stale==='expired')s.time+=1.1;const raw=context.MONGSE_EP1B_adaptivePower(s,row,s.enemies[0]);assert.equal(raw,100,'native power read restores all reserved damage: '+hero+'/'+stale);assert.equal(context.MONGSE_EP1B_adaptivePower(s,row,s.enemies[0]),100,'restoring is exactly once');L.afterHit(s,s.enemies[0],raw,raw,row);assert.equal(s.pendingStrikes.length,1,'no stale follow-up');}

}
{
 const s=fresh();w.__HAPIL_DEFENSE_V31356__.blockDamage(s,{id:'ally'}, {},10);assert.equal(w.__HAPIL_SHOOTER_RC225__.snapshot(s).countershots,0,'an ally block cannot grant host countershots');
 w.__HAPIL_DEFENSE_V31356__.tryParry(s,{},s,true);const row=fire(s);assert.equal(row.rc225ResonanceShot,true);assert.equal(s.pendingStrikes.reduce((v,r)=>v+r.power,0),125);assert.equal(s.resonance,42);
}
{
 const s=fresh();const from={x:s.x,y:s.y};s.x-=1.5;s.y+=1.5;s.lastDodgeAt=s.time;assert(H.blink(s,from));const row=fire(s);assert(row.rc226BlinkShot);assert(Math.abs(s.pendingStrikes.reduce((v,r)=>v+r.power,0)-108)<1e-8);
 const wall=fresh();wall.lastDodgeAt=wall.time;assert.equal(H.blink(wall,{x:wall.x,y:wall.y}),false,'blocked S does not grant free focus');
 const full=fresh();full.combatModeV31329='full';full.lastDodgeAt=full.time;assert.equal(H.blink(full,{x:full.x+2,y:full.y}),false,'full-auto retains its separate dodge behavior');
 const switched=fresh();switched.lastDodgeAt=switched.time;H.blink(switched,{x:switched.x+2,y:switched.y});switched.zone='dist02';assert.equal(fire(switched).rc226BlinkShot,undefined,'blink bonus cannot survive a zone transition');
 assert(bundle.includes('window.__HAPIL_SHOOTER_RC226__?.blink(t,{x:c,y:l});'),'the real native S callback records its actual applied destination');
}
{
 const line=bundle.split('\n').find(l=>l.trim().startsWith("if(mode==='semi'){const available="));assert(line);const choose=new Function('s','mode','valid','J','L',line),s=fresh();s.targetEnemyId='secondary';choose(s,'semi',(s,e)=>e.hp>0,(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),()=>({role:()=>({range:30})}));assert.equal(s.targetEnemyId,'secondary','semi-auto retains the selected valid distant target');s.enemies[1].hp=0;choose(s,'semi',(s,e)=>e.hp>0,(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),()=>({role:()=>({range:30})}));assert.notEqual(s.targetEnemyId,'secondary','semi-auto reacquires when the selected target dies');
}
{
 const F=w.__HAPIL_FEEDBACK_RC128__,s=fresh(),target=s.enemies[0],row={epoch:1,sequence:1,kind:'OUTGOING',result:'HIT',targetId:target.id,attackerHeroId:s.activeHeroId,source:{family:'projectile'},appliedDamage:10,hpBefore:1000,hpAfter:990,criticalRequested:true};
 for(let i=0;i<30;i++){clock+=.04;F.record(s,target,{...row,sequence:i+1},{actionKey:'A'});}assert.equal(F.snapshot(s).stopBudget,0,'rapid critical basic fire never adds hitstop');assert.equal(F.classify(s,target,row,{actionKey:'A'}).power,.55);assert.equal(F.classify(s,target,row,{ultimate:true}).pause,.03,'heavy attacks retain their bounded hitstop');
}
console.log(JSON.stringify({status:'passed',scope:'CPU VM using native delivery and RC225/226; no browser/audio-device claim',profiles,routeChecks,metrics:H.metrics()}));
