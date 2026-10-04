'use strict';
// Correct the historical 44-only public QA against the unchanged deployed
// runtime. This does not replace any browser responses or game modules.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),Module=require('node:module');
const root=path.resolve(process.env.HAPIL_RC134_ROOT),file=path.join(root,'qa/rc133/published.cjs');
let code=fs.readFileSync(file,'utf8');
assert.equal(crypto.createHash('sha256').update(code).digest('hex'),'16599b0df09ea5cadd52360e50c6fb958cf4ccc1efd2fff26a98153c5c87b608','exact deployed QA source');
const replace=(from,to)=>{assert.equal(code.split(from).length-1,1,'unique public QA anchor');code=code.replace(from,to);};
replace('const expectedOutputCount = 44;', 'const expectedOutputCount = 44;\nconst expectedRuntimeCount = 53;');
replace('await page.waitForFunction(() => {','await page.waitForFunction(expectedRuntimeCount => {');
replace('d.required === 44 && d.decoded === 44','d.required === expectedRuntimeCount && d.decoded === expectedRuntimeCount');
replace('}, null, { timeout: 60000 });','}, expectedRuntimeCount, { timeout: 60000 });');
replace("{ ready: true, decoded: 44, required: 44, failed: [] }", "{ ready: true, decoded: expectedRuntimeCount, required: expectedRuntimeCount, failed: [] }");
replace("imageData.images.length, expectedOutputCount, 'runtime decoder exposes 44 output images'", "imageData.images.length, expectedRuntimeCount, 'runtime decoder exposes all 53 required outputs'");
replace("observedByFile.size, expectedOutputCount, 'runtime art paths are unique'", "observedByFile.size, expectedRuntimeCount, 'runtime art paths are unique'");
replace("const dimensions = outputRows.map(output => {", "const dimensions = outputRows.concat(personaOutputRows).map(output => {");
const personaSetup=`
    const personaManifest = JSON.parse(localBytes('assets/rc134/persona-skills/manifest.json'));
    assert.equal(personaManifest.outputs.length, 9, 'nine approved Persona crops');
    const keys = ['small-orb','eye','diamond','clock','star','eclipse','lance','shield','vortex'];
    const personaOutputRows = personaManifest.outputs.map((row,index) => {
      assert.equal(row.key,keys[index]);
      assert.equal(row.path,'assets/rc134/persona-skills/'+keys[index]+'.png');
      assert.match(row.sha256,/^[a-f0-9]{64}$/);
      assert(Array.isArray(row.size)&&row.size.length===2&&row.size.every(n=>Number.isSafeInteger(n)&&n>0));
      const bytes=localBytes(row.path);assert.equal(sha256(bytes),row.sha256);
      return {file:row.path,sha256:row.sha256,bytes:bytes.length,dimensions:row.size};
    });
`;
// The dimension observer is in a separate function: declare its approved
// Persona rows at module scope, then independently validate metadata in main.
replace('const expectedRuntimeCount = 53;', "const expectedRuntimeCount = 53;\nconst personaOutputRows=JSON.parse(fs.readFileSync(path.join(root,'assets/rc134/persona-skills/manifest.json'))).outputs.map(r=>({file:r.path,dimensions:r.size}));");
replace('const expected = new Map(fixedFiles.map(file => [file, expectedFile(file)]));', personaSetup+"\n    const expected = new Map(fixedFiles.map(file => [file, expectedFile(file)]));");
replace('for (const row of outputRows) expected.set(row.file, row);','for (const row of outputRows.concat(personaOutputRows)) expected.set(row.file, row);');
replace("expected.size, fixedFiles.length + expectedOutputCount, 'fixed files and all outputs are unique'", "expected.size, fixedFiles.length + expectedRuntimeCount, 'fixed files and all 53 outputs are unique'");
replace("assert.equal(process.env.GITHUB_SHA, testedCommit, 'GITHUB_SHA must equal the exact checkout SHA');", "assert.equal(process.env.HAPIL_EXPECTED_COMMIT, testedCommit, 'dual checkout must use exact published runtime SHA');\n    report.auditCommit=process.env.GITHUB_SHA; report.runtimeRequiredImages=expectedRuntimeCount; report.harnessCorrection='44 original art outputs plus nine approved Persona crops; runtime unchanged';");
console.log('RC136_PUBLIC_STARTUP_SOURCE',JSON.stringify({runtimeCommit:process.env.HAPIL_EXPECTED_COMMIT,auditCommit:process.env.GITHUB_SHA,sourceSha256:'16599b0df09ea5cadd52360e50c6fb958cf4ccc1efd2fff26a98153c5c87b608',approvedRequiredImages:53}));
const child=new Module(file,module);child.filename=file;child.paths=Module._nodeModulePaths(path.dirname(file));child._compile(code,file);
