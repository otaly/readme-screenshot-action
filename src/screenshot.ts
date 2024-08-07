import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { sleep } from './utils';

const SAVE_DIR = '__screenshots__';

type TakeScreenshotOptions = {
  executablePath: string;
  url: string;
  viewport: { width: number; height: number };
  delay?: number;
  commitSha: string;
};

export const takeScreenshot = async (options: TakeScreenshotOptions) => {
  const { executablePath, url, viewport, delay, commitSha } = options;

  const browser = await puppeteer.launch({
    executablePath,
    defaultViewport: viewport,
  });
  const page = await browser.newPage();

  await page.goto(url);

  if (delay) await sleep(delay);
  console.log('take screenshot.');
  const savePath = genSavePath(url, commitSha);
  await page.screenshot({ path: savePath });

  await browser.close();

  return savePath;
};

export const initSaveDir = () => {
  fs.mkdirSync(SAVE_DIR, { recursive: true });

  const pngFiles = fs
    .readdirSync(SAVE_DIR)
    .filter((filename) => filename.endsWith('.png'));

  for (const filename of pngFiles) {
    fs.rmSync(join(SAVE_DIR, filename));
  }
};

const genSavePath = (url: string, sha: string) => {
  const urlPath = new URL(url).pathname.split('/').filter(Boolean).join('-');
  return join(SAVE_DIR, `${urlPath && `${urlPath}_`}${shortSha(sha)}.png`);
};

const shortSha = (sha: string) => sha.slice(0, 7);
