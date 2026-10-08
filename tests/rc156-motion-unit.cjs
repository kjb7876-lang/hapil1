'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),{collect,capturePolicy}=require('./helpers/rc156-ego-motion.cjs');
// Exercise the real collector's cleanup after its observation property is gone.
// The original error must survive cleanup; this is not a gameplay/browser pass.
(async()=>{
 const error=new Error('original trusted-input probe failure'),state={zone:'dist00',time:100,enemies:[{id:'dist00-boss',hp:100}],egoGuardianRC155:{active:true}},frames=[],held=new Set(),report={};let mode='full',dismissed=0;
 const scope={__HAPIL_CONTROLS_V31329__:{binding:{state:{current:state},actions:{dismiss:()=>{dismissed++;}}},setMode:v=>{mode=v;}},requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}};scope.window=scope;vm.createContext(scope);
 const page={evaluate:async(fn,arg)=>{scope.arg=arg;return vm.runInContext('('+fn.toString()+')(arg)',scope);},keyboard:{down:async key=>{held.add(key);delete scope.__RC155_BITMAP_CAPTURE__;throw error;},up:async key=>{held.delete(key);}},waitForTimeout:async()=>{throw Error('unexpected success-path wait');}};
 await assert.rejects(collect(page,{fixture:async()=>({fixture:true}),capture:async()=>{throw Error('unexpected capture');},label:'cleanup-vm',report}),e=>e===error);
 assert.equal(mode,'manual');assert.equal(dismissed,1);assert.equal(frames.length,1);assert.equal(held.size,0);assert.equal(scope.__RC156_MOTION_ACTIVE__,false);assert.deepEqual(Array.from(report.motion[0].finalState.draws),[]);assert.equal(report.motion[0].finalState.zone,'dist00');assert.equal(report.motion[0].status,'running');
 let captureChecks=0;const recorded=[];
 for(let direction=0;direction<8;direction++)for(const phase of ['walk','release','flight','recover']){const old=capturePolicy(direction,phase,false),whole=capturePolicy(direction,phase,true);assert.equal(old.record,true,'existing ordinary-time snapshots stay supported');assert.equal(old.full,direction===0&&phase==='flight','legacy evidence scope stays explicit');if(whole.record){assert.equal(whole.full,true,'new evidence cannot use the moving screenshot clip');recorded.push([direction,phase]);}captureChecks+=2+(whole.record?1:0);}
 assert.deepEqual(recorded,[[0,'walk'],[0,'release'],[4,'walk'],[4,'release']],'both scene directions retain whole viewport walking and native aimed attack samples');captureChecks++;
 console.log('RC156_MOTION_UNIT',JSON.stringify({status:'passed',checks:9+captureChecks,scope:'Real collector cleanup in Node VM and capture selection contract; no browser, eight-direction attack or visual success claim'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
