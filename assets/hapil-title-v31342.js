(() => {
  "use strict";

  const SETTINGS_KEY = "mongse_settings_v1";
  const ENDING_KEY = "hapilCampaignCompleteV31301";
  const isCleared = () => {
    try {
      return localStorage.getItem(ENDING_KEY) === "true";
    } catch {
      return false;
    }
  };

  try {
    const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    if (typeof current.interludeText !== "boolean") {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...current, interludeText: true, visualDefaults393: true }),
      );
    }
  } catch {}

  const markManualCombatInput = () => {
    window.__HAPIL_MANUAL_COMBAT_INPUT_AT_V31300__ = Date.now();
  };
  window.addEventListener("keydown", (event) => {
    if (["KeyA", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyG"].includes(event.code) && !event.repeat)
      markManualCombatInput();
  }, { capture: true });
  window.addEventListener("pointerdown", (event) => {
    if (event.target?.closest?.(".skills button")) markManualCombatInput();
  }, { capture: true, passive: true });

  let hideTimer = 0, readingPaused342=false, readingPhase342=null, readingText342='';
  const readingApi342=()=>window.__HAPIL_READING_V31342__;
  const finish342=()=>{const final342=readingPhase342==='ending-title';window.clearTimeout(hideTimer);readingPhase342=null;document.getElementById('hapil-final-overlay-v31300')?.classList.remove('open');if(readingApi342())readingApi342().blocked=false;if(final342)window.location?.reload?.();};
  const schedule342=()=>{window.clearTimeout(hideTimer);if(!readingPaused342&&readingPhase342!=='ending-title')hideTimer=window.setTimeout(finish342,readingApi342()?.delay(readingText342)??15000);};
  for(const type of ['keydown','keyup'])window.addEventListener(type,event=>{if(!readingPhase342)return;event.stopImmediatePropagation();event.preventDefault();if(type==='keydown'&&!event.repeat&&['Enter','Space'].includes(event.code)){finish342();}},true);

  const copy = {
    "first-defeat": ["PHASE I COMPLETE", "교주가 쓰러졌다", "그러나 합일 코어의 박동은 멎지 않았다."],
    "hero-down": ["FATAL LINK", "의목사 행동 불능", "교주는 되살아났고, 코어의 명령이 숨통을 조였다."],
    "core-revival": ["UNION CORE", "교주의 부활", "합일 코어가 교주에게 에너지를 공급한다."],
    memory: ["REALITY RECALL", "현실의 기억", "현실의 의목사들 · 침투 직전의 약속 · 신경접속 장치\n정신과 의사 미카엘라 · 의목사 B와 첫째 · 지워진 세쌍둥이의 자리\n\n“여기는 현실이 아니다.”\n“이곳은 내가 들어온 꿈이다.”\n“내가 꾸는 꿈이라면, 나에게도 권한이 있다.”"],
    death: ["EGO TERMINATION", "사망", "자아가 사라지기 전, 현실을 기억했다."],
    samong: ["LUCID AUTHORITY", "사몽", "죽음이 아니라 자각. 의목사는 자신의 부활을 상상하고 다시 일어났다."],
    duel: ["FINAL DUEL", "하나와 둘", "교주: “하나의 의지가 가장 완전하다!”\n환도 영웅: “우리는 서로를 지우지 않았다.”"],
    resume: ["FINAL DECISION", "마지막 타격", "직접 공격하거나 자동전투의 결정을 이어 교주의 마지막 체력을 끝낸다."],
    ending: ["CULT CIRCUIT OFFLINE", "교주는 사라졌다", "흑장미단의 명령 회로와 강제 합일은 끊어졌다.\n합일 코어는 파괴되지 않았다."],
    "ending-title": ["TRUE TITLE REVEALED", "合一夢世", "합일몽세\n\n사이비는 사라졌다. 합일몽세만 남았다.\n우리의 세계는 그렇게 몽세로서 유지되었다."],
  };

  const updateTitles = () => {
    const cleared = isCleared();
    document.body?.classList.toggle("hapil-ending-cleared-v31300", cleared);
    document.title = cleared ? "合一夢世 · 합일몽세 RC28 모바일" : "合一 · 합일 RC28 모바일";
    document.querySelectorAll(".title-card h1").forEach((node) => {
      const expected = cleared ? "合一夢世" : "合一";
      if (node.textContent !== expected) node.textContent = expected;
    });
    document.querySelectorAll(".title-card h2").forEach((node) => {
      const expected = cleared ? "합일몽세" : "합일";
      if (node.textContent !== expected) node.textContent = expected;
    });
    document.querySelectorAll(".brand b").forEach((node) => {
      const expected = cleared ? "合一夢世" : "合一";
      if (node.textContent !== expected) node.textContent = expected;
    });
  };

  const ensureOverlay = () => {
    let overlay = document.getElementById("hapil-final-overlay-v31300");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "hapil-final-overlay-v31300";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "assertive");
    overlay.innerHTML =
      '<section class="hapil-final-card"><span class="hapil-final-kicker"></span><h1></h1><h2></h2><p></p><button type="button" data-reading-pause>읽기 일시정지</button> <button type="button" data-reading-next>다음 장면 · Enter/Space</button></section>';
    overlay.style.pointerEvents='auto';overlay.querySelector('[data-reading-next]').addEventListener('click',finish342);overlay.querySelector('[data-reading-pause]').addEventListener('click',event=>{readingPaused342=!readingPaused342;event.target.textContent=readingPaused342?'자동 읽기 재개':'읽기 일시정지';schedule342();});
    document.body.appendChild(overlay);
    return overlay;
  };

  const show = (phase) => {
    if(window.__HAPIL_STORY_RC51__?.replacesLegacy && phase!=='ending-title')return;
    const values = phase==='ending-title' && window.__HAPIL_STORY_DATA_RC51__ ? ['合一夢世','合一夢世','사이비는 사라지고 합일몽세만이 남았다. 나는 그 세계를 유지하는 몽세수호자가 되었다.'] : copy[phase];
    if (!values || !document.body) return;
    const overlay = ensureOverlay();
    overlay.dataset.phase = phase;
    overlay.querySelector(".hapil-final-kicker").textContent = values[0];
    overlay.querySelector("h1").textContent = values[1];
    overlay.querySelector("h2").textContent = phase === "ending-title" ? "합일몽세" : "";
    overlay.querySelector("p").textContent = values[2];
    overlay.classList.add("open");
    window.clearTimeout(hideTimer);
    readingPhase342=phase;readingText342=values.join('\n');if(readingApi342())readingApi342().blocked=true;
    window.__HAPIL_CONTROLS_V31329__?.binding?.input?.current?.clear?.();schedule342();
    if (phase === "ending-title") updateTitles();
  };

  window.addEventListener("hapil:final-event", (event) => show(event.detail?.phase));
  window.addEventListener("storage", updateTitles);
  document.addEventListener("DOMContentLoaded", () => {
    updateTitles();
    const observer = new MutationObserver(updateTitles);
    observer.observe(document.body, { childList: true, subtree: true });
    window.__HAPIL_TITLE_OBSERVER_V31300__ = observer;
  }, { once: true });
})();
