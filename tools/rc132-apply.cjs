'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const acorn=require(process.env.RC132_MODULES+'/acorn'),prettier=require(process.env.RC132_MODULES+'/prettier');
const root=path.resolve(__dirname,'..'),out=process.env.HAPIL_QA_OUTPUT||path.join(root,'qa-results/rc132');fs.mkdirSync(out,{recursive:true});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const changes=[];function write(file,previous,next){if(previous!==next){fs.writeFileSync(path.join(root,file),next);changes.push({file,before:hash(previous),after:hash(next)});}}
function once(s,a,b,label){assert.equal(s.split(a).length-1,1,label);return s.replace(a,b);}
function functions(s){const found=[],ast=acorn.parse(s,{ecmaVersion:'latest',sourceType:'module'});function walk(n){if(!n||typeof n!=='object')return;if(/Function/.test(n.type)&&n.body)found.push(n);for(const[k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v.type==='string')walk(v);}}walk(ast);return found;}
(async()=>{
 let file='assets/index-v31526.js',s=fs.readFileSync(path.join(root,file),'utf8'),original=s,funcs=functions(s);
 const dirs=path.join(out,'source');fs.mkdirSync(dirs,{recursive:true});
 for(const[key,term]of Object.entries({flow:'window.__HAPIL_FLOW_V31343__ =',auto:'window.__HAPIL_AUTOPROGRESS_V31301__ =',rpg:'window.__HAPIL_DANMAKU_RPG_RC88__',qa:'window.__MONGSE_QA_API__'})){
  const variants=[term,term.replace(' =','=')],offsets=variants.map(t=>s.indexOf(t)).filter(i=>i>=0);const rows=[];
  for(const at of offsets){const nodes=funcs.filter(f=>f.start<=at&&f.end>at).sort((a,b)=>(a.end-a.start)-(b.end-b.start));rows.push({at,line:s.slice(0,at).split('\n').length,nodes:nodes.slice(0,3).map(f=>({name:f.id?.name,start:f.start,end:f.end,length:f.end-f.start})),context:s.slice(Math.max(0,at-700),at+2000)});const f=nodes.find(f=>f.end-f.start<180000&&f.end-f.start>2500);if(f){let text=s.slice(f.start,f.end);try{text=await prettier.format(text,{parser:'babel'});}catch{}fs.writeFileSync(path.join(dirs,key+'.txt'),text);}}
  fs.writeFileSync(path.join(dirs,key+'-locations.json'),JSON.stringify(rows,null,2));
 }
 const zones=[];for(const m of s.matchAll(/ep1b07/g))zones.push({line:s.slice(0,m.index).split('\n').length,context:s.slice(Math.max(0,m.index-300),m.index+500)});fs.writeFileSync(path.join(dirs,'wrath-references.json'),JSON.stringify(zones,null,2));
 if(!s.includes('RC132_MIRROR_REMOVED')){
  const candidates=funcs.filter(f=>f.end-f.start<100000&&s.slice(f.start,f.end).includes('window.__HAPIL_MIRROR_V31347__')&&s.slice(f.start,f.end).includes('function spawn('));
  candidates.sort((a,b)=>(a.end-a.start)-(b.end-b.start));const f=candidates[0];assert(f,'unique native DREAM mirror closure');
  const nested=funcs.filter(n=>n.start>f.start&&n.end<f.end);function keep(name){const n=nested.find(n=>n.id?.name===name);assert(n,'preserved mirror memory function '+name);return s.slice(n.start,n.end);}
  const replacement=`()=>{\n 'use strict';\n /* RC132_MIRROR_REMOVED: retain only memory artwork and a save-compatible inert API. */\n const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;\n const mode=s=>window.__HAPIL_MODES_V31346__?.mode?.(s);\n const stats={created:0,hits:0,draws:0,images:0,cleaned:0};\n let installed=false,attempts=0;\n ${keep('poly')}\n ${keep('memoryArt')}\n ${keep('drawMemory')}\n function cleanup(s){if(!s)return;stats.cleaned+=(s.dreamMirrorLasersV31347?.length||0);s.dreamMirrorLasersV31347=[];for(const key of ['pendingHits','impactQueue','effects','hostileProjectiles'])if(Array.isArray(s[key]))s[key]=s[key].filter(x=>!x?.dreamMirrorLaserV31347);}\n function install(){\n  if(installed)return true;const L=window.__HAPIL_LASERS_V31330__;if(!window.__HAPIL_V31346_RELEASE__?.installed||!L?.installed)return false;\n  const oldTick=L.tick,oldDraw=L.draw;\n  L.tick=function HAPIL_removedMirrorCleanupRC132(s,dt){cleanup(s);const result=oldTick.apply(this,arguments);memoryArt(s);return result;};\n  L.draw=function HAPIL_preservedDreamMemoryRC132(ctx,cache,s,settings){cleanup(s);memoryArt(s);drawMemory(ctx,cache,s);return oldDraw.apply(this,arguments);};\n  window.__HAPIL_MIRROR_V31347__=Object.freeze({version:'RC132-removed',installed:true,removed:true,plan:()=>null,spawn:()=>null,tick:cleanup,draw:()=>false,contact:()=>false,valid:()=>false,memoryArt,drawMemory,drawMirror:()=>false,metrics:()=>({...stats}),policy:Object.freeze({image:'render-only; no HP, reward, AI or state owner',laser:'removed by user request; no generation, hit test, drawing or replay'})});\n  installed=true;return true;\n }\n function schedule(){if(install()||++attempts>800)return;setTimeout(schedule,0);}schedule();\n}`;
  s=s.slice(0,f.start)+replacement+s.slice(f.end);
 }
 if(!s.includes('RC132_PARTY_SUSTAIN'))s=once(s,'a.hp=Math.min(a.maxHp,a.hp+dealt*.08*scale);','/* RC132_PARTY_SUSTAIN */const healing=window.__HAPIL_DREAM_BALANCE_RC132__?.lifesteal(s,a,dealt*.08*scale)??dealt*.08*scale;a.hp=Math.min(a.maxHp,a.hp+healing);','party lifesteal reducer');
 write(file,original,s);
 file='assets/combat-v31412/outgoing-native.js';s=fs.readFileSync(path.join(root,file),'utf8');original=s;
 if(!s.includes('RC132_NATIVE_SUSTAIN'))s=once(s,'          ((a.hp += e),core.outgoingHeal(a,o,e),','          // RC132_NATIVE_SUSTAIN: bound earned lifesteal before committing the HP change.\n          e = window.__HAPIL_DREAM_BALANCE_RC132__?.lifesteal(a,a,e) ?? e;\n          ((a.hp += e),core.outgoingHeal(a,o,e),','native lifesteal commit');
 write(file,original,s);
 file='index.html';s=fs.readFileSync(path.join(root,file),'utf8');original=s;
 if(!s.includes('assets/rc132/dream-balance.js'))s=once(s,'<script src="./assets/rc130/projectile-policy.js','<script src="./assets/rc132/dream-balance.js?v=43201"></script>\n    <script src="./assets/rc130/projectile-policy.js','balance script ordering');
 s=s.replace(/(assets\/combat-v31412\/outgoing-native\.js\?v=)[^"']+/g,'$143201').replace(/(assets\/index-v31526\.js\?v=)[^"']+/g,'$143201');
 write(file,original,s);
 fs.writeFileSync(path.join(out,'apply.json'),JSON.stringify({startingCommit:process.env.GITHUB_SHA,changes,scope:'DREAM-only lifesteal and removed extra mirror laser; progression diagnosis separate'},null,2));console.log('RC132_APPLY',JSON.stringify(changes));
})().catch(e=>{console.error(e);process.exitCode=1;});
