// Ensures the interactive tower builder replaces the original base-choice tower
// even when app.js restores the saved tower stage before tower-enhancement.js loads.
(function activateTowerEnhancement(){
  let upgrading = false;

  function upgradeIfNeeded(){
    if (upgrading) return;
    const oldTower = document.querySelector('#baseChoices') || document.querySelector('.tower-stack');
    const newTower = document.querySelector('.tower-lab-panel');
    if (!oldTower || newTower || typeof renderBuild !== 'function') return;

    upgrading = true;
    try {
      renderBuild();
    } finally {
      setTimeout(() => { upgrading = false; }, 0);
    }
  }

  // Fix the page immediately when a saved session reloads directly onto System 4.
  upgradeIfNeeded();

  const stageEl = document.querySelector('#stage');
  if (stageEl) {
    const observer = new MutationObserver(() => upgradeIfNeeded());
    observer.observe(stageEl, { childList: true, subtree: true });
  }
})();
