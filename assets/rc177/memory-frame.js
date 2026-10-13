/* RC177: display-only narrative framing; original prose and audio inputs stay intact. */
(function(root){'use strict';
 const prefix='누군가의 기억:',className='hapil-memory-frame';
 function prepend(body,before){if(!body)return null;const existing=Array.from(body.children??[]).find(e=>e.classList?.contains(className));if(existing){if(before&&before!==existing&&existing.nextSibling!==before){body.removeChild(existing);body.insertBefore(existing,before);}return existing;}
  const label=root.document.createElement('div');label.className=className;label.textContent=prefix;label.style.marginBottom='1em';body.insertBefore(label,before??body.firstChild);return label;
 }
 root.__HAPIL_MEMORY_FRAME_RC177__=Object.freeze({prefix,prepend});
})(window);
