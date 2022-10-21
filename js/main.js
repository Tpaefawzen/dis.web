/*
 * js/main.js
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

'use strict';

import * as base64 from './base64.js';
import * as base16 from './base16.js';
import * as dis from './dis.js';

const STEP_FOR=10000; // at least this is stressless in my environment which is qutebrowser on my gnu/linux

/**
 * bootloader.
 */
const loadUrlHashParams=()=>{
  const getElementById=(id)=>document.getElementById(id);
  const getQueryParam=(param)=>new URLSearchParams(document.location.hash.substring(1)).get(param);

  const d=(queryParam,s)=>{
    getElementById(queryParam).value=s;
  };
  const opt=(queryParam,s)=>{
    const e=getElementById(queryParam.replace("_","-"));
    if(Array.from(e.options).map(e=>e.value).some(v=>v===s)){
      e.value=s;
    }
  };

  [
    ["source",d],
    ["input_enc",opt],
    ["input",d],
    ["output_enc",opt]
  ].forEach(([queryParam,method])=>{
    const s=getQueryParam(queryParam);
    if(s!==null) console.log({queryParam,s});
    if(s!==null) method(queryParam,s);
  });
};
window.addEventListener("DOMContentLoaded",loadUrlHashParams);

/**
 * does opposite to loadUrlHashParams, for genurl button
 */
const generateUrl=()=>{
  const url2copy=new URL(window.location.href.replace(window.location.hash,""));
  const query=new URLSearchParams();
  "source input-enc input output-enc".split(" ").forEach(elemName=>{
    const queryName=elemName.replaceAll(/-/g,"_");
    const e=document.getElementById(elemName);
    const val=e.value;
    query.set(queryName,val);
  });
  url2copy.hash=query;
  navigator.clipboard.writeText(url2copy.toString()).then(()=>{
    const e=document.getElementById('genurl');
    const oldText=e.textContent;
    e.textContent="copied!";
    setTimeout(()=>e.textContent=oldText,2000);
  }).catch((_)=>{
    writeError(url2copy.toString());
    const e=document.getElementById('genurl');
    const oldText=e.textContent;
    e.textContent="see Program stderr";
    setTimeout(()=>e.textContent=oldText,2000);
  });
  try{
    location.replace(url2copy);
  }catch(_){
    // NOP
  }
};
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById('genurl').addEventListener("click",generateUrl);
});

/**
 * @function getInputEncoding
 * @param val{string} encoder name
 * @returns {function} whose @param {string} @returns {Uint8Array}
 */
const getInputEncoding=(val)=>{
  switch(val){
    case"utf-8":return str=>new TextEncoder().encode(str);
    case"base64":return b64=>base64.decodeBase64(b64);
    case"base16":return b16=>base16.decodeBase16(b16);
  }
  throw new RangeError(`no such input encoder: ${val}`);
}

/**
 * @global @maybe{Dis}
 */
var machine=null;

/**
 * @global {integer}
 */
var timer=-1;

/**
 * @private?
 */
const doStep=()=>{
  console.assert(timer>0,"where is timer?");
  console.assert(machine,"machine should be set");

  document.getElementById('start').disabled=true;
  document.getElementById('resume').disabled=true;
  document.getElementById('stop').disabled=false;

  document.getElementById('step').textContent++;
  Array(STEP_FOR).fill(null).forEach(()=>machine.step());
  if(machine.halt){
    stopProgram("Program finished");
    return;
  }
  timer=setTimeout(doStep,0);  
};

/**
 * for start button
 */
const startOverProgram=()=>{
  clearError();
  clearOutput();

  document.getElementById('step').textContent=0;


  try{
    const sSource=document.getElementById('source').value;
    machine=new dis.Dis(sSource);

    const sInput=document.getElementById('input').value;
    const encoder=document.getElementById('input-enc').value;
    const inputBuffer=Array.from(getInputEncoding(encoder)(sInput));
    machine.inputBuffer=inputBuffer;

  console.log({sSource,sInput,machine});

    timer=setTimeout(doStep,0);
    // should not do exception while running
  }catch(e){
    writeError(`${e.name}: ${e.message}`);
    document.getElementById('start').disabled=false;
    document.getElementById('resume').disabled=true;
    document.getElementById('stop').disabled=true;
    return;
  }
};
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById('start').addEventListener("click",startOverProgram);
});

/**
 * for stop button, also for when step() ended
 */
const stopProgram=(doneMessage)=>{
  document.getElementById('start').disabled=false;
  document.getElementById('resume').disabled=machine.halt?true:false;
  document.getElementById('stop').disabled=true;

  clearTimeout(timer);
  if(timer<=0){
    timer=-1;
    return;
  }

  timer=-1;

  const{outputBuffer}=machine;
  const output=document.getElementById('output');
  const decoderName=document.getElementById('output-enc').value;
  output.value=getOutputEncoding(decoderName)(new Uint8Array(outputBuffer));

  updateLength("output");

  writeError(doneMessage);
  if(output.value.length>200000){
    output.value=output.value.substring(0,200000);
    writeError("Output too long; truncated to 200000");
  }
};
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById('stop').addEventListener("click",()=>stopProgram("paused"));
});

window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById('resume').addEventListener("click",()=>{
    if(!machine) return;
    if(timer>0) return;
    timer=setTimeout(doStep,0);
  });
});

const clearOutput=()=>{
  document.getElementById('output').value="";
  if(machine) machine.outputBuffer=[];
};

const writeError=(msg)=>{
  const stderr=document.getElementById('stderr');
  stderr.value=`${stderr.value}${msg}${"\n"}`;
};
const clearError=()=>{
  document.getElementById('stderr').value="";
};

/**
 * @function getOutputEncoding
 * @param val{string} decoder name
 * @returns {function} whose @param {Uint8Array} @returns {string}
 */
const getOutputEncoding=(val)=>{
  switch(val){
    case"utf-8": return a=>new TextDecoder().decode(a);
    case"base64": return a=>base64.encodeBase64(a);
    case"base16": return a=>base16.encodeBase16(a);
  }
  throw new RangeError(`no such output encoder: ${val}`);
};

/**
 * @function updateLength
 * Given @param elemId, span for `${elemId}-length` shall be updated
 * Also tries to use `${elemId}-enc`
 */
const updateLength=(elemId)=>{
  try{
    const e=document.getElementById(`${elemId}-enc`);
    let encoder=getInputEncoding("utf-8");
    if(e){
      encoder=getInputEncoding(e.value);
    }

    const textArea=document.getElementById(elemId);

    const l=document.getElementById(`${elemId}-length`);
    if(!l) return;
    l.textContent=encoder(textArea.value).length;
  }catch(_){
    // ignore; unchanged
  }
};
"source input".split(" ").forEach(eName=>{
  window.addEventListener("DOMContentLoaded",()=>{
    updateLength(eName);
  }); // bootloader
  const e=document.getElementById(eName);
  e.addEventListener("change",()=>updateLength(eName));
  const enc=document.getElementById(`${eName}-enc`);
  if(enc) enc.addEventListener("change",()=>updateLength(eName));
});

document.getElementById("clear-output").addEventListener("click",()=>{
  clearOutput();
});

// vim: expandtab shiftwidth=2 softtabstop=2:
