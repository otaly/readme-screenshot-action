import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  Browser,
  BrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';

export const installChrome = async () => {
  const browser = Browser.CHROME;
  const buildId = await resolveBuildId(
    browser,
    BrowserPlatform.LINUX,
    'stable',
  );
  const { executablePath } = await install({
    cacheDir: join(homedir(), '.cache', 'puppeteer'),
    browser,
    buildId,
  });

  return { executablePath };
};
