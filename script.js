/* ══════════════════════════════════════════════════════════════════
   MYSTIK — script.js | Premium + 3D Avatar System
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

// ══════════════════════════════════════════════════════════════════
// 1. THREE.JS BACKGROUND PARTICLE FIELD
// ══════════════════════════════════════════════════════════════════
(function initBackgroundParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  const particleCount = 400;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3]   = (Math.random()-0.5)*20;
    positions[i*3+1] = (Math.random()-0.5)*20;
    positions[i*3+2] = (Math.random()-0.5)*20;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xc084fc, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);
  let mouseX=0, mouseY=0, targetX=0, targetY=0;
  document.addEventListener('mousemove', e => { mouseX=(e.clientX/window.innerWidth-0.5)*2; mouseY=-(e.clientY/window.innerHeight-0.5)*2; });
  window.addEventListener('resize', () => { camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
  let t=0;
  function animate() {
    requestAnimationFrame(animate);
    t+=0.005;
    targetX+=(mouseX-targetX)*0.02; targetY+=(mouseY-targetY)*0.02;
    camera.position.x+=(targetX*0.5-camera.position.x)*0.05;
    camera.position.y+=(targetY*0.5-camera.position.y)*0.05;
    camera.lookAt(scene.position);
    particles.rotation.y+=0.0003; particles.rotation.x+=0.0001;
    const pos = particles.geometry.attributes.position.array;
    for(let i=0;i<particleCount;i++) pos[i*3+1]+=Math.sin(t+i*0.1)*0.0005;
    particles.geometry.attributes.position.needsUpdate=true;
    renderer.render(scene, camera);
  }
  animate();
})();

// ══════════════════════════════════════════════════════════════════
// 2. 3D AVATAR — Head tracking with mouse + optional gyroscope
// ══════════════════════════════════════════════════════════════════
// 3. HERO AVATAR — 3D stylized bust with blonde dreads
// ══════════════════════════════════════════════════════════════════
(function init3DAvatar() {
  const canvas = document.getElementById('hero-logo-canvas');
  if (!canvas || !window.THREE) return;
  const container = document.getElementById('heroLogo3D');
  if (!container) return;

  const w = container.clientWidth || 500;
  const h = container.clientHeight || 500;
  canvas.width = w; canvas.height = h;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 5.5;

  // ── Lighting ──
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.5);
  scene.add(ambientLight);
  const spotLight = new THREE.SpotLight(0xfff8e7, 2.5, 20, Math.PI / 5, 0.4, 1);
  spotLight.position.set(1, 4, 5);
  scene.add(spotLight);
  const fillLight = new THREE.PointLight(0x4fc3f7, 0.8, 15);
  fillLight.position.set(-4, 0, 2);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xc084fc, 0.6, 10);
  rimLight.position.set(0, -1, -3);
  scene.add(rimLight);

  // ── Avatar Group ──
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // Skin material
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x3d1f10,
    roughness: 0.55,
    metalness: 0.05,
  });

  // Dark hoodie material
  const hoodieMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.0,
  });

  // ── Head ──
  const headGeo = new THREE.SphereGeometry(1.0, 64, 64);
  const pos = headGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    // jaw + chin narrowing
    if (y < 0.2) { x *= 1.0 - Math.max(0, -y * 0.4); z *= 1.0 - Math.max(0, -y * 0.3); }
    // brow ridge
    if (y > 0.3 && y < 0.65 && z > 0) { pos.setZ(i, z + 0.05); }
    // cheekbones
    if (y > -0.3 && y < 0.2 && Math.abs(x) > 0.5) { pos.setZ(i, z * 1.05); }
    // narrow nose bridge
    if (y > -0.2 && y < 0.3 && Math.abs(x) < 0.15) { pos.setX(i, x * 0.7); }
    // top of head slightly flatter
    if (y > 0.8) { pos.setY(i, y * 0.9 + 0.1); }
    pos.setXYZ(i, x, y, z);
  }
  headGeo.computeVertexNormals();
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.3;
  avatarGroup.add(head);

  // ── Neck ──
  const neckGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.6, 32);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = -0.75;
  avatarGroup.add(neck);

  // ── Shoulders / Hoodie ──
  const shoulderGeo = new THREE.SphereGeometry(1.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const shoulders = new THREE.Mesh(shoulderGeo, hoodieMat);
  shoulders.position.y = -1.1;
  avatarGroup.add(shoulders);

  // Hoodie hood (behind head)
  const hoodGeo = new THREE.SphereGeometry(1.15, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const hood = new THREE.Mesh(hoodGeo, hoodieMat);
  hood.position.set(0, 0.2, -0.15);
  hood.rotation.x = 0.2;
  avatarGroup.add(hood);

  // ── Blonde Dreads ──
  const dreadMat = new THREE.MeshStandardMaterial({
    color: 0xf5c842,   // golden blonde
    roughness: 0.75,
    metalness: 0.05,
  });
  const darkDreadMat = new THREE.MeshStandardMaterial({
    color: 0xc8a028,   // darker blonde variant
    roughness: 0.8,
    metalness: 0.02,
  });

  // Dreadlock positions — ring around the head, pointing outward + down
  const dreadData = [
    // [angle deg, y_start, length, radius_mult, dark]
    [0,   0.85, 1.6, 0.09, false],
    [22,  0.9,  1.5, 0.08, false],
    [45,  0.9,  1.4, 0.085, false],
    [67,  0.85, 1.5, 0.08, false],
    [90,  0.8,  1.55, 0.09, true],
    [112, 0.85, 1.45, 0.08, false],
    [135, 0.88, 1.35, 0.085, false],
    [157, 0.9,  1.5, 0.08, true],
    [180, 0.85, 1.6, 0.09, false],
    [202, 0.9,  1.5, 0.08, false],
    [225, 0.88, 1.4, 0.085, true],
    [247, 0.85, 1.5, 0.08, false],
    [270, 0.8,  1.55, 0.09, false],
    [292, 0.85, 1.45, 0.08, true],
    [315, 0.88, 1.35, 0.085, false],
    [337, 0.9,  1.5, 0.08, false],
    // second row
    [10,  0.6,  1.3, 0.07, false],
    [50,  0.6,  1.25, 0.07, true],
    [80,  0.6,  1.3, 0.07, false],
    [100, 0.6,  1.28, 0.07, false],
    [130, 0.6,  1.3, 0.07, true],
    [160, 0.6,  1.25, 0.07, false],
    [190, 0.6,  1.3, 0.07, false],
    [220, 0.6,  1.28, 0.07, true],
    [260, 0.6,  1.3, 0.07, false],
    [290, 0.6,  1.25, 0.07, false],
    [320, 0.6,  1.3, 0.07, true],
    [350, 0.6,  1.28, 0.07, false],
    // third row (shorter, top)
    [0,   1.05, 0.9,  0.06, false],
    [40,  1.05, 0.85, 0.06, true],
    [80,  1.05, 0.9,  0.06, false],
    [120, 1.05, 0.88, 0.06, false],
    [160, 1.05, 0.85, 0.06, true],
    [200, 1.05, 0.9,  0.06, false],
    [240, 1.05, 0.88, 0.06, false],
    [280, 1.05, 0.85, 0.06, true],
    [320, 1.05, 0.9,  0.06, false],
    [360, 1.05, 0.88, 0.06, false],
  ];

  const matChoices = [dreadMat, darkDreadMat];

  for (const [angleDeg, yStart, length, rMult, dark] of dreadData) {
    const rad = (angleDeg * Math.PI) / 180;
    const r = 1.02 + (1.0 - yStart) * 0.05; // slightly wider at lower y
    const dx = Math.sin(rad) * r;
    const dz = Math.cos(rad) * r;

    // Slight random variation
    const jitter = 0.03;
    const rx = dx + (Math.random() - 0.5) * jitter;
    const rz = dz + (Math.random() - 0.5) * jitter;
    const ry = yStart + (Math.random() - 0.5) * 0.05;

    const dreadGeo = new THREE.CylinderGeometry(0.04 * rMult * 60, 0.055 * rMult * 60, length, 8);
    const dread = new THREE.Mesh(dreadGeo, matChoices[dark ? 1 : 0]);
    dread.position.set(rx * 0.95, ry - length * 0.4, rz * 0.95);

    // Tilt dreads outward and down
    const tiltZ = -Math.cos(rad) * 0.3;
    const tiltX = Math.sin(rad) * 0.3;
    dread.rotation.x = 0.15 + tiltX;
    dread.rotation.z = tiltZ;

    avatarGroup.add(dread);
  }

  // ── Ears ──
  for (const side of [-1, 1]) {
    const earGeo = new THREE.SphereGeometry(0.14, 16, 16);
    earGeo.scale(0.6, 1.2, 0.5);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(side * 0.95, 0.2, 0.05);
    avatarGroup.add(ear);
  }

  // ── Floor glow ring ──
  const ringGeo = new THREE.TorusGeometry(1.1, 0.025, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.6;
  avatarGroup.add(ring);

  // Second ring
  const ring2Geo = new THREE.TorusGeometry(1.4, 0.015, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = -1.6;
  avatarGroup.add(ring2);

  // ── Glow orb behind ──
  const orbGeo = new THREE.SphereGeometry(2.0, 32, 32);
  const orbMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(0, 0, -1.5);
  avatarGroup.add(orb);

  // ── Mouse tracking ──
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    canvas.width = nw; canvas.height = nh;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  });

  // ── Animate ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    avatarGroup.rotation.y = currentX * 0.35;
    avatarGroup.rotation.x = -currentY * 0.2;
    avatarGroup.position.y = Math.sin(t * 0.8) * 0.05;

    // Pulse rings
    ring.material.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;
    ring2.material.opacity = 0.2 + Math.sin(t * 1.5 + 1) * 0.15;

    renderer.render(scene, camera);
  }
  animate();
})();

// ══════════════════════════════════════════════════════════════════
// 3. FULL PAGE 3D OVERLAY (floating icosahedron)
// ══════════════════════════════════════════════════════════════════
(function initFull3DScene() {
  const canvas = document.getElementById('logo-canvas');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.z = 6;
  const iGeo = new THREE.IcosahedronGeometry(0.8, 1);
  const iMat = new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.25, wireframe: true });
  const ico = new THREE.Mesh(iGeo, iMat);
  scene.add(ico);
  const iGeo2 = new THREE.IcosahedronGeometry(0.55, 0);
  const iMat2 = new THREE.MeshPhysicalMaterial({ color: 0xc084fc, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.12 });
  scene.add(new THREE.Mesh(iGeo2, iMat2));
  const orbitCount = 60;
  const orbitPos = new Float32Array(orbitCount*3);
  for(let i=0;i<orbitCount;i++){
    const t2 = Math.random()*Math.PI*2, p = Math.random()*Math.PI, r = 1.5+Math.random()*1.5;
    orbitPos[i*3]=r*Math.sin(p)*Math.cos(t2);
    orbitPos[i*3+1]=r*Math.sin(p)*Math.sin(t2);
    orbitPos[i*3+2]=r*Math.cos(p);
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
  const orbitMat = new THREE.PointsMaterial({ size: 0.025, color: 0xc084fc, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(orbitGeo, orbitMat));
  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove', e => { mx=(e.clientX/window.innerWidth-0.5); my=-(e.clientY/window.innerHeight-0.5); });
  window.addEventListener('resize', () => { camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
  let t=0;
  function animate() {
    requestAnimationFrame(animate);
    t+=0.005;
    tx+=(mx-tx)*0.03; ty+=(my-ty)*0.03;
    camera.position.x+=(tx*1.5-camera.position.x)*0.05;
    camera.position.y+=(ty*1.5-camera.position.y)*0.05;
    camera.lookAt(0,0,0);
    ico.rotation.x+=0.005; ico.rotation.y+=0.008;
    iMat.opacity=0.15+Math.sin(t*2)*0.1;
    renderer.render(scene, camera);
  }
  animate();
})();

// ══════════════════════════════════════════════════════════════════
// 4. CUSTOM CURSOR
// ══════════════════════════════════════════════════════════════════
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  let cx=0,cy=0,fx=0,fy=0;
  document.addEventListener('mousemove', e => { cx=e.clientX; cy=e.clientY; });
  if ('ontouchstart' in window) { cursor.style.display='none'; follower.style.display='none'; return; }
  function a() { fx+=(cx-fx)*0.15; fy+=(cy-fy)*0.15; follower.style.left=fx+'px'; follower.style.top=fy+'px'; cursor.style.left=cx+'px'; cursor.style.top=cy+'px'; requestAnimationFrame(a); }
  a();
  document.querySelectorAll('a,button,[data-hover],[data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
})();

// ══════════════════════════════════════════════════════════════════
// 5. NAV & MENU
// ══════════════════════════════════════════════════════════════════
(function initNav() {
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY>60));
})();
(function initMobileMenu() {
  const toggle = document.getElementById('menuToggle'), menu = document.getElementById('mobileMenu');
  toggle?.addEventListener('click', () => { toggle.classList.toggle('active'); menu?.classList.toggle('open'); });
  menu?.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => { toggle?.classList.remove('active'); menu?.classList.remove('open'); }));
})();

// ══════════════════════════════════════════════════════════════════
// 6. GSAP SCROLL REVEALS
// ══════════════════════════════════════════════════════════════════
(function initScrollAnimations() {
  document.querySelectorAll('[data-section]').forEach(section => {
    const children = section.querySelectorAll('.section-title,.section-sub,.section-label,.album-tile,.about-text,.about-map,.about-pillars,.connect-card,.tour-card,.signup-left,.signup-right');
    gsap.fromTo(children, { opacity:0, y:40 }, {
      opacity:1, y:0, duration:0.8, stagger:0.08, ease:'power2.out',
      scrollTrigger: { trigger:section, start:'top 82%', toggleActions:'play none none reverse' }
    });
  });
})();

// ══════════════════════════════════════════════════════════════════
// 7. 3D TILT
// ══════════════════════════════════════════════════════════════════
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx=((e.clientX-r.left)/r.width-0.5)*2, dy=-((e.clientY-r.top)/r.height-0.5)*2;
      el.style.transform=`perspective(1000px) rotateX(${dy*6}deg) rotateY(${dx*6}deg) translateZ(8px)`;
      el.style.transition='none';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform='perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      el.style.transition='transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
  });
})();

// ══════════════════════════════════════════════════════════════════
// 8. COUNTER ANIMATION
// ══════════════════════════════════════════════════════════════════
(function initCounters() {
  const counters = document.querySelectorAll('.h-stat-num[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = parseInt(entry.target.dataset.count), duration = 2500, start = performance.now();
      function update(now) {
        const p = Math.min((now-start)/duration,1);
        entry.target.textContent = Math.floor((1-Math.pow(1-p,3))*target).toLocaleString();
        if(p<1) requestAnimationFrame(update); else entry.target.textContent=target.toLocaleString();
      }
      requestAnimationFrame(update);
      obs.unobserve(entry.target);
    });
  }, { threshold:0.5 });
  counters.forEach(c => obs.observe(c));
})();

// ══════════════════════════════════════════════════════════════════
// 9. CITY LIST
// ══════════════════════════════════════════════════════════════════
(function initCities() {
  const list = document.getElementById('cityList');
  if (list) list.innerHTML = CITIES.map(c => `<div class="city-row"><span class="city-name">${c.name}, ${c.country}</span><span class="city-count">${c.listeners.toLocaleString()}</span></div>`).join('');
})();

// ══════════════════════════════════════════════════════════════════
// 10. FORM
// ══════════════════════════════════════════════════════════════════
(function initForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const label = btn?.querySelector('.btn-label'), spinner = btn?.querySelector('.btn-spinner');
    if(label) label.style.display='none'; if(spinner) spinner.style.display='flex';
    const email = form.querySelector('[name="email"]').value.trim();
    const name = form.querySelector('[name="name"]').value.trim();
    const interest = form.querySelector('[name="interest"]')?.value;
    try { await fetch('https://buttondown.email/api/emails/embed-subscribe/mystik', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,name,tags:interest?[interest]:[]}) }); } catch(_) {}
    form.style.display='none';
    const s = document.getElementById('signupSuccess');
    if(s) { s.style.display='block'; gsap.fromTo(s,{opacity:0,y:20},{opacity:1,y:0,duration:0.6}); }
  });
})();

// ══════════════════════════════════════════════════════════════════
// 11. MARQUEE + SCROLL CUE + PARALLAX BLOBS + SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════════
(function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  gsap.to(track, { x: -track.scrollWidth/2, duration: 40, ease: 'none', repeat: -1 });
})();
(function initScrollCue() {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;
  window.addEventListener('scroll', () => { cue.style.opacity = window.scrollY>200?'0':'1'; cue.style.transition='opacity 0.5s'; });
})();
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const t = document.querySelector(this.getAttribute('href'));
      if(t) t.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
})();
(function initBlobParallax() {
  const blobs = document.querySelectorAll('.light-blob');
  let mx=0,my=0;
  document.addEventListener('mousemove', e => { mx=(e.clientX/window.innerWidth-0.5)*2; my=(e.clientY/window.innerHeight-0.5)*2; });
  function a() { blobs.forEach(b => { const s=parseFloat(b.dataset.speed)||0.3; b.style.transform=`translate(${mx*30*s}px,${my*30*s}px)`; }); requestAnimationFrame(a); }
  a();
})();

console.log('%c MYSTIK ', 'background:#7c3aed;color:white;font-size:20px;font-weight:bold;padding:8px 20px;border-radius:4px');
console.log('%cMemento Mori — Remember death. Make music that outlives you.','color:#c084fc');
