'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {verifyFiles}=require('../tools/rc133-preservation.cjs');const root=fs.mkdtempSync(path.join(os.tmpdir(),'rc133-guard-negative-'));let checks=0;
const blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const values={'index.html':'reviewed loader\n','assets/unchanged.js':'untouched source\n','assets/rc133/authorized.js':'exact authorized delta\n','audio/owned.ogg':'approved media bytes','data/story.js':'preserved text'};
const expected=Object.entries(values).map(([file,text])=>({file,mode:'100644',gitBlob:blob(Buffer.from(text))}));
function reset(){for(const p of fs.readdirSync(root))fs.rmSync(path.join(root,p),{recursive:true,force:true});for(const [file,text]of Object.entries(values)){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);fs.chmodSync(path.join(root,file),0o644);}}
function deny(name,edit){reset();edit();assert.throws(()=>verifyFiles(root,expected),undefined,name);checks++;}
try{
 reset();assert.equal(verifyFiles(root,expected).checkedFiles,5);checks++;
 deny('unapproved old-byte edit',()=>fs.appendFileSync(path.join(root,'assets/unchanged.js'),'mutation'));
 deny('approved path does not permit arbitrary output bytes',()=>fs.appendFileSync(path.join(root,'assets/rc133/authorized.js'),'mutation'));
 deny('missing protected file',()=>fs.unlinkSync(path.join(root,'data/story.js')));
 deny('untracked file in new namespace',()=>fs.writeFileSync(path.join(root,'assets/rc133/extra.js'),'new'));
 deny('extra empty directory',()=>fs.mkdirSync(path.join(root,'assets/extra')));
 deny('mode change',()=>fs.chmodSync(path.join(root,'audio/owned.ogg'),0o755));
 deny('symlink replacement',()=>{fs.unlinkSync(path.join(root,'assets/unchanged.js'));fs.symlinkSync('../index.html',path.join(root,'assets/unchanged.js'));});
 deny('loader modification',()=>fs.appendFileSync(path.join(root,'index.html'),'script'));
 console.log('RC133_PRESERVATION_UNIT',JSON.stringify({status:'passed',checks,scope:'Exact working inventory/bytes/modes and negative cases; detached full baseline proof is a separate exact-commit check'}));
}finally{fs.rmSync(root,{recursive:true,force:true});}
