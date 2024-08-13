import { createReadmeFromFile } from './readme';
import { initSaveDir, takeScreenshots } from './screenshot';
import { ServerConnection } from './server-connection';
import { Logger } from './utils';

type Inputs = {
  urls: string[];
  viewport: {
    width: number;
    height: number;
  };
  serverCmd?: string;
  serverWorkingDir?: string;
  delay?: number;
};

export type Options = {
  inputs: Inputs;
  executablePath: string;
  commitSha: string;
};

export const main = async (options: Options) => {
  const { inputs, executablePath, commitSha } = options;

  const readme = createReadmeFromFile();

  const serverConnection = new ServerConnection(
    inputs.urls,
    inputs.serverCmd,
    inputs.serverWorkingDir,
  );

  Logger.info('Connecting to server....');
  await serverConnection.connect();

  initSaveDir();

  const screenshots = await takeScreenshots({
    executablePath,
    urls: inputs.urls,
    viewport: inputs.viewport,
    delay: inputs.delay,
    commitSha,
  });

  Logger.info('Update README.');
  const newReadme = readme.updateScreenshots(screenshots);
  newReadme.save();

  Logger.info('Disconnect server.');
  serverConnection.disconnect();
};
