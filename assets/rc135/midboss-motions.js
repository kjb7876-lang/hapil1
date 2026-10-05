/* RC135: genuine generated keyframes, with native cast clocks and unchanged geometry. */
(()=>{'use strict';
 const base=window.__HAPIL_MIDBOSS_MOTION_DATA_RC135__??{identities:{}},addon=window.__HAPIL_RC140_MIDBOSS_DATA__??{identities:{}},identities={...base.identities,...addon.identities},byZone=new Map(),byActorId=new Map(),draws={};
 const clean=p=>String(p??'').replace(/^\.\//,'').split(/[?#]/)[0];
 for(const [id,entry]of Object.entries(identities)){const row={...entry,id};for(const zone of entry.routes??[])byZone.set(zone,row);for(const actorId of entry.actorIds??[id])if(actorId)byActorId.set(actorId,row);}
 function profile(actor,zone=actor?.rc135FissionZone??actor?.zone){if((!actor?.midboss&&!actor?.boss)||actor.visualOnly||actor.friendly)return null;return byZone.get(zone)??byActorId.get(actor.rc135FissionIdentity??actor.rc135FissionTemplateId??actor.rc133TemplateId??actor.templateId??actor.id)??null;}
 function pose(actor,time,presentation){
  if(Number(actor.attackAt)>time)return Number(actor.attackImpactAt)>time?'anticipation':'strike';
  if(Number(actor.recoverUntil)>time)return 'strike';
  if(presentation?.active)return presentation.progress<.45?'anticipation':'strike';
  return 'idle';
 }
 function draw(ctx,cache,actor,time,size,transform,queue,project,presentation){
  const entry=profile(actor);if(!entry)return false;
  const key=pose(actor,time,presentation),frame=entry.motions[key],path=frame?.path??entry.atlas?.path;
  if(!frame||!path)return false;
  const image=queue(cache,path,'eager');if(!image?.complete||!image.naturalWidth)return false;
  const [sx,sy,sw,sh]=frame.sourceRect,[px,py]=frame.pivot,scale=size/entry.baseHeight,point=project(actor.x,actor.y);
  ctx.save();try{
   ctx.globalAlpha*=transform?.alpha??1;ctx.translate(point.x,point.y);ctx.scale(Number(transform?.scaleX)<0?-1:1,1);
   if(transform?.hit)ctx.filter='brightness(1.3) saturate(1.1)';
   ctx.drawImage(image,sx,sy,sw,sh,-px*scale,-py*scale,sw*scale,sh*scale);
  }finally{ctx.restore();}
  const metrics=draws[entry.id]??={idle:0,anticipation:0,strike:0};metrics[key]++;
  return true;
 }
 function assets(zone){const entry=byZone.get(zone);return entry?[...new Set([entry.atlas?.path,...Object.values(entry.motions).map(frame=>frame.path)].filter(Boolean))]:[];}
 window.__HAPIL_MIDBOSS_MOTIONS_RC135__=Object.freeze({version:'RC135',installed:true,profile,pose,draw,assets,clean,data:base,metrics:()=>JSON.parse(JSON.stringify(draws))});
})();
