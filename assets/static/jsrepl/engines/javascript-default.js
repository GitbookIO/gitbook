/*

 Copyright Joyent, Inc. and other Node contributors.

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to permit
 persons to whom the Software is furnished to do so, subject to the
 following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 USE OR OTHER DEALINGS IN THE SOFTWARE.

 Original at: https://github.com/joyent/node/blob/master/lib/util.js
*/
(function(){function o(c){return c instanceof Array||Array.isArray(c)||c&&c!==Object.prototype&&o(c.__proto__)}function p(c){return c instanceof RegExp||typeof c==="function"&&c.constructor.name==="RegExp"&&c.compile&&c.test&&c.exec&&(""+c).match(/^\/.*\/[gim]{0,3}$/)}var q=80,l=function(c,h,b,f){function m(a,c){switch(typeof a){case "undefined":return d("undefined","undefined");case "string":var b="'"+JSON.stringify(a).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return d(b,"string");
case "number":return d(""+a,"number");case "boolean":return d(""+a,"boolean")}if(a===null)return d("null","null");var f=Object.keys(a),i=h?Object.getOwnPropertyNames(a):f;if(typeof a==="function"&&i.length===0)return p(a)?d(""+a,"regexp"):d("[Function"+(a.name?": "+a.name:"")+"]","special");if(a instanceof Date&&i.length===0)return d(a.toUTCString(),"date");var j,l;o(a)?(l="Array",b=["[","]"]):(l="Object",b=["{","}"]);typeof a==="function"?(j=a.name?": "+a.name:"",j=p(a)?" "+a:" [Function"+j+"]"):
j="";a instanceof Date&&(j=" "+a.toUTCString());if(i.length===0)return b[0]+j+b[1];if(c<0)return p(a)?d(""+a,"regexp"):d("[Object]","special");k.push(a);i=i.map(function(b){var e,g;a.__lookupGetter__&&(a.__lookupGetter__(b)?g=a.__lookupSetter__(b)?d("[Getter/Setter]","special"):d("[Getter]","special"):a.__lookupSetter__(b)&&(g=d("[Setter]","special")));f.indexOf(b)<0&&(e="["+b+"]");g||(k.indexOf(a[b])<0?(g=c===null?m(a[b]):m(a[b],c-1),g.indexOf("\n")>-1&&(g=o(a)?g.split("\n").map(function(a){return"  "+
a}).join("\n").substr(2):"\n"+g.split("\n").map(function(a){return"   "+a}).join("\n"))):g=d("[Circular]","special"));if(typeof e==="undefined"){if(l==="Array"&&b.match(/^\d+$/))return g;e=JSON.stringify(""+b);e.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(e=e.substr(1,e.length-2),e=d(e,"name")):(e=e.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),e=d(e,"string"))}return e+": "+g});k.pop();var n=0;return i=i.reduce(function(a,b){n++;b.indexOf("\n")>=0&&n++;return a+b.length+1},0)>q?b[0]+
(j===""?"":j+"\n ")+" "+i.join(",\n  ")+" "+b[1]:b[0]+j+" "+i.join(", ")+" "+b[1]}var k=[],d=function(a,b){var c={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},d={special:"cyan",number:"blue","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"}[b];return d?"\u001b["+c[d][0]+"m"+a+"\u001b["+c[d][1]+"m":a};f||(d=function(a){return a});
return m(c,typeof b==="undefined"?2:b)},r=/%[sdj%]/g,s=function(c){if(typeof c!=="string"){for(var h=[],b=0;b<arguments.length;b++)h.push(l(arguments[b]));return h.join(" ")}for(var b=1,f=arguments,m=f.length,h=String(c).replace(r,function(c){if(b>=m)return c;switch(c){case "%s":return String(f[b++]);case "%d":return Number(f[b++]);case "%j":return JSON.stringify(f[b++]);case "%%":return"%";default:return c}}),k=f[b];b<m;k=f[++b])h+=k===null||typeof k!=="object"?" "+k:" "+l(k);return h},n={};self.console=
{log:function(){Sandboss.out(s.apply(this,arguments)+"\n")},dir:function(c){Sandboss.out(l(c)+"\n")},time:function(c){n[c]=Date.now()},timeEnd:function(c){var h=Date.now()-n[c];self.console.log("%s: %dms",c,h)},read:function(c){Sandboss.input(c||function(){})},inspect:l}})();
