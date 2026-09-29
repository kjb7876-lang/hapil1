/* RC77: render branched lasers as one continuous luminous path.
 * Complex beams used to stretch the same cropped bitmap once per segment,
 * which restarted its texture at every joint. This renderer keeps owner color,
 * rounds every cap, and adds small glow nodes where branches cross.
 */
(() => {
  'use strict';
  const stats = { draws: 0, segments: 0, junctions: 0, invalid: 0 };
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const cross = (ax, ay, bx, by) => ax * by - ay * bx;

  function junctions(lines, tolerance) {
    const points = [];
    const add = p => {
      if (!points.some(q => Math.hypot(q.x - p.x, q.y - p.y) <= tolerance))
        points.push({ x: p.x, y: p.y });
    };
    for (let i = 0; i < lines.length; i++) {
      const a = lines[i].a, b = lines[i].b;
      for (let j = 0; j < i; j++) {
        const c = lines[j].a, d = lines[j].b;
        const rx = b.x - a.x, ry = b.y - a.y;
        const sx = d.x - c.x, sy = d.y - c.y;
        const denominator = cross(rx, ry, sx, sy);
        if (Math.abs(denominator) < 1e-5) {
          for (const p of [a, b]) for (const q of [c, d])
            if (Math.hypot(p.x - q.x, p.y - q.y) <= tolerance)
              add({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
          continue;
        }
        const qx = c.x - a.x, qy = c.y - a.y;
        const t = cross(qx, qy, sx, sy) / denominator;
        const u = cross(qx, qy, rx, ry) / denominator;
        if (t >= -1e-5 && t <= 1.00001 && u >= -1e-5 && u <= 1.00001)
          add({ x: a.x + rx * clamp(t, 0, 1), y: a.y + ry * clamp(t, 0, 1) });
      }
    }
    return points;
  }

  function render(ctx, source, options = {}) {
    if (!ctx || typeof ctx.beginPath !== 'function' || !Array.isArray(source)) {
      stats.invalid++;
      return false;
    }
    const lines = source.filter(line => line?.a && line?.b &&
      [line.a.x, line.a.y, line.b.x, line.b.y].every(Number.isFinite) &&
      Math.hypot(line.b.x - line.a.x, line.b.y - line.a.y) >= 0.75);
    if (!lines.length) return false;

    const width = clamp(finite(options.width) || 7, 1, 160);
    const alpha = clamp(finite(options.alpha ?? 1), 0, 1);
    const color = String(options.color || '#f4baff');
    const accent = String(options.accent || '#fff4ff');
    const quiet = options.quiet === true;
    const low = options.low === true;
    const shock = clamp(finite(options.shock), 0, 1);
    const drawStroke = (style, lineWidth, opacity, blur, composite = 'screen') => {
      ctx.save();
      try {
        ctx.globalCompositeOperation = composite;
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = style;
        ctx.shadowBlur = blur;
        ctx.beginPath();
        for (const line of lines) {
          ctx.moveTo(line.a.x, line.a.y);
          ctx.lineTo(line.b.x, line.b.y);
        }
        ctx.stroke();
      } finally { ctx.restore(); }
    };

    ctx.save();
    try {
      ctx.setLineDash?.([]);
      drawStroke(color, width * (quiet ? 1.7 : 2.35), alpha * (quiet ? 0.34 : 0.70 + shock * 0.12), low ? 0 : quiet ? 3 : 15);
      drawStroke(accent, Math.max(1.5, width * 0.88), alpha * (quiet ? 0.20 : 0.54), low ? 0 : quiet ? 1 : 8);
      if (!quiet) drawStroke('#fff9f0', Math.max(1, width * 0.22), alpha * (0.30 + shock * 0.2), low ? 0 : 3, 'lighter');

      const nodes = junctions(lines, Math.max(2.5, width * 0.48));
      ctx.globalCompositeOperation = 'screen';
      for (const p of nodes) {
        ctx.globalAlpha = alpha * (quiet ? 0.22 : 0.56);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = low ? 0 : quiet ? 2 : 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, width * 0.86), 0, Math.PI * 2);
        ctx.fill();
        if (!quiet) {
          ctx.globalAlpha = alpha * 0.62;
          ctx.fillStyle = accent;
          ctx.shadowBlur = low ? 0 : 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, width * 0.30), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      stats.draws++;
      stats.segments += lines.length;
      stats.junctions += nodes.length;
      return true;
    } finally { ctx.restore(); }
  }

  window.__HAPIL_CONNECTED_LASER_V31377__ = Object.freeze({
    installed: true,
    version: '3.13.77',
    render,
    junctions,
    stats: () => Object.freeze({ ...stats }),
  });
})();
