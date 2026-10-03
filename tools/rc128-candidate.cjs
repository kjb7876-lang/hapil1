'use strict';
// Builds a candidate in memory. The public runtime is unchanged until these exact
// outputs are promoted after verification. No network calls or workflow edits.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const FILES=['index.html','assets/rc91/samong-awakening.js','assets/combat-v31402/combat-core.js','assets/rc23/feedback.js','tests/rc91-samong-and-laser-smoke.cjs'];
function one(s,from,to,label){assert.equal(s.split(from).length-1,1,'RC128 exact anchor: '+label);return s.replace(from,to);}
function build(root){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),output={};
 if(read('assets/rc91/samong-awakening.js').includes('/* RC128_INTEGRATED */'))return Object.fromEntries(FILES.map(f=>[f,read(f)]));
 let s=read('assets/rc91/samong-awakening.js');
 s='/* RC128_INTEGRATED */\n'+s;
 s=one(s,'m.active=DURATION;m.cooldown=COOLDOWN;',"if(window.__HAPIL_AWAKENING_POLICY_RC128__&&!window.__HAPIL_AWAKENING_POLICY_RC128__.claim(s,m))return false;\n  m.active=DURATION;m.cooldown=COOLDOWN;",'atomic encounter claim');
 s=one(s,'window.__HAPIL_DAMAGE_RC108__?.egoEntered(s,beforeUntil>s.time,beforeUntil,s.awakeningUntil);','window.__HAPIL_DAMAGE_RC108__?.egoEntered(s,beforeUntil>s.time,beforeUntil,s.awakeningUntil);\n  window.__HAPIL_AWAKENING_POLICY_RC128__?.ownEgo(s,m,beforeUntil,s.awakeningUntil);','own only the revival EGO deadline');
 s=one(s,"picture(m.heroId);\n  window.__HAPIL_COMBAT_CORE_V31401__", "picture(m.heroId);\n  window.__HAPIL_FEEDBACK_RC128__?.awakening(s,m);\n  window.__HAPIL_COMBAT_CORE_V31401__",'awakening feedback after successful revival');
 s=one(s,'function advance(s,dt,blocked){\n  if(!s', 'function advance(s,dt,blocked){\n  if(s?.samongPassiveRC91)window.__HAPIL_AWAKENING_POLICY_RC128__?.sync(s,s.samongPassiveRC91,enabled(s));\n  if(!s','mode and encounter cleanup even outside DREAM');
 s=one(s,'if(m.active<1e-8){m.active=0;m.grace=0;}','if(m.active<1e-8){m.active=0;m.grace=0;}\n  window.__HAPIL_AWAKENING_POLICY_RC128__?.sync(s,m,true);','unscaled seven-second EGO cleanup');
 s=one(s,'ready:enabled(s)&&n(m?.cooldown)<=1e-8','ready:enabled(s)&&n(m?.cooldown)<=1e-8&&!m?.encounterRC128?.used,reviveUsed:m?.encounterRC128?.used===true','truthful spent-charge status');
 s=one(s,'heroId:HEROES.includes(m.heroId)?m.heroId:null,','heroId:HEROES.includes(m.heroId)?m.heroId:null,encounterRC128:window.__HAPIL_AWAKENING_POLICY_RC128__?.snapshot(s,m)??null,','save encounter ownership');
 s=one(s,'heroId:HEROES.includes(raw.heroId)?raw.heroId:null,','heroId:HEROES.includes(raw.heroId)?raw.heroId:null,encounterRC128:window.__HAPIL_AWAKENING_POLICY_RC128__?.sanitize(raw.encounterRC128)??null,','sanitize encounter ownership');
 s=one(s,'restoreVitals(s,data);picture(s.samongPassiveRC91.heroId||s.activeHeroId);','window.__HAPIL_AWAKENING_POLICY_RC128__?.restore(s,s.samongPassiveRC91,data.encounterRC128);\n  restoreVitals(s,data);picture(s.samongPassiveRC91.heroId||s.activeHeroId);','restore charge without granting a new one');
 s=one(s,"m.cooldown>0?'死夢覺醒 · '+Math.ceil(m.cooldown)+'초':'死夢覺醒 · 위기 부활 준비'","m.encounterRC128?.used?'死夢覺醒 · 이 전투의 부활 사용 완료':m.cooldown>0?'死夢覺醒 · '+Math.ceil(m.cooldown)+'초':'死夢覺醒 · 위기 부활 준비'",'fallback HUD reflects spent charge');
 s=one(s,"const k=ctx.getTransform?.().a||1;if(!drawMobile(s,canvas)&&window.__HAPIL_COMBAT_INFO_RC108__?.eligible?.()!==true)draw(ctx,s,canvas.width/k,canvas.height/k);","const k=ctx.getTransform?.().a||1;",'do not grayscale the awakening portrait');
 s=one(s,'if(active(s)||plot){ctx.save();','if(active(s)){ctx.save();','DREAM monochrome precedes owner color');
 s=one(s,"ctx.drawImage(canvas,0,0);}finally{ctx.restore();}}}return result;};","ctx.drawImage(canvas,0,0);}finally{ctx.restore();}}\n   if(window.__HAPIL_FEEDBACK_RC128__)window.__HAPIL_FEEDBACK_RC128__.draw(ctx,s,canvas,settings);\n   else if(!drawMobile(s,canvas)&&window.__HAPIL_COMBAT_INFO_RC108__?.eligible?.()!==true)draw(ctx,s,canvas.width/k,canvas.height/k);\n   if(plot){ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.filter='grayscale(1) contrast(1.08)';ctx.drawImage(canvas,0,0);}finally{ctx.restore();}}\n  }return result;};",'DREAM owner colors and STORY final monochrome remain separate');
 output['assets/rc91/samong-awakening.js']=s;
 s=read('assets/combat-v31402/combat-core.js');
 s=one(s,'stats.published++;','stats.published++;\n    // Presentation failures cannot interrupt a committed damage transaction.\n    try{root.__HAPIL_FEEDBACK_RC128__?.record(s,a,row,tx.source);}catch(error){stats.feedbackFaults=(stats.feedbackFaults||0)+1;if(stats.feedbackFaults===1)root.console?.warn?.("RC128 feedback hook",error);}', 'accepted immutable outcome hook');
 output['assets/combat-v31402/combat-core.js']=s;
 s=read('assets/rc23/feedback.js');
 s=one(s,'function tick(s,settings,play,unlocked){',`function impact(s,event){
  if(!s||!event||!Object.prototype.hasOwnProperty.call(pools,event.key))return false;
  const m=state(s);if(m.queue.length>=8)return false;
  m.queue.push({key:event.key,at:s.time,priority:Math.max(0,Math.min(7,Number(event.priority)||0)),gain:Math.max(0,Math.min(.5,Number(event.gain)||0))});return true;
 }
 function tick(s,settings,play,unlocked){`,'bounded priority sound ingress');
 s=one(s,'Object.freeze({sounds,hit,tick,metrics:','Object.freeze({sounds,hit,impact,tick,metrics:','sound API');
 output['assets/rc23/feedback.js']=s;
 s=read('index.html');
 s=one(s,'<script src="./assets/rc127/combat-policy.js?v=42701"></script>','<script src="./assets/rc128/awakening-policy.js?v=42801"></script>\n    <script src="./assets/rc128/combat-feedback.js?v=42801"></script>\n    <script src="./assets/rc127/combat-policy.js?v=42701"></script>','load new modules before consumers');
 for(const f of ['assets/rc91/samong-awakening.js','assets/combat-v31402/combat-core.js','assets/rc23/feedback.js']){
  const escaped=f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),re=new RegExp(escaped+'\\?v=\\d+','g');assert.equal([...s.matchAll(re)].length,1,'cache reference '+f);s=s.replace(re,f+'?v=42801');
 }
 output['index.html']=s;
 s=read('tests/rc91-samong-and-laser-smoke.cjs');
 s=one(s,"vm.createContext(c);vm.runInContext(read('assets/rc91/samong-awakening.js'),c);","vm.createContext(c);vm.runInContext(read('assets/rc128/awakening-policy.js'),c);vm.runInContext(read('assets/rc91/samong-awakening.js'),c);",'load encounter policy in legacy regression');
 s=one(s,'for(let i=0;i<700;i++)api.advance(loaded,.1,false);loaded.hp=0;assert(api.tryRevive(loaded));assert.equal(api.snapshot(loaded).activations,2);',"for(let i=0;i<700;i++)api.advance(loaded,.1,false);loaded.hp=0;assert(!api.tryRevive(loaded),'RC128: cooldown expiry alone does not refill the encounter revival');loaded.hp=240;loaded.zone='rc128-next-encounter';api.advance(loaded,.01,false);loaded.hp=0;assert(api.tryRevive(loaded));assert.equal(api.snapshot(loaded).activations,2);",'explicitly update the one intentional legacy behavior');
 s=one(s,'one lethal revival per 77 combat seconds','one lethal revival per encounter plus 77 combat-second cooldown','updated test description');
 output['tests/rc91-samong-and-laser-smoke.cjs']=s;
 return output;
}
function manifest(output){return Object.fromEntries(Object.entries(output).map(([f,s])=>[f,crypto.createHash('sha256').update(s).digest('hex')]));}
module.exports={build,manifest,files:FILES};
if(require.main===module){
 const root=path.resolve(__dirname,'..'),output=build(root),dest=process.argv[2];
 if(dest){const directory=path.resolve(dest);assert.notEqual(directory,root,'Write candidates to a separate worktree, not the public checkout');for(const[f,s]of Object.entries(output)){fs.mkdirSync(path.dirname(path.join(directory,f)),{recursive:true});fs.writeFileSync(path.join(directory,f),s);}}
 console.log(JSON.stringify({scope:'candidate integration; not a release or test result',files:manifest(output)},null,2));
}
