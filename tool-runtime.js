(function () {
  'use strict';

  if (window.__toolRuntimeLoaded) return;
  window.__toolRuntimeLoaded = true;

  var onToolPage = /\/tools\//.test(window.location.pathname);
  if (!onToolPage) return;

  var nativeSetTimeout = window.setTimeout.bind(window);
  var nativeClearTimeout = window.clearTimeout.bind(window);
  var nativeSetInterval = window.setInterval.bind(window);
  var nativeClearInterval = window.clearInterval.bind(window);
  var nativeRAF = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
  var nativeCancelRAF = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : null;

  var timeouts = new Set();
  var intervals = new Set();
  var frames = new Set();

  window.setTimeout = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetTimeout(function () {
      timeouts.delete(id);
      if (typeof fn === 'function') {
        fn.apply(window, args);
      } else {
        Function(fn)();
      }
    }, delay);
    timeouts.add(id);
    return id;
  };

  window.clearTimeout = function (id) {
    timeouts.delete(id);
    return nativeClearTimeout(id);
  };

  window.setInterval = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetInterval(function () {
      if (typeof fn === 'function') {
        fn.apply(window, args);
      } else {
        Function(fn)();
      }
    }, delay);
    intervals.add(id);
    return id;
  };

  window.clearInterval = function (id) {
    intervals.delete(id);
    return nativeClearInterval(id);
  };

  if (nativeRAF && nativeCancelRAF) {
    window.requestAnimationFrame = function (fn) {
      var id = nativeRAF(function (ts) {
        frames.delete(id);
        fn(ts);
      });
      frames.add(id);
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      frames.delete(id);
      return nativeCancelRAF(id);
    };
  }

  function clearRuntimeWork() {
    timeouts.forEach(nativeClearTimeout);
    intervals.forEach(nativeClearInterval);
    if (nativeCancelRAF) frames.forEach(nativeCancelRAF);
    timeouts.clear();
    intervals.clear();
    frames.clear();
  }

  window.addEventListener('pagehide', clearRuntimeWork);
  window.addEventListener('beforeunload', clearRuntimeWork);

  function labelFromText(el, fallback) {
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text || fallback;
  }

  function enhanceAccessibility() {
    document.querySelectorAll('button:not([aria-label])').forEach(function (button) {
      button.setAttribute('aria-label', labelFromText(button, 'Tool control'));
    });

    document.querySelectorAll('canvas:not([aria-label])').forEach(function (canvas) {
      canvas.setAttribute('aria-label', 'Interactive training canvas');
      if (!canvas.hasAttribute('role')) canvas.setAttribute('role', 'img');
    });
  }

  function resizeCanvas(canvas) {
    if (!canvas || !canvas.getBoundingClientRect) return;
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var width = Math.max(1, Math.round(rect.width * dpr));
    var height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }

  function enhanceCanvasResize() {
    var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas'));
    if (!canvases.length) return;

    canvases.forEach(resizeCanvas);

    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          resizeCanvas(entry.target);
        });
      });
      canvases.forEach(function (canvas) { observer.observe(canvas); });
      window.addEventListener('pagehide', function () { observer.disconnect(); });
    } else {
      window.addEventListener('resize', function () {
        canvases.forEach(resizeCanvas);
      }, { passive: true });
    }
  }

  function gameAssetPath(name) {
    return '../images/game-assets/' + name;
  }

  function colorToNumber(color, fallback) {
    if (typeof color === 'number') return color;
    if (typeof color !== 'string') return fallback || 0x2563eb;
    var clean = color.replace('#', '').trim();
    var parsed = parseInt(clean, 16);
    return Number.isFinite(parsed) ? parsed : (fallback || 0x2563eb);
  }

  function gameProfile(overrides) {
    var path = window.location.pathname.toLowerCase();
    var profile = {
      accent: '#2563eb',
      accentHex: 0x2563eb,
      backdrop: 'arena-range.jpg',
      weapon: 'precision',
      weaponImage: 'weapon-precision-rifle.jpg',
      targetImage: 'target-precision-bot.jpg'
    };

    if (/valorant/.test(path)) {
      profile.accent = '#ff4655';
      profile.accentHex = 0xff4655;
      profile.backdrop = 'arena-range.jpg';
      profile.weapon = 'precision';
      profile.weaponImage = 'weapon-precision-rifle.jpg';
      profile.targetImage = 'target-precision-bot.jpg';
    } else if (/csgo|cs2/.test(path)) {
      profile.accent = '#16a34a';
      profile.accentHex = 0x16a34a;
      profile.backdrop = 'arena-urban.jpg';
      profile.weapon = 'smg';
      profile.weaponImage = 'weapon-compact-smg.jpg';
      profile.targetImage = 'target-assault-bot.jpg';
    } else if (/cod/.test(path)) {
      profile.accent = '#8b9a2b';
      profile.accentHex = 0x8b9a2b;
      profile.backdrop = 'arena-recoil-lab.jpg';
      profile.weapon = 'heavy';
      profile.weaponImage = 'weapon-heavy-rifle.jpg';
      profile.targetImage = 'target-heavy-bot.jpg';
    } else if (/apex/.test(path)) {
      profile.accent = '#e8692a';
      profile.accentHex = 0xe8692a;
      profile.backdrop = 'arena-rooftop.jpg';
      profile.weapon = /recoil/.test(path) ? 'heavy' : 'smg';
      profile.weaponImage = /recoil/.test(path) ? 'weapon-heavy-rifle.jpg' : 'weapon-compact-smg.jpg';
      profile.targetImage = 'target-heavy-bot.jpg';
    } else if (/fortnite/.test(path)) {
      profile.accent = '#7c3aed';
      profile.accentHex = 0x7c3aed;
      profile.backdrop = 'arena-rooftop.jpg';
      profile.weapon = 'smg';
      profile.weaponImage = 'weapon-compact-smg.jpg';
      profile.targetImage = 'target-utility-bot.jpg';
    }

    if (/grenade|lineup/.test(path)) {
      profile.backdrop = 'arena-rooftop.jpg';
      profile.weapon = 'grenade';
      profile.weaponImage = 'weapon-grenade-device.jpg';
      profile.targetImage = 'target-utility-bot.jpg';
    }

    if (overrides) {
      Object.keys(overrides).forEach(function (key) {
        profile[key] = overrides[key];
      });
      profile.accentHex = colorToNumber(profile.accent, profile.accentHex);
    }
    return profile;
  }

  var threeLoadPromise = null;
  function ensureThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeLoadPromise) return threeLoadPromise;
    threeLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = function () { resolve(window.THREE); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return threeLoadPromise;
  }

  function makeMaterial(THREE, color, metalness, roughness, emissive) {
    var material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness == null ? 0.35 : metalness,
      roughness: roughness == null ? 0.45 : roughness
    });
    if (emissive) {
      material.emissive = new THREE.Color(emissive);
      material.emissiveIntensity = 0.32;
    }
    return material;
  }

  function meshBox(THREE, group, size, position, material, rotation) {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function meshCylinder(THREE, group, radiusTop, radiusBottom, height, position, material, rotation, segments) {
    var mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments || 18), material);
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function createFirstPersonWeapon(THREE, options) {
    var profile = gameProfile(options);
    var group = new THREE.Group();
    group.name = 'Reflex original 3D weapon';

    var accent = profile.accentHex || colorToNumber(profile.accent, 0x2563eb);
    var bodyMat = makeMaterial(THREE, profile.weapon === 'heavy' ? 0x4d5449 : 0x263241, 0.48, 0.33);
    var darkMat = makeMaterial(THREE, 0x101822, 0.58, 0.38);
    var trimMat = makeMaterial(THREE, 0xe8eef2, 0.28, 0.36);
    var accentMat = makeMaterial(THREE, accent, 0.42, 0.24, accent);
    var glassMat = makeMaterial(THREE, 0x7dd3fc, 0.12, 0.16, 0x38bdf8);

    if (profile.weapon === 'grenade') {
      var shell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 30, 18), bodyMat);
      shell.scale.set(0.9, 1.05, 0.9);
      shell.castShadow = true;
      shell.receiveShadow = true;
      group.add(shell);
      meshCylinder(THREE, group, 0.18, 0.2, 0.42, [0, 0.72, 0], trimMat, [0, 0, 0], 20);
      meshBox(THREE, group, [0.18, 0.92, 0.08], [0.48, 0.1, 0.06], darkMat, [0, 0, -0.35]);
      meshBox(THREE, group, [0.88, 0.28, 0.1], [0, -0.08, 0.58], accentMat);
      meshBox(THREE, group, [0.72, 0.44, 0.08], [0, 0.1, 0.66], glassMat);
      group.scale.setScalar(1.25);
      return group;
    }

    var heavy = profile.weapon === 'heavy';
    var smg = profile.weapon === 'smg';
    var length = heavy ? 3.35 : smg ? 2.55 : 3.15;
    var bodyH = heavy ? 0.48 : 0.38;

    meshBox(THREE, group, [length * 0.58, bodyH, 0.36], [0, 0, 0], bodyMat);
    meshBox(THREE, group, [length * 0.34, bodyH * 0.7, 0.3], [-length * 0.38, -0.02, 0], trimMat);
    meshCylinder(THREE, group, 0.105, 0.105, length * 0.48, [-length * 0.58, 0.08, 0], darkMat, [0, 0, Math.PI / 2], 24);
    meshCylinder(THREE, group, 0.16, 0.13, 0.36, [-length * 0.86, 0.08, 0], darkMat, [0, 0, Math.PI / 2], 24);
    meshBox(THREE, group, [0.88, 0.18, 0.32], [-0.2, 0.37, 0], darkMat);
    meshBox(THREE, group, [0.46, 0.28, 0.38], [0.06, 0.62, 0], accentMat);
    meshBox(THREE, group, [0.32, 0.32, 0.46], [0.22, 0.78, 0], glassMat);
    meshBox(THREE, group, [0.38, 0.95, 0.28], [0.38, -0.58, 0], darkMat, [0, 0, 0.11]);
    meshBox(THREE, group, [0.42, 0.86, 0.3], [-0.28, -0.58, 0], bodyMat, [0, 0, -0.08]);
    meshBox(THREE, group, [0.98, 0.28, 0.34], [length * 0.5, -0.04, 0], darkMat, [0, 0, -0.16]);
    meshBox(THREE, group, [0.68, 0.18, 0.38], [length * 0.72, -0.16, 0], trimMat, [0, 0, -0.16]);

    for (var i = 0; i < 5; i++) {
      meshBox(THREE, group, [0.08, 0.18, 0.42], [-0.82 + i * 0.22, 0.03, 0.08], accentMat);
    }

    if (heavy) {
      meshBox(THREE, group, [0.72, 0.2, 0.44], [-1.02, -0.26, 0], darkMat);
      meshCylinder(THREE, group, 0.13, 0.13, 0.52, [-1.56, 0.08, 0], trimMat, [0, 0, Math.PI / 2], 20);
    }

    group.scale.setScalar(smg ? 0.92 : 1);
    return group;
  }

  function bindWeaponMotion(surface, weapon) {
    var firing = false;
    var kick = 0;
    var down = function () { firing = true; kick = Math.min(1, kick + 0.35); };
    var up = function () { firing = false; };
    surface.addEventListener('pointerdown', down);
    surface.addEventListener('pointerup', up);
    surface.addEventListener('pointerleave', up);
    var stop = rafLoop(function (delta, now) {
      kick *= Math.pow(0.0015, delta / 1000);
      if (firing) kick = Math.min(1, kick + delta / 160);
      var bob = Math.sin(now / 520) * 0.025;
      weapon.position.y = weapon.userData.baseY + bob - kick * 0.08;
      weapon.rotation.x = weapon.userData.baseRx - kick * 0.1;
      weapon.rotation.z = weapon.userData.baseRz + Math.sin(now / 680) * 0.012 + kick * 0.035;
    });
    window.addEventListener('pagehide', stop);
  }

  function enhanceShooterScene(THREE, scene, camera, canvas, overrides) {
    if (!THREE || !scene || !camera || scene.userData.reflexEnhanced) return null;
    scene.userData.reflexEnhanced = true;
    var profile = gameProfile(overrides);

    try {
      var loader = new THREE.TextureLoader();
      loader.load(gameAssetPath(profile.backdrop), function (texture) {
        texture.encoding = THREE.sRGBEncoding;
        var plane = new THREE.Mesh(
          new THREE.PlaneGeometry(23, 12.9),
          new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.96 })
        );
        plane.name = 'Generated training arena backdrop';
        plane.position.set(0, 3.05, -11.75);
        scene.add(plane);
      });
    } catch (error) {
      // The procedural scene still works if the image texture cannot load.
    }

    var accentMat = makeMaterial(THREE, profile.accentHex, 0.34, 0.26, profile.accentHex);
    var coverMat = makeMaterial(THREE, 0xd7e2ee, 0.18, 0.58);
    for (var i = 0; i < 4; i++) {
      meshBox(THREE, scene, [1.35, 1.0, 0.75], [-6 + i * 4, -1.5, -5.5 - (i % 2) * 2.2], coverMat);
      meshBox(THREE, scene, [1.35, 0.04, 0.78], [-6 + i * 4, -0.95, -5.5 - (i % 2) * 2.2], accentMat);
    }

    var weapon = createFirstPersonWeapon(THREE, profile);
    weapon.scale.setScalar(profile.weapon === 'grenade' ? 0.34 : 0.38);
    weapon.position.set(profile.weapon === 'grenade' ? 1.12 : 1.35, -0.92, -1.55);
    weapon.rotation.set(-0.08, -0.62, 0.03);
    weapon.userData.baseY = weapon.position.y;
    weapon.userData.baseRx = weapon.rotation.x;
    weapon.userData.baseRz = weapon.rotation.z;
    camera.add(weapon);
    if (!camera.parent) scene.add(camera);
    bindWeaponMotion(canvas || document, weapon);
    return weapon;
  }

  function upgradeShooterDummy(THREE, group, overrides) {
    if (!THREE || !group || group.userData.reflexEnhanced) return group;
    group.userData.reflexEnhanced = true;
    var profile = gameProfile(overrides);
    var accent = profile.accentHex || colorToNumber(profile.accent, 0x2563eb);
    var scale = group.userData.scale || 1;

    group.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.42;
          child.material.metalness = 0.18;
        }
      }
    });

    var armorMat = makeMaterial(THREE, 0xf8fbff, 0.2, 0.38);
    var darkMat = makeMaterial(THREE, 0x111827, 0.35, 0.5);
    var accentMat = makeMaterial(THREE, accent, 0.32, 0.24, accent);

    meshBox(THREE, group, [0.48 * scale, 0.12 * scale, 0.08 * scale], [0, 0.64 * scale, 0.17 * scale], accentMat);
    meshBox(THREE, group, [0.46 * scale, 0.52 * scale, 0.08 * scale], [0, 0.1 * scale, 0.19 * scale], armorMat);
    meshBox(THREE, group, [0.26 * scale, 0.2 * scale, 0.1 * scale], [0, 0.12 * scale, 0.25 * scale], accentMat);
    meshBox(THREE, group, [0.22 * scale, 0.16 * scale, 0.24 * scale], [-0.43 * scale, 0.26 * scale, 0], armorMat);
    meshBox(THREE, group, [0.22 * scale, 0.16 * scale, 0.24 * scale], [0.43 * scale, 0.26 * scale, 0], armorMat);
    meshBox(THREE, group, [0.56 * scale, 0.08 * scale, 0.08 * scale], [0, -0.34 * scale, 0.16 * scale], darkMat);

    try {
      var ringGeo = new THREE.TorusGeometry(0.18 * scale, 0.012 * scale, 10, 36);
      var ring = new THREE.Mesh(ringGeo, accentMat);
      ring.position.set(0, 0.14 * scale, 0.255 * scale);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    } catch (error) {
      // Torus support exists in Three r128, this is just defensive.
    }

    return group;
  }

  function hasPlayableSurface(el) {
    return el && (
      el.querySelector('canvas') ||
      el.classList.contains('recoil-trainer') ||
      el.classList.contains('recoil-stage') ||
      el.classList.contains('nade-arena') ||
      el.classList.contains('lineup-arena') ||
      el.classList.contains('grenade-stage') ||
      el.classList.contains('lineup-stage') ||
      el.classList.contains('aim-canvas-wrap') ||
      el.classList.contains('game-canvas-wrap')
    );
  }

  function enhanceGameAssets() {
    var selectors = [
      '.aim-canvas-wrap',
      '.game-canvas-wrap',
      '.recoil-trainer',
      '.recoil-stage',
      '.nade-arena',
      '.lineup-arena',
      '.grenade-stage',
      '.lineup-stage'
    ].join(',');

    Array.prototype.slice.call(document.querySelectorAll(selectors)).forEach(function (surface) {
      if (!hasPlayableSurface(surface)) return;
      var profile = gameProfile();
      surface.classList.add('game-stage-enhanced');
      surface.style.setProperty('--game-bg', 'url("' + gameAssetPath(profile.backdrop) + '")');
      surface.style.setProperty('--game-target-image', 'url("' + gameAssetPath(profile.targetImage) + '")');
      surface.style.setProperty('--game-weapon-reference', 'url("' + gameAssetPath(profile.weaponImage) + '")');
      surface.style.setProperty('--game-accent', profile.accent);
      if (surface.classList.contains('aim-canvas-wrap') && /(?:valorant|csgo|apex|fortnite)-aim-trainer/.test(window.location.pathname)) {
        return;
      }
      if (surface.querySelector('.weapon-overlay')) return;
      var img = document.createElement('img');
      img.className = 'weapon-overlay weapon-overlay-fallback' + (profile.weapon === 'smg' ? ' is-smg' : '');
      img.src = gameAssetPath(profile.weaponImage);
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('aria-hidden', 'true');
      surface.appendChild(img);
      mountWeaponCanvas(surface, profile);
    });
  }

  function mountWeaponCanvas(surface, profile) {
    if (!surface || surface.querySelector('.game-weapon-canvas')) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'game-weapon-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    surface.appendChild(canvas);

    ensureThree().then(function (THREE) {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.05, 6);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      var key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(3, 4, 5);
      key.castShadow = true;
      scene.add(key);
      var rim = new THREE.DirectionalLight(profile.accentHex || 0x38bdf8, 0.65);
      rim.position.set(-3, 2, 3);
      scene.add(rim);

      var weapon = createFirstPersonWeapon(THREE, profile);
      weapon.position.set(profile.weapon === 'grenade' ? 0.42 : 0.18, profile.weapon === 'grenade' ? -0.08 : -0.3, 0);
      weapon.rotation.set(-0.18, -0.58, 0.08);
      weapon.userData.baseY = weapon.position.y;
      weapon.userData.baseRx = weapon.rotation.x;
      weapon.userData.baseRz = weapon.rotation.z;
      scene.add(weapon);

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var width = Math.max(1, Math.round(rect.width));
        var height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      resize();
      var observer = null;
      if ('ResizeObserver' in window) {
        observer = new ResizeObserver(resize);
        observer.observe(canvas);
      } else {
        window.addEventListener('resize', resize, { passive: true });
      }

      bindWeaponMotion(surface, weapon);
      var stop = rafLoop(function () {
        renderer.render(scene, camera);
      });

      surface.classList.add('has-3d-weapon');
      window.addEventListener('pagehide', function () {
        stop();
        if (observer) observer.disconnect();
        renderer.dispose();
      });
    }).catch(function () {
      surface.classList.add('no-3d-weapon');
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function drawBodyTarget(ctx, x, y, scale, accent) {
    if (!ctx) return;
    var s = scale || 1;
    var color = accent || '#2563eb';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(203, 217, 234, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, 172, 70, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, -72, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.bezierCurveTo(-58, -26, -84, 40, -84, 132);
    ctx.lineTo(84, 132);
    ctx.bezierCurveTo(84, 40, 58, -26, 0, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-52, 52);
    ctx.lineTo(52, 52);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 106);
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, -72, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWeapon(ctx, x, y, scale, accent) {
    if (!ctx) return;
    var s = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = accent || '#2563eb';
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(230, 48);
    ctx.lineTo(258, 10);
    ctx.lineTo(328, 10);
    ctx.lineTo(365, 48);
    ctx.lineTo(408, 48);
    ctx.lineTo(408, 88);
    ctx.lineTo(222, 88);
    ctx.lineTo(176, 128);
    ctx.lineTo(118, 128);
    ctx.lineTo(142, 88);
    ctx.lineTo(0, 88);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 32, 51, 0.32)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(34, 22);
    ctx.lineTo(278, 22);
    ctx.moveTo(320, 22);
    ctx.lineTo(390, 22);
    ctx.stroke();
    ctx.restore();
  }

  function rafLoop(fn) {
    var active = true;
    var last = performance.now();
    function frame(now) {
      if (!active) return;
      var delta = Math.min(48, now - last);
      last = now;
      fn(delta, now);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return function stop() { active = false; };
  }

  window.ReflexGameKit = Object.assign(window.ReflexGameKit || {}, {
    clamp: clamp,
    now: function () { return performance.now(); },
    drawBodyTarget: drawBodyTarget,
    drawWeapon: drawWeapon,
    rafLoop: rafLoop,
    gameProfile: gameProfile,
    createFirstPersonWeapon: createFirstPersonWeapon,
    enhanceShooterScene: enhanceShooterScene,
    upgradeShooterDummy: upgradeShooterDummy
  });

  function debounceAggressiveStarts() {
    var last = 0;
    document.addEventListener('click', function (event) {
      var target = event.target.closest('.reflex-circle-wrap, .game-circle, [data-reflex-trigger]');
      if (!target) return;
      var now = performance.now();
      if (now - last < 90) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      last = now;
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      enhanceAccessibility();
      enhanceCanvasResize();
      enhanceGameAssets();
      debounceAggressiveStarts();
    });
  } else {
    enhanceAccessibility();
    enhanceCanvasResize();
    enhanceGameAssets();
    debounceAggressiveStarts();
  }
})();
