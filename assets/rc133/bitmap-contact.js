/* RC133: compute contact from the final bitmap draw, before simulation damage.
 * Replays presentation on an isolated transform recorder, never on the live canvas.
 * Decoded images are shared; collision does not depend on a preceding rendered frame.
 */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d;
 function create({render,project,camera,world,alphaBounds,settings,heroDraw,enemyDraw}){
  const scratch=document.createElement('canvas');scratch.width=scratch.height=1;
  const ctx=scratch.getContext('2d'),memo=new WeakMap(),bodies=new WeakMap();let cache=Object.create(null),target=null;
  const stats={plans:0,decoded:0,missing:0};
  function observe(canvas,images){if(canvas)target=canvas;if(images)cache=images;}
  function measure(s,actor,draw){
   const canvas=target??document.querySelector('.game-stage canvas');if(!canvas)return [];
   const loaded=root.__HAPIL_MEDIA_ART_RC133__?.picture(actor.sprite);if(loaded&&!cache[actor.sprite]?.naturalWidth)cache[actor.sprite]=loaded;
   const rows=[],raw=ctx,noop=()=>{};
   const view=new Proxy(Object.create(null),{get(o,k){if(Object.hasOwn(o,k))return o[k];if(k==='canvas')return canvas;
    if(k==='drawImage')return(...args)=>{
     if(args.length!==5&&args.length!==9||raw.globalAlpha<.03)return;
     const im=args[0],iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(!(iw>0&&ih>0))return;
     const bounds=alphaBounds(im);if(!bounds)return;
     const crop=args.length===9?args.slice(1,5):[0,0,iw,ih],dest=args.slice(-4),[sx,sy,sw,sh]=crop,[dx,dy,dw,dh]=dest;
     const l=Math.max(sx,bounds.x),t=Math.max(sy,bounds.y),r=Math.min(sx+sw,bounds.x+bounds.w),b=Math.min(sy+sh,bounds.y+bounds.h);
     if(!(r>l&&b>t&&sw>0&&sh>0&&dw!==0&&dh!==0)||![sx,sy,sw,sh,dx,dy,dw,dh].every(Number.isFinite))return;
     const transform=base.inverse().multiply(raw.getTransform()),at=(x,y)=>{const a=dx+(x-sx)/sw*dw,c=dy+(y-sy)/sh*dh;return{x:transform.a*a+transform.c*c+transform.e,y:transform.b*a+transform.d*c+transform.f};};
     const points=[at(l,t),at(r,t),at(r,b),at(l,b)],area=Math.abs((r-l)/sw*dw*(b-t)/sh*dh*(transform.a*transform.d-transform.b*transform.c));
     if(!(area>1e-6)||!points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))return;
     const box=canvas.getBoundingClientRect(),px=box.width/Math.max(1,canvas.width),py=box.height/Math.max(1,canvas.height);
     const screen=[at(l,t),at(r,t),at(r,b),at(l,b)].map(p=>{const q=base.transformPoint(p);return{x:q.x*px,y:q.y*py};});
     const left=Math.min(...screen.map(p=>p.x)),right=Math.max(...screen.map(p=>p.x)),top=Math.min(...screen.map(p=>p.y)),bottom=Math.max(...screen.map(p=>p.y));
     rows.push({points,area,alpha:raw.globalAlpha,path:im.currentSrc||im.src||'',crop:[l,t,r-l,b-t],displayBounds:{left,right,top,bottom,width:right-left,height:bottom-top,longEdge:Math.max(right-left,bottom-top)}});
    };
    if(['fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','putImageData'].includes(k))return noop;
    const v=Reflect.get(raw,k,raw);return typeof v==='function'?v.bind(raw):v;
   },set(o,k,v){if(k==='drawImage'||typeof v==='function'){o[k]=v;return true;}return Reflect.set(raw,k,v,raw);},defineProperty:(o,k,v)=>Reflect.defineProperty(o,k,v),deleteProperty:(o,k)=>Reflect.deleteProperty(o,k)});
   raw.save();let base;try{
    raw.setTransform(n(canvas.width,1280)/1280,0,0,n(canvas.height,720)/720,0,0);raw.globalAlpha=1;raw.filter='none';world?.(view,canvas,s);
    const cam=camera(s);view.translate(cam.x,cam.y);view.scale(cam.scale??1,cam.scale??1);base=raw.getTransform();
    draw(view,cache,{...actor},s.time,settings(s));
   }finally{raw.restore();raw.beginPath();}
   stats.plans++;if(rows.length)stats.decoded++;else stats.missing++;return rows;
  }
  function projectile(s,q){
   // Recompute when time, position, viewport or population LOD changes.
   const box=(target??document.querySelector('.game-stage canvas'))?.getBoundingClientRect?.(),signature=[s,s.time,q.x,q.y,q.sprite,s.hostileProjectiles?.length,box?.width,box?.height,settings(s).lowFx,cache[q.sprite]?.naturalWidth];
   const prior=memo.get(q);if(prior&&signature.every((x,i)=>x===prior.signature[i]))return prior.value;
   const rows=measure(s,q,render),p=project(q.x,q.y),center={x:p.x,y:p.y+n(q.visualYV31333,-18)};
   // A trailing echo, warning icon, aura or Stand is not the main attack body.
   const row=rows.filter(r=>{const x=r.points.reduce((v,p)=>v+p.x,0)/4,y=r.points.reduce((v,p)=>v+p.y,0)/4;return Math.hypot(x-center.x,y-center.y)<180;}).sort((a,b)=>b.area*b.alpha-a.area*a.alpha)[0];
   const value=row?{points:row.points.map(p=>({x:p.x-center.x,y:p.y-center.y})),path:row.path,area:row.area,displayBounds:row.displayBounds}:null;
   memo.set(q,{signature,value});return value;
  }
  function body(s,a,isHero){const signature=[s,s.time,a.x,a.y,a.activeHeroId??a.heroId,a.sprite,a.heroMotion?.kind,a.heroMotion?.until,a.currentPhase,a.fixedPhase],old=bodies.get(a);if(old?.value&&signature.every((x,i)=>x===old.signature[i]))return old.value;const rows=measure(s,a,isHero?heroDraw:enemyDraw),value=rows.at(-1)??null;bodies.set(a,{signature,value});return value;}
  function enemyContact(s,a,x,y,lift,padding){const row=body(s,a,false);if(!row)return null;const point=project(x,y);point.y+=lift;const points=row.points.map(v=>({x:v.x-point.x,y:v.y-point.y}));return root.__HAPIL_CONTACT_V31336__.classifyPolygonRelative({x:0,y:0},{x:0,y:0},points,padding,padding).hit;}
  return Object.freeze({observe,projectile,body,enemyContact,metrics:()=>({...stats})});
 }
 root.__HAPIL_BITMAP_CONTACT_RC133__=Object.freeze({create});
})(window);
