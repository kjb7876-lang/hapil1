'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),assert=require('assert/strict'),crypto=require('crypto');
const BASE='a624e894788a8a1c21d6ca611299985d62eaf97e';const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function verify(root){
 const git=(...a)=>cp.execFileSync('git',a,{cwd:root,encoding:'utf8',maxBuffer:48*1024*1024});
 try{git('cat-file','-e',BASE+':index.html');}catch{git('fetch','--no-tags','--depth=1','origin',BASE);}
 const delta=JSON.parse(fs.readFileSync(path.join(root,'tools/rc132-runtime-delta.json'),'utf8'));assert.equal(delta.base,BASE);assert.equal(delta.rows.length,3);
 const allowed=['assets/index-v31526.js','assets/combat-v31412/outgoing-native.js','index.html','assets/rc132/dream-balance.js'];
 const changed=git('diff','--name-only',BASE,'HEAD','--','assets','audio','data','index.html').trim().split('\n').filter(Boolean).sort();assert.deepEqual(changed,allowed.slice().sort(),'unrelated runtime/audio/narration changes are not allowed');
 for(const row of delta.rows){let expected=git('show',BASE+':'+row.file);assert.equal(digest(expected),row.beforeSha256);for(const op of row.operations){assert.equal(expected.split(op.from).length-1,1,'unique exact replacement '+row.file);expected=expected.replace(op.from,op.to);}const actual=fs.readFileSync(path.join(root,row.file),'utf8');assert.equal(digest(expected),row.afterSha256);assert.equal(actual,expected,'actual runtime must equal reconstructed code '+row.file);}
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-rc132-baseline-')),baseline=path.join(directory,'baseline');
 try{
  git('worktree','add','--detach',baseline,BASE);
  // Run the unchanged historical verifier on the exact prior tree, never on
  // a substituted game under browser tests. Actual current runtime was checked above.
  const historical=require(path.join(baseline,'tools/rc130-preservation.cjs')).verify(baseline);
  return{historical:historical.historical,report:{status:'passed',base:BASE,method:'Exact minimal transformations plus all-runtime diff scope; unchanged historical baseline proof retained separately',runtimeChanges:changed,files:delta.rows.map(r=>({file:r.file,before:r.beforeSha256,after:r.afterSha256})),historicalProof:historical.report}};
 }finally{try{git('worktree','remove','--force',baseline);}finally{fs.rmSync(directory,{recursive:true,force:true});}}
}
module.exports={verify,BASE};if(require.main===module)console.log('RC132_PRESERVATION',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
