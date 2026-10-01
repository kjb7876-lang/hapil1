const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={__HAPIL_LASERS_V31330__:{ranks:new Map([['b08-boss','boss']])}},sandbox={window,Math,Number,Object,WeakMap,WeakSet,Set};
for(const file of ['assets/rc97/choice-patterns.js','assets/rc95/combat-flow.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox);
const C=window.__HAPIL_CHOICE_RC97__,R=window.__HAPIL_COMBAT_FLOW_RC95__,api={locked:()=>false},s={zone:'ep1b08',time:100,x:20,y:20,hp:240,enemies:[]};R.frame(s);
const ids=['b05-boss','b06-boss','dist06-boss','b03-boss','b08-boss','mb-other'];
assert.equal(new Set(ids.map(id=>C.profile({id}).family)).size,6);
const paths=[];for(const id of ids){const a={id,name:id,x:16,y:16,boss:true};const shots=C.volley(s,a,{index:0,cycle:0},7);assert(shots.length>0&&shots.length<=7);for(const q of shots)assert(Number.isFinite(q.vx)&&Number.isFinite(q.vy)&&q.frozenUntil===s.time&&q.homingMode31212==='none');paths.push(JSON.stringify(shots.map(q=>[q.x,q.y,q.vx,q.vy,q.curve])));assert(C.volley(s,a,{index:2,cycle:0},5).every(q=>q.curve===0),'mixed phase has simple secondary bullets');}
assert.equal(new Set(paths).size,6,'family motion differs without relying on colour');
const a={id:'b08-boss',x:16,y:16,boss:true},cast={width:5,type:'hash'};s.enemies=[a];C.beforeTick(s,api,.1);C.prepareLaser(s,a,cast,R.phase(s));assert(C.validPlan(cast));assert.equal(cast.width,1.6);
const lines=C.geometry(cast,[]);assert(lines.length>0&&lines.length<=24);for(const l of lines)assert([l.a.x,l.a.y,l.b.x,l.b.y].every(v=>Number.isFinite(v)&&v>=1.1-1e-8&&v<=30.9+1e-8));
const pixel=p=>({x:(p.x-p.y)*27,y:(p.x+p.y)*13.5}),dist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,u=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy);};
for(const v of [cast.rc97Choice.broad,cast.rc97Choice.narrow])for(let u=-10;u<=10;u+=.5){const p=pixel({x:v+u*.5,y:v-u*.5});assert(lines.every(l=>dist(p,pixel(l.a),pixel(l.b))>cast.width*27*1.25+4.5),'both advertised lanes are genuinely clear for native body radius');}
for(const change of [{narrow:cast.rc97Choice.broad},{cycle:Infinity},{blocked:3},{family:'injected'}])assert(!C.validPlan({...cast,rc97Choice:{...cast.rc97Choice,...change}}));
const initial=R.phase(s).elapsed;s.timeStopUntil=101;for(let i=0;i<10;i++){s.time+=.1;C.beforeTick(s,api,.1);C.beforeTick(s,api,.1);}assert(Math.abs(R.phase(s).elapsed-initial)<1e-7,'pause holds director clock once per simulation instant');s.timeStopUntil=0;s.time+=.1;C.beforeTick(s,api,.1);assert(R.phase(s).elapsed>initial);
s.time=118.2;s.x=10;s.y=10;C.beforeTick(s,api,.1);s.time=136.3;C.beforeTick(s,api,.1);const later={width:5,type:'hash'};C.prepareLaser(s,a,later,R.phase(s));assert.equal(later.rc97Choice.blocked,0,'next repeat pressures the previously chosen lane');
const minion={id:'minion',midboss:true};assert.equal(C.lead(s,[minion,a]),a);s.bossLaserCastsV31330=[{sourceId:'minion',endAt:s.time+3}];assert.equal(C.lead(s,[minion,a]),minion,'mixed bullets follow the active laser owner');
console.log('RC97 PASS: six grammars, simple mixed bullets, honest broad/narrow contact lanes, bounded snapshots, route memory and frozen cadence.');
