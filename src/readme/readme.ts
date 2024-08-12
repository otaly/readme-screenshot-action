import * as fs from 'node:fs';
import type { Screenshot } from 'src/types';
import { InvalidTagError } from '../errors';

type ScreenshotTag = {
  begin: number;
  end: number;
};

export const createReadmeFromFile = (): Readme => {
  const lines = fs.readFileSync('README.md', { encoding: 'utf8' }).split('\n');
  const tag = findScreenshotTag(lines);
  validateTag(tag);
  return new Readme(lines, tag);
};

const findScreenshotTag = (lines: string[]): ScreenshotTag => {
  const begin = lines.findIndex((l) =>
    /<!-- *:README-SCREENSHOT-BEGIN: *-->/.test(l),
  );
  const end = lines.findIndex((l) =>
    /<!-- *:README-SCREENSHOT-END: *-->/.test(l),
  );

  return { begin, end };
};

const validateTag = (tag: ScreenshotTag) => {
  // タグが片方しかない場合やENDタグがBEGINタグより前にある場合はエラー
  if (
    (tag.begin == null && tag.end != null) ||
    (tag.begin != null && tag.end == null) ||
    tag.end < tag.begin
  ) {
    throw new InvalidTagError();
  }
};

export class Readme {
  constructor(
    private readonly lines: string[],
    private readonly tag: ScreenshotTag,
  ) {}

  updateScreenshots(screenshots: Screenshot[]): Readme {
    let { begin, end } = this.tag;
    const lines = this.lines.slice();

    if (begin === -1 && end === -1) {
      lines.push(
        '<!-- :README-SCREENSHOT-BEGIN: -->',
        '<!-- :README-SCREENSHOT-END: -->',
      );
      begin = lines.length - 2;
      end = lines.length - 1;
    }

    const imgTags = screenshots.map(({ url, path }) => `![${url}](${path})`);

    // 開始タグと終了タグの間を置換
    lines.splice(begin + 1, end - begin - 1, ...imgTags);

    return new Readme(lines, { begin, end });
  }

  save() {
    fs.writeFileSync('README.md', this.lines.join('\n'));
  }
}
