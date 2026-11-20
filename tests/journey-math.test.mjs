import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTER_STOPS, chapterAt, scrollForChapter, scrollProgress, seededRandom} from '../src/data/journey-math.mjs';

test('each direct chapter target round-trips through the real scroll geometry',()=>{
  for (let index=0;index<CHAPTER_STOPS.length;index++) {
    const top=98, travel=4200;
    const scroll=scrollForChapter(top,travel,index);
    assert.equal(chapterAt(scrollProgress(top-scroll,travel)),index);
  }
});
test('scroll progress clamps before and after the sticky journey, and handles zero travel',()=>{
  assert.equal(scrollProgress(200,4000),0);
  assert.equal(scrollProgress(-9000,4000),1);
  assert.equal(scrollProgress(-1000,0),0);
  assert.equal(scrollProgress(-2000,4000),.5);
});
test('the same chapter is selected while scrolling forward or back to a position',()=>{
  const forward=[0,.12,.28,.49,.73,.9,1].map(chapterAt);
  const backward=[1,.9,.73,.49,.28,.12,0].map(chapterAt).reverse();
  assert.deepEqual(forward,backward);
});
test('the star field is stable across page loads and every generated value stays bounded',()=>{
  const a=seededRandom(8),b=seededRandom(8);
  for (let i=0;i<100;i++) {const value=a();assert.equal(value,b());assert.ok(value>=0&&value<1);}
});
