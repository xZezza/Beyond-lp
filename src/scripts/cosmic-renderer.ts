import { clamp, mix, smooth, seededRandom } from '../data/journey-math.mjs';
import { CosmicSprites } from './cosmic-sprites';
import { COSMOS, cameraAt, earthAt } from '../data/nested-camera.mjs';
import { EarthGlobe } from './earth-globe';
import { GalaxyCloud } from './galaxy-cloud';
import {PLANETS,orbitalPosition} from '../data/orbital-motion.mjs';
import {makePlanet} from './planet-surfaces';

type Assets = { hole: HTMLImageElement; field: HTMLImageElement; galaxy: HTMLImageElement; earth: HTMLImageElement };
type Star = { x: number; y: number; depth: number; size: number; alpha: number };
const TAU = Math.PI * 2;

/** Illustrated camera movement; no physical scale or path is implied. */
export class CosmicRenderer {
  private width = 0;
  private height = 0;
  private ratio = 1;
  private stars: Star[];
  private ctx: CanvasRenderingContext2D;
  private sprites = new CosmicSprites();
  private globe?: EarthGlobe;
  private galaxy = new GalaxyCloud();
  private planets=new Map<string,EarthGlobe>();

  constructor(private canvas: HTMLCanvasElement, private assets: Assets, private motion?: HTMLVideoElement) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas unavailable');
    this.ctx = context;
    const random = seededRandom(2407);
    this.stars = Array.from({ length: 850 }, () => ({ x: random() * 2 - 1, y: random() * 2 - 1, depth: .25 + random() * .75, size: .3 + random() * 1.4, alpha: .15 + random() * .7 }));
  }

  hasLiveMotion(progress: number) {return progress>.58||(progress<.30&&!!this.motion&&!this.motion.paused&&this.motion.readyState>=2);}

  prepare(image: HTMLImageElement,kind: 'hole'|'galaxy'|'field'|'earth') {
    if(this.ready(image)) this.sprites.get(image,kind);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    // Avoid a full-resolution retina framebuffer on smaller devices.
    this.ratio = Math.min(devicePixelRatio || 1, width < 720 ? 1.5 : 1.75);
    this.canvas.width = Math.round(width * this.ratio);
    this.canvas.height = Math.round(height * this.ratio);
    this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  }

  draw(progress: number,time=performance.now()) {
    const p = clamp(progress);
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;
    const mobile = w < 720;
    const anchorX = w * (mobile ? .51 : .70);
    const anchorY = h * (mobile ? .64 : .49);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const starAlpha = mix(.005, 1, smooth(.08, .28, p));
    const reveal=mix(.012,1,smooth(.07,.25,p));
    if (starAlpha > 0) this.drawStars(p, starAlpha, anchorX, anchorY);

    const camera=cameraAt(p,w,h,time);
    const point=(x:number,y:number)=>({x:anchorX+(x-camera.x)*camera.scale,y:anchorY+(y-camera.y)*camera.scale});
    const field=point(COSMOS.field.x,COSMOS.field.y);
    const fieldSize=COSMOS.field.size*camera.scale;
    // This field exists inside the horizon from the first frame. The camera
    // enlarges it in place instead of dissolving to another full-screen image.
    if(this.ready(this.assets.field)&&fieldSize>1) {
      ctx.save();ctx.beginPath();ctx.arc(field.x,field.y,fieldSize*.50,0,TAU);ctx.clip();
      const detail=1-smooth(h*3,h*6,fieldSize);
      ctx.globalAlpha=detail*reveal;
      ctx.drawImage(this.sprites.get(this.assets.field,'field'),field.x-fieldSize/2,field.y-fieldSize/2,fieldSize,fieldSize);
      ctx.restore();
    }

    const galaxy=point(COSMOS.galaxy.x,COSMOS.galaxy.y);
    const galaxySize=COSMOS.galaxy.size*camera.scale;
    this.galaxy.draw(ctx,galaxy.x,galaxy.y,galaxySize,anchorX,anchorY,w,h,reveal);
    const solar=point(COSMOS.system.x,COSMOS.system.y);
    const systemRadius=COSMOS.system.radius*camera.scale;
    if(systemRadius>.15) {
      // The Sun is already present on the spiral arm before we enter it.
      ctx.globalAlpha=1;this.softGlow(solar.x,solar.y,Math.max(3,systemRadius*.30),'#e9993f');
      if(systemRadius>3)this.drawSolarSystem(solar.x,solar.y,systemRadius,systemRadius/Math.min(w*(mobile?.58:.32),h*.43),1,p,mobile,time);
      else {ctx.fillStyle='#ffe2ab';ctx.beginPath();ctx.arc(solar.x,solar.y,Math.max(.5,systemRadius*.07),0,TAU);ctx.fill();}
    }
    const earthWorld=earthAt(time);
    const earth=point(earthWorld.x,earthWorld.y);
    const radius=COSMOS.earth.radius*camera.scale;
    if(radius>.3&&this.ready(this.assets.earth)) {
      ctx.globalAlpha=1;
      const atmosphere=ctx.createRadialGradient(earth.x,earth.y,radius*.95,earth.x,earth.y,radius*1.10);
      atmosphere.addColorStop(0,'#7bbfff55');atmosphere.addColorStop(.40,'#499bff18');atmosphere.addColorStop(1,'#52aaff00');
      ctx.fillStyle=atmosphere;ctx.fillRect(earth.x-radius*1.12,earth.y-radius*1.12,radius*2.24,radius*2.24);
      if(!this.globe)this.globe=new EarthGlobe(this.assets.earth);
      ctx.drawImage(this.globe.render(time),earth.x-radius,earth.y-radius,radius*2,radius*2);
    }
    // The accretion disc stays around its child universe until its rim leaves
    // the viewport. No full-screen scene swap or black-hole opacity dissolve.
    const hole=point(0,0),holeSize=camera.scale;
    if(p<.30&&this.ready(this.assets.hole)) {
      const height=holeSize*this.assets.hole.naturalHeight/this.assets.hole.naturalWidth;
      ctx.globalAlpha=1;ctx.globalCompositeOperation='screen';
      ctx.drawImage(this.motion&&this.motion.readyState>=2?this.motion:this.sprites.get(this.assets.hole,'hole'),hole.x-holeSize/2,hole.y-height/2,holeSize,height);
      ctx.globalCompositeOperation='source-over';
    }
    ctx.globalAlpha = 1;
  }

  private ready(image: HTMLImageElement) { return image.complete && image.naturalWidth > 0; }

  private drawStars(p: number, opacity: number, centreX: number, centreY: number) {
    const ctx = this.ctx;
    const travel = p * 3.8;
    ctx.fillStyle = '#dce9ff';
    for (const star of this.stars) {
      const depth = .18 + ((star.depth - travel * .12) % .82 + .82) % .82;
      const x = centreX + star.x * this.width * .5 / depth;
      const y = centreY + star.y * this.height * .5 / depth;
      if (x < 0 || x > this.width || y < 0 || y > this.height) continue;
      const size = star.size / depth * .65;
      const fade=smooth(.18,.28,depth)*(1-smooth(.9,1,depth));
      ctx.globalAlpha = opacity * star.alpha * .7 * fade;
      ctx.beginPath();ctx.arc(x,y,size*.5,0,TAU);ctx.fill();
    }
  }

  private drawSolarSystem(x: number, y: number, radius: number, zoom: number, alpha: number, progress: number, mobile: boolean, time:number) {
    const ctx = this.ctx;
    const planets=PLANETS;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    for (const planet of planets) {
      ctx.strokeStyle = '#bcb7db35'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.ellipse(0, 0, planet.orbit * radius, planet.orbit * radius * .48, 0, 0, TAU); ctx.stroke();
    }
    this.softGlow(0, 0, Math.min(radius * .58,400), '#e9993f');
    const sunRadius = Math.max(1,radius*.065);
    const sun = ctx.createRadialGradient(-sunRadius * .25, -sunRadius * .25, 0, 0, 0, sunRadius);
    sun.addColorStop(0, '#fff9da'); sun.addColorStop(.55, '#ffdc8c'); sun.addColorStop(1, '#e67d22');
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(0, 0, sunRadius, 0, TAU); ctx.fill();
    for (const planet of planets) {
      const {x:px,y:py}=orbitalPosition(planet,time,radius);
      if(Math.abs(px)>this.width*3||Math.abs(py)>this.height*3)continue;
      const r = planet.size * (mobile ? .8 : 1) * zoom;
      if (planet.name !== 'Earth') {
        if (planet.name === 'Saturn') {
          ctx.strokeStyle = '#e3d0a4a0'; ctx.lineWidth = r * .35;
          ctx.beginPath(); ctx.ellipse(px,py,r*2,r*.55,-.25,0,TAU);ctx.stroke();
        }
        let globe=this.planets.get(planet.name);
        if(!globe){globe=makePlanet(planet.name,planet.spin);this.planets.set(planet.name,globe);}
        ctx.drawImage(globe.render(time),px-r,py-r,r*2,r*2);
        if(planet.name==='Saturn') {
          ctx.strokeStyle='#e3d0a488';ctx.lineWidth=r*.25;
          ctx.beginPath();ctx.ellipse(px,py,r*2,r*.55,-.25,0,Math.PI);ctx.stroke();
        }
      }
      if (radius > 60 && progress > .64 && progress < .85 && (!mobile || ['Earth','Saturn','Neptune'].includes(planet.name))) {
        ctx.globalAlpha = alpha * (1 - smooth(.78, .85, progress));
        ctx.fillStyle = planet.name === 'Earth' ? '#a8daff' : '#c7bfcc';
        ctx.font = `${mobile ? 10 : 12}px Inter, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(planet.name, px, py + r + 18);
        ctx.globalAlpha = alpha;
      }
    }
    ctx.restore();
  }

  private softGlow(x: number, y: number, radius: number, color: string) {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color + '80'); gradient.addColorStop(.15, color + '38'); gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

}
