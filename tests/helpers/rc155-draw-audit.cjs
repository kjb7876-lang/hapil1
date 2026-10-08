'use strict';
// Install before native renderers capture drawImage references. This observes
// actual game-canvas calls; offscreen crop/tint work is not presentation proof.
function installDrawAudit(){
 const original=CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
  const bitmap=window.__RC155_BITMAP_CAPTURE__,cutins=window.__RC155_CUTIN_CAPTURE__;
  if((bitmap||cutins)&&this.canvas===document.querySelector('.game-stage canvas')){
   const at=window.__HAPIL_CONTROLS_V31329__?.binding?.state?.current?.time;
   if(bitmap&&image?.egoTokenRC155&&bitmap.length<4096)bitmap.push({token:image.egoTokenRC155,at,crop:image.egoSourceRectRC155,source:image.src,onGameCanvas:true,alpha:this.globalAlpha});
   if(cutins&&image?.src?.split(/[?#]/)[0].endsWith('/ego_samong_awaken_cutin.png')&&cutins.length<64){
    const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),[x,y,w,h]=args;
    cutins.push({x:(m.a*x+m.c*y+m.e)*r.width/this.canvas.width,y:(m.b*x+m.d*y+m.f)*r.height/this.canvas.height,width:Math.abs(m.a*w)*r.width/this.canvas.width,height:Math.abs(m.d*h)*r.height/this.canvas.height,sourceWidth:image.naturalWidth,sourceHeight:image.naturalHeight,canvasWidth:r.width,canvasHeight:r.height,at,onGameCanvas:true});
   }
  }
  return original.call(this,image,...args);
 };
}
module.exports={installDrawAudit};
