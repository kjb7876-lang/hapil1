/* RC179: one optional first-refuge bed memory; existing recovery/save flow retained. */
(function(root){'use strict';
 const zone='dreamRest',key='firstBedMemoryRC179';
 const text=`나는 언제나 꿈을 꾼다.

꿈속에서는 아주 오랜 시간을 살아낸 듯하다. 때로는 한 사람의 생애를 모두 지나온 것만 같지만, 눈을 뜨고 나면 기억에 남는 것은 언제나 마지막의 짧은 장면뿐이다. 그 이전에 무엇을 보았고, 누구를 만났으며, 어떤 시간을 보냈는지는 도무지 떠오르지 않는다.

가끔은 악몽을 꾸기도 한다. 한때는 드문 일이었으나, 언제부터인가 그 빈도가 부쩍 잦아졌다. 이제는 잠자리에 들 때마다 알 수 없는 두려움이 밀려온다. 오늘 밤에는 또 무엇을 보게 될 것인지, 깨어난 뒤에는 무엇이 남아 있을 것인지.

그러나 두렵다고 해서 잠을 피할 수 있는 것은 아니었다. 의지로 밤을 거스를 수 없듯, 찾아오는 꿈을 거부할 수도 없었다.

그렇게 오늘도 나는 눈을 감는다.

어쩌면 또다시, 기억하지 못할 기나긴 시간을 살아내기 위하여.`;
 function journal(){const record=root.__HAPIL_PATIENT_DATA_RC51__?.records?.find(r=>r.zone===zone);if(record&&!String(record.body??'').includes(text))record.body=(record.body?record.body+'\n\n':'')+text;}
 function open(s){const story=root.__HAPIL_STORY_RC51__;if(!s||s.zone!==zone||!(s.hp>0)||!story?.enabled(s)||story.isOpen()||s[key]===true)return false;
  const shown=story.show(s,{zone,index:12,title:'꿈의 기억'},'bedMemory',text,()=>{},{displayOnlyNarrative:true});
  if(shown)s[key]=true;return shown;
 }
 journal();root.__HAPIL_FIRST_BED_MEMORY_RC179__=Object.freeze({zone,key,text,open,journal});
})(window);
