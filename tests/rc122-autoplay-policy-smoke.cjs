'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),P=require('../assets/rc122/autoplay-policy.js');
let checks=0;const check=(actual,expected,label)=>{assert.equal(actual,expected,label);checks++;};
for(const kind of ['skill','ultimate']){
 const s={time:100,heroMotion:{kind,started:99.8,until:101},cooldowns:{S:120},hp:240};
 const original=JSON.stringify(s);check(P.manualMotion(s,true),false,'automatic '+kind+' is presentation, not manual ownership');check(JSON.stringify(s),original,'policy does not mutate world');
 check(P.manualMotion(s,false),true,'nonautomatic '+kind+' preserves original motion priority');s.manualControlUntilV31329=100.2;check(P.manualMotion(s,true),true,'real action grace is respected');s.time=100.21;check(P.manualMotion(s,true),false,'grace expires without waiting for passive animation');
}
for(const kind of ['hurt','dash','guard']){const s={time:100,heroMotion:{kind,until:101}};check(P.manualMotion(s,true),true,'hard motion '+kind+' preserved');s.heroMotion.autoEvade31223=true;check(P.manualMotion(s,true),false,'native auto-dodge owns its own interpolation');s.heroMotion.until=99;check(P.manualMotion(s,true),false,'expired motion');}
for(const kind of ['attack','idle','move'])check(P.manualMotion({time:100,heroMotion:{kind,until:101}},true),false,kind+' is not manual ownership');
check(P.manualMotion(null,true),false,'null state');check(P.manualMotion({time:NaN},true),false,'invalid time');
for(const [target,expected,label]of [[null,false,'no target'],[{x:1,y:2},true,'physical pointer'],[{autoProgressV31301:true},false,'native auto progression'],[{autoAwakeningV31336:true},false,'native auto awakening'],[{autoProgressV31301:false},true,'explicit manual target']])check(P.manualTarget({target}),expected,label);
const html=fs.readFileSync('index.html','utf8'),src=fs.readFileSync('assets/index-v31526.js','utf8');assert(html.indexOf('rc122/autoplay-policy.js')<html.indexOf('type="module" crossorigin'));assert(src.includes('window.__HAPIL_AUTOPLAY_POLICY_RC122__.manualMotion(o, !!Re.current)'));assert(src.includes('window.__HAPIL_AUTOPLAY_POLICY_RC122__.manualTarget(o)'));assert(src.includes('window.__HAPIL_MOVEMENT_V31336__?.movementLocked(o,o) ? 0 : 1'));assert(src.includes('MONGSE_manualDirection31222 ||'));assert(src.includes('!!o.bufferedAction ||'));
console.log('PASS RC122 autoplay ownership',JSON.stringify({checks,nativeHardLocks:true,manualDirections:true,bufferedActions:true,stateMutation:false}));
