'use strict';
const fs=require('node:fs');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);}
const files=walk('assets').concat(walk('audio'),walk('tests'),walk('tools'));
console.log('RELEVANT_FILES\n'+files.filter(f=>/audio\/.*(?:json|md|female|male|hurt|pain|attack)|(?:rc129|rc127|contact-geometry|enemy-feel|bitmap|projectile|melee|hero-profile)/i.test(f)).join('\n'));
const code=fs.readFileSync('assets/index-v31526.js','utf8');
console.log('FUNCTION_NAMES\n'+[...code.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(x=>x[1]).filter(n=>/projectile|melee|barrage|audio|sound|voice|speed|attack|bitmap/i.test(n)).join('\n'));
for(const term of ['__HAPIL_RC86_BRIDGE__','__HAPIL_PROJECTILE_PIPELINE_V31402__','codeNativeBarrage31219','meleeOnly','meleeImpact','melee','gender','female','male','rc127MovementSpeed','__HAPIL_POLICY_RC127__.speed','__HAPIL_FEEDBACK_RC22__','renderedWidthV31355','bitmapFootprint','stationary','sourceOffsetY']){
 console.log('\nTERM '+term);let start=0;for(let k=0;k<4;k++){let i=code.indexOf(term,start);if(i<0)break;console.log('OFFSET '+i+'\n'+code.slice(Math.max(0,i-650),Math.min(code.length,i+1000)));start=i+term.length;}
}
for(const f of files.filter(f=>/\.(?:json|md)$/.test(f)&&/audio/.test(f))){console.log('\nAUDIO_METADATA '+f+'\n'+fs.readFileSync(f,'utf8').slice(0,12000));}
