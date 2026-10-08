'use strict';
// Install before native renderers capture drawImage references. This observes
// actual game-canvas calls; offscreen crop/tint work is not presentation proof.
function installDrawAudit(){
 const original=CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
  const bitmap=window.__RC155_BITMAP_CAPTURE__,cutins=window.__RC155_CUTIN_CAPTURE__;
  const trace=window.__RC155_DRAW_TRACE__;
  if(trace){const token=image?.egoTokenRC155??null,source=image?.src??null,same=this.canvas===document.querySelector('.game-stage canvas'),key=[same,token,source??'anonymous'].join('|');if(Object.hasOwn(trace.counts,key)||Object.keys(trace.counts).length<32)trace.counts[key]=(trace.counts[key]??0)+1;if((token||String(source).includes('ego-originals-'))&&trace.images.length<48)trace.images.push({token,source,onGameCanvas:same,width:this.canvas?.width,height:this.canvas?.height,alpha:this.globalAlpha});}
  if((bitmap||cutins)&&this.canvas===document.querySelector('.game-stage canvas')){
   const at=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.time;
   if(bitmap&&image?.egoTokenRC155&&bitmap.length<4096){
    const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),[x,y,w,h]=args.slice(-4),corners=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([xx,yy])=>({x:(m.a*xx+m.c*yy+m.e)*r.width/this.canvas.width,y:(m.b*xx+m.d*yy+m.f)*r.height/this.canvas.height}));
    bitmap.push({token:image.egoTokenRC155,at,crop:image.egoSourceRectRC155,source:image.src,onGameCanvas:true,alpha:this.globalAlpha,sourceAlphaPreserved:image.egoSourceAlphaPreservedRC155===true,drawMotion:window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.heroMotion?.kind,caller:corners.some(p=>p.x<0||p.y<0||p.x>r.width||p.y>r.height)?new Error('out-of-canvas native draw').stack:null,destination:{corners,left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y)),canvasWidth:r.width,canvasHeight:r.height}});
   }
   if(cutins&&image?.src?.split(/[?#]/)[0].endsWith('/ego_samong_awaken_cutin.png')&&cutins.length<64){
    const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),[x,y,w,h]=args;
    cutins.push({x:(m.a*x+m.c*y+m.e)*r.width/this.canvas.width,y:(m.b*x+m.d*y+m.f)*r.height/this.canvas.height,width:Math.abs(m.a*w)*r.width/this.canvas.width,height:Math.abs(m.d*h)*r.height/this.canvas.height,sourceWidth:image.naturalWidth,sourceHeight:image.naturalHeight,canvasWidth:r.width,canvasHeight:r.height,at,onGameCanvas:true});
   }
  }
  return original.call(this,image,...args);
 };
}
module.exports={installDrawAudit};
