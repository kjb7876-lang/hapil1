/* RC210: explicitly approved dist02 post-battle text; original source/voice preserved.
 * Its replacement narration stays unavailable until matching new audio is verified. */
(function(root){'use strict';
 const body='본능적으로 뿔악마를 처치하자 머릿속에서 의문의 목소리가 들렸다. 악마들이 소환되는 진원지, 북쪽의 소환진을 파괴하러 가라고…….\n\n기억이 파편처럼 조금씩 떠오르고 있었다. 그러자 눈앞에 찬란한 모습을 한 천사가 나타났다.\n\n천사는 언제나 나의 편이라고, 내가 이 세상을 구할 마지막 수호자라고 말하며 나에게 따스함을 주었다. 얼어붙었던 나의 마음이 녹아 이내 불타는 느낌마저 들었다.\n\n그렇게 소환진을 향해 나아갔다.';
 const source=root.__HAPIL_STORY_DATA_RC51__,record=source?.records?.find(r=>r.zone==='dist02');
 if(!record)throw Error('RC210 dist02 source missing');
 const original=Object.freeze({post:record.post,paragraphs:Object.freeze([...record.paragraphs])});
 record.post=body;record.paragraphs=[...record.paragraphs.slice(0,-1),body];
 const spoken=body.replace(/…+[.!?]*/gu,'.');
 root.__HAPIL_MEMORY_RC210__=Object.freeze({zone:'dist02',phase:'post',body,spoken,original,audioStatus:'pending-generation',pendingScenes:Object.freeze(['dist02:post','journal:dist02:all','journal:dist02:body']),title:'전투 후 남겨진 기억 · 늪지대의 뿔악마'});
})(window);
