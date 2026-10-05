/* Verified user atlases. Cropped pixels are presentation; native collision stays authoritative. */
(function(root){
 'use strict';
 const base='./assets/rc133/art/',paths={map:base+'arena.webp',reveal:base+'reveal.webp',body:base+'base-0.png',awakening:base+'awake-0.png',portrait:base+'portrait.png',eclipse:base+'awakening-eclipse.png'};
 const frames=Array.from({length:8},(_,i)=>base+'base-'+i+'.png'),awakeFrames=Array.from({length:8},(_,i)=>base+'awake-'+i+'.png');
 const skillNames=['small-orb','eye','diamond','clock','star','eclipse','lance','shield','vortex'];
 const skills=Object.fromEntries(skillNames.map(k=>[k,base+k+'.png']));
 const personaSkills=Object.fromEntries(skillNames.map(k=>[k,'./assets/rc134/persona-skills/'+k+'.png?v=43402']));
 const samongSkills=Object.fromEntries(skillNames.map(k=>[k,skills[k]]));
 const personaTraitSkills={hwando:personaSkills.lance,seoha:personaSkills.clock,neon:personaSkills.star,michaela:personaSkills.diamond,lauren:personaSkills.vortex,hunter:personaSkills.eye,slayer:personaSkills.eclipse,gunner:personaSkills['small-orb']};
 const traitSkills={hwando:skills.lance,seoha:skills.clock,neon:skills.star,michaela:skills.diamond,lauren:skills.vortex,hunter:skills.eye,slayer:skills.eclipse,gunner:skills['small-orb']};
 // The revision also invalidates prior PNG crops in returning browsers.
 const chrono=Array.from({length:16},(_,i)=>base+'chrono-'+i+'.png?v=43305');
 const pictures=new Map(),failed=new Set();let ready=false;
 // The optional generated eclipse is excluded from the required set: its failure cannot hide source frames.
 const required=[paths.map,paths.reveal,paths.portrait,...frames,...awakeFrames,...Object.values(skills),...Object.values(personaSkills),...chrono];
 function load(path){return new Promise(resolve=>{const im=new Image();pictures.set(path,im);if(path.includes('/rc134/persona-skills/'))pictures.set(path.split(/[?#]/)[0],im);im.decoding='async';im.onload=()=>resolve(true);im.onerror=()=>{failed.add(path);resolve(false);};im.src=path;});}
 function picture(path){const im=pictures.get(path);return im?.complete&&im.naturalWidth?im:null;}
 function effect(kind){return picture(['guard','parry','dream-guard'].includes(kind)?skills.shield:kind==='dodge'?skills.vortex:kind==='cancel'?skills.star:kind==='heavy'||kind==='critical'?skills.lance:skills['small-orb']);}
 const api=Object.freeze({paths,frames,awakeFrames,skills,traitSkills,personaSkills,samongSkills,personaTraitSkills,personaAwakening:personaSkills.eclipse,chrono,assets:()=>required.slice(),picture,effect,get ready(){return ready;},diagnostics:()=>({ready,decoded:required.filter(p=>picture(p)).length,required:required.length,failed:[...failed]})});root.__HAPIL_MEDIA_ART_RC133__=api;
 Promise.all(required.map(load)).then(ok=>{if(!ok.every(Boolean))return;ready=root.__HAPIL_INNER_FINAL_RC133__?.configure({ready:true,...paths,frames,awakeFrames,skills:[...Object.values(personaSkills),...Object.values(samongSkills)],skillMap:personaSkills,samongSkillMap:samongSkills,traitSkills:personaTraitSkills,pivot:[.5,.96],canvas:[224,400]})===true;});
 load(paths.eclipse);
})(window);
