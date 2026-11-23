import test from 'node:test';
import assert from 'node:assert/strict';
import {dragEarth,holeShouldPlay} from '../src/data/earth-interaction.mjs';

test('dragging turns the surface horizontally and vertically without altering the original pose',()=>{
 const pose={yaw:.2,pitch:0};
 const moved=dragEarth(pose,100,50,400);
 assert.deepEqual(moved,{yaw:.07500000000000001,pitch:.2});
 assert.deepEqual(pose,{yaw:.2,pitch:0});
 assert.deepEqual(dragEarth(moved,-100,-50,400),pose);
});
test('vertical dragging stops at the poles and a tiny target remains finite',()=>{
 assert.equal(dragEarth({yaw:0,pitch:0},0,10000,300).pitch,1.35);
 assert.equal(dragEarth({yaw:0,pitch:0},0,-10000,300).pitch,-1.35);
 assert.ok(Number.isFinite(dragEarth({yaw:0,pitch:0},10,10,0).yaw));
});
test('the black-hole movie remains parked after the completed return, including visibility changes',()=>{
 for(const visible of [true,false,true])assert.equal(holeShouldPlay({enhanced:true,visible,progress:0,returned:true}),false);
 assert.equal(holeShouldPlay({enhanced:true,visible:true,progress:0,returned:false}),true);
});
test('offscreen, still scenes and later chapters pause the black-hole movie',()=>{
 const opening={enhanced:true,visible:true,progress:0,returned:false};
 assert.equal(holeShouldPlay({...opening,visible:false}),false);
 assert.equal(holeShouldPlay({...opening,enhanced:false}),false);
 assert.equal(holeShouldPlay({...opening,progress:.5}),false);
});
