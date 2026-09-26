/* HAPIL 3.14.04 — owner/terminal rendering stages.
 * One explicit entry for five previously nested effect wrappers and one entry
 * for the theme/exit projectile pair. Gameplay constructors and lifetimes stay
 * in the native simulation. Exit observation records the same rendered poses.
 */
(function(root){'use strict';
 const VERSION='3.14.04-RC1';
 function need(fn,name){if(typeof fn!=='function')throw new TypeError('Owner renderer missing '+name);return fn;}
 function createEffects(legacy,partyLaser){
  need(legacy,'legacy effects');need(partyLaser,'party laser');
  const stages={salvo:null,theme:null,exit:null,material:null};
  const counts={calls:0,material:0,exit:0,theme:0,salvo:0,partyLaser:0,legacy:0};let sealed=false;
  function configure(name,fn){
   if(!Object.hasOwn(stages,name))throw new TypeError('Unknown effect stage '+name);
   need(fn,name);if(sealed)throw new Error('Effect stages already sealed');
   if(stages[name]&&stages[name]!==fn)throw new Error('Duplicate effect stage '+name);
   stages[name]=fn;
  }
  function draw(ctx,cache,e,time,settings={}){
   counts.calls++;
   // Each continuation belongs to this call. Nested draws cannot overwrite
   // another call's context, owner or captured legacy continuation.
   function delivery(){
    if(stages.salvo&&stages.salvo(ctx,cache,e,time,settings)){counts.salvo++;return;}
    if(partyLaser(ctx,e,time,settings)){counts.partyLaser++;return;}
    counts.legacy++;return legacy(ctx,cache,e,time,settings);
   }
   function themed(){if(stages.theme){counts.theme++;return stages.theme(ctx,cache,e,time,settings,delivery);}return delivery();}
   function observed(){if(stages.exit){counts.exit++;return stages.exit(ctx,e,time,themed,settings);}return themed();}
   if(stages.material){counts.material++;return stages.material(ctx,cache,e,time,settings,observed);}
   return observed();
  }
  function seal(){if(Object.values(stages).some(f=>typeof f!=='function'))throw new Error('Incomplete effect stage installation');sealed=true;}
  return Object.freeze({draw,configure,seal,complete:()=>Object.values(stages).every(f=>typeof f==='function'),
   snapshot:()=>Object.freeze({...counts,sealed,stages:Object.freeze(Object.fromEntries(Object.entries(stages).map(([k,v])=>[k,!!v])))}),
   order:Object.freeze(['material-owner-scope','exit-pose-observation','theme-terminal-bomb-pollution-collaboration','hero-delivery','party-laser','legacy-effects'])});
 }
 function createProjectiles(legacy,theme){
  need(legacy,'legacy projectiles');need(theme,'projectile theme');let exit=null,sealed=false;
  const counts={calls:0,exit:0,theme:0,legacy:0};
  function configure(name,fn){if(name!=='exit')throw new TypeError('Unknown projectile stage '+name);need(fn,name);if(sealed)throw new Error('Projectile stages already sealed');if(exit&&exit!==fn)throw new Error('Duplicate projectile exit stage');exit=fn;}
  function draw(ctx,cache,e,time,settings={}){
   counts.calls++;
   function next(){counts.legacy++;return legacy(ctx,cache,e,time,settings);}
   function themed(){counts.theme++;return theme(ctx,cache,e,time,settings,next);}
   if(exit){counts.exit++;return exit(ctx,e,time,themed,settings);}return themed();
  }
  function seal(){if(!exit)throw new Error('Incomplete projectile installation');sealed=true;}
  return Object.freeze({draw,configure,seal,complete:()=>!!exit,snapshot:()=>Object.freeze({...counts,sealed}),
   order:Object.freeze(['exit-pose-observation','mob-bitmap-or-owner-scope','legacy-projectiles'])});
 }
 let effects=null,projectiles=null;
 const routes={version:VERSION,installed:true,createEffects,createProjectiles,
  startEffects(legacy,laser){if(effects)throw new Error('Duplicate effect router');effects=createEffects(legacy,laser);return effects;},
  useEffects(name,fn){if(!effects)throw new Error('Effect router is not ready');effects.configure(name,fn);},
  startProjectiles(legacy,theme){if(projectiles)throw new Error('Duplicate projectile router');projectiles=createProjectiles(legacy,theme);return projectiles;},
  useProjectiles(name,fn){if(!projectiles)throw new Error('Projectile router is not ready');projectiles.configure(name,fn);},
  complete:()=>!!effects?.complete()&&!!projectiles?.complete(),
  seal(){if(!routes.complete())throw new Error('Incomplete owner routing');effects.seal();projectiles.seal();},
  snapshot:()=>Object.freeze({version:VERSION,effects:effects?.snapshot()??null,projectiles:projectiles?.snapshot()??null})};
 root.__HAPIL_OWNER_PIPELINE_V31404__=Object.freeze(routes);
})(typeof window!=='undefined'?window:globalThis);
