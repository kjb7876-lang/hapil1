'use strict';
// Pure geometry tests. Browser/contact and natural progression are separate suites.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/rc108/laser-topology.js'),'utf8'),sandbox);
const top=sandbox.window.__HAPIL_LASER_TOPOLOGY_RC108__,EPS=1e-4,rows=[];
const point=(x,y)=>({x,y}),line=(a,b)=>({a,b,width:.7,owner:'fixture',endAt:103});
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<EPS;
function nodes(lines){const all=[];for(const l of lines)for(const p of[l.a,l.b]){let n=all.find(n=>near(n.p,p));if(!n)all.push(n={p,count:0});n.count++;}return all;}
function check(lines,origin){assert(lines.length>0);assert.equal(top.components(lines).length,1);assert.equal(top.isolated(lines),-1);for(const l of lines){assert(Math.hypot(l.a.x-l.b.x,l.a.y-l.b.y)>1e-5);for(const p of[l.a,l.b]){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.x>=1.1-EPS&&p.x<=30.9+EPS&&p.y>=1.1-EPS&&p.y<=30.9+EPS);}}for(const n of nodes(lines))if(n.count===1&&!(origin&&near(n.p,origin)))assert(top.onBoundary(n.p),'unextended free endpoint '+JSON.stringify(n.p));}
function test(name,fn){fn();rows.push({name,pass:true});}
for(const [name,dx,dy]of[['east',1,0],['west',-1,0],['south',0,1],['north',0,-1],['south-east',1,1],['north-east',1,-1],['south-west',-1,1],['north-west',-1,-1]])test(name,()=>{
 const origin=point(16,16),source=[line(origin,point(16+dx*4,16+dy*4))],before=JSON.stringify(source),cast={cx:16,cy:16,width:.7},result=top.normalize(cast,source);
 check(result,origin);assert(nodes(result).some(n=>near(n.p,origin)));assert.equal(JSON.stringify(source),before);assert.equal(cast.cx,16);
 for(const l of result){assert.equal(l.width,.7);assert.equal(l.owner,'fixture');assert.equal(l.endAt,103);for(const p of[l.a,l.b])assert(Math.abs((p.x-16)*dy-(p.y-16)*dx)<EPS);}
 assert(nodes(result).some(n=>top.onBoundary(n.p)));
});
test('two free ends preserve straight line without forks',()=>{const result=top.normalize({width:.7},[line(point(4,16),point(28,16))]);check(result);assert(result.every(l=>l.a.y===16&&l.b.y===16));assert(nodes(result).some(n=>near(n.p,point(1.1,16))));assert(nodes(result).some(n=>near(n.p,point(30.9,16))));});
test('curve tail follows its last tangent',()=>{const origin=point(16,16),joint=point(19,18),source=[line(origin,joint),line(joint,point(20,21))],result=top.normalize({cx:16,cy:16,width:.7},source);check(result,origin);assert(nodes(result).some(n=>near(n.p,joint)));assert(nodes(result).some(n=>near(n.p,point(23.3,30.9))));});
test('cross has four shared center ends and four boundary tails',()=>{const result=top.normalize({width:.7},[line(point(4,4),point(28,28)),line(point(4,28),point(28,4))]);check(result);const center=nodes(result).find(n=>near(n.p,point(16,16)));assert.equal(center.count,4);assert.equal(nodes(result).filter(n=>n.count===1).length,4);});
test('new extension crossings are explicit shared vertices',()=>{const source=[line(point(14,16),point(18,16)),line(point(25,10),point(25,22))],result=top.normalize({width:.7},source);check(result);assert.equal(nodes(result).find(n=>near(n.p,point(25,16))).count,4);});
const ring=(x,y)=>{const p=[point(x,y),point(x+3,y),point(x+3,y+3),point(x,y+3)];return p.map((a,i)=>line(a,p[(i+1)%p.length]));};
test('closed ring keeps authored shape',()=>{const source=ring(8,8),before=JSON.stringify(source),result=top.normalize({width:.7},source);check(result);assert.equal(JSON.stringify(result),before);assert(nodes(result).every(n=>n.count===2));});
test('separate closed rings remain connected',()=>{const result=top.normalize({width:.7},[...ring(4,4),...ring(20,20)]);check(result);assert(result.some(l=>l.rc108Connector));});
test('out-of-arena crossing is clipped without mutation',()=>{const source=[line(point(-5,16),point(40,16))],before=JSON.stringify(source),result=top.normalize({width:.7},source);check(result);assert.equal(JSON.stringify(source),before);assert(nodes(result).some(n=>near(n.p,point(1.1,16))));assert(nodes(result).some(n=>near(n.p,point(30.9,16))));});
test('boundary-aligned beam remains finite',()=>{const result=top.normalize({width:.7},[line(point(1.1,1.1),point(1.1,30.9))]);check(result);assert(result.every(l=>l.a.x===1.1&&l.b.x===1.1));});
test('invalid and zero-length inputs are discarded',()=>{for(const source of[[],null,undefined,[null],[{a:{x:NaN,y:1},b:point(2,2)}],[line(point(5,5),point(5,5))],[line(point(-10,-10),point(-5,-5))]])assert.equal(top.normalize({},source).length,0);});
test('missing cast does not crash WeakMap',()=>{check(top.normalize(undefined,[line(point(5,16),point(25,16))]));check(top.normalize(null,[line(point(5,16),point(25,16))]));});
test('cache reuses identical geometry and invalidates moved input',()=>{const cast={width:.7},source=[line(point(5,16),point(25,16))],a=top.normalize(cast,source),b=top.normalize(cast,source);assert.strictEqual(a,b);source[0].b.y=20;const c=top.normalize(cast,source);assert.notStrictEqual(a,c);check(c);});
test('cache isolates cast ownership',()=>{const source=[line(point(5,16),point(25,16))];assert.notStrictEqual(top.normalize({width:.7,endAt:101},source),top.normalize({width:.7,endAt:102},source));});
test('cache observes emitter location changes',()=>{const cast={cx:5,cy:16,width:.7},source=[line(point(5,16),point(25,16))],a=top.normalize(cast,source);cast.cx=16;const b=top.normalize(cast,source);assert.notStrictEqual(a,b);assert(nodes(a).some(n=>near(n.p,point(5,16))));assert(nodes(b).some(n=>near(n.p,point(1.1,16))));});
test('native hazard endpoints and object are not changed by rendering helper',()=>{const h={originX:4,originY:8,x:24,y:18,width:1},before=JSON.stringify(h),result=top.native(h);assert(near(result[0].a,point(4,8)));assert(near(result[1].b,point(24,18)));assert.equal(JSON.stringify(h),before);});
test('approved owner-art renderer remains byte-identical',()=>{const content=fs.readFileSync(path.join(root,'assets/rc77/connected-laser.js')),blob=crypto.createHash('sha1').update('blob '+content.length+'\0').update(content).digest('hex');assert.equal(blob,'6bb4a891eb541734ef4c86f4d46dfb6ea94a44df');});
const result={suite:'RC123 boundary pure geometry',cases:rows.length,rows,metrics:top.metrics(),limitations:['Pure geometry only; not natural gameplay or visual approval.','Native line hazard endpoints intentionally remain unchanged until its damage path is verified.','Closed rings retain their authored shape, rather than receiving invented outward rays.']};
if(process.env.HAPIL_QA_OUTPUT){fs.mkdirSync(process.env.HAPIL_QA_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.HAPIL_QA_OUTPUT,'rc123-boundary-smoke.json'),JSON.stringify(result,null,2));}
console.log('RC123_BOUNDARY_SMOKE',JSON.stringify(result));
