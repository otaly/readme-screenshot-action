import * as fs from 'node:fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  InvalidInputError,
  ReadmeNotExistError,
  ServerWorkingDirNotExistError,
} from 'src/errors';
import * as install from 'src/install-chrome';
import * as main from 'src/main';
import * as readmeExists from 'src/readme/readme-exists';
import { run } from 'src/run';
import { userInputsSchema } from 'src/validation';
import { ZodError } from 'zod';

jest.mock('node:fs');
const existsSyncMock = (fs as jest.Mocked<typeof fs>).existsSync;

let parseMock: jest.SpiedFunction<typeof userInputsSchema.parse>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getMultilineInputMock: jest.SpiedFunction<typeof core.getMultilineInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let installChromeMock: jest.SpiedFunction<typeof install.installChrome>;
let readmeExistsMock: jest.SpiedFunction<typeof readmeExists.readmeExists>;
let mainMock: jest.SpiedFunction<typeof main.main>;

describe('run', () => {
  beforeEach(() => {
    parseMock = jest.spyOn(userInputsSchema, 'parse').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    getMultilineInputMock = jest
      .spyOn(core, 'getMultilineInput')
      .mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    installChromeMock = jest
      .spyOn(install, 'installChrome')
      .mockImplementation();
    readmeExistsMock = jest
      .spyOn(readmeExists, 'readmeExists')
      .mockImplementation();
    mainMock = jest.spyOn(main, 'main').mockImplementation();
  });

  test('オプションが空文字の場合、userInputsSchema.parseにundefinedで渡される', async () => {
    getMultilineInputMock.mockReturnValue([]);
    getInputMock.mockReturnValue('');

    await run();

    expect(parseMock).toHaveBeenCalledWith({
      urls: [],
      width: undefined,
      height: undefined,
      server_command: undefined,
      server_working_dir: undefined,
      delay: undefined,
    });
  });

  test('mainが想定した引数で呼ばれる', async () => {
    parseMock.mockReturnValue({
      urls: ['http://example.com'],
      width: 1920,
      height: 1080,
      server_command: 'command',
      server_working_dir: 'working_dir',
      delay: 1000,
    });
    readmeExistsMock.mockReturnValue(true);
    existsSyncMock.mockReturnValue(true);
    installChromeMock.mockResolvedValue({ executablePath: 'path/to/chrome' });
    github.context.sha = 'commitsha';

    await run();

    expect(mainMock).toHaveBeenCalledWith({
      inputs: {
        urls: ['http://example.com'],
        viewport: { width: 1920, height: 1080 },
        serverCmd: 'command',
        serverWorkingDir: 'working_dir',
        delay: 1000,
      },
      executablePath: 'path/to/chrome',
      commitSha: 'commitsha',
    });
  });

  test('バリデーションに失敗したらsetFailedを呼ぶ', async () => {
    const error = new ZodError([]);
    parseMock.mockImplementation(() => {
      throw error;
    });

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(new InvalidInputError(error));
    expect(mainMock).not.toHaveBeenCalled();
  });

  test('README.mdが無かったらsetFailedを呼ぶ', async () => {
    readmeExistsMock.mockReturnValue(false);

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(new ReadmeNotExistError());
    expect(mainMock).not.toHaveBeenCalled();
  });

  test('server_commandがあり、server_working_dirで指定されたディレクトリが存在しなかったらsetFailedを呼ぶ', async () => {
    parseMock.mockReturnValue({
      urls: ['http://example.com'],
      width: 1920,
      height: 1080,
      server_command: 'command',
      server_working_dir: 'notExistDirectory',
    });
    readmeExistsMock.mockReturnValue(true);
    existsSyncMock.mockReturnValue(false);

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(
      new ServerWorkingDirNotExistError('notExistDirectory'),
    );
    expect(mainMock).not.toHaveBeenCalled();
  });

  test('server_commandが無ければserver_working_dirで指定されたディレクトリが無くてもsetFailedを呼ばない', async () => {
    parseMock.mockReturnValue({
      urls: ['http://example.com'],
      width: 1920,
      height: 1080,
      server_command: undefined,
      server_working_dir: 'notExistDirectory',
    });
    readmeExistsMock.mockReturnValue(true);
    existsSyncMock.mockReturnValue(false);
    installChromeMock.mockResolvedValue({ executablePath: 'path/to/chrome' });

    await run();

    expect(setFailedMock).not.toHaveBeenCalled();
  });

  test('mainがエラーのときsetFailedを呼ぶ', async () => {
    parseMock.mockReturnValue({
      urls: ['http://example.com'],
      width: 1920,
      height: 1080,
    });
    readmeExistsMock.mockReturnValue(true);
    installChromeMock.mockResolvedValue({ executablePath: 'path/to/chrome' });
    const error = new Error('test');
    mainMock.mockRejectedValue(error);

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(error);
  });
});
