'use strict';
const fs=require('node:fs');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);}
const code=fs.readFileSync('assets/index-v31526.js','utf8'),lines=code.split('\n');
console.log('AUDIO_FILES\n'+walk('audio').filter(p=>!/narration|story|bgm|voiceover|monologue/i.test(p)).join('\n'));
const terms=['function MONGSE_spawnNormalEnemyProjectileV31237','function MONGSE_shouldExpireNormalEnemyProjectileV31237','function MONGSE_sanitizeNormalProjectileV31237','__MONGSE_ENEMY_COMBAT_V31237__ =','function MONGSE_beginProjectileEgress31215','function MONGSE_tickProjectileEgress31215','function HAPIL_finalDanmakuBitmapRC71','function HAPIL_projectileDispatchV31402','function HAPIL_drawProjectileRC13','exitEvidence(','MONGSE_heroAttackSfx','heroHurt','hurtSfx','MONGSE_SFX =','function audio(','__HAPIL_ENEMY_FEEL_V31361__','__HAPIL_RC86_BRIDGE__','__HAPIL_POLICY_RC127__.speed','__HAPIL_RC91','__HAPIL_SAMONG'];
for(const term of terms){console.log('\nLOCATIONS '+term);let at=0,count=0;while((at=code.indexOf(term,at))>=0&&count++<8){const line=code.slice(0,at).split('\n').length;console.log('line '+line+' offset '+at+' '+code.slice(at,at+180));at+=term.length;}}
for(const term of ['function HAPIL_finalDanmakuBitmapRC71','function HAPIL_projectileDispatchV31402','function MONGSE_spawnNormalEnemyProjectileV31237','MONGSE_SFX =']){let i=code.indexOf(term);if(i>=0)console.log('\nSOURCE '+term+'\n'+code.slice(i,i+8000));}
console.log('\nBUNDLE_TAIL\n'+lines.slice(-65).join('\n'));
