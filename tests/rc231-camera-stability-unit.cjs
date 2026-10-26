'use strict';

// These are production camera functions with controlled image/viewport inputs.
// They reproduce calculation defects; they do not claim browser paint or GPU QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
if(process.env.RC231_LAYOUT)process.env.RC200_LAYOUT=process.env.RC231_LAYOUT;
const setup=fs.readFileSync('tests/rc200-camera-epoch-bounds-unit.cjs','utf8').split('const rows=[];')[0];
const fixture=new Function('require',setup+';return fixture;')(require);
const source=fs.readFileSync(process.env.RC231_CAMERA||'assets/rc223/camera.js','utf8');
const equalCamera=(a,b,message)=>{for(const key of ['x','y','scale'])assert.equal(a[key],b[key],message+' '+key);};
const clone=value=>JSON.parse(JSON.stringify(value));
const rows=[];
function group(name,run){try{rows.push({name,status:'passed',...run()});}catch(error){rows.push({name,status:'failed',error:error.stack});process.exitCode=1;}}
function installCamera(root){root.navigator={userAgent:'iPhone',platform:'iPhone'};root.localStorage={getItem:()=> '2'};root.addEventListener=()=>{};vm.runInContext(source,root);return root.__HAPIL_CAMERA_RC223__;}
function profileFixture(width,height,mobile){
 const f=fixture(width,height,mobile);
 // Paint follows the supplied actor profile, as the native renderer does. The
 // older RC200 callback instead closes over a mutable fixture-wide `large`.
 // That closure cannot replay the past visual profile of a removed actor.
 f.L.bind({project:f.G,size:()=>100,mapWidth:()=>1584,paintEnvelope:(s,a,hero)=>{const p=f.G(a.x,a.y),large=!hero&&a.boss;return{left:p.x-(large?520:40),right:p.x+(large?520:40),top:p.y-(large?1100:70),bottom:p.y+80,nativePaint:true,padding:28};}});
 return f;
}
function recordedFixture(width,height,mobile=true){const f=fixture(width,height,mobile);f.stage(true,true);f.s.activeHeroId='hwando';f.L.bind({project:f.G,mapWidth:()=>1584,size:()=>100,paintEnvelope:(s,a,hero,unscaled=false)=>{const p=f.G(a.x,a.y),pad=f.L.envelopePadding(),factor=unscaled?1:f.L.actorScale(s,a),v=hero?[-55.6430647160457,45.0830891301082,-80.6215384615385,1.9516129032259]:[-170.677664876,170.677664876,-341.740657949,5.974366316];return{left:p.x+v[0]*factor-pad,right:p.x+v[1]*factor+pad,top:p.y+v[2]*factor-pad,bottom:p.y+v[3]*factor+pad,nativePaint:true,padding:pad};}});return f;}

group('visual viewport one-pixel threshold oscillation cannot change final camera',()=>{
 const root={innerWidth:844,innerHeight:256,visualViewport:{width:844,height:256}};root.window=root;vm.createContext(root);const C=installCamera(root),base={x:-200,y:-200,scale:1.5},before=C.applyCamera(base,{x:640,y:360}),trace=[];
 for(let frame=0;frame<60;frame++){root.visualViewport.height=frame%2?256:255;const after=C.applyCamera(base,{x:640,y:360});equalCamera(after,before,'visual-only height jitter');trace.push(C.diagnostics().last.appliedZoom);}
 assert.equal(new Set(trace).size,1);assert.equal(trace[0],1+Math.min(.05,Math.max(0,3.3*256/844-1)));
 root.innerHeight=255;const resized=C.applyCamera(base,{x:640,y:360});assert.equal(C.diagnostics().last.appliedZoom,1,'a real layout aspect change keeps authored map coverage policy');assert.notEqual(resized.scale,before.scale);assert(Math.abs(resized.scale/before.scale-1)<.01,'the real one-pixel policy transition is continuous too');
 return{frames:60,visualHeights:[255,256],layout:[844,256],appliedZoom:trace[0],final:before,realResizeZoom:1};
});

group('raw final CSS scale stays continuous across the short-screen aspect boundary',()=>{
 const root={innerWidth:844,innerHeight:252};root.window=root;vm.createContext(root);const C=installCamera(root),base={x:-200,y:-200,scale:1.5},cases=[];
 for(const factor of [1,1.5,2]){C.setFactor(factor);let previous=null,maxDrift=0;for(let height=252;height<=268;height++){root.innerHeight=height;const final=C.applyCamera(base),cssScale=final.scale*height/720;if(previous!==null){const drift=Math.abs(cssScale/previous-1);assert(drift<.01,'one-pixel actual layout resize cannot introduce a raw final-scale jump');maxDrift=Math.max(maxDrift,drift);}previous=cssScale;}cases.push({factor,maxRawCssScaleDrift:maxDrift});}
 return{width:844,heights:[252,268],cases,source:'actual RC223, synthetic layout viewport; raw final output, no requested/applied normalization'};
});

group('final native camera uses the fitted viewport and ignores a second live anchor',()=>{
 const f=fixture(844,390,true),C=installCamera(f.root),before=f.camera();
 const fitted={x:70,y:40,width:1000,height:640,k:.6};before.rc153View=fitted;before.rc153Viewport={width:844,height:390};
 const stable=C.applyCamera(before,{x:10,y:20});
 for(const anchor of [{x:640,y:360},{x:641,y:359},{x:-900,y:800}])equalCamera(C.applyCamera(before,anchor),stable,'same fitted base camera');
 assert.deepEqual(clone(C.diagnostics().last.anchor),{x:570,y:360});
 f.root.visualViewport={width:844,height:240};equalCamera(C.applyCamera(before,{x:0,y:0}),stable,'fitted viewport wins visual viewport');
 assert.equal(C.withBaseCamera(()=>C.applyCamera(before)),before,'native contact scopes still use the unmodified base camera');
 assert.equal(C.diagnostics().baseCameraDepth,0);return{anchor:{x:570,y:360},final:stable,probeDepth:0};
});

for(const [width,height,mobile] of [[1180,757,false],[844,390,true],[568,260,true]])group('small resize retains encounter safety frame '+width+'x'+height,()=>{
 const f=profileFixture(width,height,mobile),C=installCamera(f.root);f.stage(true,true);const large=f.camera(),before=C.applyCamera(large),originalState=clone(f.s);
 f.stage(false,true);assert.equal(f.camera(),large,'removal does not zoom in');
 const cssBefore=before.scale*f.view().k,trace=[];
 for(const offset of [-1,0,1,0]){f.root.innerHeight=height+offset;f.s.time+=.02;const cam=f.camera(),final=C.applyCamera(cam),css=final.scale*f.view().k,ratio=css/cssBefore;assert(ratio<1.01&&ratio>.94,'one-pixel resize cannot zoom into a smaller roster; the compact safe-margin edge may reserve six more CSS pixels');if(height!==260)assert(Math.abs(ratio-1)<.01,'ordinary one-pixel geometry refit stays below one percent');trace.push({height:f.root.innerHeight,baseScale:cam.scale,cssScale:css});}
 const fixed=f.camera();
 for(let frame=0;frame<120;frame++){f.s.time+=1/60;f.s.x+=Math.sin(frame)*.02;f.s.y+=Math.cos(frame)*.02;f.s.enemies=frame%2?[f.mob]:[];f.root.devicePixelRatio=frame%2?1:2;equalCamera(f.camera(),fixed,'fixed viewport and smaller moving actors');}
 assert.equal(f.s.zone,originalState.zone);assert.equal(f.s.hp,originalState.hp);return{layout:[width,height],frames:120,beforeCSS:cssBefore,resizeTrace:trace};
});

group('actual painted CSS viewport refits even before adaptive box refresh',()=>{
 const f=fixture(844,390,true);f.stage(true,true);let box={width:844,height:390};
 f.root.document.querySelector=selector=>selector==='.game-stage > canvas'?{getBoundingClientRect:()=>({...box})}:null;
 f.root.__HAPIL_ADAPTIVE_RC125__={installed:true,view:(width,height)=>{const k=Math.min(width/1280,height/720);return{x:(1280-width/k)/2,y:(720-height/k)/2,width:width/k,height:height/k,k};}};
 const stale=f.view(),first=f.L.camera(f.s,stale);box={width:844,height:300};const after=f.L.camera(f.s,stale);
 assert.notEqual(after,first,'CSS viewport change causes an actual relayout');assert.equal(after.rc153View.k,300/720,'old adaptive dimensions cannot seed the resized frame');
 assert.equal(f.L.camera(f.s,{...stale,width:10}),after,'a mismatched caller view cannot replace the actual canvas view');
 const b=f.L.framing(f.s);for(const p of [{x:b.left,y:b.top},{x:b.right,y:b.bottom}]){const x=after.x+p.x*after.scale,y=after.y+p.y*after.scale;assert(x>=after.rc153Safe.left-1e-6&&x<=after.rc153Safe.right+1e-6&&y>=after.rc153Safe.top-1e-6&&y<=after.rc153Safe.bottom+1e-6);}
 return{beforeK:first.rc153View.k,afterK:after.rc153View.k,scope:'synthetic canvas CSS rectangle and actual production adaptive view formula; no DOM/browser rendering claim'};
});

group('compact edge also retains a larger frame when the other policy was already cached',()=>{
 const f=profileFixture(568,261,true);f.stage(false,true);f.camera();
 f.root.innerHeight=260;f.stage(true,true);const large=f.camera(),cssBefore=large.scale*f.view().k;
 f.stage(false,true);f.root.innerHeight=261;const after=f.camera(),ratio=after.scale*f.view().k/cssBefore;
 assert(ratio<1.01&&ratio>.94,'an old smaller normal-policy cache cannot replace the larger compact frame');
 return{from:260,to:261,cssScaleRatio:ratio};
});

group('resize and safe insets remeasure remembered bodies with the fresh native fit budget',()=>{
 const f=recordedFixture(844,390),C=installCamera(f.root);
 const normal=f.camera(),cases=[];
 for(const height of [300,280,240])for(const safe of [false,true]){f.root.innerHeight=height;f.root.getComputedStyle=()=>({getPropertyValue:key=>safe?(key.endsWith('left')||key.endsWith('right')?'24px':'8px'):'0px'});const c=f.camera(),coverage=Math.min(1,1584*c.scale*(height/720)/844),b=f.L.bounds(f.s),fresh=recordedFixture(844,height);fresh.root.getComputedStyle=f.root.getComputedStyle;const freshCamera=fresh.camera(),freshCoverage=Math.min(1,1584*freshCamera.scale*(height/720)/844);assert(Math.abs(coverage-freshCoverage)<1e-8,'remembered bodies must fit exactly as the same decoded bodies in a fresh viewport budget');assert(coverage>=.9,'authored ninety-percent map fit at '+height);assert(b.top*c.scale+c.y>=c.rc153Safe.top-1e-6&&b.bottom*c.scale+c.y<=c.rc153Safe.bottom+1e-6);assert.equal(f.L.actorScale(f.s,f.s),1);const bossFactor=f.L.actorScale(f.s,f.boss);assert(bossFactor>=.5&&bossFactor<=1,'retain the existing native minimum body scale');if(safe){assert(c.rc153Safe.top*(height/720)>=8,'real top safe inset remains reserved');assert((720-c.rc153Safe.bottom)*(height/720)>=8,'real bottom safe inset remains reserved');}const factorRows=[];for(const preference of [1,1.5,2]){C.setFactor(preference);const liveBefore=JSON.stringify(f.s),final=C.applyCamera(c),finalCoverage=final.rc153MapWidth*final.scale/final.rc153View.width,d=C.diagnostics().last;assert(finalCoverage>=.9-1e-12,'final RC223 presentation preserves ninety-percent coverage at '+height+' / '+preference);assert.equal(JSON.stringify(f.s),liveBefore,'view preference leaves all live state and actor fitting unchanged');assert.equal(f.L.actorScale(f.s,f.boss),bossFactor,'preference does not resize authoritative actor/contact geometry');assert.equal(C.factor(),preference,'requested preference remains distinct from effective shrink');assert(d.appliedZoom<=d.requestedZoom&&d.appliedZoom>=1);factorRows.push({preference,requestedZoom:d.requestedZoom,appliedZoom:d.appliedZoom,mapFloorLimited:d.mapFloorLimited,finalCoverage});}cases.push({height,safe,coverage,freshCoverage,bossFactor,topCss:c.rc153Safe.top*(height/720),bottomCss:(720-c.rc153Safe.bottom)*(height/720),factorRows});}
 f.root.innerHeight=390;f.root.getComputedStyle=()=>({getPropertyValue:()=> '0px'});equalCamera(f.camera(),normal,'return to same normal geometry retains its frame');
 return{cases,scope:'recorded native all-motion envelopes, synthetic decoded images/CSS insets; browser/device coverage pending'};
});

group('native actor, torso and bitmap body apply the same minimum uniform scale',()=>{
 const f=recordedFixture(844,280),root=f.root;root.getComputedStyle=()=>({getPropertyValue:key=>key.endsWith('left')||key.endsWith('right')?'24px':'8px'});const camera=installCamera(root).applyCamera(f.camera()),factor=f.L.actorScale(f.s,f.boss);assert.equal(factor,.5);
 const native=fs.readFileSync('assets/index-v31526.js','utf8'),marker=native.indexOf('/* RC153_NATIVE_COMBAT:'),actorAt=native.indexOf(' const nativeActor=Yn;',marker),torsoAt=native.indexOf(' const nativeTorso=MONGSE_enemyTorsoOffset;',actorAt);
 assert(actorAt>marker&&torsoAt>actorAt,'actual native layout wrappers are present');
 root.Yn=(ctx,cache,a)=>ctx.factor;root.MONGSE_enemyTorsoOffset=()=>({x:20,y:-100});root.G=f.G;root.__HAPIL_CONTROLS_V31329__.binding.state={current:f.s};
 vm.runInContext('(()=>{const L=window.__HAPIL_COMBAT_LAYOUT_RC153__,controls=window.__HAPIL_CONTROLS_V31329__;let renderState=null;'+native.slice(actorAt,native.indexOf('\n',actorAt))+native.slice(torsoAt,native.indexOf('\n',torsoAt))+'})();',root);
 const context=()=>({factor:1,save(){this.old=this.factor;},restore(){this.factor=this.old;},translate(){},scale(x,y){assert.equal(x,y,'native body scale remains isotropic');this.factor*=x;}}),drawFactor=root.Yn(context(),{},f.boss),torso=root.MONGSE_enemyTorsoOffset(f.boss);
 assert.equal(drawFactor,factor);assert.deepEqual(clone(torso),{x:10,y:-50});assert.equal(root.Yn(context(),{},{...f.boss,rc156EnvelopeProbe:true}),1,'unscaled envelope probes retain authored body');
 const bitmap=fs.readFileSync('assets/rc133/bitmap-contact.js','utf8'),start=bitmap.indexOf('  function body('),end=bitmap.indexOf('  function enemyContact(',start),body=vm.runInNewContext('(()=>{'+bitmap.slice(start,end)+'return body;})()',{root,cache:{},bodies:new WeakMap(),heroDraw(){},enemyDraw:root.Yn,measure:(s,a,draw)=>{const applied=draw(context(),{},a);return[{points:[{x:0,y:-100*applied},{x:20*applied,y:0}]}];}});
 assert.deepEqual(clone(body(f.s,f.boss,false,true).points),[{x:0,y:-50},{x:10,y:0}],'native bitmap body probes replay the same final actor transform');
 const bodyCssHeight=(341.740657949+5.974366316)*factor*camera.scale*(280/720);assert(bodyCssHeight>0);
 return{factor,drawFactor,torso,recordedBodyCssHeight:bodyCssHeight,scope:'actual native actor/torso wrappers and bitmap body function, synthetic draw/transform recorder; decoded image pixels and physical readability require official Chrome/device review'};
});

group('a physically insufficient viewport retains full bodies and real safe insets',()=>{
 const f=recordedFixture(844,100);f.root.getComputedStyle=()=>({getPropertyValue:key=>key.endsWith('left')||key.endsWith('right')?'24px':'8px'});const c=f.camera(),b=f.L.framing(f.s),paint=b.paintedBounds,coverage=1584*c.scale*(100/720)/844,requiredHeightForNinety=(paint.bottom-paint.top)*(.9*844)/1584,availableHeight=100-16;
 assert(requiredHeightForNinety>availableHeight,'unchanged full legal-floor hero/body frame cannot physically fit the target');assert(coverage<.9,'report the actual shortfall without shrinking the hero or spending real insets');assert(f.L.actorScale(f.s,f.boss)>=.5);assert.equal(f.L.actorScale(f.s,f.s),1);assert(c.rc153Safe.top*(100/720)>=8-1e-9);assert((720-c.rc153Safe.bottom)*(100/720)>=8-1e-9);assert(paint.top*c.scale+c.y>=c.rc153Safe.top-1e-6&&paint.bottom*c.scale+c.y<=c.rc153Safe.bottom+1e-6);
 return{coverage,requiredHeightForNinety,availableHeight,safeTopCss:c.rc153Safe.top*(100/720),safeBottomCss:(720-c.rc153Safe.bottom)*(100/720),scope:'deliberately impossible synthetic viewport; full body and safe-area priority, not a ninety-percent coverage pass'};
});

console.log('RC231_CAMERA_STABILITY_UNIT',JSON.stringify({status:process.exitCode?'failed':'passed',groups:rows,scope:'CPU production RC153/RC223 and existing extracted native entry wrapper; synthetic paint/decode/viewport inputs. No official Chrome, canvas pixels, physical GPU or natural combat claim.'},null,2));
