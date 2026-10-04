#!/usr/bin/env python3
"""Create additive native mixer catalog from verified processed candidates. No voice assignment."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'qa/rc133/audio-processing.json').read_text())
rows=m['derivedOutputs']; effects={}; music={}; events={}; assignments=[]
bycat={}
for r in rows: bycat.setdefault(r['candidateEventAndLimits']['candidateCategory'],[]).append(r)
def bind(event,cat,priority=2,group=None,cooldown=2.5):
    kinds=[]
    for i,r in enumerate(bycat.get(cat,[])):
        kind='rc133'+event[0].upper()+event[1:]+str(i)
        effects[kind]={'path':'./'+r['derivedPath'],'gain':1,'duration':r['derivedProbe']['duration_seconds'],'cooldown':cooldown,'voices':1,'duck':.6,'priority':priority,'group':group or event,'rc133':True,'sha256':r['derivedSha256'],'sourceSha256':r['sourceSha256']}
        kinds.append(kind);assignments.append({'event':event,'kind':kind,'path':r['derivedPath'],'evidence':'filename and signal category; nonvoice candidate, not auditioned','sourceSha256':r['sourceSha256']})
    if kinds:events[event]=kinds
bind('meleeHit','candidate_melee_impact',2,group='playerImpact')
bind('heavyHit','candidate_melee_impact',4,group='playerImpact')
bind('parry','candidate_parry_feedback',6,group='defense')
bind('dodge','candidate_dodge_bass_effect',5,group='defense')
bind('removal','candidate_magical_blink',3)
bind('innerReveal','candidate_illusion_creation',6)
bind('innerAwake','candidate_awakening_or_enemy_phase',7)
bind('innerShot','candidate_enemy_energy_attack',3,group='enemyEnergy')
bind('enemyEnergy','candidate_enemy_energy_attack',3,group='enemyEnergy')
bind('laserCharge','candidate_enemy_laser_charge',4)
bind('enemyRage','candidate_enemy_rage_activation',4)
# Existing admitted dark/roar/void/illusion callbacks get processed copies through aliases.
for native,event,cat in [('dark','enemyHeavy','candidate_enemy_heavy_attack'),('roar','enemyRoar','candidate_enemy_roar'),('blackHole','enemyVoid','candidate_void_absorption'),('illusion','enemyIllusion','candidate_illusion_creation')]:
    bind(event,cat,3)
    kind=events[event][0];effects[native]={**effects[kind],'rc133':False,'cooldown':6 if native=='dark' else 2.5}
for r in bycat['combat_bgm']:
    name=r['sourceOriginalFilename'];key='clockworkIntense' if 'Ticks (1)' in name else 'clockwork' if 'Clockwork' in name else 'timeControl' if 'Control' in name else 'foldingSpace' if 'Folding' in name else 'nearSilence'
    duration=r['derivedProbe']['duration_seconds'];music[key]={'path':'./'+r['derivedPath'],'gain':1,'duration':duration,'loopStart':0,'loopEnd':max(.1,duration-.1),'crossfade':2.5,'sha256':r['derivedSha256'],'sourceSha256':r['sourceSha256']}
js='/* Processed nonvoice media: originals and measurements remain in qa/rc133/audio-processing.json. */\n(()=>{const add='+json.dumps({'music':music,'effects':effects},ensure_ascii=False,separators=(',',':'))+'; const old=window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__??{};for(const group of Object.values(add))for(const value of Object.values(group))Object.freeze(value);window.__HAPIL_COMBAT_AUDIO_CATALOG_V1__=Object.freeze({...old,version:133,music:Object.freeze({...old.music,...add.music}),effects:Object.freeze({...old.effects,...add.effects})});window.__HAPIL_MEDIA_AUDIO_EVENTS_RC133__=Object.freeze('+json.dumps(events,separators=(',',':'))+');})();\n'
(root/'assets/rc133/media-catalog.js').write_text(js)
(root/'qa/rc133/audio-runtime-mapping.json').write_text(json.dumps({'schema':1,'policy':'Actual admitted native transactions/casts only; conservative nonvoice candidates, no audition or gender claim. Held voice originals remain unassigned.','processedCandidates':len(rows),'assignments':assignments,'music':music,'events':events,'heldVoices':[r['originalFilename'] for r in m['originalRecords'] if 'combat_hi' in r['originalFilename']]},ensure_ascii=False,indent=2)+'\n')
