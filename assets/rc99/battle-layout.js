/* Presentation only: preserve native actions and keep secondary controls on demand. */
(()=>{'use strict';
 let owner,launcher,dialog,links=[];
 addEventListener('keydown',e=>{if(!dialog?.open)return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();dialog.close();}},true);
 function mount(game){
  if(owner===game&&launcher?.isConnected)return;
  launcher?.remove();dialog?.remove();owner=game;if(!game)return;
  launcher=document.createElement('button');launcher.className='combat-controls-more';launcher.type='button';launcher.textContent='조작 더보기';launcher.setAttribute('aria-haspopup','dialog');
  dialog=document.createElement('dialog');dialog.className='combat-controls-dialog';dialog.setAttribute('aria-label','추가 전투 조작');
  dialog.innerHTML='<header><strong>추가 전투 조작</strong><button type="button" aria-label="추가 전투 조작 닫기">닫기</button></header><p>수동 스킬과 보조 조작입니다. 단축키는 그대로 사용할 수 있습니다.</p><div class="combat-controls-list"></div>';
  dialog.querySelector('header button').onclick=()=>dialog.close();
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dialog.close();}},true);
  const open=()=>{if(dialog.open)return;window.__HAPIL_CONTROLS_V31329__?.clear?.();refresh();dialog.showModal();};
  let touchAt=-Infinity;launcher.onpointerdown=e=>{if(!['touch','pen'].includes(e.pointerType))return;e.preventDefault();touchAt=performance.now();open();};
  launcher.onclick=e=>{if(e.detail===0||performance.now()-touchAt>600)open();};game.append(launcher,dialog);
 }
 function refresh(){
  if(!dialog||!owner)return;
  const manual=owner.dataset.combatInput==='manual',list=dialog.querySelector('.combat-controls-list');list.replaceChildren();links=[];
  for(const source of owner.querySelectorAll('.skills button,.action-utilities button')){
   const key=source.dataset.controlKey;
   if(['S','D'].includes(key)||(!manual&&['A','Q','W','E','R','G'].includes(key)))continue;
   const button=document.createElement('button');button.type='button';button.textContent=source.textContent.trim();button.disabled=source.disabled;
   button.onclick=()=>{dialog.close();source.click();};list.append(button);links.push({button,source});
  }
 }
 function update(){const b=window.__HAPIL_CONTROLS_V31329__?.binding,game=document.querySelector('.game');document.body.classList.toggle('rc99-layout',!!game&&b?.phase==='game');mount(game);if(dialog?.open)for(const {button,source} of links){if(button.disabled!==source.disabled)button.disabled=source.disabled;const text=source.textContent.trim();if(button.textContent!==text)button.textContent=text;}}
 window.__HAPIL_BATTLE_LAYOUT_RC99__=Object.freeze({update});addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);setInterval(update,250);update();
})();
