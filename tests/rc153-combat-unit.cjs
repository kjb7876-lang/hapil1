'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let checks=0;
const ok=(a,b)=>{assert(a,b);checks++;};

// Model the DOM event contract used by the portrait pause lifecycle. Listener
// registration, dispatch, cancellation, once, and removal all have observable
// effects so this fixture cannot hide missing runtime behavior with no-op stubs.
function eventTarget(){
 const listeners=new Map();
 const captureOf=options=>typeof options==='boolean'?options:!!options?.capture;
 return{
  addEventListener(type,listener,options){
   assert.equal(typeof type,'string');assert(listener&& (typeof listener==='function'||typeof listener.handleEvent==='function'));
   const opts=typeof options==='object'&&options!==null?options:{};
   const rows=listeners.get(type)??[];
   if(!rows.some(row=>!row.removed&&row.listener===listener&&row.capture===captureOf(options)))rows.push({listener,capture:captureOf(options),once:!!opts.once,passive:!!opts.passive,removed:false});
   listeners.set(type,rows);
  },
  removeEventListener(type,listener,options){
   const row=(listeners.get(type)??[]).find(row=>!row.removed&&row.listener===listener&&row.capture===captureOf(options));
   if(row)row.removed=true;
  },
  dispatchEvent(event){
   assert(event&&typeof event.type==='string','dispatchEvent requires an event with a type');
   assert(!event.dispatching,'an event cannot be redispatched while dispatching');
   event.target=this;event.currentTarget=this;event.dispatching=true;event.immediatePropagationStopped=false;
   try{
    for(const row of [...(listeners.get(event.type)??[])]){
     if(row.removed)continue;
     if(row.once)this.removeEventListener(event.type,row.listener,{capture:row.capture});
     event.inPassiveListener=row.passive;
     if(typeof row.listener==='function')row.listener.call(this,event);else row.listener.handleEvent.call(row.listener,event);
     event.inPassiveListener=false;
     if(event.immediatePropagationStopped)break;
    }
   }finally{event.inPassiveListener=false;event.currentTarget=null;event.dispatching=false;}
   return !event.defaultPrevented;
  },
  listenersFor(type){return(listeners.get(type)??[]).filter(row=>!row.removed).map(({listener,capture,once,passive})=>({listener,capture,once,passive}));}
 };
}
function syntheticEvent(type,{cancelable=false}={}){
 return{type,cancelable,defaultPrevented:false,immediatePropagationStopped:false,target:null,currentTarget:null,dispatching:false,inPassiveListener:false,
  preventDefault(){if(this.cancelable&&!this.inPassiveListener)this.defaultPrevented=true;},
  stopImmediatePropagation(){this.immediatePropagationStopped=true;}};
}
function classList(initial=[]){
 const values=new Set(initial);
 return{add(...names){for(const name of names)values.add(name);},remove(...names){for(const name of names)values.delete(name);},contains(name){return values.has(name);},toggle(name,force){if(force===undefined)force=!values.has(name);if(force)values.add(name);else values.delete(name);return force;}};
}
const windowEvents=eventTarget(),documentEvents=eventTarget(),viewportEvents=eventTarget();
const html={classList:classList()},body={classList:classList(['rc15-playing']),children:[],appendChild(element){this.children.push(element);return element;}};
const document=Object.assign({},documentEvents,{readyState:'complete',documentElement:html,body,createElement(tag){return{tagName:tag.toUpperCase(),attributes:{},setAttribute(name,value){this.attributes[name]=value;}};}});
const root=Object.assign({},windowEvents,{innerWidth:844,innerHeight:390,visualViewport:viewportEvents,__HAPIL_BATTLE_ARENA_RC138__:{enabled:()=>true,side:()=> 'right'}});
let heldInputClears=0;
root.__HAPIL_CONTROLS_V31329__={binding:{phase:'game'},clear(){heldInputClears++;}};
const navigator={userAgentData:{mobile:true},userAgent:'',platform:'',maxTouchPoints:0};
vm.runInNewContext(fs.readFileSync('assets/rc153/combat-layout.js','utf8'),{window:root,document,navigator});
const L=root.__HAPIL_COMBAT_LAYOUT_RC153__;
const pause=root.__HAPIL_ORIENTATION_PAUSE_RC152__;
ok(pause?.version==='RC152','portrait pause lifecycle installs in the VM event environment');
const inputEvents=['keydown','keyup','beforeinput','pointerdown','pointerup','pointermove','pointercancel','mousedown','mouseup','mousemove','click','dblclick','contextmenu','wheel','dragstart','touchstart','touchmove','touchend','touchcancel'];
const lifecycleEvents=['resize','orientationchange','pageshow'];
ok(inputEvents.every(type=>root.listenersFor(type).length===1),'runtime registers each input guard');
ok(lifecycleEvents.every(type=>root.listenersFor(type).length===1),'runtime registers resize, orientationchange and pageshow listeners');
ok(inputEvents.every(type=>root.listenersFor(type)[0].capture&&root.listenersFor(type)[0].passive===false),'input guards use capture and remain cancelable');
ok(lifecycleEvents.every(type=>root.listenersFor(type)[0].passive===true),'lifecycle listeners are registered passive');
ok(root.visualViewport.listenersFor('resize').length===1&&document.listenersFor('visibilitychange').length===1,'visual viewport and visibility listeners are registered');
let cleanupCalls=0;const cleanupProbe=()=>cleanupCalls++;
root.addEventListener('rc153-cleanup-probe',cleanupProbe);root.dispatchEvent(syntheticEvent('rc153-cleanup-probe'));
ok(cleanupCalls===1,'registered probe listener fires');root.removeEventListener('rc153-cleanup-probe',cleanupProbe);
ok(root.listenersFor('rc153-cleanup-probe').length===0,'removeEventListener removes the matching listener');root.dispatchEvent(syntheticEvent('rc153-cleanup-probe'));
ok(cleanupCalls===1,'removed listener does not fire again');
root.innerWidth=390;root.innerHeight=844;root.dispatchEvent(syntheticEvent('orientationchange'));
ok(pause.paused()&&html.classList.contains('rc152-portrait-paused'),'orientationchange actually pauses portrait combat');
ok(pause.metrics().enters===1&&heldInputClears===1,'portrait transition clears held input exactly once');
ok(body.children.length===1&&body.children[0].textContent==='가로 화면으로 전환해주세요','portrait gate is mounted with the user-facing instruction');
root.visualViewport.dispatchEvent(syntheticEvent('resize'));document.dispatchEvent(syntheticEvent('visibilitychange'));root.dispatchEvent(syntheticEvent('pageshow'));
ok(pause.metrics().enters===1&&heldInputClears===1,'repeated viewport, visibility and page lifecycle events do not duplicate pause entry');
const blockedInput=syntheticEvent('keydown',{cancelable:true}),blockedDispatch=root.dispatchEvent(blockedInput);
ok(!blockedDispatch&&blockedInput.defaultPrevented&&blockedInput.immediatePropagationStopped&&pause.metrics().blocked===1,'portrait input event is prevented and stopped by the registered guard');
root.innerWidth=844;root.innerHeight=390;root.dispatchEvent(syntheticEvent('resize'));
ok(!pause.paused()&&!html.classList.contains('rc152-portrait-paused'),'resize back to landscape resumes combat without rebuilding state');
ok(pause.metrics().resumes===1&&pause.metrics().enters===1&&heldInputClears===1,'resume is counted once and does not clear input again');
const resumedInput=syntheticEvent('keydown',{cancelable:true});
ok(root.dispatchEvent(resumedInput)&&!resumedInput.defaultPrevented&&pause.metrics().blocked===1,'landscape input is no longer blocked');
for(const owner of ['midboss','final','hidden','kair','cosmic','cult','Persona'])for(const count of [2,3,6,12,24,48,96])for(const direction of [-3.12,-1,0,1,3.12]){const a={id:owner,boss:true},s={time:10,enemies:[a],hostileProjectiles:Array.from({length:count},(_,i)=>({id:i,sourceId:a.id,born:10,sourceBorn:10,frozenUntil:12+i*.02,originX:24,originY:14,x:24,y:14,vx:Math.cos(direction+.01*i/count)*5,vy:Math.sin(direction+.01*i/count)*5,damage:12,sprite:'native',retargetAt31212:14,homeAt31211:13}))};L.scatter(s);ok(s.hostileProjectiles.every(q=>q.rc153ScatterCount===count),'whole batch '+owner);const offsets=s.hostileProjectiles.map(q=>Math.atan2(Math.sin(q.rc153ScatterAngle-direction),Math.cos(q.rc153ScatterAngle-direction))),span=Math.max(...offsets)-Math.min(...offsets);ok(Math.abs(span-.96)<1e-9,'scatter angular span');for(const q of s.hostileProjectiles){ok(Math.abs(Math.hypot(q.vx,q.vy)-5)<1e-9&&q.damage===12&&q.sprite==='native','speed/damage/art preserved');q.vx=99;q.vy=-100;L.lock(q);ok(Math.abs(Math.atan2(q.vy,q.vx)-Math.atan2(Math.sin(q.rc153ScatterAngle),Math.cos(q.rc153ScatterAngle)))<1e-9&&!q.retargetAt31212&&!q.homeAt31211,'native steering cannot collapse bundle');}}
for(const kind of ['single','wide','laser','bomb','friendly','released','other-owner']){const a={id:'boss',boss:true},q={sourceId:'boss',id:1,born:10,sourceBorn:10,frozenUntil:12,x:24,y:14,originX:24,originY:14,vx:5,vy:0},other={...q,id:2};if(kind==='wide'){other.vx=0;other.vy=5;}if(kind==='laser')q.laserShot=other.laserShot=true;if(kind==='bomb')q.themeBombV31323=other.themeBombV31323=true;if(kind==='friendly')q.friendly=other.friendly=true;if(kind==='released'){q.born=q.sourceBorn=other.born=other.sourceBorn=9;q.frozenUntil=other.frozenUntil=9;}if(kind==='other-owner')other.sourceId='another';const s={time:10,enemies:[a],hostileProjectiles:kind==='single'?[q]:[q,other]};L.scatter(s);ok(s.hostileProjectiles.every(q=>q.rc153ScatterAngle==null),'preserve '+kind);}
for(let i=0;i<1000;i++){const p=L.position({boss:true},{x:(i%43)-10,y:(i%37)-5});ok(p.x-p.y>=6-1e-9&&p.x-p.y<=12+1e-9&&p.x+p.y>=35&&p.x+p.y<=41,'projected world right central');}const p={x:10,y:20};ok(L.position({id:'inner-evil-rc133',boss:true},p)===p,'Persona mirror exception');
L.bind({project:(x,y)=>({x:640+24*(x-y),y:50+12*(x+y)}),size:a=>a.size});for(const width of [280,390,844,1280])for(const size of [100,210,500])for(const slot of [undefined,'boss','hero']){const s={x:13.8,y:24.2,size:100,enemies:[{x:24,y:14,size,hp:10,boss:true}]},v={x:640-width/2,width},b=L.bounds(s,slot==='hero'?[s]:slot==='boss'?s.enemies:null),c=L.camera(s,v,slot);ok(b.left*c.scale+c.x>=v.x+12-1e-7&&b.right*c.scale+c.x<=v.x+v.width-12+1e-7,'complete width');ok(b.top*c.scale+c.y>=c.rc153Safe.top-1e-7&&b.bottom*c.scale+c.y<=c.rc153Safe.bottom+1e-7,'body/weapon/HUD height');}
console.log('RC153_COMBAT_UNIT',JSON.stringify({status:'passed',checks,eventModel:{registeredInputTypes:inputEvents.length,windowLifecycleTypes:lifecycleEvents.length,viewportVisibilityDispatch:true,portraitPauseAndLandscapeResume:true,inputBlockedWhilePaused:true,listenerRemoval:true},scope:'synthetic scatter, bounding and portrait-lifecycle proofs; native browser is separate'}));
