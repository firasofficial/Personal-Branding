/**
 * profile-editor.js
 * Live Profile Customizer Studio with real-time UI synchronization, theme switching, and local storage persistence
 */
class ProfileEditorStudio {
  constructor() {
    this.drawer = document.getElementById('customizer-drawer');
    this.openTriggers = [
      document.getElementById('studio-trigger-btn'),
      document.getElementById('mobile-editor-btn')
    ].filter(Boolean);
    this.closeBtn = document.getElementById('drawer-close-btn');

    // Input elements
    this.inputs = {
      name: document.getElementById('cust-name'),
      role: document.getElementById('cust-role'),
      status: document.getElementById('cust-status'),
      email: document.getElementById('cust-email'),
      bio: document.getElementById('cust-bio'),
      speed: document.getElementById('cust-physics-speed'),
      sound: document.getElementById('cust-sound-toggle')
    };

    // Buttons
    this.btnSave = document.getElementById('btn-save-profile');
    this.btnReset = document.getElementById('btn-reset-profile');
    this.btnExport = document.getElementById('btn-export-profile');
    this.paletteOptions = document.querySelectorAll('.palette-option');

    // Default configuration
    this.defaults = {
      name: 'Muhammad Firas',
      role: 'Senior Product Designer & Creative Technologist',
      status: 'Available for Select Q4/2026 Strategic Projects',
      email: 'firas.design@nexus.io',
      bio: 'Translating complex multi-dimensional systems into weightless, intuitive human experiences. Bridging high-craft aesthetic design with scalable frontend architecture and creative computation.',
      theme: 'cyber',
      physicsSpeed: 1.0,
      soundEnabled: true
    };

    this.init();
  }

  init() {
    this.loadSavedConfig();
    this.bindEvents();
  }

  bindEvents() {
    // Open Drawer
    this.openTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close Drawer
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        this.drawer &&
        !this.drawer.classList.contains('hidden') &&
        !this.drawer.contains(e.target) &&
        !this.openTriggers.some(b => b && b.contains(e.target))
      ) {
        this.closeDrawer();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.drawer.classList.contains('hidden')) {
        this.closeDrawer();
      }
    });

    // Real-time Input Sync
    if (this.inputs.name) {
      this.inputs.name.addEventListener('input', (e) => this.updateName(e.target.value));
    }
    if (this.inputs.role) {
      this.inputs.role.addEventListener('input', (e) => this.updateRole(e.target.value));
    }
    if (this.inputs.status) {
      this.inputs.status.addEventListener('input', (e) => this.updateStatus(e.target.value));
    }
    if (this.inputs.email) {
      this.inputs.email.addEventListener('input', (e) => this.updateEmail(e.target.value));
    }
    if (this.inputs.bio) {
      this.inputs.bio.addEventListener('input', (e) => this.updateBio(e.target.value));
    }

    // Theme Switcher
    this.paletteOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.themeVal;
        this.setTheme(theme);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Physics Speed
    if (this.inputs.speed) {
      this.inputs.speed.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        const label = document.getElementById('physics-speed-label');
        if (label) label.textContent = `${speed.toFixed(1)}x`;
        if (window.antigravityEngine) {
          window.antigravityEngine.speedMultiplier = speed;
        }
      });
    }

    // Sound toggle in drawer
    if (this.inputs.sound) {
      this.inputs.sound.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        if (window.soundEngine) {
          window.soundEngine.setMuted(!enabled);
        }
        this.syncSoundButtonUI(!enabled);
      });
    }

    // Save Button
    if (this.btnSave) {
      this.btnSave.addEventListener('click', () => {
        this.saveCurrentConfig();
        if (window.soundEngine) window.soundEngine.playSuccess();
        if (window.showToast) {
          window.showToast('Profile configuration saved to browser storage!', 'success');
        }
        this.closeDrawer();
      });
    }

    // Reset Button
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.applyConfig(this.defaults);
        localStorage.removeItem('ag_profile_config');
        if (window.soundEngine) window.soundEngine.playPop();
        if (window.showToast) {
          window.showToast('Profile reset to original signature defaults.', 'info');
        }
      });
    }

    // Export Config
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => {
        this.exportConfig();
        if (window.soundEngine) window.soundEngine.playSuccess();
      });
    }
  }

  openDrawer() {
    this.drawer.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeDrawer() {
    this.drawer.classList.add('hidden');
  }

  updateName(val) {
    const safeVal = val.trim() || 'Muhammad Firas';
    const targets = [
      document.getElementById('nav-brand-name'),
      document.getElementById('card-hero-name'),
      document.getElementById('footer-brand-name')
    ];
    targets.forEach(el => {
      if (el) el.textContent = safeVal;
    });
    document.title = `${safeVal} â€” Senior Product Designer & Creative Technologist`;
  }

  updateRole(val) {
    const safeVal = val.trim() || 'Senior Product Designer';
    const targets = [
      document.getElementById('hero-role-title'),
      document.getElementById('card-hero-role')
    ];
    targets.forEach(el => {
      if (el) el.textContent = safeVal;
    });
  }

  updateStatus(val) {
    const safeVal = val.trim() || 'Available for Select Q4/2026 Strategic Projects';
    const el = document.getElementById('status-text');
    if (el) el.textContent = safeVal;
  }

  updateEmail(val) {
    const safeVal = val.trim() || 'firas.design@nexus.io';
    const emailLink = document.getElementById('contact-email-link');
    const copyBtn = document.getElementById('quick-copy-email-btn');

    if (emailLink) {
      emailLink.textContent = safeVal;
      emailLink.href = `mailto:${safeVal}`;
    }
    if (copyBtn) {
      copyBtn.dataset.email = safeVal;
    }
  }

  updateBio(val) {
    const safeVal = val.trim();
    const el = document.getElementById('hero-bio-desc');
    if (el) el.textContent = safeVal;
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.paletteOptions.forEach(opt => {
      if (opt.dataset.themeVal === theme) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  syncSoundButtonUI(isMuted) {
    const soundBtn = document.getElementById('sound-btn');
    if (!soundBtn) return;
    const onIcon = soundBtn.querySelector('.sound-on-icon');
    const offIcon = soundBtn.querySelector('.sound-off-icon');

    if (isMuted) {
      onIcon.classList.add('hidden');
      offIcon.classList.remove('hidden');
    } else {
      onIcon.classList.remove('hidden');
      offIcon.classList.add('hidden');
    }
  }

  getCurrentConfig() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'cyber';
    return {
      name: this.inputs.name ? this.inputs.name.value : this.defaults.name,
      role: this.inputs.role ? this.inputs.role.value : this.defaults.role,
      status: this.inputs.status ? this.inputs.status.value : this.defaults.status,
      email: this.inputs.email ? this.inputs.email.value : this.defaults.email,
      bio: this.inputs.bio ? this.inputs.bio.value : this.defaults.bio,
      theme: currentTheme,
      physicsSpeed: this.inputs.speed ? parseFloat(this.inputs.speed.value) : 1.0,
      soundEnabled: this.inputs.sound ? this.inputs.sound.checked : true
    };
  }

  applyConfig(cfg) {
    if (this.inputs.name) this.inputs.name.value = cfg.name;
    if (this.inputs.role) this.inputs.role.value = cfg.role;
    if (this.inputs.status) this.inputs.status.value = cfg.status;
    if (this.inputs.email) this.inputs.email.value = cfg.email;
    if (this.inputs.bio) this.inputs.bio.value = cfg.bio;
    if (this.inputs.speed) {
      this.inputs.speed.value = cfg.physicsSpeed;
      const label = document.getElementById('physics-speed-label');
      if (label) label.textContent = `${cfg.physicsSpeed.toFixed(1)}x`;
    }
    if (this.inputs.sound) {
      this.inputs.sound.checked = cfg.soundEnabled;
    }

    this.updateName(cfg.name);
    this.updateRole(cfg.role);
    this.updateStatus(cfg.status);
    this.updateEmail(cfg.email);
    this.updateBio(cfg.bio);
    this.setTheme(cfg.theme || 'cyber');

    if (window.antigravityEngine) {
      window.antigravityEngine.speedMultiplier = cfg.physicsSpeed;
    }
    if (window.soundEngine) {
      window.soundEngine.setMuted(!cfg.soundEnabled);
      this.syncSoundButtonUI(!cfg.soundEnabled);
    }
  }

  saveCurrentConfig() {
    const cfg = this.getCurrentConfig();
    localStorage.setItem('ag_profile_config', JSON.stringify(cfg));
  }

  loadSavedConfig() {
    const saved = localStorage.getItem('ag_profile_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.applyConfig({ ...this.defaults, ...parsed });
      } catch (e) {
        this.applyConfig(this.defaults);
      }
    } else {
      this.applyConfig(this.defaults);
    }
  }

  exportConfig() {
    const cfg = this.getCurrentConfig();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cfg, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'antigravity-profile-config.json');
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    if (window.showToast) {
      window.showToast('Profile JSON exported successfully!', 'success');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.profileEditor = new ProfileEditorStudio();
});

