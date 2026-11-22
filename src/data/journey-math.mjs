/** Scroll positions for a cinematic sequence, not astronomical distances. */
export const CHAPTER_STOPS = Object.freeze([0, 0.28, 0.49, 0.73, 1]);
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const range = (a, b, value) => clamp((value - a) / (b - a));
export const smooth = (a, b, value) => { const t = range(a, b, value); return t * t * (3 - 2 * t); };
export function chapterAt(progress) {
  let closest = 0;
  for (let i = 1; i < CHAPTER_STOPS.length; i++) {
    if (Math.abs(CHAPTER_STOPS[i] - progress) < Math.abs(CHAPTER_STOPS[closest] - progress)) closest = i;
  }
  return closest;
}
export function scrollProgress(top, travel) {
  return travel > 0 ? clamp(-top / travel) : 0;
}
export function scrollForChapter(top, travel, index) {
  return top + Math.max(0, travel) * CHAPTER_STOPS[clamp(index, 0, CHAPTER_STOPS.length - 1)];
}
export function seededRandom(seed = 7) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}

// One out-and-back preview, then manual exploration until explicit replay.
export const INTRO_TIMING = Object.freeze({forward:12000,back:8000});
export const INTRO_DURATION = INTRO_TIMING.forward+INTRO_TIMING.back;
export function introAt(elapsed) {
  const t=Math.max(0,elapsed);
  if(t>=INTRO_DURATION)return {progress:0,phase:'complete',done:true};
  const ease=value=>(1-Math.cos(Math.PI*clamp(value)))/2;
  if(t<INTRO_TIMING.forward) return {progress:ease(t/INTRO_TIMING.forward),phase:'forward',done:false};
  return {progress:1-ease((t-INTRO_TIMING.forward)/INTRO_TIMING.back),phase:'back',done:false};
}
