'use strict';
// Encodes original browser PNG frames without resizing, interpolation or art
// synthesis. Selected PNGs remain untouched; every source frame is preserved.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function encode(frames,{rawRoot,out,file,browserScreenshotSource}){
 assert.equal(typeof browserScreenshotSource,'boolean','source evidence must be explicitly classified');
 assert.equal(frames.length,13,'release plus twelve unchanged64ms native steps');
 assert.match(file,/^(pc-hwando|landscape-gunner)-(before|after)\.mp4$/);
 let total=0,dimensions=null;
 const buffers=frames.map((r,index)=>{assert.equal(r.index,index);assert.match(r.file,/^(pc-hwando|landscape-gunner)-(before|after)-frame-\d{2}\.png$/);const b=fs.readFileSync(path.join(rawRoot,r.file));assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));const d=[b.readUInt32BE(16),b.readUInt32BE(20)];dimensions??=d;assert.deepEqual(d,dimensions);assert(d.every(n=>n>0&&n<=2048&&n%2===0));total+=b.length;assert(total<48*1024*1024,'one original sequence stays bounded');return b;});
 fs.mkdirSync(out,{recursive:true});const destination=path.join(out,file);
 cp.execFileSync('ffmpeg',['-v','error','-f','image2pipe','-framerate','15.625','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-y',destination],{input:Buffer.concat(buffers),maxBuffer:1024*1024,timeout:60000});
 const probe=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames,r_frame_rate','-of','json',destination],{encoding:'utf8',timeout:10000})).streams[0];
 assert.deepEqual([probe.width,probe.height],dimensions);assert.equal(Number(probe.nb_read_frames),frames.length);assert.equal(probe.r_frame_rate,'125/8');const b=fs.readFileSync(destination);assert(b.length>0&&b.length<4*1024*1024);
 return{file,bytes:b.length,sha256:sha(b),width:probe.width,height:probe.height,frames:frames.length,fps:15.625,sourceFrameHashes:frames.map(r=>r.sha256),sourceGameTimes:frames.map(r=>r.time),sourceStepMs:64,method:'Original browser PNGs encoded at unchanged capture cadence; no resize/interpolation/synthetic frames; MP4 is lossy, original PNG bytes retained separately',browserScreenshotSource,naturalPlay:false};
}
module.exports={encode};
