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

test('the film preview moves out and back continuously and keeps looping until user input',async()=>{
  const {introAt,INTRO_TIMING:t,INTRO_DURATION:d}=await import('../src/data/journey-math.mjs');
  assert.equal(introAt(0).progress,0);
  assert.ok(Math.abs(introAt(t.forward/2).progress-.5)<1e-12);
  assert.equal(introAt(t.forward).progress,1);
  assert.ok(Math.abs(introAt(t.forward+t.back/2).progress-.5)<1e-12);
  assert.equal(introAt(d).progress,0);
  assert.equal(introAt(d+d/4).done,false);
  assert.ok(introAt(d+d/4).progress>0);
});
test('the loop has no lead-in, hold phase or discontinuous cycle boundary',async()=>{
  const {introAt,INTRO_TIMING:t,INTRO_DURATION:d}=await import('../src/data/journey-math.mjs');
  assert.ok(introAt(100).progress>0);
  assert.ok(introAt(t.forward+100).progress<1);
  for(const time of [t.forward,d]) assert.ok(Math.abs(introAt(time-.01).progress-introAt(time+.01).progress)<.00001);
  for(let time=0;time<=d*3;time+=31){const p=introAt(time).progress;assert.ok(p>=0&&p<=1);}
});
