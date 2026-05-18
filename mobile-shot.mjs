import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:4000';
const label = process.argv[3] || 'mobile';
const clipHeight = parseInt(process.argv[4] || '900');

const files = fs.readdirSync(dir).filter(f => /^screenshot-\d+/.test(f));
const n = files.reduce((max, f) => {
  const m = f.match(/screenshot-(\d+)/);
  return m ? Math.max(max, +m[1]) : max;
}, 0) + 1;

const filename = `screenshot-${n}-${label}.png`;
const filePath = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

// scroll to trigger reveal animations
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < pageHeight; y += 400) {
  await page.evaluate(yy => window.scrollTo(0, yy), y);
  await new Promise(r => setTimeout(r, 80));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: filePath, clip: { x: 0, y: 0, width: 390, height: clipHeight } });
await browser.close();
console.log(`Saved: temporary screenshots/${filename}`);
