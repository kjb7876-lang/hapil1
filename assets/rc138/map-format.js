/* RC138: whole-source maps share one native floor frame; six coverage cells are never drawn. */
(function(root){'use strict';const rows=root.__HAPIL_MAP_DATA_RC138__,stats={draws:0,last:null};
 function install(maps){for(const [id,row]of Object.entries(rows)){if(!maps[id])throw Error('Missing combat map '+id);if(row.activeMap!==row.map){maps[id].map=row.activeMap;maps[id].mapVariants=[];}}}
 function draw(ctx,s,im){if(!root.__HAPIL_BATTLE_ARENA_RC138__?.enabled(s))return false;if(!im?.complete||!im.naturalWidth)return false;
  const inner=root.__HAPIL_INNER_FINAL_RC133__?.encounter(s),center=inner?.58:rows[s.zone]?.floorCenterY??.5,ratio=im.naturalWidth/im.naturalHeight,width=Math.min(1584,990*ratio),height=width/ratio,rect={x:640-width/2,y:513-height*center,width,height};
  ctx.drawImage(im,rect.x,rect.y,rect.width,rect.height);stats.draws++;stats.last={zone:s.zone,path:im.src,source:[im.naturalWidth,im.naturalHeight],rect,uniform:true};return true;
 }
 root.__HAPIL_MAP_FORMAT_RC138__=Object.freeze({version:'RC138',rows,install,draw,metrics:()=>({...stats,last:stats.last?{...stats.last}:null})});
})(window);
