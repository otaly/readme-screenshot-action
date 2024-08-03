# readme-screenshot-action

READMEのスクリーンショットを自動更新します。

## Inputs

### `url`

**Required** スクリーンショットを撮るURL。 デフォルト値: `"http://localhost:3000/"`.

## Example usage

```yaml
jobs:
  update_readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: otaly/readme-screenshot-action@v1.0.1
        with:
          url: https://developer.chrome.com/

      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Apply format, lint, and bundle
```

## Example screenshot
<!-- [README-SCREENSHOT-BEGIN] -->
<!-- [README-SCREENSHOT-END] -->