import fs from 'node:fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import type { ZodError } from 'zod';
import {
  InvalidInputError,
  ReadmeNotExistError,
  ServerWorkingDirNotExistError,
} from './errors';
import { installChrome } from './install-chrome';
import { main } from './main';
import { readmeExists } from './readme';
import { type UserInputs, userInputsSchema } from './validation';

const run = async () => {
  let userInputs: UserInputs;

  try {
    userInputs = userInputsSchema.parse({
      urls: core.getMultilineInput('urls'),
      width: getInput('width'),
      height: getInput('height'),
      server_command: getInput('server_command'),
      server_working_dir: getInput('server_working_dir'),
      delay: getInput('delay'),
    });
  } catch (error) {
    core.setFailed(new InvalidInputError(error as ZodError));
    return;
  }

  try {
    validateEnvironment(userInputs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
    return;
  }

  const { executablePath } = await installChrome();

  try {
    await main({
      inputs: {
        urls: userInputs.urls,
        viewport: { width: userInputs.width, height: userInputs.height },
        serverCmd: userInputs.server_command,
        serverWorkingDir:
          userInputs.server_working_dir &&
          core.toPlatformPath(userInputs.server_working_dir),
        delay: userInputs.delay,
      },
      executablePath,
      commitSha: github.context.sha,
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error);
  }
};

const getInput = (name: string) => core.getInput(name) || undefined;

const validateEnvironment = (userInputs: UserInputs) => {
  if (!readmeExists()) {
    throw new ReadmeNotExistError();
  }

  if (
    userInputs.server_command &&
    userInputs.server_working_dir &&
    !fs.existsSync(userInputs.server_working_dir)
  ) {
    throw new ServerWorkingDirNotExistError(userInputs.server_working_dir);
  }
};

run();
