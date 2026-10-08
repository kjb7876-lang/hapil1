'use strict';
// Execute the actual RC147 live-frame selection predicate; this is a Node VM
// fixture, not a Chrome/gameplay or screenshot success claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'rc147-camera-finale-browser.cjs'),'utf8'),start=source.indexOf('function holdPersonaCaptureFrame(){'),end=source.indexOf('\n(async()=>',start);assert(start>=0&&end>start);
let checks=1;const state={time:200.08,x:14,y:24,paused:false,enemies:[{id:'persona',x:23,y:15,hp:100}],innerFinalRC133:{phase:'fight'},hostileProjectiles:[]};let actors=1;
const window={__HAPIL_CONTROLS_V31329__:{binding:{state:{current:state}}},__HAPIL_COMBAT_LAYOUT_RC153__:{bounds:()=>({nativePaintActors:actors})}},scope={window};vm.createContext(scope);vm.runInContext(source.slice(start,end)+';this.hold=holdPersonaCaptureFrame;',scope);
const eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);};
eq(scope.hold(),false,'empty volley cannot pass a live-shot frame requirement');eq(state.paused,false,'empty volley never pauses game time');
const shot={id:7,sourceId:'persona',sprite:'authored.png',rc133InnerShot:true,x:22,y:16,life:10,born:200};state.hostileProjectiles=[shot];eq(scope.hold(),false,'an unpainted second body cannot pass');eq(state.paused,false,'body readiness does not get fabricated');actors=2;
for(const invalid of [undefined,NaN,Infinity,-1,1.5]){actors=invalid;eq(scope.hold(),false,'invalid native paint count fails closed');eq(state.paused,false,'invalid geometry cannot pause the fixture');}actors=2;
for(const rejected of [{friendly:true},{reflected:true},{cancelled:true},{projectileRemovalReason31215:'parry'},{reachedHero31213:true},{reachedMapBoundary31213:true},{kind:'telegraph'},{x:NaN},{x:1000,y:1000},{rc133InnerShot:false}]){state.hostileProjectiles=[{...shot,...rejected}];eq(scope.hold(),false,'nonqualifying projectile cannot hold the camera capture');eq(state.paused,false,'rejected sample does not pause physics');}
state.hostileProjectiles=[shot];const saved=JSON.stringify(state),captured=JSON.parse(JSON.stringify(scope.hold()));eq(captured,{time:200.08,shotIds:[7],phase:'fight'},'actual live-frame identity and time are retained');eq(state.paused,true,'only the qualified native painted picture fixture pauses');state.paused=false;eq(JSON.stringify(state),saved,'native positions, life, owner, damage and clocks are unchanged by capture selection');
window.__HAPIL_COMBAT_LAYOUT_RC153__=null;eq(scope.hold(),false,'unsupported historical runtime cannot claim current native geometry');
assert(source.includes('await page.waitForTimeout(700);\n  row.personaLive='),'normal700ms post-resume projectile/lifecycle observation remains');checks++;
assert(source.includes('tracked:(window.__RC147_TRACKED_PERSONA__??[])'),'original emitted objects retain later present/removal/reflection/boundary evidence');checks++;
console.log('RC156_CAMERA_CAPTURE_UNIT',JSON.stringify({status:'passed',checks,nativeFramePredicate:true,physicsWrites:'Only supported fixture pause after actual body/live-shot readiness; resume is required',browserVerified:false}));
