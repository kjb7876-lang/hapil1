/* RC153: narrow travelling boss bundles scatter before native movement.
 * Single shots, lasers, hazards and authored broad formations keep their paths.
 * Boss floor ownership and body/weapon viewport fitting use separate bounds. */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d,TAU=Math.PI*2;
 const policy=Object.freeze({narrowSpan:.34,scatterSpan:.96,rightAcrossMin:6,rightAcrossMax:12,rightDepthMin:35,rightDepthMax:41,bodyWidth:3,bodyAbove:2.4,bodyBelow:.6});
 const stats={groups:0,shots:0,retargetPrevented:0,owners:{},patterns:{},cameraFits:0};let deps=null;const ranked=new Set(),frames=new WeakMap();
 const boss=a=>a&&(a.boss||a.midboss||a.rc133InnerBoss||a.rc133Midboss||a.specialBoss||a.cosmicBoss||ranked.has(a.id)||ranked.has(a.rc133TemplateId)||root.__HAPIL_LASERS_V31330__?.ranks?.has(a.id)||root.__HAPIL_LASERS_V31330__?.ranks?.has(a.rc133TemplateId))&&!a.friendly&&!a.visualOnly&&!a.neutral&&!a.ally&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238;
 const removed=q=>q?.friendly||q?.reflected||q?.cancelled||q?.projectileRemovalReason31215||q?.reachedHero31213||q?.reachedMapBoundary31213;
 const eligible=(s,q)=>!!q&&!removed(q)&&boss((s.enemies??[]).find(a=>a.id===q.sourceId))&&Math.hypot(n(q.vx),n(q.vy))>.01&&!root.__HAPIL_PRESENTATION_RC130__?.hazard?.(q)&&!q.laserShot&&!q.laserV31330&&!q.bloodV31516&&!q.persistentProjectile31222&&!q.bossImpactTransitV31232&&!q.themeBombV31323&&!q.themePollutionV31323;
 const angle=q=>Math.atan2(q.vy,q.vx),delta=(a,b)=>((a-b+Math.PI*3)%TAU)-Math.PI;
 function lock(q){if(!Number.isFinite(q.rc153ScatterAngle))return;const speed=Math.hypot(n(q.vx),n(q.vy));q.vx=Math.cos(q.rc153ScatterAngle)*speed;q.vy=Math.sin(q.rc153ScatterAngle)*speed;q.curve=0;q.sineAmplitude31212=0;q.homingMode31212='none';q.scatterHomingPrepared31211=true;q.offscreenReturnAllowance31212=0;q.bounceRemaining31212=0;
  for(const k of ['homeAt31211','homeUntil31211','returnAt','returnUntil','retargetAt31212','orbitUntil31212'])if(q[k]!=null){delete q[k];stats.retargetPrevented++;}
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
   ordered.forEach((q,i)=>{q.rc153ScatterAngle=center+(i/(ordered.length-1)-.5)*policy.scatterSpan;q.rc153OriginalAngle=angle(q);q.rc153ScatterCount=ordered.length;lock(q);q.danmakuAngleV31316=q.rc153ScatterAngle;if(q.danmakuAimV31316!=null)q.danmakuOffsetV31316=delta(q.rc153ScatterAngle,q.danmakuAimV31316);if(q.cosmicAngleV31318!=null)q.cosmicAngleV31318=q.rc153ScatterAngle;});
   stats.groups++;stats.shots+=ordered.length;stats.owners[qs[0].sourceId]=(stats.owners[qs[0].sourceId]??0)+1;const key=qs[0].rc133Skill??qs[0].danmakuPatternIdV31372??qs[0].densePattern3129??'native';stats.patterns[key]=(stats.patterns[key]??0)+1;
  }
 }
 function position(a,q){if(!boss(a)||a.id==='inner-evil-rc133')return q;const u=Math.max(policy.rightAcrossMin,Math.min(policy.rightAcrossMax,n(q.x)-n(q.y))),v=Math.max(policy.rightDepthMin,Math.min(policy.rightDepthMax,n(q.x)+n(q.y)));return{x:(v+u)/2,y:(v-u)/2};}
 function bounds(s,subjects){const rects=(subjects??[s,...(s.enemies??[]).filter(a=>a.hp>0)]).map(a=>{const p=deps.project(a.x,a.y),size=Math.max(55,n(deps.size(a),a===s?100:210));return{left:p.x-size*policy.bodyWidth/2,right:p.x+size*policy.bodyWidth/2,top:p.y-size*policy.bodyAbove,bottom:p.y+size*policy.bodyBelow};});return{left:Math.min(...rects.map(r=>r.left)),right:Math.max(...rects.map(r=>r.right)),top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom))};}
 function camera(s,view,slot){if(!deps||!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return null;const actors=slot==='boss'?(s.enemies??[]).filter(a=>a.hp>0&&!a.friendly&&!a.visualOnly):slot==='hero'?[s]:null,b=bounds(s,actors?.length?actors:null),x=n(view.x),k=n(view.k,1),pad=12/k,width=Math.max(1,n(view.width,1280)-pad*2),vh=n(view.height,720),vy=n(view.y),top=slot?(slot==='boss'?250:196):vy+Math.min(84/k,vh*.22),bottom=slot?(slot==='hero'?470:524):vy+vh-Math.min(100/k,vh*.24),height=Math.max(1,bottom-top),scale=Math.min(.96,width/Math.max(1,slot?b.right-b.left:2*Math.max(Math.abs(640-b.left),Math.abs(b.right-640))),height/Math.max(1,b.bottom-b.top));stats.cameraFits++;return{x:x+n(view.width,1280)/2-(slot?(b.left+b.right)/2:640)*scale,y:(top+bottom)/2-(b.top+b.bottom)*scale/2,scale,battleArenaRC138:true,rc153WholeBody:true,rc153Safe:{left:x+pad,right:x+n(view.width,1280)-pad,top,bottom},...(slot?{rc138Side:root.__HAPIL_BATTLE_ARENA_RC138__.side(s,slot==='hero'),rc138Row:1,rc138Coverage:b}:{})};}
 function bind(api){deps=api;for(const id of api.ranked??[])ranked.add(id);}
 root.__HAPIL_COMBAT_LAYOUT_RC153__=Object.freeze({policy,boss,eligible,scatter,lock,position,bounds,camera,bind,metrics:()=>JSON.parse(JSON.stringify(stats))});
})(window);
