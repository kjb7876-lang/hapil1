'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const hook=`\n/* RC131_HERO_IMAGE_RECOVERY_BEGIN */
(()=>{
 let tries=0;
 function install(){
  if(window.__HAPIL_RC131_NATIVE_INSTALLED__)return;
  const recovery=window.__HAPIL_HERO_RECOVERY_RC131__;
  if(!recovery||!window.__HAPIL_RC130_NATIVE_INSTALLED__||!window.__HAPIL_HERO_CONSISTENCY_RC5__?.installed){if(++tries<600)setTimeout(install,20);return;}
  Ln=recovery.wrap({draw:Ln,queue:(...args)=>MONGSE_queueImage(...args),options:(...args)=>An(...args),hero:id=>F.find(h=>h.id===id)});
  window.__HAPIL_RC131_NATIVE_INSTALLED__=true;
 }
 install();
})();
/* RC131_HERO_IMAGE_RECOVERY_END */\n`;
const before=`  const chosen=poses[selected.sector]??poses.s,im=MONGSE_queueImage(cache,chosen,'eager');
  if(!im?.complete||!(im.naturalWidth||im.width)){stats.pending++;return true;}
  const meta=window.__HAPIL_DIRECTION_VERTICAL_V31337__?.lauren?.[selected.sector]??HAPIL_RC13_POSE_META.lauren[selected.sector]??HAPIL_RC13_POSE_META.lauren.s;`;
const after=`  const chosen=poses[selected.sector]??poses.s;let im=MONGSE_queueImage(cache,chosen,'eager'),renderSector=selected.sector;
  if(!im?.complete||!im.naturalWidth||!im.naturalHeight){
   const fallback=window.__HAPIL_HERO_RECOVERY_RC131__?.lauren(cache,selected.sector,poses);
   if(fallback){im=fallback.image;renderSector=fallback.sector;}
  }
  if(!im?.complete||!im.naturalWidth||!im.naturalHeight){stats.pending++;return true;}
  const meta=window.__HAPIL_DIRECTION_VERTICAL_V31337__?.lauren?.[renderSector]??HAPIL_RC13_POSE_META.lauren[renderSector]??HAPIL_RC13_POSE_META.lauren.s;`;
function once(text,from,to,label){assert.equal(text.split(from).length,2,'RC131 exact anchor '+label);return text.replace(from,to);}
function runtime(directory){
 const bundle=path.join(directory,'assets/index-v31526.js'),html=path.join(directory,'index.html');let code=fs.readFileSync(bundle,'utf8'),page=fs.readFileSync(html,'utf8');
 if(code.includes('/* RC131_HERO_IMAGE_RECOVERY_BEGIN */')){assert(code.endsWith(hook),'Unexpected existing RC131 hook');assert(code.includes(after),'Partial RC131 integration');assert(page.includes('assets/rc131/hero-images.js?v=43101'));return;}
 code=once(code,before,after,'Lauren direct render')+hook;
 page=once(page,'    <script src="./assets/rc130/projectile-policy.js?v=43001"></script>','    <script src="./assets/rc131/hero-images.js?v=43101"></script>\n    <script src="./assets/rc130/projectile-policy.js?v=43001"></script>','loader');
 page=once(page,'./assets/index-v31526.js?v=2026100304','./assets/index-v31526.js?v=43101','bundle cache');
 fs.writeFileSync(bundle,code);fs.writeFileSync(html,page);
}
function preservation(directory){
 const file=path.join(directory,'tools/rc130-preservation.cjs');if(!fs.existsSync(file))return;let text=fs.readFileSync(file,'utf8');
 if(text.includes('// RC131 exact authorized image fallback reconstruction.'))return;
 const anchor="  for(const file of [...files,'assets/rc130/audio-policy.js']){const expected=digest(fs.readFileSync(path.join(scratch,file))),actual=digest(fs.readFileSync(path.join(root,file)));";
 const addition="  // RC131 exact authorized image fallback reconstruction.\n  if(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/rc131/hero-images.js?v=43101')){put('tools/rc131-apply.cjs',fs.readFileSync(path.join(root,'tools/rc131-apply.cjs')));exec(process.execPath,['tools/rc131-apply.cjs','--runtime-only'],scratch);}\n";
 text=once(text,anchor,addition+anchor,'preservation');fs.writeFileSync(file,text);
}
if(require.main===module){runtime(root);if(!process.argv.includes('--runtime-only'))preservation(root);console.log('RC131 exact hero fallback integration applied');}
module.exports={runtime,preservation,hook,before,after};
