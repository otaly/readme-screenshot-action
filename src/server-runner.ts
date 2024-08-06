import * as cp from 'node:child_process';
import { join } from 'node:path';

export class ServerRunner {
  private proc?: cp.ChildProcess;

  start(serverCmd: string) {
    const [cmd, ...args] = serverCmd.split(/\s+/);
    this.proc = cp.spawn(cmd, args, {
      shell: true,
      cwd: join(__dirname, '..', 'sampleapp'),
      stdio: [0, 1, 2],
    });

    process.on('exit', () => {
      this.close();
      console.log('exit');
    });

    process.on('SIGTERM', () => {
      this.close();
      console.log('SIGTERM');
      process.exit();
    });
  }

  close() {
    if (this.proc && !this.proc.killed) {
      this.proc.kill();
    }
  }
}
