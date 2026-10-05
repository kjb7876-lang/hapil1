/* RC57: uploaded first-person monologue replaces legacy encounter dialogue. */
(()=>{'use strict';
 const data=window.__HAPIL_STORY_DATA_RC51__, records=new Map(data.records.map(r=>[r.zone,r]));
 const sessions=new WeakMap();let root=null,owner=null,done=null,previousFocus=null,autoLeft=0,autoPaused=false,lastUi=0,previousBlocked=false,narration=null,narrationToken=0;
 const openingVoice=data.openingVoice?.opening.audio??'./assets/rc26/audio/opening-memory.wav',rootVoice=data.openingVoice?.root.audio??'./assets/rc26/audio/root-memory.wav';
 const enabled=s=>!!s&&!s.practiceV31329&&(window.__HAPIL_MODES_V31346__?.mode(s)??s.gameModeV31346??(s.hellModeV31322?'HELL':'STORY'))==='STORY';
 const storyActive=s=>enabled(s)&&s.hp>0&&s.zone==='cult04'&&s.activeHeroId==='hwando'&&s.hapilSamongActiveV31300===true&&s.hapilFinalBattleV31300?.secondPhaseActive===true&&s.hapilFinalBattleV31300.stage>=7&&!s.hapilFinalBattleV31300.completed;
 const active=s=>storyActive(s)||window.__HAPIL_SAMONG_RC91__?.active(s)===true;
 function memory(s){let m=sessions.get(s);if(!m||s.time<m.last-.5){m={zone:null,last:s.time,pre:false,post:false,firstPost:false,awakenPre:false,elapsed:0,trails:[],wasActive:false};sessions.set(s,m);}m.last=s.time;return m;}
 function el(tag,cls,text){const e=document.createElement(tag);e.className=cls;if(text!=null)e.textContent=text;return e;}
 function clearInput(){window.__HAPIL_CONTROLS_V31329__?.clear?.();}
 function fit(){if(!root)return;const box=root.querySelector('.rc51-copybox'),copy=root.querySelector('.rc51-copy');
  const landscape=window.innerWidth>window.innerHeight&&window.innerHeight<620;copy.style.columnCount=landscape?'2':'1';
  const max=window.innerWidth<600?18:21;let size=max;
  for(;size>=10;size-=.25){copy.style.fontSize=size+'px';if(copy.scrollHeight<=box.clientHeight+1&&copy.scrollWidth<=box.clientWidth+1)break;}
  root.dataset.font=String(size);root.dataset.fits=String(copy.scrollHeight<=box.clientHeight+1&&copy.scrollWidth<=box.clientWidth+1);
 }
 function stopNarration(){narrationToken++;narration?.stop?.();narration=null;}
 function voicePath(r,kind){return r?.zone==='dist00'&&kind==='pre'?openingVoice:r?.zone==='dist00'&&kind==='post'?rootVoice:null;}
 // Keep the original recordings and transport. The host owns the reader's
 // lifetime, so neither a slow download nor an intentional pause can skip speech.
 function originalNarration(s,card,path,button,manager,ctx){
  const token=++narrationToken,volume=Number.isFinite(Number(ctx.voiceVolume))?Math.max(0,Math.min(1,Number(ctx.voiceVolume))):.8;
  let state='idle',disposed=false,generation=0,endedAt=0,lastProgress=0,progressAt=0,resumeVisible=false,resumeContext=false,observedContext=null,pendingPlay=null,gesturePause=null;
  const listeners=[],mixOwner={},now=()=>performance.now();
  const valid=()=>!disposed&&token===narrationToken&&root===card&&owner===s&&card.isConnected&&enabled(s)&&s.hp>0&&card.dataset.zone===s.zone&&!document.getElementById('hapil-death-verse-rc59');
  function listen(target,event,callback){target.addEventListener(event,callback);listeners.push(()=>target.removeEventListener(event,callback));}
  function display(next){state=next;card.dataset.originalVoiceState=next;button.textContent=({idle:'음성 재생',loading:'음성 불러오는 중…',playing:'음성 일시정지',paused:'음성 이어 듣기',interrupted:'음성 이어 듣기',ended:'다시 듣기',blocked:'음성 재생 · 눌러서 다시 시도'})[next]||'음성 재생';window.__HAPIL_NARRATION_MIX_V1__?.set(mixOwner,next==='playing'&&volume>0);}
  const clip=manager.create(path,{volume,
   onPlaying(){
    if(!valid()){stop();return;}
    if(state!=='loading'&&state!=='playing'){clip.pause();return;}
    if(interrupted()){holdContext();return;}
    lastProgress=clip.position;progressAt=now();display('playing');
   },
   onEnded(){if(!valid()){stop();return;}if(state!=='playing')return;resumeVisible=resumeContext=false;endedAt=now();display('ended');},
   onBlocked(){if(!disposed&&(state==='loading'||state==='playing'))failed();}
  });
  function interrupted(){return clip.backend==='webaudio'&&(clip.contextState==='interrupted'||clip.contextState==='suspended');}
  function pause(){
   if(disposed)return;resumeVisible=resumeContext=false;
   if(state==='idle'||state==='ended'||state==='blocked')return;
   ++generation;clip.pause();display('paused');
  }
  function holdContext(){pause();resumeContext=true;display('interrupted');}
  function failed(){if(disposed)return;++generation;resumeVisible=resumeContext=false;clip.pause();display('blocked');}
  function contextChanged(){
   if(!valid()){stop();return;}
   // A media fallback has its own clock and is unaffected by this context.
   if(interrupted()&&(state==='playing'||state==='loading'))holdContext();
   else if(resumeContext&&clip.contextState==='running'&&!document.hidden)void play();
   else if(clip.backend==='webaudio'&&clip.contextState==='closed'&&(resumeContext||state==='playing'||state==='loading'))failed();
  }
  function observeContext(){
   const context=clip.audioContext;
   if(context&&context!==observedContext){observedContext=context;listen(context,'statechange',contextChanged);}
  }
  async function play(){
   if(!valid()){stop();return false;}
   if(state==='playing'||state==='loading')return false;
   resumeVisible=resumeContext=false;endedAt=0;
   if(document.hidden){display('paused');resumeVisible=true;return false;}
   const request=++generation;lastProgress=clip.position;progressAt=now();display('loading');
   // The legacy media transport reuses one element. Retire its prior promise
   // first so a stale completion cannot pause the newly resumed playback.
   if(pendingPlay&&clip.backend==='media'){await pendingPlay;if(disposed||request!==generation)return false;if(!valid()){stop();return false;}}
   const pending=clip.play();pendingPlay=pending;observeContext();contextChanged();
   const ok=await pending;
   if(pendingPlay===pending)pendingPlay=null;
   if(disposed||request!==generation)return false;
   if(!valid()){stop();return false;}
   if(!ok&&state==='loading')failed();
   return ok;
  }
  function check(){
   if(!valid()){stop();return;}
   observeContext();contextChanged();
   if(state!=='playing'&&state!=='loading')return;
   const position=Number(clip.position)||0,time=now();
   if(state==='playing'&&position>lastProgress+.001){lastProgress=position;progressAt=time;}
   // A suspended context is a resumable hold; an otherwise running transport
   // which never progresses is a bounded failure and retains a Retry button.
   if(time-progressAt>=15000)failed();
  }
  function stop(){
   if(disposed)return;disposed=true;++generation;resumeVisible=resumeContext=false;clip.stop();window.__HAPIL_NARRATION_MIX_V1__?.set(mixOwner,false);
   window.clearInterval(watch);for(const remove of listeners)remove();
  }
  const watch=window.setInterval(check,250);
  listen(document,'visibilitychange',()=>{
   if(!valid()){stop();return;}
   if(document.hidden&&(state==='playing'||state==='loading'||resumeContext)){pause();resumeVisible=true;}
   else if(!document.hidden&&(resumeVisible||resumeContext))void play();
  });
  listen(window,'pagehide',pause);
  if(typeof MutationObserver==='function'){
   const removed=new MutationObserver(()=>{if(!valid())stop();});removed.observe(document.body,{childList:true,subtree:true});listeners.push(()=>removed.disconnect());
  }
  button.dataset.originalVoiceControl='true';card.dataset.originalVoice='true';
  // Global audio unlock runs between pointerdown and click. Preserve the intent
  // before it can recover an interrupted voice and turn Resume into Pause.
  const captureGesture=()=>{gesturePause=state==='playing'||state==='loading';};
  listen(button,'pointerdown',event=>{if(event.button==null||event.button===0)captureGesture();});
  listen(button,'pointercancel',()=>{gesturePause=null;});listen(button,'blur',()=>{gesturePause=null;});
  button.onclick=()=>{const shouldPause=gesturePause??(state==='playing'||state==='loading');gesturePause=null;if(shouldPause)pause();else void play();};
  const api={play,pause,stop,captureGesture,setContext:check,get playing(){return state==='playing';},get status(){return state;},get blocksAdvance(){return !disposed&&(state==='loading'||state==='playing'||state==='paused'||state==='interrupted'||(state==='ended'&&now()-endedAt<750));}};
  if(ctx.sound!==false&&volume>0)void play();
  return api;
 }
 function close(commit=true){if(!root)return;const callback=done;stopNarration();if(window.__HAPIL_READING_V31342__)window.__HAPIL_READING_V31342__.blocked=previousBlocked;root.remove();root=null;owner=null;done=null;clearInput();previousFocus?.isConnected&&previousFocus.focus?.();if(commit)callback?.();}
 function show(s,r,kind,text,callback,ctx={}){if(root||!text)return false;owner=s;done=callback;previousFocus=document.activeElement;previousBlocked=!!window.__HAPIL_READING_V31342__?.blocked;if(window.__HAPIL_READING_V31342__)window.__HAPIL_READING_V31342__.blocked=true;clearInput();stopNarration();
  root=el('div','rc51-story');root.id='hapil-story-rc51';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','rc51-title');
  root.dataset.zone=s.zone;root.dataset.phase=kind;
  if(kind==='post'&&r.postBackdrop){root.style.backgroundImage=`linear-gradient(rgba(3,5,12,.55),rgba(3,5,12,.75)),url("${r.postBackdrop}")`;root.style.backgroundSize='cover';root.style.backgroundPosition='center';root.dataset.flashback='medieval';}
  const panel=el('section','rc51-panel'),head=el('header','rc51-header');
  head.append(el('small','rc51-kicker',kind==='pre'?'전투 전 · 기억':kind==='firstPost'?'전투 후 · 돌아오는 현실':kind==='awakenPre'?'전투 전 · 사몽 각성':'전투 후 · 남겨진 기억'));
  const title=el('h1','',`${String(r.index).padStart(2,'0')} · ${r.title}`);title.id='rc51-title';head.append(title);if(r.postNarrator&&kind==='post')head.append(el('small','rc51-kicker',r.postNarrator));panel.append(head);
  const box=el('div','rc51-copybox'),copy=el('article','rc51-copy'),character=window.__HAPIL_RC140_STORY_CYCLE_ART__?.characters?.[r.zone];
  if(character){const pose=kind==='pre'?'idle':'lurch',frame=character.poses?.[pose];if(frame){const figure=el('figure','rc140-story-character'),image=el('img','');figure.dataset.character=character.id;figure.dataset.pose=pose;figure.setAttribute('aria-label',character.name);image.src=frame.path;image.alt=`${character.name} · ${pose==='idle'?'기억':'유령 잔상'}`;image.decoding='async';image.loading='eager';figure.append(image,el('figcaption','',character.name));copy.append(figure);}}
  for(const paragraph of text.split(/\n\s*\n/))copy.append(el('p','',paragraph));box.append(copy);panel.append(box);
  const footer=el('footer','rc51-footer'),pause=el('button','','자동 넘김 멈춤'),next=el('button','','계속 · Enter'),audioPath=voicePath(r,kind),voiceButton=audioPath?el('button','','음성 재생'):null;pause.type=next.type='button';if(voiceButton)voiceButton.type='button';
  const full=window.__HAPIL_CONTROLS_V31329__?.effective?.()==='full';autoLeft=full&&window.__HAPIL_CONTROLS_V31329__?.binding?.settings?.current?.autoStoryAdvance!==false?Math.max(12,text.length/9):0;autoPaused=false;lastUi=performance.now();pause.hidden=!full;
  pause.onclick=()=>{autoPaused=!autoPaused;pause.textContent=autoPaused?'자동 넘김 계속':'자동 넘김 멈춤';};next.onclick=()=>close();if(voiceButton)footer.append(voiceButton);footer.append(pause,next);panel.append(footer);root.append(panel);document.body.append(root);
  if(audioPath&&autoLeft>0)autoLeft=Math.max(autoLeft,audioPath===openingVoice?55.5:14);
  if(audioPath&&voiceButton){const manager=window.__HAPIL_STORY_VOICE_RC49__;
   if(manager?.create)narration=originalNarration(s,root,audioPath,voiceButton,manager,ctx);
   else voiceButton.textContent='음성 파일을 불러올 수 없음';
  }
  if(!audioPath){let narrationPausedAuto=false;const manualPause=pause.onclick;pause.onclick=()=>{narrationPausedAuto=false;manualPause();};const resumeAdvance=()=>{if(narrationPausedAuto){narrationPausedAuto=false;autoPaused=false;pause.textContent='자동 넘김 멈춤';}};narration=window.__HAPIL_STORY_NARRATION_V1__?.attach?.({root,text,zone:r.zone,phase:kind,ctx,onPlaying:seconds=>{resumeAdvance();if(autoLeft>0)autoLeft=Math.max(autoLeft,seconds+1.5);},onBlocked:resumeAdvance,onUserPause:()=>{if(!autoPaused&&autoLeft>0){narrationPausedAuto=true;autoPaused=true;pause.textContent='자동 넘김 계속';}}})??null;}
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
  if(root&&document.getElementById('hapil-death-verse-rc59')){lastUi=performance.now();return true;}
  if(root){if(owner!==s||!enabled(s)||s.hp<=0||((root.dataset.narration||root.dataset.originalVoice)&&root.dataset.zone!==s.zone)){close(false);}else{narration?.setContext?.(ctx);const now=performance.now(),dt=Math.min(.1,(now-lastUi)/1000);lastUi=now;if(!document.hidden&&!autoPaused&&autoLeft>0){autoLeft-=dt;if(autoLeft<=0){if(narration?.blocksAdvance===true)autoLeft=.05;else close();}}return true;}}
  document.documentElement.classList.toggle('rc51-samong',storyActive(s));
  document.documentElement.classList.toggle('rc91-samong',window.__HAPIL_SAMONG_RC91__?.active(s)===true);
  if(!enabled(s)||ctx.blocked||s.hp<=0)return false;
  const m=memory(s),r=records.get(s.zone);
  if(m.zone!==s.zone){m.zone=s.zone;m.pre=false;m.post=false;m.firstPost=false;m.awakenPre=false;m.elapsed=0;m.trails=[];}
  suppressEntry(s);
  if(!r||r.rest)return false;
  if(!m.pre){m.pre=true;return show(s,r,'pre',r.pre,()=>{},ctx);}
  const battle=s.hapilFinalBattleV31300;
  if(s.zone==='cult04'&&battle&&!battle.completed){
   if(battle.stage>=5&&!m.firstPost){m.firstPost=true;return show(s,r,'firstPost',r.firstPost,()=>{},ctx);}
   if(battle.stage>=5&&!m.awakenPre){m.awakenPre=true;ctx.selectPhysician?.();return show(s,r,'awakenPre',r.awakenPre,()=>window.__HAPIL_FINAL_AWAKENING_RC108__?.complete?.(s),ctx);}
  }
  if(!m.post&&ctx.clear&&(s.zone!=='cult04'||(battle?.completed===true&&battle.finalHitCommittedV31377===true&&Number(battle.combatElapsedRC79)>=60))){m.post=true;return show(s,r,'post',r.post,()=>{if(s.zone==='cult04')ctx.finish?.();},ctx);}
  return false;
 }
 // World time is the single clock for enemy AI, attacks, beams and projectiles.
 // Only the locally awakened hero receives an independent accelerated clock.
 function clock(s,realDt){const m=memory(s);const on=active(s);const passive=window.__HAPIL_SAMONG_RC91__?.active(s)===true;document.documentElement.classList.toggle('rc51-samong',on&&!passive);document.documentElement.classList.toggle('rc91-samong',on&&passive);if(passive)realDt=window.__HAPIL_SAMONG_RC91__.delta(s,realDt);
  if(!on){m.wasActive=false;m.trails=[];document.documentElement.classList.remove('rc51-time-stop');return realDt;}
  if(!m.wasActive){m.elapsed=0;m.startTime=s.time;m.wasActive=true;}
  m.elapsed+=realDt;const frozen=m.elapsed%2.8<1.2,scale=frozen?0:.16,dt=Math.min(.04,realDt*scale),extra=realDt*2.2-dt;
  document.documentElement.classList.toggle('rc51-time-stop',frozen&&!passive);
  if(Number.isFinite(s.lastAttack))s.lastAttack-=extra;
  for(const k of ['autoSkillNextAt','manualControlUntilV31329','heroAttackLockUntilV31336','heroMoveLockUntilV31336','dashingUntil','autoEvadeUntil31223','heroSleepUntil','heroCharmUntil'])if(Number.isFinite(s[k])&&s[k]>s.time)s[k]=Math.max(s.time,s[k]-extra);
  for(const k of Object.keys(s.cooldowns??{}))if(s.cooldowns[k]>s.time)s.cooldowns[k]=Math.max(s.time,s.cooldowns[k]-extra);
  for(const k of ['started','until'])if(Number.isFinite(s.heroMotion?.[k]))s.heroMotion[k]-=extra;
  for(const hit of s.pendingStrikes??[])if(!hit.partySlotV31322){if(Number.isFinite(hit.at))hit.at-=extra;}
  for(const fx of s.effects??[]){if(!(fx.heroSkillVfx||fx.heroId31213||fx.heroIdV31313||fx.heroHitVfxV31315)||fx.partySlotV31322)continue;
   for(const k of ['born','contactAtV31312','impactAt','expiresAt','heroArrivalAtV31312'])if(Number.isFinite(fx[k]))fx[k]-=extra;
   // The pictured arrival and its scheduled hit share the accelerated hero clock.
   for(const route of fx.deliveryRoutesV31322??[])for(const k of ['born','at'])if(Number.isFinite(route[k]))route[k]-=extra;
   if(Number.isFinite(fx.deliverySeedV31322?.born))fx.deliverySeedV31322.born-=extra;
   if(!fx.rc51Enlarged){fx.rc51Enlarged=true;if(Number.isFinite(fx.size))fx.size*=1.55;}
  }
  m.trails.push({x:s.x,y:s.y,at:m.elapsed});m.trails=m.trails.filter(p=>m.elapsed-p.at<.23).slice(-10);
  return dt;
 }
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(!root||document.getElementById('hapil-death-verse-rc59'))return;e.stopImmediatePropagation();const voiced=root.dataset.narration||root.dataset.originalVoice;if(e.code==='Tab'){if(type==='keyup'&&voiced){e.preventDefault();return;}const nodes=[...root.querySelectorAll(root.dataset.narration?'button:not([hidden]),input:not([hidden])':'button:not([hidden])')],at=nodes.indexOf(document.activeElement);e.preventDefault();nodes[(at+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();return;}const originalControl=root.dataset.originalVoice&&e.target?.closest?.('[data-original-voice-control]');if((root.dataset.narration&&e.target?.closest?.('[data-narration-controls]')||originalControl)&&e.code!=='Escape'){if(originalControl&&type==='keydown'&&!e.repeat&&['Enter','Space'].includes(e.code))narration?.captureGesture?.();return;}e.preventDefault();if(type==='keydown'&&!e.repeat&&(['Enter','Space'].includes(e.code)||(voiced&&e.code==='Escape')))close();},true);
 window.__HAPIL_STORY_RC51__=Object.freeze({enabled,active,beforeFrame,clock,show,close,pauseNarration:()=>narration?.pause?.(),fit,records,isOpen:()=>!!root,replacesLegacy:true,suppressEntry,
  heroNow:s=>active(s)?(memory(s).startTime??s.time)+memory(s).elapsed*2.2:s.time,heroSpeed:s=>active(s)?1.7:1,heroSize:s=>active(s)?1.3:1,power:s=>active(s)?5:1,incoming:s=>active(s)?.12:1,trails:s=>active(s)?memory(s).trails:[]});
 // The opening voice monologue and map cards share the same uploaded source.
 window.__HAPIL_PATIENT_DATA_RC51__={...data,records:[{zone:'hub',index:0,title:'남아 있는 기억',entry:'',body:rawPrologue()},...data.records.map(r=>({...r,entry:r.paragraphs[0]??'',body:r.paragraphs.slice(1).join('\n\n')}))]};
 function rawPrologue(){return Object.values(data.openingVoice??{}).map(v=>[v.title,...v.paragraphs].join('\n\n')).join('\n\n')||data.raw.slice(0,data.raw.indexOf('[01 · dist00]')).trim();}
})();
