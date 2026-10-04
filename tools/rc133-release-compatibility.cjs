'use strict';
// Three exact authorized revisions used by the older RC128 promotion gate.
// The full RC133 runtime guard runs first; this never changes the game under test.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='4670211fcd1a2e5076a3f9c57fc67e55cd0486a9';
const DELTA='5c079541a085b0a31b6f06a43cdfe16bdcfc9ee25e4bf87689cd3334b7980504';
const revisions=Object.freeze({
 'assets/rc91/samong-awakening.js':['e10f8ca145914fe517cbf88012b73a74a5db6c57e8bab5334993c12bb97e9f79','cfffadfdf64f93a72dd5bac30344dfb9dd3cabdb8d60ea69188b00d18f0de633'],
 'assets/combat-v31402/combat-core.js':['c718770947023a573a9b57cbefcb319940cd434029592fda51bf8d94f7822ece','135853abf9239899cd7c8df1e24c6abf4bb53d564bc9258e041be9805a0a048e'],
 'tests/rc91-samong-and-laser-smoke.cjs':['ad819358cc886f273abc508d41b4ea8fd17eae14a0364716e77e10c9322e3ddd','e8d795bbfbdb09308d6485ec1980693c313ea480eba6d47631adf6b806222c05']
});
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function validate(file,before,after){const row=revisions[file];assert(row,'Unapproved RC128 compatibility path');assert.equal(before,row[0],'RC128 compatibility preimage');assert.equal(after,row[1],'RC128 compatibility exact output');return before;}
function verify(root,migration,file,expected){
 const r=migration.report;assert.equal(r.status,'passed');assert.equal(r.base,BASE);assert.equal(r.deltaSha256,DELTA);assert.equal(r.currentRuntimeProof?.workingTreeMatches,true);assert.equal(r.currentRuntimeProof?.committedTreeMatches,true);
 const before=digest(cp.execFileSync('git',['--no-replace-objects','show',BASE+':'+file],{cwd:root}));
 const after=digest(fs.readFileSync(path.join(root,file)));assert.equal(expected,revisions[file]?.[0]);
 if(file.startsWith('assets/')){const row=r.approvedDelta.find(row=>row.file===file);assert(row,'Missing exact runtime revision');assert.equal(row.after.sha256,after,'Compatibility output differs from verified runtime');}
 return validate(file,before,after);
}
module.exports={supports:file=>Object.hasOwn(revisions,file),validate,verify,revisions};
