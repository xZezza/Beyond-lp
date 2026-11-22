import {seededRandom,clamp} from '../data/journey-math.mjs';
import {EarthGlobe} from './earth-globe';

/** Schematic textures for the small planets. Earth keeps its NASA mosaic. */
export function makePlanet(name:string,period:number) {
  const map=document.createElement('canvas');map.width=512;map.height=256;
  const ctx=map.getContext('2d')!,image=ctx.createImageData(512,256),data=image.data;
  const random=seededRandom(name.charCodeAt(0)*3727);
  for(let y=0;y<256;y++)for(let x=0;x<512;x++) {
    const lon=x/512*Math.PI*2,lat=y/256*Math.PI-Math.PI/2;
    const swirl=Math.sin(lon*5+Math.sin(lat*12)*2)*.5+Math.sin(lon*11-lat*9)*.25;
    const band=Math.sin(lat*32+swirl*.7);
    const mottled=(Math.sin(lon*9+lat*5)*Math.sin(lat*17-lon*4)+random()*.3);
    let r=0,g=0,b=0;
    switch(name) {
      case 'Mercury': {const v=135+mottled*34;r=v;g=v*.94;b=v*.87;break;}
      case 'Venus':r=222+swirl*20;g=181+swirl*25;b=115+swirl*25;break;
      case 'Mars':r=183+mottled*42;g=82+mottled*22;b=49+mottled*18;if(Math.abs(lat)>1.38){r=220;g=212;b=194;}break;
      case 'Jupiter': {
        r=207+band*24;g=171+band*33;b=136+band*35;
        const dx=Math.atan2(Math.sin(lon-2),Math.cos(lon-2)),dy=lat-.35;
        if(dx*dx/.055+dy*dy/.01<1){r=173;g=91;b=66;}break;
      }
      case 'Saturn':r=213+band*9;g=192+band*14;b=148+band*18;break;
      case 'Uranus':r=129+band*5;g=197+band*5;b=203+band*5;break;
      case 'Neptune':r=49+swirl*10;g=101+swirl*18;b=194+swirl*20;break;
    }
    const i=(y*512+x)*4;data[i]=clamp(r,0,255);data[i+1]=clamp(g,0,255);data[i+2]=clamp(b,0,255);data[i+3]=255;
  }
  ctx.putImageData(image,0,0);
  return new EarthGlobe(map,128,period,name==='Uranus'?1.7:.15);
}
