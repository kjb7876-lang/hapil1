'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),{collect,capturePolicy}=require('./helpers/rc156-ego-motion.cjs');
function domEvents(){const rows=new Map(),capture=o=>typeof o==='boolean'?o:!!o?.capture;return{
 addEventListener(type,fn,options){assert.equal(typeof fn,'function');const list=rows.get(type)??[];if(!list.some(r=>r.fn===fn&&r.capture===capture(options)))list.push({fn,capture:capture(options)});rows.set(type,list);},
 removeEventListener(type,fn,options){rows.set(type,(rows.get(type)??[]).filter(r=>r.fn!==fn||r.capture!==capture(options)));},
 emit(type,detail){const event={type,...detail};for(const r of [...(rows.get(type)??[])])r.fn(event);return event;},
 count(type){return(rows.get(type)??[]).length;}
};}
// Exercise the real collector's cleanup after its observation property is gone.
// The original error must survive cleanup; this is not a gameplay/browser pass.
(async()=>{
 const error=new Error('original trusted-input probe failure'),state={zone:'dist00',time:100,enemies:[{id:'dist00-boss',hp:100}],egoGuardianRC155:{active:true}},frames=[],held=new Set(),report={};let mode='full',dismissed=0;
 const scope=Object.assign({__HAPIL_CONTROLS_V31329__:{binding:{state:{current:state},actions:{dismiss:()=>{dismissed++;}}},setMode:v=>{mode=v;}},requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}},domEvents());scope.window=scope;vm.createContext(scope);
 const page={evaluate:async(fn,arg)=>{scope.arg=arg;return vm.runInContext('('+fn.toString()+')(arg)',scope);},keyboard:{down:async key=>{held.add(key);delete scope.__RC155_BITMAP_CAPTURE__;throw error;},up:async key=>{held.delete(key);}},waitForTimeout:async()=>{throw Error('unexpected success-path wait');}};
 await assert.rejects(collect(page,{fixture:async()=>({fixture:true}),capture:async()=>{throw Error('unexpected capture');},label:'cleanup-vm',report}),e=>e===error);
 assert.equal(mode,'manual');assert.equal(dismissed,1);assert.equal(frames.length,1);assert.equal(held.size,0);assert.equal(scope.__RC156_MOTION_ACTIVE__,false);assert.deepEqual(Array.from(report.motion[0].finalState.draws),[]);assert.equal(report.motion[0].finalState.zone,'dist00');assert.equal(report.motion[0].status,'running');
 assert.equal(scope.count('keydown'),0);assert.equal(scope.count('keyup'),0);
 let captureChecks=0;const recorded=[];
 for(let direction=0;direction<8;direction++)for(const phase of ['walk','release','flight','recover']){const old=capturePolicy(direction,phase,false),whole=capturePolicy(direction,phase,true);assert.equal(old.record,true,'existing ordinary-time snapshots stay supported');assert.equal(old.full,direction===0&&phase==='flight','legacy evidence scope stays explicit');if(whole.record){assert.equal(whole.full,true,'new evidence cannot use the moving screenshot clip');recorded.push([direction,phase]);}captureChecks+=2+(whole.record?1:0);}
 assert.deepEqual(recorded,[[0,'walk'],[0,'release'],[4,'walk'],[4,'release']],'both scene directions retain whole viewport walking and native aimed attack samples');captureChecks++;
 // Drive the actual installed RAF observer, with a slow-capture interval of
 //400 move frames before the first real attack transition. Such an interval
 // exhausts a first180-only budget; bounded buckets must retain the late attack.
 let observerInstalled=false,cameraX=10;const raf=[],live={zone:'dist00',time:100,x:14,y:24,enemies:[{id:'dist00-boss',hp:100}],heroMotion:{kind:'move'}},sampleReport={};
 const sampleScope=Object.assign({__HAPIL_CONTROLS_V31329__:{binding:{state:{current:live},actions:{dismiss(){}}},setMode(){}},document:{querySelector:()=>({getBoundingClientRect:()=>({toJSON:()=>({x:0,y:0,width:844,height:390})})})},__HAPIL_EGO_ART_RC155__:{selected:()=>({kind:live.heroMotion.kind==='attack'?'attack':'walk',index:3})},__HAPIL_BITMAP_NATIVE_RC133__:{body:()=>({area:100})},__RC155_QA__:{camera:()=>({x:cameraX,y:20,scale:1}),project:()=>({x:100,y:100})},__HAPIL_VIEWPORT_RC104__:{view:()=>({width:844,height:390})},scrollX:0,scrollY:0,requestAnimationFrame:callback=>{raf.push(callback);return raf.length;}},domEvents());sampleScope.window=sampleScope;vm.createContext(sampleScope);
 const samplePage={evaluate:async(fn,arg)=>{sampleScope.arg=arg;const result=vm.runInContext('('+fn.toString()+')(arg)',sampleScope);if(sampleScope.__RC156_MOTION_ACTIVE__)observerInstalled=true;return result;},keyboard:{down:async()=>{throw error;},up:async()=>{}},waitForTimeout:async()=>{throw Error('unexpected wait');}};
 // Stop after registration via the existing cleanup fixture, then reactivate
 // only that actual observer callback. No browser or gameplay reducer is faked.
 await assert.rejects(collect(samplePage,{fixture:async()=>({fixture:true}),capture:async()=>{},label:'observer-vm',report:sampleReport}),e=>e===error);assert(observerInstalled);sampleScope.__RC156_MOTION_ACTIVE__=true;sampleScope.__RC155_BITMAP_CAPTURE__=[];
 const tick=()=>{live.time+=1/60;const callback=raf.shift();assert(callback);callback();};
 for(let i=0;i<400;i++)tick();const beforeAttack=sampleScope.__RC156_MOTION_ROWS__.slice();assert(beforeAttack.every(r=>r.motion.kind==='move'));captureChecks++;
 live.heroMotion={kind:'attack'};for(let i=0;i<20;i++)tick();assert(sampleScope.__RC156_MOTION_ROWS__.some(r=>r.motion.kind==='attack'),'actual late attack survives exhausted move-frame budget');captureChecks++;
 assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.observed.move,400);assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.retained.move,60);captureChecks+=2;
 live.heroMotion={kind:'idle'};for(let i=0;i<200;i++)tick();assert(sampleScope.__RC156_MOTION_ROWS__.length<=180);assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.frames,620);assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.violations.length,0);captureChecks+=3;
 cameraX=11;tick();assert.equal(sampleScope.__RC156_MOTION_ROWS__.length,140,'an exhausted bucket cannot consume another evidence row');assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.violations.length,1,'omitted-frame camera drift is still detected');captureChecks+=2;
 // Exercise registered DOM events and the real collector's transparent native
 // action observer. A native A return is followed by a proc-skill RAF state;
 // neither the proc nor its subsequent motion is disabled to make A observable.
 cameraX=10;let calls=0,caller,argsSeen;const actions=sampleScope.__HAPIL_CONTROLS_V31329__.binding.actions,native=function(...args){calls++;caller=this;argsSeen=args;live.heroMotion={kind:'attack'};return 'native-value';};actions.attack=native;
 samplePage.keyboard.down=async()=>{assert.equal(sampleScope.count('keydown'),1);assert.equal(sampleScope.count('keyup'),1);captureChecks+=2;
  sampleScope.emit('keydown',{code:'KeyA',isTrusted:true});assert.equal(actions.attack.call(actions,7,'a'),'native-value');assert.equal(calls,1);assert.equal(caller,actions);assert.deepEqual(argsSeen,[7,'a']);assert.equal(actions.attack,native);captureChecks+=5;
  live.heroMotion={kind:'skill',skillIndex:2};tick();assert.equal(sampleScope.__RC156_MOTION_OBSERVATION__.frames,0,'old fixture RAF is rejected by its actual epoch guard');captureChecks++;tick();sampleScope.emit('keyup',{code:'KeyA',isTrusted:true});throw error;
 };
 await assert.rejects(collect(samplePage,{fixture:async()=>({fixture:true}),capture:async()=>{},label:'native-event-vm',report:sampleReport}),e=>e===error);
 const observed=sampleReport.motion.at(-1).finalState.rows;assert(observed.some(r=>r.cause==='native-A'&&r.motion.kind==='attack'));assert(observed.some(r=>r.cause==='raf'&&r.motion.kind==='skill'));assert(observed.some(r=>r.input?.code==='KeyA'&&r.input.trusted));assert.equal(sampleScope.count('keydown'),0);assert.equal(sampleScope.count('keyup'),0);assert.equal(actions.attack,native);captureChecks+=6;
 const nativeError=new Error('native A rejection'),throwing=function(){throw nativeError;};actions.attack=throwing;samplePage.keyboard.down=async()=>{sampleScope.emit('keydown',{code:'KeyA',isTrusted:true});actions.attack();};
 await assert.rejects(collect(samplePage,{fixture:async()=>({fixture:true}),capture:async()=>{},label:'native-throw-vm',report:sampleReport}),e=>e===nativeError);assert.equal(actions.attack,throwing);assert(!sampleReport.motion.at(-1).finalState.rows.some(r=>r.cause==='native-A'));assert.equal(sampleScope.count('keydown'),0);captureChecks+=4;
 actions.attack=native;samplePage.keyboard.down=async()=>{sampleScope.emit('keydown',{code:'KeyA',isTrusted:true});throw error;};await assert.rejects(collect(samplePage,{fixture:async()=>({fixture:true}),capture:async()=>{},label:'native-unused-vm',report:sampleReport}),e=>e===error);assert.equal(actions.attack,native,'a native action that was never called is restored on cleanup');assert.equal(sampleScope.count('keyup'),0);captureChecks+=3;
 console.log('RC156_MOTION_UNIT',JSON.stringify({status:'passed',checks:12+captureChecks,scope:'Actual collector cleanup, bounded RAF observer, functional DOM event registration/firing/removal and transparent native return in Node VM; no browser, eight-direction attack or visual success claim'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
