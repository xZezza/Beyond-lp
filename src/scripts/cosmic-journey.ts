import { CHAPTER_STOPS, chapterAt, scrollProgress, scrollForChapter, introAt } from '../data/journey-math.mjs';
import { CosmicRenderer } from './cosmic-renderer';

/** A skippable automatic preview hands control to native scroll and chapter links. */
export function initCosmicJourney(root: HTMLElement) {
  const canvas=root.querySelector<HTMLCanvasElement>('.cosmic-canvas');
  const stage=root.querySelector<HTMLElement>('.journey-stage');
  const chapters=Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const nav=Array.from(root.querySelectorAll<HTMLAnchorElement>('.journey-navigation a'));
  const toggle=root.querySelector<HTMLButtonElement>('.journey-motion-toggle');
  const introSkip=root.querySelector<HTMLButtonElement>('.journey-intro-skip');
  const theorySkip=root.querySelector<HTMLAnchorElement>('.journey-skip');
  const scrubber=root.querySelector<HTMLInputElement>('.journey-scrubber');
  const attribution=root.querySelector<HTMLElement>('.journey-attribution');
  const status=root.querySelector<HTMLElement>('.journey-sr-status');
  const scrollHint=root.querySelector<HTMLElement>('.journey-scroll-hint');
  if(!canvas||!stage||!toggle||chapters.length!==CHAPTER_STOPS.length) return;
  const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyStill=false,enhanced=false,disposed=false,interacted=false;
  let active=-1,caption=-1,current=0,target=0,frame=0,lastTime=0;
  let chapterGlide=false,intro=false,introElapsed=0,previewFinished=false;
  let introScrollTarget:number|null=null;
  let renderer: CosmicRenderer|undefined;
  const motion=root.querySelector<HTMLVideoElement>('.journey-motion-source');
  const assets={
    hole:load('/assets/black-hole-detail.jpg','hole'),
    field:load('/assets/webb-deep-field.webp','field'),
    galaxy:load('/assets/milky-way-illustration.webp','galaxy'),
    earth:load('/assets/earth-surface-nasa.jpg'),
  };

  function load(url:string,kind?:'hole'|'galaxy'|'field'|'earth') {
    const image=new Image();image.decoding='async';image.src=url;
    image.addEventListener('load',()=>{if(kind)renderer?.prepare(image,kind);requestDraw();});
    return image;
  }
  function travel(){return Math.max(0,root.offsetHeight-stage!.offsetHeight);}
  function position(){return root.getBoundingClientRect().top+window.scrollY;}
  function updateChapter(index:number) {
    const captionIndex=intro?0:index;
    if(captionIndex!==caption) {
      caption=captionIndex;
      chapters.forEach((chapter,i)=>{
        chapter.classList.toggle('is-current',i===captionIndex);
        chapter.inert=enhanced&&i!==captionIndex;
        if(enhanced&&i!==captionIndex)chapter.setAttribute('aria-hidden','true');else chapter.removeAttribute('aria-hidden');
      });
    }
    if(index===active)return;
    active=index;
    nav.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    if(attribution)attribution.textContent=chapters[index].dataset.credit||'';
    if(status)status.textContent=(intro?'Previewing ':'')+(nav[index].textContent?.trim()||'');
  }
  function updateProgress() {
    root.style.setProperty('--travel-progress',String(current));
    if(scrubber){scrubber.value=String(Math.round(current*1000));scrubber.setAttribute('aria-valuetext',`${nav[chapterAt(current)].textContent?.trim()}, ${Math.round(current*100)}%`);}
  }
  function playbackUI() {
    root.dataset.playback=intro?'intro':'manual';
    if(introSkip)introSkip.hidden=!intro;
    if(theorySkip)theorySkip.hidden=intro;
    if(scrollHint)scrollHint.textContent=intro?'Scroll to take control':previewFinished?'Your turn · scroll to explore':'Scroll to travel';
    active=-1;caption=-1;updateChapter(chapterAt(current));
  }
  function endIntro(reset=false) {
    if(!intro)return;
    intro=false;previewFinished=true;lastTime=0;introScrollTarget=null;
    if(reset){current=target=0;window.scrollTo({top:position(),behavior:'instant'});}
    playbackUI();requestDraw();
  }
  function startIntro() {
    if(!enhanced||reducedQuery.matches)return;
    intro=true;introElapsed=0;current=target=0;lastTime=0;chapterGlide=false;
    if(motion&&motion.readyState>=1){motion.currentTime=0;void motion.play().catch(()=>undefined);}
    introScrollTarget=position();
    history.replaceState(null,'','#horizon');
    window.scrollTo({top:introScrollTarget,behavior:'instant'});
    playbackUI();requestDraw();
  }
  function tick(now:number) {
    frame=0;
    if(!enhanced||disposed||document.hidden){lastTime=0;return;}
    const dt=lastTime?Math.min(now-lastTime,64):16;lastTime=now;
    if(intro) {
      introElapsed+=dt;
      const step=introAt(introElapsed);current=target=step.progress;
      // Complete exactly one return trip, then leave the camera at the horizon.
      if(step.done)endIntro(true);
    } else {
      target=scrollProgress(root.getBoundingClientRect().top,travel());
      current+=(target-current)*(1-Math.exp(-dt/(chapterGlide?210:95)));
      if(Math.abs(target-current)<.00005){current=target;chapterGlide=false;}
    }
    renderer?.draw(current,now);updateProgress();updateChapter(chapterAt(current));
    const live=renderer?.hasLiveMotion(current)&&root.getBoundingClientRect().bottom>0&&root.getBoundingClientRect().top<innerHeight;
    if(intro||current!==target||live) {if(!frame)frame=requestAnimationFrame(tick);} else lastTime=0;
  }
  function requestDraw(){if(enhanced&&!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick);}
  function takeControl() {
    interacted=true;chapterGlide=false;
    if(intro){const progress=current;endIntro();window.scrollTo({top:position()+travel()*progress,behavior:'instant'});current=target=progress;}
  }
  function onScroll(){
    if(intro&&Math.abs(window.scrollY-(introScrollTarget??position()))<24){requestDraw();return;}
    if(intro){interacted=true;endIntro();}requestDraw();
  }
  function jump(index:number,instant=false,markInteraction=true) {
    if(markInteraction)interacted=true;endIntro();
    if(enhanced) {
      chapterGlide=!instant;
      window.scrollTo({top:scrollForChapter(position(),travel(),index),behavior:'instant'});
      if(instant){current=target=CHAPTER_STOPS[index];renderer?.draw(current);updateProgress();updateChapter(index);}
      requestDraw();
    } else chapters[index].scrollIntoView({block:'start',behavior:'instant'});
  }
  function onJump(event:Event) {
    const index=Number((event.currentTarget as HTMLElement).dataset.journeyJump);
    if(Number.isInteger(index)&&index>=0&&index<chapters.length&&enhanced){event.preventDefault();history.replaceState(null,'','#'+chapters[index].id);jump(index);}
  }
  root.querySelectorAll<HTMLElement>('[data-journey-jump]').forEach(link=>link.addEventListener('click',onJump));
  function onHashChange(){const index=chapters.findIndex(chapter=>'#'+chapter.id===location.hash);if(index>=0)jump(index);else if(intro){interacted=true;endIntro();}}
  function onDocumentClick(event:MouseEvent){const link=(event.target as Element)?.closest('a');if(intro&&link&&!link.hasAttribute('data-journey-jump')){interacted=true;endIntro();}}
  function onKey(event:KeyboardEvent){if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)&&!(event.target instanceof HTMLInputElement))takeControl();if(event.key==='Escape'&&intro){interacted=true;endIntro(true);}}
  function onPointer(){interacted=true;chapterGlide=false;}
  introSkip?.addEventListener('click',takeControl);
  scrubber?.addEventListener('input',()=>{
    interacted=true;endIntro();chapterGlide=false;
    current=target=Number(scrubber.value)/1000;
    window.scrollTo({top:position()+travel()*current,behavior:'instant'});
    renderer?.draw(current);updateProgress();updateChapter(chapterAt(current));requestDraw();
  });
  const replay=root.querySelector<HTMLButtonElement>('[data-journey-replay]');
  if(replay){replay.hidden=false;replay.addEventListener('click',()=>{if(enhanced)startIntro();else jump(0);});}
  function resize(){chapterGlide=false;if(enhanced){renderer?.resize(stage!.clientWidth,stage!.clientHeight);if(!intro)current=scrollProgress(root.getBoundingClientRect().top,travel());requestDraw();}}
  function setMode(preserve=false) {
    const oldActive=Math.max(active,0);
    if(intro){interacted=true;endIntro();}
    const still=manuallyStill||reducedQuery.matches||!renderer;enhanced=!still;
    root.dataset.mode=still?'still':'zoom';document.documentElement.classList.toggle('motion-paused',still);
    toggle!.hidden=false;toggle!.disabled=reducedQuery.matches||!renderer;
    toggle!.textContent=reducedQuery.matches?'Still scenes · system preference':!renderer?'Still scenes':still?'Enable the zoom':'Use still scenes';toggle!.setAttribute('aria-pressed',String(still));
    if(scrubber)scrubber.hidden=still;
    active=-1;caption=-1;updateChapter(oldActive);
    if(enhanced){if(motion&&!reducedQuery.matches){motion.muted=true;void motion.play().catch(()=>undefined);}resize();}else{motion?.pause();cancelAnimationFrame(frame);frame=0;chapters.forEach(chapter=>{chapter.inert=false;chapter.removeAttribute('aria-hidden');});}
    if(preserve)jump(oldActive,true);
  }
  function onPreference(){setMode(true);}
  function onVisibility(){lastTime=0;if(document.hidden)motion?.pause();else if(enhanced&&motion)void motion.play().catch(()=>undefined);requestDraw();}
  toggle.addEventListener('click',()=>{interacted=true;manuallyStill=!manuallyStill;setMode(true);});
  reducedQuery.addEventListener('change',onPreference);
  window.addEventListener('hashchange',onHashChange);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('wheel',takeControl,{passive:true});window.addEventListener('touchstart',takeControl,{passive:true});window.addEventListener('pointerdown',onPointer,{passive:true});window.addEventListener('keydown',onKey);
  document.addEventListener('click',onDocumentClick);document.addEventListener('visibilitychange',onVisibility);
  motion?.addEventListener('loadeddata',requestDraw);motion?.addEventListener('playing',requestDraw);
  try{renderer=new CosmicRenderer(canvas,assets,motion||undefined);}catch{renderer=undefined;}
  setMode();playbackUI();
  const initial=chapters.findIndex(chapter=>'#'+chapter.id===location.hash);if(initial>=0)jump(initial,true,false);
  const observer=new ResizeObserver(resize);observer.observe(stage);
  Promise.all(Object.values(assets).map(image=>image.decode().catch(()=>undefined))).then(()=>{
    if(!disposed&&!interacted&&enhanced&&(!location.hash||location.hash==='#horizon')&&Math.abs(root.getBoundingClientRect().top)<24)startIntro();
  });
  document.addEventListener('astro:before-swap',()=>{
    disposed=true;motion?.pause();cancelAnimationFrame(frame);observer.disconnect();
    window.removeEventListener('hashchange',onHashChange);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);window.removeEventListener('wheel',takeControl);window.removeEventListener('touchstart',takeControl);window.removeEventListener('pointerdown',onPointer);window.removeEventListener('keydown',onKey);
    document.removeEventListener('click',onDocumentClick);document.removeEventListener('visibilitychange',onVisibility);reducedQuery.removeEventListener('change',onPreference);
  },{once:true});
}
