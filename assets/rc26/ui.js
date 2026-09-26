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
 const bossbar=document.createElement('section');bossbar.id='rc24-bossbar';bossbar.hidden=true;bossbar.setAttribute('aria-label','보스 체력');document.body.append(bossbar);
 const screen=document.createElement('button');screen.className='rc22-fullscreen';screen.textContent='전체화면';screen.type='button';screen.setAttribute('aria-label','전체화면 전환');panel.append(screen);
 screen.addEventListener('click',async()=>{try{if(document.fullscreenElement){await document.exitFullscreen();screen.textContent='전체화면';}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();screen.textContent='전체화면 해제';}else{screen.textContent='가로모드로 회전';}}catch{screen.textContent='브라우저 전체화면 사용';}});

 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hp=(value,max)=>{const a=Math.max(0,Number(value)||0),b=Math.max(1,Number(max)||a||1);return `<div class="rc21-vitals"><b>${Math.ceil(a)} <small>/ ${Math.ceil(b)}</small></b><i style="--fill:${Math.min(100,Math.round(100*a/b))}%"></i></div>`;};
 const status=(a,t)=>[['stunUntil','기절'],['staggerUntil','경직'],['slowUntil','둔화'],['burnUntil','화상'],['poisonUntil','중독'],['invulnerableUntil','무적'],['guardUntil','방어'],['dashingUntil','회피']].filter(([k])=>Number(a?.[k])>t).map(([k,name])=>`${name} ${Math.max(0,a[k]-t).toFixed(1)}초`).join(' · ');
 const line=(label,value)=>`<div class="rc21-line"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
 function update(){
  if(document.hidden)return;
  const api=window.__HAPIL_RC15__,binding=window.__HAPIL_CONTROLS_V31329__?.binding;
  const s=binding?.state?.current,live=!!s&&binding.phase==='game';
  if(live&&binding.settings?.current?.showCombatInfo!==false){const next={...binding.settings.current,showCombatInfo:false};binding.settings.current=next;binding.setSettings?.(old=>old?.showCombatInfo===false?old:{...old,showCombatInfo:false});}
  const mobile=document.documentElement.classList.contains('hapil-touch-v31366');
  panel.hidden=!live||mobile;document.body.classList.toggle('rc15-playing',live);
  if(!live){if(!bossbar.hidden){bossbar.hidden=true;bossbar.innerHTML='';}return;}
  if(!api)return;
  const t=Number(s.time)||0,enemies=(s.enemies??[]).filter(e=>e.hp>0&&!e.visualOnly);
  const bosses=enemies.filter(e=>e.boss||e.midboss);
  const target=enemies.find(e=>e.id===s.targetEnemyId)||bosses[0]||enemies[0];
  const majorBoss=bosses.find(e=>e.boss)||bosses[0];
  if(majorBoss){const pct=Math.min(100,Math.max(0,100*(Number(majorBoss.hp)||0)/Math.max(1,Number(majorBoss.maxHp)||1)));bossbar.hidden=false;const fill=`${pct}%`;if(bossbar.style.getPropertyValue('--boss-hp')!==fill)bossbar.style.setProperty('--boss-hp',fill);const html=`<div class="rc24-bossbar-title"><span>${esc(majorBoss.name??majorBoss.id)}</span><b>${Math.ceil(majorBoss.hp)} / ${Math.ceil(majorBoss.maxHp??majorBoss.hp)}</b></div><i aria-hidden="true"></i><small>${esc(majorBoss.activePattern??(majorBoss.boss?'보스 전투':'정예 전투'))}${majorBoss.activePatternUntil>t?` · ${(majorBoss.activePatternUntil-t).toFixed(1)}초`:''}</small>`;if(bossbar.innerHTML!==html)bossbar.innerHTML=html;}else if(!bossbar.hidden){bossbar.hidden=true;bossbar.innerHTML='';}
  if(mobile)return;
  let enemy=`<h2>적 <span>THREAT</span></h2><div class="rc21-kicker">${esc(api.zone(s.zone)?.name??s.zone)} · 생존 ${enemies.length}</div>`;
  if(target){enemy+=`<section class="rc21-focus"><strong>${esc(target.name??target.id)}</strong>${hp(target.hp,target.maxHp??target.hp)}</section>`;
   const active=status(target,t);if(active)enemy+=line('적 상태',active);
  }else enemy+='<p class="rc21-empty">적을 찾는 중</p>';
  const laser=(s.bossLaserCastsV31330??[]).find(c=>Number(c.endAt)>t);
  const pending=(s.pendingHits??[]).filter(h=>Number(h.at)>t).sort((a,b)=>a.at-b.at)[0];
  const finale=(s.bossUltimateCastsV31334??[]).find(c=>Number(c.endAt)>t),shapeText={line:'직선 광역 · 예고선을 벗어나세요',cross:'십자 광역 · 교차선 밖으로 이동하세요',circle:'원형 낙하 · 표식 바깥으로 회피하세요',donut:'고리 공격 · 안쪽 빈 공간을 이용하세요',cone:'부채꼴 공격 · 보스 정면에서 벗어나세요',safe:'안전 구역 표식 · 표시된 곳으로 이동하세요'};
  const currentName=finale?(finale.patternTitleRC25??(finale.kind==='ultimate'?'보스 궁극기 · 광로와 낙하':finale.kind==='rain'?'보스 낙하 심판':'보스 전역 광로')):majorBoss?.activePattern;
  if(laser){const before=t<laser.fireAt;enemy+=`<div class="rc21-alert"><small>${before?'시전 경고':'발사 중'}</small><strong>${esc(laser.patternNameV31331??'보스 고유 레이저')}</strong><span>${before?`발사까지 ${(laser.fireAt-t).toFixed(1)}초`:'레이저 경로에서 이탈'}</span><em>${esc(shapeText.line)}</em></div>`;}
  else if(pending){const source=enemies.find(e=>String(e.id)===String(pending.sourceId));enemy+=`<div class="rc21-alert"><small>공격 예고 · ${(Math.max(0,pending.at-t)).toFixed(1)}초</small><strong>${esc(pending.label??pending.name??pending.patternName??source?.activePattern??'적 공격')}</strong><span>${esc(shapeText[pending.shape]??(pending.telekineticRain?'투사체 폭우 · 이동 경로를 바꾸세요':'표식 범위를 벗어나세요'))}</span><em>${esc(source?.name??'적')} · 기본 피해 ${Math.max(0,Number(pending.damage)||0)} + 모드별 체력 비례 피해</em></div>`;}
  else if(finale){enemy+=`<div class="rc21-alert rc24-boss-skill"><small>보스 궁극기 진행 중</small><strong>${esc(currentName)}</strong><span>${esc(finale.detailRC25??'광로와 낙하 표식이 이어집니다 · 열린 통로로 이동')} · 피해 최대 66% / 회복 -66% · 6초</span></div>`;}
  else if(currentName){enemy+=`<div class="rc24-skill-detail"><small>보스 패턴</small><strong>${esc(currentName)}</strong><span>표식과 공격 방향을 확인해 안전한 통로로 회피하세요.</span></div>`;}
  else enemy+='<div class="rc21-calm">현재 시전 중인 공격 없음</div>';
  const heroes=api.heroes(),hero=heroes.find(h=>h.id===s.activeHeroId);
  let ally=`<h2>아군 <span>STATUS</span></h2><section class="rc21-focus"><strong>${esc(hero?.name??s.activeHeroId??'영웅')}</strong>${hp(s.hp,s.maxHp??s.hp)}</section>`;
  const self=status(s,t);ally+=line('현재 상태',self||'정상');
  if(Number(s.heroHealingReducedUntilRC24)>t)ally+=line('회복 약화',`${(s.heroHealingReducedUntilRC24-t).toFixed(1)}초 · 회복량 66% 감소`);
  if(window.__HAPIL_CHANNEL_V31364__?.active?.(s))ally+=line('누리의 기원','D 공명 · 이동 봉인 · 무적');
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
 document.title='合一 · 합일 RC29 모바일';
 window.__HAPIL_FINAL_RELEASE__={version:'3.26-STORY-RC29-MOBILE',activeBundle:'index-v31526.js',cacheKey:32901};
 setInterval(update,300);update();
})();
