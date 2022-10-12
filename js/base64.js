/*
 * js/base64.js
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

const value2encode='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const encode2value=[...value2encode].reduce((map,ch,i)=>{
  map.set(ch,i);
  return map;
},new Map());

class Base64Error extends Error{
  get name(){return "Base64Error"}
}

export const base64urlToBase64=(str)=>str.replaceAll("-","+").replaceAll("_","/");
export const base64ToBase64url=(str)=>str.replaceAll("+","-").replaceAll("/","_");

/**
 * @function decodeBase64
 * @param {string} b64 can mix base64url and base64 letter. Padding is optional. Can have spaces.
 * @throws {Base64Exception} if b64 has any letter not in encode2val or equal sign not in trailing.
 * @returns {Uint8Array} represents an octet sequence.
 */
export const decodeBase64=(b64str)=>{
  const noBlankNoPads=base64urlToBase64(b64str)
  .replaceAll(/\s/g,"")
  .replace(/=+$/,"");
  
  const resultArray=[...noBlankNoPads].map(char=>{
    const x=encode2value.get(char);
    if(x===undefined){
      throw new Base64Error(`given base64 string has non-base64 letter: ${char}`);
    }
    return x
  }).reduce(({result,buf},x,i)=>{
    switch(i%4){
      case 0:
      buf=x<<2;
      return {result,buf};
      
      case 1:
      result.push(buf|(x&0b110000)>>4);
      buf=(x&0b001111)<<4;
      return {result,buf};
      
      case 2:
      result.push(buf|(x&0b111100)>>2);
      buf=(x&0b000011)<<6;
      return {result,buf};
      
      case 3:
      result.push(buf|x);
      return {result,buf};
    }
  },{
    result: [],
    buf: null
  }).result;
  
  return new Uint8Array(resultArray)
}

/**
 * @function encodeBase64
 * @param arr {Uint8Array} represents a sequence of octets.
 * @returns {string} represents a base64 (not url-safe) string.
 */
export const encodeBase64=(arr)=>{
  const butNoPads=arr.reduce((result,x,i)=>{
    const L=result.length;
    switch(i%3){
      case 0:
      result[L]=(x&0b11111100)>>2;
      result[L+1]=(x&0b00000011)<<4;
      return result;
      
      case 1:
      result[L-1]|=(x&0b11110000)>>4;
      result[L]=(x&0b00001111)<<2;
      return result;
      
      case 2:
      result[L-1]|=(x&0b11000000)>>6;
      result[L]=(x&0b00111111);
      return result;
      
      default:
      throw new Error("Bug at encodeBase64(str): failed to convert octets to sextets")
    }
  },[]).map(n=>value2encode[n]).join("");
  
  switch(butNoPads.length%4){
    case 0: return butNoPads;
    case 2: return butNoPads+"==";
    case 3: return butNoPads+"=";
    default: throw new Error("Bug at encodeBase64(arr): padding not working: "+butNoPads)
  }
}
