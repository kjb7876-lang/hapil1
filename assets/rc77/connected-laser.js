/* RC79: solid, single-colour beams. Width is the collision half-width in pixels. */
(() => {
 'use strict';let draws=0;
 function render(ctx,source,options={}){
  const lines=(source??[]).filter(l=>l?.a&&l?.b&&[l.a.x,l.a.y,l.b.x,l.b.y].every(Number.isFinite));
  if(!ctx||!lines.length)return false;
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,Math.min(1,options.alpha??1));
   ctx.strokeStyle=options.color||'#d9a347';ctx.lineWidth=Math.max(2,Number(options.width)||7)*2;
   ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowBlur=0;ctx.setLineDash([]);ctx.beginPath();
   for(const l of lines){ctx.moveTo(l.a.x,l.a.y);ctx.lineTo(l.b.x,l.b.y);}ctx.stroke();draws++;return true;
  }finally{ctx.restore();}
 }
 window.__HAPIL_CONNECTED_LASER_V31377__=Object.freeze({installed:true,version:'RC79',render,stats:()=>({draws})});
})();
