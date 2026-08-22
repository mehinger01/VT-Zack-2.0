(function setupTutorControls(){
  const MAX_STAGE = 12;
  const dock = document.createElement('div');
  dock.className = 'tutor-dock';
  dock.innerHTML = `
    <button class="tutor-toggle" id="tutorToggle" aria-expanded="false">Tutor</button>
    <div class="tutor-panel" id="tutorPanel" hidden>
      <div class="tutor-panel-head">
        <strong>Tutor Controls</strong>
        <span id="tutorStepLabel">Challenge Lab • Step 1</span>
      </div>
      <label class="tutor-session-label" for="tutorSessionSelect">Open session</label>
      <select id="tutorSessionSelect" class="tutor-session-select">
        <option value="1">Challenge Lab / current arc</option>
        <option value="5">Session 5 — Change the Plan</option>
        <option value="6">Session 6 — Hint Economy</option>
        <option value="7">Session 7 — Plan It Yourself</option>
        <option value="8">Session 8 — Find It, Fix It, Prove It</option>
        <option value="9">Session 9 — Open Mission</option>
        <option value="10">Session 10 — School Replay Lab</option>
        <option value="11">Session 11 — Real-World Transfer</option>
        <option value="12">Session 12 — Independence Checkpoint</option>
      </select>
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
  const select = document.querySelector('#tutorSessionSelect');

  function advancedInfo(){
    return typeof window.zachAdvancedSessionInfo==='function' ? window.zachAdvancedSessionInfo() : null;
  }

  function updateControls(){
    const info=advancedInfo();
    if(info){
      label.textContent=`Session ${info.session} • Step ${info.step+1} of ${info.total}`;
      prevBtn.disabled=info.step<=0;
      nextBtn.disabled=info.step>=info.total-1;
      select.value=String(info.session);
      return;
    }
    const current=Math.max(0,Math.min(Number(state.stage)||0,MAX_STAGE));
    label.textContent=`Challenge Lab • Step ${current+1} of ${MAX_STAGE+1}`;
    prevBtn.disabled=current<=0;
    nextBtn.disabled=current>=MAX_STAGE;
    select.value='1';
  }

  function showLesson(){
    hero.classList.add('hidden');
    hub.classList.remove('hidden');
    state.startedAt ||= Date.now();
    save();render();updateControls();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  toggle.onclick=()=>{const opening=panel.hidden;panel.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));updateControls();};

  select.onchange=()=>{
    const n=Number(select.value);
    if(n>=5 && typeof window.zachSetProgramSession==='function'){
      window.zachSetProgramSession(n);
    }else{
      state.programSession=1;state.sessionStep=0;save();showLesson();
    }
    updateControls();
  };

  homeBtn.onclick=()=>{hub.classList.add('hidden');hero.classList.remove('hidden');panel.hidden=true;toggle.setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'smooth'});};

  prevBtn.onclick=()=>{
    if(advancedInfo() && typeof window.zachBackSessionStep==='function'){window.zachBackSessionStep();updateControls();return;}
    if(state.stage<=0)return;state.stage--;state.stageStartedAt=Date.now();save();showLesson();
  };

  nextBtn.onclick=()=>{
    if(advancedInfo() && typeof window.zachAdvanceSessionStep==='function'){window.zachAdvanceSessionStep();updateControls();return;}
    if(state.stage>=MAX_STAGE)return;state.stage++;state.stageStartedAt=Date.now();save();showLesson();
  };

  resetBtn.onclick=()=>{const ok=window.confirm("Reset all of Zach's saved progress on this browser? This returns the site to a completely fresh start.");if(!ok)return;localStorage.removeItem('zach20');window.location.reload();};

  const stageObserver=new MutationObserver(updateControls);
  if(stage)stageObserver.observe(stage,{childList:true,subtree:true});
  updateControls();
})();