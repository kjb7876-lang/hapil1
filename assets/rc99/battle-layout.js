/* RC99 merged layout: CSS owns reserved PC tracks; mobile keeps a full battlefield.
   No canvas/input/resource mutations and no redundant automatic-skill key panel. */
(()=>{'use strict';
 function update(){const b=window.__HAPIL_CONTROLS_V31329__?.binding,game=document.querySelector('.game');document.body.classList.toggle('rc99-layout',!!game&&b?.phase==='game');}
 window.__HAPIL_BATTLE_LAYOUT_RC99__=Object.freeze({update});addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);setInterval(update,250);update();
})();
