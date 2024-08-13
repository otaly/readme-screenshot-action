import { type Options, main } from 'src/main';
import * as readme from 'src/readme/readme';
import * as screenshot from 'src/screenshot';
import * as serverConnection from 'src/server-connection';
import type { Screenshot } from 'src/types';

const serverConnectionMock = {
  connect: jest.fn(),
  disconnect: jest.fn(),
};
let initSaveDirMock: jest.SpiedFunction<typeof screenshot.initSaveDir>;
let takeScreenshotsMock: jest.SpiedFunction<typeof screenshot.takeScreenshots>;
const readmeMock = {
  save: jest.fn(),
  updateScreenshots: jest.fn().mockReturnThis(),
};

const mainOptionsForTest: Options = {
  inputs: { urls: [], viewport: { width: 1920, height: 1080 } },
  executablePath: '.',
  commitSha: 'abcdefg',
};

describe('main', () => {
  beforeEach(() => {
    jest
      .spyOn(serverConnection, 'ServerConnection')
      .mockReturnValue(
        serverConnectionMock as unknown as serverConnection.ServerConnection,
      );
    jest
      .spyOn(readme, 'createReadmeFromFile')
      .mockReturnValue(readmeMock as unknown as readme.Readme);
    takeScreenshotsMock = jest
      .spyOn(screenshot, 'takeScreenshots')
      .mockImplementation();
    initSaveDirMock = jest
      .spyOn(screenshot, 'initSaveDir')
      .mockImplementation();
  });

  test('撮影したスクリーンショットでREADMEを更新する', async () => {
    const screenshots: Screenshot[] = [
      { url: 'http://example.com', path: 'example.png' },
    ];
    takeScreenshotsMock.mockResolvedValue(screenshots);

    await main(mainOptionsForTest);

    expect(readmeMock.updateScreenshots).toHaveBeenCalledWith(screenshots);
  });

  describe('サーバーへの接続に失敗した場合', () => {
    beforeEach(() => {
      serverConnectionMock.connect.mockRejectedValue(new Error());
    });

    test('保存先ディレクトリを初期化しない', async () => {
      await main(mainOptionsForTest).catch(() => {});
      expect(initSaveDirMock).not.toHaveBeenCalled();
    });

    test('READMEを更新しない', async () => {
      await main(mainOptionsForTest).catch(() => {});
      expect(readmeMock.updateScreenshots).not.toHaveBeenCalled();
    });
  });
});
