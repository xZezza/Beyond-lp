/** Soft coverage masks used at texture boundaries; all coordinates are normalized. */
const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => {const t=clamp(value);return t*t*(3-2*t);};
export function radialCoverage(x,y,inner=.65,outer=1) {
  const radius=Math.hypot((x-.5)*2,(y-.5)*2);
  return 1-smooth((radius-inner)/(outer-inner));
}
export function darkMatteCoverage(red,green,blue,floor=3,ceiling=24) {
  return smooth((Math.max(red,green,blue)-floor)/(ceiling-floor));
}
/** Detect the bounds of a full-disc planet photograph against its black matte. */
export function discBounds(pixels,width,height) {
  let left=width,right=-1,top=height,bottom=-1;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;
    if(Math.max(pixels[i],pixels[i+1],pixels[i+2])>24&&pixels[i+3]>0) {
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
  }
  if(right<left) return {x:width/2,y:height/2,radius:Math.min(width,height)*.45};
  return {x:(left+right)/2,y:(top+bottom)/2,radius:Math.max(right-left+1,bottom-top+1)/2};
}
