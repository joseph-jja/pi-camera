(()=>{"use strict";function t(t,e,o){return o instanceof t||(typeof o).toLowerCase()===e}const e=function(t,e){-1===t?.className?.indexOf(e)&&(t.className+=" "+e)},o=function(o,n,l){let a,i=document.body;if(n&&t(String,"string",n)?i=document.getElementById(n):n&&(i=n),!o)return i;if(l&&l.id&&(a=document.getElementById(l.id)),a||(a=document.createElement(o)),!a)return a;if(i.appendChild(a),a&&l){let t;for(t in l)try{a[t]=l[t]}catch(t){}l.className&&e(a,l.className)}return a};function n(t){return Math.pow(t,2)}function l(t){return t*Math.PI/180}function a(t,e,a,i){const r={canvas:null,ctx:null,width:0,height:0};let c;return r.canvas=o("canvas",e,{id:t}),r.canvas?(a&&(r.canvas.width=a),i&&(r.canvas.height=i),r.width=r.canvas.width,r.height=r.canvas.height,null!=r.canvas.getContext&&(r.ctx=r.canvas.getContext("2d"),function(t){const e="black";function o(t,e){return Math.sqrt(n(t)-n(e))}t.clear=function(){this.ctx.clearRect(0,0,this.width,this.height)},t.line=function(t,o,n,a,i){let r,c,s,h,u,f=0,g=0;r=this.ctx,i&&(h=i.color,u=i.rotateAngle),r.save(),r.beginPath(),u&&(c=Math.abs(t-n)/2,s=Math.abs(o-a)/2,f=t+c,g=o+s,r.translate(f,g),r.rotate(l(u))),r.moveTo(t-f,o-g),r.lineTo(n-f,a-g),r.fillStyle=h||e,r.fill(),r.strokeStyle=h||e,r.stroke(),r.restore()},t.circle=function(t,o,n,l){let a,i,r,c;i=this.ctx,l&&(r=l.color,c=l.fillStrokeClear),i.beginPath(),i.moveTo(t+n,o),i.arc(t,o,n,0,2*Math.PI,!0),a=c||"stroke",i[a+"Style"]=r||e,i[a]()},t.halfCircle=function(t,o,n,a){let i,r,c,s,h,u,f=0,g=0;r=this.ctx,a&&(c=a.color,s=a.rotateAngle,u=a.openTop,h=a.fillStrokeClear),r.save(),r.beginPath(),s&&(f=t,g=o,r.translate(f,g),r.rotate(l(s))),r.moveTo(t-n-f,o-g),r.arc(t-f,o-g,n,Math.PI,2*Math.PI,!0),u||r.lineTo(t-n-f,o-g),r.closePath(),i=h||"stroke",r[i+"Style"]=c||e,r[i](),r.restore()},t.oval=function(t,o,n,a,i){let r,c,s,h,u,f=0,g=0,d=.5522848,T=t-n/2,v=o-a/2,m=n/2*d,C=a/2*d,x=T+n,k=v+a,y=T+n/2,S=v+a/2;c=this.ctx,c.save(),i&&(s=i.color,h=i.fillStrokeClear,u=i.rotateAngle),c.beginPath(),u&&(f=y,g=S,c.translate(f,g),c.rotate(l(u))),c.moveTo(T-f,S-g),c.bezierCurveTo(T-f,S-C-g,y-m-f,v-g,y-f,v-g),c.bezierCurveTo(y+m-f,v-g,x-f,S-C-g,x-f,S-g),c.bezierCurveTo(x-f,S+C-g,y+m-f,k-g,y-f,k-g),c.bezierCurveTo(y-m-f,k-g,T-f,S+C-g,T-f,S-g),c.restore(),r=h||"stroke",c[r+"Style"]=s||e,c[r]()},t.rectangle=function(t,o,n,a,i){let r,c,s,h,u,f=0,g=0;c=this.ctx,i&&(s=i.color,h=i.rotateAngle,u=i.fillStrokeClear),c.save(),c.beginPath(),h&&(f=Math.round(t+n/2),g=Math.round(o+a/2),c.translate(f,g),c.rotate(l(h))),r=u||"stroke",c[r+"Style"]=s||e,c[r+"Rect"](t-f,o-g,n,a),c[r](),c.restore()},t.square=function(t,e,o,n){this.rectangle(t,e,o,o,n)},t.triangle=function(t,o,n,a,i,r,c){let s,h,u,f,g,d=0,T=0;s=this.ctx,c&&(u=c.color,f=c.rotateAngle,g=c.fillStrokeClear),s.save(),s.beginPath(),f&&(d=(t+n+i)/3,T=(o+a+r)/3,s.translate(d,T),s.rotate(l(f))),h=g||"stroke",s.moveTo(t-d,o-T),s.lineTo(n-d,a-T),s.lineTo(i-d,r-T),s.lineTo(t-d,o-T),s.closePath(),s[h+"Style"]=u||e,s[h](),s.restore()},t.equilateralTriangle=function(t,e,n,l){let a,i,r;l&&(r=l.orientation),i=n/2,a=o(n,i),"down"===r?this.triangle(t,e,t+n,e,t+i,e+a,l):this.triangle(t,e,t+n,e,t+i,e-a,l)},t.hexagon=function(t,n,a,i){let r,c,s,h,u,f,g,d=0,T=0;r=this.ctx,i&&(f=i.color,g=i.rotateAngle,u=i.fillStrokeClear),s=a/2,h=u||"stroke",c=o(a,s),r.save(),r.beginPath(),g&&(d=t,T=n,r.translate(d,T),r.rotate(l(g))),r.moveTo(t+s-a-d,n-c-T),r.lineTo(t+s-d,n-c-T),r.lineTo(t+a-d,n-T),r.lineTo(t+s-d,n+c-T),r.lineTo(t+s-a-d,n+c-T),r.lineTo(t-a-d,n-T),r.lineTo(t-a+s-d,n-c-T),r.closePath(),r[h+"Style"]=f||e,r[h](),r.restore()},t.octagon=function(t,o,n,a){let i,r,c,s,h,u,f,g=0,d=0;a&&(u=a.color,f=a.rotateAngle,h=a.fillStrokeClear),s=h||"stroke",c=n/2,r=Math.sqrt(Math.pow(n,2)+Math.pow(c,2)),i=this.ctx,i.save(),f&&(g=t,d=o,i.translate(g,d),i.rotate(l(f))),i.beginPath(),i.moveTo(t-c-g,o-r-d),i.lineTo(t+c-g,o-r-d),i.lineTo(t+r-g,o-c-d),i.lineTo(t+r-g,o+c-d),i.lineTo(t+c-g,o+r-d),i.lineTo(t-c-g,o+r-d),i.lineTo(t-r-g,o+c-d),i.lineTo(t-r-g,o-c-d),i.lineTo(t-c-g,o-r-d),i.closePath(),i[s+"Style"]=u||e,i[s](),i.restore()},t.setBackgroundColor=function(t){this.rectangle(0,0,this.width,this.height,{color:t||"white",fillStrokeClear:"fill"})},t.addtext=function(t,o,n){let l=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};this.ctx.font=l.font||"16pt Calibri",this.ctx.fillStyle=l.color||e,this.ctx.fillText(n,t,o)}}(r),c=r),c):null}window.addEventListener("DOMContentLoaded",(()=>{window.histogramCanvasRef=a("histogram-display","center-aligner",520,450),document.getElementById("center-aligner").prepend(document.getElementById("histogram-display"))}))})();