
// Анимации: появление блоков при прокрутке, смена фото и текста, шапка при прокрутке.
// Стили — в src/styles/04-motion.css. При «уменьшении движения» ничего не скрывается.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window))return;

 // Блоки, которые проявляются при прокрутке. Соседи внутри одного родителя идут с небольшой задержкой.
 const revealSelector=[
  '.section-symbol','.post-intro>h2','.intro-caption>*','.post-wellness>h2','.post-wellness>.italic-line','.section-lead','.wellness-card',
  '.post-dining>h2','.dining-copy>*','.post-rooms-copy>*','.post-holiday>*:not(.section-symbol)',
  '.faq>div:first-child>*','.faq-list details','.footer-top>div','.footer-bottom',
  '.hotel-welcome>*','.room-card','.price-note','.spa-copy>*','.section-head>*>*','.section-head>p','.experience-card','.holiday-banner>*'
 ].join(',');
 const mediaSelector='.intro-primary,.intro-secondary,.post-dining figure,.wellness-card,.spa-image,.experience-card';

 const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(!e.isIntersecting)return;
   // Горизонтальная лента: проявляем все карточки сразу, волной.
   if(e.target.dataset.revealGroup!==undefined)e.target.querySelectorAll(':scope>.reveal,:scope>.reveal-media').forEach(c=>c.classList.add('is-in'));
   else e.target.classList.add('is-in');
   observer.unobserve(e.target)});
 },{rootMargin:'0px 0px -8% 0px',threshold:.12});

 const isRail=el=>/(auto|scroll)/.test(getComputedStyle(el).overflowX);
 const watch=el=>{const parent=el.parentElement;
  if(isRail(parent)){if(parent.dataset.revealGroup===undefined){parent.dataset.revealGroup='';observer.observe(parent)}}
  else observer.observe(el)};

 const groups=new Map();
 document.querySelectorAll(revealSelector).forEach(el=>{
  if(el.closest('.post-hero,dialog'))return;
  const n=groups.get(el.parentElement)||0;groups.set(el.parentElement,n+1);
  el.style.setProperty('--reveal-delay',Math.min(n*90,360)+'ms');
  el.classList.add('reveal');watch(el);
 });
 document.querySelectorAll(mediaSelector).forEach(el=>{el.classList.add('reveal-media');watch(el)});
 document.querySelectorAll('.post-rooms').forEach(el=>observer.observe(el));

 // Фото, которые меняются по кнопкам: проявляются после загрузки нового файла.
 const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
 ['#gallery-image','.spa-image img','#hero-still'].forEach(sel=>{
  const img=document.querySelector(sel);if(!img)return;
  new MutationObserver(()=>img.addEventListener('load',()=>replay(img,'media-swap'),{once:true})).observe(img,{attributes:true,attributeFilter:['src']});
 });
 const spaText=document.querySelector('#spa-description');
 if(spaText)new MutationObserver(()=>replay(spaText,'text-swap')).observe(spaText,{childList:true});

 // Смена сюжета на первом экране: текст проявляется заново, видео — тоже.
 const heroCopy=document.querySelector('.post-hero-copy');
 document.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>{
  replay(heroCopy,'is-swapping');
  const still=document.querySelector('#hero-still');
  if(still&&still.hidden&&typeof video!=='undefined')replay(video,'media-swap');
 }));

 // Шапка прячется при прокрутке вниз и возвращается при прокрутке вверх.
 const head=document.querySelector('.header');let lastY=scrollY,ticking=false;
 addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{
  const y=scrollY,down=y>lastY+4,up=y<lastY-4;
  if(y<400||up)head.classList.remove('is-hidden');else if(down&&!document.querySelector('dialog[open]'))head.classList.add('is-hidden');
  if(down||up)lastY=y;ticking=false})},{passive:true});
 head.addEventListener('focusin',()=>head.classList.remove('is-hidden'));
})();
