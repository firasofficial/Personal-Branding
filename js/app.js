/**
 * app.js
 * Main application orchestrator for Muhammad Firas's Antigravity Personal Branding Website
 */

// Global Toast Dispatcher
window.showToast = function (message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const icon = type === 'success' ? 'âœ“' : 'âœ¦';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
};

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. SOUND TOGGLE BUTTON (HEADER)
  // --------------------------------------------------------------------------
  const soundBtn = document.getElementById('sound-btn');
  if (soundBtn && window.soundEngine) {
    const onIcon = soundBtn.querySelector('.sound-on-icon');
    const offIcon = soundBtn.querySelector('.sound-off-icon');

    const updateIcons = (isMuted) => {
      if (isMuted) {
        onIcon.classList.add('hidden');
        offIcon.classList.remove('hidden');
      } else {
        onIcon.classList.remove('hidden');
        offIcon.classList.add('hidden');
      }
    };

    updateIcons(window.soundEngine.isMuted);

    soundBtn.addEventListener('click', () => {
      const muted = window.soundEngine.toggleMute();
      updateIcons(muted);
      if (!muted) window.soundEngine.playClick();
      window.showToast(muted ? 'Sound effects disabled' : 'Futuristic sound effects enabled', 'info');
    });
  }

  // --------------------------------------------------------------------------
  // 2. STICKY HEADER SCROLL DETECTION & ACTIVE LINK HIGHLIGHT
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // ScrollSpy for Active Nav Link
    let currentSection = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --------------------------------------------------------------------------
  // 3. MOBILE MENU TOGGLE
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      if (window.soundEngine) window.soundEngine.playClick();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. CUSTOM CURSOR & AMBIENT CURSOR GLOW
  // --------------------------------------------------------------------------
  const cursor = document.getElementById('custom-cursor');
  const cursorGlow = document.getElementById('cursor-glow');

  if (cursor && cursorGlow && !window.matchMedia('(pointer: coarse)').matches) {
    let mouseX = -100, mouseY = -100;
    let glowX = -100, glowY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    // Lerp smoothing for glow
    const renderGlow = () => {
      glowX += (mouseX - glowX) * 0.18;
      glowY += (mouseY - glowY) * 0.18;
      cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderGlow);
    };
    renderGlow();

    // Hover triggers
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .project-card, .floating-badge, .skill-category-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        if (window.soundEngine && el.tagName === 'BUTTON') {
          window.soundEngine.playHover();
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. DYNAMIC HERO FOCUS TICKER (TYPING EFFECT)
  // --------------------------------------------------------------------------
  const tickerEl = document.getElementById('ticker-text');
  if (tickerEl) {
    const specializations = [
      'Spatial Computing & XR',
      'Design Systems at Scale',
      'Zero-G Micro-Interactions',
      'Generative AI Interfaces',
      'Creative 3D Computation'
    ];

    let specIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeDelay = 110;

    const typeTicker = () => {
      const currentWord = specializations[specIdx];

      if (isDeleting) {
        tickerEl.textContent = currentWord.substring(0, charIdx - 1);
        charIdx--;
        typeDelay = 45;
      } else {
        tickerEl.textContent = currentWord.substring(0, charIdx + 1);
        charIdx++;
        typeDelay = 100;
      }

      if (!isDeleting && charIdx === currentWord.length) {
        isDeleting = true;
        typeDelay = 2200; // Pause at full word
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        specIdx = (specIdx + 1) % specializations.length;
        typeDelay = 400; // Pause before new word
      }

      setTimeout(typeTicker, typeDelay);
    };

    setTimeout(typeTicker, 800);
  }

  // --------------------------------------------------------------------------
  // 6. QUICK COPY EMAIL BUTTON
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('quick-copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.dataset.email || 'firas.design@nexus.io';
      try {
        await navigator.clipboard.writeText(email);
        if (window.soundEngine) window.soundEngine.playSuccess();
        window.showToast(`Copied ${email} to clipboard!`, 'success');
      } catch (err) {
        // Fallback for older browsers
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        if (window.soundEngine) window.soundEngine.playSuccess();
        window.showToast(`Copied ${email} to clipboard!`, 'success');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. PORTFOLIO FILTERING
  // --------------------------------------------------------------------------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      if (window.soundEngine) window.soundEngine.playClick();

      projectCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'float 0.4s ease-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. RICH CASE STUDY MODALS DATA & EVENT HANDLER
  // --------------------------------------------------------------------------
  const caseStudiesData = {
    chronos: {
      title: 'Chronos Space OS â€” Spatial Design System for VisionOS & MR',
      category: 'Spatial UI â€¢ VisionOS â€¢ Three.js',
      client: 'Apex Spatial Tech',
      timeline: '6 Months (2025 â€” 2026)',
      role: 'Lead Spatial Designer & Systems Architect',
      impact: '+180% Navigation Speed',
      image: 'assets/chronos.jpg',
      overview: 'Chronos Space OS is a zero-latency spatial interface designed for orbital telemetry operators and mission specialists operating in mixed reality environments. The project required pioneering a new visual language for multi-window depth layering, gaze-and-pinch spatial ergonomics, and ambient lighting awareness.',
      problem: 'Existing aerospace and telemetry dashboards relied on rigid 2D flat panels with dense numeric tables. When ported to spatial headsets, operators suffered severe visual fatigue and spatial disorientation within 35 minutes.',
      solution: 'Designed an organic zero-gravity windowing architecture where telemetry widgets naturally dock in peripheral orbital rings around the operator. Developed custom glassmorphic shaders that dynamically shift blur opacity depending on the userâ€™s gaze point, preserving focus while reducing cognitive load by 62%.',
      kpis: [
        { val: '+180%', label: 'Task completion efficiency in high-pressure simulations' },
        { val: '-62%', label: 'Visual fatigue score measured via eye-tracking sensors' },
        { val: '120 FPS', label: 'Consistent framerate on standalone VisionOS hardware' }
      ],
      features: [
        'Volumetric Depth Hierarchy: Dynamic Z-index management preventing window overlap clashes in 3D space.',
        'Adaptive Specular Glare: Real-time virtual lighting engine aligning digital UI panels with physical ambient room lighting.',
        'Spatial Haptic Audio: Directional audio cues reinforcing selection without requiring screen glance verification.'
      ]
    },
    aether: {
      title: 'Aether Pay â€” Next-Gen Biometric Neo-Bank & Wealth Suite',
      category: 'Fintech â€¢ Design Systems â€¢ Biometrics',
      client: 'Aether Capital Group',
      timeline: '8 Months (2025)',
      role: 'Principal Product Designer',
      impact: '$1.4B+ Processed',
      image: 'assets/aether.jpg',
      overview: 'Aether Pay is an ultra-high-end private banking application engineered for high-net-worth investors and digital asset traders. It merges frictionless biometric security with real-time portfolio simulation and dynamic card interactions.',
      problem: 'High-net-worth clients demanded institutional-grade security without the cumbersome friction of multi-step authenticator apps, slow confirmations, and outdated banking interfaces.',
      solution: 'Constructed an instant biometric ring authorization framework paired with hardware-accelerated 3D card tilt and real-time portfolio charts. Every transaction feels tangible through weightless spring micro-animations and instantaneous visual feedback.',
      kpis: [
        { val: '$1.4B+', label: 'Volume processed in first 6 months post-launch' },
        { val: '0.28s', label: 'Average time to complete multi-currency settlements' },
        { val: '4.95 â˜…', label: 'App Store rating with over 85,000 user reviews' }
      ],
      features: [
        '3D Specular Titanium Card: Realistic real-time physics tilt reflecting the userâ€™s physical device orientation.',
        'Predictive Liquidity Wave: Fluid generative curve visualizing forecasted cash flow up to 90 days ahead.',
        'Zero-Latency Token Engine: Tokenized multi-platform design architecture powering iOS, Android, and Web.'
      ]
    },
    vortex: {
      title: 'Vortex Creative Suite â€” Generative 3D Simulation Software',
      category: 'Generative AI â€¢ 3D Studio â€¢ Desktop UI',
      client: 'Vortex Engine Labs',
      timeline: '7 Months (2025)',
      role: 'Lead UX/UI Architect & Creative Technologist',
      impact: '0.4s Render Latency',
      image: 'assets/vortex.jpg',
      overview: 'Vortex is a desktop generative 3D simulation suite empowering digital artists and technical directors to simulate fluids, chrome reflections, and particle dynamics directly in real-time viewports.',
      problem: 'Traditional 3D applications (Blender, Houdini) present steep learning curves with intimidating menus containing hundreds of obscure numeric fields, slowing down creative experimentation.',
      solution: 'Invented an anti-gravity node manipulation canvas where users connect procedural fluid operators through fluid drag-and-drop mechanics. Integrated contextual AI node suggestions that predict artist intent.',
      kpis: [
        { val: '0.4s', label: 'Real-time viewport preview latency for fluid physics' },
        { val: '4.2x', label: 'Increase in first-time user workflow completion' },
        { val: 'Red Dot', label: 'Best of the Best Design Concept Award 2025' }
      ],
      features: [
        'Curved Ultra-Wide Workspace: Modular inspector panels designed specifically for high-DPI curved displays.',
        'Procedural Node Canvas: Interactive zero-G physics nodes with instant collision and link snapping.',
        'Dark Obsidian Studio Aesthetic: High-contrast typography and subtle violet glow reducing eye strain during 10+ hour sessions.'
      ]
    },
    pulse: {
      title: 'Pulse Ambient Health â€” Predictive Clinical Telemetry Platform',
      category: 'Healthcare AI â€¢ Ambient UX â€¢ Data Visualization',
      client: 'Pulse Intelligence',
      timeline: '5 Months (2024)',
      role: 'Staff Product Designer & Systems Lead',
      impact: '99.4% Neural Sync',
      image: 'assets/chronos.jpg',
      overview: 'Pulse is an ambient clinical intelligence platform deployed across intensive care units and specialized clinics. It interprets complex patient telemetry and surfaces critical alerts without cognitive overload.',
      problem: 'ICU doctors and nursing staff suffer from alarm fatigue due to constant false alarms and noisy audio monitors, leading to burnout and delayed critical interventions.',
      solution: 'Replaced screaming alarms with a color-coded ambient visual wave system that gently shifts from tranquil deep cyan to urgent electric amber only when true physiological deviations are detected by predictive AI models.',
      kpis: [
        { val: '-74%', label: 'Reduction in false positive alert interruptions' },
        { val: '99.4%', label: 'Predictive precision in early sepsis detection' },
        { val: '100%', label: 'Adoption rate across 18 partner regional hospitals' }
      ],
      features: [
        'Harmonic Vital Waveform: Calming SVG waveform visualizer providing holistic patient stability checks at a glance.',
        'High-Contrast Night Mode: Pure obsidian palette engineered for low-light clinical environments.',
        'WCAG AAA Compliance: Tested rigorously with color-blind clinicians to guarantee total safety.'
      ]
    }
  };

  const modalBackdrop = document.getElementById('case-study-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const openCaseStudy = (projId) => {
    const data = caseStudiesData[projId];
    if (!data || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-hero-banner">
        <img src="${data.image}" alt="${data.title}" class="modal-hero-img">
      </div>

      <div class="modal-meta-grid">
        <div class="modal-meta-col">
          <span>Client / Entity</span>
          <span>${data.client}</span>
        </div>
        <div class="modal-meta-col">
          <span>Timeline</span>
          <span>${data.timeline}</span>
        </div>
        <div class="modal-meta-col">
          <span>My Role</span>
          <span>${data.role}</span>
        </div>
        <div class="modal-meta-col">
          <span>Key Outcome</span>
          <span>${data.impact}</span>
        </div>
      </div>

      <div class="modal-section-block">
        <div class="section-tag">${data.category}</div>
        <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; margin: 12px 0 16px;">
          ${data.title}
        </h2>
        <p style="font-size: 1.05rem; line-height: 1.8;">${data.overview}</p>
      </div>

      <div class="modal-section-block">
        <h3>The Core Problem</h3>
        <p>${data.problem}</p>
      </div>

      <div class="modal-section-block">
        <h3>The Design & Architectural Breakthrough</h3>
        <p>${data.solution}</p>
      </div>

      <div class="modal-kpi-grid">
        ${data.kpis.map(kpi => `
          <div class="kpi-card">
            <div class="kpi-number">${kpi.val}</div>
            <div class="kpi-label">${kpi.label}</div>
          </div>
        `).join('')}
      </div>

      <div class="modal-section-block">
        <h3>Key System Deliverables</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
          ${data.features.map(feat => `
            <li style="display: flex; gap: 10px; align-items: flex-start; color: var(--text-muted); font-size: 0.95rem;">
              <span style="color: var(--accent-primary); font-size: 1.1rem; line-height: 1.2;">âœ¦</span>
              <span>${feat}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display: flex; gap: 16px; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-glass);">
        <a href="#contact" class="btn btn-primary" onclick="document.getElementById('modal-close-btn').click();">
          <span>Request Confidential Walkthrough</span>
        </a>
        <button class="btn btn-outline" onclick="window.showToast('Prototype credentials will be transmitted via email.', 'info')">
          <span>Inspect Prototype Specs</span>
        </button>
      </div>
    `;

    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (window.soundEngine) window.soundEngine.playPop();
  };

  const closeCaseStudy = () => {
    modalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  };

  // Card click triggers
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projId = card.dataset.projectId;
      openCaseStudy(projId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCaseStudy);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeCaseStudy();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
        closeCaseStudy();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. TESTIMONIAL CAROUSEL
  // --------------------------------------------------------------------------
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  if (track && dots.length > 0) {
    let currentIdx = 0;
    const totalSlides = dots.length;
    let autoplayTimer = null;

    const goToSlide = (idx) => {
      currentIdx = (idx + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentIdx * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIdx);
      });
    };

    const nextSlide = () => {
      goToSlide(currentIdx + 1);
    };

    const prevSlide = () => {
      goToSlide(currentIdx - 1);
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        if (window.soundEngine) window.soundEngine.playClick();
        resetAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        if (window.soundEngine) window.soundEngine.playClick();
        resetAutoplay();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        goToSlide(idx);
        if (window.soundEngine) window.soundEngine.playClick();
        resetAutoplay();
      });
    });

    const startAutoplay = () => {
      autoplayTimer = setInterval(nextSlide, 6000);
    };

    const resetAutoplay = () => {
      clearInterval(autoplayTimer);
      startAutoplay();
    };

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    track.parentElement.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  // --------------------------------------------------------------------------
  // 10. REAL-TIME TIMEZONE CLOCK
  // --------------------------------------------------------------------------
  const tzClockEl = document.getElementById('tz-live-time');
  const updateTimezoneClock = () => {
    if (!tzClockEl) return;
    try {
      const now = new Date();
      // Target Asia/Jakarta time (UTC+7)
      const options = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
      tzClockEl.textContent = `${timeStr} (WIB) â€” Active Sync Window`;
    } catch (e) {
      tzClockEl.textContent = `11:45 AM (WIB) â€” Available for Sync`;
    }
  };
  setInterval(updateTimezoneClock, 1000);
  updateTimezoneClock();

  // --------------------------------------------------------------------------
  // 11. INTERACTIVE CONTACT FORM SUBMISSION
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const successBanner = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const originalText = submitBtn.innerHTML;

      // Loading State
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Transmitting Quantum Packet...</span>`;
      if (window.soundEngine) window.soundEngine.playClick();

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        contactForm.reset();

        if (successBanner) {
          successBanner.classList.remove('hidden');
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (window.soundEngine) window.soundEngine.playSuccess();
        window.showToast('Transmission delivered to Muhammad Firasâ€™s inbox.', 'success');
      }, 1200);
    });
  }

});

