// Integration layer for the expanded Challenge Lab.
// Keeps system progress, Creator transition, saved-state reloads, and tutor navigation aligned.

const zachSystemIds = [
  'unknown',
  'rescue',
  'reading',
  'directions',
  'build',
  'strategy',
  'creator',
  'broken-machine',
  'mission-override'
];

updateHUD = function(){
  $('#brainPoints').textContent=state.brainPoints;
  $('#hintCount').textContent=state.hints;
  const done=zachSystemIds.filter(id=>state.completed.has(id)).length;
  $('#progressText').textContent=`${done} / ${zachSystemIds.length} systems`;
  $('#progressBar').style.width=`${Math.min(done/zachSystemIds.length*100,100)}%`;
};

const zachCreatorBeforeExpansion = renderCreator;
renderCreator = function(){
  zachCreatorBeforeExpansion();
  const next=document.querySelector('[data-next]');
  if(next && next.textContent.includes('FINAL BOSS')) next.textContent='NEW SYSTEM DETECTED →';
};

// app.js may have rendered a saved stage before the continuation scripts loaded.
// Re-render now so stages 9–12 use the expanded sequence immediately after refresh.
updateHUD();
if(state.startedAt){
  render();
}
