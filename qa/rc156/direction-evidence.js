/* QA only: verify the selected native bitmap, including authored atlas cells.
 * Logical muzzle paths may differ from the canonical body atlas. */
(function(root){'use strict';
 const finite=Number.isFinite,near=(a,b)=>finite(a)&&finite(b)&&Math.abs(a-b)<1e-6;
 function sameSource(a,b,base){try{const x=new URL(a,base),y=new URL(b,base);return x.origin===y.origin&&x.pathname===y.pathname;}catch{return false;}}
 function inspect(row,base){
  const failures=[],selected=row.pose?.options?.canonicalHeroRC5,authored=row.authored;
  const path=selected?authored?.path:row.body?.path;
  const draws=(row.draws??[]).filter(d=>d.alpha>0&&sameSource(d.src,path,base));
  if(!row.pose?.path)failures.push('logical pose path missing');
  if(!path||!draws.length)failures.push('selected native body was not painted');
  if(!(row.body?.area>0))failures.push('native bitmap body is empty');
  if(selected){
   if(!authored||selected.hero!==row.hero||selected.kind!==row.kind||selected.dir!==authored.direction||selected.frame!==authored.state?.frame||selected.sheet!==authored.state?.sheet)failures.push('authored selection disagrees with source manifest/state');
   const cells=draws.filter(d=>Array.isArray(d.sourceRect)&&d.imageSize?.every(v=>finite(v)&&v>0)&&d.sourceRect.every(finite)&&d.rect?.every(finite));
   const original=authored?.imageSize??[],[w,h]=original,f=selected.frame,c=f&3,r=f>>2,x=Math.round(c*w/4),right=Math.round((c+1)*w/4),y=Math.round(r*h/2),bottom=Math.round((r+1)*h/2),cell=[x,y,right-x,bottom-y];
   const body=cells.find(d=>d.sourceRect.every((v,i)=>near(v,cell[i]*d.imageSize[i%2]/original[i%2])));
   if(!body)failures.push('selected complete atlas cell was not painted');
   else{
    const [,,sw,sh]=cell,[x,y,w,h]=body.rect,sx=w/sw,sy=h/sh,foot=authored?.feet?.[selected.frame];
    if(!(sx>0&&sy>0)||!near(sx,sy))failures.push('authored body was flipped or stretched');
    if(!near(x,-sw/2*sx)||!near(y,-foot*sy))failures.push('measured authored foot pivot changed');
    const t=body.transform;if(!t||![t.a,t.b,t.c,t.d,t.e,t.f].every(finite)||!(t.a*t.d-t.b*t.c>0)||!near(t.b,0)||!near(t.c,0))failures.push('authored body transform rotates/flips or is invalid');
   }
  }
  const v=row.projectedInput;if(!v||![v.x,v.y].every(finite)||!near(Math.hypot(v.x,v.y),1))failures.push('world input projection is invalid');
  return{status:failures.length?'failed':'passed',failures,path,paintCount:draws.length,sourceFamily:selected?'canonical authored atlas':'native bitmap',logicalMuzzlePath:row.pose?.path??null};
 }
 const api=Object.freeze({sameSource,inspect});root.__RC156_DIRECTION_EVIDENCE__=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
