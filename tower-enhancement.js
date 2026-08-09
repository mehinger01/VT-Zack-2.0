// Interactive earthquake tower enhancement for Zach 2.0
// Loaded after app.js so this intentionally replaces the original renderBuild().

function renderBuild(){
  const COLS = 7;
  const ROWS = 8;
  const MAX_BLOCKS = 16;
  const heights = Array(COLS).fill(0);
  let blocksUsed = 0;
  let attempt = 1;
  let testing = false;

  stage.innerHTML = stageHeader(
    'SYSTEM 4 • TEST + REBUILD',
    'Earthquake Tower Lab',
    'Stack real digital blocks. Build as high as you dare, then see what the earthquake does to YOUR design.',
    'ENGINEERING'
  ) + `
    <div class="challenge-panel tower-lab-panel">
      <div class="tower-mission-strip">
        <div><span class="tower-mission-icon">🏗️</span><b>Your mission</b><br><small>Build a tower with up to ${MAX_BLOCKS} blocks.</small></div>
        <div class="tower-stat"><span>Attempt</span><strong id="towerAttempt">1</strong></div>
        <div class="tower-stat"><span>Blocks left</span><strong id="blocksLeft">${MAX_BLOCKS}</strong></div>
        <div class="tower-stat"><span>Height</span><strong id="towerHeight">0</strong></div>
      </div>

      <div class="response-box blue-box tower-tip">
        <b>Builder controls:</b> Click a column to stack a block. Click the top block in a column to remove it. Try any shape you want.
      </div>

      <div class="tower-workbench">
        <div class="tower-supply" aria-label="Block supply">
          <div class="supply-title">BLOCK CRATE</div>
          <div class="supply-blocks" id="supplyBlocks"></div>
          <small>Use them wisely.</small>
        </div>

        <div class="tower-site-wrap">
          <div class="quake-meter" id="quakeMeter">
            <span>EARTHQUAKE POWER</span>
            <div class="quake-meter-track"><div class="quake-meter-fill"></div></div>
          </div>
          <div class="tower-site" id="towerSite" aria-label="Tower building grid"></div>
          <div class="tower-ground"><span>TEST PLATFORM</span></div>
          <div class="column-controls" id="columnControls"></div>
        </div>
      </div>

      <div class="action-row tower-actions">
        <button id="clearTower" class="secondary-btn">↺ CLEAR</button>
        <button id="quake" class="danger-btn primary-btn" disabled>🌎 START EARTHQUAKE</button>
      </div>
      <div id="quakeResult"></div>
    </div>`;

  const site = $('#towerSite');
  const controls = $('#columnControls');

  function renderSupply(){
    const left = MAX_BLOCKS - blocksUsed;
    $('#blocksLeft').textContent = left;
    $('#towerHeight').textContent = Math.max(...heights);
    $('#towerAttempt').textContent = attempt;
    $('#supplyBlocks').innerHTML = Array.from({length: left}, () => '<span class="supply-cube"></span>').join('');
    $('#quake').disabled = blocksUsed < 4 || testing;
  }

  function blockColor(row, col){
    const palette = ['cyan','lime','gold','violet'];
    return palette[(row + col) % palette.length];
  }

  function renderGrid(){
    site.innerHTML = '';
    for(let row = ROWS - 1; row >= 0; row--){
      for(let col = 0; col < COLS; col++){
        const cell = document.createElement('button');
        cell.className = 'tower-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        const occupied = row < heights[col];
        if(occupied){
          cell.classList.add('occupied', `block-${blockColor(row,col)}`);
          cell.innerHTML = '<span class="brick-stud"></span><span class="brick-stud"></span>';
          cell.setAttribute('aria-label', `Block in column ${col+1}, level ${row+1}`);
          if(row === heights[col]-1) cell.classList.add('top-block');
        } else {
          cell.setAttribute('aria-label', `Empty space in column ${col+1}`);
        }
        cell.onclick = () => handleCell(row,col);
        site.appendChild(cell);
      }
    }

    controls.innerHTML = heights.map((_,col) =>
      `<button class="stack-btn" data-stack-col="${col}" ${blocksUsed>=MAX_BLOCKS?'disabled':''}>+<span>${col+1}</span></button>`
    ).join('');
    controls.querySelectorAll('[data-stack-col]').forEach(btn => {
      btn.onclick = () => addBlock(Number(btn.dataset.stackCol));
    });
    renderSupply();
  }

  function addBlock(col){
    if(testing || blocksUsed >= MAX_BLOCKS || heights[col] >= ROWS) return;
    heights[col]++;
    blocksUsed++;
    beep(430 + heights[col]*22,.04);
    renderGrid();
  }

  function removeTop(col){
    if(testing || heights[col] <= 0) return;
    heights[col]--;
    blocksUsed--;
    beep(260,.04);
    renderGrid();
  }

  function handleCell(row,col){
    if(testing) return;
    if(row < heights[col]){
      if(row === heights[col]-1) removeTop(col);
      else toast('Remove blocks from the top first.');
    } else {
      addBlock(col);
    }
  }

  function contiguousBaseWidth(){
    let best=0, current=0;
    for(const h of heights){
      if(h>0){current++;best=Math.max(best,current);} else current=0;
    }
    return best;
  }

  function balanceScore(){
    const maxH = Math.max(...heights);
    const baseW = contiguousBaseWidth();
    if(!maxH || !baseW) return 0;

    const occupiedCols = heights.map((h,i)=>h>0?i:null).filter(v=>v!==null);
    const baseCenter = occupiedCols.reduce((a,b)=>a+b,0)/occupiedCols.length;
    let weighted = 0, mass = 0;
    heights.forEach((h,col)=>{
      for(let r=0;r<h;r++){
        const weight = 1 + r*0.1;
        weighted += col*weight;
        mass += weight;
      }
    });
    const center = mass ? weighted/mass : baseCenter;
    const leanPenalty = Math.abs(center-baseCenter)*1.4;
    const narrowPenalty = Math.max(0, maxH-(baseW+2))*0.75;
    const unevenness = Math.max(...heights)-Math.min(...heights.filter(h=>h>0));
    return baseW*2.15 - narrowPenalty - leanPenalty - unevenness*0.18;
  }

  function chooseFallingBlocks(){
    const score = balanceScore();
    const maxH = Math.max(...heights);
    let fallCount = 0;
    if(score < 2.4) fallCount = Math.max(2, Math.ceil(blocksUsed*0.55));
    else if(score < 4.0) fallCount = Math.max(1, Math.ceil(blocksUsed*0.30));
    else if(maxH >= 7 && contiguousBaseWidth() < 4) fallCount = Math.max(1, Math.ceil(blocksUsed*0.20));

    const candidates=[];
    heights.forEach((h,col)=>{
      for(let row=h-1; row>=0; row--) candidates.push({row,col});
    });
    candidates.sort((a,b)=> b.row-a.row || Math.abs(b.col-3)-Math.abs(a.col-3));
    return candidates.slice(0, fallCount);
  }

  function runEarthquake(){
    if(blocksUsed < 4 || testing) return;
    testing = true;
    renderSupply();
    $('#quakeResult').innerHTML = '';
    $('#quakeMeter').classList.add('active');
    site.classList.add('earthquake-active');
    beep(120,.7);

    const falling = chooseFallingBlocks();

    setTimeout(()=>{
      falling.forEach((block,index)=>{
        const selector = `.tower-cell[data-row="${block.row}"][data-col="${block.col}"]`;
        const el = site.querySelector(selector);
        if(el){
          el.style.setProperty('--fall-delay', `${index*55}ms`);
          el.style.setProperty('--fall-x', `${block.col < 3 ? -1 : 1}`);
          el.classList.add('block-fall');
        }
      });
    },550);

    setTimeout(()=>{
      site.classList.remove('earthquake-active');
      $('#quakeMeter').classList.remove('active');

      if(falling.length===0){
        testing=false;
        $('#quakeResult').innerHTML = `
          <div class="response-box success-box tower-result-card">
            <b>🏆 IT STANDS!</b><br>
            Your ${blocksUsed}-block tower survived. Look at the shape you made. What do you think helped it stay up?
          </div>
          <div class="action-row"><button id="pushFurther" class="secondary-btn">BUILD AN EVEN TALLER ONE</button></div>
          ${nextButton('NEXT SYSTEM →')}`;
        $('#pushFurther').onclick=()=>{
          attempt++;
          $('#quakeResult').innerHTML='';
          renderGrid();
          toast('Can you make it taller and still keep it stable?');
        };
        complete('build',8);
        bindCommon();
      } else {
        falling.forEach(({row,col})=>{
          if(heights[col] > row){
            blocksUsed -= (heights[col]-row);
            heights[col] = row;
          }
        });
        // Recalculate because multiple falling cells can come from one column.
        blocksUsed = heights.reduce((sum,h)=>sum+h,0);
        testing=false;
        renderGrid();
        $('#quakeResult').innerHTML = `
          <div class="response-box alert-box tower-result-card">
            <b>💥 CRASH!</b><br>
            ${falling.length} block${falling.length===1?'':'s'} came down. That is not a bad result. The earthquake just gave you information.
          </div>
          <div class="response-box blue-box">
            <b>Engineer question:</b> What will you change before Test ${attempt+1}? A wider bottom? Less weight up high? A more even shape?
          </div>
          <div class="action-row"><button id="rebuild" class="primary-btn">🔧 REBUILD SMARTER</button></div>`;
        $('#rebuild').onclick=()=>{
          attempt++;
          $('#quakeResult').innerHTML='';
          renderGrid();
          toast('Use what the crash taught you.');
        };
      }
    },1500);
  }

  $('#quake').onclick = runEarthquake;
  $('#clearTower').onclick = ()=>{
    if(testing) return;
    heights.fill(0);
    blocksUsed=0;
    renderGrid();
    $('#quakeResult').innerHTML='';
  };

  renderGrid();
}