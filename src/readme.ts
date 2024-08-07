import * as fs from 'node:fs';

export const readmeExists = () => fs.existsSync('README.md');

export const updateReadme = (url: string, screenshotPath: string) => {
  const file = fs.readFileSync('README.md', { encoding: 'utf8' });

  const lines = file.split('\n');
  const tag = findTag(lines);

  if (tag.begin === -1 && tag.end === -1) {
    lines.push(
      '<!-- [README-SCREENSHOT-BEGIN] -->',
      '<!-- [README-SCREENSHOT-END] -->',
    );
    tag.begin = lines.length - 2;
    tag.end = lines.length - 1;
  }

  // 開始タグと終了タグの間を置換
  lines.splice(
    tag.begin + 1,
    tag.end - tag.begin - 1,
    `![${url}](${screenshotPath})`,
  );

  fs.writeFileSync('README.md', lines.join('\n'));
};

const findTag = (lines: string[]) => {
  const begin = lines.findIndex((l) =>
    /<!-- *\[README-SCREENSHOT-BEGIN\] *-->/.test(l),
  );
  const end = lines.findIndex((l) =>
    /<!-- \[README-SCREENSHOT-END\] -->/.test(l),
  );

  return { begin, end };
};
