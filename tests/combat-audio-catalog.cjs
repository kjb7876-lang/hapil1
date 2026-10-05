'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),catalog=require('./lib/combat-audio-catalog.cjs')(root),{isSafeRegisteredPath,rc141EffectPaths}=require('./lib/combat-audio-catalog.cjs');
assert.equal(Object.keys(catalog.music).length,5,'reviewed music catalog size');
assert.equal(Object.keys(catalog.effects).length,40,'reviewed effect catalog includes RC133 plus seven approved RC141 SFX');
assert.equal(Object.keys(rc141EffectPaths).length,7,'exact RC141 approved SFX count');
for(const p of Object.values(rc141EffectPaths))assert.equal(isSafeRegisteredPath(p),true,'approved RC141 SFX path');
for(const p of [
 './delivery/additional-audio13-20261005/processed/sfx-candidate/unreviewed.ogg',
 './delivery/additional-audio13-20261005/processed/sfx-candidate/Short_game_menu_navi__4-1791000546558-2a2600cc.mp3',
 './delivery/additional-audio13-20261005/processed/music-candidate/Temporal_Stutter-06e65f6e.mp3',
 './delivery/additional-audio13-20261005/originals/Short_female_combat.wav',
 './delivery/additional-audio13-20261005/processed/sfx-candidate/../menu.ogg',
 'https://example.invalid/audio.ogg'
])assert.equal(isSafeRegisteredPath(p),false,'unapproved or unsafe path stays blocked: '+p);
console.log(JSON.stringify({status:'passed',music:Object.keys(catalog.music).length,effects:Object.keys(catalog.effects).length,rc141Approved:Object.keys(rc141EffectPaths).length,unapprovedPathChecks:6}));
