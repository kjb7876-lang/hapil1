'use strict';
// Shared by the browser audit and CPU negative cases. No runtime allowlist.
module.exports=function createNativeArtAudit(){
 const nativePath=p=>String(p??'').split(/[?#]/)[0].replace(/^\.\//,'/');
 const identity=a=>a?.rc135FissionIdentity??a?.rc133TemplateId??a?.id;
 function validOrnament(row,ornaments){const a=row.actor,q=row.packet,p=q?.provenanceRC155;return !!(a&&(a.boss||a.midboss)&&identity(a)===row.owner&&q?.sourceId===a.id&&q.rc210Ornament===true&&q.rc210OrnamentAsset===row.sprite&&q.sprite===row.sprite&&p?.assetRole==='story-ornament'&&p.assetStatus==='owner-allowed'&&p.ownerId===a.id&&!p.mismatch&&!p.ornamentMarkerMismatch&&p.assetId===nativePath(row.sprite)&&p.allowedAssets?.includes(nativePath(row.sprite))&&ornaments?.assets(a)?.includes(row.sprite));}
 function sharedReason(a,b,ornaments,lust){if(!a||!b||a.sprite!==b.sprite)return null;if(a.owner===b.owner)return'same-owner';if(validOrnament(a,ornaments)&&validOrnament(b,ornaments))return'owned-story-ornament';if(a.lust===true&&b.lust===true&&lust?.owners?.includes(a.owner)&&lust?.owners?.includes(b.owner)&&lust?.paths?.includes(a.sprite))return'owned-lust-part';return null;}
 async function imageReceipt(im){if(!im)return{status:'not-queued',pendingInitially:false};const pendingInitially=im.complete!==true;try{if(typeof im.decode==='function')await im.decode();}catch(e){return{status:'decode-failed',pendingInitially,error:String(e)};}const width=im.naturalWidth??im.width,height=im.naturalHeight??im.height;if(!(width>0&&height>0)||im.complete===false)return{status:'empty-image',pendingInitially,width:width??0,height:height??0};return{status:'decoded',pendingInitially,width,height};}
 function stallConditions(stress){return{longTaskOver1000ms:(stress.longTaskDurations??[]).some(t=>t>1000),zeroFrames:stress.frames===0,imagesNotReady:!stress.allImagesReady};}
 return Object.freeze({validOrnament,sharedReason,imageReceipt,stallConditions});
};
