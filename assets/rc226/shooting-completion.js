/* RC226: each added shot uses the native queue/route/contact renderer.
 * Raw strike power is redistributed, never multiplied by extra projectiles.
 * All follow-up plans and blink bonuses are transient and scoped to a world.
 */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(v)?v:d,plans=new WeakMap(),landings=new WeakMap();
 const weapons=Object.freeze({
  gunner:Object.freeze({kind:'burst',homing:false}),hunter:Object.freeze({kind:'fan',homing:true}),
  neon:Object.freeze({kind:'fan',homing:false}),hwando:Object.freeze({kind:'pierce',homing:false}),
  slayer:Object.freeze({kind:'fan',homing:false}),seoha:Object.freeze({kind:'orb',homing:true}),
  michaela:Object.freeze({kind:'bolt',homing:true}),lauren:Object.freeze({kind:'pierce',homing:false}),
  rian:Object.freeze({kind:'ricochet',homing:true}),ion:Object.freeze({kind:'pierce',homing:false})
 });
 const metrics={installed:false,volleys:0,extraShots:0,followups:0,launchSounds:0,blinkSetups:0,blinkShots:0};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function valid(s,a){return !!a&&(s.enemies??[]).includes(a)&&a.hp>0&&!a.visualOnly&&!a.friendly&&!a.neutral&&!a.ally&&!a.canonAlly&&!a.canonAllyV31217&&!a.canonicalAllyV31217&&!a.objectiveStructureV31238&&!a.protectedNarrativeTargetV31307&&!a.protectedNarrativeTargetV31238&&n(a.invulnerableUntil)<=s.time&&root.__HAPIL_COMBAT_V31343__?.validTarget?.(s,a)!==false;}
 function mode(s){try{return root.__HAPIL_CONTROLS_V31329__?.effective?.()??s.combatModeV31329;}catch{return s.combatModeV31329;}}
 function templateFor(s,row){return(s.effects??[]).filter(e=>e.kind==='projectile'&&e.heroId31213===s.activeHeroId&&e.heroActionKey31213==='A'&&!e.shmupEchoV31365&&!e.rc226ExtraShot&&n(e.born,-999)>=s.time-.01).sort((a,b)=>Math.abs(n(a.heroArrivalAtV31312,a.born+.3)-row.at)-Math.abs(n(b.heroArrivalAtV31312,b.born+.3)-row.at))[0];}
 function route(s,e,row,origin,target){
  // partyRoute is the native addRoute entry point. For the host, slotId is
  // undefined; the route remains a native host route with the real strike ID.
  e.x=origin.x;e.y=origin.y;e.tx=target.x;e.ty=target.y;e.heroArrivalAtV31312=row.at;
  e.deliverySeedV31322={heroId:s.activeHeroId,key:'A',x:origin.x,y:origin.y,tx:target.x,ty:target.y,born:e.born};
  root.__HAPIL_CONTINUITY_V31322__.partyRoute(s,e,row,{...origin,slotId:undefined},target);
 }
 function extra(s,base,target,origin,at,power,template,homing,contactOrigin=null){
  if(!valid(s,target)||!root.__HAPIL_CONTINUITY_V31322__?.partyRoute||(s.pendingStrikes?.length??0)>=96||(s.effects?.length??0)>=64)return false;
  const row={...base,id:s.fxSerial++,at,power,targetId:target.id,homing,critical:base.critical===true,shmupEchoV31365:true,rc226ExtraShot:true,deliveryBoundV31322:false,shmupOriginV31365:{x:origin.x,y:origin.y}};
  for(const key of ['committedRouteV31333','deliveryRouteV31322','deliveryBoundV31322'])delete row[key];
  const e={...template,id:s.fxSerial++,born:s.time,homing,shmupEchoV31365:true,rc226ExtraShot:true};
  if(contactOrigin)e.rc226ContactOrigin=contactOrigin;
  for(const key of ['deliveryRoutesV31322','deliveryEndV31322','deliveryRenderedV31322','deliveryRenderedRoutesV31322','deliveryZoneV31322'])delete e[key];
  route(s,e,row,origin,target);s.effects.push(e);s.pendingStrikes.push(row);metrics.extraShots++;return true;
 }
 function candidates(s,target,kind){const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;
  return(s.enemies??[]).filter(a=>a!==target&&valid(s,a)&&distance(s,a)<=30).filter(a=>{const ax=a.x-s.x,ay=a.y-s.y,along=(ax*dx+ay*dy)/len,side=Math.abs(ax*dy-ay*dx)/len;
   return kind==='pierce'?along>len&&side<=1.15:kind==='ricochet'?distance(target,a)<=8:along>0&&side/Math.max(1,along)<=.4;
  }).sort((a,b)=>distance(target,a)-distance(target,b));
 }
 function blink(s,from){
  const p=root.__HAPIL_CONTROLS_V31329__?.binding;
  if(!s||p?.state?.current!==s||s.hp<=0||mode(s)==='full'||s.autoDodgeBlinkDispatchV31576===true||s.lastDodgeAt!==s.time||distance(s,from)<1)return false;
  landings.set(s,{zone:s.zone,hero:s.activeHeroId,target:s.targetEnemyId,x:s.x,y:s.y,at:s.time,until:s.time+1.3});metrics.blinkSetups++;return true;
 }
 function landingBonus(s,target,rows){const b=landings.get(s);if(!b)return;
  landings.delete(s);if(mode(s)==='full'||b.zone!==s.zone||b.hero!==s.activeHeroId||s.time<b.at||s.time>b.until||distance(s,b)>.6||b.target&&b.target!==target?.id||!target)return;
  const d=distance(s,target),dx=target.x-s.x,dy=target.y-s.y;if(d<5.5||d>25||dx-dy<3)return;
  for(const row of rows){const old=n(row.rc225FocusV31365);row.power*=1.08/(1+old);row.rc225FocusV31365=.08;row.rc226BlinkShot=true;}metrics.blinkShots++;
 }
 function decorate(s,rows){if(!rows.length||rows[0].nativeActorRC222||rows[0].partySlotV31322)return;
  const target=(s.enemies??[]).find(a=>a.id===rows[0].targetId&&valid(s,a));landingBonus(s,target,rows);
  const row=rows[0],profile=weapons[s.activeHeroId],template=templateFor(s,row),continuity=root.__HAPIL_CONTINUITY_V31322__;
  if(!profile||!target||!template||!continuity?.partyRoute)return;
  // A single native base strike is shaped per volley. Existing growth/EGO
  // multi-strikes, skill echoes and native resource awards retain their order.
  row.homing=profile.homing;template.homing=profile.homing;
  if(profile.kind==='orb')row.at+=.06;
  route(s,template,row,s,target);metrics.volleys++;
  const others=candidates(s,target,profile.kind),power=row.power;
  if(profile.kind==='burst'){
   for(const [i,weight]of [.3,.2].entries())if(extra(s,row,target,s,row.at+.065*(i+1),power*weight,template,false))row.power-=power*weight;
  }else if(profile.kind==='fan'){
   const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;
   for(const [i,sign]of [-1,1].entries()){const origin={x:s.x-dy/len*.24*sign,y:s.y+dx/len*.24*sign},recipient=others[i]??target;
    if(extra(s,row,recipient,origin,row.at+i*.025,power*.25,template,profile.homing))row.power-=power*.25;
   }
  }else if((profile.kind==='pierce'||profile.kind==='ricochet')&&others[0]&&s.pendingStrikes.length<96&&s.effects.length<64){
   row.power=power*.78;plans.set(row,{world:s,zone:s.zone,hero:s.activeHeroId,target:others[0],power:power*.22,template,homing:profile.homing,expires:row.at+1});
  }
 }
 function afterHit(s,target,applied,source){const p=source&&plans.get(source);if(!p)return;plans.delete(source);
  if(!(applied>0)||p.world!==s||p.zone!==s.zone||p.hero!==s.activeHeroId||s.time>p.expires||!valid(s,p.target))return;
  const endpoint=p.template.deliveryRoutesV31322?.find(r=>r.strikeId===source.id),contactOrigin={x:target.x,y:target.y,offsetX:n(endpoint?.endOffsetX,n(p.template.endOffsetX)),offsetY:n(endpoint?.endOffsetY,n(p.template.endOffsetY,-49))};
  if(extra(s,source,p.target,target,s.time+Math.max(.1,distance(target,p.target)/45),p.power,p.template,p.homing,contactOrigin))metrics.followups++;
 }
 function launch(s){const c=root.__HAPIL_CONTROLS_V31329__,b=c?.binding;if(b?.state?.current!==s||typeof b.actions?.sound!=='function'||b.settings?.current?.sound===false||!(n(b.settings?.current?.sfxVolume,1)>0))return;
  const path=root.__HAPIL_ADDITIONAL_AUDIO_RC141__?.routeHeroAttack?.(s.activeHeroId,'A')??root.__HAPIL_RC86_BRIDGE__?.routeHeroSfx?.(s.activeHeroId,'A');
  if(path){b.actions.sound(path,.23,.075);metrics.launchSounds++;return true;}return false;
 }
 function install(){const api=root.__HAPIL_LOOP_V31365__;if(!api?.rc225Wrapped||!root.__HAPIL_CONTINUITY_V31322__?.partyRoute)return false;if(api.rc226Wrapped)return true;
  const next={...api,decorateAttack(s,before){api.decorateAttack(s,before);const rows=(s.pendingStrikes??[]).filter(r=>!before?.has?.(r)&&r.actionKey==='A'&&!r.shmupEchoV31365&&!r.rc226Applied&&!r.nativeActorRC222&&!r.partySlotV31322);
    if(rows.length){for(const row of rows)row.rc226Applied=true;decorate(s,rows);if(launch(s))for(const row of s.pendingStrikes??[])if(!before?.has?.(row)&&row.actionKey==='A')row.rc226LaunchSound=true;}
   },afterHit(s,target,raw,applied,source){api.afterHit?.(s,target,raw,applied,source);afterHit(s,target,applied,source);}};
  Object.defineProperties(next,{rc225Wrapped:{value:true},rc226Wrapped:{value:true}});root.__HAPIL_LOOP_V31365__=Object.freeze(next);metrics.installed=true;return true;
 }
 root.__HAPIL_SHOOTER_RC226__=Object.freeze({weapons,blink,install,metrics:()=>({...metrics})});
 let tries=0;function ready(){if(install()||++tries>=1200)return;root.setTimeout?.(ready,25);}ready();
})(typeof window==='object'?window:globalThis);
