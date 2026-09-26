/* Release identity only. The v3.14.08 native runtime and save schema remain authoritative. */
(()=>{'use strict';
 function ready(n=0){
  if(!window.__HAPIL_COMBAT_RC14__?.installed){if(n<600)setTimeout(()=>ready(n+1),10);return;}
  window.MONGSE_ASSET_VERSION='31512';
  const title='合一 · 합일 v3.14 FINAL RC14 · 스킬완주·속공전투';
  const applyTitle=()=>{if(document.title!==title)document.title=title;};
  applyTitle();
  if(document.querySelector('title')&&typeof MutationObserver==='function')new MutationObserver(applyTitle).observe(document.querySelector('title'),{childList:true,characterData:true,subtree:true});
  window.__HAPIL_FINAL_RELEASE__=Object.freeze({installed:true,version:'3.14-FINAL-RC14',activeBundle:'index-v31512.js',saveRevision:14});
 }
 ready();
})();
