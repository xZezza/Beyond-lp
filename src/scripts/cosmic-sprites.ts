import { darkMatteCoverage, discBounds, radialCoverage } from '../data/cosmic-composite.mjs';

type SpriteKind = 'hole' | 'galaxy' | 'field' | 'earth';
/** Cached transparent sprites keep photographic black mattes out of the scene. */
export class CosmicSprites {
  private cache = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

  get(image: HTMLImageElement, kind: SpriteKind) {
    const cached=this.cache.get(image);
    if(cached) return cached;
    const canvas=kind==='earth'?this.planet(image):this.cloud(image,kind);
    this.cache.set(image,canvas);
    return canvas;
  }

  private cloud(image: HTMLImageElement,kind: 'hole'|'galaxy'|'field') {
    const canvas=document.createElement('canvas');
    canvas.width=kind==='galaxy'||kind==='field'?1600:2400;
    canvas.height=kind==='galaxy'||kind==='field'?1600:Math.round(2400*image.naturalHeight/image.naturalWidth);
    const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    const data=pixels.data;
    for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++) {
      const i=(y*canvas.width+x)*4;
      // The radial fade eliminates corners; the luminance key removes black
      // between the arms rather than treating the source as an opaque tile.
      const edge=radialCoverage(x/(canvas.width-1),y/(canvas.height-1),kind==='field'?.82:kind==='galaxy'?.62:.64,1);
      const matte=darkMatteCoverage(data[i],data[i+1],data[i+2],kind==='galaxy'?2:1,kind==='galaxy'?26:20);
      data[i+3]=Math.round(data[i+3]*edge*matte);
    }
    ctx.putImageData(pixels,0,0);
    return canvas;
  }

  private planet(image: HTMLImageElement) {
    const sample=document.createElement('canvas');sample.width=sample.height=768;
    const source=sample.getContext('2d',{willReadFrequently:true})!;
    source.drawImage(image,0,0,768,768);
    const data=source.getImageData(0,0,768,768);
    const bounds=discBounds(data.data,768,768);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const ctx=canvas.getContext('2d')!;
    // Crop tightly around the actual sphere, keeping a small antialias margin.
    const diameter=bounds.radius*2.035;
    ctx.drawImage(sample,bounds.x-diameter/2,bounds.y-diameter/2,diameter,diameter,0,0,1024,1024);
    ctx.globalCompositeOperation='destination-in';
    const mask=ctx.createRadialGradient(512,512,497,512,512,506);
    mask.addColorStop(0,'#fff');mask.addColorStop(.5,'#fffffff0');mask.addColorStop(1,'#fff0');
    ctx.fillStyle=mask;ctx.fillRect(0,0,1024,1024);
    ctx.globalCompositeOperation='source-over';
    return canvas;
  }
}
