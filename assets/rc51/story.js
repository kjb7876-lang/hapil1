/* RC57: uploaded first-person monologue replaces legacy encounter dialogue. */
(()=>{'use strict';
 const data=window.__HAPIL_STORY_DATA_RC51__, records=new Map(data.records.map(r=>[r.zone,r]));
 const sessions=new WeakMap();let root=null,owner=null,done=null,previousFocus=null,autoLeft=0,autoPaused=false,lastUi=0,previousBlocked=false;
 const enabled=s=>!!s&&!s.practiceV31329&&(window.__HAPIL_MODES_V31346__?.mode(s)??s.gameModeV31346??(s.hellModeV31322?'HELL':'STORY'))==='STORY';
 const active=s=>enabled(s)&&s.hp>0&&s.zone==='cult04'&&s.activeHeroId==='hwando'&&s.hapilSamongActiveV31300===true&&s.hapilFinalBattleV31300?.secondPhaseActive===true&&s.hapilFinalBattleV31300.stage>=7&&!s.hapilFinalBattleV31300.completed;
 function memory(s){let m=sessions.get(s);if(!m||s.time<m.last-.5){m={zone:null,last:s.time,pre:false,post:false,firstPost:false,awakenPre:false,elapsed:0,trails:[],wasActive:false};sessions.set(s,m);}m.last=s.time;return m;}
 function el(tag,cls,text){const e=document.createElement(tag);e.className=cls;if(text!=null)e.textContent=text;return e;}
 function clearInput(){window.__HAPIL_CONTROLS_V31329__?.clear?.();}
 function fit(){if(!root)return;const box=root.querySelector('.rc51-copybox'),copy=root.querySelector('.rc51-copy');
  const landscape=window.innerWidth>window.innerHeight&&window.innerHeight<620;copy.style.columnCount=landscape?'2':'1';
  const max=window.innerWidth<600?18:21;let size=max;
  for(;size>=10;size-=.25){copy.style.fontSize=size+'px';if(copy.scrollHeight<=box.clientHeight+1&&copy.scrollWidth<=box.clientWidth+1)break;}
  root.dataset.font=String(size);root.dataset.fits=String(copy.scrollHeight<=box.clientHeight+1&&copy.scrollWidth<=box.clientWidth+1);
 }
 function close(commit=true){if(!root)return;const callback=done;if(window.__HAPIL_READING_V31342__)window.__HAPIL_READING_V31342__.blocked=previousBlocked;root.remove();root=null;owner=null;done=null;clearInput();previousFocus?.isConnected&&previousFocus.focus?.();if(commit)callback?.();}
 function show(s,r,kind,text,callback){if(root||!text)return false;owner=s;done=callback;previousFocus=document.activeElement;previousBlocked=!!window.__HAPIL_READING_V31342__?.blocked;if(window.__HAPIL_READING_V31342__)window.__HAPIL_READING_V31342__.blocked=true;clearInput();
  root=el('div','rc51-story');root.id='hapil-story-rc51';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','rc51-title');
  root.dataset.zone=s.zone;root.dataset.phase=kind;
  const panel=el('section','rc51-panel'),head=el('header','rc51-header');
  head.append(el('small','rc51-kicker',kind==='pre'?'전투 전 · 기억':kind==='firstPost'?'전투 후 · 돌아오는 현실':kind==='awakenPre'?'전투 전 · 사몽 각성':'전투 후 · 남겨진 기억'));
  const title=el('h1','',r.title);title.id='rc51-title';head.append(title);panel.append(head);
  const box=el('div','rc51-copybox'),copy=el('article','rc51-copy');for(const paragraph of text.split(/\n\s*\n/))copy.append(el('p','',paragraph));box.append(copy);panel.append(box);
  const footer=el('footer','rc51-footer'),pause=el('button','','자동 넘김 멈춤'),next=el('button','','계속 · Enter');pause.type=next.type='button';
  const full=window.__HAPIL_CONTROLS_V31329__?.effective?.()==='full';autoLeft=full?Math.max(12,text.length/9):0;autoPaused=false;lastUi=performance.now();pause.hidden=!full;
  pause.onclick=()=>{autoPaused=!autoPaused;pause.textContent=autoPaused?'자동 넘김 계속':'자동 넘김 멈춤';};next.onclick=()=>close();footer.append(pause,next);panel.append(footer);root.append(panel);document.body.append(root);
  fit();document.fonts?.ready.then(()=>{if(root)fit();});next.focus();return true;
 }
 function suppressEntry(s){
  if(!s)return;
  const now=Number.isFinite(s.time)?s.time:0;
  const hadLegacyDialogue=!!s.encounterDialogue31226||Number(s.encounterLockUntil31226??0)>now||Number(s.encounterWallUnlockAtV31227??0)>0;
  s.encounterDialogue31226=null;s.encounterLockUntil31226=0;s.encounterWallUnlockAtV31227=0;
  if(hadLegacyDialogue){
   s.invulnerableUntil=Math.min(Number.isFinite(s.invulnerableUntil)?s.invulnerableUntil:now,now+.12);
   for(const [i,enemy] of (s.enemies??[]).entries()){
    enemy.readyAt=Math.min(Number.isFinite(enemy.readyAt)?enemy.readyAt:now,now+.14+i*.015);
    enemy.patternReadyAt=Math.min(Number.isFinite(enemy.patternReadyAt)?enemy.patternReadyAt:now,now+.28+i*.015);
    enemy.invulnerableUntil=Math.min(Number.isFinite(enemy.invulnerableUntil)?enemy.invulnerableUntil:now,now+.12);
   }
  }
  s.restPortalUnlockAt31226=now;s.restPortalWallUnlockAtV31227=0;s.restDialogueComplete31226=true;s.zoneEntryFlowZone31226=s.zone;
 }
 function beforeFrame(s,ctx={}){
  if(root){if(owner!==s||!enabled(s)||s.hp<=0){close(false);}else{const now=performance.now(),dt=Math.min(.1,(now-lastUi)/1000);lastUi=now;if(!document.hidden&&!autoPaused&&autoLeft>0){autoLeft-=dt;if(autoLeft<=0)close();}return true;}}
  document.documentElement.classList.toggle('rc51-samong',active(s));
  if(!enabled(s)||ctx.blocked||s.hp<=0)return false;
  const m=memory(s),r=records.get(s.zone);
  if(m.zone!==s.zone){m.zone=s.zone;m.pre=false;m.post=false;m.firstPost=false;m.awakenPre=false;m.elapsed=0;m.trails=[];}
  suppressEntry(s);
  if(!r||r.rest)return false;
  if(!m.pre){m.pre=true;return show(s,r,'pre',r.pre,()=>{});}
  const battle=s.hapilFinalBattleV31300;
  if(s.zone==='cult04'&&battle&&!battle.completed){
   if(!m.firstPost){m.firstPost=true;return show(s,r,'firstPost',r.firstPost,()=>{});}
   if(battle.stage>=5&&!m.awakenPre){m.awakenPre=true;ctx.selectPhysician?.();return show(s,r,'awakenPre',r.awakenPre,()=>{});}
  }
  if(!m.post&&ctx.clear){m.post=true;return show(s,r,'post',r.post,()=>{if(s.zone==='cult04')ctx.finish?.();});}
  return false;
 }
 // World time is the single clock for enemy AI, attacks, beams and projectiles.
 // Only the local awakened physician receives an independent accelerated clock.
 function clock(s,realDt){const m=memory(s);const on=active(s);document.documentElement.classList.toggle('rc51-samong',on);
  if(!on){m.wasActive=false;m.trails=[];document.documentElement.classList.remove('rc51-time-stop');return realDt;}
  if(!m.wasActive){m.elapsed=0;m.startTime=s.time;m.wasActive=true;}
  m.elapsed+=realDt;const frozen=m.elapsed%2.8<1.2,scale=frozen?0:.16,dt=realDt*scale,extra=realDt*2.2-dt;
  document.documentElement.classList.toggle('rc51-time-stop',frozen);
  if(Number.isFinite(s.lastAttack))s.lastAttack-=extra;
  for(const k of ['autoSkillNextAt','manualControlUntilV31329','heroAttackLockUntilV31336','heroMoveLockUntilV31336','dashingUntil','autoEvadeUntil31223','heroSleepUntil','heroCharmUntil'])if(Number.isFinite(s[k])&&s[k]>s.time)s[k]=Math.max(s.time,s[k]-extra);
  for(const k of Object.keys(s.cooldowns??{}))if(s.cooldowns[k]>s.time)s.cooldowns[k]=Math.max(s.time,s.cooldowns[k]-extra);
  for(const k of ['started','until'])if(Number.isFinite(s.heroMotion?.[k]))s.heroMotion[k]-=extra;
  for(const hit of s.pendingStrikes??[])if(!hit.partySlotV31322){if(Number.isFinite(hit.at))hit.at-=extra;}
  for(const fx of s.effects??[]){if(!(fx.heroSkillVfx||fx.heroId31213||fx.heroIdV31313||fx.heroHitVfxV31315)||fx.partySlotV31322)continue;
   for(const k of ['born','contactAtV31312','impactAt','expiresAt','heroArrivalAtV31312'])if(Number.isFinite(fx[k]))fx[k]-=extra;
   if(!fx.rc51Enlarged){fx.rc51Enlarged=true;if(Number.isFinite(fx.size))fx.size*=1.55;}
  }
  m.trails.push({x:s.x,y:s.y,at:m.elapsed});m.trails=m.trails.filter(p=>m.elapsed-p.at<.23).slice(-10);
  return dt;
 }
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(!root)return;e.stopImmediatePropagation();if(e.code==='Tab'){const nodes=[...root.querySelectorAll('button:not([hidden])')],at=nodes.indexOf(document.activeElement);e.preventDefault();nodes[(at+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();return;}e.preventDefault();if(type==='keydown'&&!e.repeat&&['Enter','Space'].includes(e.code))close();},true);
 window.__HAPIL_STORY_RC51__=Object.freeze({enabled,active,beforeFrame,clock,show,close,fit,records,isOpen:()=>!!root,replacesLegacy:true,suppressEntry,
  heroNow:s=>active(s)?(memory(s).startTime??s.time)+memory(s).elapsed*2.2:s.time,heroSpeed:s=>active(s)?1.7:1,heroSize:s=>active(s)?1.3:1,power:s=>active(s)?5:1,incoming:s=>active(s)?.12:1,trails:s=>active(s)?memory(s).trails:[]});
 // The opening voice monologue and map cards share the same uploaded source.
 window.__HAPIL_PATIENT_DATA_RC51__={...data,records:[{zone:'hub',index:0,title:'남아 있는 기억',entry:'',body:rawPrologue()},...data.records.map(r=>({...r,entry:r.paragraphs[0]??'',body:r.paragraphs.slice(1).join('\n\n')}))]};
 function rawPrologue(){return data.raw.slice(0,data.raw.indexOf('[01 · dist00]')).trim();}
})();
