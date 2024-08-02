import * as core from '@actions/core';
import puppeteer from 'puppeteer';

const run = async () => {
  const url = core.getInput('url');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();
};

run();
