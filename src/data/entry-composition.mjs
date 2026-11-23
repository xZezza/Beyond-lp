import {clamp} from './journey-math.mjs';

/** Keep the texture's solid central area larger than the viewport. This is
 * image framing only: no aperture, ring erasure, or crop is applied to the disc.
 * Once the world-scale field is large enough, its original framing is exact. */
export function entryFieldSize(worldSize,width,height,anchorX,anchorY,startX=anchorX,startY=anchorY) {
 const reach=Math.max(
  Math.hypot(Math.max(anchorX,width-anchorX),Math.max(anchorY,height-anchorY)),
  Math.hypot(Math.max(startX,width-startX),Math.max(startY,height-startY)),
 );
 const cover=reach*2/.78;
 const band=cover*.12;
 const difference=Math.abs(worldSize-cover);
 return Math.max(worldSize,cover)+(difference<band?(band-difference)**2/(4*band):0);
}

/** Fade the whole, intact disc only after entering its centre. Quintic easing
 * has zero velocity and acceleration at both ends, including the old .30 cut. */
export function entryDiscOpacity(progress) {
 if(progress<=.235)return 1;
 if(progress>=.35)return 0;
 const t=clamp((progress-.235)/.115);
 return 1-t*t*t*(t*(t*6-15)+10);
}
