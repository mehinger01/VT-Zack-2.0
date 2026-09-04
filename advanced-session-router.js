// Router for Zach 2.0 Sessions 4–12.
(function(){
  state.programSession = Number(state.programSession || 1);
  state.sessionStep = Number(state.sessionStep || 0);

  const baseRender = render;
  const baseUpdateHUD = updateHUD;

  window.zachSetProgramSession = function(sessionNo){
    state.programSession = Number(sessionNo);
    state.sessionStep = 0;
    state.stageStartedAt = Date.now();
    state.startedAt ||= Date.now();
    save();
    hero.classList.add('hidden');
    hub.classList.remove('hidden');
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  };

  window.zachAdvanceSessionStep = function(){
    const spec = window.ZACH_SESSIONS[state.programSession];
    if(!spec) return;
    state.sessionStep = Math.min((state.sessionStep||0)+1, spec.stages.length-1);
    state.stageStartedAt = Date.now();
    save();
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  };

  window.zachBackSessionStep = function(){
    const spec = window.ZACH_SESSIONS[state.programSession];
    if(!spec) return;
    state.sessionStep = Math.max((state.sessionStep||0)-1,0);
    state.stageStartedAt = Date.now();
    save();render();window.scrollTo({top:0,behavior:'smooth'});
  };

  window.zachAdvancedSessionInfo = function(){
    const spec=window.ZACH_SESSIONS[state.programSession];
    if(!spec || state.programSession<4) return null;
    return {session:state.programSession,title:spec.title,step:state.sessionStep||0,total:spec.stages.length};
  };

  updateHUD = function(){
    if(state.programSession>=4 && window.ZACH_SESSIONS[state.programSession]){
      const spec=window.ZACH_SESSIONS[state.programSession];
      $('#brainPoints').textContent=state.brainPoints;
      $('#hintCount').textContent=state.hints;
      const step=Math.min((state.sessionStep||0)+1,spec.stages.length);
      $('#progressText').textContent=`Step ${step} / ${spec.stages.length}`;
      $('#progressBar').style.width=`${step/spec.stages.length*100}%`;
      return;
    }
    baseUpdateHUD();
  };

  render = function(){
    if(state.programSession>=4 && window.ZACH_SESSIONS[state.programSession]){
      const spec=window.ZACH_SESSIONS[state.programSession];
      const step=Math.max(0,Math.min(state.sessionStep||0,spec.stages.length-1));
      state.sessionStep=step;
      toolbelt.classList.remove('hidden');
      const kicker=document.querySelector('.hub-heading .system-label');
      const title=document.querySelector('.hub-heading h2');
      if(kicker) kicker.textContent=`SESSION ${state.programSession}`;
      if(title) title.textContent=spec.title;
      updateHUD();
      spec.stages[step]();
      if(stage){
        const banner=document.createElement('div');
        banner.className='advanced-session-banner';
        banner.innerHTML=`<span class="session-title-chip">SESSION ${state.programSession}</span><small>${spec.ef}</small>`;
        stage.insertBefore(banner,stage.firstChild);
      }
      adv.bindNext();
      return;
    }
    const kicker=document.querySelector('.hub-heading .system-label');
    const title=document.querySelector('.hub-heading h2');
    if(kicker) kicker.textContent='CHALLENGE LAB';
    if(title) title.textContent="New Doesn't Mean Impossible";
    baseRender();
  };

  if(state.startedAt && state.programSession>=4){render();}
})();