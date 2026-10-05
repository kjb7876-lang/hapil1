/* RC140: the white-mask orderly uses the measured three-frame native atlas. */
(()=>{'use strict';
 const d=window.__HAPIL_MOB_MOTION_DATA_RC137__,actor=d?.actors?.find(row=>row.id==='a10-o1');
 const path='assets/generated-story10-cycle-20261005/ep1a10/a10-o1-white-mask-pursuer-atlas.png';
 const frames=[
  {motion:'idle',key:'rc140:a10-o1:idle',rect:[96,0,640,725],alphaBounds:[58,103,462,661],pivot:[260,662]},
  {motion:'anticipation',key:'rc140:a10-o1:anticipation',rect:[736,0,596,725],alphaBounds:[64,147,524,648],pivot:[290,649]},
  {motion:'strike',key:'rc140:a10-o1:strike',rect:[1332,0,808,725],alphaBounds:[28,208,710,655],pivot:[482,655]},
 ];
 if(actor){actor.source=path;actor.authoredPoses=Object.fromEntries(frames.map(frame=>[frame.motion,frame.key]));actor.rc140StoryCycle=true;}
 window.__HAPIL_STORY_CYCLE_MOB_DATA_RC140__={version:'RC140',sourceSha256:'eada909efe08785df573a9a878b200b77d27b0867d617048cd56d64b3f37875b',actorId:'a10-o1',wave2ActorPrefix:'a10-o1-w2-',source:{path,size:[2170,725],cells:frames.map(frame=>({key:frame.key,rect:frame.rect,alphaBounds:frame.alphaBounds,pivot:frame.pivot}))}};
})();
