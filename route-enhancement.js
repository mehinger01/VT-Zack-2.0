// Context-rich replacement for the original Route Duel.
function renderStrategy(){
  stage.innerHTML = stageHeader(
    'SYSTEM 5 • STRATEGY',
    'Wildlife Scout Mission',
    'Make a plan with the information you have. Then decide what to do when the facts change.',
    'FIELD DECISION'
  ) + `
    <div class="challenge-panel route-mission-panel">
      <div class="route-brief">
        <div class="route-role">🧭 <div><small>YOUR ROLE</small><strong>Lead Wildlife Scout</strong></div></div>
        <div class="route-goal">🎯 <div><small>YOUR MISSION</small><strong>Collect 3 animal research samples before the field drone must return.</strong></div></div>
      </div>

      <div class="response-box blue-box">
        <b>What is happening?</b> Scientists spotted three animals in different parts of the reserve. Your drone can visit all three, but you must choose the order. Right now, every sample looks equally important.
      </div>

      <div class="field-map" aria-label="Wildlife research map">
        <div class="field-station easy"><span class="station-number">2</span><span class="station-animal">🦋</span><b>Meadow</b><small>Close • easy sample</small></div>
        <div class="field-path">•••••</div>
        <div class="field-station medium"><span class="station-number">4</span><span class="station-animal">🦊</span><b>Forest</b><small>Middle distance</small></div>
        <div class="field-path">•••••</div>
        <div class="field-station hard"><span class="station-number">6</span><span class="station-animal">🦅</span><b>Cliff</b><small>Farthest • hardest sample</small></div>
      </div>

      <p class="instruction">You are at BASE CAMP. Which route would you choose first?</p>
      <div class="choice-grid" id="routeChoices">
        <button class="choice-card route-card" data-route="A">
          <span class="route-plan-icon">⚡</span>
          <h4>Route A: Closest First</h4>
          <div class="route-sequence"><span>BASE</span><b>→</b><span>🦋 2</span><b>→</b><span>🦊 4</span><b>→</b><span>🦅 6</span></div>
          <p>Start with the easiest nearby sample and work outward.</p>
        </button>
        <button class="choice-card route-card" data-route="B">
          <span class="route-plan-icon">🧗</span>
          <h4>Route B: Hardest First</h4>
          <div class="route-sequence"><span>BASE</span><b>→</b><span>🦅 6</span><b>→</b><span>🦊 4</span><b>→</b><span>🦋 2</span></div>
          <p>Go straight to the difficult cliff sample while your equipment is fresh.</p>
        </button>
      </div>
      <div id="strategyFeed"></div>
    </div>`;

  document.querySelectorAll('[data-route]').forEach(btn => btn.onclick = () => {
    state.notes.firstRoute = btn.dataset.route;
    save();
    document.querySelectorAll('[data-route]').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');

    $('#strategyFeed').innerHTML = `
      <div class="incoming-alert">
        <div class="alert-pulse">⚠️</div>
        <div><small>NEW FIELD REPORT</small><strong>The eagle at Station 6 is about to leave the cliff.</strong></div>
      </div>
      <div class="response-box alert-box">
        <b>New information:</b> Station 6 will disappear in about <b>5 minutes</b>. It also takes both the <b>rope</b> and <b>scanner</b> to collect that sample. The meadow and forest animals are staying put.
      </div>
      <p class="instruction">Your first plan was reasonable with the old information. What should you do now?</p>
      <div class="choice-grid">
        <button class="choice-card" id="routeA2"><strong>Stay with Route A</strong><p>Keep doing the closest samples first.</p></button>
        <button class="choice-card" id="routeB2"><strong>Switch to Route B</strong><p>Go to the eagle before it leaves.</p></button>
      </div>
      <div id="strategyFinal"></div>`;

    $('#routeA2').onclick = () => finishContextStrategy('A');
    $('#routeB2').onclick = () => finishContextStrategy('B');
  });
}

function finishContextStrategy(route){
  const changed = route !== state.notes.firstRoute;
  const smartChoice = route === 'B';
  state.notes.secondRoute = route;
  save();
  $('#strategyFinal').innerHTML = `
    <div class="response-box ${smartChoice?'success-box':'blue-box'}">
      ${smartChoice
        ? `<b>Good adjustment.</b> The new information changed which job was most urgent. ${changed ? 'You changed your plan because the facts changed. That is flexible thinking.' : 'Your original plan still fits the new information, and now you can explain why.'}`
        : `<b>Your plan can continue, but there is a risk.</b> The eagle may leave before you reach Station 6. Strong planners ask: “Did the new information change what is most important?”`}
    </div>
    <div class="response-box">
      <b>Scout rule:</b> Changing a plan is not the same as making a mistake. A good plan should change when important information changes.
    </div>
    ${nextButton('NEXT SYSTEM →')}`;
  complete('strategy',7);
  bindCommon();
}

// If the saved lesson reloads directly on the old Route Duel, replace it immediately.
(function activateRouteEnhancement(){
  let upgrading = false;
  function upgradeIfNeeded(){
    if(upgrading) return;
    const oldRoute = document.querySelector('.route-card') && document.body.textContent.includes('Route Duel');
    const newRoute = document.querySelector('.route-mission-panel');
    if(!oldRoute || newRoute) return;
    upgrading = true;
    try{ renderStrategy(); } finally { setTimeout(()=>upgrading=false,0); }
  }
  upgradeIfNeeded();
  const stageEl = document.querySelector('#stage');
  if(stageEl) new MutationObserver(upgradeIfNeeded).observe(stageEl,{childList:true,subtree:true});
})();
