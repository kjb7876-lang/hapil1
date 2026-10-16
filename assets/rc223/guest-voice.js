/* RC223: a guest follows one current host cue using the existing narration player. */
(function(root){
  'use strict';
  function createController(env=root){
    let sessionKey=null,epoch=null,initialized=false,highestCue=0,current=null,generation=0,gestureSeen=false;
    const context=value=>({sound:value?.sound!==false,voiceVolume:Number.isFinite(Number(value?.voiceVolume))?Math.max(0,Math.min(1,Number(value.voiceVolume))):.8});
    const audible=ctx=>ctx.sound&&ctx.voiceVolume>0;
    const valid=cue=>!!cue&&Number.isSafeInteger(cue.cueId)&&cue.cueId>0&&typeof cue.zone==='string'&&typeof cue.phase==='string'&&(cue.key===`${cue.zone}:${cue.phase}`||cue.key==='death:verse'||cue.key==='ending:title')&&typeof cue.text==='string'&&cue.text.length>0&&cue.text.length<=200000;
    function clear(){generation++;const old=current;current=null;old?.player?.stop?.();}
    function leave(){clear();sessionKey=null;epoch=null;initialized=false;highestCue=0;}
    function invalidate(nextEpoch){if(epoch===nextEpoch)return;clear();epoch=nextEpoch;}
    function isCurrent(record){return current===record&&record.generation===generation&&record.root?.isConnected!==false;}
    function attempt(record){
      if(!isCurrent(record)||!record.autoEligible||record.userPaused||!record.needsGesture||!gestureSeen||env.document?.hidden||!audible(record.ctx)||['playing','loading','ended','unavailable'].includes(record.player?.status))return;
      record.needsGesture=false;
      Promise.resolve(record.player?.play?.()).then(ok=>{if(isCurrent(record)&&ok===false&&!record.userPaused&&!['playing','loading','ended','unavailable'].includes(record.player?.status))record.needsGesture=true;}).catch(()=>{if(isCurrent(record)&&!record.userPaused)record.needsGesture=true;});
    }
    function sync({sessionKey:nextSession,epoch:nextEpoch=0,isHost=false,hasSnapshot=true,cue,root:card,ctx:settings={}}={}){
      if(isHost){leave();return null;}
      if(!nextSession){leave();return null;}
      if(nextSession!==sessionKey){leave();sessionKey=nextSession;epoch=nextEpoch;}
      else if(nextEpoch!==epoch)invalidate(nextEpoch);
      if(!hasSnapshot)return null;
      const baseline=!initialized;initialized=true;
      if(!valid(cue)||!card){clear();return null;}
      const signature=JSON.stringify([cue.cueId,cue.zone,cue.phase,cue.key,cue.text]),ctx=context(settings);
      if(current?.signature===signature&&current.root===card){current.ctx=ctx;current.player?.setContext?.(ctx);return current.player;}
      const fresh=cue.cueId>highestCue;highestCue=Math.max(highestCue,cue.cueId);clear();
      const record={signature,generation,root:card,ctx,userPaused:false,autoEligible:!baseline&&fresh&&!['ended','unavailable'].includes(cue.status),needsGesture:true,player:null};current=record;
      record.player=env.__HAPIL_STORY_NARRATION_V1__?.attach?.({root:card,footer:card.querySelector?.('.rc51-footer'),text:cue.text,zone:cue.zone,phase:cue.phase,key:cue.key,originalScene:cue.zone==='dist00'&&(cue.phase==='pre'||cue.phase==='post'),autoplay:false,ctx,
        onUserPause(){if(isCurrent(record)){record.userPaused=true;record.needsGesture=false;}},
        onPlaying(){if(isCurrent(record)){record.userPaused=false;record.needsGesture=false;}},
        onBlocked(){if(isCurrent(record)&&!record.userPaused)record.needsGesture=true;}
      })??null;
      attempt(record);return record.player;
    }
    function gesture(event){
      if(event?.isTrusted!==true)return;
      gestureSeen=true;
      // The native button owns its click intent; a second play here could turn it into Pause.
      if(event.target?.closest?.('[data-narration-controls]')){if(event.type==='keydown'){event.stopImmediatePropagation?.();if(['Enter','Space'].includes(event.code)&&event.target?.tagName==='BUTTON'){event.preventDefault?.();if(!event.repeat)event.target.click?.();}}return;}
      if(event.repeat===true)return;
      if(current)attempt(current);
    }
    env.document?.addEventListener?.('visibilitychange',()=>{if(!env.document.hidden&&current)attempt(current);});
    env.addEventListener?.('pointerdown',gesture,{capture:true,passive:true});env.addEventListener?.('keydown',gesture,{capture:true});env.addEventListener?.('keyup',event=>{if(event.target?.closest?.('[data-narration-controls]'))event.stopImmediatePropagation?.();},{capture:true});
    return Object.freeze({sync,invalidate,leave,gesture,status:()=>({sessionKey,epoch,initialized,highestCue,hasCue:!!current,playerStatus:current?.player?.status??null,userPaused:!!current?.userPaused,pendingGesture:!!current?.needsGesture,gestureSeen})});
  }
  if(root.document)root.__HAPIL_GUEST_VOICE_RC223__=createController(root);
  if(typeof module!=='undefined'&&module.exports)module.exports={createController};
})(typeof window!=='undefined'?window:globalThis);
