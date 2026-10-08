'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),{collect}=require('./helpers/rc156-ego-motion.cjs');
// Exercise the real collector's cleanup after its observation property is gone.
// The original error must survive cleanup; this is not a gameplay/browser pass.
(async()=>{
 const error=new Error('original trusted-input probe failure'),state={zone:'dist00',time:100,enemies:[{id:'dist00-boss',hp:100}],egoGuardianRC155:{active:true}},frames=[],held=new Set(),report={};let mode='full',dismissed=0;
 const scope={__HAPIL_CONTROLS_V31329__:{binding:{state:{current:state},actions:{dismiss:()=>{dismissed++;}}},setMode:v=>{mode=v;}},requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}};scope.window=scope;vm.createContext(scope);
 const page={evaluate:async(fn,arg)=>{scope.arg=arg;return vm.runInContext('('+fn.toString()+')(arg)',scope);},keyboard:{down:async key=>{held.add(key);delete scope.__RC155_BITMAP_CAPTURE__;throw error;},up:async key=>{held.delete(key);}},waitForTimeout:async()=>{throw Error('unexpected success-path wait');}};
 await assert.rejects(collect(page,{fixture:async()=>({fixture:true}),capture:async()=>{throw Error('unexpected capture');},label:'cleanup-vm',report}),e=>e===error);
 assert.equal(mode,'manual');assert.equal(dismissed,1);assert.equal(frames.length,1);assert.equal(held.size,0);assert.equal(scope.__RC156_MOTION_ACTIVE__,false);assert.deepEqual(Array.from(report.motion[0].finalState.draws),[]);assert.equal(report.motion[0].finalState.zone,'dist00');assert.equal(report.motion[0].status,'running');
 console.log('RC156_MOTION_UNIT',JSON.stringify({status:'passed',checks:9,scope:'Real collector error/cleanup path in Node VM; no browser or visual success claim'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
