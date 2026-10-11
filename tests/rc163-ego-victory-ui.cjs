'use strict';
const assert=require('node:assert/strict');
async function run(openProbe,out){
 const results=[];
 for(const cfg of [{name:'pc-manual',mode:'manual',viewport:{width:1280,height:900}},{name:'mobile-full',mode:'full',viewport:{width:844,height:390},isMobile:true,hasTouch:true},{name:'mobile-manual-rotate',mode:'manual',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
  const{page,errors}=await openProbe({viewport:cfg.viewport,isMobile:cfg.isMobile??false,hasTouch:cfg.hasTouch??false});try{
   if(cfg.viewport.height>cfg.viewport.width&&cfg.isMobile){await page.waitForFunction(()=>window.__HAPIL_ORIENTATION_PAUSE_RC152__?.paused()===true,null,{timeout:5000});await page.setViewportSize({width:844,height:390});}
   await page.evaluate(mode=>{
    const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,H=window.__HAPIL_INNER_FINAL_RC133__,s=Q.initial();Object.assign(s,{zone:'cult04',time:100,gameModeV31346:'DREAM',samongUnlockedRC91:true,activeHeroId:'gunner'});C.binding.state.current=s;C.binding.hero.current='gunner';window.__HAPIL_RUN_V31400__.init(s,'gunner',{aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'practice'});window.__HAPIL_PARTY_V31322__.configure(window.__HAPIL_RUN_V31400__.configFor(s,'gunner'));Q.enter(s,'cult04',false);C.binding.state.current=s;C.setMode(mode);s.invulnerableUntil=s.time+10000;
    // A staged full-health checkpoint. Do not assign enemy HP, phase, revival,
    // completion, EGO flags or a next-zone ID after this native map entry.
   },cfg.mode);
   await page.waitForTimeout(350);
   await page.evaluate(mode=>{const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,H=window.__HAPIL_INNER_FINAL_RC133__,s=C.binding.state.current;
    Q.egoUI={initial:{zone:s.zone,time:s.time,enemies:s.enemies.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase})),ego:window.__HAPIL_EGO_GUARDIAN_RC155__.snapshot(s)},deaths:[],samples:[],hits:0,blackholes:[],blackholeDraws:[],mode};
    const before=H.beforeDeath;window.__HAPIL_INNER_FINAL_RC133__=Object.freeze({...H,beforeDeath(state,a){const pre={id:a.id,hp:a.hp,maxHp:a.maxHp,phase:state.innerFinalRC133?.phase,bossRevived:!!state.innerFinalRC133?.bossRevived},result=before(state,a);if(state===s)Q.egoUI.deaths.push({time:s.time,pre,result,after:{hp:a.hp,phase:s.innerFinalRC133?.phase,bossRevived:!!s.innerFinalRC133?.bossRevived,entry:s.innerFinalRC133?.entry,ego:window.__HAPIL_EGO_GUARDIAN_RC155__.snapshot(s)}});return result;}});
    const lasers=window.__HAPIL_LASERS_V31330__,draw=lasers.draw;lasers.draw=function(ctx,cache,state,...args){const own=Object.getOwnPropertyDescriptor(ctx,'drawImage'),base=ctx.drawImage;ctx.drawImage=function(im,...points){const path=im.currentSrc||im.src||'',owned=state===s&&(s.bossBlackHolesRC32??[]).some(h=>h.sourceId==='inner-evil-rc133'&&path.endsWith(h.sprite.replace('./','/')));if(owned&&!Q.egoUI.blackholeDraws.some(r=>r.path===path)){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);const px=x.getImageData(0,0,c.width,c.height).data;let visible=0,red=0,blue=0;for(let k=0;k<px.length;k+=4)if(px[k+3]>=64){visible++;if(px[k]>px[k+2]*1.3&&px[k]>px[k+1]*1.3)red++;if(px[k+2]>px[k]*1.3)blue++;}Q.egoUI.blackholeDraws.push({path,visible,red,blue,awake:s.innerFinalRC133?.awake});}return base.call(this,im,...points);};try{return draw.call(this,ctx,cache,state,...args);}finally{if(own)Object.defineProperty(ctx,'drawImage',own);else delete ctx.drawImage;}};
    Q.egoUITimer=setInterval(()=>{
     if(s.zone==='cult04'&&s.innerFinalRC133?.phase!=='complete'&&(!H.encounter(s)||Q.egoUI.blackholes.length>0))for(const a of [...s.enemies])if(a.hp>0&&!a.visualOnly&&!a.friendly)for(let i=0;i<20&&a.hp>0&&s.enemies.includes(a)&&!(a.invulnerableUntil>s.time);i++){const hp=a.hp;C.binding.actions.damage(a,1000000,'#edf7ff',false,0,{heroId:'gunner',heroAttackId:'rc163-controlled-native-damage',actionKey:'A',id:s.fxSerial++,born:s.time});if(a.hp<hp)Q.egoUI.hits++;if(a.hp===hp)break;}
     for(const h of s.bossBlackHolesRC32??[])if(h.sourceId==='inner-evil-rc133'&&!Q.egoUI.blackholes.some(v=>v.id===h.id))Q.egoUI.blackholes.push({...h,awake:s.innerFinalRC133?.awake});
     Q.egoUI.samples.push({time:s.time,zone:s.zone,phase:s.innerFinalRC133?.phase,entry:s.innerFinalRC133?.entry,bossRevived:!!s.innerFinalRC133?.bossRevived,hp:s.hp,boss:window.__HAPIL_INNER_FINAL_RC133__.boss(s)?.hp,clear:Q.clear(s,s.zone),drops:s.egoDrops.length,ego:window.__HAPIL_EGO_GUARDIAN_RC155__.snapshot(s),flow:s.flowStateV31343});
    },100);
   },cfg.mode);
   await page.waitForFunction(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return s.innerFinalRC133?.phase==='complete';},null,{timeout:300000});
   const victory=await page.evaluate(()=>{const Q=window.__RC158_QA__,s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;clearInterval(Q.egoUITimer);return{...Q.egoUI,atVictory:{zone:s.zone,inner:{...s.innerFinalRC133},ego:window.__HAPIL_EGO_GUARDIAN_RC155__.snapshot(s),enemies:s.enemies.map(a=>({id:a.id,hp:a.hp})),drops:s.egoDrops.length,clear:Q.clear(s,s.zone)}};});
   console.log('RC163_FULL_VICTORY',JSON.stringify({name:cfg.name,initial:victory.initial,deaths:victory.deaths,atVictory:victory.atVictory,hits:victory.hits,holes:victory.blackholes}));
   assert.equal(victory.atVictory.inner.entry,'cult-death');assert.equal(victory.atVictory.inner.bossRevived,true,'real first Persona lethal must perform its native revival');assert(victory.deaths.filter(d=>d.pre.id==='inner-evil-rc133').length>=2,'both native Persona death callbacks observed');assert(victory.atVictory.ego.personaVictory,'true native victory grants pending EGO');assert(victory.hits>0);assert(victory.blackholes.length>0,'actual native Persona RC32 blackhole must emit');assert(victory.blackholeDraws.length>0,'real world renderer must consume owned blackhole image');for(const d of victory.blackholeDraws){assert(d.visible>0&&d.red/d.visible>.9&&d.blue/d.visible<.05,'actual decoded area blackhole source is red');}
   if(cfg.mode==='manual'){
    await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;for(const d of s.egoDrops??[]){s.x=d.x;s.y=d.y;window.__HAPIL_CONTROLS_V31329__.binding.actions.interact();}const exit=window.__RC158_QA__.anchors(s.zone).interactionExit;s.x=exit.x;s.y=exit.y;});
    if(cfg.isMobile)await page.locator('button.interact-action').tap();else await page.locator('button.interact-action').click();
   }
   // Use the real rendered record/interlude controls; never call ii/RC69 enter
   // or assign a destination here. Full mode gets no manual portal dispatch.
   for(let i=0;i<80;i++){
    const changed=await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.zone!=='cult04');if(changed)break;
    if(cfg.mode==='manual'&&await page.locator('#hapil-story-rc51').count())await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
   }
   await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.zone!=='cult04',null,{timeout:30000});
   await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.egoGuardianRC155?.active===true,null,{timeout:5000});
   const after=await page.evaluate(()=>{const C=window.__HAPIL_CONTROLS_V31329__,N=window.__HAPIL_RC133_NATIVE__,E=window.__HAPIL_EGO_GUARDIAN_RC155__,s=C.binding.state.current,raw=N.normalize(N.save(s,C.binding.hero.current,[],C.binding.passives.current,C.binding.shards.current)),restored=window.__RC158_QA__.initial();window.__HAPIL_RC86_BRIDGE__.restoreEntry(restored,raw);return{zone:s.zone,phase:C.binding.phase,ego:E.snapshot(s),saved:raw.egoGuardianRC155,restored:E.snapshot(restored),next:window.__RC158_QA__.world[s.zone]?.next};});
   assert.notEqual(after.zone,'cult04');assert(after.ego.transformed&&after.ego.active&&!after.ego.pendingTransformation);assert(after.saved.active&&after.restored.active,'actual post-UI activation persists without reentering a fixture map');for(const h of victory.blackholes){assert.match(h.sprite,/assets\/rc134\/persona-skills\/vortex\.png/);assert.equal(h.color,'#ed536b');}
   if(after.zone==='village'){
    if(cfg.mode==='manual'){await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current,e=window.__RC158_QA__.anchors('village').interactionExit;s.x=e.x;s.y=e.y;});if(cfg.isMobile)await page.locator('button.interact-action').tap();else await page.locator('button.interact-action').click();}
    for(let i=0;i<120;i++){if(await page.evaluate(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.zone!=='village'))break;if(cfg.mode==='manual'&&await page.locator('#hapil-story-rc51').count())await page.keyboard.press('Enter');await page.waitForTimeout(250);}
    await page.waitForFunction(()=>window.__HAPIL_CONTROLS_V31329__.binding.state.current.zone!=='village',null,{timeout:30000});
   }
   const reverse=await page.evaluate(()=>{const s=window.__HAPIL_CONTROLS_V31329__.binding.state.current;return{zone:s.zone,ego:window.__HAPIL_EGO_GUARDIAN_RC155__.snapshot(s),next:window.__RC158_QA__.world[s.zone]?.next,terminal:!!s.hapilTerminalCompleteV31301};});assert.equal(reverse.zone,'cult04','actual village exit returns into canonical EGO reverse journey');assert(reverse.ego.active&&!reverse.terminal);assert.equal(reverse.next,'cult03');after.reverse=reverse;
   assert.deepEqual(errors,[]);await page.screenshot({path:out+'/rc163-'+cfg.name+'-after-ui.png'});results.push({name:cfg.name,victory,after});console.log('RC163_NATIVE_EGO_UI',JSON.stringify({name:cfg.name,after,method:'full-health native cult04 checkpoint; controlled native outgoing probes, one player-invulnerability fixture; actual boss callbacks/revival/real RAF and rendered manual portal or full-auto progression; no HP1/revival-consumed/completion/EGO/destination override'}));
  }catch(e){console.log('RC163_EGO_UI_FAILURE',JSON.stringify(await page.evaluate(()=>{const Q=window.__RC158_QA__,C=window.__HAPIL_CONTROLS_V31329__,s=C.binding.state.current;clearInterval(Q.egoUITimer);return{trace:{...Q.egoUI,samples:Q.egoUI?.samples.slice(-8)},zone:s.zone,time:s.time,phase:C.binding.phase,enemies:s.enemies.map(a=>({id:a.id,hp:a.hp,maxHp:a.maxHp,phase:a.phase})),inner:s.innerFinalRC133,dream:s.dreamFinalV31346,ego:s.egoGuardianRC155,flow:s.flowStateV31343,error:s.flowTransitionErrorV31343,drops:s.egoDrops,story:document.querySelector('#hapil-story-rc51')?.textContent,rotation:document.querySelector('[role="dialog"]')?.textContent};})));throw e;}finally{await page.close();}
 }
 return{results,staged:true,physicalDevice:false};
}
module.exports={run};
