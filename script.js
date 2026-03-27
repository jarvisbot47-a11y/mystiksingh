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
(function init3DAvatar() {
  const canvas = document.getElementById('hero-logo-canvas');
  if (!canvas || !window.THREE) return;
  const container = document.getElementById('heroLogo3D');
  if (!container) return;

  const w = container.clientWidth;
  const h = container.clientHeight;
  canvas.width = w; canvas.height = h;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
  camera.position.z = 5;

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x7c3aed, 0.4);
  scene.add(ambientLight);
  const spotLight = new THREE.SpotLight(0x4fc3f7, 2.0, 20, Math.PI/6, 0.5, 1);
  spotLight.position.set(2, 3, 4);
  scene.add(spotLight);
  const blueLight = new THREE.PointLight(0x1565c0, 1.5, 15);
  blueLight.position.set(-3, -1, 2);
  scene.add(blueLight);
  const rimLight = new THREE.PointLight(0xc084fc, 0.8, 10);
  rimLight.position.set(0, 2, -3);
  scene.add(rimLight);

  // ── Avatar Group ──
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // Load all concert photos as potential textures
  const textureLoader = new THREE.TextureLoader();
  const photoPaths = [
    'concert-1.jpg','concert-2.jpg','concert-3.jpg','concert-4.jpg',
    'concert-5.jpg','concert-6.jpg','concert-7.jpg','concert-8.jpg',
    'concert-9.jpg','concert-10.jpg','concert-11.jpg','concert-12.jpg','concert-13.jpg'
  ];
  // Concert photos are in the concert-photos/ folder (relative to site root)
  const textureBase = 'concert-photos/';

  // Build 3D head from sphere geometry (stylized bust)
  const headRadius = 1.2;
  const headGeo = new THREE.SphereGeometry(headRadius, 64, 64);
  // Distort to more head-like shape
  const headPositions = headGeo.attributes.position;
  for (let i = 0; i < headPositions.count; i++) {
    let x = headPositions.getX(i);
    let y = headPositions.getY(i);
    let z = headPositions.getZ(i);
    // Stretch vertically slightly
    y *= 1.15;
    // Flatten sides slightly for jaw
    if (y < 0) {
      x *= 0.88;
      z *= 0.88;
    }
    // Add brow ridge
    if (y > 0.4 && y < 0.9 && z > 0) {
      z += 0.08;
    }
    headPositions.setXYZ(i, x, y, z);
  }
  headGeo.computeVertexNormals();

  // Load primary texture (front-facing concert photo)
  let primaryTex = null;
  let loadedCount = 0;
  const totalTex = 1;

  textureLoader.load(
    textureBase + 'concert-1.jpg',
    (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBAFormat;
      primaryTex = tex;
      loadedCount++;
      applyTexture();
    },
    undefined,
    () => {
      // Fallback — no texture
      loadedCount++;
      console.warn('Avatar texture failed to load — using procedural material');
    }
  );

  function applyTexture() {
    if (!primaryTex) return;

    // Create a custom shader material for the head
    const headMat = new THREE.MeshPhysicalMaterial({
      map: primaryTex,
      transparent: true,
      opacity: 0.95,
      roughness: 0.35,
      metalness: 0.05,
      envMapIntensity: 0.5,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.1;
    avatarGroup.add(headMesh);

    // Add shoulders/body hint
    const bodyGeo = new THREE.CylinderGeometry(1.0, 0.6, 1.4, 32, 1, false, 0, Math.PI);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: primaryTex,
      transparent: true,
      opacity: 0.6,
      roughness: 0.5,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = -1.4;
    bodyMesh.rotation.x = Math.PI / 2;
    avatarGroup.add(bodyMesh);

    // Spotlight cone (visible light beam above head)
    const coneGeo = new THREE.ConeGeometry(0.8, 3, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x1565c0,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 2.2;
    avatarGroup.add(cone);

    // Floor glow
    const floorGeo = new THREE.CircleGeometry(1.5, 64);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x1565c0,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.1;
    avatarGroup.add(floor);

    // Glow ring around base
    const ringGeo = new THREE.TorusGeometry(1.2, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -2.08;
    avatarGroup.add(ring);

    // Second ring
    const ring2Geo = new THREE.TorusGeometry(1.5, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -2.08;
    avatarGroup.add(ring2);
  }

  // ─── Mouse / Gyroscope tracking ───
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  let gyroEnabled = false;

  // Mouse control
  document.addEventListener('mousemove', (e) => {
    if (gyroEnabled) return;
    const dx = (e.clientX / window.innerWidth - 0.5) * 2;
    const dy = (e.clientY / window.innerHeight - 0.5) * 2;
    targetRotY = dx * 0.6;
    targetRotX = -dy * 0.4;
  });

  // Gyroscope / device orientation (mobile)
  function enableGyro() {
    if (gyroEnabled) return;
    gyroEnabled = true;
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          targetRotY = (e.gamma / 45) * 0.6;   // left-right tilt
          targetRotX = -((e.beta - 45) / 45) * 0.4; // forward-back tilt
        }
      });
    }
  }

  // Enable gyro on touch (mobile)
  canvas.addEventListener('touchstart', enableGyro, { once: true });
  canvas.addEventListener('click', enableGyro, { once: true });

  // ─── Mouse parallax on avatar group ──
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w; canvas.height = h;
    renderer.setSize(w, h);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  });

  // ─── Animation loop ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Smooth head tracking
    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;

    if (avatarGroup.children.length > 0) {
      avatarGroup.rotation.x = currentRotX;
      avatarGroup.rotation.y = currentRotY;

      // Gentle floating
      avatarGroup.position.y = Math.sin(t * 0.8) * 0.08;
    }

    // Pulse rings
    scene.traverse((obj) => {
      if (obj.geometry && obj.geometry.type === 'TorusGeometry') {
        if (obj.material && obj.material.opacity !== undefined) {
          if (obj.geometry.parameters && obj.geometry.parameters.tube === 0.03) {
            obj.material.opacity = 0.35 + Math.sin(t * 2) * 0.15;
          }
        }
      }
    });

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
