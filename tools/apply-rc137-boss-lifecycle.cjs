'use strict';
// Reapply the narrowly scoped native producer edits to an integration worktree.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../assets/index-v31526.js');let s=fs.readFileSync(file,'utf8');
function one(before,after){if(s.includes(after))return;assert.equal(s.split(before).length,2,'native lifecycle anchor: '+before.slice(0,100));s=s.replace(before,after);}
one('dynamicBossAttackV31315:true,dynamicBossThemeV31315:p.theme,dynamicBossModeV31315:mode,dynamicBossPhaseV31315:phase(actor)', 'dynamicBossAttackV31315:true,dynamicBossZoneRC137:state.zone,dynamicBossThemeV31315:p.theme,dynamicBossModeV31315:mode,dynamicBossPhaseV31315:phase(actor)');
one('dynamicBossChargeV31315:true,dynamicBossPhaseV31315:phase(actor)', 'dynamicBossChargeV31315:true,dynamicBossZoneRC137:state.zone,dynamicBossPhaseV31315:phase(actor)');
one('if(!actor||num(actor.hp)<=0||suppressed(state)||phase(actor)!==hit.dynamicBossPhaseV31315)', 'if(!actor||num(actor.hp)<=0||num(state.hp)<=0||(hit.dynamicBossZoneRC137!==undefined&&hit.dynamicBossZoneRC137!==state.zone))');
one('const keep=actor&&actor.hp>0&&!suppressed(state)&&phase(actor)===h.dynamicBossPhaseV31315;', 'const keep=actor&&actor.hp>0&&num(state.hp)>0&&(h.dynamicBossZoneRC137===undefined||h.dynamicBossZoneRC137===state.zone);');
one('(!suppressed(state)&&state.enemies?.some(a=>a.id===e.sourceId&&a.hp>0&&phase(a)===e.dynamicBossPhaseV31315))', '(num(state.hp)>0&&(e.dynamicBossZoneRC137===undefined||e.dynamicBossZoneRC137===state.zone)&&state.enemies?.some(a=>a.id===e.sourceId&&a.hp>0))');
one('if(!valid(s,run.actor)||phase(run.actor)!==run.phase||s.zone!==run.zone)', 'if(!s.enemies?.includes(run.actor)||num(run.actor.hp)<=0||num(s.hp)<=0||s.zone!==run.zone)');
one('if(!valid(s,a,p)||phase(a)!==h.spectaclePhaseV31317)', 'if(!p||!a||num(a.hp)<=0||num(s.hp)<=0||s.zone!==h.spectacleZoneV31317)');
one('run.cue.spectaclePausedV31317=MONGSE_isEncounterLocked31226(s)||num(s.timeStopUntil)>now;', 'run.cue.spectaclePausedV31317=MONGSE_isEncounterLocked31226(s)||suppressed(s)||num(s.timeStopUntil)>now;');
one('if(MONGSE_isEncounterLocked31226(s)&&num(s.timeStopUntil)<=now&&dt>0)for(const h of owned(s,run))', 'if((MONGSE_isEncounterLocked31226(s)||suppressed(s))&&num(s.timeStopUntil)<=now&&dt>0)for(const h of owned(s,run))');
one("if(locked(s)||last!==undefined&&s.time<last){for(const c of s.bossUltimateCastsV31334||[])release(s,source(s,c),c);", "if(s.hp<=0||last!==undefined&&s.time<last){for(const c of s.bossUltimateCastsV31334||[])release(s,source(s,c),c);");
one('if(!valid(c,s.zone)||protectedActor(a)||phase(a)!==c.sourcePhase){release(s,a,c);', 'if(!valid(c,s.zone)||protectedActor(a)){release(s,a,c);');
one('if(!valid(c,s.zone)||protectedActor(a)||phase(a)!==c.sourcePhase||s.time<c.born', 'if(!valid(c,s.zone)||protectedActor(a)||s.time<c.born');
one('const freeze=Math.max(0,Math.min(s.time,num(s.timeStopUntil))-(s.time-Math.min(delta,.1)));if(freeze>0)', 'const freeze=locked(s)?Math.max(0,Math.min(delta,.1)):Math.max(0,Math.min(s.time,num(s.timeStopUntil))-(s.time-Math.min(delta,.1)));if(freeze>0)');
// Admission still limits native lasers/finales. Their shared pose fields must never
// shorten an older, independently owned delivery/recovery when a new card starts.
function deadlines(start,end,prefix,number,fields){const from=s.indexOf(start),to=s.indexOf(end,from);assert(from>=0&&to>from);let part=s.slice(from,to);for(const field of fields){const [key,expr]=field.split('='),before=prefix+'.'+field,after=prefix+'.'+key+'=Math.max('+number+'('+prefix+'.'+key+'),'+expr+')';if(part.includes(after))continue;assert.equal(part.split(before).length,2,before);part=part.replace(before,after);}s=s.slice(0,from)+part+s.slice(to);}
deadlines(' function configure(c,a,profile,s)', ' function start(s,a,type)', 'a','NUM',['activePatternUntil=c.endAt','recoverUntil=c.endAt+(a.boss?1.05:.9)','readyAt=a.recoverUntil+.1','patternReadyAt=a.readyAt+.18','atomicCastUntil31210=c.endAt']);
deadlines(' function startCustom(state, actor, pattern)', ' const oldPatterns=MONGSE_patternsForEnemy;', 'actor','NUM',['activePatternUntil=cast.endAt','recoverUntil=cast.endAt+.8','readyAt=cast.endAt+.9','patternReadyAt=cast.endAt+profile.cooldown','atomicCastUntil31210=cast.endAt']);
deadlines(" function start(s,a,kind='ultimate')", ' function release(s,a,c)', 'a','num',['activePatternUntil=c.endAt','atomicCastUntil31210=c.endAt','recoverUntil=c.endAt+cfg.recovery','readyAt=a.recoverUntil+.1','patternReadyAt=a.readyAt+.8']);
one('src.activePatternUntil=c.endAt;src.atomicCastUntil31210=c.endAt;', 'src.activePatternUntil=Math.max(NUM(src.activePatternUntil),c.endAt);src.atomicCastUntil31210=Math.max(NUM(src.atomicCastUntil31210),c.endAt);');
// Avoid letting an expiring card's presentation reset a newer same-name card.
one("if(a.activePattern===c.patternNameV31331||a.activePattern==='광맥 · '+labels[c.type])a.activePattern='';", "if(NUM(a.activePatternUntil)<=c.endAt+.001&&(a.activePattern===c.patternNameV31331||a.activePattern==='광맥 · '+labels[c.type]))a.activePattern='';");
one("if(a.activePattern===descriptor(profiles.get(c.sourceId),c.kind).name)a.activePattern='';", "if(num(a.activePatternUntil)<=c.endAt+.001&&a.activePattern===descriptor(profiles.get(c.sourceId),c.kind).name)a.activePattern='';");
// The original ordinary/telekinetic producer is still in every latest native
// authored deck. A shorter subsequent cast must preserve earlier recovery too.
one('(t.telekineticUntil = MONGSE_telekineticEndAt)', '(t.telekineticUntil = Math.max(Number(t.telekineticUntil)||0, MONGSE_telekineticEndAt))');
one('(t.recoverUntil = MONGSE_episodePatternResumeAt || f + 0.42)', '(t.recoverUntil = Math.max(Number(t.recoverUntil)||0, MONGSE_episodePatternResumeAt || f + 0.42))');
one("(t.readyAt =\n      MONGSE_episodePatternResumeAt ||\n      (MONGSE_isTelekineticRain ? f + 0.85 : f + 0.65))", "(t.readyAt = Math.max(Number(t.readyAt)||0,\n      MONGSE_episodePatternResumeAt ||\n      (MONGSE_isTelekineticRain ? f + 0.85 : f + 0.65)))");
one("(t.patternReadyAt = MONGSE_episodePatternResumeAt\n      ? MONGSE_episodePatternResumeAt\n      : MONGSE_isTelekineticRain\n        ? Math.max(f + 1.15, s + Math.max(2.4, n.cooldown - (r - 1) * 0.28))\n        : s + Math.max(2.4, n.cooldown - (r - 1) * 0.28))", "(t.patternReadyAt = Math.max(Number(t.patternReadyAt)||0, MONGSE_episodePatternResumeAt\n      ? MONGSE_episodePatternResumeAt\n      : MONGSE_isTelekineticRain\n        ? Math.max(f + 1.15, s + Math.max(2.4, n.cooldown - (r - 1) * 0.28))\n        : s + Math.max(2.4, n.cooldown - (r - 1) * 0.28)))");
fs.writeFileSync(file,s);console.log('RC137 native boss lifecycle anchors applied');
