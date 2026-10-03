'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),P=require('../assets/rc130/projectile-policy.js'),A=require('../assets/rc130/audio-policy.js');let checks=0;
const test=(x,message)=>{checks++;assert(x,message);};
for(const [width,height,bw,bh]of[[1180,664,1280,720],[390,700,1280,720],[844,360,1280,720],[180,160,1280,720]])for(const zoom of [.4,1,2,6])for(const angle of [0,.3,Math.PI/4,Math.PI/2]){
 const c=Math.cos(angle)*zoom,s=Math.sin(angle)*zoom,ctx={canvas:{width:bw,height:bh,getBoundingClientRect:()=>({width,height})},getTransform:()=>({a:c,b:s,c:-s,d:c})};
 for(const [iw,ih]of[[100,100],[800,180],[180,800]]){
  const fit=P.bitmapArgs(ctx,[{},-iw/2,-ih/2,iw,ih]),a=fit.args,k=a[3]/iw,mw=(Math.abs(c*a[3])+Math.abs(s*a[4]))*width/bw,mh=(Math.abs(s*a[3])+Math.abs(c*a[4]))*height/bh;
  test(Math.max(mw,mh)/Math.min(width,height)<=.200000001,'displayed rotated bound');test(Math.abs(a[3]/a[4]-iw/ih)<1e-8,'aspect ratio');test(Math.abs(a[1]+a[3]/2)<1e-8&&Math.abs(a[2]+a[4]/2)<1e-8,'center preserved');test(k<=1,'small artwork never inflated');
 }
}
const ctx={canvas:{width:100,height:100},getTransform:()=>({a:1,b:0,c:0,d:1}),drawImage(){return 42;}};
const saved=ctx.drawImage,shot={kind:'projectile',sourceId:'mob',vx:2,vy:0};test(P.projectile(ctx,shot,()=>ctx.drawImage({},-100,-50,200,100))===42,'renderer return');test(ctx.drawImage===saved,'method restored');
try{P.projectile(ctx,shot,()=>{throw Error('expected');});}catch(e){test(e.message==='expected','render exception retained');}test(ctx.drawImage===saved,'method restored after exception');
for(const e of [{kind:'projectile',sourceId:'mob',heroSkillVfx:true},{kind:'projectile',sourceId:'boss',laserTypeV31331:'branch-y'},{bossImpactTransitV31232:true,spectacleModeV31317:'beam'},{kind:'projectile',blackHole:true},{kind:'enemyAttack'}])test(!P.barrage(e),'scope excludes allies, hazards and melee');
const melee={id:'melee-fixture',ownershipSourceIdV31322:'mob',kind:'enemyAttack',rc130StationaryMelee:true,x:2,y:3,tx:5,ty:4,born:10,duration:.42,spriteHeading:null},project=(x,y)=>({x:x*27-y*27,y:(x+y)*13.5});
const poses=[10,10.1,10.25,10.4].map(t=>P.meleePose(melee,t,project));test(poses.every(p=>p.x===poses[0].x&&p.y===poses[0].y),'melee stays at exact impact point');test(poses.at(-1).alpha<poses[0].alpha,'fade out');test(P.meleePose(melee,10.43,project)===null,'finite melee lifetime');
const world={zone:'dist00',time:10.45,effects:[melee,{kind:'enemyProjectile',born:10,duration:4}],hp:111};P.prepare(world);test(world.effects.length===1&&world.effects[0].kind==='enemyProjectile','only expired melee removed');test(world.hp===111,'presentation never deals damage');
const bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8'),start=bundle.indexOf('function canTransfer(s,e){'),end=bundle.indexOf('\n  function bitmapReady',start);
test(start>0&&end>start,'real exit policy located');const can=vm.runInNewContext(bundle.slice(start,end)+'\ncanTransfer',{window:{__HAPIL_PRESENTATION_RC130__:P},own:()=>false,sourceActor:()=>({hp:100})});test(!can(world,melee),'real native exit rejects melee');test(can(world,shot),'real native exit retains ranged shots');
test(bundle.includes('rc130StationaryMelee: !s'),'actual melee spawn tagged');test(bundle.includes('RC130_FINAL_PRESENTATION_HOOK'),'outer effect hook present');test(bundle.includes('__HAPIL_PRESENTATION_RC130__.projectile(ctx,p,paint)'),'outer projectile hook present');
const audioWorld={zone:'a',time:0,activeHeroId:'hero-fixture'};let admitted=0;for(let i=0;i<200;i++){audioWorld.time=i*.025;if(A.enemyHit(audioWorld))admitted++;}test(admitted>=3&&admitted<=5,'enemy hit audio is occasional and time-bounded');
test(A.route(audioWorld,{channel:'ally-hurt',heroId:null},'unverified.wav')===A.neutral.hurt,'unknown ally gets no guessed voice');
globalThis.__HAPIL_AUDIO_RC130_MANIFEST__={heroIdentity:{'hero-fixture':{reviewed:true,gender:'female'}},hurtByHero:{'hero-fixture':{reviewed:true,heroId:'hero-fixture',gender:'male',path:'./audio/fixture.wav'}}};
test(A.route(audioWorld,{channel:'ally-hurt',heroId:'hero-fixture'},'unverified.wav')===A.neutral.hurt,'wrong gender rejected');
globalThis.__HAPIL_AUDIO_RC130_MANIFEST__.hurtByHero['hero-fixture'].gender='female';test(A.route(audioWorld,{channel:'ally-hurt',heroId:'hero-fixture'},'unverified.wav')==='./audio/fixture.wav','explicit reviewed identity mapping supported');delete globalThis.__HAPIL_AUDIO_RC130_MANIFEST__;
for(const p of Object.values(A.neutral))test(fs.existsSync(path.join(root,p)),'neutral asset exists: '+p);
let marks=0,clock=1000;const played=[],w={__HAPIL_AUDIO_RC130__:A,__HAPIL_CONTACT_RC23__:{mark(){marks++;}},__HAPIL_ENEMY_FEEL_V31361__:{key:'feedback'}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/rc23/feedback.js'),'utf8'),{window:w,document:{hidden:false},performance:{now:()=>clock},Map,Set,WeakMap,Math,Number,Object});
const s={zone:'unit',time:10,hp:200,maxHp:240,activeHeroId:'hwando',enemies:[],feedback:[],bossLaserCastsV31330:[]};
for(let i=0;i<100;i++)w.__HAPIL_FEEDBACK_RC22__.hit(s,{id:'mob'},2,{heroId:'hwando'});test(marks===100,'all contact marks retained despite audio sampling');
w.__HAPIL_FEEDBACK_RC22__.impact(s,{key:'heavy',channel:'enemy-hit',priority:4,gain:.4});w.__HAPIL_FEEDBACK_RC22__.impact(s,{key:'hurt',channel:'ally-hurt',heroId:'hwando',priority:9,gain:.44});
w.__HAPIL_FEEDBACK_RC22__.tick(s,{sound:true,sfxVolume:1},(...args)=>played.push(args),true);test(played.length===1&&played[0][0]===A.neutral.hurt,'allied hurt wins over enemy-hit queue');
clock+=1000;s.time++;w.__HAPIL_FEEDBACK_RC22__.impact(s,{key:'hurt',channel:'ally-hurt',heroId:'hwando',gain:.4});w.__HAPIL_FEEDBACK_RC22__.tick(s,{sound:false,sfxVolume:1},(...args)=>played.push(args),true);test(played.length===1,'mute preserved');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');test(html.indexOf('rc130/projectile-policy.js')<html.indexOf('index-v31526.js'),'policy loaded before bundle');test(html.includes('story-narration/v1/mixer.js?v=2026100302'),'narration mixer version preserved');
const report={status:'passed',checks,scope:'unit/stub tests; not natural play',policy:P.snapshot(),audio:A.snapshot()};console.log('RC130_UNIT_RESULT',JSON.stringify(report));
if(process.env.HAPIL_QA_OUTPUT){fs.mkdirSync(process.env.HAPIL_QA_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.HAPIL_QA_OUTPUT,'rc130-unit.json'),JSON.stringify(report,null,2));}
