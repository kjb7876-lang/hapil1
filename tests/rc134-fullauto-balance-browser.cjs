'use strict';
// Real native reducers in paired current-build contexts. The reference disables
// ONLY the effective-mode final factor; class pressure and every other reducer
// remain identical. Fixtures are not natural campaign evidence. Explicit native body/heart stamps
// keep raster decode/animation readiness out of this isolated reducer comparison;
// actual raster contact remains covered by the bitmap/native contact suites.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));
const root=path.resolve(__dirname,'..'),base='59f5381c046cb4b2416a97c704f34770e887602d',out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc134-fullauto-balance';fs.mkdirSync(out,{recursive:true});
const changed=['index.html','assets/index-v31526.js','assets/combat-v31402/combat-core.js'];
const core=fs.readFileSync(path.join(root,'assets/combat-v31402/combat-core.js'),'utf8'),factorLine="const factor = mode === 'full' ? (key === 'outgoing' ? 1.70 : 0.10) : 1;";assert.equal(core.split(factorLine).length,2,'one exact mode-factor site');const before={'assets/combat-v31402/combat-core.js':Buffer.from(core.replace(factorLine,'const factor = 1; // isolated neutral effective-mode reference'))};
const names=['MONGSE_objectiveDamageAllowedV31309','HAPIL_claimCounterWindowV31303','sr','ir','HAPIL_effectiveGrowthV31400','gr','MONGSE_infiniteStats','MONGSE_heroOutgoingModeMultiplier31213','HAPIL_applyCounterDamageV31303','MONGSE_triggerEnemyBreak','HAPIL_awardComboMilestoneV31303','HAPIL_bindDamageHitV31315','MONGSE_attachEffectTarget','MONGSE_beginNarrativeAttack','MONGSE_enemyPhase','MONGSE_enemyActivePhase'];
const bridge=`\nwindow.__RC134_BALANCE_TEST__={initial:oi,incoming:Y,status:MONGSE_tickSevenSinHeroEffects,outgoing:(s,power,source,critical=false,passives={})=>window.__HAPIL_OUTGOING_V31402__.create({P:{current:s},R:{current:passives},Re:{current:false},Ke:()=>{},native:{${names.map(n=>`get ${n}(){return ${n};}`).join(',')}}})(s.enemies[0],power,'#fff',critical,0,source)};`;
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.json':'application/json'};
const server=http.createServer((req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://local').pathname),old=name.startsWith('/baseline/');name=name.replace(/^\/(baseline|candidate)/,'').replace(/^\/$/,'/index.html');const f=path.resolve(root,'.'+name);if(!f.startsWith(root+'/'))return res.writeHead(403).end();const relative=path.relative(root,f);let bytes=old&&before[relative]?before[relative]:fs.readFileSync(f);res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');if(relative==='assets/index-v31526.js')bytes=Buffer.concat([bytes,Buffer.from(bridge)]);res.end(bytes);}catch{res.writeHead(404).end();}});
async function fixtures(browser,revision,device){
 const context=await browser.newContext(device==='phone'?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1180,height:757}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{await page.goto('http://127.0.0.1:'+server.address().port+'/'+revision+'/?qa=1');await page.waitForFunction(()=>window.__HAPIL_RC133_NATIVE__?.installed&&window.__RC134_BALANCE_TEST__);await page.keyboard.press('Escape');await page.getByRole('button',{name:'새 게임 시작',exact:true}).click();await page.getByRole('button',{name:'이 편성으로 접속',exact:true}).click();await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__?.binding?.phase==='game');
 return {device,revision,errors,...await page.evaluate(()=>{
  const T=window.__RC134_BALANCE_TEST__,C=window.__HAPIL_CONTROLS_V31329__,B=C.binding,Core=window.__HAPIL_COMBAT_CORE_V31401__,A=window.__HAPIL_SAMONG_RC91__,original=B.state.current,settings=B.settings.current,rows=[],health=[];
  A.unlock(null,'777');
  const set=mode=>C.setMode(mode,update=>B.settings.current=update(B.settings.current));
  const make=(gameMode,buff=false)=>{const s=T.initial();Object.assign(s,{zone:'dist00',time:100,x:16,y:24,hp:240,maxHp:240,activeHeroId:'gunner',gameModeV31346:gameMode,samongUnlockedRC91:true,practiceV31329:false,encounterLockUntil31226:0,encounterWallUnlockAtV31227:0,encounterDialogue31226:null,invulnerableUntil:0,awakeningUntil:buff?107:0,damageBuffUntil:buff?110:0,counterUntil:buff?110:0,combo:buff?15:0,activeHeroMastery:buff?3:0,heroDamageTakenMultiplier:buff?.7:1,rc127Defense:{incoming:buff?.37:1},samongPassiveRC91:{version:1,active:buff&&gameMode==='DREAM'?7:0,grace:0,cooldown:70,heroId:'gunner'},enemies:[{id:'dist00-boss',boss:true,hp:100000,maxHp:100000,x:20,y:24,invulnerableUntil:0,stagger:0,maxStagger:1000,staggerUntil:0,recoverUntil:0,fixedPhase:1,currentPhase:1}]});B.state.current=s;return s;};
  try{
   for(const gameMode of ['STORY','DREAM'])for(const mode of ['manual','semi','full'])for(const variant of ['none','buffs','777']){
    const buff=variant!=='none';
    set(mode);
    for(const kind of ['projectile','heart-projectile','laser','body-floor','ultimate-floor','weak-exit','melee','bleed','burn','poison','ally-projectile','ally-laser']){
     const s=make(gameMode,buff),source={id:123,sourceId:'dist00-boss',born:99,x:s.x,y:s.y,originX:20,originY:24,damage:20,radius:.24,at:100,shape:'circle'};let result,duplicate=null,target=s;
     if(variant==='777'){s.activeHeroMastery=7;s.activeTimeMastery=8;}
     source.heartContactV31336={target:'__host',time:s.time,heart:kind==='heart-projectile'||kind==='laser'||kind.endsWith('floor')};
     if(kind==='projectile'||kind==='heart-projectile'){Object.assign(source,{vx:1,vy:0});s.hostileProjectiles.push(source);}if(kind==='laser')Object.assign(source,{boss:true,laserV31330:true,shape:'line',raidBodyContactRC24:false,heartContactRC24:true});if(kind==='body-floor')Object.assign(source,{boss:true,raidBodyContactRC24:true,heartContactRC24:true});if(kind==='ultimate-floor')Object.assign(source,{boss:true,raidUltimateRC24:true,heartContactRC24:true});
     if(kind.startsWith('ally-')){const P=window.__HAPIL_PARTY_V31322__,a={slotId:'rc134-ally',heroId:'hwando',name:'native ally',x:s.x,y:s.y,hp:240,maxHp:240,invulnerableUntil:0,downUntil:0};P.actors.push(a);target=a;source.heartContactV31336={target:a.slotId,time:s.time,heart:kind==='ally-laser'};Object.assign(source,{vx:1,vy:0});if(kind==='ally-laser')Object.assign(source,{boss:true,laserV31330:true});else s.hostileProjectiles.push(source);try{result=P.debug.allyDamage(s,a,20,source);duplicate=P.debug.allyDamage(s,a,20,source);}finally{P.actors.splice(P.actors.indexOf(a),1);}}
     else if(['bleed','burn','poison'].includes(kind)){const tag={bleed:'Bleed',burn:'Burn',poison:'EnvyPoison'}[kind];s['hero'+tag+'Until']=101;s['hero'+tag+'NextAt']=100;s['hero'+tag+'SourceIdRC108']='dist00-boss';result=T.status(s);}
     else if(kind==='weak-exit'){const e={...source,duration:5,dx:1,dy:0,travel:1,contacted:[],damage:1};result=window.__HAPIL_EXIT_V31328__.debug.apply(s,s,e,e,{heart:true});duplicate=window.__HAPIL_EXIT_V31328__.debug.apply(s,s,e,e,{heart:true});}
     else{result=T.incoming(s,kind.endsWith('floor')?1:20,s.x,s.y,source);duplicate=T.incoming(s,20,s.x,s.y,source);}
     const event=Core.snapshot(s).events.findLast(e=>e.appliedDamage>0);rows.push({direction:'incoming',gameMode,mode,variant,kind,heartEvidence:source.heartContactV31336,damage:240-target.hp,amount:event?.appliedDamage??240-target.hp,final:event?.finalDamage??null,duplicate,result,eventKind:event?.kind});
    }
    for(const kind of ['projectile','laser','dot','melee','skill','ultimate','companion','collab','reflected']){
     const s=make(gameMode,buff),source={heroId:'gunner',actionKey:'rc134-'+kind};
     if(kind==='projectile')Object.assign(source,{vx:1,vy:0,heroId31213:'gunner'});if(kind==='laser')Object.assign(source,{laser:true,shape:'line'});if(kind==='dot')Object.assign(source,{statusTick:true,damageOverTime:true});if(kind==='melee')source.partyMeleeV31322=true;if(kind==='skill')source.skillIndex=1;if(kind==='ultimate')Object.assign(source,{ultimate:true,skillIndex:3});if(kind==='companion')Object.assign(source,{heroId:'hwando',partySlotV31322:'ai1'});if(kind==='collab')Object.assign(source,{heroId:'hwando',collabKey:'hwando-gunner'});if(kind==='reflected')Object.assign(source,{reflected:true,friendly:true,heroId31213:'gunner'});
     const target=s.enemies[0],hp=target.hp;T.outgoing(s,80,source,buff,variant==='777'?window.__HAPIL_PROGRESSION_V31338__.master({infinitePower:20}):buff?{damage:3,infinitePower:20,heroMastery_gunner:3}:{});const event=Core.snapshot(s).events.at(-1);rows.push({direction:'outgoing',gameMode,mode,variant,kind,damage:hp-target.hp,amount:event?.appliedDamage,final:event?.finalDamage??null,result:event?.result,maxHp:target.maxHp});
    }
   }
   const bursts=[];for(const gameMode of ['STORY','DREAM'])for(const initialMode of ['manual','semi','full']){
    const s=make(gameMode,true),passives=window.__HAPIL_PROGRESSION_V31338__.master({infinitePower:20}),target=s.enemies[0],packets=[];
    for(const [mode,advance] of [[initialMode,0],['full',0],['manual',0],['full',.21],['semi',0]]){set(mode);s.time+=advance;const hp=target.hp;T.outgoing(s,100000,{heroId:'gunner',actionKey:'rc134-burst'},true,passives);const event=Core.snapshot(s).events.at(-1);packets.push({mode,time:s.time,damage:hp-target.hp,spent:target.burstDamageWindowSpentV31576,result:event.result,final:event.finalDamage??null});}
    bursts.push({gameMode,initialMode,packets});
   }
   // Native slot serialization and restoration: no multiplier in actor/growth
   // fields, no mode stacking, and bounded hidden health stays mode-independent.
   const s=make('DREAM',true),Bridge=window.__HAPIL_RC86_BRIDGE__,H=window.__HAPIL_INNER_FINAL_RC133__,raw={damage:3,infinitePower:1234,speed:3};s.zone='cult04';const leader=Bridge.actor('cult04','c104-boss');
   for(const mode of ['full','manual','semi','full','manual','full']){set(mode);health.push({mode,hp:H.health(s,leader,raw),growth:H.growth(s,raw)});}
   const serial=[];for(const mode of ['full','manual','full']){set(mode);const rawSave=Bridge.serializeSave(s,'gunner',[],raw,0),restored=T.initial();Bridge.restoreEntry(restored,rawSave);serial.push({mode,keys:Object.keys(rawSave).filter(k=>/finalDamage|fullauto|multiplierRC134/i.test(k)),hp:rawSave.hp,maxHp:rawSave.maxHp,passives:rawSave.passives,restoredHp:restored.hp,restoredMaxHp:restored.maxHp});}
   const toggles=[];for(let i=0;i<9;i++){const mode=['full','manual','semi'][i%3];set(mode);const fresh=make('STORY');fresh.combatModeV31329='full';T.incoming(fresh,20,fresh.x,fresh.y,{id:600+i,sourceId:'dist00-boss',born:99,vx:1,vy:0,x:fresh.x,y:fresh.y,heartContactV31336:{target:'__host',time:fresh.time,heart:false}});toggles.push({mode,damage:240-fresh.hp});}
   const P=window.__HAPIL_PARTY_V31322__,role=P.status.role,authority=[];set('full');P.setNetworkRole('guest');try{const s=make('STORY'),target=s.enemies[0];const incoming=T.incoming(s,20,s.x,s.y,{id:999,sourceId:target.id,born:99});T.outgoing(s,80,{heroId:'gunner'});authority.push({incoming,hp:s.hp,enemyHp:target.hp,events:Core.snapshot(s).events.map(e=>({result:e.result,final:e.finalDamage??null}))});}finally{P.setNetworkRole(role);}
   return {rows,bursts,health,serial,toggles,authority,mobile:window.__HAPIL_MOBILE_V31366__?.enabled()===true};
  }finally{B.state.current=original;B.settings.current=settings;C.clear();}
 })};
 }finally{await context.close();}
}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={base,commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),scope:'Paired same-build native reducer fixtures; synthetic damage setup, not natural campaign',profiles:[],status:'running'};try{
 browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const device of ['pc','phone']){
  const baseline=await fixtures(browser,'baseline',device),candidate=await fixtures(browser,'candidate',device);report.profiles.push({device,baseline,candidate});assert.deepEqual(baseline.errors,[]);assert.deepEqual(candidate.errors,[]);assert.equal(candidate.mobile,device==='phone');
  assert.equal(candidate.rows.length,378);assert.equal(baseline.rows.length,candidate.rows.length);
  for(let i=0;i<candidate.rows.length;i++){
   const old=baseline.rows[i],next=candidate.rows[i];if(next.direction==='incoming')assert.deepEqual(next.heartEvidence,old.heartEvidence,'paired reducer inputs have identical authoritative body/heart evidence');const factor=next.mode==='full'?(next.direction==='incoming'?.1:1.7):1,label=JSON.stringify({device,...next});
   if(old.damage===0){assert.equal(next.damage,0,'both references seal the same awake nonbullet '+label);assert.equal(old.direction,'incoming');assert.equal(old.gameMode,'DREAM');assert(old.variant!=='none');assert(!['projectile','heart-projectile','ally-projectile'].includes(old.kind));continue;}
   assert(old.damage>0,'baseline native fixture must hit '+label);assert(Math.abs(next.damage-old.damage*factor)<1e-7,'same-build HP damage ratio '+label);assert(Math.abs(next.amount-old.amount*factor)<1e-7,'native applied amount ratio '+label);assert.equal(next.final.factor,factor,'transaction factor '+label);assert(Math.abs(next.final.baseline-old.amount)<1e-7,'unmodified native amount '+label);
   if(next.direction==='outgoing'){assert.equal(next.maxHp,old.maxHp);assert.equal(next.result,'HIT');}else if(next.duplicate!==null)assert.equal(next.duplicate,false,'native rehit ledger unchanged '+label);
  }
  for(const row of candidate.rows.filter(r=>r.kind==='heart-projectile'&&r.variant==='none')){const body=candidate.rows.find(r=>r.direction==='incoming'&&r.kind==='projectile'&&r.gameMode===row.gameMode&&r.mode===row.mode&&r.variant===row.variant);assert(row.damage>body.damage,'Explicit native heart evidence contributes its actual bonus');}
  for(const row of candidate.health){assert.equal(row.hp,candidate.health[0].hp);assert.equal(row.growth,candidate.health[0].growth);}
  assert.deepEqual(candidate.health,baseline.health,'hidden health and permanent growth match same-build baseline');
  for(const row of candidate.serial)assert.deepEqual(row.keys,[],'native save contains no transient multiplier');
  assert.deepEqual(candidate.serial,baseline.serial,'native slot bytes/vitals/growth unchanged by full auto');
  assert.deepEqual(candidate.authority,baseline.authority,'guest authority rejection precedes all scaling');for(const row of candidate.authority){assert.equal(row.incoming,false);assert.equal(row.hp,240);assert.equal(row.enemyHp,100000);for(const event of row.events){assert.equal(event.result,'REJECTED');assert.equal(event.final,null);}}
  for(let i=0;i<candidate.bursts.length;i++)for(let j=0;j<candidate.bursts[i].packets.length;j++){const a=candidate.bursts[i].packets[j],b=baseline.bursts[i].packets[j];assert(Math.abs(a.damage-b.damage*(a.mode==='full'?1.7:1))<1e-7,'native cap sequence keeps final ratio');assert(Math.abs(a.spent-b.spent)<1e-7,'native burst spending retains original units across toggles');assert.equal(a.result,b.result,'exhausted burst window retains native rejection');assert(Math.abs(a.final.baseline-b.damage)<1e-7,'journal records admitted burst amount');}
  for(let i=0;i<candidate.toggles.length;i++){const a=candidate.toggles[i],b=baseline.toggles[i];assert(Math.abs(a.damage-b.damage*(a.mode==='full'?.1:1))<1e-8,'repeated effective-mode changes have exact ratios');}
 }
 report.status='passed';console.log('RC134_FULLAUTO_BROWSER',JSON.stringify({status:report.status,profiles:report.profiles.length,pairedDamageCases:756,pairedBurstPackets:60,sameBuildBase:'current candidate; only control-mode final factor neutralized',historicalBase:base,exactRatios:true,hiddenHealthUnchanged:true,nativeSerialization:true}));
 }finally{if(report.status==='running')report.status='failed';fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser?.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
