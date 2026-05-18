import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const files = fs.readdirSync(dir).filter(f => /^screenshot-\d+/.test(f));
const n = files.reduce((max, f) => {
  const m = f.match(/screenshot-(\d+)/);
  return m ? Math.max(max, +m[1]) : max;
}, 0) + 1;

const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const filePath = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: filePath, fullPage: false });
await browser.close();
console.log(`Saved: temporary screenshots/${filename}`);
