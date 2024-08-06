import * as core from '@actions/core';
import * as github from '@actions/github';
import { installChrome } from './install-chrome';
import { main } from './main';

const run = async () => {
  const { executablePath } = await installChrome();

  const url = core.getInput('url');
  const serverCmd = core.getInput('server_command');
  const serverWorkingDir = core.getInput('server_working_dir');

  await main({
    inputs: { url, serverCmd, serverWorkingDir },
    executablePath,
    commitSha: github.context.sha,
  });
};

run();
