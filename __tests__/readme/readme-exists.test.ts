import * as fs from 'node:fs';
import { readmeExists } from 'src/readme';

jest.mock('node:fs');

const mockExistsSync = (fs as jest.Mocked<typeof fs>).existsSync;

describe('readmeExists', () => {
  test('README.mdがある場合、trueを返す', () => {
    mockExistsSync.mockReturnValue(true);
    expect(readmeExists()).toBe(true);
  });

  test('README.mdがない場合、falseを返す', () => {
    mockExistsSync.mockReturnValue(false);
    expect(readmeExists()).toBe(false);
  });
});
