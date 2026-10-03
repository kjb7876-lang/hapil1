'use strict';
// Exact integration only. Used identically for release and preservation replay.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
function edit(file,changes){const p=path.join(root,file);let text=fs.readFileSync(p,'utf8');for(const[from,to]of changes){if(text.includes(to))continue;assert.equal(text.split(from).length-1,1,'RC131 anchor: '+file+' / '+from.slice(0,90));text=text.replace(from,to);}fs.writeFileSync(p,text);}
edit('assets/index-v31526.js',[
 ["if(HAPIL_uploadedSfx&&(!HAPIL_combatAudio.allowsEffects()||!HAPIL_combatAudioBridgeRef.current?.canStartEffect()))return;","if(HAPIL_uploadedSfx&&!HAPIL_combatAudio.allowsEffects())return;"],
 ['if (i && a < i.readyAt) return;','if (i && a < i.readyAt) return;\n      if(HAPIL_uploadedSfx&&!HAPIL_combatAudioBridgeRef.current?.canStartEffect(e))return;'],
 ['t.pause();HAPIL_combatAudio.failed(e)','t.pause();HAPIL_combatAudio.failed(e);window.__HAPIL_AUDIO_CUES_RC131__?.failed(e)']
]);
edit('assets/rc128/combat-feedback.js',[["{channel:f.outgoing?'enemy-hit':f.kind==='guard'?'guard':'ally-hurt',heroId:s.activeHeroId}","{channel:f.outgoing?'enemy-hit':f.kind==='guard'?'guard':'ally-hurt',heroId:s.activeHeroId,contactResult:row.result}"]]);
edit('assets/rc23/feedback.js',[
 ['channel:event.channel,heroId:event.heroId,at:s.time','channel:event.channel,heroId:event.heroId,contactResult:event.contactResult,at:s.time'],
 ['if(!fresh.length||now-m.last<.12||m.voices.length>=2)return;','if(!fresh.length||now-m.last<.12)return;\n  const urgent=fresh.some(e=>e.channel===\'ally-hurt\');if(m.voices.length>=2&&!urgent)return;']
]);
edit('index.html',[
 ['    <script src="./assets/combat-audio/v1/controller.js?v=2026100304"></script>','    <script src="./assets/rc131/audio-cues.js?v=43101"></script>\n    <script src="./assets/combat-audio/v1/controller.js?v=2026100304"></script>'],
 ['./assets/combat-audio/v1/native-bridge.js?v=2026100304','./assets/combat-audio/v1/native-bridge.js?v=43101'],
 ['assets/index-v31526.js?v=2026100304','assets/index-v31526.js?v=43101']
]);
// The other two edited loaders use versioned numeric query parameters.
for(const relative of ['assets/rc23/feedback.js','assets/rc128/combat-feedback.js']){
 const file=path.join(root,'index.html'),text=fs.readFileSync(file,'utf8'),escaped=relative.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp(escaped+'\\?v=\\d+','g'),matches=text.match(re)||[];assert.equal(matches.length,1);fs.writeFileSync(file,text.replace(re,relative+'?v=43101'));
}
console.log('RC131 exact native integration applied');
