/* RC131: hero-only image availability fallback. No damage, input, movement,
 * save, artwork or global Canvas prototype changes. Normal decoded draws delegate
 * unchanged; fallback options are rebuilt for the actual replacement asset.
 */
(function(root){
 'use strict';
 if(root.__HAPIL_HERO_RECOVERY_RC131__)return;
 const ids=Object.freeze(['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner']);
 const owners=ids.map(id=>[id,new RegExp('(?:/|^)'+id+'(?:/|[-_.])')]);
 const ring=['e','se','s','sw','w','nw','n','ne'];
 const vectors={nw:[-1,0],n:[-1,-1],ne:[0,-1],w:[-1,1],e:[1,-1],sw:[0,1],s:[1,1],se:[1,0]};
 const stats={calls:0,unchanged:0,fallbacks:0,unavailable:0,laurenFallbacks:0,optionErrors:0};
 let installed=false;
 const clean=p=>typeof p==='string'?p.split(/[?#]/,1)[0]:'';
 const decoded=im=>!!im&&im.complete===true&&Number(im.naturalWidth)>0&&Number(im.naturalHeight)>0;
 function owner(path){
  const p=clean(path);
  if(!/^\.\/assets\/(?:hero_direction\d+\/|heroes\/|hero-authored[^/]*\/)/.test(p))return null;
  return owners.find(([,pattern])=>pattern.test(p))?.[0]||null;
 }
 function ordered(sector){const index=ring.indexOf(sector),center=index<0?2:index;return ring.map((s,i)=>({s,d:Math.min((i-center+8)%8,(center-i+8)%8),i})).sort((a,b)=>a.d-b.d||a.i-b.i).map(r=>r.s);}
 function sectorOf(path,options={}){
  const p=clean(path),exact=p.match(/\/([nsew]{1,2})\.webp$/)?.[1];
  if(ring.includes(options.heroSpearRC13?.sector))return options.heroSpearRC13.sector;
  if(ring.includes(exact))return exact;
  const dir=options.canonicalHeroRC5?.dir||p.match(/(?:-|_)(front|back|left|right)(?:\.|_)/)?.[1];
  return {front:'s',back:'n',left:'w',right:'e'}[dir]||'s';
 }
 function direction(cache,id,sector,paths){
  if(!cache||!ids.includes(id)||!paths)return null;
  for(const candidate of ordered(sector)){const path=paths[candidate];if(owner(path)!==id)continue;const image=cache[path];if(decoded(image))return{hero:id,sector:candidate,path,image};}
  return null;
 }
 function lauren(cache,sector,paths){const pick=direction(cache,'lauren',sector,paths);if(pick&&pick.sector!==sector)stats.laurenFallbacks++;return pick;}
 function wrap(deps){
  if(!deps||['draw','queue','options','hero'].some(k=>typeof deps[k]!=='function'))throw new TypeError('RC131 native hero dependencies required');
  const base=deps.draw;
  function draw(ctx,cache,path,x,y,size=55,options={}){
   const id=owner(path);
   if(!id||options.centerPivot||!cache||!ctx)return base.call(this,ctx,cache,path,x,y,size,options);
   stats.calls++;
   const canonical=options.canonicalHeroRC5;
   const sheet=canonical?.hero===id?root.__HAPIL_HERO_CONSISTENCY_RC5__?.sheets?.[id]?.[canonical.sheet]:null;
   const preferred=sheet||path;
   const primary=deps.queue(cache,preferred,'eager');
   if(decoded(primary)){stats.unchanged++;return base.call(this,ctx,cache,path,x,y,size,options);}
   // Keep the established bounded retry loader running for the requested asset;
   // never replace its cache entry with a different hero or differently cropped image.
   const D=root.__HAPIL_DIRECTION_V31334__,paths={};
   for(const p of D?.assetsFor?.(id)||[]){const s=clean(p).match(/\/([nsew]{1,2})\.webp$/)?.[1];if(ring.includes(s)&&owner(p)===id)paths[s]=p;}
   const requestedSector=sectorOf(path,options),pick=direction(cache,id,requestedSector,paths);
   // Never borrow another character or an arbitrary effect when all own art is
   // unavailable. Existing collision/health indicators and loader remain native.
   if(!pick){stats.unavailable++;return;}
   const [dx,dy]=vectors[pick.sector];let replacement;
   try{
    replacement=deps.options({},deps.hero(id),{kind:'move',started:0,until:0,dx,dy,facing:dx<0?-1:1,characterSectorV31342:pick.sector},pick.path);
    replacement={...replacement};
    // A single directional bitmap must never inherit a missing atlas frame/crop.
    delete replacement.canonicalHeroRC5;delete replacement.uploadedHeroMotionRC4;delete replacement.authoredWalkV31345;
    if(id==='lauren')replacement.heroSpearRC13={hero:id,sector:pick.sector,kind:'idle'};
    for(const key of ['alpha','hit'])if(Object.prototype.hasOwnProperty.call(options,key))replacement[key]=options[key];
   }catch(error){stats.optionErrors++;return;}
   stats.fallbacks++;
   return base.call(this,ctx,cache,pick.path,x,y,size,replacement);
  }
  installed=true;return draw;
 }
 root.__HAPIL_HERO_RECOVERY_RC131__=Object.freeze({version:'RC131',ids,owner,decoded,ordered,sectorOf,direction,lauren,wrap,get installed(){return installed;},snapshot:()=>({version:'RC131',installed,...stats})});
})(typeof window!=='undefined'?window:globalThis);
