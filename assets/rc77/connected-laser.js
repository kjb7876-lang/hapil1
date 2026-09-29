/* RC85: owner-authored beam texture follows the live collision segments. */
(() => {
 'use strict';let draws=0,textured=0;
 const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
 function render(ctx,source,options={}){
  const lines=(source??[]).filter(l=>l?.a&&l?.b&&[l.a.x,l.a.y,l.b.x,l.b.y].every(Number.isFinite));
  if(!ctx||!lines.length)return false;
  const alpha=Math.max(0,Math.min(1,finite(options.alpha,1))),half=Math.max(1,finite(options.width,7));
  const image=options.image,iw=image?.naturalWidth||image?.width||0,ih=image?.naturalHeight||image?.height||0;
  const hasArt=!!image&&image.complete!==false&&iw>0&&ih>0;
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.setLineDash([]);
   ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   for(const l of lines){ctx.moveTo(l.a.x,l.a.y);ctx.lineTo(l.b.x,l.b.y);}
   // The authored luminous body follows the collision envelope without solid outlines.
   ctx.strokeStyle=options.color||'#d9a347';
   if(hasArt){
    // Only the continuous middle of the authored beam is sampled. Its large
    // muzzle/explosion must never repeat at every bend or branch junction.
    const sx=iw*.25,sw=iw*.5,sy=ih*.25,sh=ih*.50;
    for(const l of lines){const dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,len=Math.hypot(dx,dy);if(len<.5)continue;
     ctx.save();try{ctx.translate(l.a.x,l.a.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=alpha;
      if(!options.low){ctx.globalAlpha=alpha*.16;ctx.drawImage(image,sx,sy,sw,sh,0,-half*1.6,len,half*3.2);}
      ctx.globalAlpha=alpha;ctx.drawImage(image,sx,sy,sw,sh,0,-half,len,half*2);
     }finally{ctx.restore();}
    }textured++;
   }else{
    ctx.globalAlpha=alpha*.12;ctx.lineWidth=half*2;ctx.stroke();
    ctx.globalAlpha=alpha*.55;ctx.lineWidth=half*1.1;ctx.stroke();
    ctx.globalAlpha=alpha*.85;ctx.strokeStyle=options.accent||options.color||'#ffe6ad';ctx.lineWidth=half*.38;ctx.stroke();
   }
   draws++;return true;
  }finally{ctx.restore();}
 }
 window.__HAPIL_CONNECTED_LASER_V31377__=Object.freeze({installed:true,version:'RC85',render,stats:()=>({draws,textured})});
})();
