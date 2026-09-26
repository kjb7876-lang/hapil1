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

  let hideTimer = 0;
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
    document.title = cleared ? "合一夢世 · 합일몽세 v3.13.06" : "合一 · 합일 v3.13.06";
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
      '<section class="hapil-final-card"><span class="hapil-final-kicker"></span><h1></h1><h2></h2><p></p></section>';
    document.body.appendChild(overlay);
    return overlay;
  };

  const show = (phase) => {
    const values = copy[phase];
    if (!values || !document.body) return;
    const overlay = ensureOverlay();
    overlay.dataset.phase = phase;
    overlay.querySelector(".hapil-final-kicker").textContent = values[0];
    overlay.querySelector("h1").textContent = values[1];
    overlay.querySelector("h2").textContent = phase === "ending-title" ? "합일몽세" : "";
    overlay.querySelector("p").textContent = values[2];
    overlay.classList.add("open");
    window.clearTimeout(hideTimer);
    if (phase === "ending") {
      hideTimer = window.setTimeout(() => overlay.classList.remove("open"), 2500);
    } else if (phase === "resume") {
      hideTimer = window.setTimeout(() => overlay.classList.remove("open"), 1050);
    } else if (phase !== "ending-title") {
      hideTimer = window.setTimeout(() => overlay.classList.remove("open"), 1150);
    }
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
