/* Release identity only. The v3.14.08 native runtime and save schema remain authoritative. */
(()=>{'use strict';
 function ready(n=0){
  if(!window.__HAPIL_V31408_RELEASE__?.installed){if(n<300)setTimeout(()=>ready(n+1),10);return;}
  window.MONGSE_ASSET_VERSION='31511';
  document.title='合一 · 합일 v3.14 FINAL RC13 · 보스/코스믹 수정';
  window.__HAPIL_FINAL_RELEASE__=Object.freeze({installed:true,version:'3.14-FINAL-RC13',activeBundle:'index-v31511.js',saveRevision:14});
 }
 ready();
})();
