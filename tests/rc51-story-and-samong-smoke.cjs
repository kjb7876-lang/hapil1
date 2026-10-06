const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const classes=new Set(),window={addEventListener(){},innerWidth:1280,innerHeight:900};
const context={window,document:{documentElement:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)},remove(k){classes.delete(k)}}}},performance:{now:()=>0}};
vm.runInNewContext(read('data/story-rc51.js'),context);vm.runInNewContext(read('assets/rc51/story.js'),context);
const data=window.__HAPIL_STORY_DATA_RC51__,api=window.__HAPIL_STORY_RC51__;
const sourcePath=path.join(root,'data/rc57/voice-monologue.txt'),sourceBytes=fs.readFileSync(sourcePath),uploadedText=sourceBytes.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const fixes=[['보라검천사','보라검 천사'],['스쳐지나갔다','스쳐 지나갔다'],['악마였던건지','악마였던 건지'],['경고와함께','경고와 함께'],['머리속','머릿속'],['문을 잠군','문을 잠근'],['기리고','그리고'],['수호자로써','수호자로서'],['남겨져있었다','남겨져 있었다'],['남은채','남은 채'],['거였던거','거였던 것'],['대리고','데리고'],['되기위한','되기 위한'],['문들 부터','문들부터'],['정당화 해','정당화해'],['정렬되 있었다','정렬되어 있었다'],['어려워 졌','어려워졌다'],['누를 수 밖에','누를 수밖에'],['기억 조차','기억조차'],['존재 하고 있었다','존재하고 있었다'],['책망 하였고','책망하였고'],['밀어 벼렸다','밀어 버렸다'],['보내었다','보냈다'],['바랬기에','바랐기에'],['한이경 이였다','한이경이었다'],['둘이상','둘 이상'],['뿐이였','뿐이었다'],['소멸 되어 버렸다','소멸되어 버렸다'],['강제로 묶였던 자아들... 그들의 각자의 이름과 기억이 되찾아 갔다.','강제로 묶였던 자아들은 각자의 이름과 기억을 되찾아 갔다.']];
const {replaceNarrativeEllipses}=require('../tools/replace-narrative-ellipsis.cjs');
const {applyNarrativeProofreads}=require('../tools/narrative-proofreads.cjs');
const proofread=replaceNarrativeEllipses(applyNarrativeProofreads(fixes.reduce((text,[from,to])=>text.replaceAll(from,to),uploadedText)));
let seq=0;
const sourceText=proofread.replace(/^\[08-삭제된기록\]\s*\n/gm,'').replace(/^\[\d+(\s*·\s*[^\]]+)\]/gm,(_,tail)=>`[${String(++seq).padStart(2,'0')}${tail}]`);
assert.equal(data.version,'RC89');assert.equal(data.sourceFile,'data/rc57/voice-monologue.txt');assert.equal(data.sourceBytes,sourceBytes.length);
assert.equal(data.sourceSha256,crypto.createHash('sha256').update(sourceBytes).digest('hex'));
assert.equal(data.raw,sourceText,'the active story source must match the upload except for previously requested surface corrections');
assert(!fs.existsSync(path.join(root,'data/rc51/canonical.txt')),'the superseded canonical-file path must be removed');
assert.equal(data.records.length,61);assert.equal(data.records.filter(r=>!r.rest).length,55);assert.equal(data.records.filter(r=>r.rest).length,6);
const sections=new Map();let current=null;
for(const line of sourceText.split('\n')){const h=line.match(/^\[(\d+)\s*·\s*([^\]]+)\]\s*(.*)$/);if(h){current={zone:h[2].trim(),title:h[3].trim(),lines:[]};sections.set(current.zone,current);continue;}if(/^\[08-삭제된기록\]/.test(line)){current=null;continue;}if(/^제\d+부|^〈/.test(line.trim()))continue;if(current)current.lines.push(line);}
const getParas=zone=>sections.get(zone).lines.join('\n').trim().split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
const join=(...parts)=>parts.flat().filter(Boolean).join('\n\n').trim();
const recorded=JSON.parse(read('data/opening-voice-rc74.json'));
const voice1=join(recorded.opening.title,recorded.opening.paragraphs),voice2=join(recorded.root.title,recorded.root.paragraphs);
const preCount={dist00:2,dist01:2,dist02:2,dist03:2,dist05:1,dist06:1,ep1a07:1,ep1a08:2,ep1a09:3,ep1a10:3,ep1a11:5,ep1b01:3,ep1b02:3,ep1b03:3,ep1b04:3,ep1b05:3,ep1b06:2,ep1b06b:2,ep1b07:3,ep1b08:3,ep1b09:3,u201:2,u202:4,u204:4,u205:2,u206:4,u203:1,last304:1,last305:2,last301:2,last302:2,last303:2,kair01:2,kair04:2,kair05:2,kair06:1,kair07:2,kair08:1,kair09:1,kair10:2,kair02:2,kair03:5,hando01:1,hando02:2,hando03:2,murder01:1,murder02:5,murder04:7,murder03:3,cult01:3,cult02:2,cult05:2,cult06:2,cult03:4};
const restBefore={ep1b01:'dreamRest',u201:'restEp1b',last304:'restU2',kair01:'restLast3',hando01:'restKairo',murder01:'restHando'};
for(const r of data.records){
 if(r.rest){assert.deepEqual([...r.paragraphs],getParas(r.zone));assert(!r.pre&&!r.post);continue;}
 let own;
 if(r.zone==='dist04'){const body=sections.get('dist04').lines.join('\n').trim(),lines=body.split('\n').map(x=>x.trim()).filter(Boolean);own=[body];assert.deepEqual([...r.paragraphs],own);assert.equal(r.pre,body);assert.equal(r.post,'동료들마저 쓰러뜨리고');continue;}
 own=getParas(r.zone);
 assert.deepEqual([...r.paragraphs],own,`${r.zone} paragraph source`);
 if(r.zone==='ep1a07'){assert.equal(r.sourceZone,'dist06');assert.equal(r.pre,own[0]);assert.equal(r.post,own[1]);continue;}
 if(r.zone==='dist06'){assert.equal(r.pre,own[0]);assert.equal(r.post,own.slice(1).join('\n\n'));continue;}
 const cuts=r.zone==='cult04'?[1,7,10]:[preCount[r.zone]],parts=[];let at=0;
 for(const cut of cuts){parts.push(own.slice(at,cut).join('\n\n'));at=cut;}parts.push(own.slice(at).join('\n\n'));
 if(restBefore[r.zone])parts[0]=join(getParas(restBefore[r.zone]),parts[0]);
 if(r.zone==='dist00'){parts[0]=voice1;parts[1]=voice2;}
 if(r.zone==='dist05')parts[0]=parts[0].replace(/^동료들마저 쓰러뜨리고\n/,'');
 assert.equal(r.pre,parts[0],`${r.zone} pre-battle monologue`);
 if(r.zone==='cult04'){assert.equal(r.firstPost,parts[1]);assert.equal(r.awakenPre,join(parts[2],'교주가 손을 들자, 내가 쓰러뜨렸던 코스믹 보스들의 망령이 검은 신경선에 매달려 나타났다. 그토록 강했던 존재들마저 그의 꼭두각시가 되어 있었다. 나는 그들을 다시 죽이기 위해서가 아니라, 교주가 붙들고 있는 사몽의 연결을 끊기 위해 환도를 들었다.'));assert.equal(r.post,parts[3]);}
 else assert.equal(r.post,parts[1],`${r.zone} post-battle monologue`);
 }
const prologue=window.__HAPIL_PATIENT_DATA_RC51__.records[0].body;
assert.equal(prologue,join(voice1,voice2),'the journal opening follows the same recordings');
assert.equal(api.replacesLegacy,true);
for(const r of data.records){if(r.rest)continue;assert(r.pre&&r.post,`missing battle card ${r.zone}`);for(const k of ['pre','post','firstPost','awakenPre'])assert((r[k]?.length??0)<=900,`${r.zone} ${k} exceeds layout budget`);}
const mapCards=read('data/rc57/voice-monologue-map-cards.txt').replace(/\r\n/g,'\n');
const mapAudit=read('docs/RC60-story-map-mob-combat-audit.md');
assert.equal((mapCards.match(/^## /gm)||[]).length,55,'the text export must contain every combat map exactly once');
assert.equal((mapCards.match(/^### 전투 전$/gm)||[]).length,55,'each map needs a pre-battle card');
assert.equal((mapCards.match(/^### 전투 후$/gm)||[]).length,54,'cult04 uses its explicit multi-phase post labels');
assert(mapCards.includes('### 1차 전투 후')&&mapCards.includes('### 사몽 각성 전')&&mapCards.includes('### 최종 전투 후'));
for(const r of data.records.filter(r=>!r.rest)){
 const block=mapCards.split(`## ${r.zone} · ${r.title}\n`)[1]?.split(/^## /m)[0];assert(block,`${r.zone} missing from paragraph text export`);
 for(const key of ['pre','post','firstPost','awakenPre'])if(r[key])assert(block.includes(r[key]),`${r.zone} ${key} differs from the in-game card`);
}
assert.equal((mapAudit.match(/^\| \d{2} \|/gm)||[]).length,55,'the audit must account for each battle map');
assert.equal((mapAudit.match(/^\| `(dist|ep1a|ep1b|u2|last|kair|hando|murder|cult)[^|]*\|/gm)||[]).length,55,'the audit must include each map profile, hazard and combat tempo');
for(const r of data.records.filter(r=>!r.rest))assert(mapAudit.includes(`| \`${r.zone}\` | ${r.title} |`),`${r.zone} missing from the map/mob audit`);
assert(mapAudit.includes('`blood-hospital`')&&mapAudit.includes('`beds-and-help-wall`'),'hospital environment must be in the profile audit');
assert(mapAudit.includes('`rooftop-mobius-cycle`')&&mapAudit.includes('`six-limbed-throne`'),'late loop and final arena profiles must be audited');
const state=()=>({time:100,hp:240,zone:'cult04',gameModeV31346:'STORY',activeHeroId:'hwando',hapilSamongActiveV31300:true,hapilFinalBattleV31300:{stage:7,secondPhaseActive:true,completed:false},lastAttack:100,cooldowns:{Q:101},heroMotion:{started:100,until:101},pendingStrikes:[{at:100.2}],effects:[{heroSkillVfx:true,born:100,size:50},{boss:true,born:100,size:50}]});
const entryState=state();entryState.encounterDialogue31226={kind:'legacy',lines:['상호 대사']};entryState.encounterLockUntil31226=110;entryState.encounterWallUnlockAtV31227=Date.now()+3300;entryState.invulnerableUntil=110;entryState.enemies=[{readyAt:110,patternReadyAt:111,invulnerableUntil:110}];api.suppressEntry(entryState);assert.equal(entryState.encounterDialogue31226,null);assert.equal(entryState.restDialogueComplete31226,true);assert(entryState.invulnerableUntil<=entryState.time+.12);assert(entryState.enemies[0].readyAt<=entryState.time+.14);assert(entryState.enemies[0].patternReadyAt<=entryState.time+.28);entryState.enemies[0].readyAt=entryState.time+9;api.suppressEntry(entryState);assert.equal(entryState.enemies[0].readyAt,entryState.time+9,'ongoing enemy attack cadence is left alone once the old dialogue has been cleared');
let s=state();assert(api.active(s));assert.equal(api.clock(s,.04),0);assert(s.lastAttack<100);assert(s.cooldowns.Q<101);assert(s.pendingStrikes[0].at<100.2);assert.equal(s.effects[1].born,100);assert.equal(s.effects[1].size,50);assert.equal(s.effects[0].size,77.5);assert.equal(api.power(s),5);assert.equal(api.incoming(s),.12);
let stopped=0,slow=0;for(let i=0;i<150;i++){const dt=api.clock(s,.04);assert(dt===0||Math.abs(dt-.0064)<1e-9);if(dt===0)stopped++;else slow++;s.time+=dt;}assert(stopped>50&&slow>50,'recurrent stops and slow motion both occur');
for(const modify of [s=>s.gameModeV31346='HELL',s=>s.gameModeV31346='DREAM',s=>s.practiceV31329=true,s=>s.zone='cult03',s=>s.hapilFinalBattleV31300.stage=6,s=>s.hapilFinalBattleV31300.completed=true,s=>s.hp=0,s=>s.activeHeroId='slayer']){s=state();modify(s);assert(!api.active(s));assert.equal(api.clock(s,.04),.04);assert.equal(api.power(s),1);assert.equal(api.incoming(s),1);assert(!classes.has('rc51-samong'));assert(!classes.has('rc51-time-stop'));}
const main=read('assets/index-v31526.js'),html=read('index.html'),activeStoryScript=html.match(/<script\b[^>]*\bsrc="([^"]*data\/story-rc51\.js\?[^\"]*)"[^>]*><\/script>/);assert(activeStoryScript,'the approved story data file must be an active script tag');const activeStoryUrl=new URL(activeStoryScript[1],'https://hapil.invalid/');assert.equal(activeStoryUrl.pathname,'/data/story-rc51.js','the active story source path stays canonical');assert(activeStoryUrl.searchParams.has('v'),'the active story source keeps its cache key');assert(html.indexOf(activeStoryScript[0])<html.indexOf('assets/rc51/story.js'),'story data loads before its runtime');assert(html.indexOf('assets/rc51/story.js')<html.indexOf('assets/index-v31526.js'),'story runtime loads before the game bundle');const approvedStoryHash=JSON.parse(read('qa/rc129/manifest.json')).preservedNarrationRuntime['data/story-rc51.js'];assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'data/story-rc51.js'))).digest('hex'),approvedStoryHash,'active story script bytes match the approved source hash');
assert(main.includes('if(window.__HAPIL_STORY_RC51__?.replacesLegacy)return false;'));
assert(main.includes('function HAPIL_installCanonicalStoryRC51(){'));
assert(main.includes('prepareCombat(s,z,false);api.suppressEntry(s);'));
assert(main.includes('tickBasic(o,HAPIL_heroDeltaRC51,'));assert(main.includes('MONGSE_currentEncounterDialogue31226=()=>null'));
assert(main.includes("interludes:Object.freeze({}),"));assert(main.includes("MONGSE_resolveInterlude=()=>null;"));
assert(main.includes('window.__HAPIL_LEGACY_STORY_RC58__=Object.freeze'));
assert(main.includes("if(window.__HAPIL_STORY_RC51__?.replacesLegacy)return clearDialogue(s,'combat');"));
assert(!main.includes("const openingSceneRC52=story.scene('opening')"),'launch must not wait on the superseded opening scene');
assert(!html.includes('assets/rc26/story.js'),'old reciprocal story source must not be loaded');
assert(html.includes('christian-opening-v31236'),'the explicitly requested Christian title prologue is restored independently of battle dialogue');
console.log('RC60 PASS: uploaded monologue only, 55 exported pre/post pairs, old dialogue/interlude APIs cleared, no stale entry lock, final phase cards, clock isolation, mode boundaries.');
