// Scroll reveal for feature cards
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(card);
});

// Animate hero stat numbers
function animateCount(el, target, suffix = '', duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target + suffix; clearInterval(timer); }
    else { el.textContent = Math.floor(start) + suffix; }
  }, 16);
}

window.addEventListener('load', () => {
  const nums = document.querySelectorAll('.stat-num');
  if (nums[0]) animateCount(nums[0], 38, '%');
  if (nums[2]) animateCount(nums[2], 12, 'K+');
});

// Animate mockup wave
const wavePoints = [
  "0,60 30,45 60,50 90,30 120,40 150,20 180,35 210,15 240,30 270,25 300,10",
  "0,55 30,50 60,40 90,45 120,25 150,35 180,20 210,30 240,15 270,35 300,25",
  "0,50 30,35 60,55 90,25 120,45 150,15 180,40 210,20 240,35 270,15 300,30",
  "0,40 30,55 60,35 90,50 120,20 150,40 180,15 210,35 240,25 270,40 300,15",
];
let waveIdx = 0;
const waveLine = document.querySelector('.wave-line');
const waveFill = document.querySelector('.wave-fill');

if (waveLine) {
  setInterval(() => {
    waveIdx = (waveIdx + 1) % wavePoints.length;
    const pts = wavePoints[waveIdx];
    waveLine.setAttribute('points', pts);
    waveFill.setAttribute('points', pts + ' 300,80 0,80');
  }, 1200);
}