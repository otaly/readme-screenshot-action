import * as fs from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  Browser,
  BrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';
import puppeteer from 'puppeteer';

const SAVE_DIR = '__screenshots__';

const run = async () => {
  const { executablePath } = await installChrome();

  const url = core.getInput('url');

  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();

  await page.goto(url);

  fs.mkdirSync(SAVE_DIR, { recursive: true });
  await page.screenshot({ path: genSavePath(url) });

  await browser.close();
};

const installChrome = async () => {
  const browser = Browser.CHROMEHEADLESSSHELL;
  const buildId = await resolveBuildId(
    browser,
    BrowserPlatform.LINUX,
    'stable',
  );
  return await install({
    cacheDir: join(homedir(), '.cache', 'puppeteer'),
    browser,
    buildId,
  });
};

const genSavePath = (url: string) => {
  const urlPath = new URL(url).pathname.split('/').filter(Boolean).join('-');
  return join(SAVE_DIR, `${urlPath ?? `${urlPath}-`}${shortSha()}.png`);
};

const shortSha = () => github.context.sha.slice(0, 7);

run();
