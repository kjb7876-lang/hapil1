/* HAPIL v3.14.03 presentation routing. No game rules, HP, collision, PRNG or save writes.
 * These factories absorb verified OUTER wrappers only, not the remaining legacy renderer.
 * Single branch ownership preserves the actual v31402 trace order.
 */
(function(root){'use strict';
 const VERSION='3.14.03-RC1';
 function requireFunctions(deps,names){
  if(!deps||names.some(k=>typeof deps[k]!=='function'))throw new TypeError('Render pipeline dependencies: '+names.join(', '));
 }
 function createEffects(deps){
  requireFunctions(deps,['legacy','owner','context','impact','guard']);
  const {legacy,owner,context,impact,guard}=deps;
  const count={calls:0,retiredAwakening:0,awakening:0,owned:0,impact:0,guard:0,legacy:0,enhanced:0};
  function draw(ctx,cache,e,time,settings={}){
   count.calls++;
   // Restore the authored v31357 origin flare, which the previous router retired.
   if(e?.awakeningOriginV31357){const drawn=root.__HAPIL_AWAKENING_V31357__?.draw(ctx,cache,e,time,settings)??false;if(drawn)count.awakening++;else count.retiredAwakening++;return drawn;}
   const id=owner(e),view=id?context(ctx,id):ctx;if(id)count.owned++;
   function composed(drawBase){
    const result=drawBase();
    if(typeof deps.enhance==='function'&&deps.enhance(view,cache,e,time,settings))count.enhanced++;
    return result;
   }
   // A contact image is a terminal route, never followed by a second bitmap.
   if(impact(view,cache,e,time,settings)){count.impact++;return composed(()=>true);}
   // Compatibility draw hook is currently a documented no-op. Keeping the explicit
   // hook preserves the former callback contract without an extra Gn wrapper.
   if(guard(view,cache,e,time,settings)){count.guard++;return composed(()=>true);}
   count.legacy++;return composed(()=>legacy(view,cache,e,time,settings));
  }
  return Object.freeze({version:VERSION,draw,snapshot:()=>Object.freeze({...count}),
   order:Object.freeze(['awakening-origin','owner-context','contact-impact','guard-compatibility','legacy-effects'])});
 }
 function createActors(deps){
  requireFunctions(deps,['legacy','context','walk']);
  const {legacy,context,walk}=deps,count={calls:0,hwandoCloth:0,authoredWalk:0,legacy:0};
  const isHwando=path=>typeof path==='string'&&(/\/hero_direction33[47]\/hwando\//.test(path)||/\/heroes\/(?:normalized\/)?[^?]*hwando/.test(path));
  function draw(ctx,cache,path,x,y,size,options={}){
   count.calls++;let view=ctx;
   if(isHwando(path)&&!ctx.__heroContextOwnerV31364){view=context(ctx,'hwando',true);count.hwandoCloth++;}
   if(walk(view,cache,x,y,options)){count.authoredWalk++;return;}
   count.legacy++;return legacy(view,cache,path,x,y,size,options);
  }
  return Object.freeze({version:VERSION,draw,isHwando,snapshot:()=>Object.freeze({...count}),
   order:Object.freeze(['hwando-cloth-context','authored-side-walk','legacy-actor'])});
 }
 root.__HAPIL_RENDER_PIPELINE_V31403__=Object.freeze({version:VERSION,installed:true,createEffects,createActors});
})(typeof window!=='undefined'?window:globalThis);
