# Hello world typescript action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

以下のドキュメントを参考に TypeScript で作成した JavaScript アクション。

https://docs.github.com/ja/actions/creating-actions/creating-a-javascript-action

## CI/CD Workflow

フォーマット、Lintを適用してビルド、package.json の `version` を元にtagを作成する。

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

```yaml
uses: otaly/hello-world-typescript-action@v1.0.1
with:
  who-to-greet: "Mona the Octocat"
```
