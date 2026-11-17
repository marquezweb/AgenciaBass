'use strict';
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
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
