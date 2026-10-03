/* RC96: read-only, bounded HUD; no resource or combat mutations. */
(()=>{'use strict';
 const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let panel=null,world=null,total=0,lastUntil=0;
 function status(s){const L=window.__HAPIL_LOOP_V31365__,remaining=Math.max(0,num(s.awakeningUntil)-num(s.time)),value=clamp(num(s.resonance),0,100);
  if(world!==s||lastUntil!==s.awakeningUntil){world=s;lastUntil=s.awakeningUntil;total=Math.max(.1,remaining);}
  const charging=L?.isCharging(s)===true,elapsed=charging?Math.max(0,num(s.time)-num(s.chargeStartV31365,num(s.time))):0,queued=L?.pendingChargeTier(s)??0;
  const samong=window.__HAPIL_SAMONG_RC91__?.status?.(s)??null;
  return {value,remaining,samong,fill:remaining>0?clamp(remaining/total,0,1):value/100,mode:remaining>0?'ego':value>=100?'ready':'resonance',
   label:remaining>0?'EGO 각성 · '+remaining.toFixed(1)+'초':value>=100?'공명 100 / 100 · 각성 준비':'공명 '+Math.floor(value)+' / 100',
   charging,chargeFill:queued?1:clamp(elapsed/1.2,0,1),chargeLabel:queued?'강화 사격 대기':charging?'차징 '+elapsed.toFixed(1)+'초 · 자동공격 유지':''};
 }
 function mount(){const mobile=window.__HAPIL_MOBILE_V31366__?.enabled?.()===true||document.documentElement.classList.contains('hapil-touch-v31366'),host=mobile&&innerHeight>innerWidth?document.body:document.querySelector('#rc108-control-overlay')??(!mobile?document.querySelector('.game>.combat-hud'):null)??document.body;if(panel?.isConnected){if(host&&panel.parentElement!==host)host.append(panel);return panel;}panel=document.createElement('aside');panel.id='hapil-resonance-rc96';panel.className='hapil-resonance-rc96';panel.setAttribute('aria-label','공명과 EGO 각성 상태');
  panel.innerHTML='<b class="rc96-resource-text"></b><div class="rc96-resource-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><small class="rc108-samong-cooldown" hidden></small><div class="rc96-charge" hidden><span></span><div><i></i></div></div>';(host||document.body).append(panel);return panel;
 }
 function update(){const b=window.__HAPIL_CONTROLS_V31329__?.binding,s=b?.state?.current;
  if(!s||b.phase!=='game'||s.hp<=0||['hub','village'].includes(s.zone)||b.modal?.current||window.__HAPIL_READING_V31342__?.blocked||document.hidden){if(panel)panel.hidden=true;return;}
  const p=mount(),v=status(s);p.hidden=false;p.dataset.mode=v.mode;p.querySelector('.rc96-resource-text').textContent=v.label;
  const bar=p.querySelector('.rc96-resource-bar');bar.setAttribute('aria-valuenow',String(v.remaining>0?Math.round(v.fill*100):v.value));bar.setAttribute('aria-valuetext',v.label);bar.querySelector('i').style.transform='scaleX('+v.fill+')';
  const cooldown=p.querySelector('.rc108-samong-cooldown'),sm=v.samong;cooldown.hidden=!sm?.enabled;const ego=window.__HAPIL_SAMONG_POLICY_RC133__?.status(s);cooldown.textContent=!sm?.enabled?'':('EGO '+(ego?.count??0)+' / 7'+(ego?.pending?' · 발동 예약':'')+' · ')+(sm.active?'사몽각성 '+sm.remaining.toFixed(1)+'초 · 위력 ×7':sm.ready?'사몽각성 준비':`사몽각성 재사용 ${Math.ceil(sm.cooldown)}초`);
  const row=p.querySelector('.rc96-charge');row.hidden=!v.chargeLabel;row.querySelector('span').textContent=v.chargeLabel;row.querySelector('i').style.transform='scaleX('+v.chargeFill+')';
 }
 window.__HAPIL_RESONANCE_HUD_RC96__=Object.freeze({version:'RC96',status,update});setInterval(update,100);
})();
