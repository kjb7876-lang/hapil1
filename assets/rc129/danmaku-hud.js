/* RC129: compact enemy information on the left, player graze on the right.
 * All HUD operations are read-only. Existing RC128 effects and laser paints remain.
 */
(function(root){'use strict';
 const D=root.__HAPIL_DANMAKU_RC129__;if(!D||root.__HAPIL_DANMAKU_HUD_RC129__)return;
 const n=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?v:d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const cameras=new WeakMap(),draws=new WeakMap();
 const metrics={draws:0,markers:0,errors:0,saves:0,restores:0,grazeHooks:0};let installed=false,tries=0;
 function overlay(base,methods){const desc=Object.getOwnPropertyDescriptors(base);for(const[k,v]of Object.entries(methods))desc[k]={value:v,enumerable:true,writable:false,configurable:false};return Object.freeze(Object.defineProperties({},desc));}
 function fail(error){metrics.errors++;if(metrics.errors===1)root.console?.warn?.('RC129 optional presentation hook',error);}
 const core=root.__HAPIL_COMBAT_CORE_V31401__;
 if(core){const wrapped=overlay(core,{graze(s,q,reduce){return core.graze(s,q,()=>{const ok=reduce();if(ok){try{D.graze(s,q);metrics.grazeHooks++;}catch(e){fail(e);}}return ok;});}});root.__HAPIL_COMBAT_CORE_V31401__=wrapped;root.__HAPIL_COMBAT_CORE_V31402__=wrapped;}
 const policy=root.__HAPIL_POLICY_RC127__;
 if(policy)root.__HAPIL_POLICY_RC127__=overlay(policy,{incoming(s,q){const base=policy.incoming(s,q),factor=D.grazeFactor(s,q);return factor===1?base:Math.max(1-policy.maxReduction,base*factor);}});
 function text(ctx,s,x,y,max){let t=String(s);if(max<=0)return;while(t.length&&ctx.measureText(t).width>max)t=t.slice(0,-1);ctx.fillText(t.length<String(s).length?t.slice(0,-1)+'…':t,x,y);}
 function position(s,a,w,h){
  const v=root.__HAPIL_ADAPTIVE_RC125__,cam=cameras.get(s);
  if(cam&&v?.wide?.()){
   const p=cam.project(a.x,a.y),view=v.view(w,h),c=cam.camera;
   if([p?.x,p?.y,c?.x,c?.y,c?.scale,view?.k].every(Number.isFinite)){
    const x=(c.x+p.x*c.scale-view.x)*view.k,y=(c.y+p.y*c.scale-view.y)*view.k;
    const outside=x<12||x>w-12||y<12||y>h-12;
    return{x:clamp(x,18,w-18),y:outside?clamp(y,64,h-28):h-28,angle:Math.atan2(y-h/2,x-w/2),outside};
   }
  }
  // Portrait uses split cameras. This is explicitly a bearing marker at the
  // split boundary, not a fabricated world-to-screen hitbox coordinate.
  const dx=(a.x-s.x)-(a.y-s.y),dy=((a.x-s.x)+(a.y-s.y))*.5;
  return{x:clamp(w*.5+dx/32*w*.4,18,w-18),y:h>w?h*.47:h-28,angle:Math.atan2(dy,dx),outside:true};
 }
 function draw(ctx,s,canvas){
  if(!ctx||!s||!canvas||s.hp<=0)return false;
  const snapshot=D.snapshot(s),p=snapshot.phase,g=snapshot.graze;
  const rect=canvas.getBoundingClientRect?.(),w=n(rect?.width,1280),h=n(rect?.height,720);if(w<40||h<80)return false;
  const compact=w<600||h<340,small=w<460,actors=(s.enemies??[]).filter(D.safeActor).slice(0,3);
  ctx.save();
  try{
   ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.shadowBlur=0;
   ctx.textAlign='left';ctx.textBaseline='alphabetic';
   if(p){
    const owner=actors.find(a=>String(a.id)===p.ownerId)??actors[0];const color=/^#[0-9a-f]{6}$/i.test(owner?.color??'')?owner.color:'#b69cc8';
    const width=Math.min(small?w*.65:330,w-100),height=compact?36:44;
    ctx.fillStyle='rgba(5,7,16,.68)';ctx.fillRect(7,7,width,height);ctx.fillStyle=color;ctx.fillRect(7,7,2,height);
    ctx.font='700 '+(compact?10:12)+'px sans-serif';ctx.fillStyle='#f3ecf8';text(ctx,p.bossName+' · '+p.band+'/3',14,compact?20:23,width-16);
    ctx.font=(compact?9:11)+'px sans-serif';
    const timer=p.stage==='draining'?'시전 완주 대기 '+p.castRemaining.toFixed(1)+'s':p.stage==='rest'?'탄막 정리 · 다음 스펠':p.remaining.toFixed(1)+'s';
    text(ctx,p.title+'  |  '+timer,14,compact?34:42,width-16);
    // A restrained colored edge distinguishes phase entry without hiding bullets.
    ctx.globalAlpha=.25;ctx.fillStyle=color;ctx.fillRect(0,0,w,2);ctx.globalAlpha=1;
    const left=width-16,progress=clamp(p.remaining/p.duration,0,1);ctx.fillRect(14,7+height-2,left*progress,1);
   }
   if(g&&(g.combo>0||g.guard>0)){
    ctx.textAlign='right';ctx.font='700 '+(compact?9:11)+'px sans-serif';ctx.fillStyle='#adede2';
    ctx.fillText('GRAZE '+g.combo,w-10,21);if(g.guard>0){ctx.font=(compact?8:10)+'px sans-serif';ctx.fillText('피해 5% 감소 · '+g.guard.toFixed(1)+'s',w-10,35);}
   }
   const markers=[];
   for(const a of actors){
    const q=position(s,a,w,h);if(![q.x,q.y,q.angle].every(Number.isFinite))continue;
    ctx.save();ctx.translate(q.x,q.y);ctx.fillStyle=/^#[0-9a-f]{6}$/i.test(a.color??'')?a.color:'#ecd4e5';ctx.strokeStyle='#050810';ctx.lineWidth=2;
    ctx.rotate(q.outside?q.angle:-Math.PI/2);ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-4);ctx.lineTo(-4,4);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
    ctx.textAlign=q.x>w-50?'right':q.x<50?'left':'center';ctx.font='700 8px sans-serif';ctx.fillStyle='#f5eaf6';ctx.strokeStyle='#050810';ctx.lineWidth=3;
    const label=String(a.name??'BOSS').slice(0,12);ctx.strokeText(label,q.x,q.y-8);ctx.fillText(label,q.x,q.y-8);markers.push({owner:String(a.id),...q});metrics.markers++;
   }
   metrics.draws++;draws.set(s,{phase:p,markers,width:w,height:h});
  }catch(e){fail(e);}finally{ctx.restore();}
  return true;
 }
 const feel=root.__HAPIL_FEEDBACK_RC128__;
 if(feel)root.__HAPIL_FEEDBACK_RC128__=overlay(feel,{
  record(s,a,row,q){const out=feel.record(s,a,row,q);try{D.contact(s,a,row);}catch(e){fail(e);}return out;},
  draw(ctx,s,canvas,settings){const out=feel.draw(ctx,s,canvas,settings);draw(ctx,s,canvas);return out;}
 });
 function install(){
  if(installed)return true;const B=root.__HAPIL_RC86_BRIDGE__,v=root.__HAPIL_VIEWPORT_RC104__;
  if(!root.__HAPIL_SAMONG_RC91__?.installed||!B?.serializeSave||!B?.normalizeSave||!B?.restoreEntry||!v?.camera)return false;
  const camera=v.camera;v.camera=function(s,fallback,project,...args){const c=camera.call(this,s,fallback,project,...args);if(s&&c&&typeof project==='function')cameras.set(s,{camera:c,project});return c;};
  const save=B.serializeSave,norm=B.normalizeSave,restore=B.restoreEntry;
  B.serializeSave=function(s,...a){const result=save.call(this,s,...a);if(result)result.danmakuRC129=D.exportSave(s);metrics.saves++;return result;};
  B.normalizeSave=function(raw,...a){const result=norm.call(this,raw,...a);if(result)result.danmakuRC129=D.cleanSave(raw?.danmakuRC129);return result;};
  B.restoreEntry=function(s,raw,...a){const result=restore.call(this,s,raw,...a);D.restore(s,raw?.danmakuRC129);metrics.restores++;return result;};
  installed=true;return true;
 }
 const api=Object.freeze({version:'RC129',get installed(){return installed;},draw,position,install,snapshot:s=>({installed,metrics:{...metrics},last:s?draws.get(s)??null:null})});root.__HAPIL_DANMAKU_HUD_RC129__=api;
 function ready(){if(install()||++tries>1200)return;root.setTimeout?.(ready,25);}if(typeof document!=='undefined')ready();
})(typeof window!=='undefined'?window:globalThis);
