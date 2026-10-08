'use strict';
const assert=require('node:assert/strict'),{installBootAudit}=require('../qa/rc156/boot-audit.js');
let checks=0,time=0,nextId=0;
const eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);},ok=(a,m)=>{checks++;assert.ok(a,m);};
const timers=new Map(),root={document:{readyState:'loading'},performance:{now:()=>time,getEntriesByType:()=>[]},Date:{now:()=>100000+time}};
for(const name of ['setTimeout','setInterval','requestAnimationFrame'])root[name]=function(fn,...args){const id=++nextId;timers.set(id,{kind:name,fn,args,receiver:this});return id;};
for(const name of ['clearTimeout','clearInterval','cancelAnimationFrame'])root[name]=function(id){timers.delete(id);return 'native-cancel-'+id;};
const originals=Object.fromEntries(Object.keys(root).filter(k=>typeof root[k]==='function').map(k=>[k,root[k]])),audit=installBootAudit(root),receiver={native:true};
function fire(id,...args){const row=timers.get(id);if(row.kind!=='setInterval')timers.delete(id);time+=16;return row.fn.apply(receiver,args);}
let calls=0;function install(value){calls++;eq(this,receiver,'observer preserves callback receiver');eq(value,7,'observer preserves callback arguments');root.__HAPIL_CHARACTER_V31342__={installed:true};return 'native-result';}
const timeout=root.setTimeout(install,0,7),registered=timers.get(timeout);eq(registered.args,[0,7],'delay and user arguments reach the native scheduler');eq(fire(timeout,7),'native-result','native callback return is preserved');eq(calls,1,'native initialization callback executes once');
const initialized=audit.snapshot();eq(initialized.character,true,'real callback flag transition is observed');ok(initialized.transitions.some(t=>t.cause==='after callback 1'&&t.dependencies.__HAPIL_CHARACTER_V31342__.installed),'registration and actual flag change are separately recorded');eq(initialized.callbacks[0].fired,1,'executed callback counted');eq(initialized.callbacks[0].pending,0,'one-shot callback no longer pending');
let repeats=0;const interval=root.setInterval(()=>++repeats,20);fire(interval);fire(interval);eq(repeats,2,'repeating native callbacks retained');eq(root.clearInterval(interval),'native-cancel-'+interval,'cancellation return and native timer ID preserved');eq(timers.has(interval),false,'native cancellation actually removes timer');
let frameTime;const frame=root.requestAnimationFrame(value=>{frameTime=value;});fire(frame,123.5);eq(frameTime,123.5,'RAF timestamp reaches the actual callback');
const text=root.setTimeout('window.x=1',1);eq(timers.get(text).fn,'window.x=1','non-function native timer semantics retained');root.clearTimeout(text);
const doomed=root.setTimeout(()=>{throw Error('Must not fire');},4);root.clearTimeout(doomed);eq(timers.has(doomed),false,'cancelled callback never becomes an observer event');
const failure=root.setTimeout(()=>{throw Error('native failure');},1);checks++;assert.throws(()=>fire(failure),/native failure/,'observer propagates native callback errors');
const snapshot=audit.snapshot();eq(snapshot.callbacks.find(r=>r.kind==='setInterval').cancelled,1,'interval cancellation is accounted');ok(snapshot.callbacks.find(r=>r.kind==='setInterval').pending===0,'cancelled interval does not remain falsely pending');
audit.stop();for(const [kind,native]of Object.entries(originals))eq(root[kind],native,'boot-only tracing restores '+kind+' before combat');
const after=root.setTimeout(()=>++calls,2);fire(after);eq(calls,2,'native callback continues after observation stops');
console.log('RC156_BOOT_AUDIT_UNIT',JSON.stringify({status:'passed',checks,scope:'Actual observer schedule/fire/cancel/return/error/cleanup semantics; browser initialization diagnosis separate'}));
