'use strict';const fs=require('node:fs'),s=fs.readFileSync('assets/index-v31526.js','utf8');
let i=s.indexOf('window.__HAPIL_EXIT_V31327__=api;');console.log('EXIT_ADMISSION_SOURCE\n'+s.slice(Math.max(0,i-26000),i+350));
i=s.indexOf('window.__MONGSE_ENEMY_COMBAT_V31237__ = MONGSE_apiV31237;');console.log('ENEMY_PUBLIC_API\n'+s.slice(i-2100,i+120));
for(const term of ['enemyCombatRoleV31237: "melee"','enemyAttackPresentationV31237','MONGSE_effectV31237.duration']){let at=0;for(let n=0;n<3;n++){const i=s.indexOf(term,at);if(i<0)break;console.log('MELEE_SCHEMA',term,'\n'+s.slice(Math.max(0,i-450),i+500));at=i+term.length;}}
