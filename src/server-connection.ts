import * as cp from 'node:child_process';
import waitOn from 'wait-on';

export class ServerConnection {
  private proc?: cp.ChildProcess;

  constructor(
    private url: string,
    private serverCmd?: string,
    private serverWorkingDir?: string,
  ) {}

  async connect() {
    if (this.serverCmd && !this.proc) {
      const [cmd, ...args] = this.serverCmd.split(/\s+/);
      this.proc = cp.spawn(cmd, args, {
        shell: true,
        cwd: this.serverWorkingDir,
        stdio: [0, 1, 2],
      });

      process.on('exit', () => {
        this.disconnect();
        console.log('exit');
      });

      process.on('SIGTERM', () => {
        this.disconnect();
        console.log('SIGTERM');
        process.exit();
      });
    }

    await waitServer(this.url);
  }

  disconnect() {
    if (this.proc && !this.proc.killed) {
      this.proc.kill();
    }
  }
}

const waitServer = (url: string) => {
  const resource = url.startsWith('https')
    ? url.replace('https', 'https-get')
    : url.replace('http', 'http-get');
  return waitOn({ resources: [resource], timeout: 30000 });
};
