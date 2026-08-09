const state = {
  stage: 0,
  brainPoints: 0,
  hints: 3,
  sound: true,
  startedAt: null,
  stageStartedAt: null,
  notes: {},
  completed: new Set(),
  bossCode: ['7','2','9']
};

const $ = (sel) => document.querySelector(sel);
const stage = $('#stage');
const hero = $('#hero');
const hub = $('#missionHub');
const toolbelt = $('#toolbelt');

const toolData = {
  look: ['👀','LOOK','Slow down and notice what is actually there. What facts, clues, patterns, or rules can you spot?'],
  think: ['🧠','THINK','Make a guess or a plan. It does not have to be perfect. Pick an idea that makes sense.'],
  try: ['🚀','TRY','Do one useful thing. A first try is an experiment, not a final answer.'],
  check: ['🔍','CHECK','Look at what happened. What worked? What did not? What new information do you have?'],
  turtle: ['🐢','TURTLE TOOL','Pause. Reset your body. Then ask: Why am I stuck, and which tool should I use next?']
};

function save(){
  const payload = {...state, completed:[...state.completed]};
  localStorage.setItem('zach20', JSON.stringify(payload));
}
function load(){
  try{
    const raw = JSON.parse(localStorage.getItem('zach20'));
    if(!raw) return;
    Object.assign(state, raw);
    state.completed = new Set(raw.completed || []);
  }catch(e){}
}
function beep(freq=520,dur=.07){
  if(!state.sound) return;
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value=freq; gain.gain.value=.04;
    osc.connect(gain); gain.connect(ctx.destination); osc.start();
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);
    osc.stop(ctx.currentTime+dur);
  }catch(e){}
}
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),1800);
}
function confetti(){
  const colors=['#4fd4ff','#bdf466','#ffd65a','#ff7d6f','#9d82ff'];
  for(let i=0;i<34;i++){
    const c=document.createElement('i'); c.className='confetti';
    c.style.left=Math.random()*100+'vw'; c.style.background=colors[i%colors.length];
    c.style.animationDelay=Math.random()*.5+'s'; c.style.animationDuration=(1.2+Math.random()*1.2)+'s';
    document.body.appendChild(c); setTimeout(()=>c.remove(),2800);
  }
}
function points(n,msg='Brain points earned!'){
  state.brainPoints += n; $('#brainPoints').textContent=state.brainPoints; save();
  toast(`+${n} 🧠 ${msg}`); beep(720,.09);
}
function updateHUD(){
  $('#brainPoints').textContent=state.brainPoints;
  $('#hintCount').textContent=state.hints;
  const done=state.completed.size;
  $('#progressText').textContent=`${Math.min(done,7)} / 7 systems`;
  $('#progressBar').style.width=`${Math.min(done/7*100,100)}%`;
}
function stageHeader(kicker,title,desc,chip='SYSTEM ONLINE'){
  return `<div class="stage-header"><div><div class="stage-kicker">${kicker}</div><h3 class="stage-title">${title}</h3><p class="stage-desc">${desc}</p></div><span class="system-chip">${chip}</span></div>`;
}
function nextButton(label='NEXT SYSTEM →'){
  return `<div class="action-row end"><button class="primary-btn" data-next>${label}</button></div>`;
}
function complete(id,award=5){
  if(!state.completed.has(id)){state.completed.add(id);points(award);}
  updateHUD(); save();
}
function nextStage(){
  state.stage++; state.stageStartedAt=Date.now(); save(); render(); window.scrollTo({top:0,behavior:'smooth'});
}
function useHint(text){
  if(state.hints<=0){toast('No hint chips left. Try LOOK → THINK → TRY → CHECK.');return;}
  state.hints--; $('#hintCount').textContent=state.hints; save();
  showModal('💡','HINT CHIP',text); beep(460,.08);
}
function showModal(icon,title,text){
  $('#modalIcon').textContent=icon; $('#modalTitle').textContent=title; $('#modalText').textContent=text;
  $('#modal').classList.remove('hidden');
}
function bindCommon(){
  document.querySelectorAll('[data-next]').forEach(b=>b.onclick=nextStage);
  document.querySelectorAll('[data-hint]').forEach(b=>b.onclick=()=>useHint(b.dataset.hint));
}

function render(){
  updateHUD();
  const renderers=[renderUnknown,renderTools,renderRescue,renderReading,renderDirections,renderReset,renderBuild,renderStrategy,renderCreator,renderBoss,renderReport];
  (renderers[state.stage]||renderReport)();
  bindCommon();
}

function renderUnknown(){
  toolbelt.classList.add('hidden');
  stage.innerHTML = stageHeader('SYSTEM 0 • DIAGNOSTIC','The Unknown Box','No directions. No examples. Start by noticing what is there.','UNKNOWN') + `
  <div class="challenge-panel">
    <p class="instruction">What do you notice?</p>
    <div class="pattern-board">
      <div class="pattern-tile">🔺<br>3</div><div class="pattern-tile">🔵<br>6</div><div class="pattern-tile">🟩<br>12</div><div class="pattern-tile unknown">?</div>
    </div>
    <input id="noticeInput" class="notice-input" placeholder="Type or say one thing you notice..." />
    <div class="action-row"><button id="testIdea" class="primary-btn">TEST MY IDEA</button></div>
    <div id="unknownResponse"></div>
  </div>`;
  $('#testIdea').onclick=()=>{
    const v=$('#noticeInput').value.trim();
    if(!v){toast('Start with one thing you notice.');return;}
    $('#unknownResponse').innerHTML=`<div class="response-box blue-box">Good scientist move: you noticed something first. Now ask, <b>“How could I test that idea?”</b></div>${nextButton('UNLOCK MY TOOLS →')}`;
    complete('unknown',6); bindCommon();
  };
}

function renderTools(){
  stage.innerHTML = stageHeader('NEW TOOL UNLOCKED','When I Don’t Know','You do not need the answer first. You need a next move.','TOOLBOX') + `
    <div class="challenge-panel">
      <div class="choice-grid">
        <div class="choice-card"><span class="big-emoji">👀</span><strong>1. LOOK</strong><p>What do I notice?</p></div>
        <div class="choice-card"><span class="big-emoji">🧠</span><strong>2. THINK</strong><p>What might be happening?</p></div>
        <div class="choice-card"><span class="big-emoji">🚀</span><strong>3. TRY</strong><p>Pick one idea.</p></div>
        <div class="choice-card"><span class="big-emoji">🔍</span><strong>4. CHECK</strong><p>What happened?</p></div>
      </div>
      <div class="response-box success-box">🐢 <b>Turtle got an upgrade:</b> Pause → get your brain back in charge → choose a tool → go again.</div>
      ${nextButton('START THE LAB →')}
    </div>`;
  complete('tools',4); toolbelt.classList.remove('hidden');
}

function renderRescue(){
  toolbelt.classList.remove('hidden');
  stage.innerHTML = stageHeader('SYSTEM 1 • DESIGN','Creature Rescue','Rescue all three creatures. There is more than one good plan.','BUILD MODE') + `
    <div class="rescue-grid">
      <div class="creature-card"><div class="creature">🦔</div><h4>Boulderback</h4><span class="trait">20 weight</span><span class="trait">cannot swim</span></div>
      <div class="creature-card"><div class="creature">🐇</div><h4>Skyhopper</h4><span class="trait">5 weight</span><span class="trait">jumps 4 spaces</span></div>
      <div class="creature-card"><div class="creature">🦎</div><h4>Riverfin</h4><span class="trait">8 weight</span><span class="trait">must stay wet</span></div>
    </div>
    <div class="challenge-panel">
      <p class="instruction">Your digital supply crate</p>
      <div class="materials"><span class="material">🪵 Board ×3</span><span class="material">🪢 Rope ×1</span><span class="material">🛢️ Barrel ×2</span><span class="material">🧺 Basket ×1</span><span class="material">🧱 Block ×6</span></div>
      <div class="plan-pad"><div><label><b>Step 1</b></label><textarea id="rescuePlan" class="notice-input" placeholder="Draw it on paper? Not today. Type it, say it, or build the plan in words..."></textarea></div><div><label><b>What could go wrong?</b></label><textarea id="riskPlan" class="notice-input" placeholder="One problem to watch for..."></textarea></div></div>
      <div class="action-row"><button id="launchRescue" class="primary-btn">LAUNCH RESCUE</button><button class="secondary-btn" data-hint="Start with the creature who has the toughest rule. Which creature has the fewest ways to cross?">USE 💡 HINT</button></div>
      <div id="rescueResult"></div>
    </div>`;
  $('#launchRescue').onclick=()=>{
    if(!$('#rescuePlan').value.trim()){toast('Make at least one rescue move first.');return;}
    $('#rescueResult').innerHTML=`<div class="response-box alert-box"><b>🚨 CURVEBALL:</b> One board just cracked. You now have only <b>2 boards</b>.<br><br>Which part of your plan still works? What will you change?</div>
      <textarea id="rescueRevise" class="notice-input" placeholder="Revise the plan..." style="margin-top:12px"></textarea>
      <div class="action-row"><button id="adaptRescue" class="primary-btn">ADAPT THE PLAN</button></div>`;
    $('#adaptRescue').onclick=()=>{
      if(!$('#rescueRevise').value.trim()){toast('Change one part of the plan.');return;}
      $('#rescueResult').innerHTML += `<div class="response-box success-box"><b>Flexibility detected.</b> Changing your plan after new information is what strong problem solvers do.</div>${nextButton('NEXT SYSTEM →')}`;
      complete('rescue',8); bindCommon();
    };
  };
}

function renderReading(){
  stage.innerHTML = stageHeader('SYSTEM 2 • READ TO UNLOCK','The Spotted Glider','Reading is a tool. Use it to solve the mission.','READ MODE') + `
    <div class="reading-card">The spotted glider lives high in the forest <span class="vocab">canopy</span>. During the day, it hides beneath large leaves to avoid predators. At sunset, it glides between trees searching for fruit. Unlike most animals that glide, the spotted glider uses its tail to change direction in the air.</div>
    <div class="challenge-panel">
      <p class="instruction">Which feature matters most if the glider must escape through closely spaced trees?</p>
      <div class="choice-grid" id="readChoices">
        <button class="choice-card" data-answer="no"><span class="big-emoji">🍃</span><strong>Large leaves</strong></button>
        <button class="choice-card" data-answer="no"><span class="big-emoji">🍓</span><strong>Fruit</strong></button>
        <button class="choice-card" data-answer="yes"><span class="big-emoji">↪️</span><strong>Its tail</strong><p>Think about turning.</p></button>
        <button class="choice-card" data-answer="no"><span class="big-emoji">🌙</span><strong>Sunset</strong></button>
      </div><div id="readFeedback"></div>
    </div>`;
  document.querySelectorAll('#readChoices button').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('#readChoices button').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected');
    if(btn.dataset.answer==='yes'){
      $('#readFeedback').innerHTML=`<div class="response-box success-box">Exactly. The sentence says the tail helps it <b>change direction</b>. You used evidence, not a guess.</div>
      <div class="challenge-panel"><p class="instruction">Bonus unknown word: What do you think <b>canopy</b> means here?</p><input id="canopy" class="notice-input" placeholder="Use the sentence around it to make a smart guess..."><div class="action-row"><button id="canopyCheck" class="primary-btn">CHECK MY THINKING</button><button class="secondary-btn" data-hint="It says the glider lives HIGH in the forest. What is high above the forest floor?">USE 💡 HINT</button></div><div id="canopyFeedback"></div></div>`;
      bindCommon();
      $('#canopyCheck').onclick=()=>{
        if(!$('#canopy').value.trim()){toast('Make a smart guess first.');return;}
        $('#canopyFeedback').innerHTML=`<div class="response-box blue-box"><b>Canopy</b> is the upper layer of branches and leaves. The bigger win is that you used context before giving up.</div>${nextButton('NEXT SYSTEM →')}`;
        complete('reading',7); bindCommon();
      };
    }else $('#readFeedback').innerHTML=`<div class="response-box">That feature is in the reading, but does it help with <b>turning between close trees</b>? Check the evidence and try again.</div>`;
  });
}

function renderDirections(){
  stage.innerHTML = stageHeader('SYSTEM 3 • CLASSROOM SIM','Catch the Trick','Do not be fast. Be alert. Something in these directions does not make sense.','2ND GRADE SIM') + `
    <div class="challenge-panel"><div class="directions-list">
      <div class="direction">Draw a circle.</div><div class="direction">Put two dots inside it.</div><div class="direction">Draw a square beside the circle.</div><div class="direction">Put one star above the square.</div><div class="direction">Do <b>not</b> put anything inside the square.</div><div class="direction">Put a triangle inside the square.</div>
    </div>
    <p class="instruction" style="margin-top:22px">What should a strong learner do?</p>
    <div class="choice-grid" id="dirChoices">
      <button class="choice-card" data-correct="0"><strong>Just keep going</strong><p>Maybe the teacher meant it.</p></button>
      <button class="choice-card" data-correct="1"><strong>Stop and ask specifically</strong><p>Point out the two directions that disagree.</p></button>
      <button class="choice-card" data-correct="0"><strong>Quit the page</strong><p>It is confusing.</p></button>
      <button class="choice-card" data-correct="0"><strong>Guess fast</strong><p>Pick one rule and hope.</p></button>
    </div><div id="dirFeedback"></div></div>`;
  document.querySelectorAll('#dirChoices button').forEach(btn=>btn.onclick=()=>{
    if(btn.dataset.correct==='1'){
      $('#dirFeedback').innerHTML=`<div class="response-box success-box"><b>Power phrase:</b> “I understand this part, but these two directions seem different. Which one should I follow?”<br><br>That is not being stuck. That is excellent help-seeking.</div>${nextButton('RECALIBRATE →')}`;
      complete('directions',7); bindCommon();
    }else $('#dirFeedback').innerHTML=`<div class="response-box">That move gets you away from the confusion, but it does not solve it. Try a move that gives your brain better information.</div>`;
  });
}

function renderReset(){
  stage.innerHTML=`<div class="recalibrate"><div><div class="orb">🐢</div><h3 class="stage-title">System Recalibration</h3><p class="stage-desc">Stand up. Copy this sequence: <b>reach high → touch knees → one slow martial-arts guard pose → freeze</b>.</p><div class="action-row" style="justify-content:center"><button id="resetDone" class="primary-btn">SYSTEM STEADY ✓</button></div></div></div>`;
  $('#resetDone').onclick=()=>{points(3,'Reset complete');nextStage();};
}

function renderBuild(){
  stage.innerHTML = stageHeader('SYSTEM 4 • TEST + REBUILD','The Digital Tower','The first design is an experiment. Build, test, learn, rebuild.','ENGINEERING') + `
    <div class="challenge-panel">
      <p class="instruction">Choose a base, then stack your six blocks. Wider bases survive better. Taller towers score higher.</p>
      <div class="choice-grid" id="baseChoices">
        <button class="choice-card" data-base="1"><span class="big-emoji">▉</span><strong>1-block base</strong><p>Very tall. Very risky.</p></button>
        <button class="choice-card" data-base="2"><span class="big-emoji">▉ ▉</span><strong>2-block base</strong><p>Balanced.</p></button>
        <button class="choice-card" data-base="3"><span class="big-emoji">▉ ▉ ▉</span><strong>3-block base</strong><p>Wide and steady.</p></button>
        <button class="choice-card" data-base="4"><span class="big-emoji">▉ ▉ ▉ ▉</span><strong>4-block base</strong><p>Strong, but shorter.</p></button>
      </div>
      <div id="towerArea"></div>
    </div>`;
  document.querySelectorAll('#baseChoices button').forEach(btn=>btn.onclick=()=>buildTower(Number(btn.dataset.base)));
}
function buildTower(base){
  const height=7-base;
  $('#towerArea').innerHTML=`<div class="tower-zone" id="towerZone"><div class="tower-stack">${Array.from({length:height},(_,i)=>`<div class="block">${i+1}</div>`).join('')}</div></div>
  <div class="action-row"><button id="quake" class="danger-btn primary-btn">🌎 EARTHQUAKE TEST</button></div><div id="quakeResult"></div>`;
  $('#quake').onclick=()=>{
    $('#towerZone').classList.add('quake'); beep(130,.3);
    setTimeout(()=>{
      const survives=base>=3;
      $('#quakeResult').innerHTML=survives?`<div class="response-box success-box"><b>It stands!</b> What made this design stable? Could you make it taller without losing that strength?</div>${nextButton('NEXT SYSTEM →')}`:`<div class="response-box alert-box"><b>CRASH.</b> Perfect. The fall gave you information. What will you change on attempt 2?</div><div class="action-row"><button id="rebuild" class="primary-btn">REBUILD SMARTER</button></div>`;
      if(survives){complete('build',8);bindCommon();}
      else $('#rebuild').onclick=()=>{toast('Use what the fall taught you. Pick a new base.');};
    },650);
  };
}

function renderStrategy(){
  stage.innerHTML = stageHeader('SYSTEM 5 • STRATEGY','Route Duel','Good problem solvers can change their minds when the information changes.','DECISION MODE') + `
    <div class="choice-grid">
      <button class="choice-card route-card" data-route="A"><h4>Plan A: Closest First</h4><div class="route-points"><span class="route-dot">🐾 1</span><span class="route-dot">🐾 2</span><span class="route-dot">🐾 3</span></div><p>Fast start. Easy samples first.</p></button>
      <button class="choice-card route-card" data-route="B"><h4>Plan B: Hardest First</h4><div class="route-points"><span class="route-dot">🧗 6</span><span class="route-dot">🐾 4</span><span class="route-dot">🐾 2</span></div><p>Hard work early.</p></button>
    </div><div id="strategyFeed"></div>`;
  document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{
    state.notes.firstRoute=b.dataset.route;
    $('#strategyFeed').innerHTML=`<div class="response-box alert-box"><b>NEW INFORMATION:</b> Sample #6 disappears after five minutes. Also, it needs two tools to collect.</div>
    <p class="instruction">Now which plan do you choose?</p><div class="choice-grid"><button class="choice-card" id="routeA2"><strong>Plan A</strong><p>Stay with closest first.</p></button><button class="choice-card" id="routeB2"><strong>Plan B</strong><p>Go after #6 first.</p></button></div><div id="strategyFinal"></div>`;
    $('#routeA2').onclick=()=>finishStrategy('A'); $('#routeB2').onclick=()=>finishStrategy('B');
  });
}
function finishStrategy(route){
  const changed=route!==state.notes.firstRoute;
  $('#strategyFinal').innerHTML=`<div class="response-box ${changed?'success-box':'blue-box'}">${changed?'<b>You changed your mind because the facts changed.</b> That is flexible thinking, not failure.':'Sticking with a plan can be smart too, but you should be able to explain why the new information did not change your choice.'}</div>${nextButton('NEXT SYSTEM →')}`;
  complete('strategy',7);bindCommon();
}

function renderCreator(){
  stage.innerHTML = stageHeader('SYSTEM 6 • CREATOR MODE','Make Me Struggle','You have solved my problems. Now build a digital challenge that could fool me.','ZACH = DESIGNER') + `
    <div class="challenge-panel"><p class="instruction">Your challenge needs all four ingredients:</p>
      <div class="creator-options">
        <button class="creator-toggle">🔎 One clue</button><button class="creator-toggle">📏 One rule</button><button class="creator-toggle">⚡ One surprise</button><button class="creator-toggle">🛣️ Two possible ideas</button>
      </div>
      <textarea id="creatorText" class="notice-input" style="min-height:180px;margin-top:15px" placeholder="Type your challenge here. You can also tell Mike what to type for you..."></textarea>
      <div class="action-row"><button id="creatorReady" class="primary-btn">CHALLENGE MIKE</button></div><div id="creatorFeed"></div>
    </div>`;
  document.querySelectorAll('.creator-toggle').forEach(b=>b.onclick=()=>b.classList.toggle('active'));
  $('#creatorReady').onclick=()=>{
    if($('#creatorText').value.trim().length<8){toast('Give me a little more challenge first.');return;}
    $('#creatorFeed').innerHTML=`<div class="response-box success-box"><b>Designer mode unlocked.</b> Mike now has to solve your challenge. If he asks a specific question, notice how that helps him get unstuck.</div>${nextButton('FINAL BOSS →')}`;
    complete('creator',8);bindCommon();
  };
}

function renderBoss(){
  stage.innerHTML = stageHeader('FINAL BOSS','Restart the Power Core','Several kinds of thinking. One mission. Three hint chips were available because knowing when to ask for help is a skill too.','BOSS MODE') + `
    <div class="boss-grid"><div class="boss-node">📖 READ</div><div class="boss-node">🧠 REMEMBER</div><div class="boss-node">🔍 NOTICE</div><div class="boss-node">🛣️ CHOOSE</div><div class="boss-node">⚡ ADAPT</div><div class="boss-node">💡 ASK?</div></div>
    <div class="challenge-panel"><p class="instruction">Memorize this power code. You will need it after the puzzle.</p><div class="code-display" id="bossCode"><span class="code-chip">7</span><span class="code-chip">2</span><span class="code-chip">9</span></div>
    <div class="action-row"><button id="hideCode" class="primary-btn">I'VE GOT IT</button></div><div id="bossPuzzle"></div></div>`;
  $('#hideCode').onclick=()=>{
    $('#bossCode').innerHTML='<span class="code-chip">?</span><span class="code-chip">?</span><span class="code-chip">?</span>';
    $('#bossPuzzle').innerHTML=`<div class="response-box blue-box"><b>Power clue:</b> The red door is not safe. The green door takes twice as long. The blue door is safe unless the warning light flashes.</div>
      <p class="instruction">⚠️ The warning light just flashed. Which door now makes the most sense?</p>
      <div class="choice-grid" id="doorChoices"><button class="choice-card" data-door="red">🔴 Red</button><button class="choice-card" data-door="green">🟢 Green</button><button class="choice-card" data-door="blue">🔵 Blue</button><button class="choice-card" data-hint="Remove the doors that are unsafe right now. Which safe option remains?">💡 Use a hint</button></div><div id="doorFeed"></div>`;
    bindCommon();
    document.querySelectorAll('[data-door]').forEach(b=>b.onclick=()=>{
      if(b.dataset.door==='green'){
        $('#doorFeed').innerHTML=`<div class="response-box success-box">Safe choice. Now enter the power code from memory.</div><input id="codeEntry" class="notice-input" maxlength="3" inputmode="numeric" placeholder="3 digits"><div class="action-row"><button id="codeCheck" class="primary-btn">RESTART CORE</button></div>`;
        $('#codeCheck').onclick=()=>{
          const val=$('#codeEntry').value.trim();
          if(val==='729'){
            $('#doorFeed').innerHTML=`<div class="response-box success-box"><b>POWER CORE ONLINE.</b> You read, remembered, changed plans, and finished the mission.</div>${nextButton('OPEN LAB REPORT →')}`;
            complete('boss',12);confetti();bindCommon();
          }else $('#doorFeed').innerHTML+=`<div class="response-box">Not quite. Before asking for the answer, what could you do to help your memory?</div>`;
        };
      } else $('#doorFeed').innerHTML=`<div class="response-box">Check the newest information. Is that door safe <b>right now</b>?</div>`;
    });
  };
}

function renderReport(){
  toolbelt.classList.remove('hidden');
  stage.innerHTML = stageHeader('MISSION COMPLETE','Lab Report','Strong brains do not just finish. They notice what helped them improve.','DEBRIEF') + `
    <div class="report-grid">
      <div class="report-card"><h4>1. What was hardest?</h4><textarea id="hardest" class="notice-input" placeholder="The hardest part was..."></textarea></div>
      <div class="report-card"><h4>2. What did you do when stuck?</h4><textarea id="stuck" class="notice-input" placeholder="I used..."></textarea></div>
      <div class="report-card"><h4>3. What are you better at now?</h4><textarea id="better" class="notice-input" placeholder="Now I can..."></textarea></div>
    </div>
    <div class="action-row"><button id="saveReport" class="primary-btn">SAVE LAB REPORT</button></div><div id="reportFeed"></div>`;
  $('#saveReport').onclick=()=>{
    state.notes.report={hardest:$('#hardest').value,stuck:$('#stuck').value,better:$('#better').value};save();
    $('#reportFeed').innerHTML=`<div class="cliffhanger"><div class="glitch">⚠ SECOND GRADE SYSTEM DETECTED</div><h3>Incoming transmission...</h3><p>Your teacher hands you something you have never seen before.</p><p><b>What do you do first?</b></p><div class="system-label" style="color:#a9bce6">TRANSMISSION ENDS</div></div>
      <div class="response-box success-box"><b>Mike's observation:</b> Name one specific moment when Zach handled uncertainty, changed a strategy, or returned after frustration. That is the behavior to reinforce.</div>`;
    complete('report',5);confetti();
  };
}

$('#enterLab').onclick=()=>{
  hero.classList.add('hidden'); hub.classList.remove('hidden');
  state.startedAt ||= Date.now(); state.stageStartedAt=Date.now(); save(); render(); beep(620,.12);
};
$('#soundToggle').onclick=()=>{state.sound=!state.sound;$('#soundToggle').textContent=state.sound?'🔊':'🔇';save();};
$('#modalClose').onclick=()=>$('#modal').classList.add('hidden');
$('#modal').onclick=(e)=>{if(e.target.id==='modal')$('#modal').classList.add('hidden');};
toolbelt.addEventListener('click',(e)=>{
  const b=e.target.closest('[data-tool]'); if(!b)return;
  const [icon,title,text]=toolData[b.dataset.tool];showModal(icon,title,text);
});

load(); updateHUD();
if(state.startedAt){hero.classList.add('hidden');hub.classList.remove('hidden');render();}
