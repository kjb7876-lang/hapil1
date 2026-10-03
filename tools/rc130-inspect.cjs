'use strict';const fs=require('node:fs'),code=fs.readFileSync('assets/index-v31526.js','utf8');
for(const expression of [/__HAPIL_RC71__\s*=/g,/__HAPIL_EXIT_V31334__\s*=/g]){for(const m of code.matchAll(expression)){console.log('\nIMPLEMENTATION '+m[0]+' at '+m.index+'\n'+code.slice(Math.max(0,m.index-18500),m.index+800));}}
console.log('\nHIT_SOUND_CALLS\n'+code.split('\n').filter(l=>/We\(|heroAttackSfx|\.hurt|hurt:/.test(l)&&/MONGSE|We\(/.test(l)).slice(-65).join('\n'));
