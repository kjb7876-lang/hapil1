/* RC91: continuous Purple Sword Angel light for curved/compound laser paths. */
(() => {
 'use strict';let draws=0,textured=0,continuous=0;
 const finite=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
 const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<.75;
 const complexType=type=>!!type&&!['one','sweep'].includes(type);
 function paths(lines){
  const result=[];let current=null;
  for(const l of lines){
   const tail=current?.[current.length-1];
   if(tail&&near(tail,l.a))current.push(l.b);
   else if(tail&&near(tail,l.b))current.push(l.a);
   else{current=[l.a,l.b];result.push(current);}
  }return result;
 }
 function render(ctx,source,options={}){
  const lines=(source??[]).filter(l=>l?.a&&l?.b&&[l.a.x,l.a.y,l.b.x,l.b.y].every(Number.isFinite));
  if(!ctx||!lines.length)return false;
  const alpha=Math.max(0,Math.min(1,finite(options.alpha,1))),half=Math.max(1,finite(options.width,7));
  const image=options.image,iw=image?.naturalWidth||image?.width||0,ih=image?.naturalHeight||image?.height||0;
  const hasArt=!!image&&image.complete!==false&&iw>0&&ih>0;
  const joined=paths(lines),compound=options.complex===true||lines.length>1;
  ctx.save();try{
   ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.setLineDash([]);
   ctx.lineCap='round';ctx.lineJoin='round';
   if(compound||!hasArt){
    // One paint operation per layer. Rounded joins use the SAME segments and
    // half width as contact sampling. No repeated bitmap caps at the bends.
    ctx.beginPath();for(const chain of joined){ctx.moveTo(chain[0].x,chain[0].y);for(let i=1;i<chain.length;i++)ctx.lineTo(chain[i].x,chain[i].y);}
    const color=options.color||'#ab82ed',accent=options.accent||color;
    ctx.strokeStyle=color;
    if(!options.low){ctx.globalAlpha=alpha*.12;ctx.lineWidth=half*2.3;ctx.stroke();}
    ctx.globalAlpha=alpha*.90;ctx.lineWidth=half*2;ctx.stroke();
    ctx.globalAlpha=alpha*.74;ctx.strokeStyle=accent;ctx.lineWidth=half*1.18;ctx.stroke();
    ctx.globalAlpha=alpha*.94;ctx.strokeStyle='#f5f0ff';ctx.lineWidth=half*.26;ctx.stroke();
    continuous++;
   }else{
    const l=lines[0],dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,len=Math.hypot(dx,dy);
    if(len>=.5){ctx.translate(l.a.x,l.a.y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=alpha;
     ctx.drawImage(image,iw*.25,ih*.25,iw*.5,ih*.50,0,-half,len,half*2);textured++;}
   }
   draws++;return true;
  }finally{ctx.restore();}
 }
 window.__HAPIL_CONNECTED_LASER_V31377__=Object.freeze({installed:true,version:'RC91',render,paths,complexType,stats:()=>({draws,textured,continuous})});
})();
