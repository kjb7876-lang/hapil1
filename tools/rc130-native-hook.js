
/* RC130_NATIVE_PRESENTATION: keep the approved laser renderer and combat admission intact. */
;(()=>{'use strict';let attempts=0;
 function install(){
  const V=window.__HAPIL_VISUAL_RC130__,B=window.__HAPIL_RC91_NATIVE__;
  if(!V||!B||!window.__HAPIL_SAMONG_RC91__?.installed||typeof Jn!=='function'||typeof Gn!=='function')return false;
  if(!Jn.rc130Cap){const previous=Jn;const wrapped=function(ctx,cache,p,time,settings,...args){return V.drawProjectile(previous,ctx,cache,p,time,settings,...args);};wrapped.rc130Cap=true;Jn=wrapped;}
  if(!Gn.rc130Stationary){const previous=Gn;const wrapped=function(ctx,cache,e,time,settings,...args){const prepared=typeof MONGSE_prepareEnemyRenderEffectV31237==='function'?MONGSE_prepareEnemyRenderEffectV31237(e):e;return V.drawMelee(previous,ctx,cache,prepared,time,settings,...args);};wrapped.rc130Stationary=true;Gn=wrapped;}
  const E=window.__HAPIL_EXIT_V31334__;
  if(E&&typeof E.captureRenderedEffect==='function'&&!E.captureRenderedEffect.rc130Stationary){const previous=E.captureRenderedEffect.bind(E);const wrapped=function(e,...args){return V.capture(previous,e,...args);};wrapped.rc130Stationary=true;E.captureRenderedEffect=wrapped;}
  window.__HAPIL_RC130_INSTALLED__=true;
  window.__HAPIL_RC130_AUDIT__=()=>({installed:Jn.rc130Cap===true&&Gn.rc130Stationary===true,exitHook:E?E.captureRenderedEffect?.rc130Stationary===true:null,movementReference:window.__HAPIL_POLICY_RC127__?.fixedSpeed,visual:V.snapshot(),audio:window.__HAPIL_AUDIO_RC130__?.snapshot()});
  return true;
 }
 function ready(){if(!install()&&++attempts<2000)setTimeout(ready,20);}ready();
})();
