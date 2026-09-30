/* RC88: ordinary enemy HP, native bullets and native hero echo contacts. */
(() => {
  'use strict';
  const ROOT = './assets/props/v31307/marionette-thread-anchor.webp';
  const COMMAND = './assets/props/v31307/deletion-command-obelisk.webp';
  const profiles = Object.freeze([
    {zone:'dist00',id:'dist00-boss',kind:'roots',count:3,label:'뿌리 핵',sprite:ROOT},
    {zone:'ep1b09',id:'b09-boss',kind:'copies',label:'모방 전투체'},
    {zone:'u203',id:'u203-boss',kind:'commands',count:2,label:'명령 장치',sprite:COMMAND},
    {zone:'last303',id:'l303-boss',kind:'breathing'},
    {zone:'kair02',id:'kair-great-03',kind:'liberation',count:3,label:'변조된 명령 핵',sprite:COMMAND},
    {zone:'kair03',id:'k103-boss',kind:'tempo'},
    {zone:'hando03',id:'h103-boss',kind:'swords',count:2,label:'빼앗긴 검격의 모조체'},
    {zone:'murder03',id:'mb-murder03',kind:'replay'},
    {zone:'murder03',id:'blue-executor',kind:'replay'},
    {zone:'cult03',id:'c103-mid',kind:'wall'},
    {zone:'cult03',id:'c103-boss',kind:'sword-fan'},
    ...['02','03','04','05','06','06b','07','08'].map((n,i)=>
      ({zone:'ep1b'+n,id:'b'+n+'-boss',kind:'sin',rhythm:i})),
  ].map(Object.freeze));
  const n = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const rows = v => Array.isArray(v) ? v : [];
  const live = a => a && n(a.hp)>0 && !a.visualOnly && (!a.protectedNarrativeTargetV31307||a.rc89CommandBody);
  let bridge, attempts=0;
  const pictures=new Map(),wraithPictures=new WeakMap();
  function picture(path){
    if(!path||typeof Image==='undefined')return null;
    if(!pictures.has(path)){const image=new Image();image.src=path;pictures.set(path,image);}
    const image=pictures.get(path);return image.complete&&image.naturalWidth>0?image:null;
  }
  function draw(ctx,s){
    if(!enabled(s)||!bridge.project)return;
    const m=s.rc88Encounter,freed=m?.freedArvelia;
    ctx.save();
    if(freed&&freed.until>s.time){const image=picture(freed.sprite),p=bridge.project(freed.x,freed.y);
      if(image){ctx.globalAlpha=.9;ctx.drawImage(image,p.x-48,p.y-100,96,100);}}
    const boss=rows(s.enemies).find(a=>a.id==='c104-boss'&&live(a));
    if(boss){
      const p=bridge.project(boss.x,boss.y);ctx.globalAlpha=.75;ctx.strokeStyle='#c59aff';ctx.lineWidth=1.7;
      for(const a of rows(s.enemies).filter(a=>a.rc89Wraith&&live(a))){
        const q=bridge.project(a.x,a.y);ctx.beginPath();ctx.moveTo(p.x,p.y-45);ctx.bezierCurveTo(p.x,p.y-100,q.x,q.y-95,q.x,q.y-40);ctx.stroke();}
      const kills=rows(m?.cosmicKills).length;
      for(let i=0;i<6;i++){ctx.fillStyle=i<kills?'#4b4059':'#c59aff';ctx.fillRect(p.x-36+i*12,p.y-112,9,4);}
    }
    const connecting=m?.connection;
    if(connecting&&connecting.until>s.time){const a=rows(s.enemies).find(a=>a.id===connecting.id);
      if(a){const p=bridge.project(s.x,s.y),q=bridge.project(a.x,a.y);ctx.globalAlpha=.85;ctx.strokeStyle='#b3ffe4';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(p.x,p.y-35);ctx.lineTo(q.x,q.y-40);ctx.stroke();}}
    ctx.restore();
  }
  const simpleTarget = actor => actor?.rc88Part === true || actor?.rc88InteractiveCosmic === true;
  const summonClock = s => enabled(s) && Number.isFinite(s?.hapilFinalBattleV31300?.combatElapsedRC79)
    ? s.hapilFinalBattleV31300.combatElapsedRC79 : n(s?.time);
  const enabled = s => s && !s.practiceV31329 && ['STORY','HELL'].includes(bridge.modeApi.mode(s));
  const ownerSpec = (s,a) => !simpleTarget(a) && !a?.episodeCosmicFinalV387 &&
    profiles.find(p=>p.zone===s.zone && p.id===a?.id);
  function memory(s) {
    if (s.rc88Encounter?.zone !== s.zone) {
      s.enemies=rows(s.enemies).filter(a=>!a.rc88Part);
      s.rc88Encounter={zone:s.zone,owners:{},cosmicKills:[],shotCharges:0,shotUntil:0};
    }
    return s.rc88Encounter;
  }
  function ownerMemory(s,a) {
    const m=memory(s);
    return m.owners[a.id] ??= {phases:[],dead:[],nextAt:n(s.time)+1.6,cycle:0,weakUntil:0,enraged:false};
  }
  function text(s,a,message,color='#d7f3ff') {
    // Combat feedback uses the owner bar and images, never repeated centre text.
    memory(s).notice={ownerId:a.id,message,color,until:n(s.time)+1.4};
  }
  function partSprite(s,p,a) {
    if(p.kind==='copies')return bridge.zoneActors('dist04').find(row=>/동료|전우/.test(row.name??''))?.sprite ||
      bridge.zoneActors('dist02').find(row=>/동료|전우/.test(row.name??''))?.sprite || a.sprite;
    return p.sprite || bridge.zoneActors(s.zone).find(row=>!row.boss&&!row.midboss&&row.sprite)?.sprite || a.sprite;
  }
  function buildPart(s,owner,p,index,phase,saved) {
    const id='rc88:'+owner.id+':'+phase+':'+index, m=ownerMemory(s,owner);
    if (m.dead.includes(id)||rows(s.enemies).some(a=>a.id===id)) return null;
    const angle=p.count===3 ? index*Math.PI*2/3 : index===0 ? Math.PI*.8 : Math.PI*.2;
    const pt=bridge.point(s.zone,owner.x+Math.cos(angle)*3.3,owner.y+Math.sin(angle)*3.3,.5);
    const hp=Math.max(18,Math.round(n(owner.maxHp,owner.hp)*(p.kind==='roots'?.025:.035)));
    const seed={id,kind:'sentinel',name:p.label,sprite:partSprite(s,p,owner),hp,x:pt.x,y:pt.y,facing:1};
    const a=bridge.cloneEnemy(seed,s.zone);
    Object.assign(a,{...seed,hp:saved?Math.min(hp,n(saved.hp,hp)):hp,maxHp:hp,rc88Part:true,rc88OwnerId:owner.id,
      rc88Kind:p.kind,rc88Index:index,rc88Phase:phase,rc88Home:{...pt},
      rc88NextAt:n(s.time)+(saved?Math.max(.55,n(saved.delay,1.6)):1.6+index*.24),
      boss:false,midboss:false,canonAlly:false,canonicalAllyV31217:false,noBossSummons:true,
      narrativeMultiPhase:false,humanPhase0:false,currentPhase:1,fixedPhase:1,phaseCount:1,phaseMax:1,
      ghostUntil:0,invulnerableUntil:n(s.time)+.18,readyAt:Infinity,patternReadyAt:Infinity,
      navPath:[],moveDx:0,moveDy:0,scale:p.sprite?.72:.85,maxStagger:60});
    s.enemies.push(a);
    return a;
  }
  function protectCommandBody(a) {
    a.rc89CommandBody=true;a.protectedNarrativeTargetV31307=true;a.requiredForClear=false;
  }
  function spawnParts(s,a,p) {
    if (!['roots','commands','copies','swords','liberation'].includes(p.kind)) return;
    if(p.kind==='liberation')protectCommandBody(a);
    const m=ownerMemory(s,a),phase=p.kind==='copies'?Math.max(1,Math.min(3,n(bridge.phase(a),1))):1;
    if (m.phases.includes(phase)) return;
    // Copies belong to their phase. Do not stack six persistent copies across transitions.
    if (p.kind==='copies') s.enemies=rows(s.enemies).filter(t=>!t.rc88Part||t.rc88OwnerId!==a.id);
    m.phases.push(phase);
    const count=p.kind==='copies'?(phase===1?1:2):p.count;
    for(let i=0;i<count;i++) buildPart(s,a,p,i,phase);
    text(s,a,p.kind==='commands'?'명령 장치 격파 → 방벽 해제':p.kind==='swords'?'모조체 격파 → 두 주인의 반격':'발사원 격파 → 다음 탄막 중단');
  }
  function fire(s,actor,target,count,speed,spread,delay=.55,extra={}) {
    const mobile=window.__HAPIL_MOBILE_V31366__?.active===true || window.innerWidth<800;
    const cap=Math.min(n(bridge.projectileCap(),192),mobile?112:192);
    const room=Math.max(0,cap-rows(s.hostileProjectiles).length);
    const total=Math.min(count,room),angle=Math.atan2(target.y-actor.y,target.x-actor.x);
    const spriteOwner=actor.rc88Part?rows(s.enemies).find(a=>a.id===actor.rc88OwnerId)??actor:actor;
    const sprite=bridge.projectileSprite(spriteOwner,s.zone);
    for(let i=0;i<total;i++) {
      const theta=angle+(count===1?0:(i/(count-1)-.5)*spread),vx=Math.cos(theta)*speed,vy=Math.sin(theta)*speed;
      (s.hostileProjectiles??=[]).push({id:s.fxSerial++,sourceId:actor.id,sourceBossId:actor.rc88OwnerId??actor.id,
        x:actor.x,y:actor.y,originX:actor.x,originY:actor.y,previousX:actor.x,previousY:actor.y,
        vx,vy,curve:0,radius:.42,damage:9,born:n(s.time),sourceBorn:n(s.time),sourceOffsetY:-18,
        expiresAt:n(s.time)+delay+5.8,frozenUntil:n(s.time)+delay,telegraphUntil31210:n(s.time)+delay,
        boss:false,midboss:true,ownerWasBossOrMidboss31221:true,reflected:false,grazed:false,
        color:actor.color??'#c8a8ff',accent:'#f5ecff',label:actor.name,sprite,visualShape:'orb',status:'none',
        themeProjectile:true,heavyBossSkill:true,atomicBossCast31210:true,rc88Bullet:true,
        rc88BaseVx:vx,rc88BaseVy:vy,rc88LaunchAt:n(s.time)+delay,...extra});
    }
    if(total){actor.castVisualUntil31210=n(s.time)+delay;actor.attackAt=n(s.time)+delay;}
    return total;
  }
  function tempo(s) {
    for(const q of rows(s.hostileProjectiles)) {
      if(!q.rc88Tempo || q.reflected || q.friendly)continue;
      const age=n(s.time)-q.rc88LaunchAt;
      if(age<0)continue;
      if(age>=1.2&&age<1.65){q.frozenUntil=Math.max(n(q.frozenUntil),q.rc88LaunchAt+1.65);continue;}
      const scale=age<1.2?.45:1.8;
      q.vx=q.rc88BaseVx*scale;q.vy=q.rc88BaseVy*scale;
    }
  }
  function tick(s) {
    if(!enabled(s))return;
    const m=memory(s);tempo(s);
    if(m.connection&&n(s.time)>=m.connection.until){
      const a=rows(s.enemies).find(a=>a.id===m.connection.id);delete m.connection;
      if(a){a.rc89ConnectionDone=true;a.protectedNarrativeTargetV31307=false;a.hp=0;
        const binding=window.__HAPIL_CONTROLS_V31329__?.binding;
        if(binding?.state?.current===s&&binding.actions?.death)binding.actions.death(a);}
    }
    for(const a of [...rows(s.enemies)]) {
      if(!live(a))continue;
      if(a.rc88Part) {
        const owner=rows(s.enemies).find(t=>t.id===a.rc88OwnerId&&live(t));
        if(!owner){s.enemies=s.enemies.filter(t=>t!==a);continue;}
        Object.assign(a,a.rc88Home,{readyAt:Infinity,patternReadyAt:Infinity,movingUntil:0,moveDx:0,moveDy:0,navPath:[]});
        if(n(s.time)>=a.rc88NextAt) {
          const target=a.rc88Kind==='copies'?(ownerMemory(s,owner).previous??s):s;
          fire(s,a,target,a.rc88Kind==='swords'?5:3,a.rc88Kind==='swords'?7.2:4.1,.85,.65);
          a.rc88NextAt=n(s.time)+2.9;
        }
        continue;
      }
      const p=ownerSpec(s,a);if(!p)continue;
      const o=ownerMemory(s,a);spawnParts(s,a,p);
      if(n(s.time)<o.nextAt)continue;
      const target=o.previous??{x:s.x,y:s.y};o.previous={x:s.x,y:s.y};
      const aim={x:s.x,y:s.y};
      if(p.kind==='copies'){fire(s,a,target,5,5.2,1.1,.9);text(s,a,'기억한 위치를 복제한다');}
      else if(p.kind==='breathing'){
        fire(s,a,aim,5,2.8,1.5,.6);fire(s,a,aim,4,7.5,1.22,1.55);
      }else if(p.kind==='tempo'||p.kind==='liberation'){fire(s,a,aim,7,5.5,1.7,.7,{rc88Tempo:true});}
      else if(p.kind==='replay') {
        // All three releases are committed now; destroying the emitter preserves them.
        for(let wave=0;wave<3;wave++){
          fire(s,a,aim,5,4.5,1.2,.6+wave*.85);
          for(let side=0;side<wave;side++){
            const angle=(side?-.85:.85)+Math.atan2(aim.y-a.y,aim.x-a.x);
            fire(s,a,{x:a.x+Math.cos(angle)*8,y:a.y+Math.sin(angle)*8},2,4.5,.18,.6+wave*.85);
          }
        }
      }else if(p.kind==='wall'){fire(s,a,aim,9,o.enraged?4:2.6,1.7,.8);}
      else if(p.kind==='sword-fan'){fire(s,a,aim,o.enraged?9:5,o.enraged?8.5:7,1.2,.65);}
      else if(p.kind==='sin'){
        // Native owner sprite remains in use (heel/food/coin/etc.). Distinct pulse lengths.
        fire(s,a,aim,4+p.rhythm%3,3.4+p.rhythm*.42,1+p.rhythm%2*.4,.65);
        if(p.rhythm%2)fire(s,a,aim,3,5.5,.5,1.05);
      }
      o.cycle++;o.nextAt=n(s.time)+(o.enraged?2.4:p.kind==='replay'?5.8:p.kind==='sin'?2.8+p.rhythm%3*.55:4.4);
    }
    if(n(s.time)>m.shotUntil)m.shotCharges=0;
  }
  function weak(s,a) {
    if(a?.id==='c104-boss'&&a.hapilSecondPhaseV31300)
      return n(s?.rc88Encounter?.samongWeakUntil)>summonClock(s);
    return n(s?.rc88Encounter?.owners?.[a?.id]?.weakUntil)>n(s?.time);
  }
  function damageFactor(s,a) {
    if(!enabled(s)||simpleTarget(a))return 1;
    if(a?.rc89CommandBody&&!a.rc89CommandResolved)return 0;
    if(weak(s,a))return 1.4;
    const p=ownerSpec(s,a);
    if(p?.kind==='commands'&&rows(s.enemies).some(t=>live(t)&&t.rc88Part&&t.rc88OwnerId===a.id))return .72;
    if(a?.id==='c104-boss'&&a.hapilSecondPhaseV31300)return 1+Math.min(6,rows(s.rc88Encounter?.cosmicKills).length)*.06;
    return 1;
  }
  const budgetFactor=(s,a)=>enabled(s)&&weak(s,a)?1.25:1;
  const castDamageFactor=(s,a,original)=>simpleTarget(a)?1:enabled(s)&&weak(s,a)?Math.max(.35,original):original;
  function grantShot(s,count=2) {
    if(!enabled(s))return;
    const m=memory(s);m.shotCharges=Math.min(3,m.shotCharges+count);m.shotUntil=n(s.time)+4;
  }
  function afterHit(s,target,raw,applied,source) {
    if(!enabled(s)||!(applied>0)||!source||source.shmupEchoV31365||source.collabKey||source.partySlotV31322||source.heroId!==s.activeHeroId)return;
    const m=memory(s);if(m.shotCharges<=0||n(s.time)>m.shotUntil)return;
    const origin=source.shmupOriginV31365??source.committedRouteV31333??s;
    const dx=target.x-origin.x,dy=target.y-origin.y,len=Math.hypot(dx,dy)||1;
    const other=rows(s.enemies).filter(a=>live(a)&&!a.protectedNarrativeTargetV31307&&a!==target&&!a.canonAlly&&n(a.invulnerableUntil)<=n(s.time));
    const piercing=other.find(a=>((a.x-origin.x)*dx+(a.y-origin.y)*dy)/len>len&&Math.abs((a.x-origin.x)*dy-(a.y-origin.y)*dx)/len<1.4);
    const branch=other.sort((a,b)=>Number(b.rc88Part)-Number(a.rc88Part)||Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
    const chosen=piercing??branch??(live(target)?target:null);if(!chosen)return;
    if(window.__HAPIL_LOOP_V31365__.queueEcho(s,chosen,piercing?target:origin,Math.max(1,n(raw)*.32),source,.24,!piercing)) {
      m.shotCharges--;
    }
  }
  function beforeDeath(s,a) {
    if(!enabled(s)||!a||n(a.hp)>0)return false;
    if(s.zone==='ep1b09'&&a.id==='b09-boss'&&!a.rc89ConnectionDone){
      a.hp=1;a.protectedNarrativeTargetV31307=true;a.readyAt=Infinity;a.patternReadyAt=Infinity;
      memory(s).connection={id:a.id,until:n(s.time)+1.2};return true;
    }
    if(simpleTarget(a)) {
      const m=memory(s),owner=rows(s.enemies).find(t=>t.id===(a.rc88OwnerId??'c104-boss')&&live(t));
      s.enemies=rows(s.enemies).filter(t=>t!==a);
      if(a.rc88Part){const o=m.owners[a.rc88OwnerId];if(!o||o.dead.includes(a.id))return true;o.dead.push(a.id);o.weakUntil=n(s.time)+3.2;}
      else {
        if(m.cosmicKills.includes(a.samongCosmicIndexV386))return true;
        m.cosmicKills.push(a.samongCosmicIndexV386);
        m.samongWeakUntil=summonClock(s)+3.2;
        const wave=s.hapilSamongCosmicWaveV386;
        if(wave?.activeId===a.id){wave.activeId=null;wave.activeUntil=0;wave.nextAt=Math.min(n(wave.nextAt),summonClock(s)+.85);}
      }
      if(s.targetEnemyId===a.id)s.targetEnemyId=null;
      (s.defeated??=[]).push({...a,id:s.fxSerial++,born:n(s.time),duration:.72});
      s.resonance=Math.min(100,n(s.resonance)+6);grantShot(s);
      text(s,a,a.rc88InteractiveCosmic?'사몽 격파 · 교주의 방벽 붕괴':'발사원 격파 · 약점 노출','#ffe099');
      if(owner&&a.rc88Kind==='swords') {
        for(const side of [-1,1])window.__HAPIL_LOOP_V31365__.queueEcho(s,owner,
          {x:owner.x+side*4,y:owner.y+2},Math.max(1,owner.maxHp*.012),{heroId:s.activeHeroId,rc89SupportHeroId:'lauren'},.55,true,'Q');
        text(s,owner,'두 주인의 지원 창격','#aaffdf');
      }
      if(owner&&a.rc88Kind==='liberation'&&!s.enemies.some(t=>live(t)&&t.rc88Part&&t.rc88OwnerId===owner.id)) {
        m.freedArvelia={id:owner.id,x:owner.x,y:owner.y,sprite:owner.sprite,until:n(s.time)+3};
        owner.rc89CommandResolved=true;owner.protectedNarrativeTargetV31307=false;owner.hp=0;
        const binding=window.__HAPIL_CONTROLS_V31329__?.binding,oldDefeated=new Set(rows(s.defeated));
        if(binding?.state?.current===s&&binding.actions?.death)binding.actions.death(owner);
        s.defeated=rows(s.defeated).filter(t=>oldDefeated.has(t));
        s.enemies=s.enemies.filter(t=>t!==owner);s.bossDefeated=true;
        s.clues?.add?.('rc89:arvelia-command-freed');
        s.clues?.add?.('rc88:arvelia-command-armor-released');
        m.arveliaFreed=true;
      }
      // Native death cleanup must not erase already committed missiles/laser paths.
      return true;
    }
    const p=ownerSpec(s,a);
    if(p) {
      s.enemies=rows(s.enemies).filter(t=>!t.rc88Part||t.rc88OwnerId!==a.id);
      if(p.kind==='wall'||p.kind==='sword-fan') {
        const survivor=rows(s.enemies).find(t=>live(t)&&t.id!==a.id&&['c103-mid','c103-boss'].includes(t.id));
        if(survivor){ownerMemory(s,survivor).enraged=true;text(s,survivor,'공조 붕괴 · 남은 목사의 탄막 강화','#ff9b9b');}
      }
      if(s.zone==='kair02'&&a.id==='kair-great-03') {
        s.clues?.add?.('rc88:arvelia-command-armor-released');
        text(s,a,'명령 장갑 해제 · 시간의 속박에서 해방','#d7ffed');
        (s.effects??=[]).push({id:s.fxSerial++,kind:'glitch',x:a.x,y:a.y,tx:a.x,ty:a.y,born:n(s.time),duration:.65,color:'#d7ffed',size:3});
      }
    }
    return false;
  }
  function prepareSummon(s,a) {
    if(!enabled(s))return;
    const owner=rows(s.enemies).find(t=>t.id==='c104-boss');
    const hp=Math.max(30,Math.round(n(owner?.maxHp,a.maxHp)*.018));
    Object.assign(a,{hp,maxHp:hp,rc88InteractiveCosmic:true,rc88OwnerId:'c104-boss',rc89Wraith:true,
      name:'사몽 망령 · '+(a.name??'코스믹 보스'),
      invulnerableUntil:n(s.time)+.05,phaseTransitionUntil:n(s.time)+.05,
      samongCosmicDispatchAtV386:n(s.time)+.08});
  }
  function snapshot(s) {
    if(!s?.rc88Encounter||s.rc88Encounter.zone!==s.zone)return null;
    const m=s.rc88Encounter;
    return {zone:s.zone,owners:Object.fromEntries(Object.entries(m.owners).slice(0,5).map(([id,o])=>
      [id,{phases:[...o.phases],dead:[...o.dead],cycle:o.cycle,enraged:o.enraged,
        delay:Math.max(0,o.nextAt-n(s.time)),weak:Math.max(0,o.weakUntil-n(s.time))}])),
      connectionRemaining:m.connection?Math.max(0,m.connection.until-n(s.time)):null,arveliaFreed:m.arveliaFreed===true,cosmicKills:[...m.cosmicKills],samongWeakRemaining:Math.max(0,n(m.samongWeakUntil)-summonClock(s)),wave:s.hapilSamongCosmicWaveV386?{
        nextIndex:s.hapilSamongCosmicWaveV386.nextIndex,
        activeIndex:rows(s.enemies).find(a=>a.rc88InteractiveCosmic&&a.hp>0)?.samongCosmicIndexV386??0,
        activeHp:rows(s.enemies).find(a=>a.rc88InteractiveCosmic&&a.hp>0)?.hp??0,
        activeMaxHp:rows(s.enemies).find(a=>a.rc88InteractiveCosmic&&a.hp>0)?.maxHp??0,
        activeRemaining:Math.max(0,s.hapilSamongCosmicWaveV386.activeUntil-summonClock(s)),
        delay:Math.max(0,s.hapilSamongCosmicWaveV386.nextAt-summonClock(s))}:null,
      parts:rows(s.enemies).filter(a=>a.rc88Part&&a.hp>0).slice(0,6)
        .map(a=>({owner:a.rc88OwnerId,index:a.rc88Index,phase:a.rc88Phase,hp:a.hp,delay:Math.max(0,a.rc88NextAt-n(s.time))}))};
  }
  function sanitize(raw,zone) {
    if(!raw||raw.zone!==zone||!profiles.some(p=>p.zone===zone)&&zone!=='cult04')return null;
    const owners={};
    for(const p of profiles.filter(p=>p.zone===zone)) {
      const o=raw.owners?.[p.id];if(!o||typeof o!=='object')continue;
      owners[p.id]={phases:[...new Set(rows(o.phases).filter(v=>[1,2,3].includes(v)))],
        dead:rows(o.dead).filter(id=>typeof id==='string'&&id.startsWith('rc88:'+p.id+':')).slice(0,6),
        cycle:Math.max(0,Math.min(100000,n(o.cycle))),enraged:o.enraged===true,
        delay:Math.max(.5,Math.min(6,n(o.delay,1))),weak:Math.max(0,Math.min(3.2,n(o.weak)))};
    }
    return {zone,owners,connectionRemaining:zone==='ep1b09'&&raw.connectionRemaining!=null?Math.max(0,Math.min(1.2,n(raw.connectionRemaining))):null,arveliaFreed:raw.arveliaFreed===true,cosmicKills:[...new Set(rows(raw.cosmicKills).filter(v=>[1,2,3,4,5,6].includes(v)))],
      samongWeakRemaining:Math.max(0,Math.min(3.2,n(raw.samongWeakRemaining))),
      wave:zone==='cult04'&&raw.wave?{nextIndex:Math.max(0,Math.min(6,Math.floor(n(raw.wave.nextIndex)))),
        activeIndex:Math.max(0,Math.min(6,Math.floor(n(raw.wave.activeIndex)))),activeHp:Math.max(0,n(raw.wave.activeHp)),
        activeMaxHp:Math.max(0,Math.min(250000,n(raw.wave.activeMaxHp))),
        activeRemaining:Math.max(0,Math.min(5.5,n(raw.wave.activeRemaining,5.5))),
        delay:Math.max(.5,Math.min(6.35,n(raw.wave.delay,1.3)))}:null,
      parts:rows(raw.parts).filter(a=>owners[a?.owner]&&[0,1,2].includes(a.index)&&[1,2,3].includes(a.phase)&&n(a.hp)>0).slice(0,6)};
  }
  function restore(s,raw,clockOverride,finalMaxHp) {
    if(!enabled(s))return;
    const data=sanitize(raw,s.zone);if(!data)return;
    const restoredClock=s.zone==='cult04'&&Number.isFinite(clockOverride)?Math.max(0,clockOverride):summonClock(s);
    s.rc88Encounter={zone:s.zone,owners:{},cosmicKills:data.cosmicKills,samongWeakUntil:restoredClock+data.samongWeakRemaining,shotCharges:0,shotUntil:0};
    if(data.connectionRemaining!=null){const a=rows(s.enemies).find(a=>a.id==='b09-boss');if(a){a.hp=1;a.protectedNarrativeTargetV31307=true;a.readyAt=Infinity;a.patternReadyAt=Infinity;s.rc88Encounter.connection={id:a.id,until:n(s.time)+data.connectionRemaining};}}
    if(data.arveliaFreed&&s.zone==='kair02'){
      s.rc88Encounter.arveliaFreed=true;s.enemies=rows(s.enemies).filter(a=>a.id!=='kair-great-03');s.bossDefeated=true;
    }
    for(const [id,o] of Object.entries(data.owners)) s.rc88Encounter.owners[id]={...o,nextAt:n(s.time)+o.delay,weakUntil:n(s.time)+o.weak};
    s.enemies=rows(s.enemies).filter(a=>!a.rc88Part);
    for(const a of s.enemies){const p=ownerSpec(s,a);if(p?.kind==='liberation'&&n(a.hp)>0)protectCommandBody(a);}
    for(const part of data.parts){const owner=s.enemies.find(a=>a.id===part.owner&&live(a)),p=owner&&ownerSpec(s,owner);
      if(p)buildPart(s,owner,p,part.index,part.phase,part);}
    if(data.wave&&s.zone==='cult04') {
      const clock=restoredClock,w=data.wave;
      const wave=s.hapilSamongCosmicWaveV386={version:1,status:w.nextIndex>=6&&!w.activeIndex?'complete':'summoning',
        startedAt:clock,nextIndex:w.nextIndex,nextAt:clock+w.delay,activeId:null,activeUntil:0};
      if(w.activeIndex&&w.activeHp>0&&!data.cosmicKills.includes(w.activeIndex)) {
        s.enemies=s.enemies.filter(a=>!a.samongCosmicSummonV386);
        if(window.__HAPIL_SAMONG_COSMIC_V386__?.restoreSummon(s,wave,w.activeIndex-1)) {
          const a=s.enemies.find(a=>a.id===wave.activeId);
          a.maxHp=w.activeMaxHp>0?w.activeMaxHp:Number.isFinite(finalMaxHp)&&finalMaxHp>0?Math.max(30,Math.round(finalMaxHp*.018)):Math.max(a.maxHp,w.activeHp);
          a.hp=Math.min(a.maxHp,w.activeHp);
          wave.activeUntil=clock+w.activeRemaining;
          wave.nextAt=clock+w.delay;
        }
      }
    }
  }
  function install() {
    bridge=window.__HAPIL_RC86_BRIDGE__;
    if(!bridge?.cloneEnemy||!window.__HAPIL_EPISODE_COSMIC_V387__?.installed||!window.__HAPIL_LOOP_V31365__?.queueEcho)return false;
    const base=bridge.persistentTick;
    bridge.persistentTick=function(s,...args){const result=base.call(this,s,...args);tick(s);return result;};
    const gate=bridge.phaseGateHealth;
    bridge.phaseGateHealth=function(s,a,d,...args){return a?.rc89CommandBody&&!a.rc89CommandResolved?n(a.hp):simpleTarget(a)?Math.max(0,n(a.hp)-Math.max(0,n(d))):gate.call(this,s,a,d,...args);};
    if(typeof bridge.movement==='function'){
      const move=bridge.movement;bridge.movement=function(zone,a,...args){return a?.rc88Part?{...a.rc88Home}:move.call(this,zone,a,...args);};
    }
    if(typeof bridge.phaseSprite==='function'){
      const original=bridge.phaseSprite;
      bridge.phaseSprite=function(cache,a,...args){const path=original.call(this,cache,a,...args),image=cache?.[path];
        if(!a?.rc89Wraith||!image?.complete||!image.naturalWidth||typeof document==='undefined')return path;
        if(!wraithPictures.has(image)){
          const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
          const context=canvas.getContext('2d');if(!context)return path;
          context.filter='grayscale(1)';context.globalAlpha=.62;context.drawImage(image,0,0);
          const derived=new Image(),url=canvas.toDataURL('image/png');derived.src=url;wraithPictures.set(image,{url,derived});
        }const row=wraithPictures.get(image);cache[row.url]=row.derived;return row.derived.complete&&row.derived.naturalWidth?row.url:path;};
    }
    for(const key of ['zoneAssetManifest','zoneAssetPlan']) {
      const original=bridge[key];bridge[key]=function(zone,...args){const result=original.call(this,zone,...args);
        const paths=profiles.filter(p=>p.zone===zone).map(p=>p.sprite??(p.kind==='copies'?partSprite({zone},p,bridge.actor(zone,p.id)):null)).filter(Boolean);
        if(key==='zoneAssetManifest')for(const path of paths)result.add(path);
        else for(const name of ['all','A','pins'])for(const path of paths)result[name]?.add(path);
        return result;};
    }
    const serialize=bridge.serializeSave,normalize=bridge.normalizeSave,entry=bridge.restoreEntry;
    bridge.serializeSave=function(s,...args){const save=serialize.call(this,s,...args);if(save)save.danmakuRpgRC88=snapshot(s);return save;};
    bridge.normalizeSave=function(raw,...args){const save=normalize.call(this,raw,...args);if(save)save.danmakuRpgRC88=sanitize(raw?.danmakuRpgRC88,save.zone);return save;};
    bridge.restoreEntry=function(s,save,...args){const result=entry.call(this,s,save,...args);
      // The native loader restores the final clock after entry hooks. Use its saved epoch here.
      const clock=s.zone==='cult04'&&save?.hapilFinalBattleV31301?Math.max(0,n(save.hapilFinalBattleV31301.combatElapsedRC79)):undefined;
      restore(s,save?.danmakuRpgRC88,clock,save?.hapilFinalBattleV31301?.boss?.maxHp);return result;};
    const loop=window.__HAPIL_LOOP_V31365__;
    window.__HAPIL_LOOP_V31365__=Object.freeze({...loop,
      afterHit(s,...args){loop.afterHit(s,...args);afterHit(s,...args);},
      blockReward(s,a,...args){loop.blockReward(s,a,...args);if(a===s)grantShot(s,1);}});
    window.__HAPIL_DANMAKU_RPG_RC88__=Object.freeze({installed:true,version:'RC90',profiles,draw,
      tick,beforeDeath,simpleTarget,damageFactor,budgetFactor,castDamageFactor,afterHit,grantShot,summonClock,prepareSummon,
      preserveSummonAttacks:s=>enabled(s)&&s.zone==='cult04'&&!s.hapilFinalBattleV31300?.completed,
      snapshot,sanitize,restore,stats:s=>({encounter:snapshot(s),parts:rows(s?.enemies).filter(a=>a.rc88Part).length})});
    return true;
  }
  (function ready(){if(!install()&&++attempts<1200)setTimeout(ready,10);})();
})();
