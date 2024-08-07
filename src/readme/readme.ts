import * as fs from 'node:fs';
import { InvalidTagError } from '../errors';

type ScreenshotTag = {
  begin: number;
  end: number;
};

export const createReadmeFromFile = (): Readme => {
  const lines = fs.readFileSync('README.md', { encoding: 'utf8' }).split('\n');
  return new Readme(lines, findScreenshotTag(lines));
};

export class Readme {
  constructor(
    private readonly lines: string[],
    private readonly tag: ScreenshotTag,
  ) {}

  validate() {
    const { begin, end } = this.tag;
    // タグが片方しかない場合やENDタグがBEGINタグより前にある場合はエラー
    if (
      (begin == null && end != null) ||
      (begin != null && end == null) ||
      end < begin
    ) {
      throw new InvalidTagError();
    }
  }

  updateScreenshot(url: string, screenshotPath: string): Readme {
    let { begin, end } = this.tag;
    const lines = this.lines.slice();

    if (begin === -1 && end === -1) {
      lines.push(
        '<!-- [README-SCREENSHOT-BEGIN] -->',
        '<!-- [README-SCREENSHOT-END] -->',
      );
      begin = lines.length - 2;
      end = lines.length - 1;
    }

    // 開始タグと終了タグの間を置換
    lines.splice(begin + 1, end - begin - 1, `![${url}](${screenshotPath})`);

    return new Readme(lines, { begin, end });
  }

  save() {
    fs.writeFileSync('README.md', this.lines.join('\n'));
  }
}

const findScreenshotTag = (lines: string[]): ScreenshotTag => {
  const begin = lines.findIndex((l) =>
    /<!-- *\[README-SCREENSHOT-BEGIN\] *-->/.test(l),
  );
  const end = lines.findIndex((l) =>
    /<!-- \[README-SCREENSHOT-END\] -->/.test(l),
  );

  return { begin, end };
};
