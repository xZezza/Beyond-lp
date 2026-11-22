import {seededRandom,clamp,smooth} from '../data/journey-math.mjs';

type Particle={x:number;y:number;z:number;size:number;alpha:number;tint:number;dust:boolean};
const TAU=Math.PI*2;
/** A real depth distribution, rather than a plane carrying a spiral photo.
 * Perspective expands nearby stars as the camera enters the disc. */
export class GalaxyCloud {
  private particles:Particle[]=[];
  private glows:HTMLCanvasElement[]=[];
  constructor() {
    const random=seededRandom(72026);
    const normal=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(TAU*random());
    const tilt=.92,roll=-.38,c=Math.cos(roll),s=Math.sin(roll);
    for(let i=0;i<12000;i++) {
      const core=i<2400;
      const outskirts=i>=10500;
      const radius=outskirts?.32+random()*.58:core?Math.abs(normal())*.075:Math.pow(random(),.7)*.48;
      const arm=Math.floor(random()*4)*TAU/4;
      const angle=outskirts||core?random()*TAU:arm+radius*10+normal()*(.15+.018/Math.max(radius,.03));
      const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
      const thickness=normal()*(outskirts?.14:core?.035:.014)*(1-radius);
      const inclinedY=y*Math.cos(tilt)-thickness*Math.sin(tilt);
      const z=y*Math.sin(tilt)+thickness*Math.cos(tilt);
      const dust=i%4===0;
      this.particles.push({x:x*c-inclinedY*s,y:x*s+inclinedY*c,z,size:dust?.012+random()*.026:.35+random()*.8,alpha:outskirts?.05+random()*.13:core?.16+random()*.48:.10+random()*.60,tint:core?0:random()<.06?2:1,dust});
    }
    this.particles.sort((a,b)=>a.z-b.z);
    this.glows=['255,211,150','143,181,255','255,133,165'].map(color=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
      const ctx=canvas.getContext('2d')!,gradient=ctx.createRadialGradient(32,32,0,32,32,32);
      gradient.addColorStop(0,`rgba(${color},.6)`);gradient.addColorStop(.2,`rgba(${color},.18)`);gradient.addColorStop(1,`rgba(${color},0)`);
      ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);return canvas;
    });
  }
  draw(ctx:CanvasRenderingContext2D,centreX:number,centreY:number,size:number,anchorX:number,anchorY:number,width:number,height:number,opacity:number) {
    if(size<1||opacity<.001)return;
    const focal=Math.max(width,height)*.85;
    // Distant spiral light shares the field rather than reading as a separate
    // bright medallion. Detail emerges from the same scattered outskirts.
    opacity*=.20+.80*smooth(120,850,size);
    ctx.globalCompositeOperation='screen';
    for(const particle of this.particles) {
      const distance=1-particle.z*size/focal;
      if(distance<.10)continue;
      const perspective=1/distance;
      const x=anchorX+(centreX-anchorX+particle.x*size)*perspective;
      const y=anchorY+(centreY-anchorY+particle.y*size)*perspective;
      const alpha=opacity*particle.alpha*smooth(.10,.35,distance);
      if(particle.dust) {
        const radius=Math.min(130,particle.size*size*perspective);
        if(x<-radius||x>width+radius||y<-radius||y>height+radius)continue;
        ctx.globalAlpha=alpha*.32*(1-smooth(2000,10000,size));
        ctx.drawImage(this.glows[particle.tint],x-radius,y-radius,radius*2,radius*2);
      } else {
        if(x<-5||x>width+5||y<-5||y>height+5)continue;
        const radius=clamp(particle.size*Math.sqrt(size/900)*perspective,.2,3.5);
        ctx.globalAlpha=alpha*Math.min(1,size/100);
        ctx.fillStyle=particle.tint===0?'#ffe3b7':particle.tint===2?'#ffc3db':'#cfdeff';
        ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();
      }
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
}
