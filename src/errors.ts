import type { ZodError } from 'zod';

export class InvalidInputError extends Error {
  name = 'InvalidInputError';

  constructor(zodErr: ZodError) {
    super();
    this.message = zodErr.errors
      .map((e) => `${e.path[0]}: ${e.message}`)
      .join('\n');
  }
}

export class ReadmeNotExistsError extends Error {
  name = 'ReadmeNotExistsError';

  constructor() {
    super();
    this.message = 'README.md does not exists';
  }
}

export class ServerWorkingDirNotExistsError extends Error {
  name = 'ServerWorkingDirNotExistsError';

  constructor(serverWorkingDir: string) {
    super();
    this.message = `Path "${serverWorkingDir}" does not exists`;
  }
}

export class InvalidTagError extends Error {
  name = 'InvalidTagError';

  constructor() {
    super();
    this.message = `Add the following tag to README.md
    <!-- [README-SCREENSHOT-BEGIN] -->
    <!-- [README-SCREENSHOT-END] -->
    `;
  }
}
