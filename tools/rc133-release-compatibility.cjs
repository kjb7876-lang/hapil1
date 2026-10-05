'use strict';
// Three exact authorized revisions used by the older RC128 promotion gate.
// The full RC133 runtime guard runs first; this never changes the game under test.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const BASE='4670211fcd1a2e5076a3f9c57fc67e55cd0486a9';
const DELTA='b033be04ed255c949526350cbd40506082192f92f21ed58b999a019cd8bd1ee0';
const revisions=Object.freeze({
 'assets/rc91/samong-awakening.js':['e10f8ca145914fe517cbf88012b73a74a5db6c57e8bab5334993c12bb97e9f79','a277787a2f8917a26f21dbb49dc51802cb9faf176b0c3889726be761842a4b65'],
 'assets/combat-v31402/combat-core.js':['c718770947023a573a9b57cbefcb319940cd434029592fda51bf8d94f7822ece','c2962da4b5491182da367c2153646312c333aed4f37344866882c47502b4478f'],
 'tests/rc91-samong-and-laser-smoke.cjs':['ad819358cc886f273abc508d41b4ea8fd17eae14a0364716e77e10c9322e3ddd','71e2efdd149267bd24ba89c5f2d77602420eb612c646d27ce539a9e2805694e3']
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
