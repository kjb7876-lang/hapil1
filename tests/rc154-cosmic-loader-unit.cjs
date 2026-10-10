'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{verify}=require('../tools/rc154-cosmic-loader.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f));
const input={html:read('index.html').toString(),bundle:read('assets/index-v31526.js').toString()};
for(let n=15;n<=44;n++)input['extension'+n]=read(`qa/rc133/authorized-runtime-extension-${n}.json`);
let checks=0;
assert.equal(verify(input),'exact-chained-RC155+RC152+EGO');checks++;
const patches=[
 {html:input.html.replace('index-v31526.js?v=15601','index-v31526.js?v=45001')},
 {html:input.html.replace('index-v31526.js?v=15601','index-v31526.js?v=15505')},
 {html:input.html.replace('ego-art.js?v=15606','ego-art.js?v=15603')},
 {html:input.html+' '},{bundle:input.bundle+' '},
 ...Array.from({length:30},(_,i)=>{const n=i+15;return{['extension'+n]:Buffer.concat([input['extension'+n],Buffer.from('\n')])};})
];
for(const patch of patches){assert.throws(()=>verify({...input,...patch}));checks++;}
assert.equal(verify({html:'<script src="./assets/index-v31526.js?v=45001"></script>',bundle:'historical source-only fixture'}),'historical-45001');checks++;
assert.throws(()=>verify({html:'<script src="./assets/index-v31526.js?v=45002"></script>',bundle:'historical source-only fixture',extension15:input.extension15,extension16:input.extension16,extension17:input.extension17,extension18:input.extension18,extension19:input.extension19,extension20:input.extension20}));checks++;
console.log('RC154_COSMIC_LOADER_UNIT',JSON.stringify({status:'passed',checks,scope:'Exact loader compatibility and tampered byte/pin negatives; no runtime rendering claim'}));
