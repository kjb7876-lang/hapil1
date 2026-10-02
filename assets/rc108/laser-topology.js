/* RC108: connect every beam endpoint in the shared render/contact geometry.
   RC121: all branches connect; former RC97/finale escape bands are removed.
   RC123 candidate: extend open terminals to the RC97 arena boundary, not in paint. */
(()=>{'use strict';
 const memo=new WeakMap(),EPS=1e-5,pointKey=p=>Math.round(p.x/EPS)+','+Math.round(p.y/EPS),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 // Same world-space clipping rectangle as RC97 choice-patterns.js.
 const bounds=Object.freeze({minX:1.1,minY:1.1,maxX:30.9,maxY:30.9});
 const stats={normalizations:0,bridges:0,forks:0,splits:0,cacheHits:0,boundaryExtensions:0};
 const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function bands(){return[];} // RC121: user explicitly removed all laser escape bands.
 function region(p,rows){return rows.map(([center,r,angle,cx,cy])=>{const v=angle===undefined?(p.x+p.y)*.5:-(p.x-p.y-cx+cy)*Math.sin(angle)+((p.x+p.y-cx-cy)*.5)*Math.cos(angle);return v<center-r+EPS?-1:v>center+r-EPS?1:0;}).join(',');}
 function safeBridge(a,b,rows){return region(a,rows)===region(b,rows)&&!region(a,rows).split(',').includes('0');}
 function intersection(a,b){const u={x:a.b.x-a.a.x,y:a.b.y-a.a.y},v={x:b.b.x-b.a.x,y:b.b.y-b.a.y},cross=u.x*v.y-u.y*v.x;if(Math.abs(cross)<EPS)return null;const w={x:b.a.x-a.a.x,y:b.a.y-a.a.y},t=(w.x*v.y-w.y*v.x)/cross,k=(w.x*u.y-w.y*u.x)/cross;return t>=-EPS&&t<=1+EPS&&k>=-EPS&&k<=1+EPS?{x:a.a.x+u.x*t,y:a.a.y+u.y*t}:null;}
 function split(lines,i,p){const l=lines[i];if(distance(l.a,p)<EPS||distance(l.b,p)<EPS)return;lines.splice(i,1,{...l,b:p},{...l,a:p});stats.splits++;}
 function splitCrossings(source){
  const hits=source.map(()=>[]);
  for(let i=0;i<source.length;i++)for(let j=i+1;j<source.length;j++){
   const a=source[i],b=source[j],u={x:a.b.x-a.a.x,y:a.b.y-a.a.y},v={x:b.b.x-b.a.x,y:b.b.y-b.a.y},cross=u.x*v.y-u.y*v.x;
   if(Math.abs(cross)<EPS)continue;
   const w={x:b.a.x-a.a.x,y:b.a.y-a.a.y},t=(w.x*v.y-w.y*v.x)/cross,k=(w.x*u.y-w.y*u.x)/cross;
   if(t<-EPS||t>1+EPS||k<-EPS||k>1+EPS)continue;
   const p={x:a.a.x+u.x*t,y:a.a.y+u.y*t};
   if(t>EPS&&t<1-EPS)hits[i].push({t,p});
   if(k>EPS&&k<1-EPS)hits[j].push({t:k,p});
  }
  const out=[];
  for(let i=0;i<source.length;i++){
   const line=source[i],rows=hits[i].sort((a,b)=>a.t-b.t),points=[line.a];
   for(const row of rows)if(distance(points[points.length-1],row.p)>EPS*2)points.push(row.p);
   points.push(line.b);
   for(let j=1;j<points.length;j++)if(distance(points[j-1],points[j])>EPS)out.push({...line,a:points[j-1],b:points[j]});
   if(points.length>2)stats.splits+=points.length-2;
  }
  return out;
 }
 function components(lines){
  const points=[],parent=[],edges=[];
  function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
  function node(p){let best=-1;for(let i=0;i<points.length;i++)if(distance(points[i],p)<=EPS*2){best=i;break;}if(best>=0)return best;best=points.length;points.push(p);parent.push(best);return best;}
  for(let i=0;i<lines.length;i++){
   const a=node(lines[i].a),b=node(lines[i].b);edges.push({line:i,a,b});
   const ra=root(a),rb=root(b);if(ra!==rb)parent[rb]=ra;
  }
  const groups=new Map();
  for(const edge of edges){const id=root(edge.a),row=groups.get(id)??{nodes:new Set(),lines:[]};row.nodes.add(edge.a);row.nodes.add(edge.b);row.lines.push(edge.line);groups.set(id,row);}
  return [...groups.values()].map(row=>({nodes:[...row.nodes].map(i=>points[i]),lines:row.lines}));
 }
 function isolated(lines){const degree=new Map();for(const l of lines)for(const p of[l.a,l.b])degree.set(pointKey(p),(degree.get(pointKey(p))??0)+1);return lines.findIndex(l=>degree.get(pointKey(l.a))===1&&degree.get(pointKey(l.b))===1);}
 function clipLine(line){
  let lo=0,hi=1;
  for(const [axis,min,max]of[['x',bounds.minX,bounds.maxX],['y',bounds.minY,bounds.maxY]]){
   const delta=line.b[axis]-line.a[axis];
   if(Math.abs(delta)<EPS){if(line.a[axis]<min||line.a[axis]>max)return null;continue;}
   let enter=(min-line.a[axis])/delta,leave=(max-line.a[axis])/delta;
   if(enter>leave)[enter,leave]=[leave,enter];
   lo=Math.max(lo,enter);hi=Math.min(hi,leave);if(lo>hi)return null;
  }
  const at=t=>({x:Math.max(bounds.minX,Math.min(bounds.maxX,line.a.x+(line.b.x-line.a.x)*t)),y:Math.max(bounds.minY,Math.min(bounds.maxY,line.a.y+(line.b.y-line.a.y)*t))});
  const a=at(lo),b=at(hi);return distance(a,b)>EPS?{...line,a,b}:null;
 }
 function onBoundary(p){return Math.abs(p.x-bounds.minX)<=EPS||Math.abs(p.x-bounds.maxX)<=EPS||Math.abs(p.y-bounds.minY)<=EPS||Math.abs(p.y-bounds.maxY)<=EPS;}
 function extendTerminals(c,source){
  // Work on copies: render/contact callers share the result, never a mutated cast.
  const lines=source.map(l=>({...l,a:{...l.a},b:{...l.b}})),degree=new Map();
  for(const l of lines)for(const p of[l.a,l.b])degree.set(pointKey(p),(degree.get(pointKey(p))??0)+1);
  const origin=finitePoint({x:c?.cx,y:c?.cy})?{x:c.cx,y:c.cy}:null;
  for(const l of lines){const original={a:{...l.a},b:{...l.b}};
   for(const side of['a','b']){
    const tip=original[side],other=original[side==='a'?'b':'a'];
    // Preserve the emitter and closed-loop/junction vertices; only free tails grow.
    if(degree.get(pointKey(tip))!==1||onBoundary(tip)||(origin&&distance(tip,origin)<=EPS*2))continue;
    const dx=tip.x-other.x,dy=tip.y-other.y;let t=Infinity;
    if(dx>EPS)t=Math.min(t,(bounds.maxX-tip.x)/dx);else if(dx<-EPS)t=Math.min(t,(bounds.minX-tip.x)/dx);
    if(dy>EPS)t=Math.min(t,(bounds.maxY-tip.y)/dy);else if(dy<-EPS)t=Math.min(t,(bounds.minY-tip.y)/dy);
    if(!Number.isFinite(t)||t<=EPS)continue;
    l[side]={x:Math.max(bounds.minX,Math.min(bounds.maxX,tip.x+dx*t)),y:Math.max(bounds.minY,Math.min(bounds.maxY,tip.y+dy*t))};stats.boundaryExtensions++;
   }
  }
  return lines;
 }
 function normalize(c,source,preChoice=false){
  if(!Array.isArray(source)||!source.length)return[];
  const valid=source.filter(l=>finitePoint(l?.a)&&finitePoint(l?.b)&&distance(l.a,l.b)>EPS);
  const rows=preChoice?[]:bands(c),key=JSON.stringify([rows,c?.cx,c?.cy,c?.width,valid.map(l=>[l.a.x,l.a.y,l.b.x,l.b.y,l.width])]);
  const canMemo=c!==null&&(typeof c==='object'||typeof c==='function');
  let cache=canMemo?memo.get(c):null;if(cache?.has(key)){stats.cacheHits++;return cache.get(key);}
  // Clip and extend BEFORE graph repair. Newly crossed beams are split again so
  // visible joins and damage queries use precisely the same segment vertices.
  let lines=splitCrossings(valid.map(clipLine).filter(Boolean));
  lines=splitCrossings(extendTerminals(c,lines));
  // A solitary straight ray needs no artificial fork: share its existing midpoint.
  if(lines.length===1){const l=lines[0],m={x:(l.a.x+l.b.x)/2,y:(l.a.y+l.b.y)/2};lines=[{...l,b:m},{...l,a:m}];}
  // A degree-two closed ring has no open terminal. Preserve its authored shape;
  // join separate graph components with the existing shortest-bridge rule.
  for(let guard=0;guard<valid.length*4+8;guard++){
   const groups=components(lines);if(groups.length<=1)break;
   let best=null;
   for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)for(const a of groups[i].nodes)for(const b of groups[j].nodes){
    const d=distance(a,b);if(d<=EPS||!safeBridge(a,b,rows))continue;
    if(!best||d<best.d)best={a,b,d};
   }
   if(!best)break;
   lines.push({a:{...best.a},b:{...best.b},width:c?.width??7,rc108Connector:true});stats.bridges++;
  }
  // Keep the established orphan repair after extending the original free tails.
  for(let guard=0;guard<valid.length*3+4;guard++){
   const i=isolated(lines);if(i<0)break;const l=lines[i];let joined=false;
   for(let j=0;j<lines.length;j++)if(i!==j){const p=intersection(l,lines[j]);if(!p)continue;split(lines,Math.max(i,j),p);split(lines,Math.min(i,j),p);joined=true;break;}
   if(joined)continue;
   let best=null;for(let j=0;j<lines.length;j++)if(i!==j)for(const a of[l.a,l.b])for(const b of[lines[j].a,lines[j].b]){const d=distance(a,b);if(d>EPS&&safeBridge(a,b,rows)&&(!best||d<best.d))best={a,b,d};}
   if(best){lines.push({a:{...best.a},b:{...best.b},width:l.width??c?.width??7,rc108Connector:true});stats.bridges++;continue;}
   const len=distance(l.a,l.b),dx=(l.b.x-l.a.x)/len,dy=(l.b.y-l.a.y)/len;
   for(const [a,sign]of[[l.a,1],[l.b,-1]])for(const side of[-1,1]){const b={x:a.x+dx*sign*.6-dy*side*.55,y:a.y+dy*sign*.6+dx*side*.55};if(b.x<1.4||b.x>30.6||b.y<1.4||b.y>30.6||!safeBridge(a,b,rows))continue;lines.push({a,b,width:l.width??c?.width??7,rc108Connector:true});stats.forks++;joined=true;break;}
   if(!joined)break;
  }
  if(isolated(lines)>=0)throw Error('RC108 isolated beam remains');
  stats.normalizations++;if(canMemo){if(!cache){cache=new Map();memo.set(c,cache);}if(cache.size>=6)cache.clear();cache.set(key,lines);}return lines;
 }
 // Native hazards retain their original endpoints until the native damage path
 // is verified. Do not lengthen just their painted beam or mutate h during draw.
 function native(h){const a={x:h.originX,y:h.originY},b={x:h.x,y:h.y},m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};return[{a,b:m,width:h.width},{a:m,b,width:h.width}];}
 function renderNative(ctx,h,project,image,settings={},alpha=1){const renderer=window.__HAPIL_CONNECTED_LASER_V31377__;if(!renderer?.render||!h||!Number.isFinite(h.width))return false;const lines=native(h),a=project(h.originX,h.originY),b=project(h.x,h.y),len=Math.hypot(h.x-h.originX,h.y-h.originY)||1,ux=(h.x-h.originX)/len,uy=(h.y-h.originY)/len,screenLen=Math.hypot(b.x-a.x,b.y-a.y)||1,normal={x:-(b.y-a.y)/screenLen,y:(b.x-a.x)/screenLen},edge=project(h.originX-uy*h.width,h.originY+ux*h.width),half=Math.abs((edge.x-a.x)*normal.x+(edge.y-a.y)*normal.y),corners=[[h.originX-uy*h.width,h.originY+ux*h.width],[h.x-uy*h.width,h.y+ux*h.width],[h.x+uy*h.width,h.y-ux*h.width],[h.originX+uy*h.width,h.originY-ux*h.width]].map(p=>project(...p));
  ctx.save();try{ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();renderer.render(ctx,lines.map(l=>({a:project(l.a.x,l.a.y),b:project(l.b.x,l.b.y)})),{width:half,image,color:h.color,accent:h.accent,alpha,quiet:settings.reducedFlash===true,low:settings.lowFx===true});}finally{ctx.restore();}return true;
 }
 window.__HAPIL_LASER_TOPOLOGY_RC108__=Object.freeze({version:'RC123-candidate',normalize,isolated,components,bands,region,native,renderNative,bounds,onBoundary,metrics:()=>({...stats})});
})();
