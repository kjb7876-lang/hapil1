// RC122 supersedes the old distance-bypass contract, not the clear/pause guards.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let now=0,mode='full',ready=true,hidden=false,partyBlock=false,channelBlock=false,storyOpen=false,manualPriority=false,hasProfile=true,transitionOk=true;
let transitionCount=0,interactCount=0;const keys=new Set();
const normalPlan=()=>({action:'interact',reason:'combat-exit-portal',target:{x:25,y:7},radius:2.48});let plan=normalPlan();
const window={__HAPIL_CONTROLS_V31329__:{effective:()=>mode,binding:{input:{current:keys}}},__HAPIL_AUTOPROGRESS_V31301__:{plan:()=>plan},__HAPIL_FLOW_V31343__:{profile:()=>hasProfile?{}:null,ready:()=>({ready}),blocked:()=>false,transition:(s,interact,ui,offPortal)=>{assert.equal(ui,false);assert.equal(offPortal,false,'distance bypass must never be requested');transitionCount++;if(transitionOk)interact();return transitionOk;}},__HAPIL_PARTY_V31322__:{blocksNativeInput:()=>partyBlock},__HAPIL_CHANNEL_V31364__:{active:()=>channelBlock},__HAPIL_STORY_RC51__:{isOpen:()=>storyOpen},__HAPIL_MOVEMENT_V31336__:{active:()=>manualPriority}};
const sandbox={window,document:{get hidden(){return hidden}},performance:{now:()=>now},Object,WeakMap,Number,Math};vm.runInNewContext(fs.readFileSync('assets/rc115/map-advance.js','utf8'),sandbox);
const A=window.__HAPIL_AUTO_MAP_ADVANCE_RC115__,s={zone:'dist01',hp:200,time:100,x:24,y:7,path:[]},settings={combatMode:'full',autoCombat:true,autoPortal:true};
const interact=automatic=>{assert.equal(automatic,undefined,'use native proximity-checked interaction');interactCount++;};
function tick(ms=1000){now+=ms;return A.step(s,settings,false,interact);}
function denied(change,restore,name){change();assert.equal(A.step(s,settings,false,interact),false,name);restore();A.reset(s);assert.equal(A.step(s,settings,false,interact),false,name+' fresh delay');A.reset(s);}
assert.equal(A.step(s,settings,false,interact),false);for(let i=0;i<6;i++)assert.equal(tick(),false);assert.equal(tick(999),false);assert.equal(transitionCount,0);assert.equal(tick(1),true);assert.equal(transitionCount,1);assert.equal(interactCount,1);
const cases=[
 [()=>{ready=false},()=>{ready=true},'FLOW.ready'],
 [()=>{plan={action:'wait',reason:'hostiles-or-waves'}},()=>{plan=normalPlan()},'hostiles/waves planner'],
 [()=>{mode='manual'},()=>{mode='full'},'manual mode'],
 [()=>{mode='semi'},()=>{mode='full'},'semi mode'],
 [()=>{hidden=true},()=>{hidden=false},'hidden tab'],
 [()=>{partyBlock=true},()=>{partyBlock=false},'party block'],
 [()=>{channelBlock=true},()=>{channelBlock=false},'channel'],
 [()=>{storyOpen=true},()=>{storyOpen=false},'story'],
 [()=>{s.hp=0},()=>{s.hp=200},'death'],
 [()=>{s.paused=true},()=>{s.paused=false},'pause'],
 [()=>{s.practiceV31329=true},()=>{s.practiceV31329=false},'practice'],
 [()=>{s.target={x:10,y:10,autoProgressV31301:false}},()=>{delete s.target},'manual pointer'],
 [()=>{settings.autoPortal=false},()=>{settings.autoPortal=true},'autoPortal off'],
 [()=>{settings.autoCombat=false},()=>{settings.autoCombat=true},'autoCombat off'],
 [()=>{keys.add('ArrowLeft')},()=>{keys.clear()},'physical arrow'],
 [()=>{manualPriority=true},()=>{manualPriority=false},'recent manual ownership'],
 [()=>{s.manualMovementUntil31222=s.time+1},()=>{delete s.manualMovementUntil31222},'manual grace'],
 [()=>{plan={...normalPlan(),target:{x:NaN,y:7}}},()=>{plan=normalPlan()},'nonfinite exit']
];for(const [a,b,name]of cases){now+=100;denied(a,b,name);}
const before=transitionCount;
A.step(s,settings,false,interact);now+=1801;A.step(s,settings,false,interact);now+=7000;A.step(s,settings,false,interact);assert.equal(transitionCount,before,'large sample gaps reset');s.time--;tick(100);now+=7000;A.step(s,settings,false,interact);assert.equal(transitionCount,before,'rewind resets');
A.reset(s);s.x=7;s.y=25;s.target={x:25,y:7,autoProgressV31301:true};s.path=[{x:8,y:24}];plan={...normalPlan(),action:'move'};A.step(s,settings,false,interact);
for(let i=0;i<7;i++)assert.equal(tick(),false);assert.equal(transitionCount,before,'a distant exit never transitions after timeout');assert.equal(s.x,7);assert.equal(s.y,25);assert.equal(s.target,null,'stalled automatic path is released for native replanning');assert.equal(s.path.length,0);assert.equal(A.metrics().repaths,1);
s.target={x:25,y:7,autoProgressV31301:true};for(let i=0;i<3;i++){s.x+=.2;tick();}assert(s.target,'moving around an obstacle is not treated as stuck');
s.target={x:12,y:12};for(let i=0;i<8;i++)tick();assert.equal(s.target.x,12,'manual target survives every timer');
delete s.target;s.x=24;s.y=7;plan=normalPlan();A.reset(s);A.step(s,settings,false,interact);transitionOk=false;for(let i=0;i<7;i++)tick();assert.equal(interactCount,1,'failed checkpoint/transition does not invoke interaction');
hasProfile=false;transitionOk=true;A.reset(s);A.step(s,settings,false,interact);for(let i=0;i<7;i++)tick();assert.equal(interactCount,2,'legacy map interacts only at its actual exit');
console.log('PASS RC122 map recovery',JSON.stringify({blockedCases:cases.length,proximityRequired:true,noTeleport:true,nativeRepath:true,gapAndRollback:true,...A.metrics()}));
