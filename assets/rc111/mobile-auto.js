/* RC111 mobile full-auto touch takeover and safe release. */
(()=>{'use strict';
 const C=()=>window.__HAPIL_CONTROLS_V31329__,M=()=>window.__HAPIL_MOBILE_V31366__;
 let pointer=null,orientation=innerWidth>innerHeight?'landscape':'portrait',active=false,suppressClick=null;
 const full=()=>M()?.enabled?.()===true&&C()?.effective?.()==='full'&&C()?.binding?.phase==='game';
 const arrows=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
 const owns=(input,key)=>pointer?.scope?.input===input&&pointer.keys.has(key)&&valid();
 function refresh(input,key){if(!input)return;const current=input===C()?.binding?.input?.current;
  if(owns(input,key)||(current&&C()?.hasHeldLogical?.(key))||M()?.owns?.(input,key)||window.__HAPIL_MOBILE_V31343__?.owns?.(input,key))input.add(key);else input.delete(key);
 }
 function valid(){const b=C()?.binding,s=b?.state?.current;return !!pointer&&full()&&!!s&&s.hp>0&&!document.hidden&&!b.modal?.current&&!b.blocked?.()&&!window.__HAPIL_READING_V31342__?.blocked&&!window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()&&window.__HAPIL_PARTY_V31322__?.blocksNativeInput?.()!==true&&!window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused?.()&&window.__HAPIL_ACTION_CONTRACT_V31406__?.current(pointer.scope,b,true)===true;}
 function release(){const old=pointer;if(!old)return;pointer=null;for(const k of arrows)refresh(old.scope.input,k);if(old.target?.hasPointerCapture?.(old.id))try{old.target.releasePointerCapture(old.id)}catch{}}
 function clear(){release();active=false;document.documentElement.classList.remove('hapil-mobile-auto-touch-v31311');}
 function vector(e){if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,limit=12,x=Math.abs(dx)<limit?0:dx>0?1:-1,y=Math.abs(dy)<limit?0:dy>0?1:-1,i=pointer.scope.input;if(!i)return;pointer.keys=new Set([...(y<0?['ArrowUp']:y>0?['ArrowDown']:[]),...(x<0?['ArrowLeft']:x>0?['ArrowRight']:[])]);for(const k of arrows)refresh(i,k);}
 function down(e){const stage=e.target instanceof Element?e.target.closest('.game-stage canvas'):null;if(!full()){if(pointer)clear();return;}if(pointer){clear();return;}if(!stage||e.button!==0||e.isPrimary===false)return;
  const b=C()?.binding,blocked=e.target.closest('button,a,input,select,textarea,[role=dialog],.settings-layout,#hapil-mobile-controls-v31366,#rc108-control-overlay');if(blocked||!b||b.modal?.current||b.blocked?.())return;
  const box=stage.getBoundingClientRect();if(window.__HAPIL_PORTRAIT_SPLIT_RC108__?.active?.(b.state.current)&&e.clientY<box.top+box.height/2)return;
  const scope=window.__HAPIL_ACTION_CONTRACT_V31406__?.capture(b);if(!scope)return;
  pointer={id:e.pointerId,target:stage,x:e.clientX,y:e.clientY,scope,keys:new Set()};if(!valid()){clear();return;}
  e.preventDefault();e.stopImmediatePropagation();active=true;document.documentElement.classList.add('hapil-mobile-auto-touch-v31311');try{stage.setPointerCapture(e.pointerId)}catch{}vector(e);
 }
 function move(e){if(!pointer)return;if(!valid()){clear();return;}if(e.pointerId!==pointer.id)return;e.preventDefault();vector(e);}
 function up(e){if(pointer&&e.pointerId===pointer.id){if(e.type==='pointerup')suppressClick={at:performance.now(),target:pointer.target,x:e.clientX,y:e.clientY};clear();}}
 function click(e){const row=suppressClick;if(!row)return;if(performance.now()-row.at>700){suppressClick=null;return;}const stage=e.target instanceof Element?e.target.closest('.game-stage canvas'):null;if(stage===row.target&&e.detail>0&&Math.hypot(e.clientX-row.x,e.clientY-row.y)<12){e.preventDefault();e.stopImmediatePropagation();suppressClick=null;}}
 function orientationCheck(){const next=innerWidth>innerHeight?'landscape':'portrait';if(next!==orientation){orientation=next;clear();}}
 function bindMode(){const c=C();if(!c||typeof c.setMode!=='function'||c.setMode.__HAPIL_AUTO_RELEASE__)return;const base=c.setMode;const wrapped=function(value,...args){if(value!=='full'&&pointer)clear();return base.call(c,value,...args);};wrapped.__HAPIL_AUTO_RELEASE__=true;try{c.setMode=wrapped;}catch{}}
 window.addEventListener('pointerdown',down,{capture:true,passive:false});window.addEventListener('pointermove',move,{capture:true,passive:false});window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('lostpointercapture',up,true);window.addEventListener('click',click,true);
 for(const name of ['blur','pagehide','orientationchange'])window.addEventListener(name,clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});window.addEventListener('resize',orientationCheck,{passive:true});
 setInterval(()=>{bindMode();const want=full();document.documentElement.classList.toggle('hapil-mobile-auto-v31311',want);if(pointer&&!valid())clear();},50);
 window.__HAPIL_MOBILE_AUTO_V31311__=Object.freeze({clear,owns,metrics:()=>({held:!!pointer,active,mode:full()?'full':'other'})});
})();
