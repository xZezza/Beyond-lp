import { CHAPTER_STOPS, chapterAt, scrollProgress, scrollForChapter } from '../data/journey-math.mjs';
import { CosmicRenderer } from './cosmic-renderer';

/** Enhances native chapter sections without intercepting wheel/touch gestures. */
export function initCosmicJourney(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('.cosmic-canvas');
  const stage = root.querySelector<HTMLElement>('.journey-stage');
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const nav = Array.from(root.querySelectorAll<HTMLAnchorElement>('.journey-navigation a'));
  const toggle = root.querySelector<HTMLButtonElement>('.journey-motion-toggle');
  const attribution = root.querySelector<HTMLElement>('.journey-attribution');
  const status = root.querySelector<HTMLElement>('.journey-sr-status');
  if (!canvas || !stage || !toggle || chapters.length !== CHAPTER_STOPS.length) return;
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyStill = false;
  let enhanced = false;
  let active = -1;
  let current = 0;
  let target = 0;
  let frame = 0;
  let lastTime = 0;
  let renderer: CosmicRenderer | undefined;
  let disposed = false;
  const assets = {
    hole: load('/assets/black-hole-nasa.webp'),
    field: load('/assets/webb-deep-field.webp'),
    galaxy: load('/assets/milky-way-illustration.webp'),
    earth: load('/assets/earth-blue-marble-nasa.webp'),
  };

  function load(url: string) {
    const image = new Image();
    image.decoding = 'async'; image.src = url;
    image.addEventListener('load', requestDraw);
    // The semantic image sections remain available when an asset fails.
    return image;
  }
  function travel() { return Math.max(0, root.offsetHeight - stage!.offsetHeight); }
  function position() { return root.getBoundingClientRect().top + window.scrollY; }
  function updateChapter(index: number) {
    if (index === active) return;
    active = index;
    chapters.forEach((chapter,i) => {
      chapter.classList.toggle('is-current',i === index);
      chapter.inert = enhanced && i !== index;
      if (enhanced && i !== index) chapter.setAttribute('aria-hidden','true'); else chapter.removeAttribute('aria-hidden');
    });
    nav.forEach((link,i) => {if (i===index) link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    if (attribution) attribution.textContent = chapters[index].dataset.credit || '';
    if (status) status.textContent = nav[index].textContent?.trim() || '';
  }
  function tick(now: number) {
    frame = 0;
    if (!enhanced || disposed || document.hidden) return;
    target = scrollProgress(root.getBoundingClientRect().top, travel());
    const dt = lastTime ? Math.min(now-lastTime,40) : 16;
    lastTime = now;
    current += (target-current) * (1-Math.exp(-dt/65));
    if (Math.abs(target-current)<.00005) current=target;
    renderer?.draw(current);
    root.style.setProperty('--travel-progress',String(current));
    updateChapter(chapterAt(current));
    if (current!==target) frame=requestAnimationFrame(tick); else lastTime=0;
  }
  function requestDraw() {
    if (enhanced && !frame && !disposed && !document.hidden) frame=requestAnimationFrame(tick);
  }
  function jump(index: number, instant = false) {
    if (enhanced) {
      const top=scrollForChapter(position(),travel(),index);
      // The scroll drives all visual movement; do not also run a timed animation.
      window.scrollTo({top,behavior:'instant'});
      if (instant) {current=CHAPTER_STOPS[index];renderer?.draw(current);updateChapter(index);}
      requestDraw();
    } else chapters[index].scrollIntoView({block:'start',behavior:'instant'});
  }
  function onJump(event: Event) {
    const link=event.currentTarget as HTMLElement;
    const index=Number(link.dataset.journeyJump);
    if (Number.isInteger(index) && index>=0 && index<chapters.length && enhanced) {
      event.preventDefault();
      history.replaceState(null,'','#'+chapters[index].id);
      jump(index);
    }
  }
  const jumps=Array.from(root.querySelectorAll<HTMLElement>('[data-journey-jump]'));
  jumps.forEach(link=>link.addEventListener('click',onJump));
  function onHashChange() {
    const index=chapters.findIndex(chapter=>'#'+chapter.id===location.hash);
    if (index>=0) jump(index);
  }
  window.addEventListener('hashchange',onHashChange);
  const replay=root.querySelector<HTMLButtonElement>('[data-journey-replay]');
  if (replay) {replay.hidden=false;replay.addEventListener('click',()=>jump(0));}
  function resize() {
    if (enhanced) {
      renderer?.resize(stage!.clientWidth,stage!.clientHeight);
      current=scrollProgress(root.getBoundingClientRect().top,travel());
      requestDraw();
    }
  }
  function setMode(preservePosition=false) {
    const oldActive=Math.max(active,0);
    const still=manuallyStill||reducedQuery.matches||!renderer;
    enhanced=!still;
    root.dataset.mode=still?'still':'zoom';
    document.documentElement.classList.toggle('motion-paused',still);
    toggle!.hidden=false;toggle!.disabled=reducedQuery.matches||!renderer;
    toggle!.textContent=reducedQuery.matches?'Still scenes · system preference':!renderer?'Still scenes':still?'Enable the zoom':'Use still scenes';
    toggle!.setAttribute('aria-pressed',String(still));
    active=-1;updateChapter(oldActive);
    if (enhanced) resize(); else {cancelAnimationFrame(frame);frame=0;chapters.forEach(chapter=>{chapter.inert=false;chapter.removeAttribute('aria-hidden');});}
    if (preservePosition) jump(oldActive,true);
  }
  function onPreference() {setMode(true);}
  toggle.addEventListener('click',()=>{manuallyStill=!manuallyStill;setMode(true);});
  reducedQuery.addEventListener('change',onPreference);
  window.addEventListener('scroll',requestDraw,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',requestDraw);
  try {renderer=new CosmicRenderer(canvas,assets);} catch {renderer=undefined;}
  setMode();
  const initial=chapters.findIndex(chapter=>'#'+chapter.id===location.hash);
  if (initial>=0) jump(initial,true);
  const observer=new ResizeObserver(resize);observer.observe(stage);
  // The page uses ordinary navigation. Clean up if Astro navigation is added later.
  document.addEventListener('astro:before-swap',()=>{
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();
    window.removeEventListener('scroll',requestDraw);window.removeEventListener('resize',resize);window.removeEventListener('hashchange',onHashChange);
    document.removeEventListener('visibilitychange',requestDraw);reducedQuery.removeEventListener('change',onPreference);
  },{once:true});
}
