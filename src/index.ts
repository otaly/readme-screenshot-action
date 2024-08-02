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
  installChrome();

  const url = core.getInput('url');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
};

const installChrome = async () => {
  const browser = Browser.CHROME;
  const buildId = await resolveBuildId(
    browser,
    BrowserPlatform.LINUX,
    'latest',
  );
  await install({
    cacheDir: join(homedir(), '.cache', 'puppeteer'),
    browser,
    buildId,
  });
};

run();
