/* HAPIL RC28 — full-stage mobile controls and performance defaults.
   Owns presentation and physical input only. No projectile cap, damage, time
   step, ability cooldown, auto combat selection or world geometry changes. */
(()=>{'use strict';
 if(window.__HAPIL_MOBILE_V31366__?.installed)return;
 const VERSION='3.29-MOBILE',KEY='hapil-mobile-view-v31366',SETTINGS_KEY='mongse_settings_v1';
 const C=()=>window.__HAPIL_CONTROLS_V31329__,D=()=>window.__HAPIL_CHANNEL_V31364__,L=()=>window.__HAPIL_LOOP_V31365__;
 const pointers=new Map(),downClicks=new WeakMap();
 const metrics={downs:0,ups:0,cancels:0,clears:0,duplicatePresses:0,unrelatedCancels:0,renderCaps:0};
 let touch=matchMedia('(pointer:coarse)').matches,options={mode:'auto',quality:touch?'battery':'balanced'},root=null,game=null,world=null,contextKey='',clearing=false,timer=0,lastTick=0,mobileDefaultsApplied=false,uiActive=false,lastViewportHeight='';
 try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');if(['auto','on','off'].includes(p.mode))options.mode=p.mode;if(['balanced','battery','full'].includes(p.quality))options.quality=p.quality;}catch{}
 try{const m=new URLSearchParams(location.search).get('mobile');if(m==='1')options.mode='on';else if(m==='0')options.mode='off';}catch{}
 const finite=(v,d=0)=>Number.isFinite(v)?v:d;
 const Action=()=>window.__HAPIL_ACTION_CONTRACT_V31406__;
 const sameContext=r=>Action().current(r.scope,C()?.binding,true);
 const enabled=()=>options.mode==='on'||options.mode==='auto'&&touch;
 const keyboard=k=>C()?.hasHeldLogical?.(k)===true;
 function owns(input,k){for(const r of pointers.values())if(r.input===input&&r.keys.has(k))return true;return false;}
 function refresh(input,k){if(!input)return;const current=input===C()?.binding?.input?.current;if(owns(input,k)||current&&keyboard(k)||window.__HAPIL_MOBILE_V31343__?.owns(input,k))input.add(k);else input.delete(k);}
 function canInput(key){const b=C()?.binding,p=window.__HAPIL_PARTY_V31322__;return !!b&&b.phase==='game'&&b.state?.current?.hp>0&&!b.modal?.current&&!b.blocked?.()&&!document.hidden&&!window.__HAPIL_READING_V31342__?.blocked&&!window.__HAPIL_PATIENT_V31368__?.isOpen()&&!window.__HAPIL_RECORDS_V31365__?.isOpen?.()&&!window.__HAPIL_PARTY_UI_V31322__?.isOpen?.()&&p?.blocksNativeInput?.()!==true;}
 function canMenu(){const b=C()?.binding;return !!b&&b.phase==='game'&&!b.modal?.current&&!document.hidden&&!window.__HAPIL_READING_V31342__?.blocked;}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(options));}catch{C()?.binding?.notify?.('모바일 설정을 저장하지 못했습니다. 현재 화면에는 적용됩니다.');}}
 function applyMobileDefaults(b){
  if(!enabled()||mobileDefaultsApplied||!b?.settings?.current)return;
  mobileDefaultsApplied=true;
  try{const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'),patch={};
   if(!Object.prototype.hasOwnProperty.call(saved,'lowFx'))patch.lowFx=true;
   if(!Object.prototype.hasOwnProperty.call(saved,'reducedFlash'))patch.reducedFlash=true;
   if(!Object.prototype.hasOwnProperty.call(saved,'screenShakeV31336'))patch.screenShakeV31336=false;
   if(Object.keys(patch).length){if(typeof b.setSettings==='function')b.setSettings(s=>({...s,...patch}));else b.settings.current={...b.settings.current,...patch};}
  }catch{}
 }
 function bindPointer(target,event){try{target?.setPointerCapture?.(event.pointerId);}catch{}}
 function pointerArray(s){s.chargePointersV31365=[...pointers].filter(([,r])=>r.s===s&&r.keys.has('KeyA')).map(([id])=>id);}
 function chargeCancelled(s,reason,oldToken){if(!s)return;for(const r of pointers.values())if(r.s===s&&(oldToken===undefined||r.chargeToken===oldToken)&&r.keys.delete('KeyA')){r.canceled=true;refresh(r.input,'KeyA');}pointerArray(s);}
 function release(id,cancel=false){const r=pointers.get(id);if(!r)return false;
  pointers.delete(id);if(r.target)downClicks.set(r.target,performance.now());for(const k of r.keys)refresh(r.input,k);
  if(r.keys.has('KeyD')){D()?.pointerIds?.delete(id);if(!D()?.pointerIds?.size&&!keyboard('KeyD')&&!owns(r.input,'KeyD'))D()?.end(r.s,r.s,cancel?'pointer-cancel':'release',r.guardToken);}
  if(r.keys.has('KeyA')){pointerArray(r.s);if(!(r.s.chargePointersV31365?.length)&&!keyboard('KeyA')){if(cancel||!sameContext(r))L()?.cancelCharge(r.s,'pointer-cancel',r.chargeToken);else L()?.releaseA(r.s,r.chargeToken);}}
  try{if(r.target?.hasPointerCapture?.(id))r.target.releasePointerCapture(id);}catch{}
  if(r.stick){r.target?.style.removeProperty('--stick-x');r.target?.style.removeProperty('--stick-y');}
  if(![...pointers.values()].some(p=>p.target===r.target))r.target?.removeAttribute('data-held');cancel?metrics.cancels++:metrics.ups++;return true;
 }
 function clear(reason='reset'){if(clearing)return;clearing=true;try{for(const id of [...pointers.keys()])release(id,true);metrics.clears++;}finally{clearing=false;}}
 function setStick(r,event){if(!sameContext(r)){release(event.pointerId,true);return;}
  const rect=r.stickRect,half=Math.max(1,Math.min(rect.width,rect.height)/2),x=finite(event.clientX)-rect.x-rect.width/2,y=finite(event.clientY)-rect.y-rect.height/2;
  const length=Math.hypot(x,y),travel=half*.64,k=length>travel?travel/length:1,old=new Set(r.keys);r.keys.clear();
  if(length>half*.22){const angle=Math.atan2(y,x),oct=(Math.round(angle/(Math.PI/4))+8)%8;for(const key of [['ArrowRight'],['ArrowRight','ArrowDown'],['ArrowDown'],['ArrowDown','ArrowLeft'],['ArrowLeft'],['ArrowLeft','ArrowUp'],['ArrowUp'],['ArrowUp','ArrowRight']][oct])r.keys.add(key);}
  if(old.size!==r.keys.size||[...old].some(key=>!r.keys.has(key)))for(const key of new Set([...old,...r.keys]))refresh(r.input,key);
  r.target.style.setProperty('--stick-x',(x*k).toFixed(1)+'px');r.target.style.setProperty('--stick-y',(y*k).toFixed(1)+'px');
 }
 function targetOf(e){const el=e.target instanceof Element?e.target.closest('[data-mobile-action],[data-control-key],[data-mobile-stick]'):null;
  if(!el)return null;const key=el.dataset.mobileAction??el.dataset.controlKey;
  if(el.hasAttribute('data-mobile-stick'))return {el,key:'stick'};
  if(el.hasAttribute('data-mobile-action')||key==='A'||key==='D'||key==='S')return {el,key};return null;
 }
 function action(key){if(key==='Party'){clear('party');C()?.clear?.();window.__HAPIL_PARTY_UI_V31322__?.open?.();return;}if(key==='Menu'){clear('settings');C()?.clear?.();C()?.dispatch('Settings');return;}
  if(key==='Quality'){options.quality=({battery:'balanced',balanced:'full',full:'battery'})[options.quality];persist();update();return;}
  if(key==='Fullscreen'){clear('fullscreen');const elem=document.documentElement;try{const r=document.fullscreenElement?document.exitFullscreen?.():elem.requestFullscreen?.();r?.catch?.(()=>C()?.binding?.notify?.('전체화면은 이 브라우저에서 지원되지 않을 수 있습니다. 가로 모드로 사용하세요.'));if(!r)C()?.binding?.notify?.('브라우저의 주소 표시줄 숨김 또는 가로 모드를 사용하세요.');}catch{}return;}
  if(key==='Records'){clear('records');window.__HAPIL_RECORDS_V31365__?.open?.();return;}
  const code=key==='Tab'||key==='Collab'?key:'Key'+key;C()?.dispatch(code);
 }
 function down(e){const found=targetOf(e);if(!found||e.button>0||!Number.isFinite(e.pointerId)||found.el.disabled||!(found.key==='Menu'?canMenu():canInput(found.key)))return;
  C()?.syncLifecycle?.(C()?.binding?.state?.current,false);beforeFrame(C()?.binding?.state?.current,false);
  if(pointers.has(e.pointerId)||pointers.size>=16){metrics.duplicatePresses++;return;}
  const {el,key}=found;if(key==='stick'&&[...pointers.values()].some(r=>r.stick))return;
  e.preventDefault();e.stopImmediatePropagation();downClicks.set(el,performance.now());C()?.binding?.unlockAudio?.();
  if(['Menu','Quality','Fullscreen','Records','Party'].includes(key)){action(key);return;}
  const b=C().binding,s=b.state.current,r={s,input:b.input.current,zone:s.zone,hero:s.activeHeroId,keys:new Set(),target:el,stick:key==='stick',stickRect:key==='stick'?el.getBoundingClientRect():null,canceled:false,egoUntil:L()?.awake(s)?s.awakeningUntil:0,scope:Action().capture(b),chargeToken:null,guardToken:null};
  pointers.set(e.pointerId,r);bindPointer(el,e);el.setAttribute('data-held','true');metrics.downs++;
  if(r.stick){setStick(r,e);return;}
  if(key==='A'||key==='D'){r.keys.add('Key'+key);refresh(r.input,'Key'+key);if(key==='A')pointerArray(s);else D()?.pointerIds?.add(e.pointerId);
   // Second fingers on the same control share its one logical press.
   if([...pointers.values()].filter(p=>p.s===s&&p.keys.has('Key'+key)).length===1&&!keyboard('Key'+key))action(key);
   r.chargeToken=L()?.chargeToken(s)??null;r.guardToken=D()?.sessionToken(s,s)??null;
  }else action(key);
 }
 function up(e){release(e.pointerId,false);}
 function cancel(e){if(!release(e.pointerId,true))metrics.unrelatedCancels++;}
 function move(e){const r=pointers.get(e.pointerId);if(r?.stick){e.preventDefault();setStick(r,e);}}
 function click(e){const f=targetOf(e);if(!f||f.key==='stick')return;
  e.preventDefault();e.stopImmediatePropagation();
  // Enter/Space/assistive activation remain usable; synthetic mouse clicks
  // following an owned pointer must not repeat an action or fire a canceled charge.
  if(e.detail===0&&!e.pointerType&&!f.el.disabled&&performance.now()-(downClicks.get(f.el)??-Infinity)>600&&(f.key==='Menu'?canMenu():canInput(f.key)))action(f.key);
 }
 function beforeFrame(s,paused){const key=s?String(s.zone)+'|'+String(s.activeHeroId):'';
  if(world&&world!==s||contextKey&&contextKey!==key||paused){clear('frame-reset');}
  world=s;contextKey=key;
  if(!pointers.size)return;
  for(const [id,r] of [...pointers])if(!sameContext(r)||!canInput('A'))release(id,true);
  // A held before EGO conversion becomes one charge, not a continuous stream
  // of accidental high-power releases. A damaged/canceled hold stays canceled.
  if(!paused&&s&&L()?.awake(s))for(const r of pointers.values())if(r.s===s&&r.keys.has('KeyA')&&!r.canceled&&r.egoUntil!==s.awakeningUntil){r.egoUntil=s.awakeningUntil;L().pressA(s);r.chargeToken=L().chargeToken(s)??null;}
 }
 function backingScale(base){if(!enabled()||options.quality==='full')return base;const cap=options.quality==='battery'?.55:.82,result=Math.min(base,cap);if(result<base)metrics.renderCaps++;return result;}
 const setText=(el,t)=>{if(!el||el.textContent===t)return;if(el.firstChild?.nodeType===3&&el.childNodes.length===1)el.firstChild.nodeValue=t;else el.textContent=t;};
 function ensureSettingsControl(){const list=document.querySelector('.settings-layout > .settings-list');if(!list)return;
  let row=list.querySelector('[data-hapil-mobile-quality]');if(!row){row=document.createElement('label');row.dataset.hapilMobileQuality='';
   row.innerHTML='<span><b>모바일 성능</b><small>화면 해상도만 조절합니다. 판정·피해량은 그대로입니다.</small></span><select aria-label="모바일 성능"><option value="battery">절전 · 렉 줄이기</option><option value="balanced">균형</option><option value="full">원본 화질</option></select>';
   row.querySelector('select').addEventListener('change',event=>setQuality(event.target.value));list.prepend(row);}
  const select=row.querySelector('select');if(select&&select.value!==options.quality)select.value=options.quality;
 }
 function button(k,label){const b=document.createElement('button');b.type='button';b.dataset.mobileAction=k;b.setAttribute('aria-label',k==='Menu'?'설정 메뉴 열기':k==='S'?'블링크 대시':k==='D'?'공명 유지 · 손을 떼면 종료':label);b.innerHTML='<b></b><small></small>';b.firstChild.textContent=k==='Menu'?'⚙':k==='Quality'?'◐':k==='Party'?'✦':k==='S'?'↗':k==='D'?'◉':k==='Tab'?'표적':k==='Collab'?'협동':k;b.lastChild.textContent=label;return b;}
 function mount(next){if(next===game&&root?.isConnected)return;if(root)root.remove();game=next;root=null;if(!game)return;
  root=document.createElement('div');root.id='hapil-mobile-controls-v31366';
  const toolbar=document.createElement('div');toolbar.className='hm-toolbar';toolbar.innerHTML='<span class="hm-status" aria-label="영웅 체력·공명"></span>';toolbar.append(button('Menu','설정'));
  const movement=document.createElement('div');movement.className='hm-movement';movement.innerHTML='<div class="hm-stick" data-mobile-stick role="group" aria-label="8방향 터치 이동 휠"><span></span></div>';
  const actions=document.createElement('div');actions.className='hm-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label','전투 터치 버튼');
  for(const row of [['S','블링크'],['D','공명']])actions.append(button(...row));
  root.append(toolbar,movement,actions);game.append(root);
 }
 function dimensions(){const v=window.visualViewport,height=(v?.height??innerHeight).toFixed(2)+'px';if(height!==lastViewportHeight){lastViewportHeight=height;document.documentElement.style.setProperty('--hapil-vh66',height);}}
 function update(){if(document.hidden)return;lastTick=performance.now();touch=matchMedia('(pointer:coarse)').matches;const b=C()?.binding,next=document.querySelector('.game'),active=enabled()&&!!next&&b?.phase==='game'&&!C()?.localTwo?.();applyMobileDefaults(b);
  if(uiActive!==active){clear('ui-mode');uiActive=active;}document.documentElement.classList.toggle('hapil-touch-v31366',active);dimensions();mount(active?next:null);
  if(enabled()&&b?.modal?.current)ensureSettingsControl();
  if(!root||!b||document.hidden)return;const s=b.state.current,st=root.querySelector('.hm-status');root.style.setProperty('--hm-color',L()?.color?.(s.activeHeroId)||'#edf7ff');
  setText(st,'HP '+Math.ceil(s.hp)+' / '+Math.ceil(s.maxHp)+' · 공명 '+Math.floor(s.resonance));
  const bossbar=document.getElementById('rc24-bossbar');root.classList.toggle('hm-boss',!!bossbar&&!bossbar.hidden);
  const blocked=!canInput('A');root.classList.toggle('hm-blocked',blocked);
  for(const el of root.querySelectorAll('.hm-actions [data-mobile-action]')){const k=el.dataset.mobileAction;
   const native=document.querySelector('.combat-hud [data-control-key="'+k+'"]'),remain=Math.max(0,finite(s.cooldowns?.[k])-s.time),owned=[...pointers.values()].some(p=>p.target===el),locked=blocked||(!owned&&(remain>.001||native?.disabled||k!=='D'&&D()?.active(s)));
   el.disabled=!!locked;if(remain>.001&&!owned)setText(el.lastChild,remain.toFixed(1)+'s');else{const label=({S:'블링크',D:D()?.active(s)?'공명 중':'공명'})[k];setText(el.lastChild,label);}
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
  let lastWidth=innerWidth;const refreshStickRects=()=>{for(const r of pointers.values())if(r.stick)r.stickRect=r.target.getBoundingClientRect();};
  window.addEventListener('resize',()=>{if(Math.abs(innerWidth-lastWidth)>8)clear('resize');lastWidth=innerWidth;dimensions();refreshStickRects();},{passive:true});window.visualViewport?.addEventListener('resize',()=>{dimensions();refreshStickRects();},{passive:true});
  window.__HAPIL_MOBILE_V31366__=Object.freeze({installed:true,version:VERSION,enabled,owns,hasPointers:()=>pointers.size>0,clear,beforeFrame,chargeCancelled,backingScale,setMode,setQuality,update,metrics:()=>({...metrics}),snapshot:()=>({enabled:enabled(),uiActive,options:{...options},pointers:[...pointers].map(([id,r])=>({id,keys:[...r.keys],canceled:r.canceled,stick:r.stick})),lastTick,logicalWorld:[1280,720]})});
  window.MONGSE_ASSET_VERSION='31400';document.title='合一 · 합일 RC29 모바일';
  window.__HAPIL_V31366_RELEASE__=Object.freeze({installed:true,version:VERSION,cacheKey:31408,saveRevision:14,baseVersion:'3.13.65-RC1',activeBundle:'index-v31526.js'});
  update();timer=setInterval(update,250);
 }
 boot();
})();
