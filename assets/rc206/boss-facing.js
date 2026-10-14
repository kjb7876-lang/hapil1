/* RC206: facing is measured on the projected floor, independently of movement.
 * Resolve per-path baked/source facing before actor-wide legacy metadata. */
(function(root){'use strict';
 const clean=p=>String(p??'').split(/[?#]/)[0],sign=n=>Number(n)<0?-1:1;
 const inspected={"./assets/generated-v31224/actors-normalized/cfb37917e7c0_dist_dying_messenger_shadow.webp":"left","./assets/dist/generated-v393/dist_dying_messenger_shadow.webp":"left","./assets/generated-v31224/actors-normalized/1a8ca2c5759b_ep1b03_envy_sister_phase0.webp":"left","./assets/episode1b/generated-v3110/ep1b03_envy_sister_phase0.webp":"right","./assets/generated-v31224/actors-normalized/bc3b043bbed6_lust-attack.webp":"left","./assets/episode1b/generated-v3126/lust-attack.webp":"right","./assets/generated-v31224/actors-normalized/993008dd765e_wrath-attack.webp":"left","./assets/episode1b/generated-v3126/wrath-attack.webp":"right","./assets/generated-v31224/actors-normalized/a735a92c69d1_wrath-hit.webp":"left","./assets/episode1b/generated-v3126/wrath-hit.webp":"right","./assets/generated-v31224/actors-normalized/9f845f4d58bf_envy-human-attack.webp":"left","./assets/episode1b/generated-v3128/envy-human-attack.webp":"right","./assets/generated-v31224/actors-normalized/b00c6229c058_wrath-human-attack.webp":"left","./assets/episode1b/generated-v3128/wrath-human-attack.webp":"right"};
 let document=null,paths=new Map();
 function refresh(){const d=root.__MONGSE_ACTOR_CANVAS_MAP_V31224__;if(d===document)return;document=d;paths=new Map();for(const [path,row]of Object.entries(d?.entries??{})){paths.set(clean(path),row.sourceFacing);paths.set(clean(row.output),row.bakedFacing);}}
 function desired(s,a){if(Number.isFinite(a?.rc206FacingProbe))return sign(a.rc206FacingProbe);if(!s||!a)return sign(a?.facing);const dx=(Number(s.x)-Number(s.y))-(Number(a.x)-Number(a.y));return Number.isFinite(dx)&&Math.abs(dx)>.12?sign(dx):sign(a.facing);}
 function source(path,fallback='right'){refresh();return inspected[clean(path)]??paths.get(clean(path))??fallback;}
 function scale(s,a,path,fallback='right'){return desired(s,a)*(source(path,fallback)==='left'?-1:1);}
 function death(s,a,row){if(!row||!(a?.boss||a?.midboss||a?.echoBossImageCloneV31368)||a.cosmicLuciferV31318)return;row.facing=desired(s,a);row.sourceFacing31223=source(row.sprite,row.sourceFacing31223??'right');}
 const motionLeft=new Set(['mb-kair01-v31231','mb-dist05']);
 function motionScale(entry,pose,transform){const facing=transform?.targetFacingRC206;if(!Number.isFinite(facing))return sign(transform?.scaleX);const intrinsic=entry.motions?.[pose]?.sourceFacing??entry.sourceFacing??(motionLeft.has(entry.id)?'left':'right');return sign(facing)*(intrinsic==='left'?-1:1);}
 root.__HAPIL_BOSS_FACING_RC206__=Object.freeze({desired,source,scale,death,motionScale,inspected:Object.freeze(inspected)});
})(window);
