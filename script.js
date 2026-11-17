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
const previewToggle = document.querySelector('.preview-toggle');
const heroPreview = document.getElementById('hero-preview');
function updatePreviewToggle() {
  const paused = heroPreview.paused;
  previewToggle.textContent = paused ? '▶' : 'Ⅱ';
  previewToggle.setAttribute('aria-label', paused ? 'Reproducir adelanto' : 'Pausar adelanto');
}
previewToggle.hidden = false;
heroPreview.addEventListener('play', updatePreviewToggle);
heroPreview.addEventListener('pause', updatePreviewToggle);
previewToggle.addEventListener('click', () => {
  if (heroPreview.paused) {
    heroPreview.dataset.userPaused = 'false';
    if (!heroPreview.getAttribute('src')) heroPreview.src = heroPreview.dataset.src;
    heroPreview.play().catch(() => {});
  } else {
    heroPreview.dataset.userPaused = 'true';
    heroPreview.pause();
  }
});
updatePreviewToggle();
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

const serviceFormats = {
  branding: ['Aa.', 'Forma. Color. Identidad.', 'DISEÑO & BRANDING'],
  difusion: ['↗', 'Tu mensaje, en circulación.', 'DIFUSIÓN / FLYERS / GOOGLE'],
  influencers: ['↗', 'Personas que conectan marcas.', 'INFLUENCERS'],
  ads: ['↗', 'Publicidad para impulsar tu marca.', 'META / GOOGLE ADS'],
  redes: ['↗', 'Una dirección para tu marca.', 'ESTRATEGIA & REDES'],
  ugc: ['REC', 'Personas. Historias. Contenido.', 'CREADORAS / REELS / UGC'],
  filmmaker: ['REC.', 'Una mirada profesional para tu marca.', 'CONTENIDO PROFESIONAL / FILMMAKER'],
  web: ['</>', 'Tu identidad, también en la web.', 'DISEÑO WEB / RESPONSIVE'],
  eventos: ['LIVE', 'La experiencia, en vivo.', 'FOTO / VIDEO / EDICIÓN EXPRESS'],
  staff: ['BTL', 'Tu marca, en el encuentro.', 'PROMOTORAS / ACREDITACIONES / BTL']
};
const serviceBoard = document.querySelector('.service-board');
const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
function previewService(detail) {
  const sample = serviceFormats[detail.dataset.sample];
  if (!sample || !serviceBoard) return;
  const [code, format, caption] = sample;
  clearTimeout(serviceBoard._serviceMotionTimer);
  if (serviceBoard.dataset.activeSample === detail.dataset.sample) {
    serviceBoard.classList.remove('is-switching');
    return;
  }
  serviceBoard.classList.add('is-switching');
  serviceBoard._serviceMotionTimer = setTimeout(() => {
    document.getElementById('service-code').textContent = code;
    document.getElementById('service-format').textContent = format;
    document.getElementById('service-caption').textContent = caption;
    serviceBoard.dataset.activeSample = detail.dataset.sample;
    serviceBoard.classList.remove('is-switching');
  }, 100);
}
document.querySelectorAll('.service-list details').forEach(detail => {
  const summary = detail.querySelector('summary');
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.service-list details').forEach(other => { if (detail !== other) other.open = false; });
    previewService(detail);
  });
  summary.addEventListener('pointerenter', () => {
    if (hoverPointer.matches) previewService(detail);
  });
  summary.addEventListener('focus', () => previewService(detail));
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
header.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
matchMedia('(min-width: 651px)').addEventListener('change', () => setMenu(false));

// The frequency selector previews the existing BASS pieces. Only a selected
// channel gets loaded; the existing observer still owns autoplay and pause.
(() => {
  const hero = document.querySelector('.premium-hero');
  const stage = hero?.querySelector('.hero-stage');
  if (!stage) return;
  const mediaLink = stage.querySelector('.hero-film-link');
  const buttons = [...hero.querySelectorAll('.channel-button')];
  const channels = [
    { source: 'assets/video/bass-entrevistas-adelanto.mp4', poster: 'assets/posters/entrevistas-primavera.webp', reel: 'cobertura', url: 'https://www.instagram.com/agencia.bass/reel/DdcMUgUTUqQ/', label: 'PERSONAS', caption: 'PERSONAS REALES.\nHISTORIAS EN PRIMERA PERSONA.', title: 'Ver entrevistas de BASS con sonido' },
    { source: 'assets/video/activacion-qr.mp4', poster: 'assets/posters/activacion-qr.webp', reel: 'moda', url: 'https://www.instagram.com/agencia.bass/reel/DdsL5wETYeI/', label: 'EN LA CALLE', caption: 'UNA INVITACIÓN FUERA DEL FEED.\nACTIVACIÓN QR / CONTENIDO EN LA CALLE.', title: 'Ver activación QR de BASS con sonido' }
  ];
  let selected = 0;
  let switchTimer;
  let revealTimer;
  function settle() {
    clearTimeout(revealTimer);
    stage.classList.remove('is-tuning');
  }
  heroPreview.addEventListener('loadeddata', settle);
  heroPreview.addEventListener('error', settle);
  function selectChannel(index) {
    if (index === selected) return;
    selected = index;
    const channel = channels[index];
    clearTimeout(switchTimer);
    clearTimeout(revealTimer);
    buttons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(index === i));
      button.querySelector('.channel-action').textContent = index === i ? 'Viendo ahora' : 'Ver video';
    });
    const previewBounds = mediaLink.getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    if (previewBounds.top < headerHeight || previewBounds.bottom > window.innerHeight) {
      mediaLink.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    }
    stage.dataset.channel = String(index);
    stage.classList.add('is-tuning');
    switchTimer = setTimeout(() => {
      heroPreview.pause();
      heroPreview.poster = channel.poster;
      heroPreview.dataset.src = channel.source;
      heroPreview.src = channel.source;
      // Respect a visitor's existing manual pause preference across channels.
      mediaLink.href = channel.url;
      mediaLink.dataset.reel = channel.reel;
      mediaLink.setAttribute('aria-label', channel.title);
      stage.querySelector('.channel-readout').textContent = `CH. 0${index + 1} / ${channel.label}`;
      const caption = stage.querySelector('.channel-caption');
      caption.replaceChildren(...channel.caption.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
      hero.querySelector('.channel-announcement').textContent = `Frecuencia ${index + 1}: ${channel.label}. ${channel.caption.replace('\n', ' ')}`;
      syncPreviews();
      // A poster stays available if network data is delayed.
      revealTimer = setTimeout(settle, 900);
    }, reducedMotion.matches ? 0 : 150);
  }
  buttons.forEach((button,index) => {
    button.addEventListener('click', () => selectChannel(index));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % buttons.length : event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length : null;
      if (next === null) return;
      event.preventDefault(); buttons[next].focus(); selectChannel(next);
    });
  });


})();

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
