'use strict';
// Read-only source evidence. These PNGs are decoder/compositor diagnostics,
// never browser screenshots, regenerated artwork, or a clean-silhouette pass.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),crypto=require('node:crypto'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc156-source-cloak',baseline='03ddd7159c20c1d9610c07dbd3f70ee94a1f9e37';
fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),git=(...a)=>cp.execFileSync('git',['--no-replace-objects',...a],{cwd:root,maxBuffer:32*1024*1024});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ego-originals-20261008/ASSET_MANIFEST.json'))),images=new Map();
for(const row of manifest.files){const file=path.join(root,'assets/ego-originals-20261008',row.filename),bytes=fs.readFileSync(file);assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256);}
class SourceImage{
 set src(value){this._src=value;const file=path.resolve(root,value),bytes=fs.readFileSync(file);this.naturalWidth=bytes.readUInt32BE(16);this.naturalHeight=bytes.readUInt32BE(20);this.rgba=cp.execFileSync('ffmpeg',['-v','error','-i',file,'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16*1024*1024});assert.equal(this.rgba.length,this.naturalWidth*this.naturalHeight*4);images.set(value,this);this.complete=true;this.onload?.();}
 get src(){return this._src;}
}
function crop(im,[x,y,w,h]){assert(x>=0&&y>=0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight);const rgba=Buffer.alloc(w*h*4);for(let yy=0;yy<h;yy++)im.rgba.copy(rgba,yy*w*4,((y+yy)*im.naturalWidth+x)*4,((y+yy)*im.naturalWidth+x+w)*4);return {rgba,naturalWidth:w,naturalHeight:h};}
function components(im,f,A,diagonal){
 const w=im.width,h=im.height,seen=new Uint8Array(w*h),rows=[],steps=diagonal?[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]:[[-1,0],[1,0],[0,-1],[0,1]];
 for(let start=0;start<w*h;start++){
  if(seen[start]||!im.rgba[start*4+3])continue;const queue=[start];seen[start]=1;let left=w,right=0,top=h,bottom=0,core=0,fragment=0,crossing=0;
  for(let i=0;i<queue.length;i++){
   const n=queue[i],x=n%w,y=Math.floor(n/w),sx=f.rect[0]+x,sy=f.rect[1]+y;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);core+=A.inPolygon(x+.5-f.cellOffset,y+.5,A.cores[f.kind][f.index]);fragment+=sx>=665&&sx<698&&sy>=209&&sy<312;crossing+=sx>=680&&sx<713&&sy>=305&&sy<345;
   for(const [dx,dy]of steps){const xx=x+dx,yy=y+dy,n=yy*w+xx;if(xx<0||xx>=w||yy<0||yy>=h||seen[n]||!im.rgba[n*4+3])continue;seen[n]=1;queue.push(n);}
  }
  if(fragment||crossing)rows.push({sourceRect:[f.rect[0]+left,f.rect[1]+top,right-left+1,bottom-top+1],pixels:queue.length,protectedCorePixels:core,fragmentPixels:fragment,crossingPixels:crossing});
 }
 return{neighbours:diagonal?8:4,alphaAdmission:'retained alpha>0; no RGB/alpha editing',components:rows.sort((a,b)=>b.pixels-a.pixels),ownershipEstablished:false};
}
// Review-only ownership candidate: remove the isolated upper predecessor
// fragment, never the connected lower cloak/body component. Runtime untouched.
function detachedCandidate(body,f,A){
 const w=body.width,h=body.height,seen=new Uint8Array(w*h),rgba=Buffer.from(body.rgba),removed=[];
 for(let start=0;start<w*h;start++){
  if(seen[start]||!rgba[start*4+3])continue;const queue=[start];seen[start]=1;let fragment=false,protectedPixel=false,insideUpper=true;
  for(let i=0;i<queue.length;i++){
   const n=queue[i],x=n%w,y=Math.floor(n/w),sx=f.rect[0]+x,sy=f.rect[1]+y;
   fragment||=sx>=665&&sx<698&&sy>=209&&sy<312;
   insideUpper&&=sx>=665&&sx<693&&sy>=209&&sy<246;
   protectedPixel||=A.inPolygon(x+.5-f.cellOffset,y+.5,A.cores[f.kind][f.index])||(A.anatomyRegions?.[f.kind]?.[f.index]??[]).some(p=>A.inPolygon(sx+.5,sy+.5,p))||(A.weaponRegions[f.kind][f.index]&&A.inPolygon(sx+.5,sy+.5,A.weaponRegions[f.kind][f.index]));
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx<0||xx>=w||yy<0||yy>=h||seen[j]||!rgba[j*4+3])continue;seen[j]=1;queue.push(j);}
  }
  if(fragment&&insideUpper&&!protectedPixel){assert.equal(queue.length,603,'exact isolated upper source component');for(const n of queue){rgba[n*4+3]=0;removed.push(n);}}
 }
 assert.equal(removed.length,603,'review candidate must only remove the isolated source fragment');
 const changed=new Set(removed);let preserved=0;
 for(let p=0;p<rgba.length;p+=4){const n=p/4;assert(rgba.subarray(p,p+3).equals(body.rgba.subarray(p,p+3)),'candidate never edits RGB');if(!changed.has(n)){assert(rgba.subarray(p,p+4).equals(body.rgba.subarray(p,p+4)),'outside candidate remains exact');preserved++;}}
 return {rgba,naturalWidth:w,naturalHeight:h,report:{appliedToRuntime:false,sourceRect:[665,209,28,37],clearedAlphaPixels:removed.length,unchangedPixels:preserved,protectedBodyOrWeaponPixelsRemoved:0,connectedLowerFragmentPixelsRemoved:0,limitation:'Only the isolated upper603 predecessor pixels are masked. The connected lower1776 fragment remains unresolved; this is not a complete silhouette repair.'}};
}
async function compositor(text){const window={Image:SourceImage,document:{hidden:false}};window.document.createElement=()=>{const cv={width:0,height:0};cv.getContext=()=>({drawImage(im,x,y,w,h){cv.rgba=crop(im,[x,y,w,h]).rgba;},getImageData:()=>({data:new Uint8ClampedArray(cv.rgba)}),putImageData:p=>{cv.rgba=Buffer.from(p.data);}});return cv;};vm.runInNewContext(text,{window});const A=window.__HAPIL_EGO_ART_RC155__;await A.ensure({egoGuardianRC155:{active:true}});return A;}
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function chunk(type,bytes){const name=Buffer.from(type),body=Buffer.concat([name,bytes]),n=Buffer.alloc(4),crc=Buffer.alloc(4);n.writeUInt32BE(bytes.length);let c=0xffffffff;for(const b of body)c=crcTable[(c^b)&255]^(c>>>8);crc.writeUInt32BE((c^0xffffffff)>>>0);return Buffer.concat([n,body,crc]);}
function png(im,zoom){const w=im.naturalWidth*zoom,h=im.naturalHeight*zoom,raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=(Math.floor(y/zoom)*im.naturalWidth+Math.floor(x/zoom))*4;im.rgba.copy(raw,y*(w*4+1)+1+x*4,p,p+4);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
(async()=>{
 const old=await compositor(git('show',baseline+':assets/rc155/ego-art.js').toString()),current=await compositor(fs.readFileSync(path.join(root,'assets/rc155/ego-art.js'),'utf8'));
 const oldFrame=old.frame('walk',3),frame=current.frame('walk',3),source=images.get(current.paths.walk),oldBody=old.picture('ego155:walk:3'),body=current.picture('ego155:walk:3');
 const region=[665,209,33,103],overlap=[680,305,33,40];let differing=0,retainedForeground=0,sourceMatches=0;
 for(let yy=region[1];yy<region[1]+region[3];yy++)for(let xx=region[0];xx<region[0]+region[2];xx++){const p=((yy-frame.rect[1])*body.width+xx-frame.rect[0])*4,o=((yy-oldFrame.rect[1])*oldBody.width+xx-oldFrame.rect[0])*4,s=(yy*source.naturalWidth+xx)*4;const a=body.rgba.subarray(p,p+4),b=oldBody.rgba.subarray(o,o+4);if(!a.equals(b))differing++;if(a[3]){retainedForeground++;if(a.equals(source.rgba.subarray(s,s+4)))sourceMatches++;}}
 assert(region[0]>=oldFrame.rect[0]&&region[0]+region[2]<=oldFrame.rect[0]+oldFrame.rect[2],'reported fragment is inside the original cell, not a weapon extension');assert(retainedForeground>100,'fragment evidence must contain actual retained source pixels');
 const captures=[];function save(file,im,zoom,role,sourceRect){const bytes=png(im,zoom);fs.writeFileSync(path.join(out,file),bytes);captures.push({file,bytes:bytes.length,sha256:sha(bytes),width:im.naturalWidth*zoom,height:im.naturalHeight*zoom,zoom,method:'integer nearest-neighbour repetition of exact decoded RGBA; no RGB edits',role,sourceRect,browserScreenshot:false,generatedArt:false});}
 save('walk-2-3-original-source-3x.png',crop(source,[443,100,487,304]),3,'Original neighbouring poses, including both sides of the old665 cell edge',[443,100,487,304]);
 save('walk-3-left-fragment-original-5x.png',crop(source,[665,195,70,190]),5,'Original cell-left fragment; no runtime alpha mask',[665,195,70,190]);
 save('walk-3-crossing-original-8x.png',crop(source,overlap),8,'Unassigned lower crossing region; no claim of per-character separation',overlap);
 save('walk-3-baseline-compositor-3x.png',{rgba:oldBody.rgba,naturalWidth:oldBody.width,naturalHeight:oldBody.height},3,'Actual03ddd715 source compositor; not public73a410d',oldFrame.rect);
 save('walk-3-current-compositor-3x.png',{rgba:body.rgba,naturalWidth:body.width,naturalHeight:body.height},3,'Current actual source compositor; diagnostic rather than game screenshot',frame.rect);
 const candidate=detachedCandidate(body,frame,current);
 save('walk-3-upper-ownership-candidate-3x.png',candidate,3,'Unpublished minimal ownership-mask candidate; lower connected overlap deliberately retained',frame.rect);
 const report={status:'known-source-overlap',commit:git('rev-parse','HEAD').toString().trim(),dirty:!!git('status','--porcelain').toString().trim(),baseline,baselineRole:'Source crop baseline03ddd715, not public73a410d',runtimeBlob:git('hash-object','assets/rc155/ego-art.js').toString().trim(),source:{path:current.paths.walk,bytes:fs.statSync(path.resolve(root,current.paths.walk)).size,sha256:sha(fs.readFileSync(path.resolve(root,current.paths.walk)))},frame:JSON.parse(JSON.stringify(frame)),baselineFrame:JSON.parse(JSON.stringify(oldFrame)),fragment:{sourceRect:region,insideOriginalCell:true,baselineVsCurrentDifferingPixels:differing,retainedForeground,retainedExactSourceRGBA:sourceMatches,diagnosis:'The upper left feather/cape fragment visibly continues from preceding walk frame2 into the old walk frame3 cell; the right-side weapon extension did not import it.'},crossing:{sourceRect:overlap,classification:'inference from visible source flow',limitation:'The original flat RGBA includes neighbouring cloak flow near the current front-cloak flow. It contains no per-character layers or alpha masks. Exact hidden current-frame design and a seam-free ownership boundary cannot be recovered from these composite bytes alone.'},decision:'No guessed cloak mask, dark-pixel erase, body shrink, original-byte change or regenerated frame is applied. Author-isolated complete walk frames2/3 or reviewed per-frame source masks are required for a reliable whole-design repair.',captures,bytes:captures.reduce((n,r)=>n+r.bytes,0),naturalPlayVerified:false,fullSilhouetteVerified:false};
 report.reviewCandidate=candidate.report;
 report.connectivity=[components(body,frame,current,false),components(body,frame,current,true)];report.connectivityLimitation='A detached upper component is observable, but lower reported pixels also belong to a component containing protected current-frame anatomy. Connectivity alone cannot assign flat composited source ownership or authorize deleting that component.';
 assert(report.bytes<32*1024*1024);fs.writeFileSync(path.join(out,'source-cloak-report.json'),JSON.stringify(report,null,2));console.log('RC156_SOURCE_CLOAK_AUDIT',JSON.stringify({status:report.status,commit:report.commit,baseline:report.baseline,insideOriginalCell:true,differingPixels:differing,retainedForeground,retainedExactSourceRGBA:sourceMatches,connectivity:report.connectivity,captures:captures.length,bytes:report.bytes,fullSilhouetteVerified:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
