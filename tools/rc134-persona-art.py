"""Extract individually reviewed source designs without changing RGBA pixels."""
import hashlib,json,pathlib
from PIL import Image,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/persona-skills-source'
OUTPUT=ROOT/'assets/rc134/persona-skills'
RECIPES={
 'small-orb':(2,(2,63,49,112)),
 'eye':(2,(195,429,353,506)),
 'diamond':(1,(300,8,353,96)),
 'clock':(2,(470,400,568,564)),
 'star':(2,(579,138,670,261)),
 'eclipse':(2,(1086,403,1293,587)),
 'lance':(2,(189,521,369,590)),
 'shield':(2,(673,401,839,554)),
 'vortex':(1,(934,676,1110,807)),
}
EXPECTED={1:'29b7bf33c3f45a98e6e4d84351c46422e98478eb13897a4208547fd530567d12',2:'dcd861c0d01b37b9e93b6105b97218d52bd2b1c526268746852f23fcbb122719'}
LIBRARY={1:'libfile_949c390ddda48191871b4cebb2e0f5d9',2:'libfile_0dc6a7c5a6f4819189835eef968cd83b'}
# The two pointed portal roofs in the next atlas row enter this rectangle's
# bottom corners. Remove only their alpha; retain swirl, orbiting shards and RGB.
MASKS={'vortex':[(0,114,40,131),(162,121,176,131)]}
def digest(b):return hashlib.sha256(b).hexdigest()
def main():
 OUTPUT.mkdir(parents=True,exist_ok=True);images={};sources=[];outputs=[]
 for i,expected in EXPECTED.items():
  p=SOURCE/f'persona-skills-atlas-{i}.png';assert digest(p.read_bytes())==expected
  im=Image.open(p);assert im.mode=='RGBA';images[i]=im
  sources.append({'path':str(p.relative_to(ROOT)),'library_file_id':LIBRARY[i],'sha256':expected,'size':list(im.size)})
 for key,(i,rect) in RECIPES.items():
  im=images[i].crop(rect);alpha=im.getchannel('A')
  for mask in MASKS.get(key,[]):alpha.paste(0,mask)
  im.putalpha(alpha);p=OUTPUT/(key+'.png');im.save(p)
  assert Image.open(p).tobytes()==im.tobytes()
  outputs.append({'key':key,'path':str(p.relative_to(ROOT)),'source':str((SOURCE/f'persona-skills-atlas-{i}.png').relative_to(ROOT)),'sourceSha256':EXPECTED[i],'sourceRect':list(rect),'alphaOnlyRectMasks':MASKS.get(key,[]),'maskCoordinateSpace':'output-local, half-open','size':list(im.size),'sha256':digest(p.read_bytes()),'rgbaSha256':digest(im.tobytes()),'alphaExtrema':list(im.getchannel('A').getextrema()),'operations':['exact half-open rectangle crop']+(['alpha-only exclusion of adjacent portal roofs'] if key in MASKS else [])+['PNG lossless encoding'],'sourceHeading':0 if key in ['eye','lance'] else None})
 report={'version':1,'coordinateConvention':'sourceRect=[left,top,right,bottom], right/bottom exclusive; independent designs, not animation frames','sources':sources,'outputs':outputs,'policy':'No generation, recoloring, chroma key, alpha threshold, resampling or labels. Only documented adjacent-row portal alpha is excluded. Originals are preserved. Runtime rotation follows native projectile direction; round motifs stay upright. Body and arena remain existing art.'}
 (OUTPUT/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 # QA-only composited previews include labels; these are never runtime assets.
 dest=pathlib.Path('/workspace/rc133-tools/persona-art-review');dest.mkdir(parents=True,exist_ok=True)
 panel=Image.new('RGB',(3*450,3*240),'#152030');draw=ImageDraw.Draw(panel)
 for index,(key,(i,rect)) in enumerate(RECIPES.items()):
  im=Image.open(OUTPUT/(key+'.png'));x=index%3*450;y=index//3*240
  draw.text((x+8,y+5),key+' / atlas'+str(i)+' '+str(rect),fill='white')
  for j,color in enumerate(['#07070b','#eee7df']):
   layer=Image.new('RGBA',(215,210),color);layer.alpha_composite(im,((215-im.width)//2,(210-im.height)//2));panel.paste(layer.convert('RGB'),(x+j*225,y+25))
 panel.save(dest/'individual-crops.png');print(json.dumps({'sources':len(sources),'outputs':len(outputs),'review':str(dest/'individual-crops.png')}))
if __name__=='__main__':main()
