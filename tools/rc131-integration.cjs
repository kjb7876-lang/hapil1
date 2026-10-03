'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
cp.execFileSync(process.execPath,[path.join(__dirname,'rc131-apply.cjs'),root],{stdio:'inherit'});
const file=path.join(root,'assets/combat-audio/v1/native-bridge.js');let bridge=fs.readFileSync(file,'utf8');
const from=`    function canStartEffect(path) {
      return !stopped && (!path || owns(path)) && !!controller.allowsEffects() && activeUploadedVoices() < 2;
    }`;
const to=`    function canStartEffect(path) {
      if(stopped || (path && !owns(path)) || !controller.allowsEffects())return false;
      const active=[];
      pools?.forEach((pool,source)=>{
        if(!owns(source))return;
        const pending=pendingClip(pool);
        for(const clip of new Set([...(pool.clips||[]),pending].filter(Boolean))){
          if(clip.__hapilCombatPending||clip===pending||(clip.paused===false&&!clip.ended))active.push({clip,pool,source,priority:Number(controller.profile(source)?.priority)||0});
        }
      });
      // Do not cut another sound for a cue whose own voice is still occupied.
      if(path && active.some(v=>canonical(v.source)===canonical(path)))return false;
      if(active.length<2)return true;
      const priority=Number(controller.profile(path)?.priority)||0;
      // Only clear feedback (hurt/parry) preempts; ordinary attacks never churn.
      if(priority<8)return false;
      const victim=active.filter(v=>v.priority<priority).sort((a,b)=>a.priority-b.priority)[0];
      if(!victim)return false;
      const {clip,pool}=victim;
      clip.__mongseSfxRequest=(clip.__mongseSfxRequest??0)+1;
      clip.__hapilCombatPending=false;
      if((pool.pending?.clip||pool.pending)===clip)pool.pending=null;
      try{clip.pause();}catch{}
      try{clip.currentTime=0;}catch{}
      return activeUploadedVoices()<2;
    }`;
if(!bridge.includes(to)){assert.equal(bridge.split(from).length,2,'Native bridge anchor');fs.writeFileSync(file,bridge.replace(from,to));}
const preserve=path.join(root,'tools/rc130-preservation.cjs');let p=fs.readFileSync(preserve,'utf8');
const anchor="  for(const file of [...files,'assets/rc130/audio-policy.js'])";
const extra="  const rc131=fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./assets/rc131/audio-cues.js');\n  if(rc131){put('tools/rc131-apply.cjs',fs.readFileSync(path.join(root,'tools/rc131-apply.cjs')));exec(process.execPath,['tools/rc131-apply.cjs'],scratch);}\n";
if(!p.includes(extra)){assert.equal(p.split(anchor).length,2,'Preservation replay anchor');fs.writeFileSync(preserve,p.replace(anchor,extra+anchor));}
console.log('RC131 priority bridge and explicit preservation replay integrated');
