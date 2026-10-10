'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),Art=require('../assets/rc155/ego-art.js'),E=require('../assets/rc155/ego-guardian.js');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);};
const expected=[['analysis_output_2_walk_dodge.png',1368283,'c29ca613f90f9d0beb43868db0e1f4074d9d2f87492502179eaa639e20bf33ab',[1774,404]],['analysis_output_1_attack.png',1537843,'93d4f9256d1e36b38ad1f44e3f0e0bfc418904c4011bd6b78f5fcf96ab16394b',[1774,456]],['916b1ac1-15ea-49dc-b3b0-f91ea1b8ef81.png',3357732,'526c4ec202505562204f0fd4614cf4f4c8494bfe4acf2ecd52f30a3e51f31724',[1536,1024]],['ego_samong_awaken_cutin.png',3414508,'f2b62df647f229d81578ac3ad945517d4797a5b5df1fa4497510a1f19c7c6c8e',[1024,1536]]];
const uploaded={name:'ChatGPT 이미지 2026년 10월 10일 오전 10_09_41.png',bytes:1098633,sha256:'967734b702056efdc6e2787dd93d7aaedd45753e3421cfa6c17340eb81c78476',dimensions:[1254,1254],alphaOnePixels:17744,alpha2Bounds:[304,167,1044,1120]},runtime={crop:[280,143,788,1001],dimensions:[788,1001],pivot:[104,977],coreHeight:961,thresholdedAlphaOne:16973,retainedAlpha2OrMore:358014},retainedPrior={name:'ego-walk-frame-3.png',bytes:305262,sha256:'ca972920758bd8d30c6d5652137304d44ae53ced9b76c709ef51bdeefa3dcf86',dimensions:[399,512],pivot:[44.8075,509.8689]};
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ego-originals-20261008/ASSET_MANIFEST.json')));
for(const [name,size,sha,dimensions]of expected){const b=fs.readFileSync(path.join(root,'assets/ego-originals-20261008',name)),row=manifest.files.find(r=>r.filename===name);eq(b.length,size,name+' exact original size');eq(crypto.createHash('sha256').update(b).digest('hex'),sha,name+' exact original SHA');eq([row.bytes,row.sha256],[size,sha],'source manifest pins '+name);eq([b.readUInt32BE(16),b.readUInt32BE(20)],dimensions,'PNG dimensions '+name);eq(b[25],6,'RGBA source '+name);}
const uploadedBytes=fs.readFileSync(path.join(root,uploaded.name)),uploadedRgba=cp.execFileSync('ffmpeg',['-v','error','-i',path.join(root,uploaded.name),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16*1024*1024});
eq(uploadedBytes.length,uploaded.bytes,'uploaded PNG remains byte-preserved');eq(crypto.createHash('sha256').update(uploadedBytes).digest('hex'),uploaded.sha256,'uploaded PNG SHA is pinned');eq([uploadedBytes.readUInt32BE(16),uploadedBytes.readUInt32BE(20)],uploaded.dimensions,'uploaded PNG dimensions');eq(uploadedBytes[25],6,'uploaded PNG is RGBA');
const sourceAlphaBounds=[uploaded.dimensions[0],uploaded.dimensions[1],-1,-1];let sourceAlphaOne=0;for(let p=3;p<uploadedRgba.length;p+=4){const a=uploadedRgba[p],pixel=Math.floor(p/4),x=pixel%uploaded.dimensions[0],y=Math.floor(pixel/uploaded.dimensions[0]);if(a===1)sourceAlphaOne++;if(a>=2){sourceAlphaBounds[0]=Math.min(sourceAlphaBounds[0],x);sourceAlphaBounds[1]=Math.min(sourceAlphaBounds[1],y);sourceAlphaBounds[2]=Math.max(sourceAlphaBounds[2],x+1);sourceAlphaBounds[3]=Math.max(sourceAlphaBounds[3],y+1);}}
eq(sourceAlphaOne,uploaded.alphaOnePixels,'alpha-1 residue count is audited before cleanup');eq(sourceAlphaBounds,uploaded.alpha2Bounds,'alpha-2 silhouette bounds pin the untrimmed source');
const [cropX,cropY,cropW,cropH]=runtime.crop,cropAlphaBounds=[cropW,cropH,-1,-1];let cropAlphaOne=0,cropAlpha2OrMore=0;for(let y=0;y<cropH;y++)for(let x=0;x<cropW;x++){const a=uploadedRgba[((cropY+y)*uploaded.dimensions[0]+cropX+x)*4+3];if(a===1)cropAlphaOne++;if(a>=2){cropAlpha2OrMore++;cropAlphaBounds[0]=Math.min(cropAlphaBounds[0],x);cropAlphaBounds[1]=Math.min(cropAlphaBounds[1],y);cropAlphaBounds[2]=Math.max(cropAlphaBounds[2],x+1);cropAlphaBounds[3]=Math.max(cropAlphaBounds[3],y+1);}}
eq(cropAlphaBounds,[24,24,764,977],'all four source crop edges retain a 24-pixel transparent border');eq(cropAlphaOne,runtime.thresholdedAlphaOne,'only alpha-1 source residue inside the crop needs cleanup');eq(cropAlpha2OrMore,runtime.retainedAlpha2OrMore,'all alpha-2-or-higher source pixels are counted for exact retention');eq([cropX+runtime.pivot[0],cropY+runtime.pivot[1]],[384,1120],'new crop preserves the source boot foot coordinate');
const retainedBytes=fs.readFileSync(path.join(root,'assets/rc156',retainedPrior.name)),runtimeManifest=JSON.parse(fs.readFileSync(path.join(root,'assets/rc156/ego-walk-frame-3.json')));
eq(retainedBytes.length,retainedPrior.bytes,'prior derived runtime PNG remains byte-preserved');eq(crypto.createHash('sha256').update(retainedBytes).digest('hex'),retainedPrior.sha256,'prior derived runtime PNG hash remains pinned');eq([retainedBytes.readUInt32BE(16),retainedBytes.readUInt32BE(20)],retainedPrior.dimensions,'prior derived runtime dimensions remain recorded');eq(runtimeManifest.sourceSha256,uploaded.sha256,'runtime crop provenance points to the uploaded source');eq(runtimeManifest.sourceAlphaBoundingBoxExclusive,uploaded.alpha2Bounds,'runtime crop source bounds are audited');eq(runtimeManifest.sourceAlphaOnePixels,uploaded.alphaOnePixels,'runtime crop records original low-alpha count');eq(runtimeManifest.runtimeSourceCropExclusive,[runtime.crop[0],runtime.crop[1],runtime.crop[0]+runtime.crop[2],runtime.crop[1]+runtime.crop[3]],'runtime crop uses the approved 24-pixel alpha-2 margin');eq(runtimeManifest.runtimePivot,runtime.pivot,'runtime crop foot pivot is pinned');eq(runtimeManifest.runtimeCoreHeight,runtime.coreHeight,'runtime body scale baseline is preserved');eq(runtimeManifest.runtimeCanvasPaddingPixels,0,'source padding is not duplicated on a second canvas');eq(runtimeManifest.retainedPriorRuntimeOutput.active,false,'prior derived PNG remains preserved but inactive');
eq(Art.assets().length,4,'four original EGO atlases remain preserved');eq(Art.runtimeAssets().length,5,'runtime adds only the isolated replacement frame');
let pixels=0;
for(const kind of ['walk','attack'])for(let i=0;i<8;i++){const f=Art.frame(kind,i),[x,y,w,h]=f.rect,expectedSize=f.path===Art.walkFrame3Path?uploaded.dimensions:kind==='walk'?[1774,404]:[1774,456];ok(x>=0&&x+w<=expectedSize[0]&&y+h<=expectedSize[1],'half-open crop stays in source');ok(f.pivot[0]>0&&f.pivot[0]<w&&f.pivot[1]<h&&f.pivot[1]>0,'feet stay within full body/weapon crop');ok(f.coreHeight>0&&f.coreHeight<=h,'body scale preserves aspect ratio');pixels+=w*h;}
for(const [name,[x,y,w,h]]of Object.entries(Art.crops)){ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024,'skill crop in source '+name);pixels+=w*h;}
ok(pixels*4<9*1024*1024,'all bounded derived frames use less than 9 MiB pixel backing');eq(Art.frame('walk',8),null,'invalid sector cannot alias a frame');eq(Art.frame('other',0),null,'invalid atlas fails closed');
const directions=[[1,-1,3],[1,1,0],[-1,1,2],[-1,-1,1],[0,-1,5],[1,0,7],[0,1,6],[-1,0,4]];
for(const [dx,dy,index]of directions)eq(Art.sector({dx,dy}),index,'native world-to-screen sector '+dx+','+dy);
eq(Art.frame('walk',3).path,Art.walkFrame3Path,'isolated upload replaces only walk column 04 / frame 3');eq(Art.frame('walk',3).flipX,true,'left-facing uploaded source is flipped for screen-right walk');eq(Art.frame('attack',3).flipX,true,'rightward attack remains direction-consistent through the pose transition');eq(Art.frame('walk',2).flipX,false,'screen-left walk keeps its original facing');
const active={egoGuardianRC155:{active:true},direction:'front'};eq(Art.selected(active,{kind:'dash'}).kind,'walk','dodge uses authored walk/dodge sheet');eq(Art.selected(active,{kind:'attack'}).kind,'attack','attack uses authored attack sheet');eq(Art.selected({},{}),null,'normal heroes keep their original art');
// A dark enclosed character feature is preserved while exterior neutral matte is removed.
const rgba=new Uint8ClampedArray(7*7*4);for(let i=0;i<49;i++){rgba[i*4]=30;rgba[i*4+1]=25;rgba[i*4+2]=25;rgba[i*4+3]=255;}
for(let y=1;y<=5;y++)for(let x=1;x<=5;x++){if(x===1||x===5||y===1||y===5){const i=(y*7+x)*4;rgba[i]=180;rgba[i+1]=40;rgba[i+2]=40;}}
const touching=new Uint8ClampedArray(7*7*4);for(let p=0;p<touching.length;p+=4){touching[p]=25;touching[p+1]=22;touching[p+2]=22;touching[p+3]=217;}const touchingBefore=touching.slice();Art.exteriorMatte({data:touching},7,7,[[2,0],[5,0],[5,6],[2,6]]);eq(Array.from(touching.slice((3*7+3)*4,(3*7+3)*4+4)),Array.from(touchingBefore.slice((3*7+3)*4,(3*7+3)*4+4)),'protected black anatomy touching the boundary survives unlike a blanket darkness flood');eq(touching[3],0,'explicit neutral exterior clears beside edge-touching anatomy');
eq(Art.clearMatte({data:rgba},7,7),24,'flood removes only edge-connected matte');eq(rgba[(3*7+3)*4+3],255,'enclosed black cloth stays opaque');eq(rgba[3],0,'outer background becomes transparent');eq(rgba[(1*7+1)*4+3],255,'red outline stays opaque');
const native=fs.readFileSync(path.join(root,'assets/rc133/native-install.js.txt'),'utf8'),bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
// Execute the native projection used by dash afterimages. The incomplete old
// fixture produced NaN offsets, which Canvas ignores rather than translating
// to the hero. This proves the fixture defect without weakening containment.
const vectorStart=bundle.indexOf('function Cn(e, t) {'),vectorEnd=bundle.indexOf('\nfunction wn(',vectorStart),vectors={};
ok(vectorStart>=0&&vectorEnd>vectorStart,'native world projection has explicit boundaries');
vm.runInNewContext(bundle.slice(vectorStart,vectorEnd)+';this.project=Cn;',vectors);
const incomplete={dx:0,dy:-1},invalid=vectors.project(incomplete.dx||incomplete.facing,incomplete.dy);
ok(!Number.isFinite(invalid.x)&&!Number.isFinite(invalid.y),'missing native facing reproduces the invalid afterimage fixture');
for(const kind of ['move','dash','attack'])for(const [dx,dy]of directions){const motion={kind,dx,dy,facing:dx-dy<0?-1:1},p=vectors.project(motion.dx||motion.facing,motion.dy);ok(Number.isFinite(p.x)&&Number.isFinite(p.y),'complete native fixture projects finite '+kind+' '+dx+','+dy);}
const browserFixture=fs.readFileSync(path.join(root,'tests/rc155-ego-browser.cjs'),'utf8');
ok(browserFixture.includes('dx,dy,facing:dx-dy<0?-1:1,phase:1000'),'all browser direction fixtures retain the native facing field');
for(const hook of ['Art()?.present(canvas,s)','Art()?.drawBody(ctx,path,x,y,size,o,G)','Art().withSkill(S(),e,()=>egoFx.call(this,ctx,cache,e,time,settings))','Art()?.assets()'])ok(native.includes(hook),'native transaction/presentation hook '+hook);
ok(bundle.includes('window.__HAPIL_EGO_ART_RC155__?.sprite(t,te) ?? Tn(ee, te, t.time)'),'only the main player sprite uses transformed art');ok(html.includes('assets/rc155/ego-art.js?v=15605'),'normal runtime loads EGO art');
const s={zone:'cult04'};E.recordPersonaVictory(s);eq(E.state(s).cutInPending,false,'victory frame does not start cut-in');eq(E.consumeCutIn(s),false,'untransformed victory cannot consume cut-in');
async function presentationChecks(){
 const decodedSources=new Map();
 class SourceImage{set src(value){this._src=value;const local=value.split('?')[0],file=path.join(root,local),name=path.basename(local),row=expected.find(r=>r[0]===name)??(name===uploaded.name?[uploaded.name,uploaded.bytes,uploaded.sha256,uploaded.dimensions]:null);assert.ok(row,'unexpected runtime image '+value);[this.naturalWidth,this.naturalHeight]=row[3];this.rgba=cp.execFileSync('ffmpeg',['-v','error','-i',file,'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16*1024*1024});eq(this.rgba.length,this.naturalWidth*this.naturalHeight*4,'real source RGBA decode '+row[0]);decodedSources.set(value,this);this.complete=true;this.onload?.();}get src(){return this._src;}}
 const window={Image:SourceImage,document:{hidden:false},__HAPIL_EGO_GUARDIAN_RC155__:E,__HAPIL_ORIENTATION_PAUSE_RC152__:{paused:()=>false}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/rc155/ego-art.js'),'utf8'),{window});const A=window.__HAPIL_EGO_ART_RC155__;await A.ensure({egoGuardianRC155:{active:true}});
 window.document.createElement=tag=>{assert.equal(tag,'canvas');const cv={width:0,height:0};cv.getContext=()=>({drawImage(im,x,y,w,h,dx,dy,dw,dh){assert.equal(dx,0);assert.equal(dy,0);assert.equal(dw,w);assert.equal(dh,h);cv.rgba=Buffer.alloc(w*h*4);for(let yy=0;yy<h;yy++)im.rgba.copy(cv.rgba,yy*w*4,((y+yy)*im.naturalWidth+x)*4,((y+yy)*im.naturalWidth+x+w)*4);},getImageData:()=>({data:new Uint8ClampedArray(cv.rgba)}),putImageData(data){cv.rgba=Buffer.from(data.data);}});return cv;};
 // Actual source pixels traverse the real picture() crop/mask path. Copying the
 // atlas bytes is insufficient if a later RGB heuristic deletes dark anatomy.
 const cropTokens=[...['walk','attack'].flatMap(k=>Array.from({length:8},(_,i)=>'ego155:'+k+':'+i)),...Object.keys(A.crops).map(k=>'ego155:skill:'+k)];
 for(const token of cropTokens){
  const parts=token.split(':'),f=parts[1]==='skill'?{path:A.paths.skills,rect:A.crops[parts[2]]}:A.frame(parts[1],Number(parts[2])),im=decodedSources.get(f.path);
  ok(im,`decoded image source exists ${token}`);
  const [x,y,w,h]=f.rect,crop=Buffer.alloc(w*h*4);
  for(let yy=0;yy<h;yy++)im.rgba.copy(crop,yy*w*4,((y+yy)*im.naturalWidth+x)*4,((y+yy)*im.naturalWidth+x+w)*4);
  const rendered=A.picture(token);ok(rendered,'real source crop exists '+token);
  if(parts[1]==='skill')eq(rendered.rgba,crop,'unchanged skill source RGBA '+token);
  else if(f.isolated){
   const expectedCrop=Buffer.from(crop);let thresholded=0,retained=0;for(let p=3;p<expectedCrop.length;p+=4){if(expectedCrop[p]<2){if(expectedCrop[p])thresholded++;expectedCrop[p]=0;}else retained++;}eq(rendered.rgba,expectedCrop,'runtime crop keeps every alpha-2-or-higher RGBA pixel exact');eq(retained,runtime.retainedAlpha2OrMore,'isolated runtime frame contains the exact retained shape pixel count');
   eq(rendered.egoAlphaThresholdRC156,2,'isolated frame applies the reviewed alpha threshold');
   eq(rendered.egoThresholdedAlphaPixelsRC156,thresholded,'only source pixels below alpha 2 are cleared');
   eq(rendered.egoFlipXRC156,true,'isolated left-facing source is mirrored at the render boundary');
   eq(rendered.egoSourceAlphaPreservedRC155,false,'normalization reports the limited alpha-1 cleanup');eq(rendered.egoRetainedRGBAExactRC156,true,'all retained source RGBA pixels remain exact');
  }else{
   let changed=0,invalid=0,lostBright=0,retainedDark=0;
   for(let p=0;p<crop.length;p+=4){
    const hi=Math.max(crop[p],crop[p+1],crop[p+2]),lo=Math.min(crop[p],crop[p+1],crop[p+2]);
    if(rendered.rgba[p]!==crop[p]||rendered.rgba[p+1]!==crop[p+1]||rendered.rgba[p+2]!==crop[p+2]||rendered.rgba[p+3]!==crop[p+3]&&rendered.rgba[p+3]!==0)invalid++;
    if(rendered.rgba[p+3]!==crop[p+3])changed++;
    const xx=(p/4)%w,yy=Math.floor(p/4/w),px=x+xx+.5,py=y+yy+.5,cell=f.cellRect,core=A.inPolygon(px-cell[0],yy+.5,A.cores[f.kind][f.index]),own=A.weaponRegions[f.kind][f.index],isOwn=own&&A.inPolygon(px,py,own),foreign=Object.entries(A.weaponRegions[f.kind]).some(([i,poly])=>Number(i)!==f.index&&A.inPolygon(px,py,poly)),allowed=core||isOwn||px>=cell[0]&&px<cell[0]+cell[2]&&!foreign;
    if(allowed&&crop[p+3]>0&&hi>=160&&rendered.rgba[p+3]===0)lostBright++;
    if(crop[p+3]>0&&hi<91&&hi-lo<27&&rendered.rgba[p+3]===crop[p+3])retainedDark++;
   }
   eq(invalid,0,'only authorized exterior alpha is cleared; every RGB and retained alpha is exact '+token);
   eq(lostBright,0,'owned bright sword/feather/hood source pixels cannot be deleted '+token);
   ok(retainedDark>100,'black anatomy survives the actual compositor '+token);
   ok(changed>w*h*.25&&changed<w*h*.65,'neutral exterior rectangle is removed without discarding most of the person '+token);
   eq(rendered.rgba[3],0,'top-left exterior matte clears '+token);
   eq(rendered.rgba[(w-1)*4+3],0,'top-right exterior matte clears '+token);
   eq(rendered.egoSourceAlphaPreservedRC155,false,'mask metadata records authorized exterior cleanup '+token);
   eq(rendered.egoRetainedRGBAExactRC156,true,'retained source RGBA metadata '+token);
  }
  eq(Array.from(rendered.egoSourceRectRC155),Array.from(f.rect),'source crop metadata matches original pixels '+token);
 }

 // The isolated frame is already cropped from the approved upload; atlas
 // ownership polygons must not erase its body, sword, or cape.
 for(const kind of ['walk','attack'])for(let index=0;index<8;index++){
  const f=A.frame(kind,index),[x,y,w,h]=f.rect,im=decodedSources.get(f.path),cv=A.picture('ego155:'+kind+':'+index);
  if(f.isolated){
   const [sx,sy,sw,sh]=f.rect,expectedCrop=Buffer.alloc(sw*sh*4);for(let yy=0;yy<sh;yy++)im.rgba.copy(expectedCrop,yy*sw*4,((sy+yy)*im.naturalWidth+sx)*4,((sy+yy)*im.naturalWidth+sx+sw)*4);let thresholded=0;for(let p=3;p<expectedCrop.length;p+=4)if(expectedCrop[p]<2){if(expectedCrop[p])thresholded++;expectedCrop[p]=0;}eq(cv.rgba,expectedCrop,'isolated frame retains exact cropped source RGBA except alpha below 2');eq(thresholded,runtime.thresholdedAlphaOne,'frame threshold removes only audited alpha-1 residue');
   eq(f.flipX,true,'right-facing frame uses the audited horizontal flip');
   eq(f.coreHeight,runtime.coreHeight,'isolated frame keeps the approved body scale');
   eq([f.rect[0]+f.pivot[0],f.rect[1]+f.pivot[1]],[384,1120],'isolated frame foot pivot maps to the preserved original source');
   continue;
  }
  let lostCore=0,recoveredBright=0,foreignRetained=0;
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
   const sx=x+xx,sy=y+yy,p=(yy*w+xx)*4,source=((sy*im.naturalWidth+sx)*4),isCore=A.inPolygon(sx-f.cellRect[0]+.5,yy+.5,A.cores[kind][index]),own=A.weaponRegions[kind][index],isOwn=own&&A.inPolygon(sx+.5,sy+.5,own),foreign=Object.entries(A.weaponRegions[kind]).some(([i,poly])=>Number(i)!==index&&A.inPolygon(sx+.5,sy+.5,poly));
   if(isCore&&!cv.rgba.subarray(p,p+4).equals(im.rgba.subarray(source,source+4)))lostCore++;
   if(!isCore&&!isOwn&&foreign&&cv.rgba[p+3])foreignRetained++;
   if(isOwn&&(sx<f.cellRect[0]||sx>=f.cellRect[0]+f.cellRect[2])&&(Math.max(...im.rgba.subarray(source,source+3))>=91||Math.max(...im.rgba.subarray(source,source+3))-Math.min(...im.rgba.subarray(source,source+3))>=27)&&cv.rgba.subarray(p,p+4).equals(im.rgba.subarray(source,source+4)))recoveredBright++;
  }
  eq(lostCore,0,'all source anatomy pixels survive '+kind+index);
  eq(foreignRetained,0,'known neighbouring weapon pixels are excluded '+kind+index);
  if(A.weaponRegions[kind][index])ok(recoveredBright>0,'visible source weapon pixels pass the unchanged matte foreground barrier beyond the former cell '+kind+index);
  const oldCell=[0,221,443,665,887,1109,1331,1552][index],oldPivot=(kind==='walk'?[110,109,67,116,71,86,96,124]:[98,95,81,85,96,100,30,126])[index];
  eq(f.rect[0]+f.pivot[0],oldCell+oldPivot,'crop expansion retains independent baseline supporting foot '+kind+index);
  eq(f.coreHeight,kind==='walk'?276:309,'crop does not reduce the existing body scale '+kind+index);
 }

 // Fifteen untouched direction/action masks stay byte-identical to the
 // preserved candidate. A boot repair cannot silently change another pose.
 const priorWindow={Image:SourceImage,document:window.document};
 vm.runInNewContext(cp.execFileSync('git',['show','e1111aa8b3930d3d13f4e9b1218b500dbfa164a0:assets/rc155/ego-art.js'],{cwd:root,encoding:'utf8'}),{window:priorWindow});
 const priorArt=priorWindow.__HAPIL_EGO_ART_RC155__;await priorArt.ensure({egoGuardianRC155:{active:true}});
 for(const kind of ['walk','attack'])for(let i=0;i<8;i++)if(kind!=='walk'||i!==3)eq(A.picture('ego155:'+kind+':'+i).rgba,priorArt.picture('ego155:'+kind+':'+i).rgba,'unaffected real compositor RGBA '+kind+i);
 // The replacement foot anchor sits on the visible supporting boot, and
 // render-time mirroring leaves that pivot fixed while turning the sword/cape.
 const rightWalk=A.picture('ego155:walk:3'),rightFrame=A.frame('walk',3),supportX=Math.round(rightFrame.pivot[0]),supportY=Math.floor(rightFrame.pivot[1]);
 let supportingBoot=0;for(let y=supportY-3;y<=supportY;y++)for(let x=supportX-6;x<=supportX+8;x++)if(rightWalk.rgba[(y*rightWalk.width+x)*4+3]>=2)supportingBoot++;
 ok(supportingBoot>10,'actual isolated boot pixels surround the foot pivot');
 const drawOps=[],drawCtx={globalAlpha:1,save(){drawOps.push(['save']);},restore(){drawOps.push(['restore']);},translate(x,y){drawOps.push(['translate',x,y]);},scale(x,y){drawOps.push(['scale',x,y]);},drawImage(im,x,y,w,h){drawOps.push(['draw',im,x,y,w,h]);}};
 ok(A.drawBody(drawCtx,'ego155:walk:3',1,2,90,{},()=>({x:100,y:200})),'actual EGO renderer accepts the isolated walk frame');
 eq(drawOps.find(r=>r[0]==='scale'),['scale',-1,1],'screen-right walk applies one horizontal flip');
 const renderedWalk=drawOps.find(r=>r[0]==='draw'),visibleBounds=[24,24,764,977],scale=90/rightFrame.coreHeight;eq(renderedWalk[1],rightWalk,'actual draw uses the isolated processed image');ok(Math.abs((visibleBounds[3]-visibleBounds[1])*scale-508*90/512)<1,'visible body height matches the previous 399x512 output within one pixel');ok(Math.abs(renderedWalk[3]+rightFrame.pivot[1]*scale)<.001,'draw origin remains relative to the source-space pivot');ok(Math.abs(renderedWalk[3]+visibleBounds[3]*scale)<.001,'visible supporting foot remains at the same world anchor');
 drawOps.length=0;ok(A.drawBody(drawCtx,'ego155:attack:3',1,2,90,{},()=>({x:100,y:200})),'actual EGO renderer accepts the rightward attack frame');eq(drawOps.find(r=>r[0]==='scale'),['scale',-1,1],'rightward attack keeps the same facing through pose change');
 drawOps.length=0;ok(A.drawBody(drawCtx,'ego155:walk:2',1,2,90,{},()=>({x:100,y:200})),'actual EGO renderer accepts the screen-left frame');eq(drawOps.some(r=>r[0]==='scale'),false,'leftward frame is not mirrored');

 for(const [kind,frames]of Object.entries(A.anatomyRegions))for(const [index,regions]of Object.entries(frames)){
  const f=A.frame(kind,Number(index)),im=decodedSources.get(f.path),cv=A.picture('ego155:'+kind+':'+index);let preserved=0;
  for(let yy=0;yy<cv.height;yy++)for(let xx=0;xx<cv.width;xx++)if(regions.some(p=>A.inPolygon(f.rect[0]+xx+.5,f.rect[1]+yy+.5,p))){
   const source=((f.rect[1]+yy)*im.naturalWidth+f.rect[0]+xx)*4,dest=(yy*cv.width+xx)*4;
   assert(cv.rgba.subarray(dest,dest+4).equals(im.rgba.subarray(source,source+4)),'new anatomical silhouette pixel lost '+kind+index+' '+xx+','+yy);preserved++;
  }
  ok(preserved>1000,'whole bounded anatomy regions are protected, beyond four sampled pixels');
 }
 eq(A.diagnostics().maskedCanvases,15,'fifteen atlas frames use the protected exterior mask');eq(A.diagnostics().normalizedCanvases,1,'one isolated frame uses thresholded alpha normalization');eq(A.diagnostics().croppedCanvases,25,'all sixteen bodies and nine effects retain full source ranges');eq([A.diagnostics().decoded,A.diagnostics().required],[5,5],'all four original sheets and the replacement decode');
 for(const [token,px,py,expectedRGBA]of[['ego155:walk:6',95,281,[70,53,54,251]],['ego155:walk:6',110,35,[59,48,47,251]],['ego155:attack:6',30,316,[53,19,17,252]],['ego155:attack:6',93,160,[30,13,14,252]]]){const cv=A.picture(token),f=A.frame(token.split(':')[1],Number(token.split(':')[2])),offset=(py*cv.width+px+f.cellOffset)*4;eq(Array.from(cv.rgba.subarray(offset,offset+4)),expectedRGBA,'actual source black hood/armour/boot landmark remains exact '+token+' '+px+','+py);}
 eq([A.frame('walk',6).rect[0]+A.frame('walk',6).pivot[0],A.frame('walk',6).pivot[1]],[1331+96,290],'walk6 uses the actual supporting boot shown in source pixel audit');eq([A.frame('attack',6).rect[0]+A.frame('attack',6).pivot[0],A.frame('attack',6).pivot[1]],[1331+30,328],'attack6 uses the low supporting boot instead of the cloak centre');
 const outerLandmarks={clock:[[951,230]],star:[[1080,202]],eclipse:[[1278,480],[1200,650]],shield:[[648,480]],vortex:[[1350,219],[1480,370]]};
 for(const [kind,points]of Object.entries(outerLandmarks)){const token='ego155:skill:'+kind,im=decodedSources.get(A.paths.skills),cv=A.picture(token),[x,y,w,h]=A.crops[kind];for(const [px,py]of points){ok(px>=x&&px<x+w&&py>=y&&py<y+h,'authored outer effect landmark is contained '+kind);const sourceOffset=(py*im.naturalWidth+px)*4,destOffset=((py-y)*w+px-x)*4;ok(im.rgba[sourceOffset+3]>0,'outer landmark has actual source alpha '+kind);eq(Array.from(cv.rgba.subarray(destOffset,destOffset+4)),Array.from(im.rgba.subarray(sourceOffset,sourceOffset+4)),'effect tail/glow preserves original RGBA '+kind);}}
 const ownerState={activeHeroId:'hwando',egoGuardianRC155:{active:true}},mainEffect={heroSkillVfx:true,heroIdV31225:'hwando',skillActionKey:'q',sprite:'original'};
 // Execute the real legacy tint function. Authenticated EGO crops must survive
 // the native renderer without a palette change or lost source token; arbitrary
 // metadata does not exempt an unrelated bitmap from normal hero treatment.
 const tintStart=bundle.indexOf(' function tinted(image,id,cloth=false){'),tintEnd=bundle.indexOf(' function context(ctx,id,cloth=false)',tintStart);
 ok(tintStart>=0&&tintEnd>tintStart,'actual native tint function has explicit boundaries');
 let tintCanvases=0;const tintWindow={__HAPIL_EGO_ART_RC155__:A},tintStats={tints:0,evictions:0,errors:0};
 const tintScope={window:tintWindow,tags:new WeakMap(),meta:new WeakMap(),tints:new Map(),stats:tintStats,usedPixels:0,MAX_ENTRIES:8,MAX_PIXELS:1024*1024,has:id=>id==='hwando',num:(v,f)=>Number.isFinite(Number(v))?Number(v):f,rgb:()=>[255,0,0],clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),document:{createElement:()=>{tintCanvases++;const cv={width:0,height:0};cv.getContext=()=>({drawImage(im){cv.original=im;},getImageData:()=>({data:new Uint8ClampedArray([200,150,100,255])}),putImageData(data){cv.rgba=Array.from(data.data);}});return cv;}}};
 vm.runInNewContext(bundle.slice(tintStart,tintEnd)+';this.tint=tinted;',tintScope);
 const egoImage=A.picture('ego155:skill:small-orb');ok(egoImage,'real derived uploaded crop is decoded');
 // Exercise the actual native raster selector and fallback dispatcher, rather
 // than merely checking the outer EGO sprite scope. Legacy extension filtering
 // must not discard an authenticated decoded crop before its visible draw.
 const chooseStart=bundle.indexOf('  function chooseDecoded(cache, candidates, role = "effect")'),chooseEnd=bundle.indexOf('\n  function pinPath(',chooseStart);
 const rasterStart=bundle.indexOf('    Gn = function HAPIL_drawEffectRasterV31305('),rasterEnd=bundle.indexOf('\n    };',rasterStart)+7;
 ok(chooseStart>=0&&chooseEnd>chooseStart&&rasterStart>=0&&rasterEnd>rasterStart,'actual native raster boundaries are present');
 const rasterCalls=[],queueCalls=[],rasterRoles=new Map(),fallback='legacy-impact.webp',rasterScope={window:{__HAPIL_EGO_ART_RC155__:A},uniquePaths:rows=>[...new Set(rows.filter(p=>/\.(?:png|webp)$/.test(p)))],isImagePath:p=>typeof p==='string'&&/\.(?:png|webp)$/.test(p),isDecoded:im=>!!im?.complete&&im.naturalWidth>0&&im.naturalHeight>0,lastGoodByRole:rasterRoles,queueImageIntegrity:(cache,p)=>{queueCalls.push(p);return cache[p];},objectCandidates:()=>[fallback],noteSuppressed(){},fallbackEffectDraws:0,effectBase:(ctx,cache,e)=>{rasterCalls.push({sprite:e.sprite,image:A.owns(e.sprite)?A.picture(e.sprite):cache[e.sprite]});}};
 vm.runInNewContext(bundle.slice(chooseStart,chooseEnd)+'\n'+bundle.slice(rasterStart,rasterEnd),rasterScope);
 const rasterCache={[fallback]:plainDecoded()},rasterEffect={...mainEffect};
 A.withSkill(ownerState,rasterEffect,()=>rasterScope.Gn({},rasterCache,rasterEffect,100));
 eq(rasterCalls[0].sprite,'ego155:skill:small-orb','actual raster dispatcher draws the uploaded Q crop before any legacy fallback');eq(rasterCalls[0].image,egoImage,'actual raster selection keeps the authenticated decoded crop identity');eq(rasterEffect.fallbackBitmapRenderedV31305,false,'successful authored selection is recorded as primary');eq(rasterScope.fallbackEffectDraws,0,'visible Q cannot silently become the old phantom-blade bitmap');eq(queueCalls.length,0,'synthetic authored token never starts an HTTP image fetch');eq(rasterEffect.sprite,'original','native scoped draw restores original producer metadata');
 rasterScope.Gn({},rasterCache,{sprite:fallback},100);eq(rasterCalls[1].sprite,fallback,'ordinary raster draw still uses the original native cache');eq(queueCalls.at(-1),fallback,'ordinary paths retain native retry/queue policy');
 rasterScope.Gn({},rasterCache,{sprite:'ego155:skill:unowned'},100);eq(rasterCalls[2].sprite,fallback,'unowned synthetic token retains the native decoded fallback');ok(!queueCalls.includes('ego155:skill:unowned'),'unowned token is never treated as an HTTP asset');
 rasterScope.window.__HAPIL_EGO_ART_RC155__={owns:A.owns,picture:()=>null};rasterScope.Gn({},rasterCache,{sprite:'ego155:skill:small-orb'},100);eq(rasterCalls[3].sprite,fallback,'undecoded authored crop retains fail-closed native fallback');
 function plainDecoded(){return {complete:true,naturalWidth:1,naturalHeight:1};}
 eq(tintScope.tint(egoImage,'hwando'),egoImage,'authenticated EGO skill stays the original derived bitmap');eq(tintScope.tint(egoImage,'hwando',true),egoImage,'cloth pass cannot recolor authored EGO artwork');eq(tintCanvases,0,'authentic EGO bypass performs no legacy pixel copy');
 const spoof={egoTokenRC155:egoImage.egoTokenRC155,src:egoImage.src,complete:true,naturalWidth:1,naturalHeight:1},spoofOutput=tintScope.tint(spoof,'hwando');ok(spoofOutput!==spoof,'copied token cannot claim authenticated EGO ownership');eq(spoofOutput.original,spoof,'untrusted bitmap still traverses the actual tint path');ok(spoofOutput.rgba[0]>0&&spoofOutput.rgba[1]===0&&spoofOutput.rgba[2]===0,'normal hero palette transformation remains functional');
 const plain={src:'normal-hero.png',complete:true,naturalWidth:1,naturalHeight:1},plainOutput=tintScope.tint(plain,'hwando');ok(plainOutput!==plain&&plainOutput.rgba[1]===0,'normal hero art remains tinted');eq(tintScope.tint(plain,'unknown-hero'),plain,'other owner policy remains unchanged');eq(tintStats.errors,0,'native tint test completes without swallowed renderer errors');
 // The native cached context captures drawImage at construction time. A late
 // prototype hook misses its calls; the browser audit must install before boot.
 const {installDrawAudit}=require('./helpers/rc155-draw-audit.cjs'),gameCanvas={width:1280,height:720,getBoundingClientRect:()=>({width:844,height:390})},auditWindow={__RC155_BITMAP_CAPTURE__:[],__HAPIL_CONTROLS_V31329__:{binding:{state:{current:{time:101}}}}};let nativeDraws=0,lateDraws=0;
 function NativeContext(canvas){this.canvas=canvas;this.globalAlpha=1;}
 NativeContext.prototype.drawImage=function(){nativeDraws++;};NativeContext.prototype.getTransform=()=>({a:1,b:0,c:0,d:1,e:0,f:0});
 vm.runInNewContext('('+installDrawAudit.toString()+')();',{window:auditWindow,document:{querySelector:()=>gameCanvas},CanvasRenderingContext2D:NativeContext});
 const contextStart=bundle.indexOf(' function context(ctx,id,cloth=false)'),contextEnd=bundle.indexOf('\n function ',contextStart+30);
 ok(contextStart>=0&&contextEnd>contextStart,'native cached context function is present');
 const auditScope={...tintScope,views:new WeakMap(),ink:v=>v};vm.runInNewContext(bundle.slice(contextStart,contextEnd)+';this.view=context;',auditScope);
 const rawContext=new NativeContext(gameCanvas),cachedContext=auditScope.view(rawContext,'hwando'),earlyHook=NativeContext.prototype.drawImage;
 NativeContext.prototype.drawImage=function(...args){lateDraws++;return earlyHook.apply(this,args);};cachedContext.drawImage(egoImage,0,0,52,61);
 eq(lateDraws,0,'late prototype hook demonstrably misses cached native draws');eq(nativeDraws,1,'cached renderer still invokes the real native draw');eq(auditWindow.__RC155_BITMAP_CAPTURE__.length,1,'early installed audit captures the actual cached game draw');eq(auditWindow.__RC155_BITMAP_CAPTURE__[0].token,egoImage.egoTokenRC155,'early capture retains uploaded crop identity');eq(auditWindow.__RC155_BITMAP_CAPTURE__[0].at,101,'early capture records the native simulation timestamp');
 eq(auditWindow.__RC155_BITMAP_CAPTURE__[0].sourceAlphaPreserved,true,'real game draw carries the original-alpha crop identity');const destination=auditWindow.__RC155_BITMAP_CAPTURE__[0].destination;eq(destination.corners.length,4,'actual canvas transform records all four destination corners');ok(destination.left===0&&destination.top===0&&destination.right<844&&destination.bottom<390,'actual draw bounds are expressed in CSS pixels independently of DPR/backing size');
 const offscreen=new NativeContext({width:52,height:61});offscreen.drawImage(egoImage,0,0,52,61);eq(auditWindow.__RC155_BITMAP_CAPTURE__.length,1,'offscreen crop/tint copies do not count as visible skill presentation');cachedContext.drawImage(plain,0,0,1,1);eq(auditWindow.__RC155_BITMAP_CAPTURE__.length,1,'normal hero image does not masquerade as an EGO crop');
 const nativeLaunch={heroSkillVfx:true,deliverySeedV31322:{heroId:'hwando',key:'Q'},sprite:'native-q'};
 eq(A.skillSprite(ownerState,nativeLaunch),'ego155:skill:small-orb','actual queued launch metadata selects the Q source before contact');eq(A.skillSprite(ownerState,{heroSkillVfx:true,deliveryHeroV31322:'hwando',deliveryKeyV31322:'W'}),'ego155:skill:clock','actual routed launch metadata selects its authored source');eq(A.skillSprite(ownerState,{...nativeLaunch,partySlotV31322:'ally-1'}),null,'queued ally cannot borrow the main EGO artwork');eq(A.skillSprite(ownerState,{...nativeLaunch,heroId31213:'gunner'}),null,'conflicting explicit owner is not quietly replaced by delivery metadata');
 eq(A.skillSprite(ownerState,mainEffect),'ego155:skill:small-orb','native melee ownership/action fields select the uploaded EGO skill');eq(A.skillSprite(ownerState,{heroSkillVfx:true,heroId31213:'hwando',heroActionKey31213:'W'}),'ego155:skill:clock','native projectile fields retain their uploaded mapping');eq(A.skillSprite(ownerState,{...mainEffect,partySlotV31322:'ally-1'}),null,'companion skill keeps its own artwork');eq(A.skillSprite(ownerState,{...mainEffect,heroIdV31225:'gunner'}),null,'a different hero cannot inherit the main EGO skill');eq(A.skillSprite(ownerState,{...mainEffect,heroSkillVfx:false}),null,'boss/environment effects cannot inherit EGO art');eq(A.withSkill(ownerState,mainEffect,()=>mainEffect.sprite),'ego155:skill:small-orb','native draw scope receives the uploaded source token');eq(mainEffect.sprite,'original','temporary visual selection restores source metadata');
 for(const [w,h]of [[1280,900],[844,390],[667,300],[844,240]])for(const dpr of [1,2]){
  const state={hp:240,time:100,egoGuardianRC155:{active:true,cutInPending:true,cutInSerial:1}},draws=[],panels=[],stack=[];
  const ctx={matrix:[dpr,0,0,dpr,0,0],filter:'brightness(2)',globalCompositeOperation:'multiply',globalAlpha:.5,save(){stack.push({matrix:this.matrix.slice(),filter:this.filter,globalCompositeOperation:this.globalCompositeOperation,globalAlpha:this.globalAlpha});},restore(){Object.assign(this,stack.pop());},setTransform(...args){this.matrix=args;},drawImage(im,x,y,width,height){draws.push({im,x,y,width,height,matrix:this.matrix.slice()});},fillRect(x,y,width,height){panels.push({x,y,width,height});},fillText(){},measureText:t=>({width:t.length*12})};
  const canvas={width:1280*dpr,height:720*dpr,getContext:()=>ctx,getBoundingClientRect:()=>({width:w,height:h})};
  ok(A.present(canvas,state),'cut-in presents on live CSS viewport');const image=draws[0],cssW=image.width*image.matrix[0]*w/canvas.width,cssH=image.height*image.matrix[3]*h/canvas.height;
  ok(Math.abs(cssW/cssH-1024/1536)<1e-12,'original cut-in aspect survives backing/CSS/DPR '+w+'x'+h+'@'+dpr);ok(cssW<=w*.42+1e-8&&cssH<=h*.88+1e-8,'cut-in contains the complete original person');ok(panels.every(p=>image.x+image.width<=p.x||p.x+p.width<=image.x||image.y+image.height<=p.y||p.y+p.height<=image.y),'cut-in text panel cannot cover the original legs/weapon/body');eq(ctx.matrix,[dpr,0,0,dpr,0,0],'cut-in restores the native drawing transform');eq(ctx.filter,'brightness(2)','cut-in has no filter leak');eq(ctx.globalCompositeOperation,'multiply','cut-in has no blend leak');eq(state.egoGuardianRC155.cutInPending,false,'actual draw consumes saved cut-in once');
 }
 const deferred={hp:240,time:100,egoGuardianRC155:{active:true,cutInPending:true,cutInSerial:1}};eq(A.present({width:1280,height:720,getContext:()=>({}),getBoundingClientRect:()=>({width:0,height:0})},deferred),false,'zero-area rotation frame defers presentation');eq(deferred.egoGuardianRC155.cutInPending,true,'zero-area frame cannot consume the cut-in');
}
presentationChecks().then(()=>console.log('RC155_EGO_ART_UNIT',JSON.stringify({status:'passed',checks,originals:expected.length,derivedPixelBytes:pixels*4,naturalPersonaVictoryVerified:false}))).catch(error=>{console.error(error);process.exitCode=1;});
