/*
 * js/dis.js
 *
 * Copyright (C) 2022 Tpaefawzen
 *
 * This file is part of dis.web.
 * 
 * dis.web is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * dis.web is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with dis.web. If not, see <https://www.gnu.org/licenses/>.
 */

export const DisMath={
  get BASE(){return 3;},
  get DIGITS(){return 10;},
  get MIN_VALUE(){return 0;},
  get MAX_VALUE(){return DisMath.BASE**DisMath.DIGITS-1;},
  
  get isTenTrits(){return (x)=>
    Number.isInteger(x)&&DisMath.MIN_VALUE<=x&&x<=DisMath.MAX_VALUE;
  },
  
  get increment(){
    const {isTenTrits,MAX_VALUE,MIN_VALUE}=DisMath;
    return (x)=>isTenTrits(x)?(x+1)%(MAX_VALUE+1-MIN_VALUE):undefined;
  },
  get rotateRight(){
    const {isTenTrits,BASE,DIGITS}=DisMath;
    return function(x){
      if(!isTenTrits(x)) return undefined;
      return Math.floor(x/BASE)+x%BASE*(BASE**(DIGITS-1));
    }
  },
  get subtract(){
    const {isTenTrits,BASE,DIGITS}=DisMath;
    return function(x,y){
      if(!isTenTrits(x)||!isTenTrits(y)) return undefined;
      return Array(DIGITS).fill([x,y]).map(([x,y],i)=>[
        Math.floor(x/(BASE**i)%BASE),
        Math.floor(y/(BASE**i)%BASE)
      ]).map(([x,y],i)=>(BASE+x-y)%BASE*(BASE**i)
      ).reduce((d1,d2)=>d1+d2);
    }
  },
}; // const DisMath

export class DisArray extends Array{
  constructor(...items){
    const length=DisMath.MAX_VALUE+1;
    if(items.length>length){
      throw new RangeError(`too many items`);
    }
    super(length);
    
    items.forEach((x,i)=>{
      this[i]=x;
    });
  } // constructor()
} // class DisArray

const defineDisArrayItems=()=>{
  const length=DisMath.MAX_VALUE+1;
  Array(length).fill(null).forEach((_,i)=>{
    var privVal=0;
    Object.defineProperty(DisArray.prototype,i,{
      get(){
        return privVal;
      },
      set(x){
        if(!DisMath.isTenTrits(x)){
          throw new RangeError(`not ten-trit value: ${x}`);
        }
        privVal=x;
      }
    });
  }); // forEach((_,i)=>{...})
}; // const defineDisArrayItems
defineDisArrayItems();

export class Dis{
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
