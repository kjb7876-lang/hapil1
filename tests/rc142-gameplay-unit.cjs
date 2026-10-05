'use strict';
// Focused RC142 policy hooks. Browser evidence separately exercises real native render/contact paths.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.equal(a,b,m);};
const paths=[
 './assets/generated-v31224/actors-normalized/b96a428432e9_pride_hierophant_idle.webp',
 './assets/generated-v31224/actors-normalized/c6827b44795a_superego_cyborg_cult_leader.webp',
 './assets/generated-v31224/actors-normalized/a000c91070d3_final_pride_cyborg_lord.webp',
 './assets/generated-v31224/actors-normalized/b78f35cef818_six_legged_cyborg_lord_final.webp'
];
const template={id:'c104-boss',sprite:'old-body',phaseSprites:['old-body'],phaseSpriteFallbacks:['old-body']};let rendered=null,started=0;
const B={actor:(zone,id)=>zone==='cult04'&&id==='c104-boss'?template:null,renderFrame(canvas,state,...args){rendered={canvas,state,args};return 'native-render';},zoneAssetManifest:zone=>new Set(zone==='cult04'?['cult04-map.webp']:['other-map.webp'])};
const controls={frameStart(state){started++;return state;}};
const window={__HAPIL_RC86_BRIDGE__:B,__HAPIL_CONTROLS_V31329__:controls};
vm.runInNewContext(read('assets/rc142/cult-leader-art.js'),{window,Object,Array,Number,Math,Set,setTimeout:fn=>fn()},{filename:'assets/rc142/cult-leader-art.js'});
const art=window.__HAPIL_CULT_LEADER_ART_RC142__;
ok(art.installed(),'live renderer hooks installed once bridge dependencies exist');
eq(JSON.stringify(art.paths),JSON.stringify(paths),'four authored normalized form files are mapped in order');
eq(JSON.stringify(art.thresholds),JSON.stringify([.76,.5,.25]),'native health thresholds stay explicit');
for(const [i,ratio]of[.9,.7,.45,.2].entries()){
 const a={...template,hp:Math.round(1000*ratio),maxHp:1000};ok(art.applyActor(a),'c104 actor admitted');
 eq(a.humanPhase0,true,'zero-based renderer phase enabled '+i);eq(a.phaseCount,4,'four visual forms retained '+i);eq(a.phaseMax,3,'phase indices bounded '+i);eq(a.phaseSprites[i],paths[i],'phase selects exact authored image '+i);eq(a.phaseSpriteFallbacks[i],paths[i],'unloaded fallback remains same authored form '+i);eq(a.actionSpritesByPhase[i].idle,paths[i],'idle pose matches this form '+i);eq(a.actionSpritesByPhase[i].attackA,paths[i],'attack pose keeps matching form '+i);eq(a.sourceFacing31223,'right','source orientation remains explicit '+i);eq(art.phaseIndex(a),i,'health-ratio resolver covers all four forms '+i);
}
const unrelated={id:'c105-mid',phaseSprites:['old-body']};eq(art.applyActor(unrelated),false,'other zone enemies remain untouched');eq(unrelated.phaseSprites[0],'old-body','unrelated phase arrays remain untouched');
const manifest=B.zoneAssetManifest('cult04');for(const p of paths)ok(manifest.has(p),'native cult04 asset manifest requests '+p);eq(B.zoneAssetManifest('cult05').has(paths[0]),false,'phase assets stay scoped to cult04');
const live={zone:'cult04',enemies:[{...template,hp:200,maxHp:1000}]};controls.frameStart(live);eq(started,1,'native frame-start remains installed');ok(live.enemies[0].rc142CultLeaderForms,'native frame-start patches live enemy state');
eq(B.renderFrame({},live), 'native-render','native render still runs');ok(rendered.state.enemies[0].rc142CultLeaderForms,'render hook preserves native actor draw pipeline');
const persona=read('assets/rc133/inner-final.js'),media=read('assets/rc133/media-art.js'),duel=read('assets/rc134/persona-duel.js');
const artMap=JSON.parse(read('qa/rc142/gameplay-art-map.json')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
for(const row of artMap.cultLeader.phases)eq(hash(row.path),row.sha256,'cult phase artwork SHA-256 '+row.index);
for(const row of artMap.hiddenPersona.attacks){eq(hash('assets/rc134/persona-skills/'+row.key+'.png'),row.normalSha256,'normal attack art SHA-256 '+row.key);eq(hash('assets/rc133/art/'+row.key+'.png'),row.samongSha256,'awakened attack art SHA-256 '+row.key);}
ok(persona.includes("count=empowered?Math.min(12,skill.count*2):Math.min(12,Math.ceil(skill.count*1.5))"),'Dream volleys are denser and awakenings double the count with a hard cap');
ok(persona.includes('Math.max(mutual?.46:empowered?.68:1.05,warning+.35)'),'next volley waits through its warning and atomic cast lock');
ok(media.includes('samongSkillMap:samongSkills'),'awake attacks use the source-art map');
ok(duel.includes('s.facing=h<0?-1:1'),'hidden duel facing follows projected screen X');
ok(duel.includes('Math.min(1,Math.max(1,view.width-24)/1200'),'desktop arena zoom remains at or below 1x');
console.log(JSON.stringify({status:'passed',checks,scope:'c104 authored phase routing, asset preload, native renderer hooks, awake attack/facing/camera invariants'}));
