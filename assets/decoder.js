/* Packed-asset decoder. var/function declarations intentionally share the classic-script global scope with game.js without causing lexical redeclaration errors. */
var Z85A="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
var Z85M=(function(){var m={};for(var i=0;i<85;i++)m[Z85A[i]]=i;return m;})();
function z85(s,pad){var n=(s.length/5)*4,u=new Uint8Array(n),o=0;for(var i=0;i<s.length;i+=5){var v=0;for(var k=0;k<5;k++)v=v*85+Z85M[s[i+k]];u[o++]=(v>>>24)&255;u[o++]=(v>>>16)&255;u[o++]=(v>>>8)&255;u[o++]=v&255;}var end=n-(pad||0),bin="";for(var j=0;j<end;j+=8192)bin+=String.fromCharCode.apply(null,u.subarray(j,Math.min(end,j+8192)));return btoa(bin);}
