(()=>{
 const gallery=document.querySelector('.research-gallery');if(!gallery)return;
 const slides=[...gallery.querySelectorAll('.gallery-slide')],selector=document.querySelector('#image-selector'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let current=0,timer,manual=false;
 function show(index){slides[current].classList.remove('is-active');current=index;slides[current].classList.add('is-active');gallery.setAttribute('aria-label',slides[current].dataset.title);}
 function schedule(){clearTimeout(timer);if(!manual&&!reduced.matches&&!document.hidden)timer=setTimeout(()=>{show((current+1)%slides.length);schedule();},4000);}
 selector?.addEventListener('change',()=>{manual=selector.value!=='';if(manual){const index=Number(selector.value);if(Number.isInteger(index)&&index>=0&&index<slides.length)show(index);}schedule();});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);schedule();
})();
