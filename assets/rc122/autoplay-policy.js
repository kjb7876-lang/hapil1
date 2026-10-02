/* RC122: input ownership is not inferred from an automatic skill picture.
 * Pure predicates only. Native movement/status locks, cooldowns, damage and
 * animation commitments remain authoritative in the original frame loop. */
(function(root){
 'use strict';
 function manualMotion(state,automatic){
  if(!state||!Number.isFinite(state.time))return false;
  const motion=state.heroMotion;
  if(!motion||!(Number(motion.until)>state.time)||motion.autoEvade31223)return false;
  if(['hurt','dash','guard'].includes(motion.kind))return true;
  if(!['skill','ultimate'].includes(motion.kind))return false;
  return automatic!==true||Number(state.manualControlUntilV31329)>state.time;
 }
 function manualTarget(state){
  const target=state?.target;
  return !!target&&target.autoProgressV31301!==true&&target.autoAwakeningV31336!==true;
 }
 const api=Object.freeze({version:'RC122',manualMotion,manualTarget});
 root.__HAPIL_AUTOPLAY_POLICY_RC122__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
