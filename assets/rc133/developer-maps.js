/* RC133: explicit 777 access belongs to a run; it never completes the campaign. */
(function(root){
 'use strict';
 const innerId='inner-evil-rc133';let pendingLaunch=false;
 function clean(raw){return raw?.version===1&&raw.code==='777'&&raw.allMaps===true?{version:1,code:'777',allMaps:true}:null;}
 function has(s){return !!clean(s?.developerMapsRC133);}
 function frontier(zones){return Object.values(zones).reduce((id,z)=>Number.isFinite(z.order)&&z.order>zones[id].order?z.id:id,'hub');}
 function grant(s,forLaunch=false){if(!s)return false;s.developerMapsRC133=clean({version:1,code:'777',allMaps:true});pendingLaunch=forLaunch===true;return true;}
 function beginRun(s,last){delete s.developerMapsRC133;const carry=pendingLaunch;pendingLaunch=false;if(carry){grant(s);s.frontierZone=last;}return carry;}
 function restore(s,raw){pendingLaunch=false;delete s.developerMapsRC133;const value=clean(raw);if(value)s.developerMapsRC133=value;return !!value;}
 // Map selection occurs in the paused Settings menu; the local host owns that action.
 function canInner(s){const party=root.__HAPIL_PARTY_V31322__;return has(s)&&s.hp>0&&!s.practiceV31329&&root.__HAPIL_SAMONG_RC91__?.enabled(s)===true&&!(party?.state===s&&(party.status?.role==='guest'||party.status?.disconnected));}
 const api=Object.freeze({version:'RC133',innerId,clean,has,frontier,grant,beginRun,restore,canInner});root.__HAPIL_DEVELOPER_MAPS_RC133__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
