import {clamp} from './journey-math.mjs';
/** Rotation is independent of the route/orbit camera. */
export function dragEarth(pose,dx,dy,diameter) {
 const scale=Math.max(24,diameter);
 return {yaw:pose.yaw-dx/scale*.5,pitch:clamp(pose.pitch+dy/scale*1.6,-1.35,1.35)};
}
export function holeShouldPlay({enhanced,visible,progress,returned}) {
 return enhanced&&visible&&!returned&&progress<.35;
}
