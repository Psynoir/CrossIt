class CrosshairConfigurator {
  constructor() {
    this.crosshair = document.getElementById('crosshair');
    this.previewArea = document.getElementById('previewArea');
    this.coordX = document.getElementById('coordX');
    this.coordY = document.getElementById('coordY');
    
    this.modules = {
      dynamicColor: false,
      outline: false,
      centerDot: true,
      pulsing: false
    };
    
    this.initializeControls();
    this.bindEvents();
    this.updatePreview();
    this.loadConfigFromBackend();
  }

  initializeControls() {
    this.controls = {
      style: document.getElementById('crosshairStyle'),
      size: document.getElementById('crosshairSize'),
      thickness: document.getElementById('crosshairThickness'),
      gap: document.getElementById('crosshairGap'),
      offsetX: document.getElementById('offsetX'),
      offsetY: document.getElementById('offsetY'),
      color: document.getElementById('crosshairColor'),
      opacity: document.getElementById('crosshairOpacity')
    };

    this.valueDisplays = {
      size: document.getElementById('sizeValue'),
      thickness: document.getElementById('thicknessValue'),
      gap: document.getElementById('gapValue'),
      offsetX: document.getElementById('offsetXValue'),
      offsetY: document.getElementById('offsetYValue'),
      opacity: document.getElementById('opacityValue')
    };

    this.toggles = {
      dynamicColor: document.getElementById('dynamicColorToggle'),
      outline: document.getElementById('outlineToggle'),
      centerDot: document.getElementById('centerDotToggle'),
      pulsing: document.getElementById('pulsingToggle')
    };

    this.updateValueDisplays();
  }

  bindEvents() {
    // Range / inputs
    Object.keys(this.controls).forEach(key => {
      const el = this.controls[key];
      if (!el) return;
      if (el.type === 'range') {
        el.addEventListener('input', () => {
          this.updateValueDisplays();
          this.updatePreview();
          this.applySettings();
        });
      } else {
        el.addEventListener('change', () => {
          this.updatePreview();
          this.applySettings();
        });
      }
    });

    Object.keys(this.toggles).forEach(key => {
      const el = this.toggles[key];
      if (!el) return;
      el.addEventListener('click', () => {
        this.modules[key] = !this.modules[key];
        el.classList.toggle('active', this.modules[key]);
        this.updatePreview();
        this.applySettings();
      });
    });

    // Buttons
    document.getElementById('applyBtn').addEventListener('click', () => {
      this.applySettings();
      this.applySettings();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetSettings();
      this.applySettings();
    });

    // Mouse tracking
    this.previewArea.addEventListener('mousemove', (e) => {
      const rect = this.previewArea.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left - rect.width / 2);
      const y = Math.round(e.clientY - rect.top - rect.height / 2);
      this.coordX.textContent = x;
      this.coordY.textContent = y;
    });

    this.previewArea.addEventListener('mouseleave', () => {
      this.coordX.textContent = '0';
      this.coordY.textContent = '0';
    });
  }

  updateValueDisplays() {
    Object.keys(this.valueDisplays).forEach(key => {
      const control = this.controls[key];
      const display = this.valueDisplays[key];
      if (control && display) {
        let value = control.value;
        if (key === 'opacity') {
          value += '%';
        }
        display.textContent = value;
      }
    });
  }

  updatePreview() {
    const style = this.controls.style.value;
    const size = parseInt(this.controls.size.value);
    const thickness = parseInt(this.controls.thickness.value);
    const gap = parseInt(this.controls.gap.value);
    const offsetX = parseInt(this.controls.offsetX.value);
    const offsetY = parseInt(this.controls.offsetY.value);
    const color = this.controls.color.value;
    const opacity = parseInt(this.controls.opacity.value) / 100;

    // Apply position offsets (preview only)
    this.crosshair.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    const horizontal = this.crosshair.querySelector('.horizontal');
    const vertical = this.crosshair.querySelector('.vertical');
    const dot = this.crosshair.querySelector('.crosshair-dot');
    const outline = this.crosshair.querySelector('.crosshair-outline');

    this.crosshair.classList.toggle('dynamic-color', this.modules.dynamicColor);
    this.crosshair.classList.toggle('pulsing', this.modules.pulsing);

    dot.style.display = this.modules.centerDot ? 'block' : 'none';
    horizontal.style.display = 'block';
    vertical.style.display = 'block';

    const baseStyle = {
      background: color,
      opacity: opacity
    };

    switch (style) {
      case 'cross':
        this.applyCrossStyle(horizontal, vertical, dot, outline, size, thickness, gap, baseStyle);
        break;
      case 'dot':
        horizontal.style.display = 'none';
        vertical.style.display = 'none';
        this.applyDotStyle(dot, outline, thickness * 2, baseStyle);
        break;
      case 'circle':
        horizontal.style.display = 'none';
        vertical.style.display = 'none';
        this.applyCircleStyle(dot, outline, size, thickness, baseStyle);
        break;
      case 'square':
        horizontal.style.display = 'none';
        vertical.style.display = 'none';
        this.applySquareStyle(dot, outline, size, thickness, baseStyle);
        break;
    }

    if (this.modules.outline && outline) {
      outline.style.display = 'block';
      this.updateOutline(outline, style, size, thickness);
    } else if (outline) {
      outline.style.display = 'none';
    }
  }

  applyCrossStyle(horizontal, vertical, dot, outline, size, thickness, gap, baseStyle) {
    const lineLength = size * 2;             
    const lineThickness = Math.max(1, thickness); 
    
    Object.assign(horizontal.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${lineLength}px`,
        height: `${lineThickness}px`,
        background: 'none',
        transform: 'translate(-50%, -50%)'
    });

    horizontal.innerHTML = `
        <div style="
            position:absolute;
            left:0;
            top:0;
            width:${lineLength / 2 - gap}px;
            height:${lineThickness}px;
            background:${baseStyle.background};
            opacity:${baseStyle.opacity};
        "></div>
        <div style="
            position:absolute;
            right:0;
            top:0;
            width:${lineLength / 2 - gap}px;
            height:${lineThickness}px;
            background:${baseStyle.background};
            opacity:${baseStyle.opacity};
        "></div>
    `;

    Object.assign(vertical.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${lineThickness}px`,
        height: `${lineLength}px`,
        background: 'none',
        transform: 'translate(-50%, -50%)'
    });

    vertical.innerHTML = `
        <div style="
            position:absolute;
            top:0;
            left:0;
            width:${lineThickness}px;
            height:${lineLength / 2 - gap}px;
            background:${baseStyle.background};
            opacity:${baseStyle.opacity};
        "></div>
        <div style="
            position:absolute;
            bottom:0;
            left:0;
            width:${lineThickness}px;
            height:${lineLength / 2 - gap}px;
            background:${baseStyle.background};
            opacity:${baseStyle.opacity};
        "></div>
    `;

    if (this.modules.centerDot) {
        Object.assign(dot.style, {
            width: `${lineThickness}px`,
            height: `${lineThickness}px`,
            background: baseStyle.background,
            opacity: baseStyle.opacity,
            borderRadius: '50%'
        });
    }
}
  applyDotStyle(dot, outline, size, baseStyle) {
    Object.assign(dot.style, {
      width: `${size}px`,
      height: `${size}px`,
      background: baseStyle.background,
      opacity: baseStyle.opacity,
      borderRadius: '50%'
    });
  }

  applyCircleStyle(dot, outline, size, thickness, baseStyle) {
    Object.assign(dot.style, {
      width: `${size}px`,
      height: `${size}px`,
      background: 'transparent',
      border: `${thickness}px solid ${baseStyle.background}`,
      opacity: baseStyle.opacity,
      borderRadius: '50%'
    });
  }

  applySquareStyle(dot, outline, size, thickness, baseStyle) {
    Object.assign(dot.style, {
      width: `${size}px`,
      height: `${size}px`,
      background: 'transparent',
      border: `${thickness}px solid ${baseStyle.background}`,
      opacity: baseStyle.opacity,
      borderRadius: '0'
    });
  }

  updateOutline(outline, style, size, thickness) {
    const outlineSize = size + 4;
    switch (style) {
      case 'cross':
        outline.style.width = `${outlineSize}px`;
        outline.style.height = `${outlineSize}px`;
        outline.style.borderRadius = '0';
        break;
      case 'circle':
        outline.style.width = `${outlineSize}px`;
        outline.style.height = `${outlineSize}px`;
        outline.style.borderRadius = '50%';
        break;
      case 'square':
        outline.style.width = `${outlineSize}px`;
        outline.style.height = `${outlineSize}px`;
        outline.style.borderRadius = '0';
        break;
      default:
        outline.style.width = `${thickness + 4}px`;
        outline.style.height = `${thickness + 4}px`;
        outline.style.borderRadius = '50%';
    }
  }

  // --- Backend integration -------------------------------------------------
  async saveConfigToBackend(settings) {
    // Try pywebview API first; fallback to localStorage
    if (window.pywebview && window.pywebview.api && window.pywebview.api.save_config) {
      try {
        const res = await window.pywebview.api.save_config(settings);
        console.log('Config saved to backend:', res);
        return true;
      } catch (e) {
        console.warn('Failed saving to backend:', e);
      }
    }
    // Fallback
    try {
      localStorage.setItem('crosshair_config', JSON.stringify(settings));
      console.log('Config saved to localStorage');
      return true;
    } catch (e) {
      console.error('Failed saving config:', e);
      return false;
    }
  }

  async loadConfigFromBackend() {
    let cfg = null;
    if (window.pywebview && window.pywebview.api && window.pywebview.api.load_config) {
      try {
        cfg = await window.pywebview.api.load_config();
        console.log('Loaded config from backend', cfg);
      } catch (e) {
        console.warn('Backend load failed:', e);
      }
    }

    if (!cfg) {
      // try localStorage
      try {
        const raw = localStorage.getItem('crosshair_config');
        if (raw) cfg = JSON.parse(raw);
        console.log('Loaded config from localStorage', cfg);
      } catch (e) {
        console.warn('localStorage load failed:', e);
      }
    }

    if (!cfg) return; // nothing to apply

    this.applyConfigToControls(cfg);
    this.updateValueDisplays();
    this.updatePreview();
  }

  applyConfigToControls(cfg) {
    // Basic safety & normalization
    if (!cfg) return;
    const norm = Object.assign({
      style: 'cross', size: 20, thickness: 2, gap: 3,
      offsetX: 0, offsetY: 0, color: '#00ff41', opacity: 1.0,
      modules: {}
    }, cfg);

    if (this.controls.style) this.controls.style.value = norm.style;
    if (this.controls.size) this.controls.size.value = norm.size;
    if (this.controls.thickness) this.controls.thickness.value = norm.thickness;
    if (this.controls.gap) this.controls.gap.value = norm.gap;
    if (this.controls.offsetX) this.controls.offsetX.value = norm.offsetX;
    if (this.controls.offsetY) this.controls.offsetY.value = norm.offsetY;
    if (this.controls.color) this.controls.color.value = norm.color;
    if (this.controls.opacity) this.controls.opacity.value = Math.round((norm.opacity || 1.0) * 100);

    // Modules
    this.modules = Object.assign(this.modules, norm.modules || {});
    Object.keys(this.toggles).forEach(key => {
      const el = this.toggles[key];
      const val = !!this.modules[key];
      if (el) el.classList.toggle('active', val);
    });
  }

  // Apply button -> save to backend & update overlay (backend crosshair watches config.json)
  async applySettings() {
    const settings = this.getCurrentSettings();
    // Normalize opacity to 0..1 for saving (backend expects 1.0)
    settings.opacity = (typeof settings.opacity === 'string' && settings.opacity.includes('%'))
      ? parseInt(settings.opacity) / 100
      : Number(settings.opacity);
    const ok = await this.saveConfigToBackend(settings);
    if (ok) {
      // If running without backend overlay, we can also apply to preview (already applied)
      console.log('Apply done.');
    } else {
      console.warn('Apply failed to persist config.');
    }
  }

  resetSettings() {
    this.controls.style.value = 'cross';
    this.controls.size.value = '20';
    this.controls.thickness.value = '2';
    this.controls.gap.value = '3';
    this.controls.offsetX.value = '0';
    this.controls.offsetY.value = '0';
    this.controls.color.value = '#00ff41';
    this.controls.opacity.value = '100';

    this.modules = {
      dynamicColor: false,
      outline: false,
      centerDot: true,
      pulsing: false
    };

    Object.keys(this.toggles).forEach(key => {
      this.toggles[key].classList.toggle('active', this.modules[key]);
    });

    this.updateValueDisplays();
    this.updatePreview();
  }

  getCurrentSettings() {
    return {
      style: this.controls.style.value,
      size: parseInt(this.controls.size.value),
      thickness: parseInt(this.controls.thickness.value),
      gap: parseInt(this.controls.gap.value),
      offsetX: parseInt(this.controls.offsetX.value),
      offsetY: parseInt(this.controls.offsetY.value),
      color: this.controls.color.value,
      opacity: parseInt(this.controls.opacity.value) / 100,
      modules: { ...this.modules }
    };
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  window.crosshairApp = new CrosshairConfigurator();

  let cfg = null;
  if (window.pywebview && window.pywebview.api && window.pywebview.api.load_config) {
    try {
      cfg = await window.pywebview.api.load_config();
      console.log('Loaded config from backend', cfg);
    } catch (e) {
      console.warn('Backend load failed:', e);
    }
  }

  if (!cfg) {
    try {
      const response = await fetch('config.json');
      if (response.ok) {
        cfg = await response.json();
        console.log('Loaded config from config.json', cfg);
      } else {
        console.warn('config.json not found');
      }
    } catch (e) {
      console.warn('Failed to fetch config.json:', e);
    }
  }

  if (cfg) {
    window.crosshairApp.applyConfigToControls(cfg);
    window.crosshairApp.updateValueDisplays();
    window.crosshairApp.updatePreview();
  }
});
