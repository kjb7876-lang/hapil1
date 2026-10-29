"use strict";
const assert=require("node:assert/strict"), fs=require("node:fs"), vm=require("node:vm");
const source=fs.readFileSync("assets/rc111/mobile-auto.js","utf8");
const handlers={}, docHandlers={}, classes=new Set(), held=new Set(), input=new Set();
let poll, now=0;
class Element { closest(s){return s===".game-stage canvas"?this:null;} getBoundingClientRect(){return {top:0,height:400};} setPointerCapture(){} hasPointerCapture(){return false;} }
const stage=new Element(), state={zone:"dist00",activeHeroId:"hero",hp:100,time:1};
const binding={phase:"game",input:{current:input},state:{current:state},modal:{current:null},blocked:()=>false};
const root={innerWidth:844,innerHeight:390,Element,performance:{now:()=>now},setInterval(fn){poll=fn;},document:{hidden:false,documentElement:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,v)=>v?classes.add(k):classes.delete(k)}},addEventListener:(k,f)=>(docHandlers[k]??=[]).push(f)},addEventListener:(k,f)=>(handlers[k]??=[]).push(f),__HAPIL_CONTROLS_V31329__:{binding,effective:()=>"full",hasHeldLogical:k=>held.has(k),setMode(){}},__HAPIL_MOBILE_V31366__:{enabled:()=>true,owns:()=>false,clear:()=>{}},__HAPIL_ACTION_CONTRACT_V31406__:{capture:b=>({s:b.state.current,input:b.input.current,zone:b.state.current.zone,hero:b.state.current.activeHeroId,at:b.state.current.time}),current:(x,b)=>x.s===b.state.current&&x.input===b.input.current&&x.zone===b.state.current.zone&&x.hero===b.state.current.activeHeroId&&b.state.current.time>=x.at}};
root.window=root;vm.runInNewContext(source,root,{filename:'mobile-auto.js'});
const fire=(type,id,x,y)=>{const event={type,target:stage,pointerId:id,button:0,isPrimary:true,clientX:x,clientY:y,preventDefault(){},stopImmediatePropagation(){}};for(const fn of handlers[type]??[])fn(event);};
const press=(id=1)=>{fire("pointerdown",id,100,100);fire("pointermove",id,150,100);};
held.add("ArrowUp");input.add("ArrowUp");press();assert(input.has("ArrowUp"),"touch vector keeps concurrently held keyboard direction");assert(input.has("ArrowRight"));
fire("pointerup",1,150,100);assert(input.has("ArrowUp"),"touch release keeps keyboard direction");assert(!input.has("ArrowRight"));
held.clear();input.clear();press(2);assert(input.has("ArrowRight"));state.zone="dist01";poll();assert(!input.has("ArrowRight"),"zone change cancels old gesture");assert(!root.__HAPIL_MOBILE_AUTO_V31311__.metrics().held);
press(3);const oldInput=binding.input.current;binding.input.current=new Set(["ArrowLeft"]);poll();assert(!oldInput.has("ArrowRight"),"input replacement clears original input");assert(binding.input.current.has("ArrowLeft"),"input replacement does not delete new input");
press(4);binding.modal.current={};poll();assert(!root.__HAPIL_MOBILE_AUTO_V31311__.metrics().held,"modal cancels gesture");assert(!binding.input.current.has("ArrowRight"));
console.log("PASS actual RC111 touch ownership and lifecycle: keyboard overlap, release, zone, input replacement, modal");
// Exercise the shipped keyboard controller and touch module together, including
// release in both directions. The first section isolates the touch module.
delete root.__HAPIL_ACTION_CONTRACT_V31406__;vm.runInNewContext(fs.readFileSync('assets/controller-v31406/action-contract.js','utf8'),root);
vm.runInNewContext(fs.readFileSync('assets/rc15/hero-controls.js','utf8'),root);
const names=['F','HAPIL_driveAutoProgressV31301','HAPIL_effectiveGrowthV31400','J','MONGSE_ASSET_VERSION','MONGSE_clearHostileProjectiles31215','MONGSE_combatDistance','MONGSE_heroRoleProfile31222','MONGSE_isEncounterLocked31226','MONGSE_objectiveDamageAllowedV31309','MONGSE_resetHeroAutoDodge31223','MONGSE_writeSave','ar','hi','ir','oi'];
const native={};for(const name of names)Object.defineProperty(native,name,{get:()=>name==='MONGSE_ASSET_VERSION'?'test':()=>false,set:()=>{}});
root.__HAPIL_HERO_CONTROL_FACTORY_V31406__.install(native);
const controls=root.__HAPIL_CONTROLS_V31329__;binding.modal.current=null;binding.settings={current:{combatMode:'full'}};binding.actions={};binding.input.current=new Set();controls.bind(binding);
const key=(code,down)=>controls.key({code,repeat:false,preventDefault(){}},down);
key('ArrowUp',true);press(5);assert(binding.input.current.has('ArrowUp')&&binding.input.current.has('ArrowRight'),'real keyboard and drag share input');fire('pointerup',5,150,100);assert(binding.input.current.has('ArrowUp'),'real keyboard survives drag release');key('ArrowUp',false);assert(!binding.input.current.has('ArrowUp'));
press(6);key('ArrowRight',true);key('ArrowRight',false);assert(binding.input.current.has('ArrowRight'),'drag survives real keyboard release');fire('pointerup',6,150,100);assert(!binding.input.current.has('ArrowRight'));
press(7);binding.modal.current={};controls.syncLifecycle(state,true);assert(!root.__HAPIL_MOBILE_AUTO_V31311__.metrics().held,'native pause immediately cancels automatic touch');assert.equal(binding.input.current.size,0);
console.log('PASS shipped RC15 keyboard controller + RC111 touch: both release orders and immediate native pause');
// Exercise the real native pad block shipped in the bundle. Though hidden when
// mobile controls are active, an already-held pad may outlive a mode change.
const bundle=fs.readFileSync('assets/index-v31526.js','utf8'),padBegin=bundle.indexOf('/* HAPIL 3.13.43: native movement-pad pointer ownership. */'),padEnd=bundle.indexOf('/* HAPIL_V31343_BOSS_HOME:',padBegin);
assert(padBegin>=0&&padEnd>padBegin,'native pad block located');vm.runInNewContext(bundle.slice(padBegin,padEnd),root);const pad=root.__HAPIL_MOBILE_V31343__,padTarget={setPointerCapture(){},hasPointerCapture(){return false;}};
binding.modal.current=null;binding.input.current=new Set();controls.bind(binding);press(8);pad.down(binding.input.current,'ArrowRight',{pointerId:42,currentTarget:padTarget,preventDefault(){}});pad.up(binding.input.current,{pointerId:42,currentTarget:padTarget});assert(binding.input.current.has('ArrowRight'),'native pad release preserves automatic touch');fire('pointerup',8,150,100);assert(!binding.input.current.has('ArrowRight'));
let overlayKey=true;root.__HAPIL_MOBILE_V31366__.owns=(_input,key)=>overlayKey&&key==='ArrowLeft';pad.down(binding.input.current,'ArrowLeft',{pointerId:43,currentTarget:padTarget,preventDefault(){}});pad.up(binding.input.current,{pointerId:43,currentTarget:padTarget});assert(binding.input.current.has('ArrowLeft'),'native pad release preserves overlay touch');overlayKey=false;binding.input.current.delete('ArrowLeft');
console.log('PASS shipped native pad cross-owner release, including mode-transition overlap');
// A native-pad-only press must be canceled on world/input replacement even
// without pointerup or blur, and its old input object must be cleaned.
controls.bind(binding);const padOld=binding.input.current;pad.down(padOld,'ArrowRight',{pointerId:44,currentTarget:padTarget,preventDefault(){}});assert(padOld.has('ArrowRight'));
binding.input.current=new Set();binding.state.current={...state,zone:'dist02',time:2};controls.bind(binding);assert(!padOld.has('ArrowRight'),'native lifecycle clears old pad input on world replacement');assert(!pad.hasPointers(),'native pad has no stale pointer after world replacement');
console.log('PASS native-pad-only world and input replacement cleanup');
