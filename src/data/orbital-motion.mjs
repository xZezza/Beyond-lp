// Compressed cinematic timing, not a physical ephemeris. Every planet moves
// independently; Earth shares exactly the same orbit with the zoom camera.
export const PLANETS=Object.freeze([
 {name:'Mercury',orbit:.14,angle:2.5,size:3,color:'#bcb6ae',period:18000,spin:14000},
 {name:'Venus',orbit:.23,angle:.6,size:5,color:'#dfc59d',period:32000,spin:-34000},
 {name:'Earth',orbit:.34,angle:-1.05,size:8,color:'#75b9e0',period:46000,spin:90000},
 {name:'Mars',orbit:.44,angle:2.9,size:4,color:'#dc8869',period:62000,spin:24000},
 {name:'Jupiter',orbit:.60,angle:-2,size:16,color:'#d8b99c',period:84000,spin:16000},
 {name:'Saturn',orbit:.76,angle:.45,size:12,color:'#d2bc94',period:108000,spin:22000},
 {name:'Uranus',orbit:.90,angle:2.5,size:8,color:'#8dc6cb',period:132000,spin:-28000},
 {name:'Neptune',orbit:1.06,angle:-.7,size:8,color:'#648de8',period:156000,spin:24000},
]);
export function orbitalAngle(planet,time) {return planet.angle+(time%planet.period)/planet.period*Math.PI*2;}
export function orbitalPosition(planet,time,radius) {
 const angle=orbitalAngle(planet,time);
 return {x:Math.cos(angle)*planet.orbit*radius,y:Math.sin(angle)*planet.orbit*radius*.48};
}
