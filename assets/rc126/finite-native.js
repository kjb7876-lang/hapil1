/* RC126 finite native beams: one rounded footprint for drawing and damage.
 * The authored origin and radius are immutable. This is NOT the RC124
 * map-spanning laser topology; no endpoint is extended to a map boundary. */
(function(root){'use strict';
 const EPS=1e-8,metrics={prepared:0,renders:0};
 function handles(h){return !!h&&h.spectacleV31317===true&&h.spectacleModeV31317==='beam'&&h.shape==='line';}
 function geometry(h){
  if(!handles(h)||![h.originX,h.originY,h.x,h.y,h.radius,h.width].every(Number.isFinite)||h.radius<=EPS||h.width<=0)return null;
  const dx=h.x-h.originX,dy=h.y-h.originY,n=Math.hypot(dx,dy);if(n<=EPS)return null;
  const ux=dx/n,uy=dy/n,length=h.radius,width=h.width,round=Math.min(width,length/2);
  const end={x:h.originX+ux*length,y:h.originY+uy*length};
  if(![end.x,end.y,round].every(Number.isFinite))return null;
  return{a:{x:h.originX,y:h.originY},b:end,ux,uy,length,width,round};
 }
 function prepare(s,h){
  if(h?.rc126NativePrepared)return false;const g=geometry(h);if(!g)return false;
  h.rc126NativeOriginal={originX:h.originX,originY:h.originY,x:h.x,y:h.y,radius:h.radius,width:h.width};
  // x/y historically encode a heading target while radius encodes reach.
  // Canonicalize only that target; preserve reach and the emitter exactly.
  h.x=g.b.x;h.y=g.b.y;h.rc126NativePrepared=true;metrics.prepared++;return true;
 }
 function distance(p,h){
  const g=geometry(h);if(!g||!p||![p.x,p.y].every(Number.isFinite))return Infinity;
  const dx=p.x-g.a.x,dy=p.y-g.a.y,u=dx*g.ux+dy*g.uy,v=-dx*g.uy+dy*g.ux;
  const qx=Math.abs(u-g.length/2)-(g.length/2-g.round),qy=Math.abs(v)-(g.width-g.round);
  return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-g.round;
 }
 function contains(p,h){return distance(p,h)<=EPS;}
 function render(ctx,h,project,image,settings={},alpha=1){
  const g=geometry(h),renderer=root.__HAPIL_CONNECTED_LASER_V31377__;
  if(!g||!ctx||typeof project!=='function'||typeof renderer?.render!=='function')return false;
  const a=project(g.a.x,g.a.y),b=project(g.b.x,g.b.y),x=project(g.a.x+g.ux,g.a.y+g.uy),y=project(g.a.x-g.uy,g.a.y+g.ux);
  if(![a.x,a.y,b.x,b.y,x.x,x.y,y.x,y.y].every(Number.isFinite))return false;
  const screenLength=Math.hypot(b.x-a.x,b.y-a.y);if(screenLength<=EPS)return false;
  const half=Math.abs((y.x-a.x)*(-(b.y-a.y)/screenLength)+(y.y-a.y)*((b.x-a.x)/screenLength))*g.width;
  if(!(half>0))return false;
  const L=g.length,W=g.width,r=g.round,transform=ctx.getTransform();
  ctx.save();try{
   // Exact circular arcs in world beam coordinates become the correct affine
   // ellipses in isometric screen space. The clip never adds an opaque image.
   ctx.transform(x.x-a.x,x.y-a.y,y.x-a.x,y.y-a.y,a.x,a.y);
   ctx.beginPath();ctx.moveTo(r,-W);ctx.lineTo(L-r,-W);ctx.arc(L-r,-W+r,r,-Math.PI/2,0);
   ctx.lineTo(L,W-r);ctx.arc(L-r,W-r,r,0,Math.PI/2);ctx.lineTo(r,W);ctx.arc(r,W-r,r,Math.PI/2,Math.PI);
   ctx.lineTo(0,-W+r);ctx.arc(r,-W+r,r,Math.PI,Math.PI*1.5);ctx.closePath();ctx.clip();
   ctx.setTransform(transform);
   renderer.render(ctx,[{a,b}],{width:half,image,color:h.color,accent:h.accent,alpha,quiet:settings.reducedFlash===true,low:settings.lowFx===true});
   metrics.renders++;
  }finally{ctx.restore();}return true;
 }
 root.__HAPIL_FINITE_NATIVE_RC126__=Object.freeze({version:'RC126-finite-2',handles,geometry,prepare,distance,contains,render,metrics:()=>({...metrics})});
})(typeof window!=='undefined'?window:globalThis);
