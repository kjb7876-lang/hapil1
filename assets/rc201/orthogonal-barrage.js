/* RC201: two authored mechanical bosses can bend an existing narrow packet batch.
 * No new packets, art, damage, lifetime or collision reducer. Routes use projected
 * horizontal/vertical legs inside the expanded arena, then resume native travel. */
(function(root){'use strict';
 const plans=new WeakMap(),memory=new WeakMap(),n=(v,d=0)=>Number.isFinite(v)?v:d;
 const owners=new Set(['b09-boss','u203-boss']);
 const shapes={d:[[-1,-1],[1,-1],[1,1],[-.6,1],[-.6,-.55],[.55,-.55],[.55,.35],[-.25,.35]],r:[[-1,-1],[1,-1],[1,-.35],[-.65,-.35],[-.65,.7],[.55,.7],[.55,.05],[-.15,.05]]};
 const stamp=q=>[n(q.boundaryContactCount31214),n(q.dreamReflectionCountV31346),n(q.offscreenReentries31213)].join(':');
 const removed=q=>q.friendly||q.reflected||q.dreamReflectedV31346||q.hellMirrorV31322||q.dreamMirrorProjectileV31347||q.deflectedBySkill31211||q.parriedV31356||q.cancelled||q.projectileRemovalReason31215||q.reachedHero31213||q.reachedMapBoundary31213||q.projectileEgressActive31215;
 const release=q=>Math.max(n(q.motionReleaseAt31219),n(q.frozenUntil),n(q.telegraphUntil31210),n(q.collisionDisabledUntilV31226));
 function route(s,index,shape,radius){const R=root.__HAPIL_BATTLE_ARENA_RC138__;let u=10-(index>=4?2.8:0),v=3-(index>=4?1.1:0);const rotate=([x,y])=>{for(let k=0;k<index%4;k++)[x,y]=[-y,x];return[x,y];};for(let attempt=0;attempt<10;attempt++,u*=.9,v*=.9){const points=shapes[shape].map(rotate).map(([x,y])=>({x:19+v*y+u*x/2,y:19+v*y-u*x/2}));if(points.every(p=>R.contains(p,'all',radius))&&Math.hypot(points[0].x-s.x,points[0].y-s.y)>2.5)return points;}return null;}
 function arm(s,actor,qs){const R=root.__HAPIL_BATTLE_ARENA_RC138__,id=actor?.rc133TemplateId??actor?.id;if(!s||!owners.has(id)||!R?.enabled(s)||qs.length<2)return 0;let m=memory.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,actors:new Map()};memory.set(s,m);}m.time=s.time;const last=m.actors.get(actor);if(last&&s.time-last.at<6)return 0;const shape=(last?.count??0)%2?'r':'d';let armed=0;
  for(let i=0;i<Math.min(6,qs.length);i++){const q=qs[i],speed=Math.hypot(n(q.vx),n(q.vy));if(removed(q)||plans.has(q)||speed<2.5||q.persistentProjectile31222||q.laserShot)continue;const points=route(s,i,shape,Math.max(.3,n(q.radius,.3)));if(!points)continue;const at=Math.max(release(q),s.time+1.2+i*.13),length=points.slice(1).reduce((d,p,j)=>d+Math.hypot(p.x-points[j].x,p.y-points[j].y),0),deadline=Math.min(n(q.hardExpiresAt31214,Infinity),n(q.hardExpiresAt31213,Infinity),n(q.expiresAt,Infinity),n(q.born,s.time)+30);if(at+length/speed+.5>deadline)continue;
   plans.set(q,{state:s,zone:s.zone,points,index:1,speed,stamp:stamp(q),shape});for(const k of ['x','originX','previousX'])q[k]=points[0].x;for(const k of ['y','originY','previousY'])q[k]=points[0].y;
   for(const k of ['motionReleaseAt31219','frozenUntil','telegraphUntil31210','collisionDisabledUntil31219','collisionDisabledUntilV31226'])q[k]=Math.max(n(q[k]),at);
   q.bodySpawned31219=true;q.hideUntilRelease31219=false;q.sourceOffsetY=0;armed++;
  }
  if(armed)m.actors.set(actor,{at:s.time,count:(last?.count??0)+1});return armed;
 }
 function owns(q){return !!q&&plans.has(q);}
 function step(s,q,dt){const p=plans.get(q);if(!p)return false;if(s!==p.state||s.zone!==p.zone||removed(q)||stamp(q)!==p.stamp){plans.delete(q);return false;}
  if(!(dt>0)||s.paused||s.menuOpen||s.timeStopUntil>s.time||q.temporalLagUntil31214>s.time||q.pauseUntil31212>s.time||release(q)>s.time)return true;
  let distance=p.speed*Math.min(dt,.1),travelled=0;while(distance>1e-9&&p.index<p.points.length){const target=p.points[p.index],dx=target.x-q.x,dy=target.y-q.y,d=Math.hypot(dx,dy);if(d<1e-9){p.index++;continue;}q.vx=dx/d*p.speed;q.vy=dy/d*p.speed;const move=Math.min(distance,d);q.x+=dx/d*move;q.y+=dy/d*move;travelled+=move;distance-=move;if(move>=d-1e-9)p.index++;}
  if(q.bossReachContract31213)q.distanceTravelled31213=n(q.distanceTravelled31213)+travelled;
  if(p.index>=p.points.length){plans.delete(q);q.rc153ScatterAngle=Math.atan2(q.vy,q.vx);q.curve=0;q.sineAmplitude31212=0;q.homingMode31212='none';// Keep the current native speed/lifetime and remaining return allowance.
   q.x+=q.vx*distance/p.speed;q.y+=q.vy*distance/p.speed;if(q.bossReachContract31213)q.distanceTravelled31213+=distance;
  }return true;
 }
 function drawCue(ctx,q,time,project){const p=plans.get(q);if(!p||removed(q)||stamp(q)!==p.stamp)return false;const a=project(q.x,q.y),b=project(p.points[p.index].x,p.points[p.index].y);ctx.save();try{ctx.globalAlpha=time<release(q)?.42:.18;ctx.strokeStyle=q.danmakuAccentV31316??q.accent??'#b8e8ef';ctx.lineWidth=1.5;ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}finally{ctx.restore();}return true;}
 root.__HAPIL_ORTHOGONAL_RC201__=Object.freeze({version:'RC201',arm,owns,step,drawCue,owners:Object.freeze([...owners])});
})(window);
