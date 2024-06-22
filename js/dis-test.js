import { DisMathFactory, Dis } from "./dis.js";
var assert;
if ( typeof require === "function" )
  assert = require("node:assert");
else
  assert = (x, msg) => {
    if ( ! x ) throw new Error(`Assertion failed: ${msg}`);
  }

const DisMath = DisMathFactory();

const { MIN_VALUE, MAX_VALUE, END_VALUE } = DisMath;
console.log("Test constant value");
assert( MIN_VALUE === 0 );
assert( MAX_VALUE === 59048 );
assert( END_VALUE === 59049 );

const { increment, rotateRight, subtract } = DisMath;

console.log("Test incrementing");
for ( let i = 0; i < 59048; i++ )
  assert( increment(i) === i+1 );
assert( increment(59048) === 0 );
assert( increment(59048, 59048) === 59047 );

console.log("Test rotateRight");
assert( rotateRight(1) === 19683 );
assert( rotateRight(19683) === 19683/3 );
assert( rotateRight(62) === Math.floor(62/3) + 19683*2 );
{
  let x = 1;
  for (let i=0; i<10; i++) x = rotateRight(x);
  assert( x === 1 );
}
assert( rotateRight(0) === 0 );

console.log("Testing Dis operation");
assert( subtract(0, 0) === 0 );
assert( subtract(0, 1) === 2 );
assert( subtract(0, 2) === 1 );
assert( subtract(1, 0) === 1 );
assert( subtract(1, 1) === 0 );
assert( subtract(1, 2) === 2 );
assert( subtract(2, 0) === 2 );
assert( subtract(2, 1) === 1 );
assert( subtract(2, 2) === 0 );
assert( subtract(3, 0) === 3 );
assert( subtract(3, 1) === 5 );
assert( subtract(3, 2) === 4 );
assert( subtract(0, 3) === 6 );
assert( subtract(1, 3) === 7 );
assert( subtract(2, 3) === 8 );

console.log("Test done");
