'use strict';
// Deterministic policy/native-constructor fixtures; no natural campaign claim.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let checks=0;
const ok=(v,m)=>{checks++;assert(v,m);},eq=(a,b,m)=>{checks++;assert.equal(a,b,m);},near=(a,b,m)=>ok(Math.abs(a-b)<1e-7,m);
const window={},context=vm.createContext({window,console,Set,Map,Math,Date,Object,Array,Number,String,JSON,Event,setTimeout:()=>0,clearTimeout:()=>{}});
for(const p of ['assets/rc128/awakening-policy.js','assets/rc133/samong-policy.js','assets/rc91/samong-awakening.js','assets/rc134/persona-duel.js','assets/rc133/inner-final.js'])vm.runInContext(read(p),context,{filename:p});
const P=window.__HAPIL_PERSONA_DUEL_RC134__,H=window.__HAPIL_INNER_FINAL_RC133__,A=window.__HAPIL_SAMONG_RC91__,shots=[];
window.__HAPIL_SAMONG_RC91__={...A,revivalAuthorized:()=>true};
window.__HAPIL_RC86_BRIDGE__={actor:(zone,id)=>({id,zone,hp:0,maxHp:1500,sprite:'body'}),cloneEnemy:a=>({...a}),point:()=>({x:23,y:10})};
window.__HAPIL_DEVELOPER_MAPS_RC133__={canInner:()=>true,has:()=>true};window.__HAPIL_CONTROLS_V31329__={binding:{passives:{current:{}}}};
H.bind({heroes:A.heroes.map(id=>({id,sprite:id})),locked:()=>false,bullet:(s,a,p)=>{const q={id:s.fxSerial++,sourceId:a.id,x:a.x,y:a.y,...p};s.hostileProjectiles.push(q);shots.push(q);return q;}});
const skills=Object.fromEntries(H.deck.map(k=>[k.key,'./assets/rc134/persona-skills/'+k.key+'.png?v=43402']));
const art={ready:true,map:'map',body:'body',awakening:'awake',skills:Object.values(skills),skillMap:skills};H.configure(art);
const fresh=(hero='gunner')=>({zone:'cult04',gameModeV31346:'DREAM',samongUnlockedRC91:true,hp:240,maxHp:240,time:10,x:10,y:25,activeHeroId:hero,enemies:[],hostileProjectiles:[],pendingHits:[],effects:[],floatTexts:[],fxSerial:1,completedZones:new Set(),spawnedWaves:new Set()});
const start=s=>{const a={id:'c104-boss',hp:0,maxHp:1500};s.enemies=[a];ok(H.start(s,a),'actual cult-death policy admission');return H.boss(s);};
let seed=0x134;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
for(const side of ['left','right']){
 ok(P.polygon(side,.8).length>=3,'nonempty safe floor '+side);
 for(let i=0;i<1000;i++){const q=P.point({x:random()*100-40,y:random()*100-40},side);ok(P.contains(q,side),'nearest floor projection '+side);ok(P.contains(P.mirror(q),side==='left'?'right':'left'),'reflection fits identical radius');}
}
for(const hero of A.heroes){
 const s=fresh(hero),a=start(s);ok(P.contains(s,'left')&&P.contains(a,'right'),hero+' spawn owns respective halves');near(a.x,38-s.x,hero+' inverted x');near(a.y,38-s.y,hero+' inverted y');
 for(const [x,y]of[[30,2],[-1,100],[16,16],[Infinity,NaN],[30,30],[2,2]]){
  s.x=x;ok(P.contains(s,'left'),hero+' single x setter cannot expose crossed actor');s.y=y;ok(P.contains(s,'left'),hero+' paired warp/knockback write remains legal');a.x=y;a.y=x;ok(P.contains(a,'right'),hero+' boss warp/write remains legal');
 }
 // A deliberate left-half destination then actual dt tracking. It is bounded
 // each step and approaches the exact swapped player point without oscillation.
 s.x=12;s.y=25;let distance=Math.hypot(a.x-(38-s.x),a.y-(38-s.y));
 for(let i=0;i<180;i++){const old={x:a.x,y:a.y};P.tick(s,.016);const next=Math.hypot(a.x-(38-s.x),a.y-(38-s.y));ok(next<=distance+1e-8,'tracking distance never increases');ok(Math.hypot(a.x-old.x,a.y-old.y)<=P.policy.maxSpeed*.016+1e-8,'bounded mirror movement');ok(P.contains(a,'right'),'mirror stays on floor');distance=next;}
 ok(distance<1e-5,'mirror reaches reflected player');near(a.x-a.y,-(s.x-s.y),'opposite projected horizontal offset');near(a.x+a.y,76-s.x-s.y,'opposite projected vertical offset');
 const saved=JSON.parse(JSON.stringify(H.snapshot(s))),r=fresh(hero);r.x=30;r.y=2;H.restore(r,saved);ok(P.contains(r,'left')&&P.contains(H.boss(r),'right'),'native clean/restore repairs positions');eq(H.boss(r).hp,a.hp,'restore cannot heal boss');
 const ra=H.boss(r);r.hp=0;ok(H.onPlayerLethal(r),'first lethal revival still admitted');ok(P.contains(r,'left')&&P.contains(ra,'right'),'revival preserves owned halves');eq(r.innerFinalRC133.awake,7,'seven-second first-lethal opposing awakening');eq(r.innerFinalRC133.clash.used,true,'one-use clash committed');r.hp=0;eq(H.onPlayerLethal(r),false,'second lethal cannot refill revival');
 s.gameModeV31346='STORY';P.enforce(s);ok(Object.hasOwn(Object.getOwnPropertyDescriptor(s,'x'),'value'),'mode exit restores ordinary position property');s.x=30;s.y=2;eq(s.x,30,'Story x unchanged');eq(s.y,2,'Story y unchanged');
}
{
 const s=fresh(),a=start(s),ally={x:30,y:2,hp:100};window.__HAPIL_PARTY_V31322__={state:s,actors:[ally],status:{}};P.enforce(s);ok(P.contains(ally,'left'),'player companion shares left half');
 for(const status of [{role:'guest'},{paused:true},{disconnected:true}]){window.__HAPIL_PARTY_V31322__.status=status;const x=a.x,y=a.y;s.x=11;s.y=26;P.tick(s,.1);eq(a.x,x,'party authority blocks mirror x');eq(a.y,y,'party authority blocks mirror y');}
 window.__HAPIL_PARTY_V31322__=null;s.paused=true;const old=JSON.stringify({x:a.x,y:a.y});P.tick(s,.1);eq(JSON.stringify({x:a.x,y:a.y}),old,'paused mirror does not advance');s.paused=false;s.timeStopUntil=s.time+3;P.tick(s,.1);eq(JSON.stringify({x:a.x,y:a.y}),old,'time-stop mirror does not advance');
 s.innerFinalRC133.phase='complete';P.enforce(s);ok(Object.hasOwn(Object.getOwnPropertyDescriptor(ally,'x'),'value'),'completion releases companion guard');eq(P.camera(s),null,'completed mood does not retain duel camera');
}
for(const hero of A.heroes){const s=fresh(hero);ok(H.developerStart(s),'777 isolated developer entry '+hero);ok(P.contains(s,'left')&&P.contains(H.boss(s),'right'),'777 entry constrained '+hero);}
{
 const s=fresh(),a=start(s),m=s.innerFinalRC133;m.intro=0;m.awakeningCooldown=100;
 const signatures=new Set();for(let i=0;i<H.deck.length;i++){m.cycle=i;m.shotDelay=0;s.hostileProjectiles=[];H.tick(s,.016);const wave=s.hostileProjectiles;
  ok(wave.length>0,'new source skill actually emitted '+H.deck[i].key);ok(wave.every(q=>q.sprite===skills[H.deck[i].key]&&q.fallbackSprite===q.sprite&&q.impactFallbackSprite===q.sprite),'only new atlas paths '+H.deck[i].key);
  ok(wave.every(q=>q.vx-q.vy<0),'attack crosses toward player half '+H.deck[i].key);ok(wave.every(q=>q.frozenUntil-s.time>=.65&&q.collisionDisabledUntil31219>=q.frozenUntil),'normal windup collision-free');
  signatures.add(wave.map(q=>[q.vx.toFixed(3),q.vy.toFixed(3),(q.frozenUntil-s.time).toFixed(3)]).join('|'));
 }
 eq(signatures.size,9,'nine genuinely different travelling patterns');eq(s.pendingHits.length,0,'no teleporting area damage');
 m.awake=7;s.samongPassiveRC91={active:7,cooldown:77};m.shotDelay=0;m.cycle=0;s.hostileProjectiles=[];H.tick(s,.016);const delay=m.shotDelay;
 ok(delay<=.45&&s.hostileProjectiles.every(q=>q.rc134Mutual&&q.damage<=14&&q.frozenUntil-s.time>=.25),'fast bounded mutual volley retains windup');
 s.hostileProjectiles=Array.from({length:47},()=>({}));m.shotDelay=0;const n=shots.length;H.tick(s,.016);eq(shots.length,n,'rapid mutual queue never overflows 48');
 for(const view of[{width:334,height:720},{width:1280,height:720},{width:1558,height:720}]){const c=P.camera(s,view);near(c.x+640*c.scale,640,'screen centerline fixed');ok(c.scale*1200<=view.width-24+1e-8,'horizontal halves visible');}
}
{const s=fresh(),a=start(s),m=s.innerFinalRC133;m.awake=7;s.samongPassiveRC91={active:7,cooldown:77};Object.assign(m,{tempoSeed:0,tempoClock:0,tempoActive:false,tempoMutualStart:0});const initial={...m},sequence=()=>Array.from({length:400},()=>P.tempo(s,.016)),seed=sequence();Object.assign(m,initial);eq(JSON.stringify(seed),JSON.stringify(sequence()),'seeded tempo repeats');ok(new Set(seed).size>=5,'bounded burst stop slow reburst');ok(seed.every(v=>v>=0&&v<=.1)&&seed.some(v=>v===0),'bounded brief stops');ok(seed.some((v,i)=>v===0&&seed[i+1]>0),'unscaled clock recovers from stop');eq(P.cooldownFactor(s),.5,'mutual attacks halve once');s.samongPassiveRC91.active=0;eq(P.cooldownFactor(s),1,'no cooldown reduction outside mutual');s.samongPassiveRC91.active=7;m.tempoClock=m.tempoMutualStart+2.8;P.tick(s,.016);ok(P.swapped(s),'brief mutual ownership swap');ok(P.contains(s,'right')&&P.contains(a,'left'),'swapped owned halves');for(let i=0;i<180;i++)P.tick(s,.016);near(a.x+s.x,38,'swap point symmetry x');near(a.y+s.y,38,'swap point symmetry y');m.tempoClock=m.tempoMutualStart+3.8;P.tick(s,.016);ok(!P.swapped(s)&&P.contains(s,'left')&&P.contains(a,'right'),'atomic return to usual halves');eq(P.cooldownFactor(s),.5,'swap does not compound cooldown');}
{const s=fresh(),a=start(s),m=s.innerFinalRC133;window.__HAPIL_SAMONG_RC91__={...A,revivalAuthorized:()=>false};s.hp=0;eq(H.onPlayerLethal(s),false,'player lethal waits for explicit choice');eq(s.hp,0,'no player resurrection before choice');a.hp=0;ok(H.beforeDeath(s,a),'simultaneous boss lethal revives boss independently');ok(a.hp>0&&m.awake===7&&m.bossRevived,'boss has its own one-use awakening');eq(s.hp,0,'boss resurrection does not restore pending player');eq(m.playerRevived,undefined,'boss ledger cannot spend player ledger');window.__HAPIL_SAMONG_RC91__={...A,revivalAuthorized:()=>true};ok(H.onPlayerLethal(s),'authorized later player choice admits own revival');eq(m.playerRevived,true,'player independent one-use token committed');s.hp=0;eq(H.onPlayerLethal(s),false,'player token cannot repeat');}
console.log('RC134_PERSONA_POLICY',JSON.stringify({status:'passed',checks,scope:'deterministic source-only attack and owned-floor/actor mutation policy, native constructor fixtures; not natural progression'}));
