/* RC127: a cached, alpha-exact material pass for the common jellybean only.
 * No new geometry, damage, RNG consumption, bloom canvas or rectangular background.
 * Boss hue is dominant; map mood only shifts shadow and small mineral highlights. */
(function(root){'use strict';
 const caches=new WeakMap(),MAX_VARIANTS=16;let maps={};
 const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():null;
 const rgb=v=>[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)),mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
 const hash=s=>Array.from(String(s)).reduce((h,c)=>(Math.imul(h^c.charCodeAt(0),16777619)>>>0),2166136261);
 const stats={builds:0,hits:0,failures:0};
 function palette(q={},color){
  const zone=String(q.danmakuZoneV31316??q.cosmicZoneV31318??q.rc127Zone??q.zone??'');
  const id=String(q.sourceId??q.danmakuOwnerIdV31316??q.ownerId??'');
  const registry=root.__HAPIL_LASERS_V31330__?.owners;const owner=Array.isArray(registry)?registry.find(a=>String(a.id)===id):null;
  const map=maps[zone]??{},text=String(map.name??'')+' '+String(owner?.name??'')+' '+zone;
  let mood=hex(map.color)??hex(map.accent);
  if(!mood)mood=/늪|독|숲|나무|부패|탐식|ep1a08/.test(text)?'#52664b':/빙|서리|눈|겨울|질투|심해/.test(text)?'#455e79':/화염|용암|핏|분노|지옥|발록/.test(text)?'#793d31':/탐욕|황금|금고|장부|연산/.test(text)?'#857049':/가면|루시퍼|심연|성전|ep1a11/.test(text)?'#62384d':'#504660';
  const main=hex(color)??hex(q.danmakuColorV31316)??hex(q.color)??hex(owner?.color)??'#bd637b';
  return{main,mood,seed:hash(zone+'|'+id),zone,owner:id};
 }
 function tint(image,color,q={}){
  if(!image||typeof document==='undefined')return image;
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!(width>0&&height>0)||width*height>4194304)return image;
  const p=palette(q,color),key=p.main+'|'+p.mood+'|'+(p.seed%4);
  let entry=caches.get(image);
  try{
   if(!entry){const base=document.createElement('canvas');base.width=width;base.height=height;const ctx=base.getContext('2d',{willReadFrequently:true});if(!ctx)return image;ctx.drawImage(image,0,0);entry={source:ctx.getImageData(0,0,width,height),variants:new Map()};caches.set(image,entry);}
   if(entry.variants.has(key)){stats.hits++;return entry.variants.get(key);}
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d');if(!ctx)return image;
   const out=ctx.createImageData(width,height),src=entry.source.data,dst=out.data,main=rgb(p.main),mood=rgb(p.mood);
   const shadow=mix([10,9,15],mood,.16),bone=mix(main,[201,192,167],.27),step=Math.max(1,Math.round(Math.min(width,height)/90));
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4,a=src[i+3];dst[i+3]=a;if(!a)continue;
    const light=(src[i]*.2126+src[i+1]*.7152+src[i+2]*.0722)/255;
    const alphaAt=(xx,yy)=>xx<0||yy<0||xx>=width||yy>=height?0:src[(yy*width+xx)*4+3];
    const edge=Math.min(alphaAt(x-step,y),alphaAt(x+step,y),alphaAt(x,y-step),alphaAt(x,y+step))<a*.62;
    const u=x/width,v=y/height,vein=Math.abs(Math.sin(u*18+Math.sin(v*13+p.seed%7)*.65+(p.seed%4)*.45));
    const crack=vein<.075&&light>.19&&light<.88;
    const grain=(((Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^p.seed)>>>0)%23)/255;
    let tint=mix(shadow,main,.30+Math.min(.47,light*.48)+grain);
    if(edge)tint=mix(tint,bone,.73);
    else if(crack)tint=mix(tint,bone,.70);
    else if(light>.80)tint=mix(tint,bone,(light-.8)*2.2);
    for(let c=0;c<3;c++)dst[i+c]=Math.max(0,Math.min(255,Math.round(tint[c])));
   }
   ctx.putImageData(out,0,0);
   if(entry.variants.size>=MAX_VARIANTS)entry.variants.delete(entry.variants.keys().next().value);
   entry.variants.set(key,canvas);stats.builds++;return canvas;
  }catch{stats.failures++;return image;}
 }
 function install(options={}){maps=options.maps??{};return true;}
 root.__HAPIL_DARK_JELLY_RC127__=Object.freeze({version:'RC127',tint,palette,install,snapshot:()=>({...stats,maxVariants:MAX_VARIANTS})});
})(typeof window!=='undefined'?window:globalThis);
