/* RC137: persistent, source-correct awakening portraits in CSS-pixel HUD space.
 * Images remain visible for the active window; UI and gameplay clocks are separate.
 */
(function(root){'use strict';
 const rows=new WeakMap(),flashes=new WeakMap(),pictures=new Map(),n=(v,d=0)=>Number.isFinite(v)?v:d,clock=()=>root.performance?.now?.()??Date.now();
 function picture(path){if(!path||typeof root.Image!=='function')return null;if(!pictures.has(path)){const im=new root.Image();im.decoding='async';im.src=path;pictures.set(path,im);}const im=pictures.get(path);return im.complete&&im.naturalWidth?im:null;}
 function flash(s,kind,path,label,key){if(!s||!path||!key)return false;let row=flashes.get(s);if(!row||row.zone!==s.zone||n(s.time)<row.worldTime){row={zone:s.zone,worldTime:n(s.time),seen:new Set(),items:[]};flashes.set(s,row);}row.worldTime=n(s.time);if(row.seen.has(key))return false;row.seen.add(key);row.items.push({kind,path,label,at:clock(),zone:s.zone});row.items=row.items.slice(-3);picture(path);return true;}
 function drawFlash(ctx,s,width,height){const row=flashes.get(s);if(!row||row.zone!==s.zone||n(s.time)<row.worldTime){flashes.delete(s);return false;}const now=clock();row.items=row.items.filter(item=>now-item.at<1500&&now>=item.at);if(!row.items.length)return false;
  const count=row.items.length,w=Math.min(count>1?width*.25:width*.32,165),h=Math.min(height*.31,230),gap=12,all=count*w+(count-1)*gap,top=(height-h)*.5;
  ctx.save();try{ctx.filter='none';ctx.globalCompositeOperation='source-over';ctx.textAlign='center';ctx.textBaseline='top';row.items.forEach((item,i)=>{const x=(width-all)/2+i*(w+gap),im=picture(item.path),age=now-item.at,fade=Math.min(1,age/150,(1500-age)/240);ctx.globalAlpha=Math.max(0,Math.min(.92,fade));if(im){const fit=Math.min(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*fit,ih=im.naturalHeight*fit;ctx.drawImage(im,x+(w-iw)/2,top+(h-ih)/2,iw,ih);}ctx.globalAlpha=Math.max(0,Math.min(1,fade));ctx.font='700 13px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#090810';ctx.strokeText(item.label,x+w/2,top+h+4,w+12);ctx.fillStyle='#fff0f4';ctx.fillText(item.label,x+w/2,top+h+4,w+12);});}finally{ctx.restore();}return true;}
 function cooldownFactor(s){return root.__HAPIL_SAMONG_RC91__?.active(s)===true?.5:1;}
 function drawFlashOverlay(ctx,s,canvas){const rect=canvas?.getBoundingClientRect?.();if(!ctx||!rect?.width||!rect?.height)return false;const v=root.__HAPIL_VIEWPORT_RC104__?.view?.(rect.width,rect.height);if(!v?.k)return false;ctx.save();try{ctx.setTransform(canvas.width/1280/v.k,0,0,canvas.height/720/v.k,v.x*canvas.width/1280,v.y*canvas.height/720);return drawFlash(ctx,s,rect.width,rect.height);}finally{ctx.restore();}}
 function draw(ctx,s,width,height,compact=false){
  const A=root.__HAPIL_SAMONG_RC91__,M=root.__HAPIL_MEDIA_ART_RC133__,H=root.__HAPIL_INNER_FINAL_RC133__,entries=[];
  const split=root.__HAPIL_PORTRAIT_SPLIT_RC108__,deferFlash=split?.active?.(s)===true&&split.metrics?.()?.rendering===true;
  if(A?.active(s)){const hero=s.samongPassiveRC91?.heroId;entries.push({kind:'player',hero,path:A.art[hero],image:A.picture(hero),remaining:n(s.samongPassiveRC91?.active),label:root.__HAPIL_FEEDBACK_RC128__?.heroes?.[hero]?.name??hero});}
  if(H?.encounter(s)&&n(s.innerFinalRC133?.awake)>0)entries.push({kind:'persona',hero:'inner-evil-rc133',path:M?.paths.awakening,image:M?.picture(M.paths.awakening),remaining:s.innerFinalRC133.awake,label:'Persona'});
  const leader=s.zone==='cult04'&&s.gameModeV31346==='STORY'&&s.hapilFinalBattleV31300?.secondPhaseActive&&!s.hapilFinalBattleV31300.completed&&s.enemies?.some(a=>a.id==='c104-boss'&&a.hp>0);
  if(leader){const path=root.__HAPIL_CULT_LEADER_ART_RC142__?.paths?.[3];entries.push({kind:'cult',hero:'c104-boss',path,image:picture(path),remaining:0,label:'사이비 교주'});}
  if(!entries.length){rows.delete(s);return deferFlash?false:drawFlash(ctx,s,width,height);}
  const narrow=compact||width<600,w=narrow?64:92,h=Math.min(narrow?96:142,height*.24),gap=8,margin=12,y=narrow?40:54,observed=[];
  // Both cards stay adjacent at the upper-right; distinct slots avoid covering
  // each other even when opposing awakenings and faction exchange overlap.
  ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.textBaseline='top';ctx.textAlign='center';
   entries.forEach((entry,i)=>{const x=width-margin-w-i*(w+gap);ctx.globalAlpha=.68;ctx.fillStyle='#080b15';ctx.fillRect(x-3,y-3,w+6,h+34);ctx.globalAlpha=.96;
    const im=entry.image;let imageRect=null;if(im?.complete&&im.naturalWidth&&im.naturalHeight){const fit=Math.min(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*fit,ih=im.naturalHeight*fit;imageRect={x:x+(w-iw)/2,y,width:iw,height:ih};ctx.drawImage(im,imageRect.x,imageRect.y,iw,ih);}
    ctx.font=(narrow?'10':'12')+'px sans-serif';ctx.fillStyle=entry.kind==='persona'||entry.kind==='cult'?'#ffc5cd':'#f2edff';ctx.fillText(entry.label,x+w/2,y+h+3,w);if(entry.kind!=='cult')ctx.fillText(Math.max(0,entry.remaining).toFixed(1)+'초',x+w/2,y+h+(narrow?15:18),w);
    observed.push({kind:entry.kind,hero:entry.hero,path:entry.path,decoded:!!imageRect,imageRect,card:{x:x-3,y:y-3,width:w+6,height:h+23},width,height});
   });
  }finally{ctx.restore();}rows.set(s,observed);if(!deferFlash)drawFlash(ctx,s,width,height);return true;
 }
 root.__HAPIL_AWAKENING_PORTRAITS_RC137__=Object.freeze({draw,flash,drawFlashOverlay,cooldownFactor,snapshot:s=>rows.get(s)?.map(r=>({...r}))??[],flashSnapshot:s=>flashes.get(s)?.items.map(item=>({...item}))??[]});
})(window);
