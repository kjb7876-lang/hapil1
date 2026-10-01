const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/combat-v31412/skill-completion.js','utf8');
const current=source.slice(source.indexOf('  const castFieldMatch'),source.indexOf('  function enemyCastActive'));
const setup="const now=0,finite=v=>Number.isFinite(Number(v))?Number(v):0,idOf=v=>String(v?.id??v?.sourceId??'');";
function load(code){const c={};vm.runInNewContext(setup+code+';check=castUntil',c);return c.check;}
const before=load("  function castUntil(state, actor) {\n    const t = finite(state?.time ?? now);\n    const times = [\n      actor?.skillCastLockUntilV31412,\n      actor?.attackAt,\n      actor?.attackImpactAt,\n      actor?.activePatternUntil,\n      actor?.atomicCastUntil31210,\n      actor?.castVisualUntil31210,\n      actor?.telekineticUntil,\n      actor?.cosmicPoseUntilV31318,\n      actor?.laserCastUntilV31332,\n      actor?.finaleCastUntilV31334,\n      actor?.skillCastEndAt,\n    ].map(finite);\n    for (const [key, value] of Object.entries(actor ?? {})) {\n      if (/(?:cast|beam|pose|telekinetic|rift).*(?:until|endat)$/i.test(key)) {\n        const n = finite(value);\n        if (n > t && n < t + 30) times.push(n);\n      }\n    }\n    for (const key of ['narrativeCasts','telekineticCasts','spatialRiftCasts','bossUltimateCastsV31334','cosmicCastsV31318']) {\n      for (const cast of state?.[key] ?? []) {\n        if (idOf(cast) !== idOf(actor)) continue;\n        const end = Math.max(finite(cast.endAt), finite(cast.end), finite(cast.fireAt) + finite(cast.activeSeconds));\n        if (end > t) times.push(end);\n      }\n    }\n    return Math.max(0, ...times.filter((v) => v > t && v < t + 30));\n  }\n"),after=load(current);
let checks=0;for(let i=0;i<400;i++){const a={id:'boss',attackAt:i%2?105:140,skillCastLockUntilV31412:103},s={time:100,narrativeCasts:[{sourceId:'boss',fireAt:104,activeSeconds:5}],spatialRiftCasts:[{sourceId:'other',endAt:115}]};for(let k=0;k<300;k++)a['unrelated'+k]=k;
 a['newBeamEndAt'+i]=100+i%40;assert.equal(after(s,a),before(s,a));checks++;
 a.attackAt=112;a['newBeamEndAt'+i]=118;assert.equal(after(s,a),before(s,a),'same tick mutation');checks++;
 s.narrativeCasts[0].endAt=121;s.time=108;assert.equal(after(s,a),before(s,a));checks++;
 delete a['newBeamEndAt'+i];assert.equal(after(s,a),before(s,a));checks++;
}
console.log('RC105 PASS: '+checks+' live cast timing comparisons, including same-tick mutation.');
