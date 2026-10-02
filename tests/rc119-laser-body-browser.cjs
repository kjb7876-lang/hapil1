const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const [name,software,lowFx]of [['gpu',false,false],['canvas',true,false],['mobile-lowFx',true,true]]){
 const page=await browser.newPage({viewport:{width:260,height:220},hasTouch:lowFx,isMobile:lowFx});
 if(software)await page.evaluate(()=>{const base=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:base.call(this,type,...args);};});
 await page.addScriptTag({path:path.resolve('assets/rc77/connected-laser.js')});
 const r=await page.evaluate(({lowFx})=>{const canvas=document.createElement('canvas');canvas.width=260;canvas.height=220;const ctx=canvas.getContext('2d'),art=document.createElement('canvas');art.width=256;art.height=128;const paint=art.getContext('2d');paint.fillStyle='#00ff00';paint.fillRect(0,0,256,128);const R=window.__HAPIL_CONNECTED_LASER_V31377__;
 const lines=[{a:{x:30,y:80},b:{x:130,y:80}},{a:{x:130,y:80},b:{x:230,y:80}},{a:{x:130,y:25},b:{x:130,y:80}},{a:{x:130,y:80},b:{x:130,y:145}}];
 R.render(ctx,lines,{width:14,complex:true,image:art,color:'#f12655',accent:'#ffe8ef',low:lowFx,alpha:1});
 R.render(ctx,[{a:{x:40,y:180},b:{x:220,y:180}}],{width:14,image:art,color:'#f12655',accent:'#ffe8ef',low:lowFx,alpha:1});
 const data=ctx.getImageData(0,0,260,220).data,alpha=(x,y)=>data[(y*260+x)*4+3];let poison=0;for(let i=0;i<data.length;i+=4)if(data[i+3]>20&&data[i+1]>data[i]+40)poison++;
 const scan=Array.from({length:29},(_,i)=>alpha(80,66+i));return{poison,cross:alpha(130,80),body:alpha(80,80),wideBody:alpha(80,85),edge:alpha(80,66),tip:alpha(40,180),maxEdgeStep:Math.max(...scan.slice(1).map((a,i)=>Math.abs(a-scan[i]))),png:canvas.toDataURL(),stats:R.stats()};},{lowFx});
 fs.mkdirSync('/workspace/hapil-deliverables/RC119-body',{recursive:true});fs.writeFileSync('/workspace/hapil-deliverables/RC119-body/'+name+'.png',Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
 assert.equal(r.poison,0,'opaque source rectangle leaked');assert(r.cross>200&&r.body>200&&r.wideBody>150,'full beam body/crossing gap');assert(r.edge<30&&r.tip<15,'safe edge/tip mask');assert(r.maxEdgeStep<50,'hard rectangular body edge');console.log(name,JSON.stringify(r));await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
