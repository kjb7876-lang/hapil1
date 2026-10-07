const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const output=process.env.RC119_BODY_OUTPUT||path.join(process.env.HAPIL_QA_OUTPUT||'/tmp','rc119-approved-art');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
(async()=>{const browser=await chromium.launch({chromiumSandbox: true, executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--disable-dev-shm-usage']});try{
 const baseline=execFileSync('git',['show','19a4c1f:assets/rc77/connected-laser.js'],{encoding:'utf8'}),current=fs.readFileSync('assets/rc77/connected-laser.js','utf8');
 for(const [name,software,lowFx]of [['gpu',false,false],['canvas',true,false],['mobile-lowFx',true,true]]){
 const page=await browser.newPage({viewport:{width:260,height:220},hasTouch:lowFx,isMobile:lowFx});
 if(software)await page.evaluate(()=>{const base=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:base.call(this,type,...args);};});
 const captures=[];
 for(const source of [baseline,current]){await page.addScriptTag({content:source});captures.push(await page.evaluate(({lowFx})=>{
 const canvas=document.createElement('canvas');canvas.width=260;canvas.height=220;const ctx=canvas.getContext('2d'),art=document.createElement('canvas');art.width=256;art.height=128;const paint=art.getContext('2d');paint.fillStyle='#ff35a6';paint.fillRect(0,0,256,128);const R=window.__HAPIL_CONNECTED_LASER_V31377__;
 const lines=[{a:{x:30,y:80},b:{x:130,y:80}},{a:{x:130,y:80},b:{x:230,y:80}},{a:{x:130,y:25},b:{x:130,y:80}},{a:{x:130,y:80},b:{x:130,y:145}}];
 R.render(ctx,lines,{width:14,complex:true,image:art,color:'#f12655',accent:'#ffe8ef',low:lowFx,alpha:1});
 R.render(ctx,[{a:{x:40,y:180},b:{x:220,y:180}}],{width:14,image:art,color:'#f12655',accent:'#ffe8ef',low:lowFx,alpha:1});
 const alpha=(x,y)=>ctx.getImageData(x,y,1,1).data[3],png=canvas.toDataURL();const cross=alpha(130,80),body=alpha(80,80),tip=alpha(40,180);
 ctx.clearRect(0,0,260,220);const empty=document.createElement('canvas');empty.width=256;empty.height=128;R.render(ctx,lines,{width:14,complex:true,image:empty,color:'#f12655',accent:'#ffe8ef',low:lowFx,alpha:1});
 const data=ctx.getImageData(0,0,260,220).data;let addedPixels=0;for(let i=3;i<data.length;i+=4)if(data[i])addedPixels++;return{cross,body,tip,addedPixels,png};},{lowFx}));}
 const [before,after]=captures;assert.equal(after.png,before.png,'authored beam differs from approved 19a4c1f style');assert.equal(after.addedPixels,0,'extra rectangle/body painted over transparent artwork');assert(after.cross>200&&after.body>200&&after.tip<15,'cross/body/tip regression');
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,name+'-restored.png'),Buffer.from(after.png.split(',')[1],'base64'));delete after.png;console.log(name,JSON.stringify({baselinePixelMatch:true,...after}));await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
