/* One authored four-direction atlas for every action, as for Hwando. */
(function(root){'use strict';
 const columns={front:0,back:1,left:2,right:3};
 function pose(p){if(p?.hero!=='slayer')return null;const combat=['attack','skill','ultimate'].includes(p.kind);return{...p,frame:combat?(columns[p.dir]??0)+4:p.frame,stage:combat?'COMMITTED':p.stage};}
 function draw(ctx,p,paint){const next=pose(p);if(!next)return false;return paint(next);}
 root.__HAPIL_SLAYER_MOTION_RC220__=Object.freeze({pose,draw,policy:Object.freeze({singleAtlasStyle:true,footPivot:true,directionLocked:true,worldDisplacement:0})});
})(window);
