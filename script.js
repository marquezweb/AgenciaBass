'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const previews = [...document.querySelectorAll('.reel-preview')];
const dialog = document.querySelector('.reel-dialog');
const player = dialog.querySelector('video');
const status = dialog.querySelector('.player-status');
const reelSources = { cobertura: 'assets/video/entrevistas-primavera.mp4', moda: 'assets/video/activacion-qr.mp4' };
let lastTrigger;
let visiblePreviews = new Set();

function syncPreviews() {
  for (const video of previews) {
    const play = visiblePreviews.has(video) && !document.hidden && !dialog.open && !document.querySelector('.image-dialog[open]') && !reducedMotion.matches && !navigator.connection?.saveData && video.dataset.userPaused !== 'true';
    if (play) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else video.pause();
  }
}
const videoObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) visiblePreviews.add(entry.target);
    else visiblePreviews.delete(entry.target);
  }
  syncPreviews();
}, { threshold: .25 });
previews.forEach(video => videoObserver.observe(video));
reducedMotion.addEventListener('change', syncPreviews);
document.addEventListener('visibilitychange', () => {
  syncPreviews();
  if (document.hidden) player.pause();
});
document.querySelectorAll('[data-reel]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    lastTrigger = link;
    status.textContent = 'Cargando video…';
    dialog.querySelector('.reel-original').href = link.href;
    player.poster = link.querySelector('video')?.poster || link.querySelector('img')?.src || '';
    player.src = reelSources[link.dataset.reel];
    dialog.showModal();
    document.body.classList.add('player-open');
    syncPreviews();
    player.play().catch(() => { status.textContent = 'Pulsá reproducir para ver el video.'; });
  });
});
player.addEventListener('playing', () => { status.textContent = ''; });
player.addEventListener('error', () => { status.textContent = 'No se pudo cargar el archivo. Podés verlo en Instagram.'; });
dialog.querySelector('.close-reel').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  player.pause(); player.removeAttribute('src'); player.load();
  status.textContent = '';
  document.body.classList.remove('player-open');
  syncPreviews();
  lastTrigger?.focus({ preventScroll: true });
});

document.querySelectorAll('.engagement-options details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (detail.open) document.querySelectorAll('.engagement-options details').forEach(other => { if (other !== detail) other.open = false; });
  });
});

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
function setMenu(open) {
  header.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
header.querySelectorAll('nav a').forEach(link => link.addEventListener('click', event => {
 const target = document.querySelector(link.getAttribute('href'));
 if (!target) return;
 event.preventDefault();
 setMenu(false);
 requestAnimationFrame(() => {
  history.replaceState(null, '', link.getAttribute('href'));
  target.scrollIntoView({behavior:'instant', block:'start'});
 });
}));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
matchMedia('(min-width: 651px)').addEventListener('change', () => setMenu(false));



// Explore the actual BASS work in context; original publications stay one click away.
(() => {
 const viewer=document.querySelector('.image-dialog');
 if(!viewer)return;
 const metadata={
  'estrategia-influencers.webp':['ESTRATEGIA / CARRUSEL','Detrás de una campaña.','Portada del carrusel de BASS sobre el trabajo con influencers. El contenido completo está en la publicación original.'],
  'influencers-bass.webp':['BASS / COMUNICACIÓN PROPIA','Personas que conectan marcas.','Pieza de comunicación de BASS sobre campañas con influencers en Córdoba.'],
  'servicios-bass.webp':['BASS / DISEÑO PARA REDES','Más que un post.','Pieza de BASS sobre diseño gráfico, manejo de redes y creación de contenido.']
 };
 const links=[...document.querySelectorAll('.cinematic-feature,.wall-print,.strategy-project,.communication-piece')];
 const items=links.map(link=>{
  const img=link.querySelector('img');
  const file=img.getAttribute('src').split('/').pop();
  const details=metadata[file];
  return details?{link,source:img.getAttribute('src'),alt:img.alt,category:details[0],title:details[1],description:details[2],original:link.href}:null;
 }).filter(Boolean);
 const image=viewer.querySelector('.gallery-image');
 const imageStage=viewer.querySelector('.gallery-stage');
 const strip=viewer.querySelector('.gallery-strip');
 const imageStatus=viewer.querySelector('.gallery-status');
 let index=0;
 let trigger;
 let thumbs=[];
 let touchStart;
 const pad=n=>String(n).padStart(2,'0');
 function select(next){
  index=(next+items.length)%items.length;
  const item=items[index];
  imageStage.classList.add('is-loading');
  imageStatus.textContent='';
  image.alt=item.alt;
  image.src=item.source;
  viewer.querySelector('.gallery-category').textContent=item.category;
  viewer.querySelector('#gallery-title').textContent=item.title;
  viewer.querySelector('.gallery-description').textContent=item.description;
  viewer.querySelector('.gallery-original').href=item.original;
  viewer.querySelector('.gallery-counter').textContent=`${pad(index+1)} / ${pad(items.length)}`;
  thumbs.forEach((thumb,i)=>thumb.setAttribute('aria-pressed',String(i===index)));
  if(image.complete&&image.naturalWidth)imageStage.classList.remove('is-loading');
 }
 function makeThumbs(){
  if(thumbs.length)return;
  thumbs=items.map((item,i)=>{
   const button=document.createElement('button');
   button.type='button';button.className='gallery-thumbnail';
   button.setAttribute('aria-label',`Ver pieza ${i+1}: ${item.title}`);
   button.setAttribute('aria-pressed','false');
   const thumbnail=document.createElement('img');
   thumbnail.alt='';thumbnail.src=item.source;thumbnail.decoding='async';
   button.append(thumbnail);button.addEventListener('click',()=>select(i));strip.append(button);
   return button;
  });
 }
 image.addEventListener('load',()=>imageStage.classList.remove('is-loading'));
 image.addEventListener('error',()=>{imageStage.classList.remove('is-loading');imageStatus.textContent='La imagen no pudo cargarse. Podés verla en la publicación original.';});
 items.forEach((item,i)=>{
  item.link.classList.add('gallery-source');
  item.link.setAttribute('aria-haspopup','dialog');
  item.link.setAttribute('aria-controls','portfolio-gallery');
  item.link.setAttribute('aria-label','Ver pieza: '+item.title);
  if(!item.link.querySelector('.piece-cta')){
   const hint=document.createElement('span');hint.className='piece-cta portfolio-piece-cta';
   hint.append(document.createTextNode('Ver pieza '));
   const icon=document.createElement('span');icon.textContent='↗';icon.setAttribute('aria-hidden','true');
   hint.append(icon);item.link.append(hint);
  }
  const arrow=item.link.querySelector('.circle-arrow');if(arrow)arrow.textContent='+';
  item.link.addEventListener('click',event=>{
   if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();trigger=item.link;makeThumbs();select(i);
   viewer.showModal();document.body.classList.add('player-open');syncPreviews();
  });
 });
 viewer.querySelector('.gallery-close').addEventListener('click',()=>viewer.close());
 viewer.querySelector('.gallery-previous').addEventListener('click',()=>select(index-1));
 viewer.querySelector('.gallery-next').addEventListener('click',()=>select(index+1));
 viewer.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();select(index+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();select(index-1);}
 });
 viewer.addEventListener('click',event=>{
  if(event.target!==viewer)return;
  const box=viewer.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();
 });
 imageStage.addEventListener('touchstart',event=>{const touch=event.touches[0];touchStart=event.touches.length===1?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
 imageStage.addEventListener('touchend',event=>{
  if(!touchStart)return;
  const touch=event.changedTouches[0];const dx=touch.clientX-touchStart.x;const dy=touch.clientY-touchStart.y;
  if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)select(index+(dx<0?1:-1));
  touchStart=null;
 },{passive:true});
 viewer.addEventListener('close',()=>{if(!dialog.open)document.body.classList.remove('player-open');syncPreviews();trigger?.focus({preventScroll:true});});
})();

// Static campaign formats and contact routing; no accounts or stored submissions.
(() => {
 if(!document.getElementById('profile-contact-link'))return;
 const routes={
  brand:{href:'https://wa.me/5493516227593?text='+encodeURIComponent('Hola BASS, quiero crear contenido para mi marca.'),label:'Consultar por WhatsApp',hint:'Contanos sobre tu marca y el contenido que necesitás.'},
  creator:{href:'https://wa.me/5493516227593?text='+encodeURIComponent('Hola BASS, soy creador de contenido y me gustaría presentar mi perfil.\n\nNombre:\nRedes sociales:\nTipo de contenido:\nEjemplos de trabajos:'),label:'Presentar mi perfil por WhatsApp',hint:'Compartí tus redes y ejemplos de trabajos por WhatsApp.'},
  both:{href:'https://wa.me/5493516227593?text='+encodeURIComponent('Hola BASS, creo contenido y tengo una marca. Quiero conversar sobre una propuesta.'),label:'Conversar por WhatsApp',hint:'Contanos sobre tu perfil como creador y sobre tu marca.'}
 };
 document.querySelectorAll('[name="bass-profile"]').forEach(input=>input.addEventListener('change',()=>{
  const route=routes[input.value];const link=document.getElementById('profile-contact-link');
  link.href=route.href;link.replaceChildren(document.createTextNode(route.label+' '));
  const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');link.append(arrow);
  document.getElementById('profile-contact-hint').textContent=route.hint;
 }));
})();
