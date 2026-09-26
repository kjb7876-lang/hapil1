/* Named native boss patterns; records live outside the campaign and patient journal. */
(()=>{'use strict';
 const VERSION='3.14.10-dev',KEY='hapil.pattern-codex.v1';let old=null,installed=false,overlay=null;
 const num=(x,d=0)=>typeof x==='number'&&Number.isFinite(x)?x:d;
 const C=()=>window.__HAPIL_CONTROLS_V31329__,B=()=>window.__HAPIL_PATTERN_CODEX_BRIDGE_V31410__;
 let data={version:1,records:{}};
 function reload(){try{const x=JSON.parse(localStorage.getItem(KEY)??'null');if(x?.version===1&&x.records&&typeof x.records==='object')data={version:1,records:Object.fromEntries(Object.entries(x.records).filter(([k,v])=>k!=='__proto__'&&v&&typeof v==='object').slice(0,2000))};}catch{}return records();}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
 function records(){return JSON.parse(JSON.stringify(data));}
 function nativeRows(){return window.__HAPIL_THEME_V31323__?.debug?.rankedRows?.()??[];}
 function rowFor(id){return nativeRows().find(r=>r.actor.id===id);}
 function unlocked(s,row){return !!row&&!s?.practiceV31329&&(s?.completedZones instanceof Set?s.completedZones.has(row.zone):Array.isArray(s?.completedZones)&&s.completedZones.includes(row.zone));}
 function entries(s,bossId,phase){return nativeRows().filter(row=>!bossId||row.actor.id===bossId).filter(row=>unlocked(s,row)).flatMap(row=>{
  const a=window.__HAPIL_THEME_V31323__.debug.instantiate(row.actor,row.zone),limit=Math.min(4,Math.max(1,num(a.phaseCount,3)));
  return Array.from({length:limit},(_,i)=>i+1).filter(n=>!phase||phase===n).flatMap(n=>B().patterns(a,n).map((p,index)=>({
   bossId:a.id,bossName:row.actor.name??a.name??a.id,zone:row.zone,phase:n,index,name:String(p.name??`공격 ${index+1}`),
   shape:p.shape??null,windup:num(p.windup),damage:num(p.damage),modeAvailable:['STORY','HELL','DREAM']
  })));
 });}
 function resolve(s,opts){const e=entries(s,opts?.bossId,Number(opts?.phase)).find(r=>r.index===Number(opts?.index));if(!e)throw Error('스토리 진행으로 해금된 이름 있는 보스 공격을 선택하세요.');return e;}
 function key(p){return [p.bossId,p.phase,p.index,p.mode,p.hero].join('|');}
 function clean(k){const x=data.records[k]??{};return{bossId:String(x.bossId??''),pattern:String(x.pattern??''),phase:Math.max(1,num(x.phase,1)),
  hero:String(x.hero??''),difficulty:String(x.difficulty??'STORY'),attempts:Math.max(0,num(x.attempts)),captures:Math.max(0,num(x.captures)),
  noHit:Math.max(0,num(x.noHit)),maxGraze:Math.max(0,num(x.maxGraze)),parries:Math.max(0,num(x.parries)),bestSeconds:Math.max(0,num(x.bestSeconds))};}
 function configure(s,o){const a=old.configure(s,{bossId:o.bossId,phase:o.phase,mode:o.mode,family:'snipe-sword-wave'});
  delete s.practicePatternV31365;s.namedPatternCodexV31410={...o,hero:s.activeHeroId,started:s.time,deadline:s.time+30,nextCast:s.time+1.25,
   casts:0,graze:0,parries:0,damage:0,finished:false};
  s.x=a.x+3.5;s.y=a.y;s.targetEnemyId=a.id;
  return a;
 }
 function start(opts){const control=C(),s=control?.binding?.state?.current;
  if(!s||control.hasPractice())return false;
  const e=resolve(s,opts),mode=['STORY','HELL','DREAM'].includes(opts?.mode)?opts.mode:'STORY';
  const o={bossId:e.bossId,phase:e.phase,index:e.index,mode,pattern:e.name,zone:e.zone,hero:s.activeHeroId,namedPatternCodexV31410:true};
  close();if(!control.practiceStart(o))return false;
  const p=control.binding.state.current.namedPatternCodexV31410,k=key(p),r=clean(k);
  Object.assign(r,{bossId:p.bossId,pattern:p.pattern,phase:p.phase,hero:p.hero,difficulty:p.mode,attempts:r.attempts+1});data.records[k]=r;save();return true;
 }
 function complete(s,win,reason){const p=s?.namedPatternCodexV31410;if(!p||p.finished)return false;
  p.finished=true;p.captured=!!win;p.reason=reason;p.seconds=Math.max(0,s.time-p.started);
  const k=key(p),r=clean(k);if(win){r.captures++;if(p.damage===0)r.noHit++;r.bestSeconds=r.bestSeconds?Math.min(r.bestSeconds,p.seconds):p.seconds;}
  r.maxGraze=Math.max(r.maxGraze,p.graze);r.parries+=p.parries;data.records[k]=r;save();
  s.pendingHits=[];s.impactQueue=[];s.pendingStrikes=[];B().clearHostile(s,'named-practice-complete');s.bossLaserCastsV31330=[];s.bossUltimateCastsV31334=[];
  for(const a of s.enemies??[])for(const field of ['readyAt','patternReadyAt','bossCombatPatternReadyAtV31230','themedOrdnanceAt','themedSummonAt'])a[field]=s.time+9999;
  s.hp=Math.max(1,s.hp);s.invulnerableUntil=s.time+60;s.practiceFinishedAtV31329=s.time;
  controlNotice((win?'공격 연습 성공':'공격 연습 종료')+' · 캠페인 보상 없음. 기록실에서 복귀하세요.');return true;
 }
 function controlNotice(message){C()?.binding?.notify?.(message);}
 function tick(s){const p=s?.namedPatternCodexV31410;if(!p||p.finished)return;
  const a=(s.enemies??[]).find(x=>x.id===p.bossId&&x.hp>0);
  if(!a){complete(s,true,'boss-defeated');return;}
  for(const field of ['readyAt','patternReadyAt','bossCombatPatternReadyAtV31230','themedOrdnanceAt','themedSummonAt'])a[field]=s.time+9999;
  if(s.time>=p.deadline){complete(s,true,'survived-30s');return;}
  if(s.time<p.nextCast)return;
  const pattern=B().patterns(a,p.phase)[p.index];
  if(!pattern||pattern.name!==p.pattern){complete(s,false,'native-pattern-unavailable');return;}
  const n=(s.pendingHits??[]).length;
  B().cast(s,a,pattern,p.phase);
  if((s.pendingHits??[]).length>n)p.casts++;
  p.nextCast=s.time+(s.pendingHits?.length>n?Math.max(3.5,num(pattern.cooldown,4)):1);
 }
 function onDeath(s,a){if(!s?.namedPatternCodexV31410||a?.id!==s.namedPatternCodexV31410.bossId||a.hp>0)return false;
  complete(s,true,'boss-defeated');s.enemies=s.enemies.filter(x=>x!==a);s.bossDefeated=true;return true;}
 function onHurt(s,loss){const p=s?.namedPatternCodexV31410;if(!p||p.finished)return;p.damage+=Math.max(0,num(loss));if(s.hp<=0)complete(s,false,'hero-down');}
 function onGraze(s){const p=s?.namedPatternCodexV31410;if(p&&!p.finished)p.graze++;}
 function onBlock(s){const p=s?.namedPatternCodexV31410;if(p&&!p.finished)p.parries++;}
 function close(){overlay?.remove();overlay=null;C()?.clear?.();}
 function open(s=C()?.binding?.state?.current){if(!s)return false;if(overlay)return true;C()?.clear?.();
  const d=document.createElement('section');d.className='hapil-record-room65';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','보스 Pattern Codex');
  const body=document.createElement('div');d.append(body);const title=document.createElement('h2');title.textContent='Pattern Codex · 실제 보스 공격';body.append(title);
  const desc=document.createElement('p');desc.textContent='스토리에서 완료한 지역의 공격을 연습합니다. 캠페인 성장과 진행은 연습 종료 후 복원됩니다.';body.append(desc);
  const select=(label,options)=>{const el=document.createElement('select');el.setAttribute('aria-label',label);for(const [value,text]of options){const op=document.createElement('option');op.value=value;op.textContent=text;el.append(op);}body.append(el);return el;};
  const bosses=[...new Map(entries(s).map(x=>[x.bossId,[x.bossId,x.bossName+' · '+x.zone]])).values()];
  const boss=select('보스 선택',bosses),phase=select('단계 선택',[[1,'1단계'],[2,'2단계'],[3,'3단계'],[4,'4단계']]),pattern=select('실제 공격 선택',[]),mode=select('난이도 선택',[['STORY','스토리'],['HELL','헬'],['DREAM','사몽']]);
  const info=document.createElement('p');body.append(info);let startButton;
  function showRecord(){const e=entries(s,boss.value,Number(phase.value)).find(x=>x.index===Number(pattern.value));if(!e){info.textContent='완료한 지역과 단계를 선택해 주세요.';return;}
   const r=clean(key({...e,mode:mode.value,hero:s.activeHeroId}));
   info.textContent=`${e.name} · ${mode.value} · ${s.activeHeroId} / 도전 ${r.attempts} · 포획 ${r.captures} · NO HIT ${r.noHit} · 최고 GRAZE ${r.maxGraze} · D 차단 ${r.parries} · 최고 ${r.bestSeconds?r.bestSeconds.toFixed(1)+'초':'—'}`;}
  function update(){const rows=entries(s,boss.value,Number(phase.value));pattern.replaceChildren();for(const e of rows){const op=document.createElement('option');op.value=e.index;op.textContent=e.name+' · '+(e.shape??'공격');pattern.append(op);}
   if(startButton)startButton.disabled=!rows.length;showRecord();}
  boss.addEventListener('change',update);phase.addEventListener('change',update);pattern.addEventListener('change',showRecord);mode.addEventListener('change',showRecord);update();
  const bar=document.createElement('div');body.append(bar);function button(label,fn){const el=document.createElement('button');el.type='button';el.textContent=label;el.addEventListener('click',fn);bar.append(el);return el;}
  startButton=button('이 공격 연습',()=>{try{start({bossId:boss.value,phase:Number(phase.value),index:Number(pattern.value),mode:mode.value});}catch(error){info.textContent=error.message;}});startButton.disabled=!pattern.options.length;
  if(C()?.hasPractice())button('캠페인 복귀',()=>{close();C().practiceEnd();});button('닫기',close);
  if(!bosses.length)info.textContent='스토리에서 지역을 완료한 뒤 공격 이름을 볼 수 있습니다.';
  document.body.append(d);overlay=d;boss.focus();return true;
 }
 function install(){if(installed||!B()?.installed||!window.__HAPIL_RECORDS_V31365__?.installed||!C()?.installed||!window.__HAPIL_THEME_V31323__?.debug?.rankedRows)return false;
  old=window.__HAPIL_RECORDS_V31365__;reload();
  window.__HAPIL_RECORDS_V31365__=Object.freeze({...old,
   open,close:()=>{close();old.close();},isOpen:()=>!!overlay||old.isOpen(),configure:(s,o)=>o?.namedPatternCodexV31410?configure(s,o):old.configure(s,o),
   onDeath:(s,a)=>onDeath(s,a)||old.onDeath(s,a),onHurt:(s,loss)=>{onHurt(s,loss);old.onHurt(s,loss);},
   onGraze:s=>{onGraze(s);old.onGraze(s);},onBlock:s=>{onBlock(s);old.onBlock(s);},tick:(s,dt)=>{old.tick(s,dt);tick(s);}
  });
  window.__HAPIL_PATTERN_CODEX_V31410__=Object.freeze({version:VERSION,installed:true,key:KEY,open,close,start,entries,records,reload,save,tick,complete,onDeath,resolve});
  document.addEventListener('keydown',e=>{if(overlay&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
  installed=true;return true;
 }
 (function ready(i=0){if(!install()&&i<1600)setTimeout(()=>ready(i+1),10);})();
})();
