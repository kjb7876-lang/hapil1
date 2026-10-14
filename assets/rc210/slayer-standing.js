/* RC210: four actual ImageGen standing poses, one quarter view plus mirror.
 * Pose-specific uniform calibration aligns visible body height and planted foot.
 * Attack timing/projectile release/damage stay in the native ranged reducers. */
(function(root){'use strict';
 const prior=root.__HAPIL_SLAYER_RIG_RC204__,names=['01-ready','02-windup','03-slash','04-recovery'],assets=Object.freeze(names.map(n=>'./assets/rc210/slayer-attack-frame-'+n+'-aligned.png'));
 const frames=Object.freeze([916,937,1033,1042].map((height,i)=>Object.freeze({path:assets[i],foot:[850,1320],height,canvas:[1650,1550]})));
 function select(p){const t=Math.max(0,Math.min(1,p));return t<.18?0:t<.4?1:t<.72?2:3;}
 function draw(ctx,cache,x,y,size,opts,p,queue,project){if(ctx.__rc204ContactProbe||p?.hero!=='slayer'||p.kind!=='attack'||!Number.isFinite(p.rigidProgress))return false;
  const frame=frames[select(p.rigidProgress)],im=queue(cache,frame.path,'eager');if(!im?.complete||!im.naturalWidth)return false;
  const direction=p.rigidSector??p.dir,flip=['left','w','nw','sw'].includes(direction)?-1:1,at=project(x,y),scale=Math.min(66,Number(size)||66)/frame.height;
  ctx.save();try{ctx.globalAlpha*=opts?.alpha??1;if(opts?.hit)ctx.filter='brightness(1.3) saturate(1.1)';ctx.translate(at.x,at.y);ctx.scale(flip,1);ctx.drawImage(im,-frame.foot[0]*scale,-frame.foot[1]*scale,frame.canvas[0]*scale,frame.canvas[1]*scale);}finally{ctx.restore();}return true;
 }
 root.__HAPIL_SLAYER_STANDING_RC210__=Object.freeze({assets,frames,select,draw,viewCount:1,mirror:true});
 root.__HAPIL_SLAYER_RIG_RC204__=Object.freeze({...prior,version:'RC210',draw,assets:Object.freeze([...(prior?.assets??[]),...assets]),decoded:cache=>(prior?.decoded(cache)??0)+assets.filter(p=>cache?.[p]?.complete&&cache[p].naturalWidth>0).length});
})(window);
