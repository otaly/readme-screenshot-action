import * as core from '@actions/core';
import * as github from '@actions/github';
import { installChrome } from './install-chrome';
import { main } from './main';

const run = async () => {
  const { executablePath } = await installChrome();

  const url = core.getInput('url');
  const widthStr = core.getInput('width');
  const width = widthStr ? Number(widthStr) : 1920;
  const heightStr = core.getInput('height');
  const height = heightStr ? Number(heightStr) : 1080;
  const serverCmd = core.getInput('server_command');
  const serverWorkingDir = core.getInput('server_working_dir');
  const delayStr = core.getInput('delay');
  const delay = delayStr ? Number(delayStr) : 0;

  await main({
    inputs: {
      url,
      viewport: { width, height },
      serverCmd,
      serverWorkingDir,
      delay,
    },
    executablePath,
    commitSha: github.context.sha,
  });
};

run();
