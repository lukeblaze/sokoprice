const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, '..', 'node_modules', 'pngjs'));

function blend(dst, idx, [r, g, b, a]) {
  const srcA = a / 255;
  dst.data[idx] = Math.round(r * srcA + dst.data[idx] * (1 - srcA));
  dst.data[idx + 1] = Math.round(g * srcA + dst.data[idx + 1] * (1 - srcA));
  dst.data[idx + 2] = Math.round(b * srcA + dst.data[idx + 2] * (1 - srcA));
  dst.data[idx + 3] = Math.round(a + dst.data[idx + 3] * (1 - srcA));
}

function fill(png, [r, g, b, a]) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }
}

// anti-aliased filled circle via signed-distance coverage
function drawCircle(png, cx, cy, radius, [r, g, b, a]) {
  const minX = Math.max(0, Math.floor(cx - radius - 1));
  const maxX = Math.min(png.width - 1, Math.ceil(cx + radius + 1));
  const minY = Math.max(0, Math.floor(cy - radius - 1));
  const maxY = Math.min(png.height - 1, Math.ceil(cy + radius + 1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.sqrt((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2) - radius;
      const coverage = Math.max(0, Math.min(1, 0.5 - d));
      if (coverage <= 0) continue;
      const idx = (png.width * y + x) << 2;
      blend(png, idx, [r, g, b, Math.round(a * coverage)]);
    }
  }
}

// anti-aliased thick line segment (rounded caps) via distance-to-segment coverage
function drawLine(png, x1, y1, x2, y2, thickness, [r, g, b, a]) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - thickness - 1));
  const maxX = Math.min(png.width - 1, Math.ceil(Math.max(x1, x2) + thickness + 1));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - thickness - 1));
  const maxY = Math.min(png.height - 1, Math.ceil(Math.max(y1, y2) + thickness + 1));
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const half = thickness / 2;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) - half;
      const coverage = Math.max(0, Math.min(1, 0.5 - dist));
      if (coverage <= 0) continue;
      const idx = (png.width * y + x) << 2;
      blend(png, idx, [r, g, b, Math.round(a * coverage)]);
    }
  }
}

// upward trend mark: a rising polyline + arrowhead, scaled to a bounding box
function drawTrendMark(png, centerX, centerY, scale, color) {
  const pts = [
    [-1.0, 0.35], [-0.45, -0.15], [-0.05, 0.2], [0.55, -0.5],
  ].map(([x, y]) => [centerX + x * scale, centerY + y * scale]);
  const thickness = scale * 0.16;
  for (let i = 0; i < pts.length - 1; i++) {
    drawLine(png, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], thickness, color);
  }
  // arrowhead at the final point, pointing along the last segment direction
  const [ex, ey] = pts[pts.length - 1];
  const [px, py] = pts[pts.length - 2];
  const ang = Math.atan2(ey - py, ex - px);
  const headLen = scale * 0.42;
  const spread = 0.55;
  const a1 = ang + Math.PI - spread;
  const a2 = ang + Math.PI + spread;
  drawLine(png, ex, ey, ex + Math.cos(a1) * headLen, ey + Math.sin(a1) * headLen, thickness, color);
  drawLine(png, ex, ey, ex + Math.cos(a2) * headLen, ey + Math.sin(a2) * headLen, thickness, color);
}

function save(png, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  png.pack().pipe(fs.createWriteStream(filePath));
}

const assetsDir = path.join(__dirname, '..', 'assets');
const navy = [13, 27, 42, 255];
const amber = [232, 160, 32, 255];
const white = [255, 255, 255, 255];

// icon.png: navy rounded field, amber price-tag ring + white trend mark (opaque, iOS/general)
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, navy);
  drawCircle(png, size / 2, size / 2, size * 0.34, amber);
  drawTrendMark(png, size / 2, size / 2, size * 0.19, white);
  save(png, path.join(assetsDir, 'icon.png'));
}

// adaptive-icon.png: same mark, transparent background, sized within Android's safe zone
{
  const size = 1024;
  const png = new PNG({ width: size, height: size });
  fill(png, [0, 0, 0, 0]);
  drawCircle(png, size / 2, size / 2, size * 0.27, amber);
  drawTrendMark(png, size / 2, size / 2, size * 0.15, white);
  save(png, path.join(assetsDir, 'adaptive-icon.png'));
}

// splash.png: navy background with centered mark
{
  const w = 1284, h = 2778;
  const png = new PNG({ width: w, height: h });
  fill(png, navy);
  drawCircle(png, w / 2, h / 2, w * 0.17, amber);
  drawTrendMark(png, w / 2, h / 2, w * 0.095, white);
  save(png, path.join(assetsDir, 'splash.png'));
}

// notification-icon.png: flat white mark on transparent (Android alpha-mask requirement)
{
  const size = 96;
  const png = new PNG({ width: size, height: size });
  fill(png, [0, 0, 0, 0]);
  drawCircle(png, size / 2, size / 2, size * 0.34, white);
  drawTrendMark(png, size / 2, size / 2, size * 0.19, navy);
  save(png, path.join(assetsDir, 'notification-icon.png'));
}

console.log('assets generated');
