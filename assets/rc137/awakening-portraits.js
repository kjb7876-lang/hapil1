/* RC137: persistent, source-correct awakening portraits in CSS-pixel HUD space.
 * Images remain visible for the active window; UI and gameplay clocks are separate.
 */
(function(root){'use strict';
 const rows=new WeakMap(),n=(v,d=0)=>Number.isFinite(v)?v:d;
 function cooldownFactor(s){return root.__HAPIL_SAMONG_RC91__?.active(s)===true?.5:1;}
 function draw(ctx,s,width,height,compact=false){
  const A=root.__HAPIL_SAMONG_RC91__,M=root.__HAPIL_MEDIA_ART_RC133__,H=root.__HAPIL_INNER_FINAL_RC133__,entries=[];
  if(A?.active(s)){const hero=s.samongPassiveRC91?.heroId;entries.push({kind:'player',hero,path:A.art[hero],image:A.picture(hero),remaining:n(s.samongPassiveRC91?.active),label:root.__HAPIL_FEEDBACK_RC128__?.heroes?.[hero]?.name??hero});}
  if(H?.encounter(s)&&n(s.innerFinalRC133?.awake)>0)entries.push({kind:'persona',hero:'inner-evil-rc133',path:M?.paths.awakening,image:M?.picture(M.paths.awakening),remaining:s.innerFinalRC133.awake,label:'Persona'});
  if(!entries.length){rows.delete(s);return false;}
  const narrow=compact||width<600,w=narrow?64:92,h=Math.min(narrow?96:142,height*.24),gap=8,margin=12,y=narrow?40:54,observed=[];
  // Both cards stay adjacent at the upper-right; distinct slots avoid covering
  // each other even when opposing awakenings and faction exchange overlap.
  ctx.save();try{ctx.filter='none';ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.textBaseline='top';ctx.textAlign='center';
   entries.forEach((entry,i)=>{const x=width-margin-w-i*(w+gap);ctx.globalAlpha=.68;ctx.fillStyle='#080b15';ctx.fillRect(x-3,y-3,w+6,h+23);ctx.globalAlpha=.96;
    const im=entry.image;let imageRect=null;if(im?.complete&&im.naturalWidth&&im.naturalHeight){const fit=Math.min(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*fit,ih=im.naturalHeight*fit;imageRect={x:x+(w-iw)/2,y,width:iw,height:ih};ctx.drawImage(im,imageRect.x,imageRect.y,iw,ih);}
    ctx.font=(narrow?'10':'12')+'px sans-serif';ctx.fillStyle=entry.kind==='persona'?'#ffc5cd':'#f2edff';ctx.fillText(entry.label+' · '+Math.max(0,entry.remaining).toFixed(1)+'초',x+w/2,y+h+3);
    observed.push({kind:entry.kind,hero:entry.hero,path:entry.path,decoded:!!imageRect,imageRect,card:{x:x-3,y:y-3,width:w+6,height:h+23},width,height});
   });
  }finally{ctx.restore();}rows.set(s,observed);return true;
 }
 root.__HAPIL_AWAKENING_PORTRAITS_RC137__=Object.freeze({draw,cooldownFactor,snapshot:s=>rows.get(s)?.map(r=>({...r}))??[]});
})(window);
