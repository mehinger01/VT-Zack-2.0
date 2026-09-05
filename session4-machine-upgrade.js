// Session 4 harder Broken Machine override.
// Replaces the simple component-failure task with a condition-comparison diagnosis.
(function(){
  if(!window.ZACH_SESSIONS || !window.ZACH_SESSIONS[4]) return;

  window.ZACH_SESSIONS[4].stages[2] = function(){
    const results = {
      emptyStill:  {icon:'📭',title:'Empty box — belt stopped',result:'Scale reads 0 kg',detail:'Correct reading.'},
      heavyStill:  {icon:'📦',title:'8 kg box — belt stopped',result:'Scale reads 8 kg',detail:'Correct reading.'},
      emptyFast:   {icon:'💨',title:'Empty box — belt fast',result:'Scale jumps between 4–6 kg',detail:'Wrong only while the machine is moving.'},
      heavyFast:   {icon:'⚡',title:'8 kg box — belt fast',result:'Scale jumps between 7–10 kg',detail:'Unstable while moving.'},
      emptySlow:   {icon:'🐢',title:'Empty box — belt slow',result:'Scale flickers between 0–1 kg',detail:'Much closer to correct at low speed.'},
      power:       {icon:'🔋',title:'Power check during motion',result:'Voltage stays steady',detail:'No power drop when the bad readings happen.'},
      gate:        {icon:'🚪',title:'Sorting gate test',result:'Gate opens exactly when commanded',detail:'Gate responds correctly to the reading it receives.'}
    };
    const tested = new Set();

    stage.innerHTML = adv.header(
      'DIAGNOSIS LAB • HARD MODE',
      'Broken Machine: The Ghost Weight',
      'The obvious answer might be wrong. Find the condition that makes the failure appear.',
      'SYSTEMS ENGINEER'
    ) + `
      <div class="challenge-panel">
        <div class="mission-card"><span>🤖</span><div><small>INCIDENT REPORT</small><strong>The sorter sometimes labels empty packages as HEAVY.</strong><p>Technicians replaced nothing yet because the problem disappears during some tests. Your job is to isolate the cause.</p></div></div>

        <div class="response-box blue-box"><b>Engineer rule:</b> Do not ask only “Which part failed?” Ask <b>“Under what conditions does the failure happen?”</b></div>

        <p class="instruction">Choose tests. You do not need every test, but you need enough evidence to explain the pattern.</p>
        <div class="machine-tests" id="s4HardTests">
          ${Object.entries(results).map(([id,r])=>`<button class="machine-test" data-hard-test="${id}"><span>${r.icon}</span><b>${r.title}</b><small>RUN TEST</small></button>`).join('')}
        </div>

        <div class="evidence-board">
          <div class="evidence-head"><span>📋</span><div><small>TEST LOG</small><strong id="s4HardCount">0 tests</strong></div></div>
          <div id="s4HardEvidence" class="evidence-list"><div class="evidence-empty">The machine is waiting. What comparison would be useful first?</div></div>
        </div>

        <p class="instruction">Before diagnosing it, state the pattern you think the evidence shows.</p>
        <textarea id="s4Pattern" class="notice-input" placeholder="The failure seems to happen when..."></textarea>

        <p class="instruction">Choose the best diagnosis.</p>
        <div class="choice-grid" id="s4HardDiagnose">
          <button class="choice-card" data-hard-diagnose="sensor"><span class="big-emoji">🔎</span><strong>The weight sensor is simply broken</strong><p>It cannot measure weight correctly.</p></button>
          <button class="choice-card" data-hard-diagnose="motor"><span class="big-emoji">⚙️</span><strong>The belt motor is too powerful</strong><p>The motor itself is producing bad data.</p></button>
          <button class="choice-card" data-hard-diagnose="mount"><span class="big-emoji">🔩</span><strong>Loose sensor mount / vibration</strong><p>Movement shakes the sensor and creates false readings.</p></button>
          <button class="choice-card" data-hard-diagnose="gate"><span class="big-emoji">🚪</span><strong>The sorting gate is jammed</strong><p>The gate is sending boxes to the wrong place.</p></button>
        </div>
        <div id="s4HardFeed"></div>
      </div>`;

    function refresh(){
      $('#s4HardCount').textContent = `${tested.size} test${tested.size===1?'':'s'}`;
      $('#s4HardEvidence').innerHTML = [...tested].map(id=>{
        const r=results[id];
        return `<div class="evidence-item"><span>${r.icon}</span><div><b>${r.title}</b><small>${r.result} — ${r.detail}</small></div></div>`;
      }).join('');
    }

    document.querySelectorAll('[data-hard-test]').forEach(btn=>btn.onclick=()=>{
      const id=btn.dataset.hardTest;
      tested.add(id);
      btn.classList.add('tested');
      btn.querySelector('small').textContent='TESTED';
      refresh();
      beep(500,.05);
    });

    document.querySelectorAll('[data-hard-diagnose]').forEach(btn=>btn.onclick=()=>{
      const answer=btn.dataset.hardDiagnose;
      const pattern=$('#s4Pattern').value.trim();
      if(tested.size < 3){
        $('#s4HardFeed').innerHTML='<div class="response-box">Three tests is the minimum. One result can fool you; comparisons reveal patterns.</div>';
        return;
      }
      if(!pattern){
        $('#s4HardFeed').innerHTML='<div class="response-box">State the pattern first. What condition changes when the readings become wrong?</div>';
        return;
      }

      const hasStill = tested.has('emptyStill') || tested.has('heavyStill');
      const hasMoving = tested.has('emptyFast') || tested.has('heavyFast') || tested.has('emptySlow');
      if(answer==='mount' && (!hasStill || !hasMoving)){
        $('#s4HardFeed').innerHTML='<div class="response-box">That theory is plausible, but you need a direct comparison between a <b>stopped</b> condition and a <b>moving</b> condition before you can defend it.</div>';
        return;
      }

      if(answer==='mount'){
        adv.note('diagnosisHard',{tested:[...tested],pattern,answer:'vibration / loose sensor mount'});
        $('#s4HardFeed').innerHTML=`
          <div class="response-box success-box"><b>Diagnosis supported: vibration/alignment fault.</b> The sensor can read correctly when the belt is stopped, so it is not simply “dead.” The error appears during motion and becomes smaller at slow speed. That pattern points to vibration disturbing the sensor or its mount.</div>
          <div class="response-box blue-box"><b>Systems-thinking move:</b> You diagnosed a relationship between parts and conditions—not just a broken component.</div>
          <div class="incoming-alert"><div class="alert-pulse">🧪</div><div><small>CONFIRMATION TEST</small><strong>Technician tightens the sensor bracket. Empty box at full speed now reads 0 kg.</strong></div></div>
          ${adv.next('MISSION CONTROL →')}`;
        adv.complete('diagnosis-hard',10);adv.bindNext();
      } else {
        const feedback={
          sensor:'If the sensor were simply broken, why does it read both 0 kg and 8 kg correctly when the belt is stopped?',
          motor:'The motor changes the condition, but is the motor itself producing the weight reading? Compare fast, slow, and stopped tests.',
          gate:'The gate follows the reading it receives. The bad information appears before the gate acts.'
        };
        $('#s4HardFeed').innerHTML=`<div class="response-box"><b>Reasonable theory—but not the best fit.</b> ${feedback[answer]} Re-check which condition predicts the failure.</div>`;
      }
    });
  };
})();
