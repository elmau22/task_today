import { useEffect, useRef } from 'react';

/*
 * Kanvas partikel hidup: daun berguguran, serbuk sari cahaya, dan kupu-kupu.
 * Dioptimalkan agar ringan pada ponsel (HP), tablet, maupun komputer/laptop.
 */

const PALETTES = {
  green: ['#5f9b3c', '#79b04a', '#3f7d3a', '#9cc95a', '#d9b84a', '#4f8f45'],
  autumn: ['#e0574f', '#c94640', '#ef7a62', '#d8604c', '#b8393a', '#f19a7c'],
};

const BUTTERFLY_COLORS = [
  ['#f59a2b', '#fff0c2'],
  ['#ffffff', '#cfe6f7'],
  ['#e8463c', '#ffd9a8'],
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createLeaf(width, height, spawnAnywhere, colors) {
  return {
    x: random(-0.05, 1.05) * width,
    y: spawnAnywhere ? random(0, height) : random(-60, -15),
    size: random(5, 10),
    fall: random(0.35, 0.75),
    swayAmp: random(0.4, 1.1),
    swaySpeed: random(0.007, 0.015),
    phase: random(0, Math.PI * 2),
    rotation: random(0, Math.PI * 2),
    spin: random(-0.02, 0.02),
    flipSpeed: random(0.01, 0.03),
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: random(0.7, 0.95),
  };
}

function createDust(width, height) {
  return {
    x: random(0, width),
    y: random(0, height),
    r: random(0.7, 1.8),
    vx: random(-0.06, 0.06),
    vy: random(-0.18, -0.04),
    phase: random(0, Math.PI * 2),
    twinkle: random(0.012, 0.025),
  };
}

function createButterfly(width, height) {
  const [wing, accent] = BUTTERFLY_COLORS[Math.floor(Math.random() * BUTTERFLY_COLORS.length)];
  return {
    x: random(0.25, 0.85) * width,
    y: random(0.5, 0.85) * height,
    angle: random(0, Math.PI * 2),
    speed: random(0.5, 0.85),
    phase: random(0, Math.PI * 2),
    flap: random(0.3, 0.42),
    size: random(6, 8),
    wing,
    accent,
  };
}

function drawLeaf(ctx, leaf, t) {
  const s = leaf.size;
  const flip = Math.cos(t * leaf.flipSpeed + leaf.phase);

  ctx.save();
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate(leaf.rotation);
  ctx.scale(1, 0.35 + Math.abs(flip) * 0.65);
  ctx.globalAlpha = leaf.alpha;

  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.75, -s * 0.55, s * 0.6, s * 0.55, 0, s);
  ctx.bezierCurveTo(-s * 0.6, s * 0.55, -s * 0.75, -s * 0.55, 0, -s);
  ctx.fillStyle = leaf.color;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(20, 40, 63, 0.75)';
  ctx.stroke();

  ctx.restore();
}

function drawButterfly(ctx, b, t) {
  const spread = Math.abs(Math.sin(t * b.flap + b.phase));
  const s = b.size;

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle + Math.PI / 2);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(20, 40, 63, 0.9)';

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side * (0.2 + spread * 0.8), 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 1.4, -s * 1.5, s * 1.8, -s * 0.1, s * 0.2, s * 0.2);
    ctx.closePath();
    ctx.fillStyle = b.wing;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(0, s * 1);
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

export default function LeafCanvas({
  leafCount = 10,
  dustCount = 18,
  butterflies = 0,
  palette = 'green',
  dustColor = '#fff3b0',
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;

    const ctx = canvas.getContext('2d');
    const colors = PALETTES[palette] || PALETTES.green;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let leaves = [];
    let dust = [];
    let flies = [];
    let frameId = null;
    let isVisible = true;
    let isTabActive = true;
    let t = 0;
    let lastRenderTime = 0;

    const resize = () => {
      width = parent.clientWidth || window.innerWidth;
      height = parent.clientHeight || window.innerHeight;

      // Pada HP/layar kecil (< 768px), gunakan DPR max 1.25 untuk menghemat GPU/baterai
      const isMobile = width < 768;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Skala jumlah partikel agar sangat ringan di HP & tablet
      const countScale = isMobile ? 0.35 : width < 1024 ? 0.65 : 1;
      const activeLeafCount = Math.max(3, Math.round(leafCount * countScale));
      const activeDustCount = Math.max(5, Math.round(dustCount * countScale));
      const activeFlies = isMobile ? Math.min(1, butterflies) : butterflies;

      leaves = Array.from({ length: activeLeafCount }, () => createLeaf(width, height, true, colors));
      dust = Array.from({ length: activeDustCount }, () => createDust(width, height));
      flies = Array.from({ length: activeFlies }, () => createButterfly(width, height));

      if (reduceMotion) render(false);
    };

    const render = (advance = true) => {
      ctx.clearRect(0, 0, width, height);
      if (advance) t += 1;

      const wind = Math.sin(t * 0.0025) * 0.3 + 0.15;

      // Gambar debu cahaya
      for (const d of dust) {
        if (advance) {
          d.x += d.vx + wind * 0.06;
          d.y += d.vy;
          if (d.y < -10) {
            d.y = height + 10;
            d.x = random(0, width);
          }
          if (d.x > width + 10) d.x = -10;
          if (d.x < -10) d.x = width + 10;
        }
        const a = 0.3 + (Math.sin(t * d.twinkle + d.phase) + 1) * 0.3;
        ctx.fillStyle = dustColor;
        ctx.globalAlpha = a * 0.7;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Gambar daun
      for (let i = 0; i < leaves.length; i += 1) {
        const leaf = leaves[i];
        if (advance) {
          leaf.y += leaf.fall;
          leaf.x += Math.sin(t * leaf.swaySpeed + leaf.phase) * leaf.swayAmp + wind;
          leaf.rotation += leaf.spin + wind * 0.003;
          if (leaf.y > height + 25 || leaf.x > width + 40 || leaf.x < -40) {
            leaves[i] = createLeaf(width, height, false, colors);
            continue;
          }
        }
        drawLeaf(ctx, leaf, t);
      }

      // Gambar kupu-kupu
      for (const b of flies) {
        if (advance) {
          b.angle += Math.sin(t * 0.02 + b.phase) * 0.05;
          const minY = height * 0.45;
          const maxY = height * 0.92;
          if (b.y < minY) b.angle += (Math.PI / 2 - b.angle) * 0.05;
          if (b.y > maxY) b.angle += (-Math.PI / 2 - b.angle) * 0.05;
          b.x += Math.cos(b.angle) * b.speed;
          b.y += Math.sin(b.angle) * b.speed + Math.sin(t * 0.25 + b.phase) * 0.3;
          if (b.x > width + 20) b.x = -20;
          if (b.x < -30) b.x = width + 10;
        }
        drawButterfly(ctx, b, t);
      }
    };

    const loop = (timestamp) => {
      // Throttle rendering ke ~45-50 FPS di HP untuk efisiensi baterai & kinerja ringan
      const isMobile = width < 768;
      const minInterval = isMobile ? 22 : 16;

      if (timestamp - lastRenderTime >= minInterval) {
        render(true);
        lastRenderTime = timestamp;
      }
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || frameId !== null || !isVisible || !isTabActive) return;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    resize();
    start();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    // Hentikan animasi saat kanvas tidak berada di viewport
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });
    visibilityObserver.observe(canvas);

    // Jeda animasi saat pengguna meminimalkan browser atau beralih aplikasi di ponsel
    const handleDocVisibility = () => {
      isTabActive = !document.hidden;
      if (isTabActive && isVisible) start();
      else stop();
    };
    document.addEventListener('visibilitychange', handleDocVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleDocVisibility);
    };
  }, [leafCount, dustCount, butterflies, palette, dustColor]);

  return <canvas ref={canvasRef} className={`leaf-canvas ${className}`} aria-hidden="true" />;
}
