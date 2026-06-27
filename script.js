/* ============================================
   SUJAL VERMA — 3D PORTFOLIO SCRIPTS
   Three.js Immersive Experience
   ============================================ */

// ——— Three.js 3D Scene ———
(function initThreeScene() {
  const container = document.getElementById('three-canvas');
  if (!container || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // === Colors from the design system ===
  const accentCyan = new THREE.Color(0x00d4ff);
  const accentPurple = new THREE.Color(0x7b61ff);
  const accentPink = new THREE.Color(0xff6b9d);
  const accentGreen = new THREE.Color(0x00e676);

  // === 3D Particle Field ===
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 300 : 800;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const particleSpeeds = [];

  const particleColors = [accentCyan, accentPurple, accentPink, accentGreen];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 60;

    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    colors[i3]     = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 3 + 0.5;

    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // === Connection Lines Between Nearby Particles ===
  const MAX_CONNECTIONS = isMobile ? 60 : 150;
  const CONNECTION_DISTANCE = 8;
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // === Floating Wireframe Geometry ===
  const floatingShapes = [];
  const shapeConfigs = [
    { geo: new THREE.IcosahedronGeometry(2.5, 0), pos: [-18, 12, -10], color: accentCyan, rotSpeed: { x: 0.003, y: 0.005, z: 0.002 } },
    { geo: new THREE.OctahedronGeometry(2, 0), pos: [20, -8, -15], color: accentPurple, rotSpeed: { x: 0.004, y: 0.003, z: 0.005 } },
    { geo: new THREE.TorusGeometry(2.5, 0.6, 8, 16), pos: [-15, -15, -8], color: accentPink, rotSpeed: { x: 0.005, y: 0.002, z: 0.003 } },
    { geo: new THREE.BoxGeometry(2.5, 2.5, 2.5), pos: [22, 15, -12], color: accentGreen, rotSpeed: { x: 0.002, y: 0.004, z: 0.006 } },
    { geo: new THREE.TetrahedronGeometry(2, 0), pos: [0, -20, -18], color: accentCyan, rotSpeed: { x: 0.006, y: 0.003, z: 0.004 } },
    { geo: new THREE.DodecahedronGeometry(1.8, 0), pos: [-25, 0, -14], color: accentPurple, rotSpeed: { x: 0.003, y: 0.006, z: 0.002 } },
    { geo: new THREE.TorusKnotGeometry(1.5, 0.4, 32, 8), pos: [25, 5, -20], color: accentPink, rotSpeed: { x: 0.002, y: 0.003, z: 0.005 } },
    { geo: new THREE.IcosahedronGeometry(1.5, 1), pos: [8, 22, -16], color: accentGreen, rotSpeed: { x: 0.004, y: 0.005, z: 0.001 } },
  ];

  shapeConfigs.forEach((cfg) => {
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const mesh = new THREE.Mesh(cfg.geo, mat);
    mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    mesh.userData.rotSpeed = cfg.rotSpeed;
    mesh.userData.originalY = cfg.pos[1];
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.floatAmplitude = 1 + Math.random() * 2;
    mesh.userData.floatSpeed = 0.3 + Math.random() * 0.4;
    scene.add(mesh);
    floatingShapes.push(mesh);
  });

  // === Ambient glow spheres (subtle) ===
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: accentCyan,
    transparent: true,
    opacity: 0.04,
  });
  const glowSphere1 = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), glowMaterial.clone());
  glowSphere1.position.set(-10, 10, -20);
  scene.add(glowSphere1);

  const glowSphere2 = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), glowMaterial.clone());
  glowSphere2.material.color = accentPurple;
  glowSphere2.position.set(12, -12, -25);
  scene.add(glowSphere2);

  // === Mouse & Scroll State ===
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;
  const targetMouse = { x: 0, y: 0 };

  document.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // === Resize Handler ===
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === Animation Loop ===
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    mouseX += (targetMouse.x - mouseX) * 0.05;
    mouseY += (targetMouse.y - mouseY) * 0.05;

    // Camera parallax — scroll + mouse
    const scrollOffset = scrollY * 0.005;
    camera.position.x = mouseX * 3;
    camera.position.y = -mouseY * 2 - scrollOffset;
    camera.lookAt(0, -scrollOffset, 0);

    // Rotate particle cloud gently
    particles.rotation.y = elapsed * 0.02 + mouseX * 0.1;
    particles.rotation.x = elapsed * 0.01 + mouseY * 0.05;

    // Update particle positions (drift)
    const posAttr = particleGeometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posAttr.array[i3]     += particleSpeeds[i].x;
      posAttr.array[i3 + 1] += particleSpeeds[i].y;
      posAttr.array[i3 + 2] += particleSpeeds[i].z;

      // Boundary wrap
      if (posAttr.array[i3] > 40) posAttr.array[i3] = -40;
      if (posAttr.array[i3] < -40) posAttr.array[i3] = 40;
      if (posAttr.array[i3 + 1] > 40) posAttr.array[i3 + 1] = -40;
      if (posAttr.array[i3 + 1] < -40) posAttr.array[i3 + 1] = 40;
      if (posAttr.array[i3 + 2] > 30) posAttr.array[i3 + 2] = -30;
      if (posAttr.array[i3 + 2] < -30) posAttr.array[i3 + 2] = 30;
    }
    posAttr.needsUpdate = true;

    // Update connection lines
    let lineCount = 0;
    const lPos = lineGeometry.attributes.position.array;
    const lCol = lineGeometry.attributes.color.array;
    const step = Math.max(1, Math.floor(PARTICLE_COUNT / 200));

    for (let a = 0; a < PARTICLE_COUNT && lineCount < MAX_CONNECTIONS; a += step) {
      for (let b = a + step; b < PARTICLE_COUNT && lineCount < MAX_CONNECTIONS; b += step) {
        const a3 = a * 3, b3 = b * 3;
        const dx = posAttr.array[a3] - posAttr.array[b3];
        const dy = posAttr.array[a3+1] - posAttr.array[b3+1];
        const dz = posAttr.array[a3+2] - posAttr.array[b3+2];
        const dist = dx*dx + dy*dy + dz*dz;

        if (dist < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
          const li = lineCount * 6;
          lPos[li]   = posAttr.array[a3];
          lPos[li+1] = posAttr.array[a3+1];
          lPos[li+2] = posAttr.array[a3+2];
          lPos[li+3] = posAttr.array[b3];
          lPos[li+4] = posAttr.array[b3+1];
          lPos[li+5] = posAttr.array[b3+2];

          // Use particle colors
          const colA3 = a * 3, colB3 = b * 3;
          lCol[li]   = colors[colA3];
          lCol[li+1] = colors[colA3+1];
          lCol[li+2] = colors[colA3+2];
          lCol[li+3] = colors[colB3];
          lCol[li+4] = colors[colB3+1];
          lCol[li+5] = colors[colB3+2];

          lineCount++;
        }
      }
    }
    lineGeometry.setDrawRange(0, lineCount * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    // Animate floating shapes
    floatingShapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeed.x;
      shape.rotation.y += shape.userData.rotSpeed.y;
      shape.rotation.z += shape.userData.rotSpeed.z;

      // Gentle floating bob
      shape.position.y = shape.userData.originalY +
        Math.sin(elapsed * shape.userData.floatSpeed + shape.userData.floatOffset) *
        shape.userData.floatAmplitude;

      // Subtle pulse opacity
      shape.material.opacity = 0.15 + Math.sin(elapsed * 0.8 + shape.userData.floatOffset) * 0.08;
    });

    // Animate glow spheres
    glowSphere1.scale.setScalar(1 + Math.sin(elapsed * 0.5) * 0.15);
    glowSphere2.scale.setScalar(1 + Math.cos(elapsed * 0.4) * 0.15);

    renderer.render(scene, camera);
  }

  animate();
})();

// ——— 3D Card Tilt Effect ———
(function initCardTilt() {
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
})();

// ——— Navbar scroll styling ———
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link
    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.dataset.section === current) {
        link.classList.add('active');
      }
    });
  });
})();

// ——— Mobile nav toggle ———
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
})();

// ——— Typing Effect ———
(function initTypingEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const strings = [
    'Web Developer',
    'DevOps Engineer',
    'React.js Developer',
    'Cloud Enthusiast',
    'CI/CD Specialist',
  ];

  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentString = strings[stringIndex];

    if (!isDeleting) {
      el.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80 + Math.random() * 40;

      if (charIndex === currentString.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
      }
    } else {
      el.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;

      if (charIndex === 0) {
        isDeleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        typingSpeed = 500; // Pause before next word
      }
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1500);
})();

// ——— Counter Animation ———
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  let counted = false;

  function animateCounters() {
    if (counted) return;
    const triggerY = window.innerHeight * 0.85;

    counters.forEach((counter) => {
      const rect = counter.getBoundingClientRect();
      if (rect.top < triggerY) {
        counted = true;
        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          counter.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.textContent = target;
          }
        }
        requestAnimationFrame(update);
      }
    });
  }

  window.addEventListener('scroll', animateCounters);
  animateCounters(); // Run on load too
})();

// ——— Scroll Reveal ———
(function initScrollReveal() {
  // Add 'reveal' class to items that should animate in
  const selectors = [
    '.skill-category',
    '.timeline-item',
    '.project-card',
    '.achievement-card',
    '.contact-card',
    '.about-text',
    '.about-terminal',
    '.contact-text',
    '.contact-main-btn',
  ];

  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

// ——— Smooth scroll for anchor links ———
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
