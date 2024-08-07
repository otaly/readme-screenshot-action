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
