'use strict';
// Same read-only public assertions on a local exact checkout. This prepublication
// contract check is not evidence of Pages deployment or a natural full campaign.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results/rc133-public-contract'));fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname.replace(/^\/$/,'/index.html')));if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/',report={scope:'Local unchanged public-contract assertions; no Pages claim, no injected gameplay/save state',tests:[]};try{
 for(const suite of ['rc130/public-smoke','rc132/published']){const directory=path.join(out,suite);fs.mkdirSync(directory,{recursive:true});const args=['qa/'+suite+'.cjs'];
  const result=await new Promise(resolve=>{const child=cp.spawn(process.execPath,args,{cwd:root,env:{...process.env,HAPIL_TEST_BASE:base,HAPIL_QA_OUTPUT:directory},stdio:['ignore',fs.openSync(path.join(directory,'stdout.log'),'w'),fs.openSync(path.join(directory,'stderr.log'),'w')]});child.once('error',error=>resolve({code:null,error:String(error)}));child.once('exit',code=>resolve({code}));});
  const row={name:suite,...result,status:result.code===0?'passed':'failed'};report.tests.push(row);console.log('RC133_PUBLIC_CONTRACT',JSON.stringify(row));
 }
 report.status=report.tests.every(r=>r.status==='passed')?'passed':'failed';fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));assert.equal(report.status,'passed');
}finally{server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
