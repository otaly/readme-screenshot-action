import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  Browser,
  BrowserPlatform,
  install,
  resolveBuildId,
} from '@puppeteer/browsers';

export const installChrome = async () => {
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
