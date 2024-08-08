import { createReadmeFromFile } from './readme';
import { initSaveDir, takeScreenshots } from './screenshot';
import { ServerConnection } from './server-connection';

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

type Options = {
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

  console.log('connecting to server....');
  await serverConnection.connect();

  initSaveDir();

  const screenshots = await takeScreenshots({
    executablePath,
    urls: inputs.urls,
    viewport: inputs.viewport,
    delay: inputs.delay,
    commitSha,
  });

  console.log('update README.');
  const newReadme = readme.updateScreenshots(screenshots);
  newReadme.save();

  console.log('disconnect server.');
  serverConnection.disconnect();

  return screenshots;
};
