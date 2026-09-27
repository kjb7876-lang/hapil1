"""Deterministic, verbatim RC51 narrative export; split indexes are authored scene boundaries."""
from pathlib import Path
import re,json,hashlib
root=Path(__file__).resolve().parents[2]
source=root/'data/rc51/canonical.txt'
raw=source.read_text(encoding='utf-8-sig')
heads=list(re.finditer(r'^\[(\d+) · (\w+)\] (.+)$',raw,re.M))
splits=dict(dist00=2,dist01=2,dist02=2,dist03=2,dist04=1,dist05=1,dist06=1,ep1a08=2,ep1a09=3,ep1a10=3,ep1a11=5,ep1b01=3,ep1b02=3,ep1b03=3,ep1b04=3,ep1b05=3,ep1b06=2,ep1b06b=2,ep1b07=3,ep1b08=3,ep1b09=4,u201=6,u202=4,u204=4,u205=2,u206=4,u203=1,last304=2,last305=2,last301=2,last302=2,last303=2,kair01=5,kair04=2,kair05=2,kair06=1,kair07=2,kair08=1,kair09=1,kair10=2,kair02=2,kair03=5,hando01=2,hando02=2,hando03=2,murder01=3,murder02=5,murder04=7,murder03=3,cult01=3,cult02=2,cult05=2,cult06=2,cult03=4,cult04=1)
rest={'dreamRest','restEp1b','restU2','restLast3','restKairo','restHando'}
records=[]; chapter='제1부 — 마지막 수호자 EGO'; narrator='〈EGO의 기억〉'
for i,m in enumerate(heads):
 body=raw[m.end():heads[i+1].start() if i+1<len(heads) else len(raw)].strip()
 body=re.sub(r'\n*\[08-삭제된기록\]\s*','',body)
 # Part headings belong to the following map, not the preceding victory.
 part=re.search(r'^제\d+부 — .+$',body,re.M)
 tail=body[part.start():].strip() if part else ''
 if part: body=body[:part.start()].strip()
 ps=re.split(r'\n\s*\n',body)
 if m[2]=='dist04': ps=['\n'.join(ps[0].splitlines()[:3]),'\n'.join(ps[0].splitlines()[3:])]
 k=splits.get(m[2],max(1,len(ps)//2))
 r=dict(zone=m[2],index=int(m[1]),title=m[3],chapter=chapter,narrator=narrator,paragraphs=ps,rest=m[2] in rest,pre='\n\n'.join(ps[:k]),post='\n\n'.join(ps[k:]))
 if m[2]=='cult04':
  r.update(post='\n\n'.join(ps[10:]),firstPost='\n\n'.join(ps[1:7]),awakenPre='\n\n'.join(ps[7:10]))
 records.append(r)
 if tail:
  chapter=tail.splitlines()[0]
  narrator='\n'.join(tail.splitlines()[1:])
# The deleted record has no replacement prose. Reuse the preceding fall's
# final paragraphs in the existing void map, preserving every source sentence.
fall=next(r for r in records if r['zone']=='dist06')
ps=fall['paragraphs'];fall['post']=ps[1]
records.insert(records.index(fall)+1,dict(zone='ep1a07',index=8,title='추락의 기억',chapter=fall['chapter'],narrator=fall['narrator'],paragraphs=ps[2:],rest=False,pre=ps[2],post='\n\n'.join(ps[3:]),sourceZone='dist06'))
fall['paragraphs']=ps[:2]
# Rest passages are placed, in order, across the adjacent victory/entry cards.
# There are still exactly two cards between successive battles.
for i,r in enumerate(records):
 if not r['rest']:continue
 prev=records[i-1];nxt=records[i+1];ps=r['paragraphs']
 best=min(range(len(ps)+1),key=lambda k:max(len(prev['post'])+len('\n\n'.join(ps[:k])),len(nxt['pre'])+len('\n\n'.join(ps[k:]))))
 prev['post']='\n\n'.join(x for x in [prev['post'],r['chapter']+'\n'+r['narrator'] if best else '',*ps[:best]] if x)
 nxt['pre']='\n\n'.join(x for x in [r['chapter']+'\n'+r['narrator'] if not best else '',*ps[best:],nxt['chapter']+'\n'+nxt['narrator'] if nxt['chapter']!=r['chapter'] else '',nxt['pre']] if x)
 r['pre']=r['post']=''
result={'version':'RC51','sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'raw':raw,'records':records}
(root/'data/story-rc51.js').write_text('/* Generated from the uploaded, byte-preserved source. */\nwindow.__HAPIL_STORY_DATA_RC51__ = '+json.dumps(result,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Records:',len(records),'combat:',sum(not r['rest'] for r in records),'maximum card:',max((len(r[k]),r['zone'],k) for r in records for k in ['pre','post','firstPost','awakenPre'] if k in r))
