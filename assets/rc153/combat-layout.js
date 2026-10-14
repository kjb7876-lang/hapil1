/* RC153: narrow travelling boss bundles scatter before native movement.
 * Single shots, lasers, hazards and authored broad formations keep their paths.
 * Boss floor ownership and body/weapon viewport fitting use separate bounds. */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d,TAU=Math.PI*2;
 const policy=Object.freeze({narrowSpan:.34,scatterSpan:.96,rightAcrossMin:6,rightAcrossMax:12,rightDepthMin:35,rightDepthMax:41,bodyWidth:3,bodyAbove:2.4,bodyBelow:.6});
 const stats={groups:0,shots:0,retargetPrevented:0,owners:{},patterns:{},cameraFits:0};let deps=null;const ranked=new Set(),frames=new WeakMap();
 const boss=a=>a&&(a.boss||a.midboss||a.rc133InnerBoss||a.rc133Midboss||a.specialBoss||a.cosmicBoss||ranked.has(a.id)||ranked.has(a.rc133TemplateId)||root.__HAPIL_LASERS_V31330__?.ranks?.has(a.id)||root.__HAPIL_LASERS_V31330__?.ranks?.has(a.rc133TemplateId))&&!a.friendly&&!a.visualOnly&&!a.neutral&&!a.ally&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238;
 const removed=q=>q?.friendly||q?.reflected||q?.cancelled||q?.projectileRemovalReason31215||q?.reachedHero31213||q?.reachedMapBoundary31213;
 const eligible=(s,q)=>!!q&&!(q.rc133InnerShot===true&&q.rc150PersonaAwakeningShot===true)&&!removed(q)&&boss((s.enemies??[]).find(a=>a.id===q.sourceId))&&Math.hypot(n(q.vx),n(q.vy))>.01&&!root.__HAPIL_PRESENTATION_RC130__?.hazard?.(q)&&!q.laserShot&&!q.laserV31330&&!q.bloodV31516&&!q.persistentProjectile31222&&!q.bossImpactTransitV31232&&!q.themeBombV31323&&!q.themePollutionV31323;
 const angle=q=>Math.atan2(q.vy,q.vx),delta=(a,b)=>((a-b+Math.PI*3)%TAU)-Math.PI;
 function lock(q){if(!Number.isFinite(q.rc153ScatterAngle)||removed(q))return;const stamp=[n(q.boundaryContactCount31214),n(q.dreamReflectionCountV31346),n(q.offscreenReentries31213)].join(':');if(q.rc194MotionStamp!==undefined&&q.rc194MotionStamp!==stamp&&Math.hypot(n(q.vx),n(q.vy))>.01)q.rc153ScatterAngle=angle(q);q.rc194MotionStamp=stamp;const speed=Math.hypot(n(q.vx),n(q.vy));q.vx=Math.cos(q.rc153ScatterAngle)*speed;q.vy=Math.sin(q.rc153ScatterAngle)*speed;q.curve=0;q.sineAmplitude31212=0;q.homingMode31212='none';q.scatterHomingPrepared31211=true;
  for(const k of ['homeAt31211','homeUntil31211','returnAt','returnUntil','retargetAt31212','orbitUntil31212'])if(q[k]!=null){delete q[k];stats.retargetPrevented++;}
 }
 const storyStyles=Object.freeze({"mb-dist01":"blade","mb-dist02":"root","mb-dist03":"gate","mb-dist04":"mirror","mb-dist05":"memory","dist06-boss":"gate","mb-dist06":"blade","mb-ep1a07":"hunger","mb-ep1a08":"web","mb-ep1a09":"hunger","mb-ep1a10":"gate","a11-boss":"wing","mb-ep1a11":"wing","mb-ep1b01":"gate","b02-boss":"clock","mb-ep1b02":"clock","b03-boss":"mirror","mb-ep1b03":"mirror","b04-boss":"hunger","mb-ep1b04":"hunger","b05-boss":"petal","mb-ep1b05":"petal","b06-boss":"ledger","mb-ep1b06":"ledger","b06b-boss":"root","mb-ep1b06b":"root","b07-boss":"flame","mb-ep1b07":"flame","b08-boss":"gate","mb-ep1b08":"gate","b09-boss":"signal","mb-ep1b09":"signal","u201-mid":"judgment","u202-mid":"judgment","u203-mid":"memory","u203-boss":"memory","l301-boss":"blade","mb-last302-v31231":"petal","l303-boss":"memory","mb-kair01-v31231":"signal","kair-great-03":"clock","k103-boss":"petal","mb-hando01":"hunger","mb-hando02":"signal","h103-boss":"gate","mb-hando03":"blade","mb-murder01":"gate","mb-murder02":"ledger","mb-murder03":"gate","c101-mid":"flame","c102-boss":"petal","c103-mid":"gate","c103-boss":"gate","c104-mid":"hunger","c104-boss":"gate","u204-mid":"blade","u205-mid":"judgment","u206-mid":"signal","l305-boss":"gate","mb-kair04-v31231":"clock","kair-great-01":"clock","kair-great-02":"clock","kair-great-04":"clock","kair-great-05":"clock","mb-kair09-v31231":"memory","kair-great-06":"clock","murder04-mid":"judgment","c105-mid":"signal","c106-mid":"signal","blue-executor":"gate","a11-cosmic-v31318":"wing"}),storyProfiles=Object.freeze({"clock":[0.78,0.5,0.32],"mirror":[1.06,1,0.28],"hunger":[1.18,0.68,0.3],"petal":[1.12,1.7,0.18],"ledger":[0.86,0.8,0.34],"flame":[1.24,1.25,0.12],"gate":[1.32,0.62,0.35],"wing":[1.26,1.45,0.26],"blade":[0.7,1.1,0.24],"signal":[0.94,2,0.16],"judgment":[0.82,0.55,0.22],"memory":[1.04,1.9,0.2],"root":[1.2,0.9,0.32],"web":[1.16,1.3,0.3]});
 function storyProfile(a){const identity=a?.rc133TemplateId??a?.combatOwnerId??a?.rc135FissionIdentity??a?.id;const style=storyStyles[identity]??storyStyles[a?.id]??'web';return{style,span:storyProfiles[style][0],exponent:storyProfiles[style][1],socket:storyProfiles[style][2]};}
 const formationMemory=new WeakMap();
 function storyFormation(s,qs,center){const actor=(s.enemies??[]).find(a=>a.id===qs[0].sourceId),p=storyProfile(actor);let memory=formationMemory.get(s);if(!memory||memory.zone!==s.zone||s.time<memory.time){memory={zone:s.zone,time:s.time,actors:new Map()};formationMemory.set(s,memory);}memory.time=s.time;let record=memory.actors.get(actor);if(!record){record={count:0};memory.actors.set(actor,record);}const turn=record.count++%2?1:-1,count=qs.length,aim=Math.atan2(n(s.y)-n(actor?.y),n(s.x)-n(actor?.x)),side=Math.sign(Math.cos(aim)-Math.sin(aim));
  const offsets=qs.map((q,i)=>{const t=count===2?(i? .36:-.64):i/(count-1)*2-1;return turn*(Math.sign(t)*Math.pow(Math.abs(t),p.exponent)*p.span/2+.08);});let factor=1;const allowed=f=>offsets.every(v=>side*(Math.cos(center+v*f)-Math.sin(center+v*f))>=.01);if(side&&!allowed(1)){let lo=0,hi=1;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(allowed(mid))lo=mid;else hi=mid;}factor=lo;}
  qs.forEach((q,i)=>{const lateral=(i/(count-1)*2-1)*p.socket*turn,origin={x:n(q.originX,q.x)-Math.sin(center)*lateral,y:n(q.originY,q.y)+Math.cos(center)*lateral};if(root.__HAPIL_BATTLE_ARENA_RC138__?.contains(origin,'all',0)){for(const k of ['x','originX','previousX'])q[k]=origin.x;for(const k of ['y','originY','previousY'])q[k]=origin.y;}q.rc196StoryStyle=p.style;q.rc196StoryTurn=turn;q.rc196StorySocket=lateral;q.rc153ScatterAngle=center+offsets[i]*factor;});
 }
 function scatter(s){if(!s||!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return;const list=s.hostileProjectiles??[],prior=frames.get(s),key=[s.time,s.fxSerial,list.length,list.at(-1)?.id].join(':');if(prior?.list===list&&prior.key===key)return;frames.set(s,{list,key});const groups=new Map();
  for(const q of s.hostileProjectiles??[]){if(Number.isFinite(q.rc153ScatterAngle)){lock(q);continue;}if(!eligible(s,q))continue;
   // Birth batches join staggered release times without joining unrelated casts.
   const pattern=q.rc133Skill??q.danmakuPatternIdV31372??q.densePattern3129??q.signatureKind31212??q.label??'native';
   const key=[q.sourceId,q.bossCastId31210??'',q.rc133Cycle??'',q.sourceBorn??q.born,pattern].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);
  }
  for(const qs of groups.values()){if(qs.length<2)continue;const fresh=qs.every(q=>s.time<=Math.max(n(q.frozenUntil),n(q.motionReleaseAt31219),n(q.telegraphUntil31210),n(q.born))+.001);if(!fresh)continue;
   const a=angle(qs[0]),offsets=qs.map(q=>delta(angle(q),a)),span=Math.max(...offsets)-Math.min(...offsets);if(span>policy.narrowSpan)continue;
   const ox=n(qs[0].originX,qs[0].x),oy=n(qs[0].originY,qs[0].y);if(qs.some(q=>Math.hypot(n(q.originX,q.x)-ox,n(q.originY,q.y)-oy)>1.25))continue;
   const center=a+(Math.max(...offsets)+Math.min(...offsets))/2,ordered=qs.slice().sort((a,b)=>n(a.id)-n(b.id));
   storyFormation(s,ordered,center);
   ordered.forEach((q,i)=>{q.rc153OriginalAngle=angle(q);q.rc153ScatterCount=ordered.length;lock(q);q.danmakuAngleV31316=q.rc153ScatterAngle;if(q.danmakuAimV31316!=null)q.danmakuOffsetV31316=delta(q.rc153ScatterAngle,q.danmakuAimV31316);if(q.cosmicAngleV31318!=null)q.cosmicAngleV31318=q.rc153ScatterAngle;});
   stats.groups++;stats.shots+=ordered.length;stats.owners[qs[0].sourceId]=(stats.owners[qs[0].sourceId]??0)+1;const key=qs[0].rc133Skill??qs[0].danmakuPatternIdV31372??qs[0].densePattern3129??'native';stats.patterns[key]=(stats.patterns[key]??0)+1;
  }
 }
 const basicMemory=new WeakMap(),basicPlans=new WeakMap();
 const basicProfiles=Object.freeze({
  'b02-boss':{angles:[0,.28,-.28,.56,-.56],lateral:.12,rhythm:[.1,0,-.1,0,0]},
  'b03-boss':{angles:[-.36,.36,0,.18,-.18],lateral:.24,rhythm:[.06,-.06,0,.06,-.06]},
  'b07-boss':{angles:[0,-.18,.18,-.4,.4],lateral:.1,rhythm:[.08,-.08,.04,-.04,0]},
  'l301-boss':{angles:[-.42,0,.42,-.2,.2],lateral:.18,rhythm:[.08,0,-.08,.08,-.08]},
  'a11-boss':{angles:[0,.24,-.24,.48,-.48],lateral:.18,rhythm:[.1,-.1,0,.05,-.05]},
  'dist06-boss':{angles:[-.34,.34,-.16,.16,0],lateral:.22,rhythm:[.07,-.07,.07,-.07,0]}
 });
 const ordinaryBasic={angles:[0,.26,-.26,.52,-.52],lateral:.16,rhythm:[0,0,0,0,0]};
 function basicProfile(a){if(basicProfiles[a.id])return basicProfiles[a.id];if(!boss(a))return ordinaryBasic;const seed=[...String(a.id??'')].reduce((v,c)=>(Math.imul(v,33)+c.charCodeAt(0))>>>0,0),factor=.86+(seed%9)*.045,turn=(seed>>>4)%5,angles=ordinaryBasic.angles.map(v=>v*factor);return {angles:angles.slice(turn).concat(angles.slice(0,turn)),lateral:.12+(seed%6)*.025,rhythm:turn%2?[.08,0,-.08,.04,-.04]:[-.06,.06,0,-.06,.06]};}

 function beginBasic(s,a,p){const R=root.__HAPIL_BATTLE_ARENA_RC138__;if(!R?.enabled(s)||!R.hostile(a)||a.cosmicLuciferV31318||a.id==='inner-evil-rc133'||p?.ranged!==true||!(a.attackAt>s.time))return false;
  let m=basicMemory.get(s);if(!m||m.zone!==s.zone||s.time<m.at){m={zone:s.zone,at:s.time,actors:new Map()};basicMemory.set(s,m);}m.at=s.time;let row=m.actors.get(a.id);if(!row||row.actor!==a){row={actor:a,count:0};m.actors.set(a.id,row);}const profile=basicProfile(a),index=row.count++%profile.angles.length,d=Math.hypot(n(a.attackDx),n(a.attackDy));if(!(d>.001))return false;
  const aim=Math.atan2(a.attackDy,a.attackDx),side=Math.sign(a.attackDx-a.attackDy),allowed=f=>profile.angles.every(v=>side*(Math.cos(aim+v*f)-Math.sin(aim+v*f))>=.01);let factor=1;if(side&&!allowed(1)){let low=0,high=1;for(let i=0;i<24;i++){const mid=(low+high)/2;if(allowed(mid))low=mid;else high=mid;}factor=low;}const theta=aim+profile.angles[index]*factor,dx=Math.cos(theta),dy=Math.sin(theta);a.attackDx=dx;a.attackDy=dy;
  // Distinct preparation rhythm within the original start-to-start budget. ReadyAt never advances.
  const shift=a.boss||a.midboss?Math.max(.42-n(a.attackWindup),Math.min(profile.rhythm[index],Math.max(0,n(a.readyAt)-n(a.recoverUntil)-.05))):0;
  a.attackWindup+=shift;a.attackAt+=shift;a.attackImpactAt+=shift;a.recoverUntil+=shift;
  basicPlans.set(a,{world:s,zone:s.zone,started:a.attackStarted,fireAt:a.attackAt,dx,dy,lateral:(index%2?1:-1)*profile.lateral,index});return true;
 }
 function placeBasic(s,a,q){const p=basicPlans.get(a);if(!p||p.world!==s||p.zone!==s.zone||p.started!==a.attackStarted||s.time+1e-7<p.fireAt||q?.persistentBasicRanged31221!==true)return false;
  const origin={x:a.x-p.dy*p.lateral,y:a.y+p.dx*p.lateral},R=root.__HAPIL_BATTLE_ARENA_RC138__,point=R?.contains(origin,'all',0)?origin:{x:a.x,y:a.y};for(const key of ['x','originX','previousX'])q[key]=point.x;for(const key of ['y','originY','previousY'])q[key]=point.y;q.rc194BasicIndex=p.index;q.rc194BasicLateral=p.lateral;return true;
 }
 function position(a,q){if(!boss(a)||a.id==='inner-evil-rc133')return q;const u=Math.max(policy.rightAcrossMin,Math.min(policy.rightAcrossMax,n(q.x)-n(q.y))),v=Math.max(policy.rightDepthMin,Math.min(policy.rightDepthMax,n(q.x)+n(q.y)));return{x:(v+u)/2,y:(v-u)/2};}
 function bounds(s,subjects){const anchors=subjects??[s,...(s.enemies??[]).filter(a=>a.hp>0&&!a.friendly&&!a.visualOnly)],rects=anchors.map(a=>{const painted=deps.paintEnvelope?.(s,a,a===s);if(painted)return painted;const p=deps.project(a.x,a.y),size=Math.max(55,n(deps.size(a),a===s?100:210));return{left:p.x-size*policy.bodyWidth/2,right:p.x+size*policy.bodyWidth/2,top:p.y-size*policy.bodyAbove,bottom:p.y+size*policy.bodyBelow};});const nativePaintActors=rects.filter(r=>r.nativePaint).length;let nearbyProjectiles=0;for(const q of s.hostileProjectiles??[]){if(removed(q)||q.kind==='telegraph'||!Number.isFinite(q.x)||!Number.isFinite(q.y)||!anchors.some(a=>Math.hypot(q.x-a.x,q.y-a.y)<=26))continue;const p=deps.project(q.x,q.y),extent=Math.max(72,Math.min(140,n(q.radius,.3)*48));rects.push({left:p.x-extent,right:p.x+extent,top:p.y-extent,bottom:p.y+extent});nearbyProjectiles++;}return{nativePaintActors,nearbyProjectiles,left:Math.min(...rects.map(r=>r.left)),right:Math.max(...rects.map(r=>r.right)),top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom))};}
 const frameCache=new WeakMap(),scaleCache=new WeakMap();
 function envelopePadding(){return root.__HAPIL_MOBILE_V31366__?.enabled?.()===true&&root.innerWidth>root.innerHeight&&root.innerHeight<=260?24:28;}
 function viewportKey(s){const css=root.document&&root.getComputedStyle?.(root.document.documentElement);return [root.innerWidth,root.innerHeight,...['left','right','top','bottom'].map(k=>css?.getPropertyValue('--rc154-safe-'+k)??''),deps?.mapWidth?.(s)].join(':');}
 function actorScale(s,a){
  // A tall stationary creature can otherwise force the entire 240px-high map
  // to shrink. Fit its complete body/raised weapon uniformly at its native foot,
  // leaving the authored legal floor, hero size and humanoid Stand rules intact.
  if(!s||!deps||!boss(a)||a.id==='inner-evil-rc133'||a.rc133HumanPhase||a.humanPhase0||root.__HAPIL_STAND_V31335__?.profile?.(a)||root.__HAPIL_MOBILE_V31366__?.enabled?.()!==true||!(root.innerWidth>root.innerHeight)||!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return 1;
  const polygon=root.__HAPIL_PERSONA_DUEL_RC134__?.polygon?.('all',.8),width=n(root.innerWidth),height=n(root.innerHeight),mapWidth=n(deps.mapWidth?.(s),1584),hero=framing(s,[s]),paint=deps.paintEnvelope?.(s,a,false,true);if(!polygon?.length||!hero||!paint||!(height>0&&width>0&&mapWidth>0))return 1;
  // Keep one CSS pixel above the coverage boundary: replaying the native
  // bitmap transform can otherwise round an exact90% fit just below it.
  const css=root.document&&root.getComputedStyle?.(root.document.documentElement),inset=k=>Math.max(0,parseFloat(css?.getPropertyValue('--rc154-safe-'+k))||0),required=(.9*width+1)/(mapWidth*(height/720)),budget=(height-Math.min(8+inset('top'),height*.22)-Math.min(12+inset('bottom'),height*.24))/(height/720)/required;
  // A first-frame probe may run before the body or raised weapon has decoded.
  // A complete image must invalidate that provisional fit, just as it does the
  // fixed camera frame. Actor movement and attack clocks remain outside the key.
  const images=root.__HAPIL_CONTROLS_V31329__?.binding?.cache?.current??{},ready=path=>{const im=images[path]??images[String(path??'').split(/[?#]/)[0]];return im?.complete?[n(im.naturalWidth),n(im.naturalHeight)]:[0,0];},balrog=root.__MONGSE_BALROG_POSE_RC151__;
  const key=JSON.stringify([viewportKey(s),s.zone,s.activeHeroId,s.egoGuardianRC155?.active,a.id,a.sprite,a.phaseIndex,a.currentPhase,hero.top,hero.bottom,ready(a.sprite),ready(balrog?.body),ready(balrog?.weapon),root.__HAPIL_MEDIA_ART_RC133__?.ready]);let entries=scaleCache.get(s);if(!entries){entries=new Map();scaleCache.set(s,entries);}if(entries.has(key))return entries.get(key);
  const af=deps.project(a.x,a.y),heroTop=hero.top,heroBottom=hero.bottom,band=[policy.rightDepthMin,policy.rightDepthMax].map(v=>deps.project(v/2,v/2).y);
  const pad=n(paint.padding,28),span=factor=>Math.max(heroBottom,Math.max(...band)+(paint.bottom-af.y-pad)*factor+pad)-Math.min(heroTop,Math.min(...band)+(paint.top-af.y+pad)*factor-pad);
  let factor=1;if(span(1)>budget&&span(.5)<=budget){let low=.5,high=1;for(let i=0;i<28;i++){const mid=(low+high)/2;if(span(mid)<=budget)low=mid;else high=mid;}factor=low;}
  entries.set(key,factor);while(entries.size>8)entries.delete(entries.keys().next().value);return factor;
 }
 function framing(s,actors){const duel=root.__HAPIL_PERSONA_DUEL_RC134__,polygon=duel?.polygon?.('all',.8);if(!polygon?.length)return bounds(s,actors);const subjects=actors??[s,...(s.enemies??[]).filter(a=>a.hp>0&&!a.friendly&&!a.visualOnly)],cache=root.__HAPIL_CONTROLS_V31329__?.binding?.cache?.current??{},ready=path=>{const im=cache[path]??cache[String(path??'').split(/[?#]/)[0]];return im?.complete?n(im.naturalWidth):0;},balrog=root.__MONGSE_BALROG_POSE_RC151__,key=JSON.stringify([viewportKey(s),s.zone,actors===null?'all':actors===undefined?'all':subjects.every(a=>a===s)?'hero':'boss',root.__HAPIL_MEDIA_ART_RC133__?.ready===true,root.__HAPIL_EGO_ART_RC155__?.diagnostics?.().decoded??0,s.egoGuardianRC155?.active===true,ready(balrog?.body),ready(balrog?.weapon),subjects.map(a=>a.id==='inner-evil-rc133'?[a.id,'fixed-authored-persona-frame']:[a===s?'hero':a.id,a===s?s.activeHeroId:a.sprite,a.phaseIndex,a.currentPhase,ready(a.sprite)])]);let entries=frameCache.get(s);if(!entries){entries=new Map();frameCache.set(s,entries);}const saved=entries.get(key);if(saved)return saved;
  const floor=polygon.map(p=>deps.project(p.x,p.y)),rects=[{left:Math.min(...floor.map(p=>p.x)),right:Math.max(...floor.map(p=>p.x)),top:Math.min(...floor.map(p=>p.y)),bottom:Math.max(...floor.map(p=>p.y))}];let nativePaintActors=0;
  for(const a of subjects){const foot=deps.project(a.x,a.y),paint=deps.paintEnvelope?.(s,a,a===s),size=Math.max(55,n(deps.size(a),a===s?100:210)),relative=paint?{left:paint.left-foot.x,right:paint.right-foot.x,top:paint.top-foot.y,bottom:paint.bottom-foot.y}:{left:-size*policy.bodyWidth/2,right:size*policy.bodyWidth/2,top:-size*policy.bodyAbove,bottom:size*policy.bodyBelow};if(paint)nativePaintActors++;
   // Heroes and mobile Persona bodies need their legal floor. Stationary bosses
   // occupy the authored central right band; their weapon envelope must not be
   // copied to every unrelated floor corner. Mirrored Persona uses both sides.
   const band=boss(a)&&a.id!=='inner-evil-rc133'?Array.from({length:4},(_,i)=>{const u=i&1?policy.rightAcrossMax:policy.rightAcrossMin,v=i&2?policy.rightDepthMax:policy.rightDepthMin;return{x:(v+u)/2,y:(v-u)/2};}):polygon;
   for(const p of band){const q=deps.project(p.x,p.y);rects.push({left:q.x+relative.left,right:q.x+relative.right,top:q.y+relative.top,bottom:q.y+relative.bottom});}
  }
  // This frame is independent of arrow input, blink, travelling projectiles and
  // map inversion. Viewport/safe-area fitting is applied separately in camera.
  const rect={left:Math.min(...rects.map(r=>r.left)),right:Math.max(...rects.map(r=>r.right)),top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom)),nativePaintActors,nearbyProjectiles:0,fixedFloor:true};entries.set(key,rect);while(entries.size>8)entries.delete(entries.keys().next().value);return rect;
 }
 // RC200: retain the largest essential frame in an entry/viewport epoch.
 // Newly decoded bodies may require one-way expansion, never zoom-in on death.
 const cameraEpochs=new WeakMap();
 function resetCamera(s){if(!s||typeof s!=='object')return false;cameraEpochs.delete(s);frameCache.delete(s);scaleCache.delete(s);return true;}
 function cameraEpochKey(s,view){const css=root.document&&root.getComputedStyle?.(root.document.documentElement),hasWindow=n(root.innerWidth)>0&&n(root.innerHeight)>0;return JSON.stringify([s.zone,hasWindow?root.innerWidth:n(view.width,1280),hasWindow?root.innerHeight:n(view.height,720),...['left','right','top','bottom'].map(k=>css?.getPropertyValue('--rc154-safe-'+k)??'')]);}
 function camera(s,view,slot){if(!deps||!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return null;
  const key=cameraEpochKey(s,view),channel=slot??'whole',now=Number.isFinite(s.time)?s.time:null;let epoch=cameraEpochs.get(s);
  if(!epoch||epoch.key!==key||now!==null&&epoch.time!==null&&now<epoch.time-1e-8){resetCamera(s);epoch={key,time:now,channels:new Map()};cameraEpochs.set(s,epoch);}if(now!==null)epoch.time=now;
  const actors=slot==='boss'?(s.enemies??[]).filter(a=>a.hp>0&&!a.friendly&&!a.visualOnly):slot==='hero'?[s]:null,current=framing(s,actors?.length?actors:null),saved=epoch.channels.get(channel),b=saved?{...current,left:Math.min(saved.bounds.left,current.left),right:Math.max(saved.bounds.right,current.right),top:Math.min(saved.bounds.top,current.top),bottom:Math.max(saved.bounds.bottom,current.bottom)}:current;
  if(saved&&['left','right','top','bottom'].every(k=>Math.abs(b[k]-saved.bounds[k])<1e-8))return saved.camera;
  // Canvas/backing jitter cannot replace the viewport chosen for this epoch.
  view=saved?.view??{...view};const landscape=saved?saved.landscape:!slot&&root.__HAPIL_MOBILE_V31366__?.enabled?.()===true&&root.innerWidth>root.innerHeight,insets=landscape?root.getComputedStyle(root.document.documentElement):null,inset=k=>Math.max(0,parseFloat(insets?.getPropertyValue('--rc154-safe-'+k))||0),x=n(view.x),k=n(view.k,1),pad=Math.max(landscape?48:12,inset('left')+8,inset('right')+8)/k,width=Math.max(1,n(view.width,1280)-pad*2),vh=n(view.height,720),vy=n(view.y),top=slot?(slot==='boss'?250:196):vy+Math.min((landscape?8+inset('top'):84)/k,vh*.22),bottom=slot?(slot==='hero'?470:524):vy+vh-Math.min((landscape?12+inset('bottom'):100)/k,vh*.24),height=Math.max(1,bottom-top),scale=Math.min(landscape?2.4:.96,width/Math.max(1,slot?b.right-b.left:2*Math.max(Math.abs(640-b.left),Math.abs(b.right-640))),height/Math.max(1,b.bottom-b.top));
  stats.cameraFits++;const result={x:x+n(view.width,1280)/2-(slot?(b.left+b.right)/2:640)*scale,y:(top+bottom)/2-(b.top+b.bottom)*scale/2,scale,battleArenaRC138:true,rc153WholeBody:true,rc153Safe:{left:x+pad,right:x+n(view.width,1280)-pad,top,bottom},...(slot?{rc138Side:root.__HAPIL_BATTLE_ARENA_RC138__.side(s,slot==='hero'),rc138Row:1,rc138Coverage:b}:{})};epoch.channels.set(channel,{bounds:b,camera:result,view,landscape});return result;
 }
 function bind(api){deps=api;for(const id of api.ranked??[])ranked.add(id);}
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy,boss,eligible,scatter,lock,storyStyles,storyProfiles,storyProfile,storyFormation,basicProfiles,basicProfile,beginBasic,placeBasic,position,bounds,framing,camera,actorScale,envelopePadding,resetCamera,bind,metrics:()=>JSON.parse(JSON.stringify(stats))});
})(window);


/* RC152_ORIENTATION_PAUSE_BEGIN */
/* RC152: stop the live combat frame while a touch device is in portrait. */
(()=>{'use strict';
 const LABEL='가로 화면으로 전환해주세요',CLASS='rc152-portrait-paused';
 let gate=null,paused=false,enters=0,resumes=0,blocked=0;
 const html=()=>document.documentElement;
 const control=()=>window.__HAPIL_CONTROLS_V31329__;
 const mobile=()=>navigator.userAgentData?.mobile===true||/android|iphone|ipod|ipad|mobile/i.test(String(navigator.userAgent??''))||(navigator.platform==='MacIntel'&&(navigator.maxTouchPoints??0)>1);
 const game=()=>{const phase=control()?.binding?.phase;return phase!=null?phase==='game':document.body?.classList.contains('rc15-playing')===true;};
 const shouldPauseFor=({mobile:touch,game:playing,width,height}={})=>touch===true&&playing===true&&Number.isFinite(width)&&Number.isFinite(height)&&height>width;
 function mount(){if(gate||!document.body)return gate;gate=document.createElement('div');gate.id='rc152-orientation-gate';gate.className='rc152-orientation-gate';gate.setAttribute('role','status');gate.setAttribute('aria-live','polite');gate.textContent=LABEL;document.body.appendChild(gate);return gate;}
 function clearHeldInput(){
  const binding=control()?.binding;
  let cleared=false;try{if(typeof control()?.clear==='function'){control().clear();cleared=true;}}catch{}
  try{binding?.input?.current?.clear?.();}catch{}
  if(!cleared)try{window.__HAPIL_MOBILE_V31366__?.clear?.('portrait-orientation');}catch{}
 }
 function sync(){
  const next=shouldPauseFor({mobile:mobile(),game:game(),width:window.innerWidth,height:window.innerHeight});
  html().classList.toggle(CLASS,next);
  if(next&&!paused){paused=true;enters++;clearHeldInput();}
  else if(!next&&paused){paused=false;resumes++;}
  if(next)mount();
  return next;
 }
 function blockInput(event){if(!sync())return;blocked++;if(event.cancelable)event.preventDefault();event.stopImmediatePropagation();}
 for(const type of ['keydown','keyup','beforeinput','pointerdown','pointerup','pointermove','pointercancel','mousedown','mouseup','mousemove','click','dblclick','contextmenu','wheel','dragstart','touchstart','touchmove','touchend','touchcancel'])window.addEventListener(type,blockInput,{capture:true,passive:false});
 for(const type of ['resize','orientationchange','pageshow'])window.addEventListener(type,sync,{passive:true});
 window.visualViewport?.addEventListener?.('resize',sync,{passive:true});
 document.addEventListener('visibilitychange',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();sync();},{once:true});else{mount();sync();}
 window.__HAPIL_ORIENTATION_PAUSE_RC152__=Object.freeze({version:'RC152',label:LABEL,shouldPauseFor,sync,paused:()=>paused,metrics:()=>({paused,enters,resumes,blocked,gateText:gate?.textContent??null})});
})();
/* RC152_ORIENTATION_PAUSE_END */
