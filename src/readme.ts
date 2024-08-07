import * as fs from 'node:fs';

export const readmeExists = () => fs.existsSync('README.md');

export const updateReadme = (url: string, screenshotPath: string) => {
  const file = fs.readFileSync('README.md', { encoding: 'utf8' });

  const lines = file.split('\n');
  const begin = lines.findIndex((l) =>
    /<!-- *\[README-SCREENSHOT-BEGIN\] *-->/.test(l),
  );
  const end = lines.findIndex((l) =>
    /<!-- \[README-SCREENSHOT-END\] -->/.test(l),
  );

  // 開始タグと終了タグの間を置換
  lines.splice(begin + 1, end - begin - 1, `![${url}](${screenshotPath})`);

  fs.writeFileSync('README.md', lines.join('\n'));
};
