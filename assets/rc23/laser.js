(()=>{'use strict';
 const memo=new Map(),reports=[];
 const dist=(p,a,b)=>{const x=b.x-a.x,y=b.y-a.y,l=x*x+y*y,u=l?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/l)):0;return Math.hypot(p.x-a.x-u*x,p.y-a.y-u*y);};
 function width(c,target=.66){
  const key=[c.zone,c.type,c.cx,c.cy,c.radius,target].join('|');if(memo.has(key))return memo.get(key);
  const api=window.__HAPIL_BLOOD_RC16__,core=window.__HAPIL_COMBAT_V31333__?.core;
  if(!api?.geometry||!core)return 2.4;
  const lines=api.geometry(c).map(l=>({a:core(l.a),b:core(l.b)}));if(!lines.length)return 2.4;
  const floor=window.__HAPIL_GEOMETRY_V31345__,samples=[];
  for(let x=1.65;x<30.6;x+=.65)for(let y=1.65;y<30.6;y+=.65){
   if(floor?.contains&&!floor.contains(c.zone,x,y,0))continue;
   const p=core({x,y});samples.push(Math.min(...lines.map(l=>dist(p,l.a,l.b))));
  }
  if(samples.length<8)return 2.4;
  samples.sort((a,b)=>a-b);
  const body=window.__HAPIL_CONTACT_V31336__?.cfg.bodyRadius??4.5;
  const threshold=samples[Math.min(samples.length-1,Math.floor(samples.length*target))];
  const value=Math.max(.5,Math.min(12,(threshold-body)/27));
  const coverage=samples.filter(d=>d<=value*27+body+1e-7).length/samples.length;
  memo.set(key,value);if(memo.size>256)memo.delete(memo.keys().next().value);
  reports.push({zone:c.zone,type:c.type,samples:samples.length,target,coverage,width:value});if(reports.length>64)reports.shift();return value;
 }
 window.__HAPIL_LASER_RC22__=Object.freeze({width,reports:()=>reports.map(r=>({...r}))});
})();
