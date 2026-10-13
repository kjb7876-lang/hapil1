/* RC177: display-only narrative framing; original prose and audio inputs stay intact. */
(function(root){'use strict';
 const prefix='누군가의 기억:',className='hapil-memory-frame';
 function prepend(body){if(!body)return null;const existing=Array.from(body.children??[]).find(e=>e.classList?.contains(className));if(existing)return existing;
  const label=root.document.createElement('div');label.className=className;label.textContent=prefix;label.style.marginBottom='1em';body.insertBefore(label,body.firstChild);return label;
 }
 root.__HAPIL_MEMORY_FRAME_RC177__=Object.freeze({prefix,prepend});
})(window);
