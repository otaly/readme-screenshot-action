import * as core from '@actions/core';
import * as github from '@actions/github';
import type { ZodError } from 'zod';
import { InvalidInputError, ReadmeNotExistsError } from './errors';
import { installChrome } from './install-chrome';
import { main } from './main';
import { readmeExists } from './readme';
import { type UserInputs, userInputsSchema } from './validation';

const run = async () => {
  let userInputs: UserInputs;

  try {
    userInputs = userInputsSchema.parse({
      url: getInput('url'),
      width: getInput('width'),
      height: getInput('height'),
      serverCmd: getInput('server_command'),
      serverWorkingDir: getInput('server_working_dir'),
      delay: getInput('delay'),
    });
  } catch (error) {
    console.error(new InvalidInputError(error as ZodError));
    process.exit(1);
  }

  if (!readmeExists()) {
    console.error(new ReadmeNotExistsError());
    process.exit(1);
  }

  const { executablePath } = await installChrome();

  try {
    await main({
      inputs: {
        url: userInputs.url,
        viewport: { width: userInputs.width, height: userInputs.height },
        serverCmd: userInputs.server_command,
        serverWorkingDir: userInputs.server_working_dir,
        delay: userInputs.delay,
      },
      executablePath,
      commitSha: github.context.sha,
    });
  } catch (error) {
    console.error(error);
  }
};

const getInput = (name: string) => core.getInput(name) || undefined;

run();
