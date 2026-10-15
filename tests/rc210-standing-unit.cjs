'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const w={};w.window=w;vm.createContext(w);
for(const p of ['assets/rc206/slayer-rig.js','assets/rc210/slayer-standing.js'])vm.runInContext(fs.readFileSync(p,'utf8'),w);
const S=w.__HAPIL_SLAYER_STANDING_RC210__,R=w.__HAPIL_SLAYER_RIG_RC204__,manifest=JSON.parse(fs.readFileSync('qa/rc210/art-manifest.json'));let checks=0;
assert.deepEqual(Array.from(S.supportedDirections),['right','e','left','w']);
assert.deepEqual(Array.from(S.fallbackDirections),['n','ne','se','s','sw','nw']);checks+=2;
for(let i=0;i<4;i++){const f=S.frames[i],b=fs.readFileSync(f.path.slice(2)),m=manifest.slayer.frames[i];assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m.sha256_aligned);assert.equal(b.readUInt32BE(16),1650);assert.equal(b.readUInt32BE(20),1550);assert.equal(b[25],6);checks+=4;}
const foots=[],scales=[],framePaths=[],rigPaths=[],delegated=[],ctx={globalAlpha:1,save(){},restore(){},translate(x,y){foots.push([x,y]);},scale(x,y){scales.push([x,y]);},transform(){},beginPath(){},rect(){},clip(){},moveTo(){},lineTo(){},closePath(){},drawImage(im,x,y,width,height){if(im.index>=0){framePaths.push(im.src);assert.equal(arguments.length,5);assert(Math.abs(height/1550*S.frames[im.index].height-66)<1e-8);assert(Math.abs(x/width+850/1650)<1e-8);checks+=2;}else{rigPaths.push(im.src);assert(R.assets.includes(im.src));}}};
const queue=(cache,path)=>({complete:true,naturalWidth:1650,naturalHeight:1550,index:S.assets.indexOf(path),src:path});
for(const [p,index]of [[0,0],[.2,1],[.5,2],[.9,3]])for(const dir of ['e','w']){assert.equal(S.select(p),index);assert.equal(S.draw(ctx,{},2,3,66,{}, {hero:'slayer',kind:'attack',rigidProgress:p,rigidSector:dir},queue,()=>({x:640,y:500})),true);}
assert.deepEqual(framePaths.length,8);const horizontalFrameCount=framePaths.length;
for(const dir of ['n','ne','se','s','sw','nw']){assert.equal(S.draw(ctx,{},2,3,66,{}, {hero:'slayer',kind:'attack',rigidProgress:.5,rigidSector:dir},queue,()=>({x:640,y:500})),true);delegated.push(dir);}
assert.equal(framePaths.length,horizontalFrameCount,'non-horizontal attacks must leave the single side-view art path');assert.equal(rigPaths.length,delegated.length*6);assert(scales.some(p=>p[0]===-1));assert(foots.every(p=>p[0]===640&&p[1]===500));checks+=5;
assert.equal(S.draw(ctx,{},2,3,66,{}, {hero:'slayer',kind:'move',rigidProgress:.5,rigidSector:'n'},queue,()=>({x:640,y:500})),false);
console.log(JSON.stringify({status:'passed',checks,sourceHashes:4,attackPoses:4,horizontalFrames:8,nonHorizontalRigFallbacks:6,viewCount:S.viewCount,mirrored:S.mirror,bodyCalibrationHeight:66,rawProportionDifference:'about 13 percent, normalized per-frame',scope:'CPU image-selection, anchor/scale and direction delegation; actual browser pixels and GPU animation pending'}));
