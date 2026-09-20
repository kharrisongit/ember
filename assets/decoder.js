/* Asset decoder helpers required before game.js loads. */
const Z85A="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
const Z85M=(()=>{const m={};for(let i=0;i<85;i++)m[Z85A[i]]=i;return m;})();
function z85(s,pad){const n=(s.length/5)*4,u=new Uint8Array(n);let o=0;for(let i=0;i<s.length;i+=5){let v=0;for(let k=0;k<5;k++)v=v*85+Z85M[s[i+k]];u[o++]=(v>>>24)&255;u[o++]=(v>>>16)&255;u[o++]=(v>>>8)&255;u[o++]=v&255;}const end=n-(pad||0);let bin="";for(let i=0;i<end;i+=8192)bin+=String.fromCharCode.apply(null,u.subarray(i,Math.min(end,i+8192)));return btoa(bin);}
