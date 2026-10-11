'use strict';
// Negative cases execute the exact browser predicates, preventing an accidental
// weakening of cast ownership, queue pacing, or the mutual no-stall contract.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/rc134-persona-effects-browser.cjs','utf8');
function predicate(start,label,args){const at=source.indexOf('check('+start);assert(at>=0);const end=source.indexOf(",'"+label,at);assert(end>at);return new Function(...args,'return '+source.slice(at+6,end)+';');}
const cadence=predicate('actualDelay>=castDelay','mutual cadence preserves',['actualDelay','castDelay','queueDelay','expectedDelay']);
const tempo=predicate('tempoSteps.every','mutual bounded slowdown',['tempoSteps']);
let checks=0;const eq=(a,b,message)=>{checks++;assert.equal(a,b,message);};
for(const [cast,queue]of [[.97,4.5],[5.2,1.5],[.7,.9]]){const expected=Math.max(1.8,cast,queue);eq(cadence(expected,cast,queue,expected),true,'bounded complete cast and queue delay accepted');for(const delay of [0,cast-.01,queue-.01,1.79,expected+.5,NaN])eq(cadence(delay,cast,queue,expected),false,'short cast/queue/floor or unbounded delay rejected');}
const valid=[.016*.35,.016,.016*1.5];eq(tempo(valid),true,'slowdown and burst with positive floor accepted');for(const values of [[0,...valid],[.001,...valid],[-.01,...valid],[NaN,...valid],[.101,...valid],[.016,.016],[.0056,.006]])eq(tempo(values),false,'zero, invalid/unbounded dt or missing tempo phases rejected');
console.log('RC134_PACING_CONTRACT',JSON.stringify({status:'passed',checks,method:'exact browser predicate negative cases; gameplay remains native browser verification'}));
