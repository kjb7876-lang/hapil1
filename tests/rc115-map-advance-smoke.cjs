// Guard and seven-second cadence contract for the RC115 clear-only timer.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let now=0,mode='full',ready=true,plan={action:'move',reason:'combat-exit-portal'},transitionCount=0,interactCount=0,hidden=false,partyBlock=false,channelBlock=false,storyOpen=false;
const window={__HAPIL_CONTROLS_V31329__:{effective:()=>mode},__HAPIL_AUTOPROGRESS_V31301__:{plan:()=>plan},__HAPIL_FLOW_V31343__:{profile:()=>({}),ready:()=>({ready}),blocked:()=>false,transition:(s,interact,ui,offPortal)=>{assert.equal(ui,false);assert.equal(offPortal,true);transitionCount++;interact();return true;}},__HAPIL_PARTY_V31322__:{blocksNativeInput:()=>partyBlock},__HAPIL_CHANNEL_V31364__:{active:()=>channelBlock},__HAPIL_STORY_RC51__:{isOpen:()=>storyOpen}};
const sandbox={window,document:{get hidden(){return hidden}},performance:{now:()=>now},Object,WeakMap,Number,Math};vm.runInNewContext(fs.readFileSync('assets/rc115/map-advance.js','utf8'),sandbox);
const A=window.__HAPIL_AUTO_MAP_ADVANCE_RC115__,s={zone:'dist01',hp:200,time:100},settings={combatMode:'full',autoCombat:true,autoPortal:true};const interact=automatic=>{assert.equal(automatic,true);interactCount++;};
function denied(change,restore,name){change();assert.equal(A.step(s,settings,false,interact),false,name+': ineligible state does not start or continue timer');restore();}
assert.equal(A.step(s,settings,false,interact),false);for(let second=1;second<=6;second++){now=second*1000;assert.equal(A.step(s,settings,false,interact),false);}assert.equal(transitionCount,0,'no advance before seven seconds');now=6999;assert.equal(A.step(s,settings,false,interact),false);assert.equal(transitionCount,0,'no advance at 6.999 seconds');now=7000;assert.equal(A.step(s,settings,false,interact),true);assert.equal(transitionCount,1,'advance starts at seven seconds');assert.equal(interactCount,1,'clear timer invokes native interaction as automatic');
const cases=[
 [()=>{ready=false},()=>{ready=true},'actual FLOW.ready gate'],
 [()=>{ready=false},()=>{ready=true},'required waves/hostiles'],
 [()=>{plan={action:'wait',reason:'hostiles-or-waves'}},()=>{plan={action:'move',reason:'combat-exit-portal'}},'planner still waiting on clear gates'],
 [()=>{mode='manual'},()=>{mode='full'},'manual mode'],
 [()=>{hidden=true},()=>{hidden=false},'background tab'],
 [()=>{partyBlock=true},()=>{partyBlock=false},'party overlay'],
 [()=>{channelBlock=true},()=>{channelBlock=false},'channel overlay'],
 [()=>{storyOpen=true},()=>{storyOpen=false},'story dialog'],
 [()=>{s.hp=0},()=>{s.hp=200},'death'],
 [()=>{s.paused=true},()=>{s.paused=false},'pause'],
 [()=>{s.practiceV31329=true},()=>{s.practiceV31329=false},'practice'],
 [()=>{s.target={autoProgressV31301:false}},()=>{delete s.target},'manual navigation override'],
 [()=>{settings.autoPortal=false},()=>{settings.autoPortal=true},'disabled portal progression'],
 [()=>{settings.autoCombat=false},()=>{settings.autoCombat=true},'disabled auto combat']
];
for(const [change,restore,name] of cases){now+=100;denied(change,restore,name);assert.equal(A.step(s,settings,false,interact),false,name+' permits normal portal movement during a fresh countdown');A.reset(s);}
// A large clock/sample gap and a simulation-clock rollback both restart the delay.
now+=10;A.step(s,settings,false,interact);now+=1801;A.step(s,settings,false,interact);now+=7000;A.step(s,settings,false,interact);assert.equal(transitionCount,1,'a dropped browser interval cannot fast-forward the countdown');
const before=transitionCount;now+=10;A.step(s,settings,false,interact);s.time-=1;now+=220;A.step(s,settings,false,interact);now+=7000;A.step(s,settings,false,interact);assert.equal(transitionCount,before,'simulation rollback restarts the countdown');
console.log('PASS RC115 clear timer',JSON.stringify({delayMs:A.metrics().delayMs,successAtMs:7000,transitionCount,interactCount,blockedCases:cases.length,gapAndRollback:true}));
