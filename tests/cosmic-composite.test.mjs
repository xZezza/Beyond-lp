import test from 'node:test';
import assert from 'node:assert/strict';
import {radialCoverage,darkMatteCoverage,discBounds} from '../src/data/cosmic-composite.mjs';

test('a galaxy has no opaque corners while its central detail stays visible',()=>{
  for(const [x,y] of [[0,0],[1,0],[0,1],[1,1],[0,.5],[1,.5]]) assert.equal(radialCoverage(x,y),0);
  assert.equal(radialCoverage(.5,.5),1);
  assert.ok(radialCoverage(.9,.5)>0&&radialCoverage(.9,.5)<1);
});
test('photographic black matte is transparent, and faint light blends gradually',()=>{
  assert.equal(darkMatteCoverage(0,0,0),0);
  assert.equal(darkMatteCoverage(255,115,25),1);
  assert.ok(darkMatteCoverage(12,14,18)>0&&darkMatteCoverage(12,14,18)<1);
});
test('the Earth crop follows the sphere instead of retaining black photo padding',()=>{
  const width=32,height=32,pixels=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;pixels[i+3]=255;
    if(Math.hypot(x-18,y-13)<=8) {pixels[i]=100;pixels[i+1]=160;pixels[i+2]=210;}
  }
  const sphere=discBounds(pixels,width,height);
  assert.equal(sphere.x,18);assert.equal(sphere.y,13);assert.equal(sphere.radius,8.5);
});
test('an unlit or missing photo remains safe to render with a finite fallback crop',()=>{
  const sphere=discBounds(new Uint8ClampedArray(16*16*4),16,16);
  assert.equal(sphere.x,8);assert.equal(sphere.y,8);assert.ok(sphere.radius>0&&sphere.radius<8);
});
