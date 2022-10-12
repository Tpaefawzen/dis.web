/*
 * js/base16.js
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

const value2encode="0123456789abcdef";
const encode2value=[...value2encode].reduce((map,c,i)=>{
  map.set(c,i);
  return map;
},new Map())

export const decodeBase16=(b16str)=>{
  const{result}=[...b16str].filter(c=>
    c.match(/[0-9a-f]/i)
  ).map(c=>encode2value.get(c.toLowerCase()))
  .reduce(({result,buffer},n,i)=>{
    switch(i%2){
      case 0:return {result,buffer:n};
      case 1:
        result.push(buffer<<4|n);
        return {result,buffer};
    }
  },{
    result: [],
    buffer: null
  });
  return new Uint8Array(result);
}

export const encodeBase16=(u8int_array)=>{
  return u8int_array.reduce((b16str,n)=>{
    return `${b16str}${value2encode[(n&0xf0)>>4]}${value2encode[n&0x0f]}`;
  },"").toUpperCase();
}
