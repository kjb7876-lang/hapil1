'use strict';

// Exercise the exact readiness predicate passed to Playwright by the camera
// browser fixture. This is intentionally browser-free; it guards the setup
// precondition independently of camera rendering and Chrome timing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'rc223-camera-browser.cjs'),'utf8');
const callStart=source.indexOf('await page.waitForFunction(setup => {');
const bodyStart=callStart<0?-1:source.indexOf('setup => {',callStart);
const callEnd=bodyStart<0?-1:source.indexOf('}, setup, {timeout: 15000});',bodyStart);
assert(bodyStart>=0&&callEnd>bodyStart,'native-game settled predicate remains in the browser fixture');
const predicateSource=source.slice(bodyStart,callEnd+1);
const windowState={};
const ready=vm.runInNewContext('('+predicateSource+')',{window:windowState});
const startTime=20;
const state=({time=20.2,storyOpen=false,readingBlocked=false,modal=null,hasState=true}={})=>{
 const s=hasState?{time}:null;
 windowState.__HAPIL_CONTROLS_V31329__={binding:{state:{current:s},modal:{current:modal}}};
 windowState.__HAPIL_STORY_RC51__={isOpen:()=>storyOpen};
 windowState.__HAPIL_READING_V31342__={blocked:readingBlocked};
 return {startTime};
};

assert.equal(ready(state()),true,'native time advance with no blockers settles the fixture');
assert.equal(ready(state({time:20.1})),false,'time must advance strictly beyond the 0.1 second threshold');
assert.equal(ready(state({time:20})),false,'unchanged native time is not settled');
assert.equal(ready(state({storyOpen:true})),false,'an open native story reader blocks setup completion');
assert.equal(ready(state({readingBlocked:true})),false,'the native reading lock blocks setup completion');
assert.equal(ready(state({modal:'settings'})),false,'a native modal blocks setup completion');
assert.equal(ready(state({hasState:false})),false,'missing native state cannot satisfy setup completion');

console.log('RC223_CAMERA_FIXTURE_UNIT',JSON.stringify({status:'passed',checks:7,predicate:'actual camera-browser fixture waitForFunction callback',blockers:['native-time','story-reader','reading-lock','modal','missing-state']}));
