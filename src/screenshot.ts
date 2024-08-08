import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import type { Screenshot } from './types';
import { Logger, sleep } from './utils';

const SAVE_DIR = '__screenshots__';

type TakeScreenshotOptions = {
  executablePath: string;
  urls: string[];
  viewport: { width: number; height: number };
  delay?: number;
  commitSha: string;
};

export const takeScreenshots = async (
  options: TakeScreenshotOptions,
): Promise<Screenshot[]> => {
  const { executablePath, urls, viewport, delay, commitSha } = options;

  const browser = await puppeteer.launch({
    executablePath,
    defaultViewport: viewport,
  });
  const page = await browser.newPage();

  const screenshots: Screenshot[] = [];

  for (const url of urls) {
    await page.goto(url);

    if (delay) await sleep(delay);
    Logger.info(`Take screenshot. ${url}`);
    const savePath = genSavePath(url, commitSha);
    await page.screenshot({ path: savePath });

    screenshots.push({ url, path: savePath });
  }

  await browser.close();

  return screenshots;
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
