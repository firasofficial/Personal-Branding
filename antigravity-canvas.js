/**
 * antigravity-canvas.js
 * Interactive zero-gravity physics engine & constellation matrix for tech stack nodes
 */
class AntigravityEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Physics settings
    this.mode = 'zero-g'; // 'zero-g', 'attract', 'repel', 'orbit'
    this.speedMultiplier = 1.0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse tracking
    this.mouse = {
      x: null,
      y: null,
      radius: 180,
      isHovered: false
    };

    // Drag tracking
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.mouseVelocity = { x: 0, y: 0 };

    // Selected node for inspector
    this.selectedNode = null;

    // Node definitions
    this.nodeData = [
      {
        title: 'Figma Systems',
        category: 'Product Design',
        icon: '❖',
        fluency: 98,
        desc: 'Enterprise variable tokens, automated design-to-code pipelines, and responsive atomic libraries.',
        projects: 'Chronos Spatial, Aether Pay'
      },
      {
        title: 'VisionOS & XR',
        category: 'Spatial UI',
        icon: '👓',
        fluency: 92,
        desc: 'Volumetric depth hierarchies, eye-tracking & pinch ergonomics, and glassmorphic spatial material shaders.',
        projects: 'Chronos Space OS'
      },
      {
        title: 'Three.js / WebGL',
        category: '3D Graphics',
        icon: '▲',
        fluency: 90,
        desc: 'Custom GLSL shaders, real-time lighting models, instanced mesh rendering, and fluid particle simulations.',
        projects: 'Vortex Creative Suite'
      },
      {
        title: 'Design Tokens',
        category: 'Architecture',
        icon: '◈',
        fluency: 96,
        desc: 'Cross-platform design token architecture, style dictionary automation, and dark/light dynamic theme engines.',
        projects: 'Aether Neo-Bank'
      },
      {
        title: 'Next.js & React',
        category: 'Engineering',
        icon: '⚛',
        fluency: 94,
        desc: 'React Server Components, high-performance UI state hydration, and micro-frontend integrations.',
        projects: 'All Web Platforms'
      },
      {
        title: 'Micro-Interactions',
        category: 'Craft',
        icon: '✦',
        fluency: 99,
        desc: 'Physics-based spring dynamics, custom easing curves, haptic cues, and sub-pixel optical alignments.',
        projects: 'Aether Pay, Pulse Health'
      },
      {
        title: 'Generative AI UX',
        category: 'Emerging Tech',
        icon: '🤖',
        fluency: 91,
        desc: 'Latent-space exploration interfaces, contextual prompt scaffolds, and streaming inference UI.',
        projects: 'Vortex Engine, Pulse AI'
      },
      {
        title: 'User Research',
        category: 'UX Strategy',
        icon: '◎',
        fluency: 88,
        desc: 'Heuristic evaluation, quantitative task telemetry, usability testing with eye-tracking analysis.',
        projects: 'Pulse Quantum Health'
      },
      {
        title: 'Spline 3D',
        category: 'Interactive 3D',
        icon: '⬡',
        fluency: 93,
        desc: 'Real-time interactive 3D web scenes with collision triggers and camera keyframe animation.',
        projects: 'Obsidian Branding'
      },
      {
        title: 'WCAG AAA Access',
        category: 'Product Quality',
        icon: '♿',
        fluency: 95,
        desc: 'High-contrast spatial visual hierarchy, keyboard focus trapping, and screen-reader accessibility.',
        projects: 'Enterprise Clients'
      },
      {
        title: 'Creative Coding',
        category: 'Computation',
        icon: '✹',
        fluency: 89,
        desc: 'Canvas 2D algorithms, cellular automata, procedural noise generators, and generative geometry.',
        projects: 'Antigravity Studio'
      },
      {
        title: 'Product Strategy',
        category: 'Executive UX',
        icon: '📈',
        fluency: 92,
        desc: 'Product-market fit alignment, 0-to-1 design roadmapping, and business metric optimization.',
        projects: 'Apex, Aether, Venture Labs'
      }
    ];

    this.nodes = [];
    this.init();
  }

  init() {
    this.resize();
    this.createNodes();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createNodes() {
    this.nodes = [];
    const count = this.nodeData.length;

    // Distribute nodes evenly
    for (let i = 0; i < count; i++) {
      const data = this.nodeData[i];
      const radius = 34 + (data.fluency - 85) * 0.7; // Size proportional to fluency

      // Spread inside canvas
      const x = (this.width * 0.15) + Math.random() * (this.width * 0.7);
      const y = (this.height * 0.15) + Math.random() * (this.height * 0.7);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.5;

      this.nodes.push({
        ...data,
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        baseRadius: radius,
        mass: radius * 0.8,
        isHovered: false,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    });

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Mouse Move
    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getCanvasPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.mouse.isHovered = true;

      // Track mouse velocity for flinging
      this.mouseVelocity.x = pos.x - this.lastMousePos.x;
      this.mouseVelocity.y = pos.y - this.lastMousePos.y;
      this.lastMousePos.x = pos.x;
      this.lastMousePos.y = pos.y;

      if (this.draggedNode) {
        this.draggedNode.x = pos.x - this.dragOffset.x;
        this.draggedNode.y = pos.y - this.dragOffset.y;
        this.draggedNode.vx = this.mouseVelocity.x * 0.6;
        this.draggedNode.vy = this.mouseVelocity.y * 0.6;
      } else {
        // Check hover
        let hoveredAny = false;
        for (const node of this.nodes) {
          const dx = pos.x - node.x;
          const dy = pos.y - node.y;
          const dist = Math.hypot(dx, dy);

          if (dist < node.radius) {
            if (!node.isHovered && window.soundEngine) {
              window.soundEngine.playHover();
            }
            node.isHovered = true;
            hoveredAny = true;
          } else {
            node.isHovered = false;
          }
        }
        this.canvas.style.cursor = hoveredAny ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isHovered = false;
      this.mouse.x = null;
      this.mouse.y = null;
      if (this.draggedNode) {
        this.draggedNode = null;
      }
      this.nodes.forEach(n => n.isHovered = false);
    });

    // Mouse Down (Drag start or inspect)
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getCanvasPos(e);
      for (const node of this.nodes) {
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        if (Math.hypot(dx, dy) < node.radius) {
          this.draggedNode = node;
          this.dragOffset.x = pos.x - node.x;
          this.dragOffset.y = pos.y - node.y;
          this.selectNode(node);
          if (window.soundEngine) {
            window.soundEngine.playPop();
          }
          break;
        }
      }
    });

    // Mouse Up (Fling)
    window.addEventListener('mouseup', () => {
      if (this.draggedNode) {
        this.draggedNode.vx = Math.max(-5, Math.min(5, this.mouseVelocity.x * 0.8));
        this.draggedNode.vy = Math.max(-5, Math.min(5, this.mouseVelocity.y * 0.8));
        this.draggedNode = null;
      }
    });

    // Touch support for mobile devices
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const pos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        this.mouse.x = pos.x;
        this.mouse.y = pos.y;
        this.mouse.isHovered = true;

        for (const node of this.nodes) {
          const dx = pos.x - node.x;
          const dy = pos.y - node.y;
          if (Math.hypot(dx, dy) < node.radius + 15) {
            this.draggedNode = node;
            this.dragOffset.x = pos.x - node.x;
            this.dragOffset.y = pos.y - node.y;
            this.selectNode(node);
            e.preventDefault();
            break;
          }
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.draggedNode) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.draggedNode.x = (touch.clientX - rect.left) - this.dragOffset.x;
        this.draggedNode.y = (touch.clientY - rect.top) - this.dragOffset.y;
        e.preventDefault();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.draggedNode = null;
      this.mouse.isHovered = false;
    });

    // Mode Buttons
    const modeButtons = document.querySelectorAll('.btn-control[data-mode]');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Gravitational Pulse Button
    const burstBtn = document.getElementById('btn-physics-burst');
    if (burstBtn) {
      burstBtn.addEventListener('click', () => {
        this.gravitationalBurst();
        if (window.soundEngine) window.soundEngine.playGlitch();
      });
    }

    // Reset Nodes Button
    const resetBtn = document.getElementById('btn-physics-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.createNodes();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Close Inspector
    const closeInspector = document.getElementById('inspector-close');
    if (closeInspector) {
      closeInspector.addEventListener('click', () => {
        this.deselectNode();
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  gravitationalBurst() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.nodes.forEach(node => {
      const dx = node.x - centerX;
      const dy = node.y - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 8 + Math.random() * 5;

      node.vx = (dx / dist) * force;
      node.vy = (dy / dist) * force;
    });
  }

  selectNode(node) {
    this.selectedNode = node;
    const inspector = document.getElementById('node-inspector');
    if (!inspector) return;

    inspector.classList.remove('hidden');
    document.getElementById('inspector-icon').textContent = node.icon;
    document.getElementById('inspector-title').textContent = node.title;
    document.getElementById('inspector-category').textContent = node.category;
    document.getElementById('inspector-desc').textContent = node.desc;
    document.getElementById('inspector-fluency').textContent = `${node.fluency}% (Mastery)`;
    document.getElementById('inspector-bar').style.width = `${node.fluency}%`;
    document.getElementById('inspector-projects').textContent = node.projects;
  }

  deselectNode() {
    this.selectedNode = null;
    const inspector = document.getElementById('node-inspector');
    if (inspector) inspector.classList.add('hidden');
  }

  update() {
    const effectiveSpeed = this.speedMultiplier;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node === this.draggedNode) continue;

      // Physics based on selected mode
      if (this.mode === 'attract' && this.mouse.isHovered && this.mouse.x !== null) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 30) {
          const force = (1 / Math.max(dist, 100)) * 2.2 * effectiveSpeed;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      } else if (this.mode === 'repel' && this.mouse.isHovered && this.mouse.x !== null) {
        const dx = node.x - this.mouse.x;
        const dy = node.y - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && dist > 1) {
          const force = ((200 - dist) / 200) * 1.8 * effectiveSpeed;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      } else if (this.mode === 'orbit') {
        const targetX = this.mouse.isHovered && this.mouse.x !== null ? this.mouse.x : centerX;
        const targetY = this.mouse.isHovered && this.mouse.y !== null ? this.mouse.y : centerY;
        const dx = targetX - node.x;
        const dy = targetY - node.y;
        const dist = Math.hypot(dx, dy);

        // Perpendicular orbital vector + slight centripetal pull
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);
        const orbitSpeed = 1.4 * effectiveSpeed;

        node.vx += perpX * orbitSpeed * 0.1 + (dx / (dist || 1)) * 0.03;
        node.vy += perpY * orbitSpeed * 0.1 + (dy / (dist || 1)) * 0.03;
      }

      // Drag damping
      node.vx *= 0.985;
      node.vy *= 0.985;

      // Minimum drift speed in zero-g mode
      if (this.mode === 'zero-g') {
        const currentSpeed = Math.hypot(node.vx, node.vy);
        const targetDrift = 0.5 * effectiveSpeed;
        if (currentSpeed < targetDrift) {
          node.vx += (Math.random() - 0.5) * 0.06;
          node.vy += (Math.random() - 0.5) * 0.06;
        }
      }

      // Apply velocities
      node.x += node.vx * effectiveSpeed;
      node.y += node.vy * effectiveSpeed;

      // Soft Wall boundaries bouncing
      const padding = node.radius + 10;
      if (node.x < padding) {
        node.x = padding;
        node.vx = Math.abs(node.vx) * 0.85;
      } else if (node.x > this.width - padding) {
        node.x = this.width - padding;
        node.vx = -Math.abs(node.vx) * 0.85;
      }

      if (node.y < padding) {
        node.y = padding;
        node.vy = Math.abs(node.vy) * 0.85;
      } else if (node.y > this.height - padding) {
        node.y = this.height - padding;
        node.vy = -Math.abs(node.vy) * 0.85;
      }

      // Node-to-node collision (elastic)
      for (let j = i + 1; j < this.nodes.length; j++) {
        const other = this.nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.hypot(dx, dy);
        const minDist = node.radius + other.radius + 4;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          node.x -= nx * overlap * 0.5;
          node.y -= ny * overlap * 0.5;
          other.x += nx * overlap * 0.5;
          other.y += ny * overlap * 0.5;

          // Swap momentum slightly
          const kx = node.vx - other.vx;
          const ky = node.vy - other.vy;
          const p = 2 * (nx * kx + ny * ky) / (node.mass + other.mass);

          node.vx -= p * other.mass * nx;
          node.vy -= p * other.mass * ny;
          other.vx += p * node.mass * nx;
          other.vy += p * node.mass * ny;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background tech grid
    this.drawGrid();

    // Draw constellation links between close nodes
    this.drawConstellationLinks();

    // Draw gravity lens wave around cursor if active
    if (this.mouse.isHovered && this.mouse.x !== null) {
      this.drawGravityLens();
    }

    // Draw each floating node
    for (const node of this.nodes) {
      this.drawNode(node);
    }
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    this.ctx.lineWidth = 1;

    const gridSize = 60;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawGravityLens() {
    this.ctx.save();
    const grad = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 10,
      this.mouse.x, this.mouse.y, 140
    );

    if (this.mode === 'attract') {
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    } else if (this.mode === 'repel') {
      grad.addColorStop(0, 'rgba(244, 63, 94, 0.18)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    } else {
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
    }

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 140, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 140, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawConstellationLinks() {
    this.ctx.save();
    const maxDist = 135;

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.restore();
  }

  drawNode(node) {
    this.ctx.save();
    const isSelected = this.selectedNode === node;
    const isHovered = node.isHovered;

    // Glowing outer halo
    if (isHovered || isSelected) {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + 12, 0, Math.PI * 2);
      this.ctx.fillStyle = isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 240, 255, 0.25)';
      this.ctx.fill();
    }

    // Glass Node Body
    const grad = this.ctx.createRadialGradient(
      node.x - node.radius * 0.3,
      node.y - node.radius * 0.3,
      node.radius * 0.1,
      node.x,
      node.y,
      node.radius
    );
    grad.addColorStop(0, isSelected ? '#1e1c38' : '#141c2c');
    grad.addColorStop(1, '#0a0d16');

    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Node Border
    this.ctx.strokeStyle = isSelected
      ? '#8b5cf6'
      : isHovered
      ? '#00f0ff'
      : 'rgba(255, 255, 255, 0.16)';
    this.ctx.lineWidth = isSelected ? 2.5 : 1.5;
    this.ctx.stroke();

    // Icon
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = isSelected ? '#8b5cf6' : '#00f0ff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(node.icon, node.x, node.y - 8);

    // Label
    this.ctx.font = '600 11px "Space Grotesk", monospace';
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillText(node.title, node.x, node.y + 11);

    this.ctx.restore();
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.antigravityEngine = new AntigravityEngine('antigravity-canvas');
});
