'use strict';
// Historical HTML projection uses immutable, chained transactions in full.
// Never normalize arbitrary current text or ignore unrecognized loader bytes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
module.exports=function restoreApprovedHTML(html){
 const m=JSON.parse(fs.readFileSync(path.join(root,'qa/rc210/html-migration.json')));assert.equal(m.base,'9704fdb295a240605dbeb0045c224df8fe4f6ccd');let out=html;
 const chain=require('./rc206-extension-chain.cjs')(root);
 for(const extension of chain.reverse()){
  if(hash(out)===m.afterSha256)break;
  const row=extension.files.find(r=>r.file==='index.html');if(!row)continue;
  // Only the exact output of this pinned transaction may be reversed.
  if(hash(out)!==row.after.sha256)continue;
  assert.equal(row.before.mode,'100644');
  const before=cp.execFileSync('git',['cat-file','blob',row.before.gitBlob],{cwd:root,encoding:'utf8'});
  assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+Buffer.byteLength(before)+'\0'),Buffer.from(before)])).digest('hex'),row.before.gitBlob);
  out=before;
 }
 assert.equal(hash(out),m.afterSha256,'exact RC210 HTML before historical normalization');
 for(const row of m.changes){assert.equal(out.split(row.after).length-1,1,'unique exact authorized HTML delta');out=out.replace(row.after,row.before);}
 assert.equal(hash(out),m.beforeSha256,'exact approved9704 HTML restored');return out;
};
