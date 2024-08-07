import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import waitOn from 'wait-on';
import { updateReadme } from './readme';
import { ServerRunner } from './server-runner';
import { sleep } from './utils';

const SAVE_DIR = '__screenshots__';

type Inputs = {
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  serverCmd?: string;
  serverWorkingDir?: string;
  delay?: number;
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

  const browser = await puppeteer.launch({
    executablePath,
    defaultViewport: inputs.viewport,
  });
  const page = await browser.newPage();

  console.log('access url.');
  await page.goto(inputs.url);

  initSaveDir();
  const savePath = genSavePath(inputs.url, commitSha);

  if (inputs.delay) await sleep(inputs.delay);
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
  return join(SAVE_DIR, `${urlPath && `${urlPath}_`}${shortSha(sha)}.png`);
};

const shortSha = (sha: string) => sha.slice(0, 7);
