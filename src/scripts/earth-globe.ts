const TAU=Math.PI*2;
/** Orthographic globe: longitude advances around an inclined axis, while the
 * silhouette and sun direction remain fixed. Uses credited NASA map pixels. */
export class EarthGlobe {
  readonly canvas=document.createElement('canvas');
  private ctx:CanvasRenderingContext2D;
  private frame:ImageData;
  private u:Float32Array;
  private v:Uint32Array;
  private light:Float32Array;
  private map:Uint8ClampedArray;
  private mapWidth=2048;
  private previous=-Infinity;
  private period:number;
  constructor(image:CanvasImageSource,resolution=640,period=90000,tilt=.18) {
    const n=resolution;this.period=period;this.canvas.width=this.canvas.height=n;
    this.ctx=this.canvas.getContext('2d')!;this.frame=this.ctx.createImageData(n,n);
    this.u=new Float32Array(n*n);this.v=new Uint32Array(n*n);this.light=new Float32Array(n*n);
    const texture=document.createElement('canvas');texture.width=this.mapWidth;texture.height=this.mapWidth/2;
    const ctx=texture.getContext('2d',{willReadFrequently:true})!;
    ctx.drawImage(image,0,0,texture.width,texture.height);this.map=ctx.getImageData(0,0,texture.width,texture.height).data;
    const c=Math.cos(tilt),s=Math.sin(tilt);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++) {
      const i=y*n+x,nx=(x+.5-n/2)/(n/2-2),ny=-(y+.5-n/2)/(n/2-2),r2=nx*nx+ny*ny;
      if(r2>=1)continue;
      const z=Math.sqrt(1-r2),rx=nx*c+ny*s,ry=-nx*s+ny*c;
      this.u[i]=Math.atan2(rx,z)/TAU+.5;
      this.v[i]=Math.min(texture.height-1,Math.max(0,Math.floor((.5-Math.asin(ry)/Math.PI)*texture.height)))*texture.width;
      this.light[i]=.16+.84*Math.pow(Math.max(0,-nx*.36+ny*.24+z*.90),.65);
      this.frame.data[i*4+3]=Math.min(255,(1-r2)*n*100);
    }
  }
  render(time:number) {
    if(time-this.previous<33)return this.canvas;this.previous=time;
    const shift=((time/this.period)%1+1)%1;
    const out=this.frame.data,src=this.map,w=this.mapWidth;
    for(let i=0;i<this.u.length;i++) {
      if(!out[i*4+3])continue;
      const x=Math.floor(((this.u[i]+shift)%1)*w),j=(this.v[i]+x)*4,k=i*4,l=this.light[i];
      out[k]=src[j]*l;out[k+1]=src[j+1]*l;out[k+2]=Math.min(255,src[j+2]*l+4);
    }
    this.ctx.putImageData(this.frame,0,0);return this.canvas;
  }
}
