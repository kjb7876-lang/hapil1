'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='41d9d75ffffd9b4a2d8f51c90a8a08946f021864';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function verify(root){
 const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});
 if(cp.spawnSync('git',['cat-file','-e',BASE+':index.html'],{cwd:root,stdio:'ignore'}).status!==0)exec('git',['fetch','--no-tags','--depth=1','origin',BASE]);
 const files=['index.html','assets/index-v31526.js','assets/rc23/feedback.js','assets/rc128/combat-feedback.js'];
 const unchanged=['assets/rc77','assets/rc127','assets/rc129','assets/rc43/bloodied-flight.js','assets/combat-v31412/skill-completion.js','assets/story-narration','assets/rc49/story-voice.js','assets/rc51/story.js','data/story-rc51.js','data/opening-voice-rc74.json'];
 const changedProtected=exec('git',['diff','--name-only',BASE,'--',...unchanged]).trim();assert.equal(changedProtected,'','Protected gameplay/narration source differs from starting main');
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc130-preservation-')),historical={},rows=[];
 const put=(file,text)=>{const p=path.join(scratch,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
 try{
  for(const file of files){historical[file]=exec('git',['show',BASE+':'+file]);put(file,historical[file]);}
  for(const file of ['tools/rc130-apply.cjs','tools/rc130-ordnance.cjs','assets/rc130/audio-policy.js'])put(file,fs.readFileSync(path.join(root,file)));
  exec(process.execPath,['tools/rc130-apply.cjs'],scratch);exec(process.execPath,['tools/rc130-ordnance.cjs'],scratch);
  for(const file of [...files,'assets/rc130/audio-policy.js']){const expected=digest(fs.readFileSync(path.join(scratch,file))),actual=digest(fs.readFileSync(path.join(root,file)));rows.push({file,expected,actual});assert.equal(actual,expected,'Unexpected change outside exact RC130 integration: '+file);}
  return{historical,report:{status:'passed',base:BASE,method:'Reapply exact anchored RC130 integration to the pinned original in a disposable directory; compare full bytes. Runtime under test is never substituted.',files:rows,protectedPaths:unchanged}};
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
module.exports={verify,BASE};
if(require.main===module)console.log('RC130_PRESERVATION_RESULT',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
