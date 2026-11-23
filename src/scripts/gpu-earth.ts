import {EarthGlobe} from './earth-globe';

export interface SphereSurface { render(time:number,yaw?:number,pitch?:number):HTMLCanvasElement; readonly backend?:string; }

/** One textured sphere draw on the GPU, with the same orthographic lighting
 * and surface coordinates as the previous CPU globe. */
class GpuEarth implements SphereSurface {
  readonly canvas=document.createElement('canvas');
  readonly backend='webgl';
  private gl:WebGLRenderingContext;
  private phase:WebGLUniformLocation;
  private tilt:WebGLUniformLocation;
  private lastTime=-Infinity;
  private lastYaw=NaN;
  private lastPitch=NaN;
  constructor(image:HTMLImageElement) {
    this.canvas.width=this.canvas.height=1024;
    const gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:true});
    if(!gl)throw new Error('GPU sphere unavailable');this.gl=gl;
    const shader=(type:number,source:string)=>{
      const item=gl.createShader(type)!;gl.shaderSource(item,source);gl.compileShader(item);
      if(!gl.getShaderParameter(item,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(item);gl.deleteShader(item);throw new Error(error||'Sphere shader unavailable');}return item;
    };
    const vertex=shader(gl.VERTEX_SHADER,`attribute vec2 position;varying vec2 point;void main(){point=position*1.004;gl_Position=vec4(position,0.,1.);}`);
    const fragment=shader(gl.FRAGMENT_SHADER,`precision highp float;
      varying vec2 point;uniform sampler2D surface;uniform float phase;uniform float pitch;
      void main(){
        float rr=dot(point,point);if(rr>=1.){gl_FragColor=vec4(0.);return;}
        float z=sqrt(1.-rr);float c=cos(.18),s=sin(.18);
        float x=point.x*c+point.y*s,y=-point.x*s+point.y*c;
        float py=y*cos(pitch)+z*sin(pitch),pz=-y*sin(pitch)+z*cos(pitch);
        vec2 uv=vec2(fract(atan(x,pz)/6.28318530718+.5+phase),.5-asin(clamp(py,-1.,1.))/3.14159265359);
        vec3 color=texture2D(surface,uv).rgb;
        float light=.16+.84*pow(max(0.,-point.x*.36+point.y*.24+z*.90),.65);
        float edge=1.-smoothstep(.996,1.,sqrt(rr));
        gl_FragColor=vec4(min(vec3(1.),color*light+vec3(0.,0.,.0156863)),edge);
      }`);
    const program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Sphere program unavailable');
    gl.useProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
    const buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.uniform1i(gl.getUniformLocation(program,'surface'),0);
    this.phase=gl.getUniformLocation(program,'phase')!;this.tilt=gl.getUniformLocation(program,'pitch')!;
    gl.viewport(0,0,1024,1024);
  }
  render(time:number,yaw=0,pitch=0) {
    if(time===this.lastTime&&yaw===this.lastYaw&&pitch===this.lastPitch)return this.canvas;
    this.lastTime=time;this.lastYaw=yaw;this.lastPitch=pitch;
    const gl=this.gl;gl.uniform1f(this.phase,((time/90000+yaw)%1+1)%1);gl.uniform1f(this.tilt,pitch);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    return this.canvas;
  }
}

export function makeEarthSurface(image:HTMLImageElement):SphereSurface {
  try{return new GpuEarth(image);}catch{return new EarthGlobe(image,384);}
}
