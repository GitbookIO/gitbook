/*

 Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 3. The names of its contributors may not be used to endorse or promote
 products derived from this software without specific prior written
 permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 Any feedback is very welcome.
 http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
 email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/
(function(c){try{c.window=c.window||c}catch(b){}try{c.self=c.self||c}catch(e){}var a;c.addEventListener("message",function(d){for(var d=JSON.parse(d.data),b=a,c=d.type.split("."),e=0;e<c.length;e++)b=b[c[e]];b(d.data)},false);(function(){var d=function(){},a="debug,error,info,log,warn,dir,dirxml,trace,assert,count,markTimeline,profile,profileEnd,time,timeEnd,timeStamp,group,groupCollapsed,groupEnd".split(",");if(typeof console==="undefined")c.console={};for(var b=0;b<a.length;b++)if(typeof c.console[a[b]]!==
"function")try{c.console[a[b]]=d}catch(e){}})();a={outTimeout:0,output_buffer:[],OUT_EVERY_MS:50,syncTimeout:Infinity,isFrame:typeof document!=="undefined",post:function(d){d=JSON.stringify(d);this.isFrame?window.parent.postMessage(d,"*"):self.postMessage(d)},importScripts:function(d){for(var b=[],c=0,e=[],f=[],j=0,g=this,m=XMLHttpRequest||ActiveXObject("Microsoft.XMLHTTP"),k=function(b){return function(a){var a=a.loaded||a.position,h=e[b]||0;e[b]=a;j+=a-h;a=j/c*100;f.length===d.length&&g.progress(a)}},
l=d.length,n=function(){var d;if(l===0){for(d=0;d<b.length;d++)(self.execScript||function(b){self.eval.call(self,b)})(b[d].responseText);g.engine=new self.JSREPLEngine(g.input,g.out,g.result,g.err,self,g.ready);g.bindAll(a.engine);g.hide("JSREPLEngine")}},i=0;i<d.length;i++)(function(a){b[a]=new m;b[a].addEventListener&&b[a].addEventListener("progress",k(a),false);b[a].onprogress=k(a);b[a].onreadystatechange=function(){if(b[a].readyState===2){var d=b[a];f.indexOf(d)===-1&&(f.push(d),c+=parseInt(d.getResponseHeader("X-Raw-Length"),
10))}else b[a].readyState===4&&(l--,n())};b[a].open("GET",d[a],true);b[a].send(null)})(i)},out:function(a){this.output_buffer.push(a);this.outTimeout===0?(this.outTimeout=setTimeout(this.flush,this.OUT_EVERY_MS),this.syncTimeout=Date.now()):Date.now()-this.syncTimeout>this.OUT_EVERY_MS&&(clearTimeout(this.outTimeout),this.flush())},flush:function(){if(this.output_buffer.length)this.post({type:"output",data:this.output_buffer.join("")}),this.outTimeout=0,this.output_buffer=[]},err:function(a){a={type:"error",
data:a.toString()};this.flush();this.post(a)},input:function(a){this.input.write=a;this.flush();this.post({type:"input"})},result:function(a){a={type:"result",data:a};this.flush();this.post(a)},ready:function(){this.post({type:"ready"})},getNextLineIndent:function(a){this.post({type:"indent",data:this.engine.GetNextLineIndent(a)})},progress:function(a){this.post({type:"progress",data:a})},dbInput:function(){this.flush();this.post({type:"db_input"})},serverInput:function(){this.flush();this.post({type:"server_input"})},
bindAll:function(a){for(var b in a)(function(b){var c=a[b];typeof c=="function"&&(a[b]=function(){var b=[].slice.call(arguments);return c.apply(a,b)})})(b)},hide:function(a){try{Object.defineProperty(c,a,{writable:false,enumerable:false,configurable:false,value:c[a]})}catch(b){}},set_input_server:function(a){this.input_server={url:(a.url||"/emscripten/input/")+a.input_id,cors:a.cors||false}}};a.bindAll(a);c.Sandboss=a;a.hide("Sandboss");if(self.openDatabaseSync){var f=self.openDatabaseSync("replit_input",
"1.0","Emscripted input",1024);self.prompt=function(){a.dbInput();var b=null;f.transaction(function(a){b=a});for(var c;!(c=b.executeSql("SELECT * FROM input").rows).length;)for(c=0;c<1E8;c++);b.executeSql("DELETE FROM input");return c.item(0).text};a.hide("prompt")}else if(!a.isFrame)self.prompt=function(){a.serverInput();var b;b=a.input_server.url;var c=new XMLHttpRequest;if(a.input_server.cors)if("withCredentials"in c)c.open("GET",b,false);else if(typeof XDomainRequest!="undefined")c=new XDomainRequest,
c.open("GET",b);else throw Error("Your browser doesn' support CORS");else c.open("GET",b,false);b=c;b.send(null);return b.status===200?b.responseText:"ERROR: ON NON-WEBKIT BROWSERS CONNECTION TO THE SERVER IS NEEDED FOR INPUT"}})(this);
(function(){var c=function(b){b==void 0&&(b=Date.now());this.N=624;this.M=397;this.MATRIX_A=2567483615;this.UPPER_MASK=2147483648;this.LOWER_MASK=2147483647;this.mt=Array(this.N);this.mti=this.N+1;this.init_genrand(b)};c.prototype.init_genrand=function(b){this.mt[0]=b>>>0;for(this.mti=1;this.mti<this.N;this.mti++)b=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30,this.mt[this.mti]=(((b&4294901760)>>>16)*1812433253<<16)+(b&65535)*1812433253+this.mti,this.mt[this.mti]>>>=0};c.prototype.init_by_array=function(b,
c){var a,f,d;this.init_genrand(19650218);a=1;f=0;for(d=this.N>c?this.N:c;d;d--){var h=this.mt[a-1]^this.mt[a-1]>>>30;this.mt[a]=(this.mt[a]^(((h&4294901760)>>>16)*1664525<<16)+(h&65535)*1664525)+b[f]+f;this.mt[a]>>>=0;a++;f++;a>=this.N&&(this.mt[0]=this.mt[this.N-1],a=1);f>=c&&(f=0)}for(d=this.N-1;d;d--)h=this.mt[a-1]^this.mt[a-1]>>>30,this.mt[a]=(this.mt[a]^(((h&4294901760)>>>16)*1566083941<<16)+(h&65535)*1566083941)-a,this.mt[a]>>>=0,a++,a>=this.N&&(this.mt[0]=this.mt[this.N-1],a=1);this.mt[0]=
2147483648};c.prototype.genrand_int32=function(){var b,c=[0,this.MATRIX_A];if(this.mti>=this.N){var a;this.mti==this.N+1&&this.init_genrand(5489);for(a=0;a<this.N-this.M;a++)b=this.mt[a]&this.UPPER_MASK|this.mt[a+1]&this.LOWER_MASK,this.mt[a]=this.mt[a+this.M]^b>>>1^c[b&1];for(;a<this.N-1;a++)b=this.mt[a]&this.UPPER_MASK|this.mt[a+1]&this.LOWER_MASK,this.mt[a]=this.mt[a+(this.M-this.N)]^b>>>1^c[b&1];b=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK;this.mt[this.N-1]=this.mt[this.M-1]^
b>>>1^c[b&1];this.mti=0}b=this.mt[this.mti++];b^=b>>>11;b^=b<<7&2636928640;b^=b<<15&4022730752;b^=b>>>18;return b>>>0};c.prototype.genrand_int31=function(){return this.genrand_int32()>>>1};c.prototype.genrand_real1=function(){return this.genrand_int32()*(1/4294967295)};c.prototype.random=function(){return this.genrand_int32()*(1/4294967296)};c.prototype.genrand_real3=function(){return(this.genrand_int32()+0.5)*(1/4294967296)};c.prototype.genrand_res53=function(){var b=this.genrand_int32()>>>5,c=this.genrand_int32()>>>
6;return(b*67108864+c)*1.1102230246251565E-16};(function(){Math._random=Math.random;var b=new c(42);Math.random=function(){return b.random()};Math.seed=function(e){b=new c(e)}})()})();if(!Date.now)Date.now=function(){return+new Date};if(!Object.keys)Object.keys=function(c){if(c!==Object(c))throw new TypeError("Object.keys called on non-object");var b=[],e;for(e in c)Object.prototype.hasOwnProperty.call(c,e)&&b.push(e);return b};if(!Object.getOwnPropertyNames)Object.getOwnPropertyNames=Object.keys;
if(!Object.create)Object.create=function(c){function b(){}b.prototype=c;return new b};if(!Array.isArray)Array.isArray=function(c){return{}.toString.call(c)=="[object Array]"};
if(!Function.prototype.bind)Function.prototype.bind=function(c){if(typeof this!=="function")throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");var b=Array.prototype.slice.call(arguments,1),e=this,a=function(){},f=function(){try{return e.apply(this instanceof a?this:c||window,b.concat(Array.prototype.slice.call(arguments)))}catch(d){return e.apply(c||window,b.concat(Array.prototype.slice.call(arguments)))}};a.prototype=this.prototype;f.prototype=new a;return f};
if(!Object.freeze)Object.freeze=function(c){return c.___frozen___=true};if(!Object.isFrozen)Object.isFrozen=function(c){return Boolean(c.___frozen___)};
