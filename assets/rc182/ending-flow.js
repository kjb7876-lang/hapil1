/* RC182: presentation after validated STORY completion; DREAM handoff is separate. */
(function(root){'use strict';const armed=new WeakSet(),delivered=new WeakSet();let current=null;
 const mode=s=>root.__HAPIL_MODES_V31346__?.mode(s)??s?.gameModeV31346??'STORY';
 function reserve(s){if(!s||mode(s)!=='STORY'||s.storyEndingEyesSeenRC182===true)return false;s.storyEndingEyesSeenRC182=true;armed.add(s);return true;}
 function begin(s,next){if(!s||mode(s)!=='STORY'||!s.hapilTerminalCompleteV31301||s.zone!=='village'||s.egoGuardianRC155?.active||s.egoGuardianRC155?.pendingTransformation)return true;
  if(current?.s===s||delivered.has(s))return true;
  delivered.add(s);if(!armed.has(s))return false;armed.delete(s);
  const document=root.document,overlay=document.createElement('div');overlay.className='hapil-ending-eyes';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','오늘은 어떤 꿈을 꾸셨나요?');overlay.setAttribute('tabindex','-1');
  const text=document.createElement('p');text.textContent='오늘은 어떤 꿈을 꾸셨나요?';overlay.append(text);for(const side of ['top','bottom']){const lid=document.createElement('div');lid.className='hapil-ending-lid hapil-ending-lid--'+side;lid.setAttribute('aria-hidden','true');overlay.append(lid);}document.body.append(overlay);
  const reading=root.__HAPIL_READING_V31342__,previous=!!reading?.blocked;if(reading)reading.blocked=true;root.__HAPIL_CONTROLS_V31329__?.clear?.();
  let timer=null,finished=false;const finish=(continueEnding=true)=>{if(finished)return;finished=true;if(timer!==null)root.clearTimeout(timer);overlay.remove();root.removeEventListener('keydown',key,true);root.removeEventListener('pagehide',cancel);if(reading)reading.blocked=previous;current=null;if(continueEnding)next();};
  const key=e=>{if(e.repeat)return;if(['Escape','Enter',' ','Spacebar'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();finish();}},cancel=()=>finish(false);current={s,finish};root.addEventListener('keydown',key,true);root.addEventListener('pagehide',cancel,{once:true});overlay.addEventListener('click',()=>finish());overlay.focus?.();
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;root.requestAnimationFrame?.(()=>{if(!finished)overlay.dataset.open='true';});timer=root.setTimeout(()=>finish(),reduced?1600:2300);return true;
 }
 function cancel(){current?.finish(false);}
 root.__HAPIL_ENDING_FLOW_RC182__=Object.freeze({reserve,begin,cancel,mode});
})(window);
