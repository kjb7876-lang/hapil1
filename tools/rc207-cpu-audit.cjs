'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const list=require('../qa/rc207/cpu-test-list.json'),out=path.join(process.env.RUNNER_TEMP||'/tmp','rc207-cpu');fs.mkdirSync(out,{recursive:true});
const sha=cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(sha,process.env.EXPECTED_SHA);assert.equal(new Set(list).size,51);
const report={sha,scope:'CPU/offline only; browser jobs and published checks are separate',rows:[]};
for(const file of list){const r=cp.spawnSync(process.execPath,[file],{encoding:'utf8',maxBuffer:24e6,timeout:900000});fs.writeFileSync(path.join(out,path.basename(file)+'.log'),(r.stdout||'')+'\n'+(r.stderr||''));report.rows.push({file,exitCode:r.status,error:r.error?String(r.error):null});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(file,r.status);if(r.status!==0||r.error)console.error(file+'\n'+(r.stdout||'').slice(-5000)+'\n'+(r.stderr||'').slice(-10000));}
assert(report.rows.every(r=>r.exitCode===0&&!r.error),'all51 CPU/offline checks must pass');
