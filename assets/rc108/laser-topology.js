/* RC108: connect every beam endpoint in the shared render/contact geometry.
   Bridges stay inside one hazardous region; announced RC97 escape bands remain open. */
(()=>{'use strict';
 const memo=new WeakMap(),EPS=1e-5,pointKey=p=>Math.round(p.x/EPS)+','+Math.round(p.y/EPS),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const stats={normalizations:0,bridges:0,forks:0,splits:0,cacheHits:0};
 function bands(c){if(c?.bossFinaleV31334)return[[0,2+(c.beamWidth+16)/27,c.angle,c.cx,c.cy]];const p=c?.rc97Choice;if(!p)return[];const complex=window.__HAPIL_CONNECTED_LASER_V31377__?.complexType(c.type),half=c.width*1.25*(complex?1.18:1);return[[p.broad,half+1.55],[p.narrow,half+.60]];}
 function region(p,rows){return rows.map(([center,r,angle,cx,cy])=>{const v=angle===undefined?(p.x+p.y)*.5:-(p.x-p.y-cx+cy)*Math.sin(angle)+((p.x+p.y-cx-cy)*.5)*Math.cos(angle);return v<center-r+EPS?-1:v>center+r-EPS?1:0;}).join(',');}
 function safeBridge(a,b,rows){return region(a,rows)===region(b,rows)&&!region(a,rows).split(',').includes('0');}
 function intersection(a,b){const u={x:a.b.x-a.a.x,y:a.b.y-a.a.y},v={x:b.b.x-b.a.x,y:b.b.y-b.a.y},cross=u.x*v.y-u.y*v.x;if(Math.abs(cross)<EPS)return null;const w={x:b.a.x-a.a.x,y:b.a.y-a.a.y},t=(w.x*v.y-w.y*v.x)/cross,k=(w.x*u.y-w.y*u.x)/cross;return t>=-EPS&&t<=1+EPS&&k>=-EPS&&k<=1+EPS?{x:a.a.x+u.x*t,y:a.a.y+u.y*t}:null;}
 function split(lines,i,p){const l=lines[i];if(distance(l.a,p)<EPS||distance(l.b,p)<EPS)return;lines.splice(i,1,{...l,b:p},{...l,a:p});stats.splits++;}
 function isolated(lines){const degree=new Map();for(const l of lines)for(const p of[l.a,l.b])degree.set(pointKey(p),(degree.get(pointKey(p))??0)+1);return lines.findIndex(l=>degree.get(pointKey(l.a))===1&&degree.get(pointKey(l.b))===1);}
 function normalize(c,source,preChoice=false){if(!source?.length)return source??[];const rows=preChoice?[]:bands(c),key=JSON.stringify([rows,source.map(l=>[l.a.x,l.a.y,l.b.x,l.b.y,l.width])]);let cache=memo.get(c);if(cache?.has(key)){stats.cacheHits++;return cache.get(key);}const lines=source.filter(l=>distance(l.a,l.b)>EPS).map(l=>({...l,a:{...l.a},b:{...l.b}}));
  for(let guard=0;guard<source.length*3+4;guard++){const i=isolated(lines);if(i<0)break;const l=lines[i];let joined=false;
   for(let j=0;j<lines.length;j++){if(i===j)continue;const p=intersection(l,lines[j]);if(!p)continue;split(lines,Math.max(i,j),p);split(lines,Math.min(i,j),p);joined=true;break;}
   if(joined)continue;
   let best=null;for(let j=0;j<lines.length;j++)if(j!==i)for(const a of[l.a,l.b])for(const b of[lines[j].a,lines[j].b]){const d=distance(a,b);if(d>EPS&&safeBridge(a,b,rows)&&(!best||d<best.d))best={a,b,d};}
   if(best){lines.push({a:best.a,b:best.b,width:l.width??c.width,rc108Connector:true});stats.bridges++;continue;}
   // A single beam left by clipping or an escape band gains a short angled branch.
   const len=distance(l.a,l.b),dx=(l.b.x-l.a.x)/len,dy=(l.b.y-l.a.y)/len;for(const [a,sign]of[[l.a,1],[l.b,-1]])for(const side of[-1,1]){const b={x:a.x+dx*sign*.6-dy*side*.55,y:a.y+dy*sign*.6+dx*side*.55};if(b.x<1.4||b.x>30.6||b.y<1.4||b.y>30.6||!safeBridge(a,b,rows))continue;lines.push({a,b,width:l.width??c.width,rc108Connector:true});stats.forks++;joined=true;break;}if(joined)continue;
   throw Error('RC108 beam cannot connect inside its announced hazard region');
  }
  if(isolated(lines)>=0)throw Error('RC108 isolated beam remains');stats.normalizations++;if(!cache){cache=new Map();memo.set(c,cache);}if(cache.size>=6)cache.clear();cache.set(key,lines);return lines;
 }
 function native(h){const a={x:h.originX,y:h.originY},b={x:h.x,y:h.y},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};return[{a,b:m,width:h.width},{a:m,b,width:h.width}];}
 function renderNative(ctx,h,project,image,settings={},alpha=1){const renderer=window.__HAPIL_CONNECTED_LASER_V31377__;if(!renderer?.render||!h||!Number.isFinite(h.width))return false;const lines=native(h),a=project(h.originX,h.originY),b=project(h.x,h.y),len=Math.hypot(h.x-h.originX,h.y-h.originY)||1,ux=(h.x-h.originX)/len,uy=(h.y-h.originY)/len,screenLen=Math.hypot(b.x-a.x,b.y-a.y)||1,normal={x:-(b.y-a.y)/screenLen,y:(b.x-a.x)/screenLen},edge=project(h.originX-uy*h.width,h.originY+ux*h.width),half=Math.abs((edge.x-a.x)*normal.x+(edge.y-a.y)*normal.y),corners=[[h.originX-uy*h.width,h.originY+ux*h.width],[h.x-uy*h.width,h.y+ux*h.width],[h.x+uy*h.width,h.y-ux*h.width],[h.originX+uy*h.width,h.originY-ux*h.width]].map(p=>project(...p));
  ctx.save();try{ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();renderer.render(ctx,lines.map(l=>({a:project(l.a.x,l.a.y),b:project(l.b.x,l.b.y)})),{width:half,image,color:h.color,accent:h.accent,alpha,quiet:settings.reducedFlash===true,low:settings.lowFx===true});}finally{ctx.restore();}return true;
 }
 window.__HAPIL_LASER_TOPOLOGY_RC108__=Object.freeze({version:'RC108',normalize,isolated,bands,region,native,renderNative,metrics:()=>({...stats})});
})();
