import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraAt,COSMOS} from '../src/data/nested-camera.mjs';
import {CHAPTER_STOPS} from '../src/data/journey-math.mjs';

test('camera magnification increases continuously through all nested destinations',()=>{
 for(const [w,h] of [[1280,800],[390,844]]){
  let last=0;
  for(let i=0;i<=1000;i++){
   const camera=cameraAt(i/1000,w,h);
   assert.ok(Number.isFinite(camera.scale)&&camera.scale>last);
   last=camera.scale;
  }
  for(const stop of CHAPTER_STOPS.slice(1,-1)){
   const a=cameraAt(stop-1e-7,w,h),b=cameraAt(stop+1e-7,w,h);
   assert.ok(Math.abs(a.scale/b.scale-1)<.0001);
   assert.ok(Math.hypot(a.x-b.x,a.y-b.y)*b.scale<.001);
  }
 }
});

test('camera reaches the very same Earth that sits in the solar-system orbit',()=>{
 for(const [w,h] of [[1280,800],[390,844]]){
  const camera=cameraAt(1,w,h);
  assert.equal(camera.x,COSMOS.earth.x);assert.equal(camera.y,COSMOS.earth.y);
  const dx=(COSMOS.earth.x-COSMOS.system.x)/COSMOS.system.radius;
  const dy=(COSMOS.earth.y-COSMOS.system.y)/COSMOS.system.radius/.48;
  assert.ok(Math.abs(Math.hypot(dx,dy)-.34)<1e-12);
  assert.ok(COSMOS.earth.radius*camera.scale<w*.4);
 }
});

test('chapter centres are connected to child coordinates rather than scene replacements',()=>{
 const objects=[COSMOS.hole,COSMOS.field,COSMOS.galaxy,COSMOS.system,COSMOS.earth];
 CHAPTER_STOPS.forEach((p,i)=>{
  const camera=cameraAt(p,1280,800);
  assert.ok(Math.abs(camera.x-objects[i].x)<1e-12);
  assert.ok(Math.abs(camera.y-objects[i].y)<1e-12);
 });
});
