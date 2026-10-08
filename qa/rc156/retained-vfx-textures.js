'use strict';
(function(root){
 async function prepare({queue,cache,files,origin}){
  if(typeof queue!=='function'||!cache||!Array.isArray(files)||files.length!==4)throw Error('Expected the four verified trial originals');
  const images=new Map(),base=new URL(origin);
  for(const row of files){
   if(!/^\.\/assets\/[a-zA-Z0-9_./-]+\.webp$/.test(row.file)||images.has(row.file)||!(row.width>0&&row.height>0))throw Error('Invalid trial texture manifest');
   const im=queue(cache,row.file,'eager');
   if(!im)throw Error('Native queue did not return '+row.file);
   if(typeof im.decode==='function')await im.decode();
   const url=new URL(im.src,base);
   if(url.origin!==base.origin||url.pathname!==new URL(row.file,base).pathname||im.complete!==true||im.naturalWidth!==row.width||im.naturalHeight!==row.height)throw Error('Original trial texture is not ready or was replaced: '+row.file);
   images.set(row.file,im);
  }
  // Native cache pruning may delete a decoded image's key. Hold these four
  // original references only for this opt-in trial; never requeue inside an
  // owner-scoped painter, replace an asset, or alter native pruning policy.
  return Object.freeze({image:file=>images.get(file)??null,snapshot:current=>files.map(row=>{const im=images.get(row.file);return{file:row.file,source:im.src,complete:im.complete,width:im.naturalWidth,height:im.naturalHeight,nativeCacheRetained:current[row.file]===im};})});
 }
 const api=Object.freeze({prepare});if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.__HAPIL_VFX_TEXTURES_RC156__=api;
})(typeof window==='object'?window:null);
