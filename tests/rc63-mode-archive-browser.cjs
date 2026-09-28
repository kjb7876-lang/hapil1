// RC63: verify all three launch modes and the canonical uploaded-text archive.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');

const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}
  try{
    res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));
  }catch{res.statusCode=404;res.end();}
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    for(const mode of ['STORY','HELL','DREAM']){
      const context=await browser.newContext({viewport:{width:1280,height:900}});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>typeof window.__HAPIL_PARTY_UI_V31322__?.open==='function');
      const setter=await page.evaluate(()=>typeof window.__HAPIL_PARTY_LAUNCH_V31322__?.setGameMode);
      assert.equal(setter,'function','the live launch bridge must expose the selected mode');
      const preselected=await page.evaluate(value=>({returned:window.__HAPIL_PARTY_LAUNCH_V31322__.setGameMode(value),selected:window.__HAPIL_PARTY_LAUNCH_V31322__.getGameMode()}),mode);
      assert.deepEqual(preselected,{returned:mode,selected:mode});
      await page.evaluate(()=>window.__HAPIL_PARTY_UI_V31322__.open());
      const dialog=page.locator('#hapil-party-dialog');
      await dialog.getByLabel('게임 모드').selectOption(mode);
      await dialog.getByRole('button',{name:'적용하고 돌아가기',exact:true}).click();
      await page.waitForFunction(()=>window.__MONGSE_QA_STATE__?.zone==='dist00',undefined,{timeout:20000});
      const runtime=await page.evaluate(()=>{
        const s=window.__MONGSE_QA_STATE__;
        return {mode:s.gameModeV31346,hell:s.hellModeV31322===true||window.__HAPIL_HELL_V31322__?.enabled?.()===true,
          storyEnabled:window.__HAPIL_STORY_RC51__?.enabled(s)===true,
          dreamActors:(s.enemies??[]).filter(a=>a.hp>0).every(a=>a.dreamAwakenedV31346===true),
          savedMode:localStorage.getItem('hapil.gameMode.v31346'),
          preference:JSON.parse(localStorage.getItem('hapil.party.preferences.v31322')||'{}').gameMode,
          launchMode:window.__HAPIL_PARTY_LAUNCH_V31322__?.getGameMode?.()};
      });
      assert.equal(runtime.mode,mode,`${mode} must survive actual launch configuration`);
      assert.equal(runtime.hell,mode!=='STORY',`${mode} legacy combat gate must agree`);
      assert.equal(runtime.storyEnabled,mode==='STORY',`${mode} must gate field monologue correctly`);
      assert.equal(runtime.dreamActors,mode==='DREAM',`${mode} Dream awakening must be isolated`);
      assert.equal(runtime.savedMode,mode);
      assert.equal(runtime.preference,mode);
      if(mode==='STORY'){
        await page.waitForSelector('#hapil-story-rc51[data-phase="pre"]');
      }else{
        assert.equal(await page.locator('#hapil-story-rc51').count(),0,`${mode} must not show field monologue`);
      }
      const archive=await page.evaluate(()=>{
        const rows=window.__HAPIL_PATIENT_DATA_RC51__.records;
        const all=new Set(rows.map(r=>r.zone));
        return window.__HAPIL_MODES_V31346__.archive.entries({zone:'dreamRest',frontierZone:'cult04',completedZones:all});
      });
      const archiveShape=archive.map(row=>({zone:row.zone,title:row.title,text:row.text}));
      const canonical=await page.evaluate(()=>window.__HAPIL_PATIENT_DATA_RC51__.records.map(r=>({
        zone:r.zone,title:r.title,text:[r.entry,r.body].filter(Boolean).join('\n\n')
      })));
      assert.deepEqual(archiveShape,canonical,`${mode} refuge archive must use only the complete canonical upload`);
      assert.equal(archive.length,62,`${mode} archive must include the uploaded prologue plus all 61 numbered records`);
      assert(archive.every(row=>row.text.trim()),`${mode} archive may not contain empty legacy placeholders`);
      assert.deepEqual(errors,[],`${mode} browser errors`);
      console.log(`RC63 PASS ${mode}: launch, mode-specific gates, saved preference, and ${archive.length}-record first-person archive.`);
      await context.close();
    }
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
