'use strict';
// Admission thresholds apply to producers. Existing committed native packets
// and the separately bounded echo channel are not retroactively truncated.
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const acorn=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/tmp/rc231-node/node_modules','acorn'));
const read=p=>fs.readFileSync(p,'utf8'),source=read('assets/index-v31526.js'),base='346bee26788b789168fca50f63f12a09f6869c2d';
const before=cp.execFileSync('git',['show',base+':assets/index-v31526.js'],{encoding:'utf8',maxBuffer:64*1024*1024});
function echoBody(text,name){const start=text.indexOf('/* 3.13.68: bounded, owner-authored echoes.'),at=text.indexOf('\n function '+name+'(',start)+2;assert(start>0&&at>start);const node=acorn.parseExpressionAt(text,at,{ecmaVersion:'latest'});return text.slice(at,node.end);}
function echoConfig(text){const marker=text.indexOf('/* 3.13.68: bounded, owner-authored echoes.'),start=text.indexOf(' const cfg=',marker),end=text.indexOf(';',start)+1;assert(start>marker&&end>start);return text.slice(start,end);}
for(const name of ['fire','owner'])assert.equal(echoBody(source,name),echoBody(before,name),'the actual native echo '+name+' producer is unchanged from the source-pinned baseline');
assert.equal(echoConfig(source),echoConfig(before),'native echo limits are unchanged');
const rows=[];let checks=3;
for(const mobile of [false,true]){
 const w={window:null,innerWidth:mobile?844:1280,innerHeight:mobile?390:800};w.window=w;w.__HAPIL_COMBAT_RC47__={mobile:()=>mobile};vm.createContext(w);vm.runInContext(read('assets/rc210/projectile-balance.js'),w);
 const D=w.__HAPIL_BULLET_BALANCE_RC210__,cap=D.admissionCap(),a={id:'mb-dist01',midboss:true,hp:100,x:24,y:14},existing=Array.from({length:cap},(_,id)=>({id,sourceId:'prior-owner',damage:10,x:10,y:20,vx:2,vy:1})),s={zone:'dist01',time:100,fxSerial:cap+1,x:13.8,y:24.2,enemies:[a],hostileProjectiles:[...existing]};
 const packet={vx:-2,vy:2,radius:.28,damage:10,patternKind:'rc95-volley'},cue={kind:'bolt',ownerId:a.id,x:a.x,y:a.y,tx:s.x,ty:s.y,path:'./assets/native-echo-fixture.webp',color:'#9d54e8',accent:'#ead8ff'};
 assert.equal(cap,mobile?40:56);assert.equal(D.canEmit(s,a,packet),false);checks+=2;
 const records=new WeakMap();w.C=()=>null;w.mem=state=>{let row=records.get(state);if(!row)records.set(state,row={serial:0});return row;};w.stats={bolts:0,volleys:0};
 vm.runInContext(echoConfig(source)+'\n'+echoBody(source,'owner')+'\n'+echoBody(source,'fire'),w);
 assert.equal(w.fire(s,cue),true);assert.equal(s.hostileProjectiles.length,cap+3);assert.equal(s.hostileProjectiles.filter(q=>q.echoBoltV31368).length,3);assert(existing.every(q=>s.hostileProjectiles.includes(q)));checks+=4;
 // Install the actual final native admission wrapper. Its underlying emitter
 // is a queue-only fixture; no independent native echo is routed through it.
 let nativeCalls=0;w.H=()=>({id:'inner-evil-rc133'});w.provenance={allow:()=>true,finalizeAdded:(s,start,a,p,apply)=>s.hostileProjectiles.slice(start).forEach(apply)};w.MONGSE_pushThemeProjectile3129=(s,a,p)=>{nativeCalls++;s.hostileProjectiles.push({...p,id:s.fxSerial++,sourceId:a.id});};
 const integration=read('assets/rc133/native-install-v2.js.txt'),start=integration.indexOf('  const personaBullet='),end=integration.indexOf('\n  const personaCast=',start);assert(start>0&&end>start);vm.runInContext(integration.slice(start,end),w);
 const length=s.hostileProjectiles.length;assert.equal(w.MONGSE_pushThemeProjectile3129(s,a,packet),null);assert.equal(nativeCalls,0);assert.equal(s.hostileProjectiles.length,length);checks+=3;
 for(let i=0;i<8;i++)w.fire(s,cue);assert.equal(s.hostileProjectiles.filter(q=>q.echoBoltV31368).length,12);assert.equal(s.hostileProjectiles.length,cap+12);assert(existing.every(q=>s.hostileProjectiles.includes(q)));checks+=3;
 // A separate native retirement fixture opens exactly two slots. The same
 // wrapper admits its original primary+density pair to the existing cap.
 s.hostileProjectiles=existing.slice(2);w.MONGSE_pushThemeProjectile3129(s,a,packet);assert.equal(nativeCalls,2);assert.equal(s.hostileProjectiles.length,cap);assert.equal(s.hostileProjectiles.filter(q=>q.rc210DensityExtra).length,1);assert(existing.slice(2).every(q=>s.hostileProjectiles.includes(q)));checks+=4;
 rows.push({mobile,ordinaryAdmissionCap:cap,rawAfterNativeEcho:cap+3,maximumNativeEcho:12,guardedRejectedAtRaw:length,guardedPairAdmittedAt:cap-2});
}
console.log('RC231_NATIVE_ADMISSION_DOMAIN_UNIT '+JSON.stringify({status:'passed',checks,baseline:base,rows,scope:'Actual unchanged native echo fire/owner/config plus actual final native guarded-emitter wrapper. Queue/source fixtures; raw global queue size is not an ordinary-producer admission threshold. Observed CI overage composition remains a separate Chrome receipt.'}));
