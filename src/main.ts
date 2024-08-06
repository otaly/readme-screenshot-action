import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import waitOn from 'wait-on';
import { ServerRunner } from './server-runner';

const SAVE_DIR = '__screenshots__';

type Inputs = {
  url: string;
  serverCmd?: string;
  serverWorkingDir?: string;
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
    serverRunner.start(inputs.serverCmd, inputs.serverWorkingDir);

    console.log('wait server....');
    await waitServer(inputs.url);
  }

  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();

  console.log('access url.');
  await page.goto(inputs.url);

  initSaveDir();
  const savePath = genSavePath(inputs.url, commitSha);
  console.log('take screenshot.');
  await page.screenshot({ path: savePath });

  await browser.close();

  console.log('update README.');
  updateReadme(inputs.url, savePath);

  console.log('close server.');
  serverRunner?.close();
};

const waitServer = (url: string) => {
  const resource = url.startsWith('https')
    ? url.replace('https', 'https-get')
    : url.replace('http', 'http-get');
  return waitOn({ resources: [resource], timeout: 30000 });
};

const initSaveDir = () => {
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
