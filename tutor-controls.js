(function setupTutorControls(){
  const MAX_STAGE = 10;
  const dock = document.createElement('div');
  dock.className = 'tutor-dock';
  dock.innerHTML = `
    <button class="tutor-toggle" id="tutorToggle" aria-expanded="false">Tutor</button>
    <div class="tutor-panel" id="tutorPanel" hidden>
      <div class="tutor-panel-head">
        <strong>Tutor Controls</strong>
        <span id="tutorStepLabel">Lesson 1 • Step 1 of 11</span>
      </div>
      <div class="tutor-nav-row">
        <button id="tutorHome">⌂ Home</button>
        <button id="tutorPrev">← Back</button>
        <button id="tutorNext">Next →</button>
      </div>
      <button class="tutor-reset" id="tutorReset">Reset Zach's Session</button>
    </div>`;
  document.body.appendChild(dock);

  const toggle = document.querySelector('#tutorToggle');
  const panel = document.querySelector('#tutorPanel');
  const homeBtn = document.querySelector('#tutorHome');
  const prevBtn = document.querySelector('#tutorPrev');
  const nextBtn = document.querySelector('#tutorNext');
  const resetBtn = document.querySelector('#tutorReset');
  const label = document.querySelector('#tutorStepLabel');

  function updateControls(){
    const current = Math.max(0, Math.min(Number(state.stage) || 0, MAX_STAGE));
    label.textContent = `Lesson 1 • Step ${current + 1} of ${MAX_STAGE + 1}`;
    prevBtn.disabled = current <= 0;
    nextBtn.disabled = current >= MAX_STAGE;
  }

  function showLesson(){
    hero.classList.add('hidden');
    hub.classList.remove('hidden');
    state.startedAt ||= Date.now();
    save();
    render();
    updateControls();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  toggle.onclick = () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    updateControls();
  };

  homeBtn.onclick = () => {
    hub.classList.add('hidden');
    hero.classList.remove('hidden');
    panel.hidden = true;
    toggle.setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'smooth'});
  };

  prevBtn.onclick = () => {
    if(state.stage <= 0) return;
    state.stage--;
    state.stageStartedAt = Date.now();
    save();
    showLesson();
  };

  nextBtn.onclick = () => {
    if(state.stage >= MAX_STAGE) return;
    state.stage++;
    state.stageStartedAt = Date.now();
    save();
    showLesson();
  };

  resetBtn.onclick = () => {
    const ok = window.confirm("Reset all of Zach's saved progress on this browser? This returns the site to a completely fresh start.");
    if(!ok) return;
    localStorage.removeItem('zach20');
    window.location.reload();
  };

  const stageObserver = new MutationObserver(updateControls);
  if(stage) stageObserver.observe(stage,{childList:true,subtree:true});
  updateControls();
})();