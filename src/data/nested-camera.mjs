import { clamp, CHAPTER_STOPS } from './journey-math.mjs';

// Compressed, imaginative coordinates. Every destination is a child of the
// previous view; none is introduced as a replacement full-screen slide.
const fieldSize=.115;
const galaxySize=fieldSize*.14;
const galaxy={x:fieldSize*.16,y:-fieldSize*.035,size:galaxySize};
const system={x:galaxy.x+galaxySize*.235,y:galaxy.y+galaxySize*.052,radius:galaxySize*.018};
const earth={x:system.x+Math.cos(-1.05)*.34*system.radius,y:system.y+Math.sin(-1.05)*.34*system.radius*.48,radius:system.radius*.024};
export const COSMOS=Object.freeze({hole:{x:0,y:0,size:1},field:{x:0,y:0,size:fieldSize},galaxy,system,earth});

export function cameraAt(progress,width,height) {
  const mobile=width<720;
  const targets=[
    {x:0,y:0,scale:width*(mobile?1.9:1.2)},
    {x:0,y:0,scale:Math.min(width*1.5,height*1.5)/fieldSize},
    {x:galaxy.x,y:galaxy.y,scale:Math.min(width*(mobile?1.4:.85),height*1.25)/galaxySize},
    {x:system.x,y:system.y,scale:Math.min(width*(mobile?.58:.32),height*.43)/system.radius},
    {x:earth.x,y:earth.y,scale:Math.min(width*(mobile?.37:.235),height*.34)/earth.radius},
  ];
  const p=clamp(progress);
  let i=0;while(i<3&&p>CHAPTER_STOPS[i+1])i++;
  const t=clamp((p-CHAPTER_STOPS[i])/(CHAPTER_STOPS[i+1]-CHAPTER_STOPS[i]));
  // Logarithmic interpolation gives a continuous journey over nested scales.
  // Hermite tangents preserve camera speed across chapter boundaries.
  const logs=targets.map(item=>Math.log(item.scale));
  const slope=index=>index===0?(logs[1]-logs[0])/(CHAPTER_STOPS[1]-CHAPTER_STOPS[0]):index===4?(logs[4]-logs[3])/(CHAPTER_STOPS[4]-CHAPTER_STOPS[3]):(logs[index+1]-logs[index-1])/(CHAPTER_STOPS[index+1]-CHAPTER_STOPS[index-1]);
  const span=CHAPTER_STOPS[i+1]-CHAPTER_STOPS[i];
  const log=(2*t**3-3*t*t+1)*logs[i]+(t**3-2*t*t+t)*span*slope(i)+(-2*t**3+3*t*t)*logs[i+1]+(t**3-t*t)*span*slope(i+1);
  const eased=t*t*(3-2*t);
  return {x:targets[i].x+(targets[i+1].x-targets[i].x)*eased,y:targets[i].y+(targets[i+1].y-targets[i].y)*eased,scale:Math.exp(log)};
}
