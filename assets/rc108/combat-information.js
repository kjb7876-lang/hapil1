/* RC108: desktop and landscape combat information band; portrait is untouched. */
(()=>{'use strict';
 const root=document.documentElement;
 const eligible=()=>document.body.classList.contains('rc15-playing')&&(!root.classList.contains('hapil-touch-v31366')||innerWidth>innerHeight);
 function mount(){
  let overlay=document.querySelector('#rc108-control-overlay');if(overlay)return overlay;
  overlay=document.createElement('div');overlay.id='rc108-control-overlay';overlay.setAttribute('aria-label','전투 조작');
  const keys=document.createElement('div');keys.className='rc108-skill-keys';keys.setAttribute('role','group');keys.setAttribute('aria-label','S 블링크 · D 공명');
  for(const [index,key] of ['S','D'].entries()){if(index){const sep=document.createElement('span');sep.className='rc108-skill-separator';sep.setAttribute('aria-hidden','true');sep.textContent='·';keys.append(sep);}const action=key==='S'?'블링크':'공명',b=document.createElement('button');b.type='button';b.dataset.key=key;b.textContent=key+' '+action;b.title=key+' '+action;b.setAttribute('aria-label',key+' '+action);b.addEventListener('click',()=>{const mobile=window.__HAPIL_MOBILE_V31366__?.enabled?.();const target=mobile?document.querySelector('#hapil-mobile-controls-v31366 [data-mobile-action="'+key+'"]'):document.querySelector('.combat-hud .skills [data-control-key="'+key+'"]');target?.click();});keys.append(b);}
  const more=document.createElement('button');more.type='button';more.className='rc108-more-trigger';more.setAttribute('aria-label','조작 더보기');more.setAttribute('aria-haspopup','dialog');more.title='조작 더보기';more.textContent='⋯';more.addEventListener('click',()=>document.querySelector('.combat-controls-more')?.click());
  const settings=document.createElement('button');settings.type='button';settings.className='rc108-settings-trigger';settings.setAttribute('aria-label','설정 · 메뉴');settings.title='설정 · 메뉴';settings.textContent='⚙';settings.addEventListener('click',()=>document.querySelector('.topbar nav button,.topbar .mobile-system-menu')?.click());
  overlay.append(keys,more,settings);document.body.append(overlay);return overlay;
 }
 function update(){const show=eligible(),touch=root.classList.contains('hapil-touch-v31366');root.classList.toggle('rc108-wide-layout',show);const sides=document.querySelector('#rc15-sidepanels');if(show&&sides)sides.hidden=false;else if(touch&&innerHeight>innerWidth&&sides)sides.hidden=true;if(show)mount();}
 new MutationObserver(update).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-combat-input']});addEventListener('resize',update);setInterval(update,200);update();
 window.__HAPIL_COMBAT_INFO_RC108__=Object.freeze({version:'RC108',update,eligible});
})();
