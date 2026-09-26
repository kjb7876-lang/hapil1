/* HAPIL 3.13.66 — one pointer owner, cancellation-safe A/D, mobile view.
   Owns presentation and physical input only. No projectile cap, damage, time
   step, ability cooldown, auto combat selection or world geometry changes. */
(()=>{'use strict';
 if(window.__HAPIL_MOBILE_V31366__?.installed)return;
 const VERSION='3.13.68-RC1',KEY='hapil-mobile-view-v31366';
 const C=()=>window.__HAPIL_CONTROLS_V31329__,D=()=>window.__HAPIL_CHANNEL_V31364__,L=()=>window.__HAPIL_LOOP_V31365__;
 const pointers=new Map(),downClicks=new WeakMap();
 const metrics={downs:0,ups:0,cancels:0,clears:0,duplicatePresses:0,unrelatedCancels:0,renderCaps:0};
 let options={mode:'auto',quality:'balanced'},root=null,game=null,world=null,contextKey='',clearing=false,timer=0,lastTick=0;
 let touch=matchMedia('(pointer:coarse)').matches,uiActive=false;
 try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');if(['auto','on','off'].includes(p.mode))options.mode=p.mode;if(['balanced','battery','full'].includes(p.quality))options.quality=p.quality;}catch{}
 try{const m=new URLSearchParams(location.search).get('mobile');if(m==='1')options.mode='on';else if(m==='0')options.mode='off';}catch{}
 const finite=(v,d=0)=>Number.isFinite(v)?v:d;
 const sameContext=r=>r.s===C()?.binding?.state?.current&&r.zone===r.s.zone&&r.hero===r.s.activeHeroId;
 const enabled=()=>options.mode==='on'||options.mode==='auto'&&touch;
 const keyboard=k=>C()?.hasHeldLogical?.(k)===true;
 function owns(input,k){for(const r of pointers.values())if(r.input===input&&r.keys.has(k))return true;return false;}
 function refresh(input,k){if(!input)return;if(owns(input,k)||keyboard(k)||window.__HAPIL_MOBILE_V31343__?.owns(input,k))input.add(k);else input.delete(k);}
 function canInput(key){const b=C()?.binding,p=window.__HAPIL_PARTY_V31322__;return !!b&&b.phase==='game'&&b.state?.current?.hp>0&&!b.modal?.current&&!b.blocked?.()&&!document.hidden&&!window.__HAPIL_READING_V31342__?.blocked&&!window.__HAPIL_PATIENT_V31368__?.isOpen()&&!window.__HAPIL_RECORDS_V31365__?.isOpen?.()&&!window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()&&p?.blocksNativeInput?.()!==true;}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(options));}catch{C()?.binding?.notify?.('모바일 설정을 저장하지 못했습니다. 현재 화면에는 적용됩니다.');}}
 function bindPointer(target,event){try{target?.setPointerCapture?.(event.pointerId);}catch{}}
 function pointerArray(s){s.chargePointersV31365=[...pointers].filter(([,r])=>r.s===s&&r.keys.has('KeyA')).map(([id])=>id);}
 function chargeCancelled(s,reason){if(!s)return;for(const r of pointers.values())if(r.s===s&&r.keys.delete('KeyA')){r.canceled=true;refresh(r.input,'KeyA');}pointerArray(s);}
 function release(id,cancel=false){const r=pointers.get(id);if(!r)return false;
  pointers.delete(id);for(const k of r.keys)refresh(r.input,k);
  if(r.keys.has('KeyD')){D()?.pointerIds?.delete(id);if(!D()?.pointerIds?.size&&!keyboard('KeyD')&&!owns(r.input,'KeyD'))D()?.end(r.s,r.s,cancel?'pointer-cancel':'release');}
  if(r.keys.has('KeyA')){pointerArray(r.s);if(!(r.s.chargePointersV31365?.length)&&!keyboard('KeyA')){if(cancel||!sameContext(r))L()?.cancelCharge(r.s,'pointer-cancel');else L()?.releaseA(r.s);}}
  try{if(r.target?.hasPointerCapture?.(id))r.target.releasePointerCapture(id);}catch{}
  if(r.stick){r.target?.style.removeProperty('--stick-x');r.target?.style.removeProperty('--stick-y');}
  r.target?.removeAttribute('data-held');cancel?metrics.cancels++:metrics.ups++;return true;
 }
 function clear(reason='reset'){if(clearing)return;clearing=true;try{for(const id of [...pointers.keys()])release(id,true);metrics.clears++;}finally{clearing=false;}}
 function setStick(r,event){if(!sameContext(r)){release(event.pointerId,true);return;}
  const rect=r.target.getBoundingClientRect(),half=Math.max(1,Math.min(rect.width,rect.height)/2),x=finite(event.clientX)-rect.x-rect.width/2,y=finite(event.clientY)-rect.y-rect.height/2;
  const length=Math.hypot(x,y),travel=half*.64,k=length>travel?travel/length:1,old=new Set(r.keys);r.keys.clear();
  if(length>half*.22){const angle=Math.atan2(y,x),oct=(Math.round(angle/(Math.PI/4))+8)%8;for(const key of [['ArrowRight'],['ArrowRight','ArrowDown'],['ArrowDown'],['ArrowDown','ArrowLeft'],['ArrowLeft'],['ArrowLeft','ArrowUp'],['ArrowUp'],['ArrowUp','ArrowRight']][oct])r.keys.add(key);}
  for(const key of new Set([...old,...r.keys]))refresh(r.input,key);
  r.target.style.setProperty('--stick-x',(x*k).toFixed(1)+'px');r.target.style.setProperty('--stick-y',(y*k).toFixed(1)+'px');
 }
 function targetOf(e){const el=e.target instanceof Element?e.target.closest('[data-mobile-action],[data-control-key],[data-mobile-stick]'):null;
  if(!el)return null;const key=el.dataset.mobileAction??el.dataset.controlKey;
  if(el.hasAttribute('data-mobile-stick'))return {el,key:'stick'};
  if(el.hasAttribute('data-mobile-action')||key==='A'||key==='D'||key==='S')return {el,key};return null;
 }
 function action(key){if(key==='Party'){clear('party');C()?.clear?.();window.__HAPIL_PARTY_UI_V31322__?.open?.();return;}if(key==='Menu'){C()?.clear?.();C()?.dispatch('Settings');return;}
  if(key==='Quality'){options.quality=({balanced:'battery',battery:'full',full:'balanced'})[options.quality];persist();update();return;}
  if(key==='Fullscreen'){clear('fullscreen');const elem=document.documentElement;try{const r=document.fullscreenElement?document.exitFullscreen?.():elem.requestFullscreen?.();r?.catch?.(()=>C()?.binding?.notify?.('전체화면은 이 브라우저에서 지원되지 않을 수 있습니다. 가로 모드로 사용하세요.'));if(!r)C()?.binding?.notify?.('브라우저의 주소 표시줄 숨김 또는 가로 모드를 사용하세요.');}catch{}return;}
  if(key==='Records'){clear('records');window.__HAPIL_RECORDS_V31365__?.open?.();return;}
  const code=key==='Tab'||key==='Collab'?key:'Key'+key;C()?.dispatch(code);
 }
 function down(e){const found=targetOf(e);if(!found||e.button>0||!Number.isFinite(e.pointerId)||found.el.disabled||!canInput(found.key))return;
  if(pointers.has(e.pointerId)||pointers.size>=16){metrics.duplicatePresses++;return;}
  const {el,key}=found;if(key==='stick'&&[...pointers.values()].some(r=>r.stick))return;
  e.preventDefault();e.stopImmediatePropagation();downClicks.set(el,performance.now());C()?.binding?.unlockAudio?.();
  if(['Menu','Quality','Fullscreen','Records','Party'].includes(key)){action(key);return;}
  const b=C().binding,s=b.state.current,r={s,input:b.input.current,zone:s.zone,hero:s.activeHeroId,keys:new Set(),target:el,stick:key==='stick',canceled:false,egoUntil:L()?.awake(s)?s.awakeningUntil:0};
  pointers.set(e.pointerId,r);bindPointer(el,e);el.setAttribute('data-held','true');metrics.downs++;
  if(r.stick){setStick(r,e);return;}
  if(key==='A'||key==='D'){r.keys.add('Key'+key);refresh(r.input,'Key'+key);if(key==='A')pointerArray(s);else D()?.pointerIds?.add(e.pointerId);
   // Second fingers on the same control share its one logical press.
   if([...pointers.values()].filter(p=>p.s===s&&p.keys.has('Key'+key)).length===1&&!keyboard('Key'+key))action(key);
  }else action(key);
 }
 function up(e){release(e.pointerId,false);}
 function cancel(e){if(!release(e.pointerId,true))metrics.unrelatedCancels++;}
 function move(e){const r=pointers.get(e.pointerId);if(r?.stick){e.preventDefault();setStick(r,e);}}
 function click(e){const f=targetOf(e);if(!f||f.key==='stick')return;
  e.preventDefault();e.stopImmediatePropagation();
  // Enter/Space/assistive activation remain usable; synthetic mouse clicks
  // following an owned pointer must not repeat an action or fire a canceled charge.
  if(e.detail===0&&!f.el.disabled&&performance.now()-(downClicks.get(f.el)??-Infinity)>600&&canInput(f.key))action(f.key);
 }
 function beforeFrame(s,paused){const key=s?String(s.zone)+'|'+String(s.activeHeroId):'';
  if(world&&world!==s||contextKey&&contextKey!==key||paused){clear('frame-reset');}
  world=s;contextKey=key;
  for(const [id,r] of [...pointers])if(!sameContext(r)||!canInput('A'))release(id,true);
  // A held before EGO conversion becomes one charge, not a continuous stream
  // of accidental high-power releases. A damaged/canceled hold stays canceled.
  if(!paused&&s&&L()?.awake(s))for(const r of pointers.values())if(r.s===s&&r.keys.has('KeyA')&&!r.canceled&&r.egoUntil!==s.awakeningUntil){r.egoUntil=s.awakeningUntil;L().pressA(s);}
 }
 function backingScale(base){if(!enabled()||options.quality==='full')return base;const cap=options.quality==='battery'?.70:.90,result=Math.min(base,cap);if(result<base)metrics.renderCaps++;return result;}
 const setText=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};
 function button(k,label){const b=document.createElement('button');b.type='button';b.dataset.mobileAction=k;b.setAttribute('aria-label',k==='A'?'A 기본 공격 유지 · EGO 중 누르고 놓아 차지':k==='D'?'D 유지 방어 · 손을 떼면 종료':label);b.innerHTML='<b></b><small></small>';b.firstChild.textContent=k==='Tab'?'표적':k==='Collab'?'협동':k;b.lastChild.textContent=label;return b;}
 function mount(next){if(next===game&&root?.isConnected)return;if(root)root.remove();game=next;root=null;if(!game)return;
  root=document.createElement('div');root.id='hapil-mobile-controls-v31366';
  const toolbar=document.createElement('div');toolbar.className='hm-toolbar';toolbar.innerHTML='<span class="hm-status" aria-label="영웅 체력·공명"></span><span class="hm-pose" aria-live="off"></span>';
  for(const [k,label]of [['F','상호작용'],['Party','동료'],['Quality','화질'],['Menu','메뉴']])toolbar.append(button(k,label));
  const movement=document.createElement('div');movement.className='hm-movement';movement.innerHTML='<div class="hm-stick" data-mobile-stick role="group" aria-label="8방향 이동 스틱"><span></span></div><small>이동</small><span class="hm-orientation">가로 화면 권장</span>';
  const actions=document.createElement('div');actions.className='hm-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label','전투 터치 버튼');
  for(const row of [['A','사격/차지'],['S','수동 회피'],['D','공명 방어']])actions.append(button(...row));
  root.append(toolbar,movement,actions);game.append(root);
 }
 function dimensions(){const v=window.visualViewport;document.documentElement.style.setProperty('--hapil-vh66',(v?.height??innerHeight).toFixed(2)+'px');}
 function update(){lastTick=performance.now();touch=matchMedia('(pointer:coarse)').matches;const b=C()?.binding,next=document.querySelector('.game'),active=enabled()&&!!next&&b?.phase==='game'&&!C()?.localTwo?.();
  if(uiActive!==active){clear('ui-mode');uiActive=active;}document.documentElement.classList.toggle('hapil-touch-v31366',active);dimensions();mount(active?next:null);
  if(!root||!b)return;const s=b.state.current,st=root.querySelector('.hm-status'),pose=root.querySelector('.hm-pose'),hero=window.__HAPIL_LOOP_V31365__?.role(s.activeHeroId);root.style.setProperty('--hm-color',L()?.color?.(s.activeHeroId)||'#edf7ff');
  setText(st,Math.ceil(s.hp)+' / '+Math.ceil(s.maxHp)+' HP · 공명 '+Math.floor(s.resonance));
  setText(pose,D()?.active(s)?'D 방어 유지':L()?.isCharging(s)?'A 차지 '+(s.chargeLevelV31365===2?'MAX':((s.time-s.chargeStartV31365).toFixed(1)+'s')):L()?.awake(s)?'EGO '+Math.max(0,s.awakeningUntil-s.time).toFixed(1)+'s':hero?.name||'');
  const blocked=!canInput('A');root.classList.toggle('hm-blocked',blocked);
  for(const el of root.querySelectorAll('[data-mobile-action]')){const k=el.dataset.mobileAction;
   if(k==='Quality'){setText(el.lastChild,{balanced:'균형',battery:'절전',full:'원본'}[options.quality]);continue;}
   if(['Menu','Records','Fullscreen','Party'].includes(k))continue;
   const native=document.querySelector('.combat-hud [data-control-key="'+k+'"]'),remain=Math.max(0,finite(s.cooldowns?.[k])-s.time),owned=[...pointers.values()].some(p=>p.target===el),locked=blocked||(!owned&&(remain>.001||native?.disabled||k==='D'&&L()?.awake(s)||k!=='D'&&D()?.active(s)));
   el.disabled=!!locked;if(remain>.001&&!owned)setText(el.lastChild,remain.toFixed(1)+'s');else{const label=({A:L()?.awake(s)?'누름/해제':'유지 사격',S:'회피',D:'유지 방어',Q:'스킬 1',W:'스킬 2',E:'이동기',R:'궁극기',F:'상호작용',Tab:'표적 전환',G:'공명실',Collab:'콜라보',M:'지도'})[k];setText(el.lastChild,label);}
  }
 }
 function setMode(mode){if(!['auto','on','off'].includes(mode))return false;options.mode=mode;persist();update();return true;}
 function setQuality(q){if(!['balanced','battery','full'].includes(q))return false;options.quality=q;persist();update();return true;}
 function reset(){clear('lifecycle');C()?.clear?.();}
 // One pending timer only. Slow first downloads must not permanently disable A/D.
 function boot(n=0){if(!window.__HAPIL_V31365_RELEASE__?.installed){setTimeout(()=>boot(n+1),n<100?10:250);return;}
  document.addEventListener('pointerdown',down,{capture:true,passive:false});window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',cancel,true);window.addEventListener('lostpointercapture',cancel,true);document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('click',click,true);
  document.addEventListener('contextmenu',e=>{if(targetOf(e))e.preventDefault();});
  for(const name of ['blur','pagehide','orientationchange'])window.addEventListener(name,reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  let lastWidth=innerWidth;window.addEventListener('resize',()=>{if(Math.abs(innerWidth-lastWidth)>8)clear('resize');lastWidth=innerWidth;dimensions();},{passive:true});window.visualViewport?.addEventListener('resize',dimensions,{passive:true});
  window.__HAPIL_MOBILE_V31366__=Object.freeze({installed:true,version:VERSION,enabled,owns,clear,beforeFrame,chargeCancelled,backingScale,setMode,setQuality,update,metrics:()=>({...metrics}),snapshot:()=>({enabled:enabled(),uiActive,options:{...options},pointers:[...pointers].map(([id,r])=>({id,keys:[...r.keys],canceled:r.canceled,stick:r.stick})),lastTick,logicalWorld:[1280,720]})});
  window.MONGSE_ASSET_VERSION='31369';document.title='合一 · 합일 v3.13.69 RC1';
  window.__HAPIL_V31366_RELEASE__=Object.freeze({installed:true,version:VERSION,cacheKey:31368,saveRevision:14,baseVersion:'3.13.65-RC1',activeBundle:'index-v31368.js'});
  update();timer=setInterval(update,120);
 }
 boot();
})();
