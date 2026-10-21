'use strict';
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
// Entrance directions are assigned to complete content blocks, never nested pieces.
const blockEntranceDirections = [
  ['.work > .section-heading', 'left'],
  ['.cinematic-feature', 'focus'],
  ['.services-layout', 'left'],

  ['.process > .section-heading', 'left'],
  ['.process-score', 'rise'],
  ['.engagement', 'right'],
  ['.contact > .shell', 'rise'],
  ['.footer-brand', 'focus']
];
blockEntranceDirections.forEach(([selector, direction]) => {
  document.querySelectorAll(selector).forEach(block => {
    if (!block.parentElement.closest('[data-section-entry]')) {
      block.dataset.sectionEntry = direction;
    }
  });
});
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .06 });
document.querySelectorAll('.section-heading, .event-feature, .campaign-feature, .editorial-grid .project, .campaign-print, .brand-communication, .services-layout, .steps article, .engagement').forEach(element => {
  if (element.closest('[data-section-entry]')) return;
  element.classList.add('reveal'); revealObserver.observe(element);
});
document.documentElement.classList.add('reveal-ready');
document.querySelectorAll('.reveal').forEach((element, index) => element.style.setProperty('--reveal-delay', (index % 3 * 85) + 'ms'));
// Whole portfolio chapters enter from alternating directions, once per visit.
const sectionEntries = document.querySelectorAll('[data-section-entry]');
if (!motionQuery.matches && 'IntersectionObserver' in window) {
  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('section-entered');
      chapterObserver.unobserve(entry.target);
    });
  }, { threshold:.08, rootMargin:'0px 0px -40px 0px' });
  sectionEntries.forEach(section => {
    section.addEventListener('focusin', () => {
      section.classList.add('section-entered');
      chapterObserver.unobserve(section);
    });
    chapterObserver.observe(section);
  });
  document.documentElement.classList.add('section-motion-ready');
  motionQuery.addEventListener('change', event => {
    if (!event.matches) return;
    sectionEntries.forEach(section => section.classList.add('section-entered'));
    chapterObserver.disconnect();
  });
}
const progress = document.createElement('div');
progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
let scheduled = false;
function updateProgress() {
  const heroMotion = document.querySelector('.hero');
  scheduled = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  const heroTravel = Math.min(Math.max(scrollY, 0), heroMotion.offsetHeight);
  if (motionQuery.matches) { heroMotion.style.removeProperty('--film-shift'); heroMotion.style.removeProperty('--headline-shift'); }
  else { heroMotion.style.setProperty('--film-shift', (heroTravel * .04) + 'px'); heroMotion.style.setProperty('--headline-shift', (heroTravel * -.012) + 'px'); }
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
addEventListener('resize', updateProgress, { passive: true }); updateProgress();
motionQuery.addEventListener('change', updateProgress);
const navigation = [...document.querySelectorAll('.site-header nav a')];
const sectionObserver = new IntersectionObserver(entries => {
  const entry = entries.find(item => item.isIntersecting);
  if (!entry) return;
  navigation.forEach(link => {
    if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('#trabajos, #servicios, #proceso').forEach(section => sectionObserver.observe(section));
if (!motionQuery.matches) {
  document.querySelectorAll('.hero-pre, .hero-loud, .frequency-word').forEach((line, index) => {
    line.animate([
      { opacity:0, transform:'translateY(38px)', filter:'blur(2px)' },
      { opacity:1, transform:'translateY(0)', filter:'blur(0)' }
    ], { duration:1400, delay:index*160, easing:'cubic-bezier(.22,.61,.36,1)', fill:'backwards' });
  });
  document.querySelectorAll('.hero-meta, .hero-intro, .hero-stage, .frequency-controls').forEach((block,index) => {
    block.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:1500,delay:180+index*180,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards'});
  });
}

// Subtle pointer lighting, media depth and magnetic calls to action.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('.project-media, .hero-film-link').forEach(surface => {
  let frame = 0;
  let point = null;
  surface.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionQuery.matches) return;
    point = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = surface.getBoundingClientRect();
      const x = (point.x - bounds.left) / bounds.width;
      const y = (point.y - bounds.top) / bounds.height;
      surface.style.setProperty('--spot-x', (x * 100) + '%');
      surface.style.setProperty('--spot-y', (y * 100) + '%');
      if (surface.classList.contains('project-media')) {
        surface.style.setProperty('--tilt-x', ((.5 - y) * 1.5) + 'deg');
        surface.style.setProperty('--tilt-y', ((x - .5) * 1.5) + 'deg');
      }
    });
  });
  surface.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    surface.style.setProperty('--spot-x', '50%');
    surface.style.setProperty('--spot-y', '50%');
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');
  });
});
document.querySelectorAll('.pill, .header-contact').forEach(control => {
  control.classList.add('magnetic-motion');
  control.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionQuery.matches) return;
    const bounds = control.getBoundingClientRect();
    control.style.setProperty('--mag-x', (((event.clientX - bounds.left) / bounds.width - .5) * 6) + 'px');
    control.style.setProperty('--mag-y', (((event.clientY - bounds.top) / bounds.height - .5) * 5) + 'px');
  });
  control.addEventListener('pointerleave', () => {
    control.style.setProperty('--mag-x', '0px');
    control.style.setProperty('--mag-y', '0px');
  });
});
// Portfolio counters: values come from the BASS 2026 material supplied by the user.
const countUpObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    countUpObserver.unobserve(counter);
    if (motionQuery.matches) { counter.textContent = Number(counter.dataset.value).toFixed(Number(counter.dataset.decimals || 0)); return; }
    const target = Number(counter.dataset.value);
    const decimals = Number(counter.dataset.decimals || 0);
    let startTime;
    const animateCount = time => {
      if (motionQuery.matches) { counter.textContent = target.toFixed(decimals); return; }
      if (startTime === undefined) startTime = time;
      const progress = Math.min(1, (time - startTime) / 5000);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      counter.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(animateCount);
    };
    requestAnimationFrame(animateCount);
  });
}, { threshold: .45 });
document.querySelectorAll('[data-count-up]').forEach(counter => {
  const decimals = Number(counter.dataset.decimals || 0);
  counter.textContent = (motionQuery.matches ? Number(counter.dataset.value) : 0).toFixed(decimals);
  if (!motionQuery.matches) countUpObserver.observe(counter);
});
motionQuery.addEventListener('change',event=>{
  if(!event.matches)return;
  document.querySelectorAll('[data-count-up]').forEach(counter=>{
    countUpObserver.unobserve(counter);
    counter.textContent=Number(counter.dataset.value).toFixed(Number(counter.dataset.decimals||0));
  });
});
// Real pointer feedback also works on laptops whose primary input is touch.
const bassHoverSurfaces = document.querySelectorAll('.channel-button, .frequency-prompt, .wall-print, .strategy-project, .communication-piece, .process-score article');
bassHoverSurfaces.forEach(surface => {
  surface.classList.add('bass-hover');
  let hoverFrame = 0;
  let hoverPoint = null;
  const resetHover = () => {
    cancelAnimationFrame(hoverFrame);
    hoverFrame = 0;
    surface.classList.remove('is-pointer-over');
    ['--hover-x','--hover-y','--hover-rx','--hover-ry'].forEach(key => surface.style.removeProperty(key));
  };
  surface.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    surface.classList.add('is-pointer-over');
  });
  surface.addEventListener('pointermove', event => {
    if (motionQuery.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    hoverPoint = { x:event.clientX, y:event.clientY };
    if (hoverFrame) return;
    hoverFrame = requestAnimationFrame(() => {
      hoverFrame = 0;
      const rect = surface.getBoundingClientRect();
      const x = Math.max(0,Math.min(1,(hoverPoint.x-rect.left)/rect.width));
      const y = Math.max(0,Math.min(1,(hoverPoint.y-rect.top)/rect.height));
      surface.style.setProperty('--hover-x',`${x*100}%`);
      surface.style.setProperty('--hover-y',`${y*100}%`);
      surface.style.setProperty('--hover-rx',`${(.5-y)*4}deg`);
      surface.style.setProperty('--hover-ry',`${(x-.5)*5}deg`);
    });
  });
  surface.addEventListener('pointerleave',resetHover);
  surface.addEventListener('pointercancel',resetHover);
  window.addEventListener('blur',resetHover);
  motionQuery.addEventListener('change',resetHover);
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('toggle',()=>{if(dialog.open)resetHover();});
  });
});

// Low amplitude hero depth; video controls and the existing signal keep their behavior.
(() => {
  const hero=document.querySelector('.premium-hero');
  if(!hero)return;
  const lightLines=[...hero.querySelectorAll('.hero-loud,.frequency-word')];
  lightLines.forEach(line=>{
    const reflection=document.createElement('span');
    reflection.className='hero-letter-light';
    reflection.setAttribute('aria-hidden','true');
    reflection.textContent=line.textContent;
    line.append(reflection);
  });
  let heroFrame=0;
  let point;
  const reset=()=>{
    cancelAnimationFrame(heroFrame);heroFrame=0;
    ['--hero-light-x','--hero-light-y','--hero-depth-x','--hero-depth-y'].forEach(key=>hero.style.removeProperty(key));
    hero.classList.remove('hero-pointer-active');
  };
  hero.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||motionQuery.matches)return;
    point={x:event.clientX,y:event.clientY};
    if(heroFrame)return;
    heroFrame=requestAnimationFrame(()=>{
      heroFrame=0;
      const r=hero.getBoundingClientRect();
      const x=Math.max(0,Math.min(1,(point.x-r.left)/r.width));
      const y=Math.max(0,Math.min(1,(point.y-r.top)/r.height));
      hero.style.setProperty('--hero-light-x',`${x*100}%`);
      hero.style.setProperty('--hero-light-y',`${y*100}%`);
      hero.style.setProperty('--hero-depth-x',`${(x-.5)*8}px`);
      hero.style.setProperty('--hero-depth-y',`${(y-.5)*6}px`);
      lightLines.forEach(line=>{
        const bounds=line.getBoundingClientRect();
        line.style.setProperty('--letter-light-x',`${point.x-bounds.left}px`);
        line.style.setProperty('--letter-light-y',`${point.y-bounds.top}px`);
      });
      hero.classList.add('hero-pointer-active');
    });
  },{passive:true});
  hero.addEventListener('pointerleave',reset);
  hero.addEventListener('pointercancel',reset);
  window.addEventListener('blur',reset);
  motionQuery.addEventListener('change',reset);
})();
// BASS signal: finite ripples emitted by the cursor, asleep outside the hero.
(() => {
  const hero=document.querySelector('.premium-hero');
  if(!hero)return;
  const canvas=document.createElement('canvas');
  canvas.className='hero-signal-ripples';
  canvas.setAttribute('aria-hidden','true');
  hero.prepend(canvas);
  const ctx=canvas.getContext('2d');
  if(!ctx){canvas.remove();return;}
  const lines=[...hero.querySelectorAll('.hero-loud,.frequency-word')];
  let width=0,height=0,frame=0,lastPaint=0,lastEmit=-Infinity,lastPoint=null,visible=false;
  let pulses=[];
  function resize(){
    width=hero.clientWidth;height=hero.clientHeight;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    pulses=[];
    lines.forEach(line=>line.style.removeProperty('--signal-radius'));
  }
  function stop(){
    cancelAnimationFrame(frame);frame=0;pulses=[];
    ctx.clearRect(0,0,width,height);
    lines.forEach(line=>line.style.removeProperty('--signal-radius'));
  }
  function paint(now){
    frame=0;
    if(!visible||document.hidden||motionQuery.matches){stop();return;}
    if(now-lastPaint<32){frame=requestAnimationFrame(paint);return;}
    lastPaint=now;
    ctx.clearRect(0,0,width,height);
    pulses=pulses.filter(p=>now-p.born<2200);
    pulses.forEach(p=>{
      const t=(now-p.born)/2200;
      const radius=12+t*440;
      const alpha=Math.sin(Math.min(1,t*8)*Math.PI/2)*(1-t)**1.5;
      ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);
      ctx.strokeStyle=`rgba(131,155,255,${alpha*.65})`;
      ctx.lineWidth=1.3;ctx.shadowBlur=10;ctx.shadowColor=`rgba(77,91,255,${alpha*.6})`;ctx.stroke();
      ctx.shadowBlur=0;
      if(radius>26){
        ctx.beginPath();ctx.arc(p.x,p.y,radius-22,0,Math.PI*2);
        ctx.strokeStyle=`rgba(97,121,255,${alpha*.2})`;ctx.lineWidth=.7;ctx.stroke();
      }
    });
    const latest=pulses[pulses.length-1];
    if(latest){
      lines.forEach(line=>line.style.setProperty('--signal-radius',`${12+(now-latest.born)/2200*440}px`));
      frame=requestAnimationFrame(paint);
    }else lines.forEach(line=>line.style.removeProperty('--signal-radius'));
  }
  function emit(event){
    if(event.pointerType!=='mouse'||motionQuery.matches||!visible||document.hidden)return;
    const now=performance.now();
    const rect=hero.getBoundingClientRect();
    const x=event.clientX-rect.left,y=event.clientY-rect.top;
    if(now-lastEmit<170||(lastPoint&&Math.hypot(x-lastPoint.x,y-lastPoint.y)<28))return;
    lastEmit=now;lastPoint={x,y};
    pulses.push({x,y,born:now});
    if(pulses.length>7)pulses.shift();
    lines.forEach(line=>{
      const r=line.getBoundingClientRect();
      line.style.setProperty('--signal-letter-x',`${event.clientX-r.left}px`);
      line.style.setProperty('--signal-letter-y',`${event.clientY-r.top}px`);
    });
    if(!frame)frame=requestAnimationFrame(paint);
  }
  hero.addEventListener('pointermove',emit,{passive:true});
  hero.addEventListener('pointerleave',()=>{lastPoint=null;});
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(!visible)stop();
  },{threshold:.01}).observe(hero);
  new ResizeObserver(resize).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  motionQuery.addEventListener('change',stop);
  window.addEventListener('blur',stop);
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('toggle',()=>{if(dialog.open)stop();}));
  resize();
})();

// Portfolio papers settle onto the composition; the existing mouse depth stays independent.
(() => {
  const posters=[...document.querySelectorAll('.wall-print,.strategy-project,.communication-piece')];
  if(!posters.length||motionQuery.matches||!('IntersectionObserver' in window))return;
  const running=new Map();
  function settle(poster){
    poster.classList.remove('poster-waiting');
    const animations=running.get(poster)||[];
    animations.forEach(animation=>animation.cancel());
    running.delete(poster);
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const poster=entry.target;
      observer.unobserve(poster);
      if(motionQuery.matches){settle(poster);return;}
      const index=posters.indexOf(poster);
      const direction=index%2===0?-1:1;
      const delay=200+(index%2)*180;
      const mobile=matchMedia('(max-width:650px)').matches;
      const distance=mobile?24:52;
      const pose=poster.animate([
        {transform:`perspective(1100px) translate3d(${direction*distance}px,${mobile?30:65}px,45px) rotateX(12deg) rotateZ(${direction*7}deg) scale(1.06)`},
        {transform:'perspective(1100px) translate3d(0,0,0) rotateX(0deg) rotateZ(0deg) scale(1)'}
      ],{duration:2100,delay,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards',composite:'add'});
      const fade=poster.animate([{opacity:0},{opacity:1}],
        {duration:1450,delay,easing:'ease-out',fill:'backwards'});
      running.set(poster,[pose,fade]);
      poster.classList.remove('poster-waiting');
      Promise.all([pose.finished,fade.finished]).then(()=>running.delete(poster)).catch(()=>{});
    });
  },{threshold:.12,rootMargin:'0px 0px -25px 0px'});
  posters.forEach(poster=>{
    poster.classList.add('poster-waiting');
    observer.observe(poster);
    poster.addEventListener('pointerenter',event=>{
      if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
      observer.unobserve(poster);settle(poster);
    });
    poster.addEventListener('focusin',()=>{observer.unobserve(poster);settle(poster);});
  });
  document.documentElement.classList.add('poster-motion-ready');
  motionQuery.addEventListener('change',event=>{
    if(!event.matches)return;
    observer.disconnect();posters.forEach(settle);
  });
})();

// Manifest: the blue field opens first, followed by the two halves of the message.
(() => {
  const section=document.querySelector('.frequency-statement');
  if(!section||motionQuery.matches||!('IntersectionObserver' in window))return;
  const field=document.createElement('div');
  field.className='manifest-blue-field';field.setAttribute('aria-hidden','true');
  section.prepend(field);
  const reveal=()=>{
    section.classList.add('manifest-visible');
    observer.disconnect();
  };
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting))reveal();
  },{threshold:.15,rootMargin:'0px 0px -20px 0px'});
  section.classList.add('manifest-ready');
  observer.observe(section);
  section.addEventListener('focusin',reveal);
  motionQuery.addEventListener('change',event=>{if(event.matches)reveal();});
})();