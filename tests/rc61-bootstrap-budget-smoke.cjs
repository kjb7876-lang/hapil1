const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/index-v31526.js'),'utf8');
for(const [name,end] of [['promoteAsset','  function enrichPlan(plan, leaderId'],['promote','  function enrichPlan(plan, zone)']]){
 const start=source.indexOf('  function '+name+'(plan, path');assert(start>=0);
 const fn=new Function('isImagePath',source.slice(start,source.indexOf(end,start))+`\nreturn ${name};`)(p=>typeof p==='string'&&/\.png$/.test(p));
 for(const alreadyIncluded of [false,true]){
  const A=new Set(Array.from({length:30},(_,i)=>`asset-${i}.png`)),chosen=alreadyIncluded?'asset-1.png':'new.png';
  const original={all:new Set(A),A,B:new Set(),C:new Set(),deferred:new Set(),pins:new Set(A)};
  const out=fn(original,chosen,new Set(['asset-0.png','asset-2.png']));
  assert.equal(out.A.size,20);assert(out.A.has(chosen));assert.equal(original.A.size,30);
  for(const asset of A)assert(out.all.has(asset)&& (out.A.has(asset)||out.B.has(asset)),asset);
  if(name==='promote'){assert(out.A.has('asset-0.png'));assert(out.A.has('asset-2.png'));}
 }
}
assert(source.indexOf('await HAPIL_waitForLaunchRC61();')<source.indexOf("if(!await window.__HAPIL_RECOVERY_V31369__.prepareMap(Pe.current,'dist00'))"));
console.log('RC61 PASS: both asset promoters restore the 20-image eager budget without losing assets; already-promoted paths cannot strand boot.');
