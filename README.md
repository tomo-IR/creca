# Creca TypeScript 実行サンプル

このリポジトリは、GitHub Actionsのスケジュール実行で TypeScript の簡単なコードを動かすサンプルです。

## 構成
- 実行コード: `src/index.ts`
- ビルド: `npm run build` (TypeScript -> JavaScript)
- 実行: `npm start` (`dist/index.js`)
- スケジュール: `.github/workflows/schedule.yml` / `.github/workflows/auto-aggregate.yml`
- Docker: `Dockerfile` (Node.jsベース)

## 初期セットアップ
1. Node.js 20 をインストール
2. `npm install`
3. `npm run build`

## ローカル実行
環境変数 `SPREADSHEET_ID` を指定して実行します。

```bash
export SPREADSHEET_ID=your_sheet_id
npm start
```

### 成功時出力例
- "TypeScript Scheduled Run"
- タイムスタンプ
- "SPREADSHEET_ID: ..."

## GitHub Actions 用設定
- `.github/workflows/schedule.yml` と `.github/workflows/auto-aggregate.yml` はともに次の流れです:
  1. checkout
  2. setup-node@v4
  3. npm ci
  4. npm run build
  5. npm start
- `SPREADSHEET_ID` を GitHub Secrets に追加

## Docker実行

```bash
docker build -t creca-ts .
docker run --rm -e SPREADSHEET_ID=your_sheet_id creca-ts
```

## 確認済み作業フロー
- `npm install && npm run build && npm start` で期待通り動作（`SPREADSHEET_ID` が未設定のときはエラーを表示）。
