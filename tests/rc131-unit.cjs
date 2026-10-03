'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let checks=0;
function ok(v,m){checks++;assert(v,m)}
function setup(codec=true){const window={document:{createElement:()=>({canPlayType:()=>codec?'probably':''})}};const ctx={window,Map,Set,WeakMap,URL};vm.createContext(ctx);for(const f of ['assets/rc130/audio-policy.js','assets/combat-audio/v1/catalog.js','assets/rc131/audio-cues.js'])vm.runInContext(read(f),ctx);return window;}
const w=setup(),s={zone:'dist00',time:10,activeHeroId:'hwando'},A=w.__HAPIL_AUDIO_CUES_RC131__,P=w.__HAPIL_AUDIO_RC130__;
ok(A.snapshot().codecSupported,'codec detected');ok(P.attack('hwando','A','old').endsWith('attack-wood.ogg'),'wood attack');ok(P.attack('slayer','Q','old').endsWith('attack-melee.ogg'),'melee attack');
for(const hero of ['hunter','gunner','seoha','neon','michaela','lauren'])ok(P.attack(hero,'A','old')==='old','weapon identity preserved '+hero);
for(const action of ['R','S','D'])ok(P.attack('hwando',action,'old')==='old','ultimate/dodge/guard preserved '+action);
ok(P.route(s,{channel:'guard',contactResult:'PARRY'},'old').endsWith('parry.ogg'),'actual parry');for(const result of ['SHIELD','INVULNERABLE','EVADE',undefined])ok(P.route(s,{channel:'guard',contactResult:result},'old')==='old','no false parry');
for(const hero of ['hwando','michaela',null,undefined])ok(P.route(s,{channel:'ally-hurt',heroId:hero},'old').endsWith('hurt-neutral.ogg'),'unconfirmed voice remains nonvocal');
w.__HAPIL_AUDIO_RC130_MANIFEST__={heroIdentity:{michaela:{reviewed:true,gender:'female'}},hurtByHero:{michaela:{reviewed:true,gender:'female',heroId:'michaela',path:'./audio/reviewed-female.wav'}}};
ok(P.route(s,{channel:'ally-hurt',heroId:'michaela'},'old')==='./audio/reviewed-female.wav','reviewed assignment preserved');ok(P.route(s,{channel:'ally-hurt',heroId:null},'old').endsWith('hurt-neutral.ogg'),'unknown party member never borrows host voice');
A.failed('https://example.org/hapil1/audio/rc131/attack-wood.ogg?v=43101');ok(P.attack('hwando','A','old')==='old','failed decoder/asset falls back');
const no=setup(false).__HAPIL_AUDIO_RC130__;ok(no.attack('hwando','A','legacy')==='legacy','unsupported codec uses native attack');ok(no.route(s,{channel:'ally-hurt'},'old')==='./audio/v31361/contact-kinetic.wav','unsupported codec uses native hurt');
const hits=[];for(let i=0;i<120;i++){s.time=10+i*.1;if(P.enemyHit(s))hits.push(s.time);}for(let i=1;i<hits.length;i++)ok(hits[i]-hits[i-1]>=1.1-1e-8,'enemy-hit rate bound');
// Actual bridge admission and stale-promise token invalidation.
const profiles=new Map(),pools=new Map();let allowed=true;
const window={document:{baseURI:'https://example.org/hapil1/'}};vm.runInNewContext(read('assets/combat-audio/v1/native-bridge.js'),{window,URL});
const controller={owns:p=>profiles.has(p),profile:p=>profiles.get(p),allowsEffects:()=>allowed};
const bridge=window.__HAPIL_COMBAT_AUDIO_BRIDGE_V1__.create({manager:{retired:new Set()},pools,controller,applyMusic(){},clearTransition(){},stopElement(){},selectAudible(){},playEffect(){}});
function add(file,priority,pending=false){profiles.set(file,{priority});const clip={paused:false,ended:false,__hapilCombatPending:pending,__mongseSfxRequest:1,currentTime:.1,pause(){this.paused=true}};pools.set(file,{clips:[clip],pending:pending?{clip,requestId:1}:null});return clip;}
const low=add('enemy',0,true),attack=add('attack',5);profiles.set('hurt',{priority:9});profiles.set('parry',{priority:8});
ok(bridge.activeUploadedVoices()===2,'pending reserves a voice');ok(!bridge.canStartEffect('attack'),'cannot preempt for occupied own cue');ok(!low.paused,'occupied cue causes no cancellation');ok(bridge.canStartEffect('hurt'),'hurt takes lower priority slot');ok(low.paused&&!low.__hapilCombatPending&&low.__mongseSfxRequest===2,'preempt invalidates pending token');ok(!attack.paused,'higher-priority existing clip preserved');
add('hurt',9);ok(bridge.canStartEffect('parry'),'parry may replace attack');ok(attack.paused,'attack preempted');ok(!pools.get('hurt').clips[0].paused,'hurt not preempted by parry');add('parry',8);ok(!bridge.canStartEffect('enemy'),'enemy cannot interrupt allies');allowed=false;ok(!bridge.canStartEffect('hurt'),'blocked combat refuses');bridge.stopEffects();ok(bridge.activeUploadedVoices()===0,'pause clears all owned media');
const manifest=JSON.parse(read('assets/rc131/manifest.json'));for(const row of manifest.newAudio){const b=fs.readFileSync(path.join(root,row.path));ok(crypto.createHash('sha256').update(b).digest('hex')===row.sha256,'audio hash '+row.role);ok(b.subarray(0,4).toString()==='OggS','actual Ogg file');}ok(fs.readFileSync(path.join(root,'audio/rc131/hurt-neutral.ogg')).equals(fs.readFileSync(path.join(root,'audio/rc131/attack-melee.ogg'))),'nonvocal alias exact');
console.log('RC131_UNIT_RESULT',JSON.stringify({status:'passed',checks,source:'three genuine uploaded recordings; no gender inference',scope:'unit/byte/bridge tests; no subjective speaker listening'}));
