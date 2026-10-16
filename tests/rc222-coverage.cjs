'use strict';
// Contract/inventory fixtures only. This is not a natural 61-map / 71-owner playthrough.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function dependency(name){for(const prefix of [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,process.env.NODE_PATH,'/tmp/hapil1-rc221-runtime/node_modules'].filter(Boolean)){try{return require(path.join(prefix,name));}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}}return require(name);}
function inventory(){
 const acorn=dependency('acorn'),source=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');
 const expression=(marker, offset=marker.length)=>{const start=source.indexOf(marker);assert(start>=0,`native source marker: ${marker}`);let node=acorn.parseExpressionAt(source,start+offset,{ecmaVersion:'latest'});return node.type==='SequenceExpression'?node.expressions[0]:node;};
 const value=node=>node.type==='Literal'?node.value:node.type==='TemplateLiteral'&&node.expressions.length===0?node.quasis[0].value.cooked:undefined;
 const world=expression('  N = {\n    hub:',6),heroNodes=expression('  F = [\n    {\n      id: `hwando`',6),sourceMaps=new Set(world.properties.map(p=>p.key.name||value(p.key)));
 for(const match of source.matchAll(/^N\.([A-Za-z0-9_]+)\s*=/gm))sourceMaps.add(match[1]);
 const nativeHeroIds=heroNodes.elements.map(node=>value(node.properties.find(p=>(p.key.name||value(p.key))==='id').value));
 const policy=require(path.join(root,'assets/foundation-v31400/policy.js')),heroes=[...policy.ids];assert(heroes.every(id=>nativeHeroIds.includes(id)));
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/story-rc51.js'),'utf8'),sandbox);
 const records=JSON.parse(JSON.stringify(sandbox.window.__HAPIL_STORY_DATA_RC51__.records));
 const owners=JSON.parse(fs.readFileSync(path.join(root,'qa/rc206/all-ranked-source.json'),'utf8'));
 return {heroes,modes:['STORY','DREAM'],legacyModes:['HELL'],maps:records.map(row=>({id:row.zone,kind:row.rest?'rest':'combat',title:row.title||row.zone,source:'data/story-rc51.js#records',inNativeWorld:sourceMaps.has(row.zone),nativeEntryTested:false,naturalPlaythrough:false})),auxiliaryMaps:['hub','village'],legacyMap:'ep1a07',nativeWorldKeys:[...sourceMaps],owners:owners.map(row=>({id:row.id,zone:row.zone,name:row.name,activeAuthoredMap:records.some(record=>record.zone===row.zone),source:'qa/rc206/all-ranked-source.json',fixtureKind:row.actor?'source-literal-or-factory':'explicit-identity-geometry',liveEncounterTested:false,naturalDefeat:false})),nativeSourceSha256:crypto.createHash('sha256').update(source).digest('hex')};
}
function verifyInventory(data){
 assert.equal(data.maps.length,61,'61 authored map records');assert.equal(data.maps.filter(r=>r.kind==='rest').length,6,'six authored rest records');
 assert.equal(new Set(data.maps.map(r=>r.id)).size,61);assert(data.maps.every(r=>r.inNativeWorld),'every authored map has a native world definition');
 assert.equal(data.owners.length,71,'71 combat owners');assert.equal(new Set(data.owners.map(r=>r.id)).size,71);assert.deepEqual(data.owners.filter(r=>!r.activeAuthoredMap).map(r=>r.id),['mb-ep1a07'],'legacy owner is explicitly retained in the historical scheduling roster');
 assert.equal(data.heroes.length,8);assert.equal(new Set(data.heroes).size,8);assert(!data.maps.some(r=>r.id===data.legacyMap),'removed ep1a07 is not an authored map');
 const transport=require(path.join(root,'assets/rc222/transport.js'));assert.deepEqual(new Set(transport.heroes.map(r=>r[0])),new Set(data.heroes),'transport/native hero catalogs agree');
 return data;
}
module.exports={inventory,verifyInventory};
if(require.main===module){const startedAt=new Date().toISOString(),out=process.env.HAPIL_QA_OUTPUT||'/tmp/rc222-coverage';fs.mkdirSync(out,{recursive:true});const report={schema:1,status:'running',startedAt,sha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),scope:'CPU source inventory and transport catalog contract; no browser, real Internet, natural traversal, or combat outcome claim',scopes:{inventory:true,snapshotContract:false,browser:false,realFourNetworks:false,naturalCampaign:false},failures:[]};try{if(process.env.EXPECTED_SHA)assert.equal(report.sha,process.env.EXPECTED_SHA);report.inventory=verifyInventory(inventory());report.status='passed';}catch(error){report.status='failed';report.failures.push(error.stack||String(error));process.exitCode=1;}finally{report.endedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'coverage.json'),JSON.stringify(report,null,2));console.log('RC222_COVERAGE '+JSON.stringify({status:report.status,sha:report.sha,maps:report.inventory?.maps.length,owners:report.inventory?.owners.length,heroes:report.inventory?.heroes.length,report:path.join(out,'coverage.json'),failures:report.failures}));}}
