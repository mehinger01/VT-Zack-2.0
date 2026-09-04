// Session 4 — Focus Under Load: Notice, Reset, Continue
// Built specifically from Zach's latest session data: elevated redirects, time-checking, and fatigue.

window.ZACH_SESSIONS = window.ZACH_SESSIONS || {};

window.ZACH_SESSIONS[4] = {
  title: 'Focus Under Load: Notice, Reset, Continue',
  ef: 'Focus • Self-Monitoring • Regulation • Persistence • Flexibility',
  stages: [
    function(){
      let trials=[];
      stage.innerHTML = adv.header(
        'SESSION 4 • COLD OPEN',
        'Black Box 2.0',
        'No directions. Test the machine, notice what changes, and figure out the rule.',
        'DISCOVERY MODE'
      ) + `
      <div class="challenge-panel">
        <div class="mystery-lock" style="font-size:1.35rem">🧪 SIGNAL BOX <span id="bbOutput">?</span></div>
        <div class="choice-grid" id="bbButtons">
          <button class="choice-card" data-bb="A"><span class="big-emoji">🔺</span><strong>INPUT A</strong><p>Test it.</p></button>
          <button class="choice-card" data-bb="B"><span class="big-emoji">🔵</span><strong>INPUT B</strong><p>Test it.</p></button>
          <button class="choice-card" data-bb="C"><span class="big-emoji">🟩</span><strong>INPUT C</strong><p>Test it.</p></button>
          <button class="choice-card" data-bb="AB"><span class="big-emoji">🔺🔵</span><strong>A + B</strong><p>Test two together.</p></button>
        </div>
        <div class="evidence-board">
          <div class="evidence-head"><span>📋</span><div><small>YOUR TESTS</small><strong id="bbCount">0 experiments</strong></div></div>
          <div id="bbLog" class="evidence-list"><div class="evidence-empty">Run experiments. Nobody is telling you what the buttons mean.</div></div>
        </div>
        <p class="instruction">When you think you know what is happening, explain your theory.</p>
        <textarea id="bbTheory" class="notice-input" placeholder="My theory is..."></textarea>
        <div class="action-row"><button id="bbCommit" class="primary-btn">TEST MY THEORY</button></div>
        <div id="bbFeed"></div>
      </div>`;
      const outputs={A:3,B:6,C:12,AB:9};
      document.querySelectorAll('[data-bb]').forEach(b=>b.onclick=()=>{
        const id=b.dataset.bb; const out=outputs[id]; trials.push(`${id} → ${out}`);
        $('#bbOutput').textContent=out; $('#bbCount').textContent=`${trials.length} experiment${trials.length===1?'':'s'}`;
        $('#bbLog').innerHTML=trials.map(x=>`<div class="evidence-item evidence-pass"><span>✓</span><div><b>${x}</b><small>Observed result</small></div></div>`).join('');
        beep(430+out*8,.05);
      });
      $('#bbCommit').onclick=()=>{
        if(trials.length<2){toast('Run at least two experiments first.');return;}
        if(!adv.requireText('#bbTheory','Explain what you think the box is doing.'))return;
        adv.note('blackBox',{trials,theory:$('#bbTheory').value});
        $('#bbFeed').innerHTML=`<div class="response-box success-box"><b>Discovery complete.</b> You started with no directions, created your own evidence, and built a theory. That is exactly what strong learners do with something new.</div>${adv.next('SYSTEM RECALIBRATION →')}`;
        adv.complete('black-box',7); adv.bindNext();
      };
    },

    function(){
      stage.innerHTML = adv.header(
        'PLANNED RESET',
        'System Recalibration',
        'Do the reset before your brain is completely done. Strong attention includes knowing when to recharge.',
        'RESET MODE'
      ) + `
      <div class="challenge-panel">
        <div class="recalibrate" style="min-height:260px"><div><div class="orb">🐢</div><h3 class="stage-title">30-Second Reset</h3><p class="stage-desc"><b>Reach high → touch knees → martial-arts guard → 3 slow breaths → shake arms out → freeze.</b></p></div></div>
        <div class="response-box blue-box"><b>New skill:</b> We are not waiting until focus disappears. We are practicing resetting <i>before</i> the brain checks out.</div>
        <div class="action-row"><button id="s4Reset" class="primary-btn">RESET COMPLETE ✓</button></div>
      </div>`;
      $('#s4Reset').onclick=()=>{adv.note('plannedReset',Date.now());adv.complete('reset',3);window.zachAdvanceSessionStep();};
    },

    function(){
      let tested=new Set();
      const parts={power:['⚡','Power','PASS'],belt:['➡️','Belt','PASS'],motor:['⚙️','Motor','PASS'],sensor:['🔎','Sensor','FAIL'],gate:['🚪','Gate','PASS']};
      stage.innerHTML = adv.header(
        'DIAGNOSIS LAB',
        'Broken Machine: New Failure',
        'The machine is wrong. Your job is not to guess — your job is to figure out what the evidence says.',
        'SELF-MONITORING'
      ) + `
      <div class="challenge-panel">
        <div class="mission-card"><span>🤖</span><div><small>PROBLEM</small><strong>Every package is being labeled HEAVY, even the empty ones.</strong><p>Something inside the scanner system is wrong.</p></div></div>
        <p class="instruction">Run tests.</p>
        <div class="machine-tests" id="s4Tests">${Object.entries(parts).map(([id,p])=>`<button class="machine-test" data-test="${id}"><span>${p[0]}</span><b>${p[1]}</b><small>RUN TEST</small></button>`).join('')}</div>
        <div class="evidence-board"><div class="evidence-head"><span>📋</span><div><small>EVIDENCE</small><strong id="s4TestCount">0 tests</strong></div></div><div id="s4Evidence" class="evidence-list"><div class="evidence-empty">No evidence yet.</div></div></div>
        <p class="instruction">Which part is causing the bad readings?</p>
        <div class="choice-grid" id="s4Diagnose">${Object.entries(parts).map(([id,p])=>`<button class="choice-card" data-diagnose="${id}"><span class="big-emoji">${p[0]}</span><strong>${p[1]}</strong></button>`).join('')}</div>
        <div id="s4DiagFeed"></div>
      </div>`;
      function refresh(){
        $('#s4TestCount').textContent=`${tested.size} tests`;
        $('#s4Evidence').innerHTML=[...tested].map(id=>{const p=parts[id],fail=p[2]==='FAIL';return `<div class="evidence-item ${fail?'evidence-fail':'evidence-pass'}"><span>${fail?'⚠️':'✓'}</span><div><b>${p[1]} — ${p[2]}</b><small>${fail?'Reports maximum weight even when empty.':'Working normally.'}</small></div></div>`}).join('');
      }
      document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>{tested.add(b.dataset.test);b.classList.add('tested');refresh();});
      document.querySelectorAll('[data-diagnose]').forEach(b=>b.onclick=()=>{
        if(tested.size<2){$('#s4DiagFeed').innerHTML='<div class="response-box">That is a guess. Gather enough evidence to defend the diagnosis.</div>';return;}
        if(b.dataset.diagnose==='sensor'){
          adv.note('diagnosis',{tested:[...tested],answer:'sensor'});
          $('#s4DiagFeed').innerHTML=`<div class="response-box success-box"><b>Confirmed.</b> The sensor test explains the exact symptom. You noticed what was wrong, checked possibilities, and identified the cause.</div>${adv.next('MISSION CONTROL →')}`;
          adv.complete('diagnosis',8);adv.bindNext();
        } else $('#s4DiagFeed').innerHTML='<div class="response-box">Check whether that part actually failed its test. Which result explains the bad weight reading?</div>';
      });
    },

    function(){
      let phase=0;
      stage.innerHTML = adv.header(
        'FLEXIBILITY LAB',
        'Mission Control Override',
        'New information means CHECK the plan. Sometimes change is needed. Sometimes it is not.',
        'KEEP / CHANGE / CHECK'
      ) + `
      <div class="challenge-panel">
        <div class="plan-board"><div class="plan-board-title">ORIGINAL PLAN</div><div class="plan-route"><div class="plan-stop"><span>🏠</span><b>Base</b></div><i>→</i><div class="plan-stop"><span>🌉</span><b>Bridge</b></div><i>→</i><div class="plan-stop"><span>🌲</span><b>Forest</b></div><i>→</i><div class="plan-stop"><span>🏔️</span><b>Lab</b></div></div><div class="plan-facts"><span>🔋 Battery: 8</span><span>📦 Medicine loaded</span></div></div>
        <div id="s4OverrideAlert" class="incoming-alert"><div class="alert-pulse">⚠️</div><div><small>UPDATE 1</small><strong>Bridge closed. Ridge bypass costs 3 battery.</strong></div></div>
        <div id="s4OverrideChoices" class="choice-grid"></div><div id="s4OverrideFeed"></div>
      </div>`;
      const rounds=[
        {opts:[['adjust','🧭','Change the blocked part','Base → Ridge → Forest → Lab'],['restart','🔄','Restart everything','New goal, new cargo, new route'],['stay','🌉','Use bridge anyway','Ignore the update']],good:'adjust'},
        {alert:'Headwind increases ridge cost from 3 to 5 battery. You still have 8.',opts:[['keep','✅','Keep the ridge route','8 − 5 leaves 3 battery'],['switch','🔄','Change again','Any new fact means a new plan']],good:'keep'}
      ];
      function show(){const r=rounds[phase];if(r.alert)$('#s4OverrideAlert').innerHTML=`<div class="alert-pulse">⚡</div><div><small>UPDATE ${phase+1}</small><strong>${r.alert}</strong></div>`;$('#s4OverrideChoices').innerHTML=r.opts.map(o=>adv.choice(o[0],o[1],o[2],o[3])).join('');document.querySelectorAll('#s4OverrideChoices [data-choice]').forEach(b=>b.onclick=()=>{if(b.dataset.choice===r.good){phase++;if(phase===rounds.length){adv.note('override','complete');$('#s4OverrideFeed').innerHTML=`<div class="response-box success-box"><b>Exactly.</b> Update 1 required a change. Update 2 required a check — but the plan still worked. Flexible thinking is not random switching.</div>${adv.next('ENDURANCE CHECK →')}`;adv.complete('override',8);adv.bindNext();}else show();}else $('#s4OverrideFeed').innerHTML='<div class="response-box">Ask two questions: What changed? Does that actually break the current plan?</div>';});}
      show();
    },

    function(){
      stage.innerHTML = adv.header(
        'FINAL CHECK',
        'One More Mission',
        'No countdown. No “last problem” announcement. Notice what your brain does when it is tired.',
        'ENDURANCE'
      ) + `
      <div class="challenge-panel">
        <div class="reading-card">A research drone must visit exactly three stations. Station A must come before C. Station B cannot be first. Station D is closed. Which order works?</div>
        <div class="choice-grid" id="s4EndChoices">
          ${adv.choice('ABC','1️⃣','A → B → C','Check every rule.')}
          ${adv.choice('BAC','2️⃣','B → A → C','Check every rule.')}
          ${adv.choice('ACB','3️⃣','A → C → B','Check every rule.')}
          ${adv.choice('ADC','4️⃣','A → D → C','Check every rule.')}
        </div>
        <div id="s4EndFeed"></div>
        <div class="response-box blue-box" style="margin-top:16px"><b>Tutor observation:</b> Record first time-check, number of redirects, whether Zach names fatigue/focus himself, and whether he chooses a reset or strategy without being told.</div>
      </div>`;
      document.querySelectorAll('#s4EndChoices [data-choice]').forEach(b=>b.onclick=()=>{
        if(b.dataset.choice==='ABC'){
          adv.note('enduranceSolved',Date.now());
          $('#s4EndFeed').innerHTML=`<div class="response-box success-box"><b>Mission solved.</b> A is before C, B is not first, and D is not used.</div>${adv.next('DEBRIEF →')}`;
          adv.complete('endurance',6);adv.bindNext();
        } else $('#s4EndFeed').innerHTML='<div class="response-box">One rule is being broken. Check each condition one at a time.</div>';
      });
    },

    function(){
      adv.finish(
        'Focus Under Load Complete',
        'The goal was not perfect focus. The goal was noticing when attention, frustration, or a strategy started slipping — and practicing a useful response before an adult had to do all of the noticing.'
      );
    }
  ]
};
