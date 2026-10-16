'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const acorn=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/hapil-deps/node_modules','acorn'));
const source=fs.readFileSync(path.join(__dirname,'rc223-laser-relay-browser.cjs'),'utf8'),ast=acorn.parse(source,{ecmaVersion:'latest'});let found;
function visit(node){if(!node||typeof node!=='object')return;if(node.type==='FunctionDeclaration'&&node.id?.name==='rememberPhaseWitness'){assert(!found);found=node;}for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
visit(ast);assert(found,'actual browser probe phase witness function exists');const probe={phaseWitnesses:[]},ctx=vm.createContext({probe});vm.runInContext(source.slice(found.start,found.end),ctx);const record=ctx.rememberPhaseWitness;
const row=(id,phase='warning',accepted=true,valid=true)=>({applyAccepted:accepted,castPhases:[{id,sourceId:'dist06-boss',phase}],validResults:[{id,sourceId:'dist06-boss',valid}],rawLaserCasts:[{id,sourceId:'dist06-boss'}]});
let checks=0;const first=row(1);record(first);assert.equal(probe.phaseWitnesses.length,1);checks++;first.rawLaserCasts[0].id=999;assert.equal(probe.phaseWitnesses[0].rawLaserCasts[0].id,1,'copy evidence before later mutations');checks++;
const rolling=[];for(let i=0;i<300;i++){const r=row(1,i<100?'warning':i<290?'active':'post-active');record(r);if(rolling.length>=40)rolling.shift();rolling.push(r);}
assert(!rolling.some(r=>r.castPhases[0].phase==='warning'),'slow simulation may evict all early warning rows from the rolling buffer');checks++;
assert.deepEqual(Array.from(probe.phaseWitnesses,r=>r.castPhases[0].phase),['warning','active','post-active'],'first actual accepted valid witness of every phase remains available');checks++;
record(row(2,'warning',false,true));record(row(3,'warning',true,false));record(row(4,'unknown',true,true));assert.equal(probe.phaseWitnesses.length,3,'rejected, invalid and unknown-phase rows cannot become pass evidence');checks++;
for(let id=2;id<100;id++)for(const phase of ['warning','active','post-active'])record(row(id,phase));assert.equal(probe.phaseWitnesses.length,36,'evidence storage remains bounded');checks++;
assert.equal(probe.phaseWitnesses[0].rawLaserCasts[0].id,1,'later casts cannot evict the selected first cast');checks++;
assert(source.includes('phaseWitnesses:q?.phaseWitnesses??[]'));assert(source.includes('[...report.receiver.final.phaseWitnesses,...report.receiver.final.applyEvents].filter('));checks+=2;
assert(source.includes("assert(acceptedRows.some(e=>e.castPhases?.some(c=>c.id===hostCastId&&c.phase==='warning'))"));assert(source.includes("assert(acceptedRows.some(e=>e.castPhases?.some(c=>c.id===hostCastId&&c.phase==='active'))"));assert(source.includes("assert.equal(laserStats?.rejectedSnapshots,0"));checks+=3;
console.log('RC223_LASER_PROBE_UNIT '+JSON.stringify({status:'passed',checks,scope:'actual browser fixture evidence retention only; does not simulate or certify native laser validity or network delivery',rollingRows:40,retainedPhaseWitnessRows:probe.phaseWitnesses.length,acceptedFirstCastPhases:['warning','active','post-active']}));
