const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const classes=new Set(),window={addEventListener(){},innerWidth:1280,innerHeight:900};
const context={window,document:{documentElement:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)},remove(k){classes.delete(k)}}}},performance:{now:()=>0}};
vm.runInNewContext(read('data/story-rc51.js'),context);vm.runInNewContext(read('assets/rc51/story.js'),context);
const data=window.__HAPIL_STORY_DATA_RC51__,api=window.__HAPIL_STORY_RC51__;
assert.equal(data.sourceSha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'data/rc51/canonical.txt'))).digest('hex'));
assert.equal(data.records.length,62);assert.equal(data.records.filter(r=>!r.rest).length,56);
const clean=s=>s.split('\n').filter(l=>!/^제\d+부|^〈|^\[\d+/.test(l.trim())).join('').replace(/\s/g,'');
const source=clean(data.raw.slice(data.raw.indexOf('[01 · dist00]')));
const presented=clean(data.records.filter(r=>!r.rest).map(r=>[r.pre,r.firstPost,r.awakenPre,r.post].filter(Boolean).join('\n\n')).join('\n\n'));
assert.equal(presented,source,'every uploaded prose character appears once, in authored order');
for(const r of data.records){if(r.rest){assert(!r.pre&&!r.post);continue;}assert(r.pre&&r.post,`missing battle card ${r.zone}`);for(const k of ['pre','post','firstPost','awakenPre'])assert((r[k]?.length??0)<=900,`${r.zone} ${k} exceeds layout budget`);}
const state=()=>({time:100,hp:240,zone:'cult04',gameModeV31346:'STORY',activeHeroId:'hwando',hapilSamongActiveV31300:true,hapilFinalBattleV31300:{stage:7,secondPhaseActive:true,completed:false},lastAttack:100,cooldowns:{Q:101},heroMotion:{started:100,until:101},pendingStrikes:[{at:100.2}],effects:[{heroSkillVfx:true,born:100,size:50},{boss:true,born:100,size:50}]});
let s=state();assert(api.active(s));assert.equal(api.clock(s,.04),0);assert(s.lastAttack<100);assert(s.cooldowns.Q<101);assert(s.pendingStrikes[0].at<100.2);assert.equal(s.effects[1].born,100);assert.equal(s.effects[1].size,50);assert.equal(s.effects[0].size,77.5);assert.equal(api.power(s),5);assert.equal(api.incoming(s),.12);
let stopped=0,slow=0;for(let i=0;i<150;i++){const dt=api.clock(s,.04);assert(dt===0||Math.abs(dt-.0064)<1e-9);if(dt===0)stopped++;else slow++;s.time+=dt;}assert(stopped>50&&slow>50,'recurrent stops and slow motion both occur');
for(const modify of [s=>s.gameModeV31346='HELL',s=>s.gameModeV31346='DREAM',s=>s.practiceV31329=true,s=>s.zone='cult03',s=>s.hapilFinalBattleV31300.stage=6,s=>s.hapilFinalBattleV31300.completed=true,s=>s.hp=0,s=>s.activeHeroId='slayer']){s=state();modify(s);assert(!api.active(s));assert.equal(api.clock(s,.04),.04);assert.equal(api.power(s),1);assert.equal(api.incoming(s),1);assert(!classes.has('rc51-samong'));assert(!classes.has('rc51-time-stop'));}
const main=read('assets/index-v31526.js'),html=read('index.html');assert(html.indexOf('story-rc51.js')<html.indexOf('index-v31526.js'));
assert(main.includes('if(!scene?.rc26Story && window.__HAPIL_STORY_RC51__?.replacesLegacy)return false;'));
assert(main.includes('tickBasic(o,HAPIL_heroDeltaRC51,'));assert(main.includes('MONGSE_currentEncounterDialogue31226=()=>null'));
console.log('RC51 PASS: source conservation, 56 battle pairs, final phase cards, clock isolation, mode boundaries.');
