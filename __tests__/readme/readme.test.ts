import * as fs from 'node:fs';
import { InvalidTagError } from 'src/errors';
import { Readme, createReadmeFromFile } from 'src/readme';

jest.mock('node:fs');

describe('createReadmeFromFile', () => {
  const readFileSyncMock = (fs as jest.Mocked<typeof fs>).readFileSync;

  test('ファイルからReadmeを作成する', () => {
    const readmeFile = `# Title
text text text text

<!-- :README-SCREENSHOT-BEGIN: -->
<!-- :README-SCREENSHOT-END: -->

text text text text`;

    readFileSyncMock.mockReturnValue(readmeFile);

    const actual = createReadmeFromFile();
    const expected = new Readme(
      [
        '# Title',
        'text text text text',
        '',
        '<!-- :README-SCREENSHOT-BEGIN: -->',
        '<!-- :README-SCREENSHOT-END: -->',
        '',
        'text text text text',
      ],
      { begin: 3, end: 4 },
    );

    expect(actual).toEqual(expected);
  });

  test('tagが存在しない場合は-1になる', () => {
    const readmeFile = `# Title
text text text text`;

    readFileSyncMock.mockReturnValue(readmeFile);

    const actual = createReadmeFromFile();
    const expected = new Readme(['# Title', 'text text text text'], {
      begin: -1,
      end: -1,
    });

    expect(actual).toEqual(expected);
  });

  test('beginタグしかない場合、エラーを投げる', () => {
    const readmeFile = `# Title
text text text text

<!-- :README-SCREENSHOT-BEGIN: -->`;

    readFileSyncMock.mockReturnValue(readmeFile);

    expect(createReadmeFromFile).toThrow(new InvalidTagError());
  });

  test('endタグしかない場合、エラーを投げる', () => {
    const readmeFile = `# Title
text text text text

<!-- :README-SCREENSHOT-END: -->`;

    readFileSyncMock.mockReturnValue(readmeFile);

    expect(createReadmeFromFile).toThrow(new InvalidTagError());
  });

  test('beginタグがendタグより後ろにある場合、エラーを投げる', () => {
    const readmeFile = `# Title
text text text text

<!-- :README-SCREENSHOT-END: -->
<!-- :README-SCREENSHOT-BEGIN: -->`;

    readFileSyncMock.mockReturnValue(readmeFile);

    expect(createReadmeFromFile).toThrow(new InvalidTagError());
  });
});

describe('Readme', () => {
  const writeFileSyncMock = (fs as jest.Mocked<typeof fs>).writeFileSync;

  describe('updateScreenshots', () => {
    test('タグが元からある場合、スクリーンショットを挿入した新しいReadmeを返す', () => {
      const readme = new Readme(
        [
          '#Title',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '<!-- :README-SCREENSHOT-END: -->',
          'text text',
        ],
        { begin: 1, end: 2 },
      );

      const actual = readme.updateScreenshots([
        { url: 'http://example.com', path: 'example.png' },
        { url: 'http://example.com/test', path: 'example-test.png' },
      ]);

      const expected = new Readme(
        [
          '#Title',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '![http://example.com](example.png)',
          '![http://example.com/test](example-test.png)',
          '<!-- :README-SCREENSHOT-END: -->',
          'text text',
        ],
        { begin: 1, end: 4 },
      );

      expect(actual).toEqual(expected);
    });

    test('タグとスクリーンショットが元からある場合、タグに挟まれた行を上書きした新しいReadmeを返す', () => {
      const readme = new Readme(
        [
          '#Title',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '![http://old.example.com](old-example.png)',
          '<!-- :README-SCREENSHOT-END: -->',
          'text text',
        ],
        { begin: 1, end: 3 },
      );

      const actual = readme.updateScreenshots([
        { url: 'http://example.com', path: 'example.png' },
        { url: 'http://example.com/test', path: 'example-test.png' },
      ]);

      const expected = new Readme(
        [
          '#Title',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '![http://example.com](example.png)',
          '![http://example.com/test](example-test.png)',
          '<!-- :README-SCREENSHOT-END: -->',
          'text text',
        ],
        { begin: 1, end: 4 },
      );

      expect(actual).toEqual(expected);
    });

    test('タグが無い場合、末尾にスクリーンショットを挿入した新しいReadmeを返す', () => {
      const readme = new Readme(['#Title', 'text text'], {
        begin: -1,
        end: -1,
      });

      const actual = readme.updateScreenshots([
        { url: 'http://example.com', path: 'example.png' },
        { url: 'http://example.com/test', path: 'example-test.png' },
      ]);

      const expected = new Readme(
        [
          '#Title',
          'text text',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '![http://example.com](example.png)',
          '![http://example.com/test](example-test.png)',
          '<!-- :README-SCREENSHOT-END: -->',
        ],
        { begin: 2, end: 5 },
      );

      expect(actual).toEqual(expected);
    });
  });

  describe('save', () => {
    test('行を結合してファイルを保存する', () => {
      const readme = new Readme(
        [
          '#Title',
          'text text',
          '<!-- :README-SCREENSHOT-BEGIN: -->',
          '![http://example.com](example.png)',
          '<!-- :README-SCREENSHOT-END: -->',
        ],
        { begin: 2, end: 4 },
      );

      readme.save();

      const expectedText = `#Title
text text
<!-- :README-SCREENSHOT-BEGIN: -->
![http://example.com](example.png)
<!-- :README-SCREENSHOT-END: -->`;

      expect(writeFileSyncMock).toHaveBeenCalledWith('README.md', expectedText);
    });
  });
});
