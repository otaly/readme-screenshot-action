import * as fs from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer';
import { createReadmeFromFile } from './readme';
import { ServerConnection } from './server-connection';
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

  const readme = createReadmeFromFile();
  readme.validate();

  const serverConnection = new ServerConnection(
    inputs.url,
    inputs.serverCmd,
    inputs.serverWorkingDir,
  );

  console.log('connecting to server....');
  await serverConnection.connect();

  initSaveDir();
  const savePath = genSavePath(inputs.url, commitSha);

  await takeScreenshot({
    savePath,
    executablePath,
    url: inputs.url,
    viewport: inputs.viewport,
    delay: inputs.delay,
  });

  console.log('update README.');
  const newReadme = readme.updateScreenshot(inputs.url, savePath);
  newReadme.save();

  console.log('disconnect server.');
  serverConnection.disconnect();
};

const takeScreenshot = async (
  options: { savePath: string } & Pick<Options, 'executablePath'> &
    Pick<Inputs, 'url' | 'viewport' | 'delay'>,
) => {
  const { savePath, executablePath, url, viewport, delay } = options;

  const browser = await puppeteer.launch({
    executablePath,
    defaultViewport: viewport,
  });
  const page = await browser.newPage();

  await page.goto(url);

  if (delay) await sleep(delay);
  console.log('take screenshot.');
  await page.screenshot({ path: savePath });

  await browser.close();
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
