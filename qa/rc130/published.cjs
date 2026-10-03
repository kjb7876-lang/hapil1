'use strict';
// Reuse the normal-UI RC129 public browser, retaining its strict HTTP and native progression checks.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
let source=fs.readFileSync(path.join(__dirname,'../rc129/published.cjs'),'utf8');
function replace(from,to){assert.equal(source.split(from).length-1,1,'RC130 public verification anchor');source=source.replace(from,to);}
replace("const files=['index.html',","const files=['assets/rc130/visual-policy.js','assets/rc130/audio-focus.js','index.html',");
replace("const changed=['index.html',","const changed=['assets/index-v31526.js','assets/combat-v31402/contact-geometry.js','assets/rc130/visual-policy.js','assets/rc130/audio-focus.js','index.html',");
replace("url.searchParams.set('v','42901')","url.searchParams.set('v','43001')");
replace("window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_FEEDBACK_RC128__?.installed","window.__HAPIL_RC130_INSTALLED__&&window.__HAPIL_AUDIO_RC130__?.snapshot().installed&&window.__HAPIL_DANMAKU_HUD_RC129__?.installed&&window.__HAPIL_RC127_INSTALLED__&&window.__HAPIL_FEEDBACK_RC128__?.installed");
replace("return{zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,","return{rc130:window.__HAPIL_RC130_AUDIT__(),zone:s.zone,time:s.time,hp:s.hp,hero:s.activeHeroId,");
replace("row.passed=true;","assert(row.samples.every(v=>v.rc130.installed&&v.rc130.audio.installed),'Public RC130 modules must be attached to actual native execution');assert(row.samples.every(v=>v.rc130.visual.stats.maxWidthRatio<=.200001&&v.rc130.visual.stats.maxHeightRatio<=.200001),'All observed barrage image draws respect the 20% ceiling');row.passed=true;");
source=source.replaceAll('RC129_PUBLIC','RC130_PUBLIC');
const compiled=new Module(__filename,module);compiled.filename=__filename;compiled.paths=module.paths;compiled._compile(source,__filename);
