/* ══════════════════════════════════════════════════════════════════
   MYSTIK — script.js | Premium Interactive Layer
   ══════════════════════════════════════════════════════════════════ */

// ─── City Data ───
const CITIES = [
  { name: 'London', country: 'UK', listeners: 166 },
  { name: 'Los Angeles', country: 'USA', listeners: 140 },
  { name: 'Chicago', country: 'USA', listeners: 135 },
  { name: 'New York', country: 'USA', listeners: 127 },
  { name: 'Toronto', country: 'Canada', listeners: 126 },
  { name: 'Denver', country: 'USA', listeners: 120 },
  { name: 'Berlin', country: 'Germany', listeners: 118 },
  { name: 'Sydney', country: 'Australia', listeners: 117 },
  { name: 'Philadelphia', country: 'USA', listeners: 107 },
  { name: 'Brooklyn', country: 'USA', listeners: 98 },
];

// ─── Register GSAP Plugins ───
gsap.registerPlugin(ScrollTrigger);

// ─── THREE.JS PARTICLE BACKGROUND ───
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Particle system
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xc084fc,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connection lines
  const linePositions = [];
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.06,
  });

  const MAX_LINES = 80;
  const lines = [];
  for (let i = 0; i < MAX_LINES; i++) {
    const geo = new THREE.BufferGeometry();
    const line = new THREE.Line(geo, lineMaterial.clone());
    lines.push({ line, geo, a: null, b: null, life: 0, maxLife: Math.random() * 200 + 100 });
    scene.add(line);
  }

  let lineIndex = 0;
  let frameCount = 0;

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;

    // Camera parallax
    camera.position.x += (targetX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (targetY * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate particles slowly
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    // Animate particles with wave motion
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += Math.sin(frameCount * 0.005 + i * 0.1) * 0.0005;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Spawn connection lines
    if (frameCount % 8 === 0) {
      const a = Math.floor(Math.random() * particleCount);
      const b = Math.floor(Math.random() * particleCount);
      if (a !== b) {
        const lineObj = lines[lineIndex % MAX_LINES];
        const pts = new Float32Array([
          pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2],
          pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]
        ]);
        lineObj.geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        lineObj.a = a;
        lineObj.b = b;
        lineObj.life = lineObj.maxLife;
        lineIndex++;
      }
    }

    // Fade and remove lines
    for (const lineObj of lines) {
      if (lineObj.life > 0) {
        lineObj.life--;
        const opacity = (lineObj.life / lineObj.maxLife) * 0.08;
        lineObj.line.material.opacity = opacity;
        lineObj.line.visible = opacity > 0.001;
      }
    }

    renderer.render(scene, camera);
  }

  animate();
})();

// ─── CUSTOM CURSOR ───
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let cx = 0, cy = 0;
  let fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
  });

  // Hide on mobile
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  // Animate cursor follower smoothly
  function animateCursor() {
    fx += (cx - fx) * 0.15;
    fy += (cy - fy) * 0.15;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects
  const hoverTargets = document.querySelectorAll('a, button, [data-hover], [data-tilt]');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
})();

// ─── NAV SCROLL ───
(function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
})();

// ─── MOBILE MENU ───
(function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });
})();

// ─── GSAP SCROLL REVEALS ───
(function initScrollAnimations() {
  const sections = document.querySelectorAll('[data-section]');
  sections.forEach((section, i) => {
    const children = section.querySelectorAll('.section-title, .section-sub, .section-label, .album-tile, .about-text, .about-map, .about-pillars, .connect-card, .tour-card, .signup-left, .signup-right, .hero-inner > *');
    gsap.fromTo(children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
})();

// ─── 3D TILT EFFECT ───
(function initTilt() {
  const tiltElements = document.querySelectorAll('[data-tilt]');
  if (!tiltElements.length) return;

  const handleMove = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    const rotY = dx * 8;
    const rotX = -dy * 8;
    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
  };

  const handleLeave = (el) => {
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    setTimeout(() => { el.style.transition = ''; }, 600);
  };

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => handleMove(e, el));
    el.addEventListener('mouseleave', () => handleLeave(el));
  });
})();

// ─── HERO COUNTER ANIMATION ───
(function initCounters() {
  const counters = document.querySelectorAll('.h-stat-num[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = parseInt(entry.target.dataset.count);
      const duration = 2000;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        entry.target.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
        else entry.target.textContent = target.toLocaleString();
      }
      requestAnimationFrame(update);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

// ─── CITY LIST ───
(function initCities() {
  const list = document.getElementById('cityList');
  if (!list) return;
  list.innerHTML = CITIES.map(c => `
    <div class="city-row">
      <span class="city-name">${c.name}, ${c.country}</span>
      <span class="city-count">${c.listeners.toLocaleString()}</span>
    </div>
  `).join('');
})();

// ─── MARQUEE SECTIONS ───
(function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const itemWidth = track.scrollWidth / 2;
  gsap.to(track, {
    x: -itemWidth,
    duration: 40,
    ease: 'none',
    repeat: -1,
  });
})();

// ─── SCROLL CUE HIDE ───
(function initScrollCue() {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      cue.style.opacity = '0';
      cue.style.transition = 'opacity 0.5s';
    } else {
      cue.style.opacity = '1';
    }
  });
})();

// ─── NEWSLETTER FORM ───
(function initForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;
  const submitBtn = document.getElementById('submitBtn');
  const btnLabel = submitBtn?.querySelector('.btn-label');
  const btnSpinner = submitBtn?.querySelector('.btn-spinner');
  const success = document.getElementById('signupSuccess');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const interest = form.querySelector('[name="interest"]').value;

    if (!name || !email) return;

    if (btnLabel) btnLabel.style.display = 'none';
    if (btnSpinner) btnSpinner.style.display = 'flex';

    try {
      // Submit to Buttondown
      await fetch('https://buttondown.email/api/emails/embed-subscribe/mystik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, tags: interest ? [interest] : [] }),
      });
    } catch (_) {}

    // Show success
    form.style.display = 'none';
    if (success) {
      success.style.display = 'block';
      gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }
  });
})();

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── PARALLAX BLOBS ON MOUSE ───
(function initBlobParallax() {
  const blobs = document.querySelectorAll('.light-blob');
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  function animateBlobs() {
    blobs.forEach(blob => {
      const speed = parseFloat(blob.dataset.speed) || 0.3;
      const x = mx * 30 * speed;
      const y = my * 30 * speed;
      blob.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(animateBlobs);
  }
  animateBlobs();
})();

// ─── CONSOLE EASTER EGG ───
console.log('%c MYSTIK ', 'background: #7c3aed; color: white; font-size: 20px; font-weight: bold; padding: 8px 20px; border-radius: 4px;');
console.log('%cMemento Mori — Remember death. Make music that outlives you.', 'color: #c084fc; font-size: 12px;');
console.log('%cIndependent since 2024.', 'color: #55556a; font-size: 10px;');
