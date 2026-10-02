'use strict';
// Run only on the isolated release branch, before any regression gate.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='2b1b48dbda698bedecd6ff4ee10cea0fb4e62a6a';
const paths=['assets/rc126/combat-safety.js','assets/rc108/laser-topology.js','assets/index-v31526.js','assets/combat-v31402/contact-geometry.js','index.html','tests/rc126-combat-safety-smoke.cjs','tests/rc126-combat-browser.cjs'];
if(fs.readFileSync(paths[0],'utf8').includes('RC126 finite-2 delegation')){console.log('Already integrated; regression still required.');process.exit(0);}
const hash=f=>cp.execFileSync('git',['hash-object',f],{encoding:'utf8'}).trim();
for(const f of paths)assert.equal(hash(f),cp.execFileSync('git',['rev-parse',base+':'+f],{encoding:'utf8'}).trim(),'Changed input '+f);
const text=Object.fromEntries(paths.map(f=>[f,fs.readFileSync(f,'utf8')]));
function once(f,a,b){assert.equal(text[f].split(a).length-1,1,'Ambiguous anchor '+f+' '+a.slice(0,70));text[f]=text[f].replace(a,b);}
const safety=paths[0],topology=paths[1],bundle=paths[2],geo=paths[3],html=paths[4],unit=paths[5],browser=paths[6];
const start=text[safety].indexOf(' function prepareNative('),end=text[safety].indexOf(' const protectedActor=',start);assert(start>=0&&end>start);
text[safety]=text[safety].slice(0,start)+" // RC126 finite-2 delegation: never turn a finite native hazard into an arena beam.\n function prepareNative(s,h){const ok=root.__HAPIL_FINITE_NATIVE_RC126__?.prepare(s,h)??false;if(ok)stats.nativeBeams++;return ok;}\n"+text[safety].slice(end);
once(topology,'function renderNative(ctx,h,project,image,settings={},alpha=1){','function renderNative(ctx,h,project,image,settings={},alpha=1){if(window.__HAPIL_FINITE_NATIVE_RC126__?.handles(h))return window.__HAPIL_FINITE_NATIVE_RC126__.render(ctx,h,project,image,settings,alpha);');
once(bundle,'function Di(e, t) {\n','function Di(e, t) {\n  if(window.__HAPIL_FINITE_NATIVE_RC126__?.handles(t))return window.__HAPIL_FINITE_NATIVE_RC126__.contains(e,t);\n');
once(geo,'function areaDistance(a,h){','function areaDistance(a,h){if(root.__HAPIL_FINITE_NATIVE_RC126__?.handles(h))return root.__HAPIL_FINITE_NATIVE_RC126__.distance(a,h);');
once(html,'    <script src="./assets/rc126/combat-safety.js?v=42601"></script>','    <script src="./assets/rc126/finite-native.js?v=42602"></script>\n    <script src="./assets/rc126/combat-safety.js?v=42602"></script>');
for(const f of ['combat-v31402/contact-geometry.js','index-v31526.js'])once(html,'./assets/'+f+'?v=42601','./assets/'+f+'?v=42602');
once(html,'./assets/rc108/laser-topology.js?v=42301','./assets/rc108/laser-topology.js?v=42602');
once(unit,"['assets/rc126/combat-safety.js'","['assets/rc126/finite-native.js','assets/rc126/combat-safety.js'");
const a=text[unit].indexOf("test('native-beam-render-and-contact-share-extended-endpoints'"),b=text[unit].indexOf('\nfor(const delta',a);assert(a>=0&&b>a);
text[unit]=text[unit].slice(0,a)+"test('native-beam-preserves-authored-origin-and-finite-reach',()=>{const s=state(),h={shape:'line',spectacleV31317:true,spectacleModeV31317:'beam',originX:0,originY:5,x:20,y:5,radius:10,width:.5,damage:32,at:103,sourceId:'boss'};assert(R.prepareNative(s,h));assert.equal(h.originX,0);assert.equal(h.originY,5);assert.equal(h.x,10);assert.equal(h.y,5);assert.equal(h.radius,10);assert.equal(h.damage,32);assert.equal(h.at,103);const before=JSON.stringify(h);assert.equal(R.prepareNative(s,h),false);assert.equal(JSON.stringify(h),before);});"+text[unit].slice(b);
once(browser,'   const rect=window.__HAPIL_LASER_OVERRUN_RC124__.mapRect({zone:s.zone,sourceId:id});let contacts=0;','   assert(h.radius===h.rc126NativeOriginal.radius&&h.originX===h.rc126NativeOriginal.originX&&h.originY===h.rc126NativeOriginal.originY,\'native-authored-origin-and-reach-preserved\',{id});let contacts=0;');
once(browser,"   for(const p of [{x:h.originX,y:h.originY},{x:h.x,y:h.y}]){const q=T.project(p.x,p.y),outside=Math.max(rect.x-q.x,q.x-rect.x-rect.width,rect.y-q.y,q.y-rect.y-rect.height);assert(outside>=31.999,'native-ends-past-map',{id,outside});}","   const finite=window.__HAPIL_FINITE_NATIVE_RC126__,g=finite.geometry(h);for(const u of [-.1,g.length+.1]){const target={x:g.a.x+g.ux*u,y:g.a.y+g.uy*u};assert(!T.hit(target,h),'native-beyond-authored-end-is-safe',{id,u});}const corner={x:g.a.x+g.ux*g.round*.05-g.uy*(g.width-g.round*.05),y:g.a.y+g.uy*g.round*.05+g.ux*(g.width-g.round*.05)};assert(!T.hit(corner,h),'native-rounded-corner-is-safe',{id});");
for(const [f,s]of Object.entries(text)){fs.writeFileSync(f,s);if(f.endsWith('.js')||f.endsWith('.cjs'))cp.execFileSync(process.execPath,['--check',f],{stdio:'inherit'});}
assert.equal(hash('assets/rc77/connected-laser.js'),'6bb4a891eb541734ef4c86f4d46dfb6ea94a44df');
assert.deepEqual(cp.execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').sort(),paths.slice().sort());
console.log('RC126_FINITE_INTEGRATION',JSON.stringify({base,changed:paths,approvedConnectedRendererUnchanged:true}));
