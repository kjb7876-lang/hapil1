'use strict';
// Pixel-exact audit for the revised directional Persona body frames.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),qa=JSON.parse(fs.readFileSync(path.join(root,'qa/rc133/art-processing.json'))),ownership=JSON.parse(fs.readFileSync(path.join(root,'qa/rc142/persona-ownership.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let checks=0;const check=(value,label)=>{checks++;assert.ok(value,label);},eq=(actual,expected,label)=>{checks++;assert.equal(actual,expected,label);};
const sourceFile=ownership.sourceFile,maskFile=ownership.maskFile,sourceWidth=1774,sourceHeight=887;
const decode=(file,pixFmt)=>cp.execFileSync('ffmpeg',['-v','error','-i',path.join(root,file),'-f','rawvideo','-pix_fmt',pixFmt,'pipe:1'],{maxBuffer:64*1024*1024});
const sourceRec=qa.sources.find(row=>row.file===sourceFile);check(!!sourceRec,'source record exists');
const sourcePng=fs.readFileSync(path.join(root,sourceFile));eq(hash(sourcePng),ownership.sourceSha256,'original source SHA-256 unchanged');
const source=decode(sourceFile,'rgba'),maskBytes=fs.readFileSync(path.join(root,maskFile)),mask=decode(maskFile,'gray');
eq(hash(maskBytes),ownership.maskSha256,'ownership map exact SHA-256');eq(mask.length,sourceWidth*sourceHeight,'ownership map dimensions');eq(source.length,sourceWidth*sourceHeight*4,'source pixel decode length');
const rowSpecs=[{form:'base',y0:62,y1:438,owner0:1},{form:'awake',y0:497,y1:884,owner0:9}];
for(const row of rowSpecs){
 for(let y=0;y<sourceHeight;y++)for(let x=0;x<sourceWidth;x++){
  const owner=mask[y*sourceWidth+x],alpha=source[(y*sourceWidth+x)*4+3];
  if(y<row.y0||y>=row.y1)continue;
  if(alpha)check(owner>=row.owner0&&owner<row.owner0+8,'nontransparent row pixel assigned to a direction');
  else if(owner)check(false,'fully transparent source pixels are not ownership seeds');
 }
}
const body=qa.outputs.filter(row=>/\/base-\d\.png$|\/awake-\d\.png$/.test(row.file));
eq(body.length,16,'all sixteen directional forms are described');
eq(ownership.pixelEncoding['1-8'],'base directions in directionOrder','base owner encoding');
eq(ownership.pixelEncoding['9-16'],'awake directions in directionOrder','awake owner encoding');
const pixelCounts=Array(17).fill(0),bounds=Array.from({length:17},()=>({left:sourceWidth,top:sourceHeight,right:-1,bottom:-1}));
for(let y=0;y<sourceHeight;y++)for(let x=0;x<sourceWidth;x++){
 const i=y*sourceWidth+x,owner=mask[i];if(!owner)continue;const alpha=source[i*4+3];if(!alpha)continue;
 pixelCounts[owner]++;const b=bounds[owner];b.left=Math.min(b.left,x);b.top=Math.min(b.top,y);b.right=Math.max(b.right,x+1);b.bottom=Math.max(b.bottom,y+1);
}
const allOutputPixels=new Set();
for(const row of body){
 const index=Number(row.file.match(/(base|awake)-(\d)\.png$/)[2]),form=row.file.includes('/awake-')?'awake':'base',ownerId=index+(form==='awake'?9:1),d=row.pixelDerivation;
 check(d&&d.ownerId===ownerId,'direction has its distinct owner id '+row.file);
 eq(JSON.stringify(d.sourceRectConvention),'"half-open"','source rectangle convention '+row.file);
 eq(JSON.stringify(d.sourceToOutputScale),'[1,1]','source pixel scale unchanged '+row.file);
 eq(d.resampling,'none','original pixels are not resampled '+row.file);
 eq(JSON.stringify(d.canvasPx),'[344,400]','shared canvas size '+row.file);
 eq(JSON.stringify(row.outputDimensions),'[344,400]','recorded output dimensions '+row.file);
 const [x0,y0,x1,y1]=row.sourceRect,[pasteX,pasteY]=d.pasteOffsetPx,[width,height]=d.canvasPx;
 eq(JSON.stringify(row.sourceRect),JSON.stringify([bounds[ownerId].left,bounds[ownerId].top,bounds[ownerId].right,bounds[ownerId].bottom]),'source crop contains every owned nontransparent pixel '+row.file);
 check(x1>x0&&y1>y0&&x0>=0&&y0>=0&&x1<=sourceWidth&&y1<=sourceHeight,'crop remains within source sheet '+row.file);
 check(pixelCounts[ownerId]>20000,'complete pose ownership area retained '+row.file);
 const expected=Buffer.alloc(width*height*4);
 for(let sy=y0;sy<y1;sy++)for(let sx=x0;sx<x1;sx++){
  const sourcePixel=sy*sourceWidth+sx;if(mask[sourcePixel]!==ownerId)continue;
  const destX=pasteX+sx-x0,destY=pasteY+sy-y0;check(destX>=0&&destX<width&&destY>=0&&destY<height,'owned source pixel fits shared canvas '+row.file);
  const sourceOffset=sourcePixel*4,destOffset=(destY*width+destX)*4;
  source.copy(expected,destOffset,sourceOffset,sourceOffset+4);
 }
 const outputFile=fs.readFileSync(path.join(root,row.file)),pixels=decode(row.file,'rgba');
 eq(hash(outputFile),row.outputSha256,'PNG file SHA-256 '+row.file);eq(pixels.length,expected.length,'decoded output dimensions '+row.file);check(pixels.equals(expected),'every output RGBA pixel reconstructs from source ownership '+row.file);
 const rgbaHash=hash(pixels);check(!allOutputPixels.has(rgbaHash),'directional pixel outputs remain distinct '+row.file);allOutputPixels.add(rgbaHash);
 const pixelBounds={left:width,top:height,right:-1,bottom:-1};for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]){pixelBounds.left=Math.min(pixelBounds.left,x);pixelBounds.top=Math.min(pixelBounds.top,y);pixelBounds.right=Math.max(pixelBounds.right,x+1);pixelBounds.bottom=Math.max(pixelBounds.bottom,y+1);}
 const margins=[pixelBounds.left,pixelBounds.top,width-pixelBounds.right,height-pixelBounds.bottom];eq(JSON.stringify(margins),JSON.stringify(d.transparentMarginsPx),'measured transparent margins '+row.file);
 eq(JSON.stringify(row.pivot.normalized),'[0.5,0.96]','shared normalized foot pivot '+row.file);eq(JSON.stringify(row.pivot.canvasPx),'[172,384]','shared pixel foot pivot '+row.file);
 const [footX,footY]=row.pivot.sourcePx;check(Math.abs(footX-x0+pasteX-172)<=.5&&footY-y0+pasteY===384,'source foot point maps to shared pivot '+row.file);
}
for(let ownerId=1;ownerId<=16;ownerId++)check(pixelCounts[ownerId]>20000,'mask retains one substantial direction '+ownerId);
console.log('RC142_PERSONA_CROPS',JSON.stringify({status:'passed',checks,directions:16,sourcePixelsAssigned:pixelCounts.slice(1).reduce((a,b)=>a+b,0),scope:'original RGBA reconstruction, exact ownership-map pixels, sourceRects, 1:1 scale, transparent margins, shared feet anchor and non-resized 344x400 canvas'}));
