'use strict';
const fs=require('fs'),path=require('path'),acorn=require(process.env.RC132_MODULES+'/acorn'),prettier=require(process.env.RC132_MODULES+'/prettier');
(async()=>{const s=fs.readFileSync('assets/index-v31526.js','utf8'),ast=acorn.parse(s,{ecmaVersion:'latest',sourceType:'module'}),functions=[],assignments=[];
function walk(n){if(!n||typeof n!=='object')return;if(/Function/.test(n.type)&&n.body)functions.push(n);if(n.type==='AssignmentExpression'&&n.left?.type==='MemberExpression')assignments.push(n);for(const[k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v.type==='string')walk(v);}}walk(ast);
const out=path.join(process.env.HAPIL_QA_OUTPUT,'source-extra');fs.mkdirSync(out,{recursive:true});let index=[];
async function save(n,name){const key=name.replace(/[^a-zA-Z0-9_$-]/g,'_')+'-'+n.start+'.txt';let text=s.slice(n.start,n.end);try{text=await prettier.format(text,{parser:'babel'});}catch{}fs.writeFileSync(path.join(out,key),text);index.push({name,path:key,start:n.start,length:n.end-n.start});}
for(const n of functions){const name=n.id?.name||'';if(/defeat|death|clear|progress|portal|wrath|rc88/i.test(name)&&n.end-n.start<90000)await save(n,name);}
for(const term of ['__HAPIL_DANMAKU_RPG_RC88__','__HAPIL_RC95_NATIVE__']){const a=assignments.find(n=>n.left.property?.name===term);if(!a)continue;const f=functions.filter(f=>f.start<=a.start&&f.end>=a.end&&f.end-f.start<200000).sort((a,b)=>(a.end-a.start)-(b.end-b.start))[0];if(f)await save(f,term);else fs.writeFileSync(path.join(out,term+'.txt'),s.slice(a.start,a.end));}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2));})();
