import { clamp, mix, range, smooth, seededRandom } from '../data/journey-math.mjs';

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

  constructor(private canvas: HTMLCanvasElement, private assets: Assets) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas unavailable');
    this.ctx = context;
    const random = seededRandom(2407);
    this.stars = Array.from({ length: 850 }, () => ({ x: random() * 2 - 1, y: random() * 2 - 1, depth: .25 + random() * .75, size: .3 + random() * 1.4, alpha: .15 + random() * .7 }));
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

  draw(progress: number) {
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

    const starAlpha = smooth(.1, .23, p);
    if (starAlpha > 0) this.drawStars(p, starAlpha, anchorX, anchorY);

    // The photographed black-hole visualization grows until its dark centre
    // surrounds the camera. The field of galaxies emerges through that centre.
    const holeAlpha = 1 - smooth(.13, .25, p);
    if (holeAlpha > 0 && this.ready(this.assets.hole)) {
      const zoom = Math.exp(range(.015, .245, p) * 1.65);
      const width = (mobile ? w * 1.55 : w * 1.25) * zoom;
      const height = width * 440 / 924;
      ctx.globalAlpha = holeAlpha;
      ctx.drawImage(this.assets.hole, 50, 350, 924, 440, anchorX - width / 2, anchorY - height / 2, width, height);
    }

    const fieldAlpha = smooth(.12, .255, p) * (1 - smooth(.32, .49, p));
    if (fieldAlpha > 0 && this.ready(this.assets.field)) {
      const zoom = mix(1, 3.7, smooth(.255, .50, p));
      this.cover(this.assets.field, zoom, fieldAlpha * .93, .58, .52);
      // Clear the fictional target from the observational field before the
      // illustrated Milky Way takes over; this is a montage, not a sky map.
      ctx.globalAlpha = fieldAlpha * smooth(.3, .46, p);
      const mask = ctx.createRadialGradient(anchorX, anchorY, 0, anchorX, anchorY, w * .48);
      mask.addColorStop(0, '#000'); mask.addColorStop(.35, '#000a'); mask.addColorStop(1, '#0000');
      ctx.fillStyle = mask; ctx.fillRect(0, 0, w, h);
    }

    const galaxyAlpha = smooth(.30, .42, p) * (1 - smooth(.60, .72, p));
    if (galaxyAlpha > 0 && this.ready(this.assets.galaxy)) {
      const approach = smooth(.49, .68, p);
      const size = (mobile ? w * 1.5 : Math.min(w * .89, h * 1.65)) * Math.exp(mix(-1.05, .05, smooth(.31, .48, p)) + approach * 2.45);
      const gx = anchorX - size * .235 * approach;
      const gy = anchorY - size * .052 * approach;
      ctx.globalAlpha = galaxyAlpha;
      ctx.drawImage(this.assets.galaxy, gx - size / 2, gy - size / 2, size, size);
      const sunX = gx + size * .235;
      const sunY = gy + size * .052;
      const markerAlpha = smooth(.46, .54, p) * (1 - smooth(.63, .7, p));
      if (markerAlpha > 0) {
        ctx.globalAlpha = markerAlpha;
        this.softGlow(sunX, sunY, 35, '#f3b76f');
        ctx.strokeStyle = '#ffd29a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sunX, sunY, 6, 0, TAU); ctx.stroke();
        ctx.font = '12px Inter, sans-serif'; ctx.fillStyle = '#f5d3a9';
        ctx.fillText('Our Sun', sunX + 14, sunY - 11);
      }
    }

    const systemAlpha = smooth(.60, .70, p) * (1 - smooth(.90, .98, p));
    const earthTravel = smooth(.80, .985, p);
    const systemRadius = Math.min(w * (mobile ? .57 : .32), h * .47);
    const systemZoom = mix(1, 2.25, earthTravel);
    const earthAngle = -1.05;
    const earthOrbit = .34;
    const earthLocalX = Math.cos(earthAngle) * earthOrbit * systemRadius;
    const earthLocalY = Math.sin(earthAngle) * earthOrbit * systemRadius * .48;
    const solarX = anchorX - earthLocalX * systemZoom * earthTravel;
    const solarY = anchorY - earthLocalY * systemZoom * earthTravel;
    if (systemAlpha > 0) this.drawSolarSystem(solarX, solarY, systemRadius, systemZoom, systemAlpha, p, mobile);

    const earthAlpha = smooth(.69, .78, p);
    if (earthAlpha > 0 && this.ready(this.assets.earth)) {
      const earthX = mix(solarX + earthLocalX * systemZoom, anchorX, earthTravel);
      const earthY = mix(solarY + earthLocalY * systemZoom, anchorY, earthTravel);
      const radius = mix(mobile ? 6 : 8, Math.min(mobile ? w * .38 : w * .235, h * .38), earthTravel);
      ctx.globalAlpha = earthAlpha;
      if (earthTravel > .1) {
        const atmosphere = ctx.createRadialGradient(earthX, earthY, radius * .83, earthX, earthY, radius * 1.12);
        atmosphere.addColorStop(0, '#508ad000'); atmosphere.addColorStop(.72, '#6db6ff23'); atmosphere.addColorStop(1, '#52aaff00');
        ctx.fillStyle = atmosphere; ctx.fillRect(earthX - radius * 1.2, earthY - radius * 1.2, radius * 2.4, radius * 2.4);
      }
      // Use NASA's Apollo 17 photograph without synthesising surface detail.
      ctx.drawImage(this.assets.earth, earthX - radius * 1.12, earthY - radius * 1.12, radius * 2.24, radius * 2.24);
    }
    ctx.globalAlpha = 1;
  }

  private ready(image: HTMLImageElement) { return image.complete && image.naturalWidth > 0; }

  private cover(image: HTMLImageElement, zoom: number, alpha: number, focusX: number, focusY: number) {
    const scale = Math.max(this.width / image.naturalWidth, this.height / image.naturalHeight) * zoom;
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(image, this.width * focusX - w * focusX, this.height * focusY - h * focusY, w, h);
  }

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
      ctx.globalAlpha = opacity * star.alpha * .7;
      ctx.fillRect(x, y, size, size);
    }
  }

  private drawSolarSystem(x: number, y: number, radius: number, zoom: number, alpha: number, progress: number, mobile: boolean) {
    const ctx = this.ctx;
    const planets = [
      {name:'Mercury',orbit:.14,angle:2.5,size:3,color:'#bcb6ae'},
      {name:'Venus',orbit:.23,angle:.6,size:5,color:'#dfc59d'},
      {name:'Earth',orbit:.34,angle:-1.05,size:mobile?6:8,color:'#75b9e0'},
      {name:'Mars',orbit:.44,angle:2.9,size:4,color:'#dc8869'},
      {name:'Jupiter',orbit:.60,angle:-2.0,size:16,color:'#d8b99c'},
      {name:'Saturn',orbit:.76,angle:.45,size:12,color:'#d2bc94'},
      {name:'Uranus',orbit:.90,angle:2.5,size:8,color:'#8dc6cb'},
      {name:'Neptune',orbit:1.06,angle:-.7,size:8,color:'#648de8'},
    ];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y); ctx.scale(zoom, zoom);
    for (const planet of planets) {
      ctx.strokeStyle = '#bcb7db35'; ctx.lineWidth = .7 / zoom;
      ctx.beginPath(); ctx.ellipse(0, 0, planet.orbit * radius, planet.orbit * radius * .48, 0, 0, TAU); ctx.stroke();
    }
    this.softGlow(0, 0, radius * .58, '#e9993f');
    const sunRadius = mobile ? 14 : 23;
    const sun = ctx.createRadialGradient(-sunRadius * .25, -sunRadius * .25, 0, 0, 0, sunRadius);
    sun.addColorStop(0, '#fff9da'); sun.addColorStop(.55, '#ffdc8c'); sun.addColorStop(1, '#e67d22');
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(0, 0, sunRadius, 0, TAU); ctx.fill();
    for (const planet of planets) {
      const px = Math.cos(planet.angle) * planet.orbit * radius;
      const py = Math.sin(planet.angle) * planet.orbit * radius * .48;
      const r = planet.size * (mobile ? .8 : 1);
      if (planet.name !== 'Earth') {
        const planetFill = ctx.createRadialGradient(px - r * .36, py - r * .4, 0, px, py, r);
        planetFill.addColorStop(0, planet.color); planetFill.addColorStop(.55, planet.color); planetFill.addColorStop(1, '#17131e');
        if (planet.name === 'Saturn') {
          ctx.strokeStyle = '#e3d0a4a0'; ctx.lineWidth = r * .35;
          ctx.beginPath(); ctx.ellipse(px, py, r * 2.0, r * .55, -.25, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle = planetFill; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
        if (planet.name === 'Jupiter') {
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.clip();
          ctx.strokeStyle = '#805c4c88'; ctx.lineWidth = 2;
          for (let band = -2; band <= 2; band++) {ctx.beginPath();ctx.moveTo(px-r,py+band*4);ctx.lineTo(px+r,py+band*4+2);ctx.stroke();}
          ctx.restore();
        }
      }
      if (progress < .85 && (!mobile || ['Earth','Saturn','Neptune'].includes(planet.name))) {
        ctx.globalAlpha = alpha * (1 - smooth(.78, .85, progress));
        ctx.fillStyle = planet.name === 'Earth' ? '#a8daff' : '#c7bfcc';
        ctx.font = `${mobile ? 10 : 12}px Inter, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(planet.name, px, py + r + 18 / zoom);
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
