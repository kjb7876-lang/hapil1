"""Plot shipped world admission on the original arena artwork.

These are source-derived diagnostics, not new browser screenshots. The art
rectangle is the exact RC138 map-format formula, before any camera transform.
"""
import json, os, pathlib, hashlib
os.environ.setdefault('MPLCONFIGDIR', '/tmp/hapil-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from PIL import Image

root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(os.environ.get('HAPIL_QA_OUTPUT','/tmp/hapil-rc226-floor'))
audit=json.loads((out/'floor-audit.json').read_text())
rows=[]
for item in audit['maps']:
    image_path=root/item['path'].removeprefix('./')
    im=Image.open(image_path).convert('RGB')
    width=min(1584,990*im.width/im.height)
    height=width*im.height/im.width
    left=640-width/2
    top=513-height*item['floorCenterY']
    fig,ax=plt.subplots(figsize=(12,8),dpi=140)
    fig.patch.set_facecolor('#10151f')
    ax.imshow(im,extent=(left,left+width,top+height,top))
    pts=lambda key:[(p['x'],p['y']) for p in item[key]]
    ax.add_patch(Polygon(pts('projectedPhysical'),closed=True,fill=False,edgecolor='white',linewidth=1.4,label='physical floor (radius 0)'))
    ax.add_patch(Polygon(pts('projectedFeet'),closed=True,fill=False,edgecolor='#ffd06a',linewidth=2,label='actor foot limit (radius 0.8)'))
    ax.add_patch(Polygon(pts('projectedLeft'),closed=True,facecolor='#4dffa1',alpha=.19,edgecolor='#4dffa1',linewidth=2,label='normal left foot area'))
    extensions=[r for r in audit['grid']['points'] if r['allowed'] and not r['oldLeft']]
    ax.scatter([640+(r['p']['x']-r['p']['y'])*27 for r in extensions],[(r['p']['x']+r['p']['y'])*13.5 for r in extensions],s=11,color='#ffb347',alpha=.7,label='existing penalty extension')
    for n,r in enumerate([r for r in audit['rays'] if r['zone']==item['zone'] and r['mode']=='manual' and r['phase']=='entry']):
        p=r['stop']['applied'];q=r['stop']['requested'];x=640+(p['x']-p['y'])*27;y=(p['x']+p['y'])*13.5
        ax.plot([640+(13.8-24.2)*27,x],[(13.8+24.2)*13.5,y],color='#58d8ff',linewidth=2)
        ax.scatter([x],[y],color='#ff4f6b',s=38,zorder=6)
        ax.annotate(f"STOP {n+1}: ({p['x']:.2f}, {p['y']:.2f})\nnext nativeAll = false",(x,y),xytext=(12,12 if n!=2 else -35),textcoords='offset points',color='white',fontsize=8,bbox={'facecolor':'#10151f','alpha':.8,'edgecolor':'none'})
    ax.set_xlim(left,left+width);ax.set_ylim(top+height,top)
    ax.legend(loc='upper right',facecolor='#171f2c',labelcolor='white',fontsize=8)
    ax.tick_params(colors='#bfcad8');ax.set_xlabel('Native projected X before camera',color='white');ax.set_ylabel('Native projected Y before camera',color='white')
    ax.set_title(f"{item['zone']} — artwork versus actual foot limits",color='white',fontsize=14)
    fig.text(.5,.025,f"CPU/source diagnostic | {audit['appSha'][:12]} | not a browser or device capture",ha='center',color='#bfcad8',fontsize=9)
    fig.tight_layout(rect=(0,.035,1,1))
    target=out/(item['zone']+'-floor-source-overlay.png');fig.savefig(target,facecolor=fig.get_facecolor());plt.close(fig)
    rows.append({'file':target.name,'kind':'CPU source overlay, not browser screenshot','sourceCommit':audit['appSha'],'art':str(image_path.relative_to(root)),'artSha256':hashlib.sha256(image_path.read_bytes()).hexdigest(),'rect':{'x':left,'y':top,'width':width,'height':height},'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
item=next(r for r in audit['maps'] if r['zone']=='dist01')
im=Image.open(root/item['path'].removeprefix('./')).convert('RGB')
width=min(1584,990*im.width/im.height);height=width*im.height/im.width
left=640-width/2;top=513-height*item['floorCenterY']
fig,axes=plt.subplots(1,2,figsize=(16,7),dpi=140);fig.patch.set_facecolor('#10151f')
for ax,view in zip(axes,audit['views'][:2]):
    c=view['camera'];v=view['view'];k=v['k'];scale=c['scale']*k
    x=(c['x']+left*c['scale']-v['x'])*k;y=(c['y']+top*c['scale']-v['y'])*k
    ax.imshow(im,extent=(x,x+width*scale,y+height*scale,y))
    ax.add_patch(Polygon([(p['x'],p['y']) for p in view['projectedFeet']],closed=True,fill=False,edgecolor='#ffd06a',linewidth=2))
    safe=[((c['x']+p['x']*c['scale']-v['x'])*k,(c['y']+p['y']*c['scale']-v['y'])*k) for p in item['projectedLeft']]
    ax.add_patch(Polygon(safe,closed=True,facecolor='#4dffa1',alpha=.2,edgecolor='#4dffa1'))
    ax.set_xlim(0,view['width']);ax.set_ylim(view['height'],0);ax.set_facecolor('#040810');ax.tick_params(colors='#bfcad8')
    ax.set_title(('Mobile landscape' if view['mobile'] else 'PC')+f" {view['width']}x{view['height']} — source projection",color='white',fontsize=12)
    ax.set_xlabel('Fixture CSS X',color='white');ax.set_ylabel('Fixture CSS Y',color='white')
fig.text(.5,.035,'Actual camera/viewport formulas; fixture body envelopes. Not a browser capture, touch test, or real device.',ha='center',color='#bfcad8',fontsize=10)
fig.tight_layout(rect=(0,.07,1,1));target=out/'pc-mobile-floor-projection.png';fig.savefig(target,facecolor=fig.get_facecolor());plt.close(fig)
rows.append({'file':target.name,'kind':'CPU camera projection; not browser screenshot','sourceCommit':audit['appSha'],'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(out/'visual-evidence.json').write_text(json.dumps(rows,indent=2))
print(json.dumps({'images':len(rows),'output':str(out)}))
