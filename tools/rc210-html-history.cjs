'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const file=path.join(__dirname,'../qa/rc210/html-migration.json');
module.exports=function restoreApprovedHTML(html){const m=JSON.parse(fs.readFileSync(file));assert.equal(m.base,'9704fdb295a240605dbeb0045c224df8fe4f6ccd');assert.equal(hash(html),m.afterSha256,'exact RC210 HTML before historical normalization');let out=html;for(const row of m.changes){assert.equal(out.split(row.after).length-1,1,'unique exact authorized HTML delta');out=out.replace(row.after,row.before);}assert.equal(hash(out),m.beforeSha256,'exact approved9704 HTML restored');return out;};
