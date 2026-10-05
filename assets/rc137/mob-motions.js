/* RC137: two authored raster poses for each ordinary hostile template.
 * Atlas bytes stay unchanged. Decode on first use, extract only small runtime
 * frames, release the full sheet and bound the ordinary-pose cache to 48.
 * Native attack clocks, world position, facing, stats and contacts are retained. */
(function(root){'use strict';
 const D=root.__HAPIL_MOB_MOTION_DATA_RC137__,rows=new Map(D.actors.map(r=>[r.id,r])),sheets=new Map(D.sources.map(r=>[r.path,r]));
 const frames=new Map(),loading=new Map(),errors=new Map();let clock=0;
 const clean=p=>String(p??'').split(/[?#]/)[0],metrics={decodedSheets:0,attackDraws:0,existingPoseDraws:0,evictions:0};
 function row(a){if(!a||a.boss||a.midboss||a.friendly||a.visualOnly||a.objectiveStructureV31238||a.protectedObjective||a.narrativeStructureV31238||a.neutral||a.canonAlly||a.canonAllyV31217||a.canonicalAllyV31217)return null;return rows.get(a.rc133TemplateId??a.templateId??a.id)??null;}
 function trim(){while(frames.size>48){let oldest=null;for(const entry of frames)if(!oldest||entry[1].used<oldest[1].used)oldest=entry;frames.delete(oldest[0]);oldest[1].image.src='';metrics.evictions++;}}
 async function load(path){
  if(loading.has(path))return loading.get(path);
  const job=(async()=>{const im=new Image();im.src='./'+path+'?rc137=43701';try{await im.decode();for(const cell of sheets.get(path).cells){const [x,y,w,h]=cell.rect,[l,t,r,b]=cell.alphaBounds,pad=2,sx=x+Math.max(0,l-pad),sy=y+Math.max(0,t-pad),sw=Math.min(w,r+pad)-Math.max(0,l-pad),sh=Math.min(h,b+pad)-Math.max(0,t-pad),scale=Math.min(1,192/Math.max(sw,sh)),c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(sw*scale));c.height=Math.max(1,Math.ceil(sh*scale));c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);const out=new Image();out.src=c.toDataURL('image/png');await out.decode();frames.set(cell.key,{image:out,used:++clock});}metrics.decodedSheets++;errors.delete(path);trim();}catch(e){errors.set(path,String(e));throw e;}finally{im.src='';}})();
  loading.set(path,job);try{await job;}finally{loading.delete(path);}
 }
 function picture(path){const f=frames.get(clean(path));if(!f)return null;f.used=++clock;return f.image;}
 function fallback(path){const r=D.actors.find(r=>r.source&&clean(r.attack)===clean(path));return r?.idle??null;}
 function pose(a,time){return Math.max(Number(a.attackAt??0),Number(a.recoverUntil??0),Number(a.atomicCastUntil31210??0))>time?'attack':'idle';}
 function select(a,time){const r=row(a);if(!r)return null;if(pose(a,time)==='idle')return r.idle;if(r.source){const im=picture(r.attack);if(!im){load(r.source).catch(()=>{});return r.idle;}metrics.attackDraws++;}else metrics.existingPoseDraws++;return r.attack;}
 async function warmZone(zone){const list=D.actors.filter(r=>r.zones.includes(zone));await Promise.all([...new Set(list.map(r=>r.source).filter(Boolean))].map(load));return list.length;}
 root.__HAPIL_MOB_MOTIONS_RC137__=Object.freeze({data:D,row,pose,select,picture,fallback,warmZone,load,metrics:()=>({...metrics,cachedFrames:frames.size,inflight:loading.size,errors:[...errors].map(([path,error])=>({path,error}))})});
})(window);
