import { homedir } from 'node:os';
import { join } from 'node:path';
import * as core from '@actions/core';
import {
  Browser,
  BrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';
import puppeteer from 'puppeteer';

const run = async () => {
  const { executablePath } = await installChrome();

  const url = core.getInput('url');

  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();

  await page.goto(url);
  await page.screenshot({ path: 'screenshot.png' });

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

run();
