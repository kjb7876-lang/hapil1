(()=>{'use strict';
 window.__HAPIL_RC15_SHIFT__=false;
 addEventListener('keydown',e=>{window.__HAPIL_RC15_SHIFT__=e.shiftKey;},true);
 addEventListener('keyup',e=>{window.__HAPIL_RC15_SHIFT__=e.shiftKey;},true);
 addEventListener('blur',()=>{window.__HAPIL_RC15_SHIFT__=false;});
 const panel=document.createElement('section');
 panel.id='rc15-sidepanels';panel.setAttribute('aria-label','전투 상태');panel.hidden=true;
 const left=document.createElement('aside'),right=document.createElement('aside');
 left.className='rc15-panel rc15-enemies';right.className='rc15-panel rc15-allies';
 panel.append(left,right);document.body.append(panel);
 const screen=document.createElement('button');screen.className='rc22-fullscreen';screen.textContent='전체화면';screen.type='button';screen.setAttribute('aria-label','전체화면 전환');panel.append(screen);
 screen.addEventListener('click',async()=>{try{if(document.fullscreenElement){await document.exitFullscreen();screen.textContent='전체화면';}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();screen.textContent='전체화면 해제';}else{screen.textContent='가로모드로 회전';}}catch{screen.textContent='브라우저 전체화면 사용';}});

 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hp=(value,max)=>{const a=Math.max(0,Number(value)||0),b=Math.max(1,Number(max)||a||1);return `<div class="rc21-vitals"><b>${Math.ceil(a)} <small>/ ${Math.ceil(b)}</small></b><i style="--fill:${Math.min(100,Math.round(100*a/b))}%"></i></div>`;};
 const status=(a,t)=>[['stunUntil','기절'],['staggerUntil','경직'],['slowUntil','둔화'],['burnUntil','화상'],['poisonUntil','중독'],['invulnerableUntil','무적'],['guardUntil','방어'],['dashingUntil','회피']].filter(([k])=>Number(a?.[k])>t).map(([k,name])=>`${name} ${Math.max(0,a[k]-t).toFixed(1)}초`).join(' · ');
 const line=(label,value)=>`<div class="rc21-line"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
 function update(){
  const api=window.__HAPIL_RC15__,binding=window.__HAPIL_CONTROLS_V31329__?.binding;
  const s=binding?.state?.current,live=!!s&&binding.phase==='game';
  panel.hidden=!live;document.body.classList.toggle('rc15-playing',live);
  if(!live||!api)return;
  const t=Number(s.time)||0,enemies=(s.enemies??[]).filter(e=>e.hp>0&&!e.visualOnly);
  const bosses=enemies.filter(e=>e.boss||e.midboss);
  const target=enemies.find(e=>e.id===s.targetEnemyId)||bosses[0]||enemies[0];
  let enemy=`<h2>적 <span>THREAT</span></h2><div class="rc21-kicker">${esc(api.zone(s.zone)?.name??s.zone)} · 생존 ${enemies.length}</div>`;
  if(target){enemy+=`<section class="rc21-focus"><strong>${esc(target.name??target.id)}</strong>${hp(target.hp,target.maxHp??target.hp)}</section>`;
   const active=status(target,t);if(active)enemy+=line('적 상태',active);
  }else enemy+='<p class="rc21-empty">적을 찾는 중</p>';
  const laser=(s.bossLaserCastsV31330??[]).find(c=>Number(c.endAt)>t);
  const pending=(s.pendingHits??[]).filter(h=>Number(h.at)>t).sort((a,b)=>a.at-b.at)[0];
  if(laser){const before=t<laser.fireAt;enemy+=`<div class="rc21-alert"><small>${before?'시전 경고':'발사 중'}</small><strong>${esc(laser.patternNameV31331??'혈광포')}</strong><span>${before?`발사까지 ${(laser.fireAt-t).toFixed(1)}초`:'예고 경로 밖으로 회피'}</span></div>`;}
  else if(pending)enemy+=`<div class="rc21-alert"><small>공격 예고</small><strong>${esc(pending.label??pending.name??pending.patternName??'공격')}</strong><span>${Math.max(0,pending.at-t).toFixed(1)}초 후 적중</span></div>`;
  else enemy+='<div class="rc21-calm">현재 시전 중인 공격 없음</div>';
  const heroes=api.heroes(),hero=heroes.find(h=>h.id===s.activeHeroId);
  let ally=`<h2>아군 <span>STATUS</span></h2><section class="rc21-focus"><strong>${esc(hero?.name??s.activeHeroId??'영웅')}</strong>${hp(s.hp,s.maxHp??s.hp)}</section>`;
  const self=status(s,t);ally+=line('현재 상태',self||'정상');
  const party=window.__HAPIL_PARTY_V31322__;
  if(party?.state===s){const members=(party.actors??[]).filter(a=>a.hp>0);
   if(members.length){ally+='<div class="rc21-party-title">동료</div><div class="rc21-party">';
    for(const a of members){const name=heroes.find(h=>h.id===(a.heroId??a.id))?.name??a.name??'동료';
     ally+=`<div class="rc21-member"><span>${esc(name)}</span><b>${Math.ceil(a.hp)} HP</b>${status(a,t)?`<small>${esc(status(a,t))}</small>`:''}</div>`;}
    ally+='</div>';}
  }
  const recent=(s.skillEventsV31513??[]).filter(e=>t-Number(e.at)<5).at(-1);
  if(recent){const name=heroes.find(h=>h.id===recent.heroId)?.skills?.find(k=>k.key===recent.key)?.name??({G:'공명',Collab:'콜라보'}[recent.key]??recent.key);
   ally+=`<div class="rc21-recent">최근 발동 <strong>${esc(name)}</strong></div>`;}
  if(left.innerHTML!==enemy)left.innerHTML=enemy;
  if(right.innerHTML!==ally)right.innerHTML=ally;
 }
 document.title='合一 · 합일 RC23';
 window.__HAPIL_FINAL_RELEASE__={version:'3.23-COMBAT-RC23',activeBundle:'index-v31523.js',cacheKey:31523};
 setInterval(update,300);update();
})();
