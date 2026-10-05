'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),qa=JSON.parse(fs.readFileSync(path.join(root,'qa/rc133/art-processing.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');let checks=0;
function check(value,label){checks++;assert(value,label);}
check(qa.sources.length===6,'six original user images');for(const s of qa.sources){const b=fs.readFileSync(path.join(root,s.file));check(hash(b)===s.sha256&&b.length===s.bytes,'original preserved '+s.file);}
check(qa.outputs.length===44,'all actual cropped directional/VFX/Chrono/map frames');for(const r of qa.outputs){const b=fs.readFileSync(path.join(root,r.file));check(hash(b)===r.outputSha256&&b.length===r.outputBytes,'derivative provenance '+r.file);check(hash(fs.readFileSync(path.join(root,r.sourceFile)))===r.sourceSha256,'actual source identity '+r.file);if(/\/(?:base|awake)-\d\.png$/.test(r.file)){check(b.readUInt32BE(16)===344&&b.readUInt32BE(20)===400,'shared full-pose body canvas '+r.file);check(r.pivot?.normalized?.join(',')==='0.5,0.96','feet pivot '+r.file);}else if(/\/portrait\.png$/.test(r.file)){check(b.readUInt32BE(16)===224&&b.readUInt32BE(20)===400,'unchanged reveal portrait canvas '+r.file);}}
const body=qa.outputs.filter(r=>/\/(?:base|awake)-\d\.png$/.test(r.file));check(body.length===16,'eight base/eight awakening directions');check(new Set(body.map(r=>r.outputSha256)).size===16,'actual distinct directional pixel outputs');for(const r of body){check((r.sourceRect[1]>=62&&r.sourceRect[3]<=438)||(r.sourceRect[1]>=497&&r.sourceRect[3]<=884),'pose crop remains in its labeled source row '+r.file);check(r.pixelDerivation?.ownershipMaskFile===qa.personaOwnership?.maskFile,'per-frame ownership mask provenance '+r.file);}
check(qa.personaOwnership?.targetCanvasPx?.join(',')==='344,400','declared shared body dimensions');check(qa.personaOwnership?.uniformSourceScale?.join(',')==='1,1','no resampling of directional source pixels');check(hash(fs.readFileSync(path.join(root,qa.personaOwnership.maskFile)))===qa.personaOwnership.maskSha256,'ownership map bytes match manifest');
// Reconstruct Chrono pixels from the preserved atlas and recorded alpha masks.
// A hash alone cannot detect incorrect source bounds or misleading provenance.
const decode=file=>cp.execFileSync('ffmpeg',['-v','error','-i',path.join(root,file),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16e6});
const chrono=qa.outputs.filter(r=>/\/chrono-\d+\.png$/.test(r.file)),source=decode(chrono[0].sourceFile),sourceWidth=1254;
check(chrono.length===16,'sixteen reviewed Chrono crops');
for(const r of chrono){
 const d=r.pixelDerivation,index=Number(r.file.match(/chrono-(\d+)/)[1]),[sx,sy,ex,ey]=r.sourceRect,[w,h]=r.outputDimensions;
 check(d?.sourceRectConvention==='half-open'&&d.maskCoordinateSpace==='output-local'&&d.resize===null&&d.paddingPx.join(',')==='0,0,0,0','explicit crop/mask geometry '+r.file);
 check(ex-sx===w&&ey-sy===h,'crop preserves source pixel scale '+r.file);
 const expected=Buffer.alloc(w*h*4);for(let y=0;y<h;y++)source.copy(expected,y*w*4,((sy+y)*sourceWidth+sx)*4,((sy+y)*sourceWidth+ex)*4);
 for(const [x0,y0,x1,y1]of d.alphaOnlyRectMasks){check(x0>=0&&y0>=0&&x1<=w&&y1<=h&&x0<x1&&y0<y1,'bounded half-open alpha mask '+r.file);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)expected[(y*w+x)*4+3]=0;}
 const pixels=decode(r.file);check(pixels.equals(expected),'every derived RGBA pixel reconstructs from source and masks '+r.file);
 let left=w,top=h,right=-1,bottom=-1,edge=0,restored=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);if(x===0||y===0||x===w-1||y===h-1)edge++;if(y+sy<d.sourceCellRect[1])restored++;}
 const margins=[left,top,w-right-1,h-bottom-1];check(margins.join(',')===d.transparentMarginsPx.join(','),'measured crop margins match provenance '+r.file);
 if([4,9,10,12,13,14,15].includes(index))check(edge===0,'corrected crop has no boundary alpha '+r.file);
 if([12,13,14].includes(index)){check(restored>0,'upper effect pixels recovered beyond nominal cell '+r.file);check(Math.min(...margins)>=5,'complete recovered effect has transparent margin '+r.file);}
 if(index===12)check(d.alphaOnlyRectMasks.length===0,'hourglass center spire is retained without the prior polygon mask');
}
for(const r of qa.externalDerivatives??[]){if(r.file){const b=fs.readFileSync(path.join(root,r.file));check(hash(b)===(r.sha256??r.outputSha256),'generated derivative exact pixels');}}
const snippet=fs.readFileSync(root+'/assets/rc133/native-install.js.txt','utf8'),bundle=fs.readFileSync(root+'/assets/index-v31526.js','utf8');check(bundle.includes(snippet),'reviewable native snippet exactly synchronized');check(snippet.includes("? .72:radius.call(this,a)"),'humanoid core radius unchanged');check(snippet.includes("ctx.filter=transform?.hit?'brightness(2.2) contrast(0.85)':'brightness(1.8) contrast(0.8)'"),'hidden-only body readability precedes whole-arena mood; source alpha and geometry unchanged');check(snippet.includes("!\/laser|beam|ray|optic\/i.test(skill??'')"),'Chrono variation excludes approved beam signatures');
// Exercise the exact native URL adapter after the owned-image loader has removed
// registry query strings. Other assets and data/blob URLs retain their old URL.
const vm=require('node:vm'),urlAdapter=snippet.split('\n').find(line=>line.includes('const assetUrl=MONGSE_assetUrl;'));
check(!!urlAdapter,'native Chrono revision adapter is present');
const urlContext={window:{},MONGSE_assetUrl:p=>!p||/^(?:data:|blob:)/.test(p)?p:p+(p.includes('?')?'&':'?')+'v=31332'};vm.createContext(urlContext);vm.runInContext(urlAdapter,urlContext);
for(let i=0;i<16;i++)check(urlContext.MONGSE_assetUrl('./assets/rc133/art/chrono-'+i+'.png').endsWith('v=31332&rc133=43305'),'canonical native Chrono URL retains corrected pixel revision '+i);
for(const p of ['./assets/rc133/art/chrono-12.png?v=43305','assets/rc133/art/chrono-14.png'])check(urlContext.MONGSE_assetUrl(p).endsWith('&rc133=43305'),'registry and relative Chrono URLs preserve revision '+p);
for(const p of ['./assets/rc133/art/base-0.png','./assets/rc133/art/chrono-16.png','data:image/png;base64,abc','blob:fixture',null])check(urlContext.MONGSE_assetUrl(p)===(!p||/^(?:data:|blob:)/.test(p)?p:p+'?v=31332'),'unrelated native image URL unchanged '+p);
console.log('RC133_MEDIA_ART_RESULT',JSON.stringify({status:'passed',checks,sources:6,outputs:44,scope:'file/pixel identity, source-reconstructed Chrono crops and masks, recovered effect margins, label-excluding crops, common feet pivot and native code preservation; native renders run in rc133-browser'}));
