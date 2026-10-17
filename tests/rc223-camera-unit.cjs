'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../assets/rc223/camera.js'),'utf8');
const bundle=fs.readFileSync(path.join(__dirname,'../assets/index-v31526.js'),'utf8');
let checks=0;
const comparable=value=>value&&typeof value==='object'?JSON.parse(JSON.stringify(value)):value;
const eq=(actual,expected,message)=>{assert.deepStrictEqual(comparable(actual),comparable(expected),message);checks++;};
const same=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};
const ok=(value,message)=>{assert.ok(value,message);checks++;};
function fixture({stored=null,navigator={},view=null,storageThrows=false}={}){
 const values=new Map(),events=new Map();if(stored!==null)values.set('hapil.rc223.viewFactor',String(stored));
 const localStorage={getItem(key){if(storageThrows)throw Error('blocked');return values.get(key)??null;},setItem(key,value){if(storageThrows)throw Error('blocked');values.set(key,String(value));},removeItem(key){values.delete(key);}};
 const win={navigator,localStorage,__HAPIL_VIEWPORT_RC104__:view?{view:()=>view}:undefined,addEventListener(type,fn){events.set(type,fn);}};
 const scope={window:win,Number,Object,Math,Set,TypeError};vm.createContext(scope);vm.runInContext(source,scope);
 return{api:win.__HAPIL_CAMERA_RC223__,values,events,win};
}

// Platform defaults follow the hardware class, not viewport orientation/width.
const desktop=fixture({navigator:{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',platform:'Win32',maxTouchPoints:10}});
eq(desktop.api.factor(),1,'narrow or touch-capable Windows hardware keeps the PC default');
eq(desktop.api.snapshot().saved,false,'an absent preference is not reported as saved');
const mobile=fixture({navigator:{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',platform:'iPhone'}});
eq(mobile.api.factor(),2,'mobile devices default to two times the world view');
eq(mobile.api.mobile(),true,'mobile UA is recognized in landscape too');
const tablet=fixture({navigator:{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',platform:'MacIntel',maxTouchPoints:5}});
eq(tablet.api.factor(),2,'touch iPadOS desktop UA follows the native mobile classifier');
const loaded=fixture({stored:'1.75',navigator:{userAgent:'desktop',platform:'Win32'}});
eq(loaded.api.snapshot(),{factor:1.75,saved:true,mobile:false,key:'hapil.rc223.viewFactor',step:.05},'a valid saved factor overrides defaults');

// The preference uses only its own key and accepts the full continuous range.
eq(loaded.api.setFactor(1.55),1.55,'fractional values are normalized to 0.05 increments');
eq(loaded.values.get('hapil.rc223.viewFactor'),'1.55','the setting persists outside numeric settings/game saves');
eq(loaded.api.setFactor(9),2,'the slider clamps at the 2x limit');
eq(loaded.api.factor(),2,'the 2x choice applies immediately');
eq(loaded.api.setFactor(Number.NaN),2,'invalid input leaves the current preference intact');
loaded.events.get('storage')({key:'unrelated',newValue:'1.1',storageArea:loaded.win.localStorage});
eq(loaded.api.factor(),2,'unrelated storage events are ignored');
const otherStorageArea={};
loaded.events.get('storage')({key:loaded.api.key,newValue:'1.1',storageArea:otherStorageArea});
eq(loaded.api.factor(),2,'same key events from another storage area are ignored');
loaded.events.get('storage')({key:null,newValue:null,storageArea:otherStorageArea});
eq(loaded.api.factor(),2,'clear events from another storage area are ignored');
loaded.events.get('storage')({key:loaded.api.key,newValue:'1.25',storageArea:loaded.win.localStorage});
eq(loaded.api.factor(),1.25,'same-key storage updates synchronize tabs');
loaded.events.get('storage')({key:loaded.api.key,newValue:null,storageArea:loaded.win.localStorage});
eq(loaded.api.snapshot().saved,false,'removing the key restores the platform default');
eq(loaded.api.factor(),1,'desktop default returns after storage removal');
loaded.api.setFactor(1.65);loaded.values.clear();
loaded.events.get('storage')({key:null,oldValue:null,newValue:null,storageArea:loaded.win.localStorage});
eq(loaded.api.snapshot().saved,false,'a real localStorage clear event removes the saved view choice');
eq(loaded.api.factor(),1,'localStorage clear restores the desktop default');
mobile.api.setFactor(1.4);mobile.values.clear();
mobile.events.get('storage')({key:null,oldValue:null,newValue:null,storageArea:mobile.win.localStorage});
eq(mobile.api.factor(),2,'localStorage clear restores the mobile default');
const blocked=fixture({storageThrows:true,navigator:{userAgent:'desktop',platform:'Win32'}});
eq(blocked.api.setFactor(1.4),1.4,'a storage failure still applies the chosen value this session');
eq(blocked.api.snapshot().saved,false,'a failed write is not reported as persisted');

// Uniform view expansion changes only the final camera transform and preserves the logical anchor.
const base={x:100,y:200,scale:2,portraitSplitRC108:'hero',combatViewportRC104:true};
loaded.api.setFactor(1.5);
const zoomed=loaded.api.applyCamera(base,{x:640,y:360});
eq(zoomed.portraitSplitRC108,'hero','portrait split identity is retained');
eq(zoomed.combatViewportRC104,true,'native camera metadata is retained');
eq(loaded.api.appliedZoom(),1.025,'view expansion stays small enough to keep mobile map art near full width');
ok(Math.abs(zoomed.scale-base.scale/1.025)<1e-12,'the eased view scale is divided uniformly');
ok(Math.abs(zoomed.x-(640+(base.x-640)/1.025))<1e-12&&Math.abs(zoomed.y-(360+(base.y-360)/1.025))<1e-12,'camera offsets transform around the selected anchor');
const worldPoint={x:17,y:29},before={x:base.x+worldPoint.x*base.scale,y:base.y+worldPoint.y*base.scale},after={x:zoomed.x+worldPoint.x*zoomed.scale,y:zoomed.y+worldPoint.y*zoomed.scale};
ok(Math.abs((after.x-640)-(before.x-640)/1.025)<1e-10&&Math.abs((after.y-360)-(before.y-360)/1.025)<1e-10,'both visible world axes expand by the same factor');
ok(Math.abs((after.x-zoomed.x)/zoomed.scale-worldPoint.x)<1e-10&&Math.abs((after.y-zoomed.y)/zoomed.scale-worldPoint.y)<1e-10,'the inverse camera transform still recovers native world coordinates');
const autoAnchored=fixture({stored:'2',view:{x:100,y:80,width:800,height:500}}),anchored=autoAnchored.api.applyCamera(base);
eq(autoAnchored.api.diagnostics().last.anchor,{x:500,y:330},'native viewport view center supplies the default anchor');
eq(autoAnchored.api.appliedZoom(),1.05,'maximum setting caps scenery shrink to five percent');
ok(Math.abs(anchored.x-(500+(base.x-500)/1.05))<1e-12&&Math.abs(anchored.y-(330+(base.y-330)/1.05))<1e-12,'view-center anchoring respects non-default safe-area framing');
const one=fixture({stored:'1'});same(one.api.applyCamera(base),base,'factor one returns the original camera without changes');
eq(one.api.applyCamera({x:1,y:2}),{x:1,y:2},'a camera without scale remains unchanged');

// Probe context covers nested native bitmap contact work and always unwinds.
const probe=fixture({stored:'2'}),probeCamera={x:11,y:22,scale:.7,portraitSplitRC108:'boss'};
const measured=probe.api.withBaseCamera(()=>probe.api.applyCamera(probeCamera));
same(measured,probeCamera,'native bitmap camera probes receive the unmodified camera');
eq(probe.api.diagnostics().lastProbeCamera,probeCamera,'read-only diagnostics capture the actual base probe camera');
eq(probe.api.diagnostics().baseCameraDepth,0,'probe context exits with zero depth');
assert.throws(()=>probe.api.withBaseCamera(()=>{probe.api.withBaseCamera(()=>probe.api.applyCamera(probeCamera));throw Error('fixture failure');}),/fixture failure/);checks++;
eq(probe.api.diagnostics().baseCameraDepth,0,'nested exception cleanup restores the context');
assert.throws(()=>probe.api.withBaseCamera(null),/requires a function/);checks++;

// Native integration applies only after RC108 returns, exposes a native setting,
// and scopes every public RC133 bitmap/contact probe through the base camera.
const cameraFn=/function HAPIL_viewCameraRC104\([^\n]+/.exec(bundle)?.[0];
ok(cameraFn&&cameraFn.indexOf('portrait')<cameraFn.indexOf('applyCamera'),'camera factor is applied after portrait composition');
ok(bundle.includes("'aria-label':'전장 시야 범위'")&&bundle.includes("min:1,max:2,step:.05"),'the native Settings UI exposes the saved 1..2 range');
ok(bundle.includes("Math.round((1+(value-1)*.05)*100)+'%'"),'the settings readout displays the applied scenery zoom, not the raw slider factor');
ok(bundle.includes("scoped('projectile')")&&bundle.includes("scoped('body')")&&bundle.includes("scoped('paintEnvelope')")&&bundle.includes("scoped('enemyContact')"),'all native bitmap contact and envelope methods use the scoped base camera');

console.log('RC223_CAMERA_UNIT',JSON.stringify({status:'passed',checks,storageKey:loaded.api.key,defaultDesktop:1,defaultMobile:2,step:.05,browserVerified:false}));
