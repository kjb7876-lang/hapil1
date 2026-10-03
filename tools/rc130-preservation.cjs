'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='41d9d75ffffd9b4a2d8f51c90a8a08946f021864';
const NARRATION='2ed3c206c9a0b52f6ee1547727442ce5069d2044';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function verify(root){
 const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});
 const ensure=ref=>{if(cp.spawnSync('git',['cat-file','-e',ref+':index.html'],{cwd:root,stdio:'ignore'}).status!==0)exec('git',['fetch','--no-tags','--depth=1','origin',ref]);};
 ensure(BASE);
 const files=['index.html','assets/index-v31526.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js'];
 const unchanged=['assets/rc77','assets/rc127','assets/rc129','assets/rc43/bloodied-flight.js','assets/combat-v31412/skill-completion.js','assets/story-narration','assets/rc49/story-voice.js','assets/rc51/story.js','data/story-rc51.js','data/opening-voice-rc74.json'];
 const changedProtected=exec('git',['diff','--name-only',BASE,'--',...unchanged]).trim().split('\n').filter(Boolean).sort();
 let narration=null;
 if(changedProtected.length){
  // The independent four-scene correction passed its complete exact-commit
  // gate. Permit those immutable bytes only; all runtime/source protection stays.
  ensure(NARRATION);
  const approved=exec('git',['diff','--name-only',BASE,NARRATION,'--','assets/story-narration']).trim().split('\n').filter(Boolean).sort();
  assert.equal(approved.length,9,'Expected one correction manifest and eight immutable audio assets');
  assert(approved.every(file=>file==='assets/story-narration/v1/manifest.json'||/^assets\/story-narration\/v1\/audio\/[a-z0-9-]+\.mp3$/.test(file)),'Narration reference includes unexpected runtime changes');
  assert.deepEqual(changedProtected,approved,'Protected gameplay/narration source differs outside exact accepted correction');
  const rows=approved.map(file=>{
   const expected=crypto.createHash('sha256').update(cp.execFileSync('git',['show',NARRATION+':'+file],{cwd:root,maxBuffer:32*1024*1024})).digest('hex');
   const actual=digest(fs.readFileSync(path.join(root,file)));assert.equal(actual,expected,'Narration correction differs: '+file);return{file,expected,actual};
  });
  const before=exec('git',['show',BASE+':index.html']),after=exec('git',['show',NARRATION+':index.html']);
  const tag=/    <script src="\.\/assets\/story-narration\/v1\/player\.js\?v=\d+"><\/script>/g;
  const from=[...before.matchAll(tag)],to=[...after.matchAll(tag)];assert.equal(from.length,1);assert.equal(to.length,1);
  assert.equal(after,before.replace(from[0][0],to[0][0]),'Independent narration HTML edit must be its cache key only');
  narration={reference:NARRATION,from:from[0][0],to:to[0][0],files:rows};
 }
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc130-preservation-')),historical={},rows=[];
 const put=(file,text)=>{const p=path.join(scratch,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
 try{
  for(const file of files){historical[file]=exec('git',['show',BASE+':'+file]);put(file,historical[file]);}
  for(const file of ['tools/rc130-apply.cjs','tools/rc130-ordnance.cjs','assets/rc130/audio-policy.js'])put(file,fs.readFileSync(path.join(root,file)));
  exec(process.execPath,['tools/rc130-apply.cjs'],scratch);exec(process.execPath,['tools/rc130-ordnance.cjs'],scratch);
  if(narration){const file='index.html',text=fs.readFileSync(path.join(scratch,file),'utf8');assert.equal(text.split(narration.from).length,2);put(file,text.replace(narration.from,narration.to));}
  const combat=fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/combat-audio/v1/catalog.js');
  if(combat){put('tools/combat-audio-apply.cjs',fs.readFileSync(path.join(root,'tools/combat-audio-apply.cjs')));exec(process.execPath,['tools/combat-audio-apply.cjs'],scratch);}
  const rc131=fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/rc131/audio-cues.js');
  if(rc131){put('tools/rc131-apply.cjs',fs.readFileSync(path.join(root,'tools/rc131-apply.cjs')));exec(process.execPath,['tools/rc131-apply.cjs'],scratch);}
  for(const file of [...files,'assets/rc130/audio-policy.js']){const expected=digest(fs.readFileSync(path.join(scratch,file))),actual=digest(fs.readFileSync(path.join(root,file)));rows.push({file,expected,actual});assert.equal(actual,expected,'Unexpected change outside exact RC130 integration: '+file);}
  return{historical,report:{status:'passed',base:BASE,method:'Reapply exact anchored RC130 integration and independently hash-verified narration correction in a disposable directory; compare full bytes. Runtime under test is never substituted.',files:rows,protectedPaths:unchanged,independentNarrationMigration:narration,independentCombatAudioMigration:combat?{helperSha256:digest(fs.readFileSync(path.join(root,'tools/combat-audio-apply.cjs'))),scope:'19 exact audio hooks and three loaders; full runtime bytes reproduced'}:null}};
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
module.exports={verify,BASE};
if(require.main===module)console.log('RC130_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
