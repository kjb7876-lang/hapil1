'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=path.join(root,'assets/combat-audio/v1');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(base,'catalog.js'),'utf8'),context);
const catalog=context.window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__,hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.scope,'combat-only');assert.equal(manifest.originalsPreserved,true);
assert.equal(manifest.assets.length,8);assert.equal(Object.keys(catalog.music).length,4);assert.equal(Object.keys(catalog.effects).length,4);
assert.deepEqual(manifest.assets.map(x=>x.role).sort(),['blackHole','clockwork','clockworkIntense','dark','foldingSpace','illusion','roar','timeControl']);
const found=[];
for(const row of manifest.assets){
 assert(/^\.\/assets\/combat-audio\/v1\/audio\/[a-z0-9-]+\.(mp3|wav)$/.test(row.path));
 assert(/^[a-f0-9]{64}$/.test(row.sha256)&&/^[a-f0-9]{64}$/.test(row.sourceSha256));
 assert(row.path.includes(row.sha256.slice(0,24)));const file=path.join(root,row.path),bytes=fs.readFileSync(file);
 assert.equal(hash(bytes),row.sha256);assert.equal(bytes.length,row.bytes);assert(row.bytes>0&&row.bytes<8000000);
 const profile=catalog[row.kind==='music'?'music':'effects'][row.role];assert.equal(profile.path,row.path);assert.equal(profile.sha256,row.sha256);
 const probe=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-select_streams','a','-show_entries','stream=codec_name,sample_rate,channels:format=duration','-of','json',file],{encoding:'utf8'}));
 assert.equal(probe.streams.length,1);const stream=probe.streams[0];assert.equal(Number(stream.sample_rate),48000);assert.equal(stream.channels,2);assert(Number(probe.format.duration)>0);
 if(row.kind==='music'){
  assert.equal(stream.codec_name,'mp3');assert.equal(row.sha256,row.sourceSha256,'music bytes must retain exact uploaded recording');
  for(const key of ['sourceIntegratedLufs','sourceTruePeakDbtp','sourceSamplePeakDbfs','catalogGainDb','effectiveIntegratedLufsBeforeUserVolume','effectiveTruePeakDbtpBeforeUserVolume'])assert(Number.isFinite(row[key]),'measured source/headroom field missing: '+row.role+'/'+key);
  assert.equal(row.measuredWith,'FFmpeg astats decoded sample peak + ebur128 true-peak/integrated-loudness scan of original MP3');
  const loudnessGain=20*Math.log10(profile.gain);
  assert(Math.abs(row.catalogGainDb-loudnessGain)<.002,'catalog gain dB differs: '+row.role);
  assert(Math.abs(row.effectiveIntegratedLufsBeforeUserVolume-(row.sourceIntegratedLufs+loudnessGain))<.11,'effective integrated loudness differs: '+row.role);
  assert(Math.abs(row.effectiveTruePeakDbtpBeforeUserVolume-(row.sourceTruePeakDbtp+loudnessGain))<.11,'effective true peak differs: '+row.role);
  assert(row.effectiveTruePeakDbtpBeforeUserVolume<=-9.0,'music output lacks playback headroom: '+row.role);
  const scan=cp.spawnSync('ffmpeg',['-hide_banner','-v','info','-nostats','-i',file,'-map','0:a:0','-af','astats=metadata=0:reset=0,ebur128=peak=true:framelog=quiet','-f','null','-'],{encoding:'utf8',maxBuffer:8*1024*1024});
  assert.equal(scan.status,0,'FFmpeg source scan failed: '+row.role);const measured=scan.stderr;
  const truePeak=[...measured.matchAll(/True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/g)].at(-1)?.[1];
  const integrated=[...measured.matchAll(/Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/g)].at(-1)?.[1];
  const samplePeak=[...measured.matchAll(/Peak level dB:\s*(-?\d+(?:\.\d+)?)/g)].at(-1)?.[1];
  assert(truePeak&&integrated&&samplePeak,'FFmpeg source scan incomplete: '+row.role);
  assert(Math.abs(Number(truePeak)-row.sourceTruePeakDbtp)<=.11,'source true-peak metadata drift: '+row.role);
  assert(Math.abs(Number(integrated)-row.sourceIntegratedLufs)<=.11,'source loudness metadata drift: '+row.role);
  assert(Math.abs(Number(samplePeak)-row.sourceSamplePeakDbfs)<=.11,'source sample-peak metadata drift: '+row.role);
  // MP3 container duration includes encoder priming/padding. Compare the
  // decoded time grid used by the measured loop windows instead.
  const pcm=cp.execFileSync('ffmpeg',['-v','error','-i',file,'-map','0:a:0','-f','f32le','-'],{maxBuffer:128*1024*1024});
  assert(Math.abs(pcm.length/(4*2*48000)-row.duration)<1/48000,'decoded music duration differs');
  assert.equal(profile.gain,row.sourceEffectiveGainBeforeUserVolume);assert(profile.gain>0&&profile.gain<=.32);
  assert(profile.loopStart>=0&&profile.loopEnd>profile.loopStart+3&&profile.loopEnd<=row.duration);
  assert(profile.crossfade>=1.5&&profile.crossfade<=3);
 }else{
  assert.equal(stream.codec_name,'pcm_s24le');assert.equal(row.sampleCount,108000);assert.equal(row.samplesRemoved,0);assert.equal(row.resampled,false);assert.equal(row.denoised,false);assert.equal(row.declipped,false);
  assert.equal(row.attackSeconds,.02);assert.equal(row.releaseSeconds,.2);assert.equal(row.nativeEffectMultiplier,.55);assert.equal(profile.gain,1);assert.equal(profile.voices,1);assert(profile.cooldown>=2.5);
  assert(Math.abs(row.appliedStaticGain*.55-row.sourceEffectiveGainBeforeUserVolume)<1e-10);
  assert(row.maximumQuantizationError<=1/8388608+1e-15);assert(row.deliveredTruePeakDbtp<=-2);assert(row.defaultEffectiveLufs>=-22&&row.defaultEffectiveLufs<=-20);
  const pcm=cp.execFileSync('ffmpeg',['-v','error','-i',file,'-f','f32le','-'],{maxBuffer:2*1024*1024});assert.equal(pcm.length,108000*2*4);
  let peak=0;for(let i=0;i<pcm.length;i+=4){const v=pcm.readFloatLE(i);assert(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));}assert(peak<.9);
  for(const offset of [0,4,pcm.length-8,pcm.length-4])assert.equal(pcm.readFloatLE(offset),0,'bounded boundary fade must end at zero');
 }
 found.push(path.basename(file));
}
assert.deepEqual(fs.readdirSync(path.join(base,'audio')).sort(),found.sort(),'no untracked or missing combat audio');
console.log(JSON.stringify({pass:true,combatOnly:true,music:4,effects:4,originalMusicBytesPreserved:true,boundedEffectCopies:true,publicBytes:manifest.assets.reduce((n,r)=>n+r.bytes,0)},null,2));
