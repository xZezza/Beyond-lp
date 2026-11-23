import test from 'node:test';
import assert from 'node:assert/strict';
import {entryFieldSize,entryDiscOpacity} from '../src/data/entry-composition.mjs';
import {cameraAt,COSMOS} from '../src/data/nested-camera.mjs';

test('the universe fills all four corners while entering, rather than a small central circle',()=>{
 for(const [w,h,x,y] of [[1280,800,896,392],[390,844,199,540]]){
  let previous=0;
  for(let p=0;p<=.35;p+=.001){
   const camera=cameraAt(p,w,h);
   const fx=x-camera.x*camera.scale,fy=y-camera.y*camera.scale;
   const size=entryFieldSize(COSMOS.field.size*camera.scale,w,h,fx,fy,x,y);
   assert.ok(size>=previous);previous=size;
   // 82% is the existing sprite's fully opaque central radius.
   for(const [cx,cy] of [[0,0],[w,0],[0,h],[w,h]])assert.ok(size*.5*.82>Math.hypot(cx-fx,cy-fy));
  }
  const later=cameraAt(.49,w,h),original=COSMOS.field.size*later.scale;
  assert.equal(entryFieldSize(original,w,h,x-later.x*later.scale,y-later.y*later.scale,x,y),original);
 }
});

test('disc light crosses the old .30 cutoff continuously and clears before later scenes',()=>{
 assert.equal(entryDiscOpacity(0),1);assert.equal(entryDiscOpacity(.235),1);
 assert.equal(entryDiscOpacity(.35),0);assert.equal(entryDiscOpacity(1),0);
 assert.ok(entryDiscOpacity(.3)>0);
 assert.ok(Math.abs(entryDiscOpacity(.3-.000001)-entryDiscOpacity(.3+.000001))<.0001);
 let previous=1;
 for(let p=0;p<=1;p+=.001){const alpha=entryDiscOpacity(p);assert.ok(alpha>=0&&alpha<=previous);previous=alpha;}
});
