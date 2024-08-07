import { createReadmeFromFile } from './readme';
import { initSaveDir, takeScreenshot } from './screenshot';
import { ServerConnection } from './server-connection';

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

  const savePath = await takeScreenshot({
    executablePath,
    url: inputs.url,
    viewport: inputs.viewport,
    delay: inputs.delay,
    commitSha,
  });

  console.log('update README.');
  const newReadme = readme.updateScreenshot(inputs.url, savePath);
  newReadme.save();

  console.log('disconnect server.');
  serverConnection.disconnect();
};
