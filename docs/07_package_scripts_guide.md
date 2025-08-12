# package.json スクリプト定義ガイド（例）

本ガイドは、PR 自動チェック（.github/workflows/pr-checks.yml）で呼び出す前提の `package.json` スクリプト名と、単一リポジトリ/モノレポにおける定義例を提示します。環境・構成に合わせて調整してください。

注意: 以下はあくまで例です。実際のディレクトリ構成・テストツール・ビルド方法に合わせてパスやオプションを変更してください。

## 1. スクリプト名（標準化）
- 共通: `lint`, `format:check`, `typecheck`
- 単体: `test:unit:web`, `test:unit:api`
- ビルド: `build:web`, `build:api`
- 統合: `test:integration:api`
- 受入/E2E: `test:e2e`
- ドキュメント: `md:lint`, `md:links`

これらは CI（pr-checks.yml）の各ジョブと 1:1 対応します。

## 2. 単一リポジトリ構成の例
プロジェクト直下に Web（Next.js）と API（Fastify）を同居させている前提の概念例です。

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "format:check": "prettier -c .",
    "typecheck": "tsc -p tsconfig.json --noEmit",

    "test:unit:web": "vitest run --dir src/web",
    "test:unit:api": "vitest run --dir src/api",

    "build:web": "next build",
    "build:api": "tsc -p tsconfig.api.json",

    "test:integration:api": "vitest run --dir tests/integration",
    "test:e2e": "playwright test",

    "md:lint": "markdownlint \"**/*.md\" --ignore node_modules",
    "md:links": "lychee --accept 200,206,301,302,429 --no-progress \"./**/*.md\" || true"
  }
}
```

- テストランナーは Vitest 例。Jest を使用する場合はコマンドを置換してください。
- E2E は Playwright 例。Cypress など他ツールでも可。
- `lychee` はリンクチェッカーの一例です（プロジェクトに応じて導入）。

## 3. モノレポ（pnpm workspaces）構成の例
ワークスペースに `web`（Next.js）と `api`（Fastify）が存在する前提の概念例です。

### 3.1 ルート package.json
```json
{
  "private": true,
  "packageManager": "pnpm@8",
  "workspaces": ["web", "api"],
  "scripts": {
    "lint": "pnpm -r run lint",
    "format:check": "pnpm -r run format:check",
    "typecheck": "pnpm -r run typecheck",

    "test:unit:web": "pnpm --filter web run test:unit",
    "test:unit:api": "pnpm --filter api run test:unit",

    "build:web": "pnpm --filter web run build",
    "build:api": "pnpm --filter api run build",

    "test:integration:api": "pnpm --filter api run test:integration",
    "test:e2e": "pnpm --filter web run test:e2e",

    "md:lint": "markdownlint \"**/*.md\" --ignore node_modules",
    "md:links": "lychee --accept 200,206,301,302,429 --no-progress \"./**/*.md\" || true"
  }
}
```

### 3.2 web/package.json（例）
```json
{
  "name": "web",
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "format:check": "prettier -c .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test:unit": "vitest run",
    "build": "next build",
    "test:e2e": "playwright test"
  }
}
```

### 3.3 api/package.json（例）
```json
{
  "name": "api",
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "format:check": "prettier -c .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test:unit": "vitest run",
    "build": "tsc -p tsconfig.json",
    "test:integration": "vitest run --dir tests/integration"
  }
}
```

## 4. 実装メモ（TDD と整合）
- 新規/変更仕様は、まず RED（失敗するテスト）を追加し、最小実装で GREEN、続けて REFACTOR を実施。
- `test:unit:*` はできるだけ高速に（I/O 依存を避ける）。
- `test:integration:*` は testcontainers 等で実DB/Redis を起動し、契約とエラーを確認。
- `test:e2e` は主要フローのみ。乱用せず本数を抑制。

## 5. CI（pr-checks.yml）との対応
- CI は上記スクリプト名を前提に呼び出します（未定義時はスキップ）。
- ラベル運用
  - `run-e2e`: E2E を実行
  - `skip-e2e`: E2E を抑止
- docs-only 変更は自動判定され、コード系ジョブはスキップされます。

