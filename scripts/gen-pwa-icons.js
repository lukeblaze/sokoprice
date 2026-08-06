const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, '..', 'node_modules', 'pngjs'));

function resize(src, size) {
  const out = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor((x / size) * src.width);
      const sy = Math.floor((y / size) * src.height);
      const srcIdx = (src.width * sy + sx) << 2;
      const dstIdx = (size * y + x) << 2;
      out.data[dstIdx] = src.data[srcIdx];
      out.data[dstIdx + 1] = src.data[srcIdx + 1];
      out.data[dstIdx + 2] = src.data[srcIdx + 2];
      out.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }
  return out;
}

const srcPath = path.join(__dirname, '..', 'assets', 'icon.png');
const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

fs.createReadStream(srcPath)
  .pipe(new PNG())
  .on('parsed', function () {
    for (const size of [192, 512]) {
      const resized = resize(this, size);
      resized.pack().pipe(fs.createWriteStream(path.join(publicDir, `icon-${size}.png`)));
    }
    console.log('pwa icons generated');
  });
