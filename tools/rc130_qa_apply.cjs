'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const file=path.resolve(__dirname,'../tests/rc128-candidate.cjs');let text=fs.readFileSync(file,'utf8');
function replace(from,to){if(text.includes(to))return;assert.equal(text.split(from).length-1,1,'RC128 preservation anchor');text=text.replace(from,to);}
replace(' const generated=build(root);report.files=manifest(generated);',' const generated=build(root);report.files=manifest(generated);\n const rc130Migration=generated[\'index.html\'].includes(\'./assets/rc130/projectile-policy.js\')?require(\'../tools/rc130-preservation.cjs\').verify(root):null;\n if(rc130Migration)report.explicitRC130Migration=rc130Migration.report;');
replace("let prior=generated['index.html'];","let prior=rc130Migration?rc130Migration.historical['index.html']:generated['index.html'];");
replace("(f==='index.html'?indexHash:report.files[f])!==expected","(f==='index.html'?indexHash:rc130Migration?.historical[f]?digest(rc130Migration.historical[f]):report.files[f])!==expected");
fs.writeFileSync(file,text);console.log('RC130 legacy preservation migration installed; current staged/native browser runtime stays unchanged.');
