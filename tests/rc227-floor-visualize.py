"""SHA-linked source/CPU diagrams. These are not browser screenshots."""
import os,json,pathlib,hashlib
os.environ.setdefault('MPLCONFIGDIR','/tmp/hapil-matplotlib')
os.environ.setdefault('XDG_CACHE_HOME','/tmp/hapil-font-cache')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np
from PIL import Image

root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(os.environ['HAPIL_QA_OUTPUT'])
r=json.loads((out/'floor-patch-result.json').read_text())
a=json.loads((out/'floor-audit.json').read_text())
assert r['appSha']==a['appSha']
image_path=root/r['surface']['asset'];assert hashlib.sha256(image_path.read_bytes()).hexdigest()==r['surface']['sha256']
im=Image.open(image_path);width=min(1584,990*im.width/im.height);height=width*im.height/im.width;left=640-width/2;top=513-height*.5
project=lambda p:(640+(p['x']-p['y'])*27,(p['x']+p['y'])*13.5)
old=[project(p) for p in a['polygons']['left']];cell=[project(p) for p in r['footCell']];surface=[project(p) for p in r['surface']['corners']]
manifest=[]
def background(ax):
    ax.imshow(im,extent=(left,left+width,top+height,top))
    ax.add_patch(Polygon(old,closed=True,fill=False,edgecolor='#ffd36c',linewidth=1.6,label='old left foot limit'))
    ax.add_patch(Polygon(surface,closed=True,fill=False,edgecolor='#68daff',linewidth=1.4,label='reviewed paving surface'))
    ax.add_patch(Polygon(cell,closed=True,facecolor='#64ffb0',alpha=.4,edgecolor='#64ffb0',linewidth=2,label='new centers after radius 0.8 inset'))
def save(fig,name):
    fig.text(.5,.025,f"CPU/source diagnostic | {r['appSha']} | NOT a browser/device capture",ha='center',fontsize=8,color='#c8d4df')
    fig.tight_layout(rect=(0,.045,1,1));p=out/name;fig.savefig(p,facecolor=fig.get_facecolor());plt.close(fig)
    manifest.append({'file':name,'appSha':r['appSha'],'kind':'source-integrated CPU diagram, not browser screenshot','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'artSha256':r['surface']['sha256']})

fig,ax=plt.subplots(figsize=(12,8),dpi=140);fig.patch.set_facecolor('#10151f');background(ax)
for key,color in [('before','#ffda70'),('after','#ff7ac5')]:
    p=project(r[key]['end']);ax.scatter(*p,color=color,s=45,zorder=6);ax.annotate(key+' stop '+str(tuple(round(r[key]['end'][k],3) for k in ['x','y'])),p,(12,-18 if key=='before' else 20),textcoords='offset points',fontsize=9,color=color,bbox={'facecolor':'#07121e','alpha':.85,'edgecolor':'none'})
ax.set_xlim(left,left+width);ax.set_ylim(top+height,top);ax.legend(loc='upper right',fontsize=8);ax.set_title('DIST01: old mirrored-square stop and reviewed paving cell',color='white');ax.tick_params(colors='white');save(fig,'cave-floor-reviewed-cell.png')

fig,ax=plt.subplots(figsize=(12,8),dpi=150);fig.patch.set_facecolor('#10151f');background(ax)
for p in r['footCell']:
    theta=np.linspace(0,2*np.pi,100);xs=p['x']+.8*np.cos(theta);ys=p['y']+.8*np.sin(theta);ax.plot(640+(xs-ys)*27,(xs+ys)*13.5,color='#c5ffdf',lw=1)
points=[project(p) for p in r['after']['samples']];ax.plot(*zip(*points),color='#ff82cb',lw=2,label='native applied path')
blocked=project({'x':4.5,'y':23});ax.scatter(*blocked,color='#ff6262',marker='x',s=80,label='rock-side point remains blocked')
ax.set_xlim(50,500);ax.set_ylim(490,290);ax.legend(loc='lower right',fontsize=8);ax.set_title('Cave paving / rock wall: complete foot-radius clearance',color='white');ax.tick_params(colors='white');save(fig,'cave-floor-wall-clearance-zoom.png')

fig,axes=plt.subplots(1,2,figsize=(15,7),dpi=140);fig.patch.set_facecolor('#10151f')
for ax,v in zip(axes,r['views'][:2]):
    c=v['camera'];view=v['view'];k=view['k'];scale=c['scale']*k
    transform=lambda p:((c['x']+p[0]*c['scale']-view['x'])*k,(c['y']+p[1]*c['scale']-view['y'])*k)
    x,y=transform((left,top));ax.imshow(im,extent=(x,x+width*scale,y+height*scale,y))
    ax.add_patch(Polygon([transform(p) for p in old],closed=True,fill=False,edgecolor='#ffd36c',lw=1.5))
    ax.add_patch(Polygon([transform(p) for p in cell],closed=True,facecolor='#64ffb0',edgecolor='#64ffb0',alpha=.9))
    ax.set_xlim(0,v['width']);ax.set_ylim(v['height'],0);ax.set_facecolor('#050b13');ax.tick_params(colors='white');ax.set_title(f"{'Mobile landscape' if v['mobile'] else 'PC'} {v['width']}x{v['height']} source camera",color='white')
save(fig,'cave-floor-pc-mobile-source-projection.png')
(out/'visual-evidence.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'images':len(manifest),'sourceSha':r['appSha'],'kind':'CPU diagrams'}))
