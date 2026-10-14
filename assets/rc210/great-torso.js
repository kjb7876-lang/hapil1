/* RC210: six authored Great Wardens only; stable idle bitmap torso, shared aim/contact. */
(function(root){'use strict';const ids=Object.freeze(['kair-great-01','kair-great-02','kair-great-03','kair-great-04','kair-great-05','kair-great-06']),cache=new WeakMap();let measuring=false;
 const owns=a=>ids.includes(a?.id);
 function shape(s,a,project,body){if(!owns(a)||!s||measuring)return null;const factor=root.__HAPIL_COMBAT_LAYOUT_RC153__?.actorScale?.(s,a)??1,key=[a.sprite,a.currentPhase,a.fixedPhase,a.phaseIndex,a.scale,factor].join('|'),old=cache.get(a);if(old?.key===key)return old;
  const clone={...a,attackAt:0,recoverUntil:0,hitUntil:0,hitFlashUntil:0,atomicCastUntil31210:0};let row;measuring=true;try{row=body(s,clone);}finally{measuring=false;}if(!row?.points?.length)return null;const xs=row.points.map(p=>p.x),ys=row.points.map(p=>p.y),foot=project(a.x,a.y),width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);if(!(width>0&&height>0))return null;const result={key,y:Math.min(...ys)+height*.55-foot.y,halfWidth:width*.22,halfHeight:height*.18};cache.set(a,result);return result;}
 function resolve(s,a,base,project,body){const q=shape(s,a,project,body);return q?{x:0,y:q.y}:base;}
 function polygon(s,a,project,body){const q=shape(s,a,project,body);if(!q)return null;const p=project(a.x,a.y),x=p.x,y=p.y+q.y,w=q.halfWidth,h=q.halfHeight;return[{x:x-w,y:y-h},{x:x+w,y:y-h},{x:x+w,y:y+h},{x:x-w,y:y+h}];}
 root.__HAPIL_GREAT_TORSO_RC210__=Object.freeze({ids,owns,shape,resolve,polygon});})(window);
