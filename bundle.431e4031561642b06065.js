(()=>{"use strict";const e=document.querySelector(".slider"),t=Array.from(document.querySelectorAll(".slide")),n=document.getElementById("arrow-next"),o=document.getElementById("arrow-prev");let r=!1,i=0,d=0,s=0,c=0,a=1;function u(t){return function(n){a=t,i=f(n),r=!0,c=requestAnimationFrame(v),e.classList.add("grabbing")}}function m(){r=!1,cancelAnimationFrame(c);const n=d-s;n<-50&&a<t.length-1&&(a+=1),n>50&&a>0&&(a-=1),E(),e.classList.remove("grabbing")}function l(e){if(r){const t=f(e);d=s+t-i}}function f(e){return e.type.includes("mouse")?e.pageX:e.touches[0].pageX}function v(){g(),r&&requestAnimationFrame(v)}function g(){e.style.transform=`translateX(${d}px)`}function E(){let e=t[0].offsetWidth;d=a*-e,s=d,g()}E(),t.forEach(((e,t)=>{e.addEventListener("touchstart",u(t)),e.addEventListener("mousedown",u(t)),e.addEventListener("touchmove",l),e.addEventListener("mousemove",l),e.addEventListener("touchend",m),e.addEventListener("mouseup",m),e.addEventListener("mouseleave",m)})),window.oncontextmenu=function(e){return e.preventDefault(),e.stopPropagation(),!1},n.addEventListener("click",(()=>{a<t.length-1&&(a+=1),E()})),o.addEventListener("click",(()=>{a>0&&(a-=1),E()})),document.addEventListener("keydown",(e=>{"ArrowRight"===e.code?(a<t.length-1&&(a+=1),E()):"ArrowLeft"===e.code&&(a>0&&(a-=1),E())}))})();
//# sourceMappingURL=bundle.431e4031561642b06065.js.map