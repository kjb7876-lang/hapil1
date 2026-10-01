/* RC111 mobile full-auto touch takeover and safe release. */
(()=>{'use strict';
 const C=()=>window.__HAPIL_CONTROLS_V31329__,M=()=>window.__HAPIL_MOBILE_V31366__;
 let pointer=null,orientation=innerWidth>innerHeight?'landscape':'portrait',active=false,suppressClick=null;
 const input=()=>C()?.binding?.input?.current;
 const full=()=>M()?.enabled?.()===true&&C()?.effective?.()==='full'&&C()?.binding?.phase==='game';
 const arrows=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
 function release(){const i=input();if(i)for(const k of arrows)i.delete(k);if(pointer?.target?.hasPointerCapture?.(pointer.id))try{pointer.target.releasePointerCapture(pointer.id)}catch{}pointer=null;}
 function clear(){release();active=false;document.documentElement.classList.remove('hapil-mobile-auto-touch-v31311');}
 function vector(e){if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,limit=22,x=Math.abs(dx)<limit?0:dx>0?1:-1,y=Math.abs(dy)<limit?0:dy>0?1:-1,i=input();if(!i)return;for(const k of arrows)i.delete(k);if(y<0)i.add('ArrowUp');if(y>0)i.add('ArrowDown');if(x<0)i.add('ArrowLeft');if(x>0)i.add('ArrowRight');}
 function down(e){const stage=e.target instanceof Element?e.target.closest('.game-stage canvas'):null;if(!full()){if(pointer)clear();return;}if(pointer){clear();return;}if(!stage||e.button!==0||e.isPrimary===false)return;
  const b=C()?.binding,blocked=e.target.closest('button,a,input,select,textarea,[role=dialog],.settings-layout,#hapil-mobile-controls-v31366,#rc108-control-overlay');if(blocked||!b||b.modal?.current||b.blocked?.())return;
  const box=stage.getBoundingClientRect();if(window.__HAPIL_PORTRAIT_SPLIT_RC108__?.active?.(b.state.current)&&e.clientY<box.top+box.height/2)return;
  e.preventDefault();e.stopImmediatePropagation();pointer={id:e.pointerId,target:stage,x:e.clientX,y:e.clientY};active=true;document.documentElement.classList.add('hapil-mobile-auto-touch-v31311');try{stage.setPointerCapture(e.pointerId)}catch{}vector(e);
 }
 function move(e){if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();vector(e);}
 function up(e){if(pointer&&e.pointerId===pointer.id){if(e.type==='pointerup')suppressClick={at:performance.now(),target:pointer.target,x:e.clientX,y:e.clientY};clear();}}
 function click(e){const row=suppressClick;if(!row)return;if(performance.now()-row.at>700){suppressClick=null;return;}const stage=e.target instanceof Element?e.target.closest('.game-stage canvas'):null;if(stage===row.target&&e.detail>0&&Math.hypot(e.clientX-row.x,e.clientY-row.y)<12){e.preventDefault();e.stopImmediatePropagation();suppressClick=null;}}
 function orientationCheck(){const next=innerWidth>innerHeight?'landscape':'portrait';if(next!==orientation){orientation=next;clear();}}
 window.addEventListener('pointerdown',down,{capture:true,passive:false});window.addEventListener('pointermove',move,{capture:true,passive:false});window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('lostpointercapture',up,true);window.addEventListener('click',click,true);
 for(const name of ['blur','pagehide','orientationchange'])window.addEventListener(name,clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});window.addEventListener('resize',orientationCheck,{passive:true});
 setInterval(()=>{const want=full();document.documentElement.classList.toggle('hapil-mobile-auto-v31311',want);if(!want&&pointer)clear();},100);
 window.__HAPIL_MOBILE_AUTO_V31311__=Object.freeze({clear,metrics:()=>({held:!!pointer,active,mode:full()?'full':'other'})});
})();
