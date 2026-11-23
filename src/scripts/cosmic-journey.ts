import { CHAPTER_STOPS, chapterAt, scrollProgress, scrollForChapter, introAt } from '../data/journey-math.mjs';
import { CosmicRenderer } from './cosmic-renderer';
import {holeShouldPlay} from '../data/earth-interaction.mjs';

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
  const earthControl=root.querySelector<HTMLButtonElement>('.earth-interaction');
  const earthHint=root.querySelector<HTMLElement>('.earth-rotate-hint');
  if(!canvas||!stage||!toggle||chapters.length!==CHAPTER_STOPS.length) return;
  const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyStill=false,enhanced=false,disposed=false,interacted=false;
  let active=-1,caption=-1,current=0,target=0,frame=0,lastTime=0;
  let chapterGlide=false,intro=false,introElapsed=0,previewFinished=false;
  let introScrollTarget:number|null=null;
  let holeReturned=false,motionWanted=false,lastHud=0,lastScrub=-1,lastAria='',lastEarthBox='',lastEarthState='',lastEarthPose='';
  let statsSince=0,statsFrames=0,statsDraw=0,statsPeak=0;
  let renderer: CosmicRenderer|undefined;
  const motion=root.querySelector<HTMLVideoElement>('.journey-motion-source');
  const assets={
    hole:load('/assets/black-hole-detail-clean.jpg'),
    field:load('/assets/webb-deep-field-full.jpg'),
    earth:load('/assets/earth-surface-nasa.jpg'),
  };

  function load(url:string) {
    const image=new Image();image.decoding='async';image.src=url;
    image.addEventListener('load',requestDraw);
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
  function updateProgress(now=performance.now(),force=false) {
    root.style.setProperty('--travel-progress',String(current));
    if(!force&&now-lastHud<100)return;lastHud=now;
    if(scrubber){
      const value=Math.round(current*1000),label=`${nav[chapterAt(current)].textContent?.trim()}, ${Math.round(current*100)}%`;
      if(value!==lastScrub){scrubber.value=String(value);lastScrub=value;}
      if(label!==lastAria){scrubber.setAttribute('aria-valuetext',label);lastAria=label;}
    }
  }
  function syncHoleMotion() {
    if(!motion)return;
    const rect=root.getBoundingClientRect();
    const wanted=holeShouldPlay({enhanced,visible:!document.hidden&&rect.bottom>0&&rect.top<innerHeight,progress:current,returned:holeReturned});
    root.dataset.holeMotion=holeReturned?'parked':wanted?'playing':'paused';
    if(wanted===motionWanted)return;motionWanted=wanted;
    if(wanted){motion.muted=true;void motion.play().catch(()=>{motionWanted=false;});}else motion.pause();
  }
  function updateEarthControl() {
    if(!earthControl||!renderer)return;
    const enabled=enhanced&&current>=.90;
    if(earthControl.hidden===enabled){earthControl.hidden=!enabled;if(earthHint)earthHint.hidden=!enabled;}
    if(!enabled)return;
    const {x,y,radius}=renderer.earthHitArea;
    const box=[Math.round(x-radius),Math.round(y-radius),Math.round(radius*2)].join(',');
    if(box!==lastEarthBox){lastEarthBox=box;earthControl.style.transform=`translate3d(${x-radius}px,${y-radius}px,0)`;earthControl.style.width=earthControl.style.height=`${radius*2}px`;}
    const spinning=renderer.earthSpinning;
    const state=String(spinning);
    if(state!==lastEarthState){lastEarthState=state;
      earthControl.setAttribute('aria-pressed',String(!spinning));
      earthControl.setAttribute('aria-label',spinning?'Pause Earth rotation':'Resume Earth rotation');
      if(earthHint)earthHint.textContent=spinning?'Drag to rotate · click to pause':'Drag to rotate · click to resume';
    }
    const {yaw,pitch}=renderer.earthOrientation,pose=`${yaw},${pitch}`;
    if(pose!==lastEarthPose){lastEarthPose=pose;root.dataset.earthYaw=yaw.toFixed(4);root.dataset.earthPitch=pitch.toFixed(4);}
    if(root.dataset.earthRenderer!==renderer.earthBackend)root.dataset.earthRenderer=renderer.earthBackend;
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
    if(reset){holeReturned=true;current=target=0;window.scrollTo({top:position(),behavior:'instant'});}
    playbackUI();syncHoleMotion();requestDraw();
  }
  function startIntro() {
    if(!enhanced||reducedQuery.matches)return;
    intro=true;holeReturned=false;introElapsed=0;current=target=0;lastTime=0;chapterGlide=false;
    if(motion&&motion.readyState>=1)motion.currentTime=0;
    introScrollTarget=position();
    history.replaceState(null,'','#horizon');
    window.scrollTo({top:introScrollTarget,behavior:'instant'});
    playbackUI();syncHoleMotion();requestDraw();
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
    syncHoleMotion();
    const drawStart=import.meta.env.DEV?performance.now():0;
    renderer?.draw(current,now);updateProgress(now);updateChapter(chapterAt(current));updateEarthControl();
    if(import.meta.env.DEV){
      const cost=performance.now()-drawStart;statsFrames++;statsDraw+=cost;statsPeak=Math.max(statsPeak,cost);
      if(!statsSince)statsSince=now;
      if(now-statsSince>=1000){root.dataset.renderStats=JSON.stringify({fps:Math.round(statsFrames*1000/(now-statsSince)),meanMs:+(statsDraw/statsFrames).toFixed(1),peakMs:+statsPeak.toFixed(1)});statsSince=now;statsFrames=0;statsDraw=0;statsPeak=0;}
    }
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
      if(instant){current=target=CHAPTER_STOPS[index];renderer?.draw(current);updateProgress(performance.now(),true);updateChapter(index);updateEarthControl();}
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
    renderer?.draw(current);updateProgress(performance.now(),true);updateChapter(chapterAt(current));updateEarthControl();requestDraw();
  });
  const replay=root.querySelector<HTMLButtonElement>('[data-journey-replay]');
  if(replay){replay.hidden=false;replay.addEventListener('click',()=>{if(enhanced)startIntro();else jump(0);});}
  let earthPointer:number|null=null,earthX=0,earthY=0,earthTravel=0,earthDragged=false;
  function earthDown(event:PointerEvent) {
    if(event.button!==0||!earthControl||earthPointer!==null)return;
    takeControl();earthPointer=event.pointerId;earthX=event.clientX;earthY=event.clientY;earthTravel=0;earthDragged=false;
    earthControl.setPointerCapture(event.pointerId);earthControl.classList.add('is-dragging');
  }
  function earthMove(event:PointerEvent) {
    if(event.pointerId!==earthPointer)return;
    const dx=event.clientX-earthX,dy=event.clientY-earthY;earthX=event.clientX;earthY=event.clientY;
    earthTravel+=Math.hypot(dx,dy);if(earthTravel<3)return;
    earthDragged=true;renderer?.rotateEarth(dx,dy);updateEarthControl();requestDraw();event.preventDefault();
  }
  function earthUp(event:PointerEvent) {
    if(event.pointerId!==earthPointer)return;earthPointer=null;earthControl?.classList.remove('is-dragging');
    if(earthControl?.hasPointerCapture(event.pointerId))earthControl.releasePointerCapture(event.pointerId);
  }
  function earthClick() {if(earthDragged){earthDragged=false;return;}takeControl();renderer?.toggleEarthSpin();updateEarthControl();requestDraw();}
  function earthKey(event:KeyboardEvent) {
    const delta:Record<string,number[]>={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]};
    if(!delta[event.key])return;event.preventDefault();event.stopPropagation();takeControl();renderer?.rotateEarth(...delta[event.key] as [number,number]);updateEarthControl();requestDraw();
  }
  earthControl?.addEventListener('pointerdown',earthDown);earthControl?.addEventListener('pointermove',earthMove);
  earthControl?.addEventListener('pointerup',earthUp);earthControl?.addEventListener('pointercancel',earthUp);
  earthControl?.addEventListener('click',earthClick);earthControl?.addEventListener('keydown',earthKey);
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
    if(enhanced){syncHoleMotion();resize();}else{motion?.pause();cancelAnimationFrame(frame);frame=0;chapters.forEach(chapter=>{chapter.inert=false;chapter.removeAttribute('aria-hidden');});}
    syncHoleMotion();updateEarthControl();
    if(preserve)jump(oldActive,true);
  }
  function onPreference(){setMode(true);}
  function onVisibility(){lastTime=0;syncHoleMotion();requestDraw();}
  toggle.addEventListener('click',()=>{interacted=true;manuallyStill=!manuallyStill;setMode(true);});
  reducedQuery.addEventListener('change',onPreference);
  window.addEventListener('hashchange',onHashChange);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('wheel',takeControl,{passive:true});window.addEventListener('touchstart',takeControl,{passive:true});window.addEventListener('pointerdown',onPointer,{passive:true});window.addEventListener('keydown',onKey);
  document.addEventListener('click',onDocumentClick);document.addEventListener('visibilitychange',onVisibility);
  motion?.addEventListener('loadeddata',()=>{syncHoleMotion();requestDraw();});motion?.addEventListener('playing',requestDraw);
  try{renderer=new CosmicRenderer(canvas,assets,motion||undefined);}catch{renderer=undefined;}
  setMode();playbackUI();
  const initial=chapters.findIndex(chapter=>'#'+chapter.id===location.hash);if(initial>=0)jump(initial,true,false);
  const observer=new ResizeObserver(resize);observer.observe(stage);
  Promise.all(Object.values(assets).map(image=>image.decode().catch(()=>undefined))).then(async()=>{
    if(renderer&&assets.earth.naturalWidth)await renderer.prepareBodies();
    if(!disposed&&!interacted&&enhanced&&(!location.hash||location.hash==='#horizon')&&Math.abs(root.getBoundingClientRect().top)<24)startIntro();
  });
  document.addEventListener('astro:before-swap',()=>{
    disposed=true;motion?.pause();cancelAnimationFrame(frame);observer.disconnect();
    earthControl?.removeEventListener('pointerdown',earthDown);earthControl?.removeEventListener('pointermove',earthMove);earthControl?.removeEventListener('pointerup',earthUp);earthControl?.removeEventListener('pointercancel',earthUp);earthControl?.removeEventListener('click',earthClick);earthControl?.removeEventListener('keydown',earthKey);
    window.removeEventListener('hashchange',onHashChange);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);window.removeEventListener('wheel',takeControl);window.removeEventListener('touchstart',takeControl);window.removeEventListener('pointerdown',onPointer);window.removeEventListener('keydown',onKey);
    document.removeEventListener('click',onDocumentClick);document.removeEventListener('visibilitychange',onVisibility);reducedQuery.removeEventListener('change',onPreference);
  },{once:true});
}
