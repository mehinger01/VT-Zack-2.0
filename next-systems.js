// Zach 2.0 continuation systems.
// Loaded after the original app so we can extend the Challenge Lab without rewriting Session 1.

function renderBrokenMachine(){
  toolbelt.classList.remove('hidden');
  const tests = {
    power: ['Power Supply','⚡','PASS','Power is reaching the machine.'],
    belt: ['Conveyor Belt','➡️','PASS','The belt moves normally.'],
    motor: ['Gate Motor','⚙️','PASS','The gate opens and closes when tested directly.'],
    sensor: ['Color Sensor','🔎','FAIL','The sensor reads every crystal as BLUE — even the red one.'],
    chute: ['Sorting Chute','📦','PASS','Both chutes are clear. Nothing is jammed.']
  };
  let tested = new Set();

  stage.innerHTML = stageHeader(
    'SYSTEM 7 • DIAGNOSE',
    'The Broken Machine',
    'The sorter is making mistakes. Do not guess what is broken — use evidence to find it.',
    'DETECTIVE MODE'
  ) + `
    <div class="challenge-panel machine-panel">
      <div class="machine-brief">
        <div class="machine-role">🧑‍🔧 <div><small>YOUR ROLE</small><strong>Lead Systems Engineer</strong></div></div>
        <div class="machine-problem">🚨 <div><small>THE PROBLEM</small><strong>Red and blue crystals are ALL being sent into the blue bin.</strong></div></div>
      </div>

      <div class="sorter-scene" aria-label="Crystal sorting machine">
        <div class="crystal-feed"><span>🔴</span><span>🔵</span><span>🔴</span><span>🔵</span></div>
        <div class="sorter-arrow">→</div>
        <div class="sorter-machine">⚙️<small>SMART SORTER</small></div>
        <div class="sorter-arrow">→</div>
        <div class="wrong-bin"><span>🔵 BIN</span><b>🔴 🔵 🔴 🔵</b></div>
      </div>

      <div class="response-box blue-box"><b>Engineer rule:</b> A problem tells you <i>something</i> is wrong. Testing tells you <i>what</i> is wrong.</div>

      <p class="instruction">Choose parts to test. Each test gives you evidence.</p>
      <div class="machine-tests" id="machineTests">
        ${Object.entries(tests).map(([id,t])=>`<button class="machine-test" data-test="${id}"><span>${t[1]}</span><b>${t[0]}</b><small>RUN TEST</small></button>`).join('')}
      </div>

      <div class="evidence-board">
        <div class="evidence-head"><span>📋</span><div><small>EVIDENCE BOARD</small><strong id="evidenceCount">0 tests complete</strong></div></div>
        <div id="evidenceList" class="evidence-list"><div class="evidence-empty">No evidence yet. Which test would teach you something useful?</div></div>
      </div>

      <p class="instruction">When you have enough evidence, make your diagnosis.</p>
      <div class="diagnosis-grid" id="diagnosisGrid">
        ${Object.entries(tests).map(([id,t])=>`<button class="choice-card" data-diagnose="${id}"><span class="big-emoji">${t[1]}</span><strong>${t[0]}</strong></button>`).join('')}
      </div>
      <div id="diagnosisFeed"></div>
    </div>`;

  function refreshEvidence(){
    $('#evidenceCount').textContent = `${tested.size} test${tested.size===1?'':'s'} complete`;
    if(!tested.size) return;
    $('#evidenceList').innerHTML = [...tested].map(id=>{
      const t=tests[id];
      const fail=t[2]==='FAIL';
      return `<div class="evidence-item ${fail?'evidence-fail':'evidence-pass'}"><span>${fail?'⚠️':'✓'}</span><div><b>${t[0]} — ${t[2]}</b><small>${t[3]}</small></div></div>`;
    }).join('');
  }

  document.querySelectorAll('[data-test]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.test;
    tested.add(id);
    btn.classList.add('tested');
    btn.querySelector('small').textContent = tests[id][2];
    if(id==='sensor') btn.classList.add('test-fail');
    beep(id==='sensor'?260:560,.07);
    refreshEvidence();
  });

  document.querySelectorAll('[data-diagnose]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.diagnose;
    if(tested.size < 2){
      $('#diagnosisFeed').innerHTML = `<div class="response-box">You <i>can</i> guess now — but engineers use evidence. Run at least two tests so your answer has a reason.</div>`;
      return;
    }
    if(id==='sensor'){
      const sawFailure=tested.has('sensor');
      $('#diagnosisFeed').innerHTML = `
        <div class="response-box success-box"><b>Diagnosis confirmed: COLOR SENSOR.</b> ${sawFailure?'You found the test result that explains the exact mistake.':'Your diagnosis fits — now notice which test would prove it directly.'}</div>
        <div class="machine-repair"><span>🔧</span><div><small>REPAIR</small><strong>Reconnect sensor → recalibrate RED / BLUE → run test batch.</strong></div></div>
        <div class="response-box blue-box"><b>Brain move:</b> You did not just notice that something was wrong. You figured out <i>which part</i> was causing it. That is self-monitoring.</div>
        ${nextButton('OPEN SYSTEM 8 →')}`;
      complete('broken-machine',8);
      bindCommon();
    } else {
      const t=tests[id];
      $('#diagnosisFeed').innerHTML = `<div class="response-box alert-box"><b>Possible, but check your evidence.</b> ${t[0]} ${tested.has(id)?'passed its test.':'has not been tested yet.'} Which result best explains why <b>every color is being read as blue</b>?</div>`;
    }
  });
}

function renderMissionOverride(){
  toolbelt.classList.remove('hidden');
  let firstChoice=null;

  stage.innerHTML = stageHeader(
    'SYSTEM 8 • FLEXIBILITY',
    'Mission Control Override',
    'You already have a good plan. Your job is to change only what the new information actually changes.',
    'LIVE MISSION'
  ) + `
    <div class="challenge-panel override-panel">
      <div class="override-brief">
        <div><span>🚁</span><small>YOUR ROLE</small><strong>Rescue Drone Commander</strong></div>
        <div><span>🎯</span><small>MISSION</small><strong>Deliver medicine to Mountain Lab before its emergency generator shuts down.</strong></div>
      </div>

      <div class="plan-board">
        <div class="plan-board-title">ORIGINAL PLAN</div>
        <div class="plan-route">
          <div class="plan-stop"><span>🏠</span><b>Base</b><small>Start</small></div><i>→</i>
          <div class="plan-stop"><span>🌉</span><b>Bridge</b><small>Fast route</small></div><i>→</i>
          <div class="plan-stop"><span>🌲</span><b>Forest</b><small>Checkpoint</small></div><i>→</i>
          <div class="plan-stop"><span>🏔️</span><b>Lab</b><small>Deliver</small></div>
        </div>
        <div class="plan-facts"><span>🔋 Battery: 8</span><span>⏱️ Time: 12 min</span><span>📦 Medicine: loaded</span></div>
      </div>

      <div class="incoming-alert override-alert"><div class="alert-pulse">⚠️</div><div><small>MISSION CONTROL UPDATE</small><strong>The bridge has closed. A ridge path can bypass it and costs 3 battery.</strong></div></div>

      <p class="instruction">What should change?</p>
      <div class="choice-grid" id="overrideChoices">
        <button class="choice-card" data-override="restart"><span class="big-emoji">🔄</span><strong>Throw out the whole plan</strong><p>Start over and rethink everything.</p></button>
        <button class="choice-card" data-override="adjust"><span class="big-emoji">🧭</span><strong>Change only the blocked part</strong><p>Base → Ridge → Forest → Lab.</p></button>
        <button class="choice-card" data-override="stay"><span class="big-emoji">🌉</span><strong>Keep the original plan</strong><p>Try the bridge anyway.</p></button>
        <button class="choice-card" data-override="quit"><span class="big-emoji">🛑</span><strong>Cancel the mission</strong><p>The plan changed, so stop.</p></button>
      </div>
      <div id="overrideFeed"></div>
    </div>`;

  document.querySelectorAll('[data-override]').forEach(btn=>btn.onclick=()=>{
    firstChoice=btn.dataset.override;
    document.querySelectorAll('[data-override]').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');

    if(firstChoice!=='adjust'){
      const messages={
        restart:'Most of the plan still works. Strong planners do not rebuild everything when only one piece changed.',
        stay:'The bridge is closed, so this part of the old plan cannot work anymore.',
        quit:'A change is not the same as a dead end. Look for the smallest useful adjustment.'
      };
      $('#overrideFeed').innerHTML=`<div class="response-box">${messages[firstChoice]} <b>What changed? What stayed true?</b></div>`;
      return;
    }

    $('#overrideFeed').innerHTML = `
      <div class="response-box success-box"><b>Smart adjustment.</b> The goal, medicine, Forest checkpoint, and Lab all stay the same. Only the blocked route needs to change.</div>
      <div class="plan-update-grid">
        <div><small>WHAT STAYS</small><strong>🎯 Goal<br>📦 Medicine<br>🌲 Forest<br>🏔️ Lab</strong></div>
        <div><small>WHAT CHANGES</small><strong>🌉 Bridge → 🪨 Ridge</strong></div>
      </div>
      <div class="incoming-alert second-update"><div class="alert-pulse">⚡</div><div><small>SECOND UPDATE</small><strong>Headwind detected. The ridge now costs 5 battery instead of 3. You still have 8.</strong></div></div>
      <p class="instruction">New facts again. Stick or switch?</p>
      <div class="choice-grid">
        <button class="choice-card" id="keepRidge"><strong>Keep the ridge plan</strong><p>It costs more battery, but 8 − 5 leaves 3.</p></button>
        <button class="choice-card" id="restartAgain"><strong>Start over again</strong><p>New information means a brand-new plan.</p></button>
      </div>
      <div id="overrideFinal"></div>`;

    $('#keepRidge').onclick=()=>finishOverride(true);
    $('#restartAgain').onclick=()=>finishOverride(false);
  });

  function finishOverride(smart){
    if(smart){
      $('#overrideFinal').innerHTML=`
        <div class="response-box success-box"><b>Mission continues.</b> You checked the new information and discovered the plan still works. Flexible thinking does NOT mean changing every time — it means checking whether a change is actually needed.</div>
        <div class="final-route"><span>🏠 Base</span><b>→</b><span>🪨 Ridge</span><b>→</b><span>🌲 Forest</span><b>→</b><span>🏔️ Lab</span><em>🔋 3 battery left</em></div>
        ${nextButton('FINAL BOSS →')}`;
      complete('mission-override',9);
      bindCommon();
    } else {
      $('#overrideFinal').innerHTML=`<div class="response-box blue-box"><b>Check before rebuilding.</b> The ridge became more expensive, but you still have enough battery. New information should make you <i>re-check</i> a plan — not automatically abandon it.</div>`;
    }
  }
}

// Extend the original sequence:
// 0 Unknown, 1 Tools, 2 Rescue, 3 Reading, 4 Directions, 5 Reset,
// 6 Tower, 7 Wildlife Scout, 8 Creator, 9 Broken Machine, 10 Override,
// 11 Final Boss, 12 Lab Report.
const zachOriginalBoss = renderBoss;
const zachOriginalReport = renderReport;

render = function(){
  updateHUD();
  const renderers=[renderUnknown,renderTools,renderRescue,renderReading,renderDirections,renderReset,renderBuild,renderStrategy,renderCreator,renderBrokenMachine,renderMissionOverride,zachOriginalBoss,zachOriginalReport];
  (renderers[state.stage]||zachOriginalReport)();
  bindCommon();
};

// If an old saved state had already reached the original boss/report, keep it valid.
// New progression reaches the two added systems before the boss.
