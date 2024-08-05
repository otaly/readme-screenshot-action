import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { ServerRunner } from './server-runner';

const SAVE_DIR = '__screenshots__';

type Inputs = {
  url: string;
  serverCmd?: string;
};

type Options = {
  inputs: Inputs;
  executablePath: string;
  commitSha: string;
};

export const main = async (options: Options) => {
  const { inputs, executablePath, commitSha } = options;

  let serverRunner: ServerRunner | undefined;
  if (inputs.serverCmd) {
    serverRunner = new ServerRunner();
    serverRunner.start(inputs.serverCmd);
  }

  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();

  await page.goto(inputs.url);

  fs.mkdirSync(SAVE_DIR, { recursive: true });
  const savePath = genSavePath(inputs.url, commitSha);
  await page.screenshot({ path: savePath });

  await browser.close();

  updateReadme(inputs.url, savePath);

  serverRunner?.close();
};

const genSavePath = (url: string, sha: string) => {
  const urlPath = new URL(url).pathname.split('/').filter(Boolean).join('-');
  return join(SAVE_DIR, `${urlPath ?? `${urlPath}-`}${shortSha(sha)}.png`);
};

const shortSha = (sha: string) => sha.slice(0, 7);

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
