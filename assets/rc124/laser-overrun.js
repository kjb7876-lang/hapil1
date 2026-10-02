/* RC124: small map-image overscan, shared by laser rendering and contact.
   RC123 still owns clipping, connectivity and input validation. No beam art edits. */
(()=>{'use strict';
 const PAD=32,EPS=1e-5,cache=new WeakMap();let installed=false,project=null,inverse=null;
 const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<EPS*2;
 const key=p=>Math.round(p.x/EPS)+','+Math.round(p.y/EPS);
 const stats={extendedTails:0,cacheHits:0};
 function mapRect(c){
  const geo=window.__HAPIL_GEOMETRY_V31345__,owner=window.__HAPIL_LASERS_V31330__?.owners?.find(o=>o.id===c?.sourceId);
  const r=geo?.profile?.(c?.zone??owner?.zone)?.rect??geo?.bounds;
  return r&&[r.x,r.y,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0?r:{x:-152,y:-60,width:1584,height:990};
 }
 function paintBounds(c){const r=mapRect(c);return{minX:r.x-PAD,minY:r.y-PAD,maxX:r.x+r.width+PAD,maxY:r.y+r.height+PAD};}
 function onPaintBoundary(c,p){if(!project||!finite(p))return false;const q=project(p.x,p.y),b=paintBounds(c);return finite(q)&&q.x>=b.minX-EPS*4&&q.x<=b.maxX+EPS*4&&q.y>=b.minY-EPS*4&&q.y<=b.maxY+EPS*4&&[q.x-b.minX,q.x-b.maxX,q.y-b.minY,q.y-b.maxY].some(v=>Math.abs(v)<EPS*4);}
 function extend(c,source){
  if(!project||!inverse||!Array.isArray(source)||!source.length)return source;
  const b=paintBounds(c),signature=JSON.stringify([b,c?.cx,c?.cy]);let memo=cache.get(source);
  if(memo?.has(signature)){stats.cacheHits++;return memo.get(signature);}
  const degree=new Map();for(const l of source)for(const p of[l.a,l.b])degree.set(key(p),(degree.get(key(p))??0)+1);
  const origin=finite({x:c?.cx,y:c?.cy})?{x:c.cx,y:c.cy}:null;
  const out=source.map(l=>{let result=l;
   for(const side of['a','b']){
    const tip=l[side],other=l[side==='a'?'b':'a'];
    if(degree.get(key(tip))!==1||(origin&&near(tip,origin)))continue;
    const p=project(tip.x,tip.y),q=project(other.x,other.y);if(!finite(p)||!finite(q))continue;
    // The RC123 tail already leaves the legal arena. Only continue its tangent.
    const dx=p.x-q.x,dy=p.y-q.y;let t=Infinity;
    if(dx>EPS)t=Math.min(t,(b.maxX-p.x)/dx);else if(dx<-EPS)t=Math.min(t,(b.minX-p.x)/dx);
    if(dy>EPS)t=Math.min(t,(b.maxY-p.y)/dy);else if(dy<-EPS)t=Math.min(t,(b.minY-p.y)/dy);
    if(!Number.isFinite(t)||t<=EPS)continue;
    const end=inverse({x:p.x+dx*t,y:p.y+dy*t});if(!finite(end))continue;
    result={...result,[side]:end};stats.extendedTails++;
   }return result;
  });
  if(!memo){memo=new Map();cache.set(source,memo);}if(memo.size>=6)memo.clear();memo.set(signature,out);return out;
 }
 function install(projection){
  if(installed)return true;const base=window.__HAPIL_LASER_TOPOLOGY_RC108__;if(!base?.normalize||typeof projection!=='function')return false;
  const a=projection(0,0),x=projection(1,0),y=projection(0,1);if(![a,x,y].every(finite))return false;
  const xx=x.x-a.x,xy=x.y-a.y,yx=y.x-a.x,yy=y.y-a.y,det=xx*yy-xy*yx;if(Math.abs(det)<EPS)return false;
  project=projection;inverse=p=>{const px=p.x-a.x,py=p.y-a.y;return{x:(px*yy-py*yx)/det,y:(xx*py-xy*px)/det};};
  window.__HAPIL_LASER_TOPOLOGY_RC108__=Object.freeze({...base,version:'RC124',normalize:(c,lines,pre=false)=>extend(c,base.normalize(c,lines,pre)),paintBounds,onPaintBoundary,overscanPixels:PAD,metrics:()=>({...base.metrics(),...stats})});
  installed=true;return true;
 }
 window.__HAPIL_LASER_OVERRUN_RC124__=Object.freeze({version:'RC124',install,extend,mapRect,paintBounds,onPaintBoundary,overscanPixels:PAD,get installed(){return installed;},metrics:()=>({...stats})});
})();
