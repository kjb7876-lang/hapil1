"""Render the review-only runtime draw commands with installed libcairo.
No editing/retouching of source assets. This is CPU rasterization, not a browser.
"""
import ctypes as C,json,pathlib
lib=C.CDLL('libcairo.so.2');ptr=C.c_void_p;D=C.c_double;I=C.c_int
class Matrix(C.Structure):_fields_=[(k,D)for k in ['xx','yx','xy','yy','x0','y0']]
def fn(name,result,args):
 f=getattr(lib,'cairo_'+name);f.restype=result;f.argtypes=args;return f
create=fn('image_surface_create',ptr,[I,I,I]);load=fn('image_surface_create_from_png',ptr,[C.c_char_p]);context=fn('create',ptr,[ptr]);rgb=fn('set_source_rgb',None,[ptr,D,D,D]);paint=fn('paint',None,[ptr]);save=fn('save',None,[ptr]);restore=fn('restore',None,[ptr]);transform=fn('transform',None,[ptr,C.POINTER(Matrix)]);rectangle=fn('rectangle',None,[ptr,D,D,D,D]);clip=fn('clip',None,[ptr]);move=fn('move_to',None,[ptr,D,D]);line=fn('line_to',None,[ptr,D,D]);close=fn('close_path',None,[ptr]);source=fn('set_source_surface',None,[ptr,ptr,D,D]);write=fn('surface_write_to_png',I,[ptr,C.c_char_p]);destroy=fn('destroy',None,[ptr]);surf_destroy=fn('surface_destroy',None,[ptr]);status=fn('surface_status',I,[ptr])
data=json.loads(pathlib.Path('qa/rc204/frames.json').read_text());images={}
for frame in data['frames']:
 surface=create(0,data['width'],data['height']);ctx=context(surface);rgb(ctx,.08,.09,.12);paint(ctx)
 for op in frame['ops']:
  path=op['path']
  if path not in images:
   images[path]=load(path.encode());assert status(images[path])==0,path
  save(ctx);m=Matrix(*op['m']);transform(ctx,C.byref(m));rectangle(ctx,*op['sourceBox']);clip(ctx)
  for polygon in [op.get('componentClip'),op.get('rootClip'),op.get('clip')]:
   if polygon:
    move(ctx,*polygon[0])
    for p in polygon[1:]:line(ctx,*p)
    close(ctx);clip(ctx)
  source(ctx,images[path],0,0);paint(ctx);restore(ctx)
 name='qa/rc204/rig-'+('left-'if frame['metadata']['dir']=='left'else'')+str(frame['metadata']['p']).replace('.','_')+'.png';assert write(surface,name.encode())==0;destroy(ctx);surf_destroy(surface)
for s in images.values():surf_destroy(s)
print('Rendered seven CPU runtime-command frames; source assets untouched.')
