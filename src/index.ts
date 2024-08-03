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
  const savePath = genSavePath(url);
  await page.screenshot({ path: savePath });

  await browser.close();

  updateReadme(url, savePath);
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

const updateReadme = (url: string, screenshotPath: string) => {
  const file = fs.readFileSync('README.md', { encoding: 'utf8' });

  const lines = file.split('\n');
  const begin = lines.findIndex((l) =>
    /<!-- *\[README-SCREENSHOT-BEGIN\] *-->/.test(l),
  );
  const end = lines.findIndex((l) =>
    /<!-- \[README-SCREENSHOT-END\] -->/.test(l),
  );

  // 開始タグと終了タグの間を置換
  lines.splice(begin + 1, end - begin - 1, `![${url}](${screenshotPath})`);

  fs.writeFileSync('README.md', lines.join('\n'));
};

run();
