import test from 'node:test';
import assert from 'node:assert/strict';
import {PLANETS,orbitalPosition} from '../src/data/orbital-motion.mjs';
import {cameraAt,earthAt,COSMOS} from '../src/data/nested-camera.mjs';

test('all eight planets move continuously while remaining on their own ellipses',()=>{
 assert.equal(PLANETS.length,8);
 for(const planet of PLANETS){
  const first=orbitalPosition(planet,0,1000),next=orbitalPosition(planet,2000,1000);
  assert.ok(Math.hypot(first.x-next.x,first.y-next.y)>1);
  for(const time of [0,9000,planet.period-1,planet.period+1]){
   const pos=orbitalPosition(planet,time,1000);
   assert.ok(Math.abs(Math.hypot(pos.x,pos.y/.48)-planet.orbit*1000)<1e-9);
  }
  const before=orbitalPosition(planet,planet.period-.001,1000),after=orbitalPosition(planet,planet.period+.001,1000);
  assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.01);
  assert.ok(Math.abs(planet.spin)>0);
 }
});

test('zoom camera follows the moving Earth at every phase of its orbit',()=>{
 for(const time of [0,5000,17000,39000,46000,61000]){
  const earth=earthAt(time),camera=cameraAt(1,1280,800,time);
  assert.equal(camera.x,earth.x);assert.equal(camera.y,earth.y);
  const orbit=orbitalPosition(PLANETS[2],time,COSMOS.system.radius);
  assert.equal(earth.x,COSMOS.system.x+orbit.x);
  assert.equal(earth.y,COSMOS.system.y+orbit.y);
 }
});
