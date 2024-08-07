import * as fs from 'node:fs';

export const readmeExists = () => fs.existsSync('README.md');
