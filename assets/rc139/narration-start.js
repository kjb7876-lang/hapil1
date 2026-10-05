/* RC139: separate visible punctuation from speech and wait after readiness.
 * Original recordings, canonical speech metadata and RC49 remain unchanged. */
(function(root){'use strict';
 const delayMs=500,stats={ready:0,waits:0,starts:0,cancelled:0,originals:0};
 const cancelled=()=>new Error('Narration start cancelled');
 const voiceText=text=>String(text).replace(/(?:\.*…[.…]*|\.{3,})[.!?。！？]*/gu,(match,offset,input)=>(offset>0&&/[\p{L}\p{N}]/u.test(input[offset-1])?' ':'')+'그러하였다.');
 function wait({signal,isCurrent=()=>true,delay=delayMs}={}){
  if(signal?.aborted||!isCurrent())return Promise.reject(cancelled());
  stats.ready++;stats.waits++;
  return new Promise((resolve,reject)=>{
   let timer=null,done=false;
   const finish=(error)=>{if(done)return;done=true;if(timer!==null)root.clearTimeout(timer);signal?.removeEventListener('abort',abort);if(error){stats.cancelled++;reject(error);}else{stats.starts++;resolve(true);}};
   const abort=()=>finish(cancelled());
   signal?.addEventListener('abort',abort,{once:true});
   timer=root.setTimeout(()=>finish(signal?.aborted||!isCurrent()?cancelled():null),Math.max(0,Math.min(1000,delay)));
  });
 }
 function mediaReady(clip,signal,isCurrent=()=>true){
  if(signal?.aborted||!isCurrent())return Promise.reject(cancelled());
  if(clip.readyState>=3)return Promise.resolve(true);
  return new Promise((resolve,reject)=>{
   let timer,done=false;
   const finish=error=>{if(done)return;done=true;root.clearTimeout(timer);for(const [event,fn]of [['canplay',ready],['error',failed]])clip.removeEventListener(event,fn);signal?.removeEventListener('abort',abort);error?reject(error):resolve(true);};
   const ready=()=>finish(signal?.aborted||!isCurrent()?cancelled():null),failed=()=>finish(new Error('Narration media unavailable')),abort=()=>finish(cancelled());
   clip.addEventListener('canplay',ready);clip.addEventListener('error',failed);signal?.addEventListener('abort',abort,{once:true});timer=root.setTimeout(failed,15000);clip.load();
   if(clip.readyState>=3)ready();
  });
 }
 const source=root.__HAPIL_STORY_DATA_RC51__,data=root.__HAPIL_NARRATION_DISPLAY_DATA_RC139__;
 if(source&&data){
  const display=JSON.parse(JSON.stringify(source));
  for(const row of data.rows){let owner=display;for(const key of row.keys.slice(0,-1))owner=owner[key];const key=row.keys.at(-1);if(owner[key]!==row.voice||voiceText(row.display)!==row.voice)throw Error('RC139 exact narration display mismatch');owner[key]=row.display;}
  display.spokenCanonicalTextSha256=source.canonicalTextSha256;display.canonicalTextSha256=data.displayRawSha256;
  display.narrationTextRevision={...source.narrationTextRevision,scope:'speech-only',displayRestoredFields:data.rows.length};
  root.__HAPIL_STORY_DATA_RC51__=display;
 }
 const decoded=new WeakMap();
 async function originalReady(path,context,signal){
  if(!context)throw Error('Original WebAudio unavailable');
  let cache=decoded.get(context);if(!cache){cache=new Map();decoded.set(context,cache);}
  // Retain only the readiness result. RC49 owns the actual decoded recording;
  // this validator must not retain a second full-length PCM buffer on mobile.
  if(!cache.has(path))cache.set(path,root.fetch(path).then(r=>{if(!r.ok)throw Error('Original narration unavailable');return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).then(()=>true).catch(e=>{cache.delete(path);throw e;}));
  await cache.get(path);if(signal.aborted)throw cancelled();await context.resume();if(signal.aborted||context.state!=='running')throw cancelled();return true;
 }
 function installOriginal(){
  const original=root.__HAPIL_STORY_VOICE_RC49__;if(!original||original.startRC139)return false;
  root.__HAPIL_STORY_VOICE_RC49__=Object.freeze({...original,startRC139:true,create(path,callbacks={}){
   const native=original.create(path,callbacks);let pending=false,stopped=false,generation=0,controller=null,failed=false,media=null,mediaStatus='paused',mediaOffset=0;
   const cancel=()=>{generation++;controller?.abort();controller=null;pending=false;};
   const releaseMedia=()=>{if(!media)return;media.onplaying=media.onended=media.onerror=null;media.pause();media.removeAttribute('src');media.load();media=null;};
   async function fallback(signal,request){
    native.pause();releaseMedia();const clip=new root.Audio(path);media=clip;mediaStatus='loading';clip.preload='auto';clip.volume=Math.max(0,Math.min(1,Number(callbacks.volume??1)));clip.setAttribute?.('playsinline','');
    const current=()=>!stopped&&!signal.aborted&&request===generation&&media===clip&&!root.document.hidden;
    clip.onplaying=()=>{if(current()&&mediaStatus==='loading'){mediaStatus='playing';callbacks.onPlaying?.();}};
    clip.onended=()=>{if(current()&&mediaStatus==='playing'){mediaStatus='ended';mediaOffset=0;callbacks.onEnded?.();}};
    clip.onerror=()=>{if(current()&&!failed){failed=true;mediaStatus='blocked';callbacks.onBlocked?.();}};
    await mediaReady(clip,signal,current);await wait({signal,isCurrent:current});if(!current())return false;if(mediaOffset>0)clip.currentTime=mediaOffset;await clip.play();if(!current()){clip.pause();return false;}if(mediaStatus==='loading'){mediaStatus='playing';callbacks.onPlaying?.();}return true;
   }
   return Object.freeze({async play(){if(stopped||pending||native.playing)return false;pending=true;failed=false;const request=++generation;controller=new AbortController();const signal=controller.signal;original.unlock(path);
    try{if(mediaStatus==='playing')return false;if(mediaStatus==='ended')mediaOffset=0;if(media)return await fallback(signal,request);
     try{await originalReady(path,native.audioContext,signal);}catch(error){if(stopped||signal.aborted||request!==generation)return false;return await fallback(signal,request);}
     if(media){releaseMedia();mediaStatus='paused';}await wait({signal,isCurrent:()=>!stopped&&request===generation&&!root.document.hidden});if(signal.aborted||request!==generation)return false;stats.originals++;return await native.play();}
    catch{if(!stopped&&request===generation&&!signal.aborted&&!failed){failed=true;callbacks.onBlocked?.();}return false;}finally{if(request===generation)pending=false;}
   },pause(){cancel();native.pause();if(media){if(mediaStatus==='playing')mediaOffset=media.currentTime;media.pause();mediaStatus='paused';}},stop(){cancel();stopped=true;native.stop();releaseMedia();mediaStatus='paused';},get paused(){return !pending&&(media?mediaStatus!=='playing':native.paused);},get playing(){return media?mediaStatus==='playing':native.playing;},get ended(){return media?mediaStatus==='ended':native.ended;},get status(){return pending?'loading':failed?'blocked':media?mediaStatus:native.status;},get position(){return media?media.currentTime||mediaOffset:native.position;},get duration(){return media?Number.isFinite(media.duration)?media.duration:0:native.duration;},get backend(){return media?'media':pending&&native.audioContext?'webaudio':native.backend;},get contextState(){return native.contextState;},get audioContext(){return native.audioContext;}});
  }});return true;
 }
 const api=Object.freeze({version:'RC139',delayMs,voiceText,wait,mediaReady,installOriginal,metrics:()=>({...stats})});root.__HAPIL_NARRATION_START_RC139__=api;
 let attempts=0;function ready(){if(installOriginal()||++attempts>2000)return;root.setTimeout(ready,20);}ready();
 if(typeof module!=='undefined')module.exports={voiceText};
})(typeof window!=='undefined'?window:globalThis);
