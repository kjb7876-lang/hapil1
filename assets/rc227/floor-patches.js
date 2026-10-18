/* RC227: a reviewed, asset-specific floor cell. The original Persona ellipse,
 * mirror bounds and every other map remain the base geometry.
 * This cell covers continuous cave paving northwest of the old mirrored box;
 * its outer polygon is inset by the same physical actor radius as native floor.
 */
(function(root){'use strict';
 const surface=Object.freeze({zone:'dist01',asset:'assets/maps/rc53/dist01-spider-cave.webp',sha256:'921ac7d2a2893aa53374a459b27d9ae87e4cc5c50cbdf0281259875820e72526',
  corners:Object.freeze([{x:5.4,y:20.2},{x:9,y:20.2},{x:9,y:25},{x:5.4,y:25}].map(Object.freeze))});
 const cache=new Map(),D=()=>root.__HAPIL_PERSONA_DUEL_RC134__,clean=s=>String(s??'').replace(/^\.\//,'').split(/[?#]/)[0];
 function enabled(scope){
  const current=root.__HAPIL_CONTROLS_V31329__?.binding?.state?.current,s=scope&&typeof scope==='object'?scope:current,zone=typeof scope==='string'?scope:s?.zone;
  if(zone!==surface.zone||s?.zone===zone&&D()?.active?.(s))return false;
  const authored=root.__HAPIL_MAP_DATA_RC138__?.[zone],live=root.__HAPIL_NATIVE_ARENA_RC138__?.maps?.[zone];
  return clean(authored?.activeMap)===surface.asset&&(!live?.map||clean(live.map)===surface.asset);
 }
 function clip(points,value){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],va=value(a),vb=value(b),inside=va>=-1e-10,next=vb>=-1e-10;if(inside)out.push(a);if(inside!==next){const t=va/(va-vb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}return out;}
 function polygon(which='all',radius=.8){
  if(!['left','right','all'].includes(which)||!Number.isFinite(radius)||radius<0||radius>1.5||!D()?.policy)return [];
  const p=D().policy,key=JSON.stringify([which,radius,p.centerSum,p.acrossRadius,p.depthRadius,p.centerGap]);if(cache.has(key))return cache.get(key);
  let result=surface.corners.map(q=>({...q}));
  const edges=surface.corners;for(let i=0;i<edges.length;i++){const a=edges[i],b=edges[(i+1)%edges.length],dx=b.x-a.x,dy=b.y-a.y,margin=radius*Math.hypot(dx,dy);result=clip(result,q=>dx*(q.y-a.y)-dy*(q.x-a.x)-margin);}
  // Keep the existing native ellipse as the outside safety wall. Only its
  // Persona-specific mirrored rectangle had cut this reviewed paving cell.
  const ellipse=Array.from({length:64},(_,i)=>{const a=i*Math.PI*2/64,u=Math.cos(a)*p.acrossRadius,v=Math.sin(a)*p.depthRadius;return{x:p.centerSum/2+(v+u)/Math.SQRT2,y:p.centerSum/2+(v-u)/Math.SQRT2};});
  for(let i=0;i<ellipse.length;i++){const a=ellipse[i],b=ellipse[(i+1)%ellipse.length],dx=b.x-a.x,dy=b.y-a.y,margin=radius*Math.hypot(dx,dy);result=clip(result,q=>dx*(q.y-a.y)-dy*(q.x-a.x)-margin);}
  if(which!=='all')result=clip(result,q=>which==='left'?q.y-q.x-p.centerGap:q.x-q.y-p.centerGap);
  const frozen=Object.freeze(result.map(Object.freeze));cache.set(key,frozen);return frozen;
 }
 function inside(q,poly){return Number.isFinite(q?.x)&&Number.isFinite(q?.y)&&poly.length>=3&&poly.every((a,i)=>{const b=poly[(i+1)%poly.length];return(b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x)>=-1e-8;});}
 function contains(q,which,radius,scope){return enabled(scope)&&inside(q,polygon(which,radius));}
 function point(q,which,radius,scope,base){
  if(!enabled(scope)||!Number.isFinite(q?.x)||!Number.isFinite(q?.y))return base;
  const poly=polygon(which,radius);if(inside(q,poly))return{x:q.x,y:q.y};
  let best=base,distance=(base.x-q.x)**2+(base.y-q.y)**2;
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/(dx*dx+dy*dy||1))),p={x:a.x+t*dx,y:a.y+t*dy},d=(p.x-q.x)**2+(p.y-q.y)**2;if(d<distance){best=p;distance=d;}}
  return best;
 }
 root.__HAPIL_FLOOR_PATCHES_RC227__=Object.freeze({surface,enabled,polygon,contains,point});
})(typeof window==='object'?window:globalThis);
