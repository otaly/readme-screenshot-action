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

export class ReadmeNotExistError extends Error {
  name = 'ReadmeNotExistError';

  constructor() {
    super();
    this.message = 'README.md does not exist';
  }
}

export class ServerWorkingDirNotExistError extends Error {
  name = 'ServerWorkingDirNotExistError';

  constructor(serverWorkingDir: string) {
    super();
    this.message = `Path "${serverWorkingDir}" does not exist`;
  }
}

export class InvalidTagError extends Error {
  name = 'InvalidTagError';

  constructor() {
    super();
    this.message = `Add the following tag to README.md
    <!-- :README-SCREENSHOT-BEGIN: -->
    <!-- :README-SCREENSHOT-END: -->
    `;
  }
}
