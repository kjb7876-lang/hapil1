/* RC20: generated, bounded, color-owned bitmap presentation. No simulation writes. */
(() => {
  'use strict';
  const paths = Object.freeze({aura:'./assets/rc20/origin-aura.png',skills:'./assets/rc20/hero-skills.png',refuge:'./assets/rc20/dream-refuge.png'});
  const image = new Image();
  image.decoding = 'async';
  image.src = paths.aura;
  const tints = new Map();
  const stats = {draws:0,pending:0,errors:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function tinted(color) {
    if(!image.complete || !(image.naturalWidth>0)){stats.pending++;return null;}
    const key=/^#[a-f0-9]{6}$/i.test(color)?color:'#edf7ff';
    if(tints.has(key))return tints.get(key);
    const c=document.createElement('canvas');c.width=320;c.height=480;
    const x=c.getContext('2d');if(!x)return null;
    x.fillStyle=key;x.fillRect(0,0,c.width,c.height);
    x.globalCompositeOperation='destination-in';x.drawImage(image,0,0,c.width,c.height);
    if(tints.size>=10)tints.delete(tints.keys().next().value);
    tints.set(key,c);return c;
  }
  function drawAura(ctx,p,time,color,settings={},strength=1) {
    if(!ctx||!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||!Number.isFinite(time))return false;
    const opacity=Number(settings.skillFxOpacity??1);
    if(!Number.isFinite(opacity))return false;
    if(opacity<=0||strength<=0)return true;
    const bitmap=tinted(color);if(!bitmap)return false;
    const quiet=!!settings.reducedFlash,low=!!settings.lowFx;
    const pulse=quiet?1:1+Math.sin(time*3.2)*.025;
    const h=(low?142:180)*pulse,w=h*2/3;
    ctx.save();
    try {
      ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;
      ctx.globalAlpha*=clamp(strength,0,1)*clamp(opacity,0,1)*(quiet?.42:.70);
      ctx.drawImage(bitmap,p.x-w/2,p.y-h*.91,w,h);
      if(!low && !quiet){
        const progress=((time*.8)%1+1)%1;
        ctx.globalAlpha*=Math.sin(progress*Math.PI)*.24;
        ctx.drawImage(bitmap,p.x-w*.53,p.y-h*.91-progress*12,w*1.06,h);
      }
      stats.draws++;
    } catch(error){stats.errors++;return false;} finally {ctx.restore();}
    return true;
  }
  window.__HAPIL_ART_RC20__=Object.freeze({paths,drawAura,metrics:()=>({...stats,tintCount:tints.size,maxTintCount:10}),imageOnly:true});
})();
