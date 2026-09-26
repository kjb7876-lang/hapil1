/* Save locations belong to browser origins. Never attempt to read another origin. */
(()=>{
 const port=new URLSearchParams(location.search).get('hapil_previous_port');
 if(!port||!/^\d{1,5}$/.test(port)||Number(port)<1||Number(port)>65535)return;
 function show(){if(document.getElementById('hapil-save-location-note'))return;
  const note=document.createElement('aside');note.id='hapil-save-location-note';note.setAttribute('role','status');
  Object.assign(note.style,{position:'fixed',left:'50%',top:'12px',transform:'translateX(-50%)',width:'min(680px,90vw)',padding:'14px 44px 14px 18px',boxSizing:'border-box',background:'#17232f',color:'#f5ede0',border:'1px solid #d3b27b',borderRadius:'10px',zIndex:'10020',font:'14px/1.6 sans-serif'});
  const text=document.createElement('span');text.textContent='실행 주소가 바뀌었습니다. 이전 포트 '+port+'의 저장 기록은 그대로 남아 있습니다. 이전 서버를 닫고 다시 실행하거나, 기존 주소에서 저장 JSON을 내보낸 뒤 이 주소에서 불러오세요.';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','저장 위치 안내 닫기');Object.assign(close.style,{position:'absolute',right:'10px',top:'8px',border:'0',background:'transparent',color:'inherit',fontSize:'24px',cursor:'pointer'});close.onclick=()=>note.remove();note.append(text,close);document.body.appendChild(note);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
})();
