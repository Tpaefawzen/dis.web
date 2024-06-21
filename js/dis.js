/*
 * js/dis.js
 *
 * Copyright (C) 2022, 2024 Tpaefawzen
 *
 * This file is part of dis.web.
 * 
 * dis.web is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * dis.web is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with dis.web. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file js/dis.js
 * @description The Dis language implementation.
 */

/**
 * @factory DisMathFactory
 * @optional @param base {int} @default 3
 * @optional @param digits {int} @default 10
 * @return @module DisMath
 * @description Return a collection of functions that works for non-negative integers that can be represented in your base and digits.
 */
function DisMathFactory(base=3, digits=10) {
  /**
   * @module DisMath
   * @description A collection of math functions for Dis language. OBTW every function in this module expects integers that satisfies `DisMath.isTenTrits(x)`.
   */
  const DisMath = {
    /**
     * @const DisMath.BASE, DisMath.DIGITS, DisMath.MIN_VALUE, DisMath.MAX_VALUE, DisMath.END_VALUE {int}
     * @description Dis constant values.
     */
    get BASE(){ return base; },
    get DIGITS(){ return digits; },
    get MIN_VALUE() { return 0; },
    get MAX_VALUE() { return DisMath.BASE ** DisMath.DIGITS - 1; },
    get END_VALUE() { return DisMath.BASE ** DisMath.DIGITS; },

    /**
     * @function DisMath.isTenTrits @param x {int}
     * @description In ordinary Dis machine, it calculates if 0<=x and x<=59048.
     * @return {bool} If true, it can be represented in your machine.
     */
    get isTenTrits() { return (x) =>
      Number.isInteger(x) && DisMath.MIN_VALUE <= x && x <= DisMath.MAX_VALUE;
    },
    
    /**
     * @function DisMath.increment
     * @param x {int}
     * @optional @param y {int} @default 1
     * @return {int}
     * @description Increment your address.
     */
    get increment() {
      const { END_VALUE } = DisMath;
      return (x, y=1) => (x+y) % END_VALUE;
    },

    /**
     * @function DisMath.rotateRight
     * @param x {int}
     * @optional @param y {int} @default 1
     * @description Rotate your value for @param y times.
     */
    get rotateRight(){
      const { BASE, END_VALUE } = DisMath;
      return (x, y=1) => Math.floor(x/BASE) + x%BASE * (END_VALUE/BASE);
    },

    /**
     * @function DisMath.subtract
     * @param x, y {int}
     * @description Subtraction without borrow in base of @const DisMath.BASE.
     */
    get subtract(){
      const { BASE } = DisMath;

      function _op_by_digit(x, y) {
        return ( x - y + BASE ) % BASE;
      }

      return function _subtract(x, y) {
        if ( x < 1 && y < 1 ) return 0;
        return _op_by_digit(x%BASE, y%BASE) + BASE*_subtract(Math.floor(x/BASE), Math.floor(y/BASE));
      }
    },
  }; // const DisMath
  return DisMath;
} // function DisMathFactory;


/**
 * @local @const DisMath
 * @description For local @class Dis.
 */
const DisMath = DisMathFactory();

/**
 * @class Dis
 * @description Esoteric programming language Dis.
 */
class Dis{
  memory=Array(59049).fill(0);
  inputBuffer=[];
  outputBuffer=[];
  #halt=false;
  get halt(){return this.#halt;}

  #register_a=0;#register_c=0;#register_d=0;
  get register_a(){return this.#register_a||0;}
  get register_c(){return this.#register_c||0;}
  get register_d(){return this.#register_d||0;}
  set register_a(x){
    if(!DisMath.isTenTrits(x)){
      throw new RangeError(`not ten-trit: ${x}`);
    }
    this.#register_a=x;
  }
  set register_c(x){
    if(!DisMath.isTenTrits(x)){
      throw new RangeError(`not ten-trit: ${x}`);
    }
    this.#register_c=x;
  }
  set register_d(x){
    if(!DisMath.isTenTrits(x)){
      throw new RangeError(`not ten-trit: ${x}`);
    }
    this.#register_d=x;
  }
  
  constructor(source){
    const sSrc=String(source);
    const {memory,inComment}=[...sSrc].reduce(({memory,inComment,length},c)=>{
      if(inComment){
        inComment=c!==")";
        return {memory,inComment,length};
      }
      
      const isSpace=/\s/.test(c);
      if(isSpace){
        return {memory,inComment,length};
      }
      
      const isCommentBegin=c==="(";
      if(isCommentBegin){
        return {memory,inComment:true,length};
      }
      
      const isCommand="!*>^_{|}".indexOf(c)>=0;
      if(!isCommand){
        throw new SyntaxError(`not Dis command: ${c}`);
      }
      const canPush=length<59049;
      if(!canPush){
        throw new SyntaxError("program too long");
      }
      
      memory.push(c.codePointAt(0));
      length++;
      return{memory,inComment,length};
    },{ // ({memory,incomment,length},c)=>{xxx}
      memory:[],
      inComment:false,
      length:0
    }); // const {memory,inComment}=
    
    if(inComment){
      throw new SyntaxError("comment not closed");
    }

    this.memory=memory.concat(this.memory).splice(0,59049);
  }
  
  /**
   * @return {boolean} Can this machine run yet?
   */
  step(){
    if(this.halt){
      return false;
    }
   
    const {memory,register_a,register_c,register_d}=this;
  
    switch(memory[register_c]){
    case 33:
      this.#halt=true;
      return false;
    case 42:
      this.register_d=this.memory[register_d];
      break;
    case 62:
      this.register_a=this.memory[register_d]=DisMath.rotateRight(memory[register_d]);
      break;
    case 94:
      this.register_c=this.memory[register_d];
      break;
    case 123:
      if(this.register_a===DisMath.MAX_VALUE){
        this.#halt=true;
        return false;
      }
      this.outputBuffer.push(register_a);
      break;
    case 124:
      this.register_a=this.memory[register_d]=DisMath.subtract(register_a,memory[register_d]);
      break;
    case 125:
      this.register_a=DisMath.MAX_VALUE;
      if(this.inputBuffer.length)
          this.register_a=this.inputBuffer.shift();
    } // switch(memory[register_c])
    
    this.register_c=DisMath.increment(this.register_c);
    this.register_d=DisMath.increment(this.register_d);
    return true;
  } // step()
} // class Dis

// vim: set shiftwidth=2 softtabstop=2 expandtab:

export {
  DisMathFactory,
  Dis,
};
