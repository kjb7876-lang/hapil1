const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/hapil-mobile-v31406.js','utf8');
const fn=source.match(/ function backingScale\(base\)\{[\s\S]*?\n \}/)[0];
function scale(quality,width,height,base=.6,mobile=true){const ctx={viewportBudget:{coverScale:Math.max(width/1280,height/720)},window:{visualViewport:{width,height}},innerWidth:width,innerHeight:height,options:{quality},enabled:()=>mobile,metrics:{renderCaps:0},base};vm.runInNewContext(fn+';result=backingScale(base)',ctx);return ctx.result;}
assert(!fn.includes('visualViewport'),'render frames must use cached viewport dimensions');
assert.equal(scale('balanced',375,812,.92,false),.92,'desktop unchanged');
assert.equal(scale('battery',375,812),.32,'explicit battery preserved');
assert(scale('balanced',375,812)>.7,'portrait gets enough pixels for cover');
assert(scale('balanced',375,812,.42)<scale('balanced',375,812,.6),'native load reduction preserved');
assert(scale('full',375,812)>scale('balanced',375,812),'high quality has a real improvement');
assert(scale('balanced',375,812)>scale('balanced',812,375),'portrait height drives cover budget');
assert(scale('balanced',3000,3000)<=1,'balanced pixel ceiling');
assert(scale('full',3000,3000)<=1.25,'high quality pixel ceiling');
assert(source.includes("quality:'balanced'"),'new devices default to balanced');
assert(source.includes("if(['balanced','battery','full'].includes(p.quality))options.quality=p.quality"),'saved preference preserved');
console.log('PASS: portrait cover, adaptive load, quality ceiling, desktop and saved battery preservation');
