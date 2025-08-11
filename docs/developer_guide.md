# 開発者マニュアル（Developer Guide）

本マニュアルは、Coding Test Platform の開発に参加するエンジニア向けの実務ガイドです。開発開始からローカル実行、テスト、レビュー、リリースまでの標準フローを定義します。

本書は docs 内の設計・要件・タスク文書と整合しています。詳細仕様は以下を参照してください。
- 要件定義: docs/requirements.md
- 技術設計: docs/design.md
- 開発タスク: docs/tasks.md
- フロントエンド スタイルガイド: docs/frontend_style_guide.md

## 1. 前提とサポート環境
- OS: macOS / Linux（WSL2 を含む）
- 必須ツール
  - Git（2.40+）
  - Node.js LTS 20.x（pnpm 8+ を推奨）
  - Docker Desktop もしくは互換の Docker 環境
  - Docker Compose（v2 同等）
- 推奨ツール
  - direnv（.env の安全な読み込み）
  - kubectl（将来の k8s 検証用）、make

## 2. リポジトリ取得とブランチ戦略
- 取得: `git clone` 後に origin を確認
- ブランチ命名
  - 機能: `feature/<短い説明>`（例: `feature/assessment-crud`）
  - バグ: `fix/<短い説明>`、運用/雑務: `chore/<...>`、ドキュメント: `docs/<...>`
- コミット規約（Conventional Commits 推奨）
  - 例: `feat(web): add assessment create form` / `fix(api): handle invalid token`
- マージ方針
  - 基本: PR でレビュー→Squash merge または Rebase merge。履歴の簡潔さを優先。

## 3. 環境変数と設定
- 代表的なキー（例）
  - クライアント: `NEXT_PUBLIC_API_BASE_URL`
  - API: `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`
  - 採点実行: `SCORING_IMAGE`, `SCORING_TIMEOUT_SEC`
- 運用指針
  - 秘密情報は `.env` をローカル限定で管理。コミット禁止。
  - 共有が必要な既定値は `.env.example` を用意（別途コードリポジトリ側）。

## 4. ローカル開発手順（概念）
- 依存起動（docker compose 例）
  - `postgres`: 5432、`redis`: 6379、永続ボリューム使用
- アプリ起動（想定）
  - Web(Next.js): `pnpm dev`（http://localhost:3000）
  - API(Fastify): `pnpm dev`（http://localhost:4000）
  - 採点ワーカー: Docker 実行（ジョブRunner）
- 初期化
  - DB マイグレーション: `pnpm db:migrate`（ツール選定に追従）
  - 初期データ投入: `pnpm db:seed`（必要時）
- ポイント
  - CORS/プロキシ設定は Next.js 側で `/api` プロキシ、または `.env` で API ベースURLを指定。

## 5. テスト方針と実行
- テストの階層
  - Unit: 小さな純粋関数/コンポーネント（FE: Vitest+Testing Library、BE: Vitest/Jest）
  - Integration: API と DB/Redis の結合（testcontainers などで実DBを起動）
  - E2E: ユーザーフロー（Playwright）
- カバレッジ基準（初期）
  - Statements/Branches/Functions/Lines いずれも 80% を目標（MVP中は緩やかに運用可）
- 想定コマンド例（実装側リポジトリで定義）
  - `pnpm lint` / `pnpm format:check`
  - `pnpm typecheck`
  - `pnpm test` / `pnpm test:unit` / `pnpm test:integration` / `pnpm test:e2e`
  - `pnpm coverage`

## 6. Lint/Format/型チェック
- ESLint + Prettier を採用。プロジェクト共通ルールを設定。
- Pre-commit フック（husky + lint-staged）
  - 変更差分に対して `eslint --fix` と `prettier --write` を実行
- TypeScript の `strict` を原則有効にし、`any` の利用は最小化。

## 7. コードレビューと PR 運用
- 最低 1 名のレビュー承認（ドメイン/実装いずれかの観点）
- PR テンプレート（推奨事項）
  - 目的/背景、変更内容（スクショ歓迎）、テスト方針、影響範囲、関連 Issue、チェックリスト（下記）
  - テンプレート: `.github/pull_request_template.md` を使用
- レビュー観点チェックリスト
  - 機能: 受入基準を満たす。リグレッションがない。
  - 設計: docs/design.md と一貫、命名/層分割/責務が明確。
  - テスト: 単体/結合/E2E の妥当性、カバレッジ、失敗ケース。
  - セキュリティ: 入力検証、認証/認可、機密情報の扱い、依存の脆弱性。
  - パフォーマンス: 不要な再レンダリング/重いクエリ/不要I/O がない。
  - アクセシビリティ: フォーカス/コントラスト/ARIA/キーボード操作。
  - UX/UI: スタイルガイド準拠、CTA一意性、lime/cyanの限定運用。
  - ドキュメント: README/設計/タスクの更新が必要な場合は同一PRで更新。

## 8. CI/CD の基本方針（GitHub Actions 想定）
- PR: `lint` → `typecheck` → `unit` → `integration`（必要時）→ `build`
- main/develop: 上記に加え `docker build`、プレビュー/ステージングへの自動デプロイ
- ブランチ保護: PR レビュー必須、必須チェック通過、直 push 禁止

## 9. リリース/バージョニング
- SemVer に準拠（MVP 期間は 0.y.z を想定）
- リリース手順（例）
  1. main を安定化 → `chore(release): vX.Y.Z`
  2. タグ付け → リリースノート（要点/変更/破壊/移行）
  3. 環境昇格（staging → production）
- 変更履歴: 自動生成（conventional-changelog）を推奨

## 10. データベース/マイグレーション
- 方針
  - マイグレーションツールはプロジェクトで統一（Prisma/Knex/Drizzle 等のいずれか）
  - マイグレーションは PR でレビューワイヤに含める（命名/前方互換/ロールバック）
- ローカル
  - `db:migrate`（最新化）、`db:reset`（初期化）、`db:seed`（サンプル投入）
- テスト
  - 結合/統合テストは testcontainers 等で実 DB を起動し、テストごとにスキーマを再作成

## 11. セキュリティ/シークレット運用
- `.env` のコミット禁止。CI/CD は OpenID Connect + 短期クレデンシャル、または GitHub Encrypted Secrets を利用
- 依存ライブラリの脆弱性スキャン（`npm audit`, `pnpm audit`）を定期実行
- CORS、レートリミット、入力検証、エラーメッセージの扱い（情報露出防止）

## 12. トラブルシューティング
- Next.js の HMR が反映されない
  - キャッシュクリア、依存再インストール、`node_modules` 再構築
- API が DB に接続できない
  - `DATABASE_URL` を確認、コンテナの起動順、ポート競合の解消
- Playwright が失敗
  - ヘッドレス/有頭モードの切替、タイムアウト延長、`--debug` で再実行

## 13. 付録：ローカル構成（参考）
- サービス
  - web: Next.js（3000）
  - api: Fastify（4000）
  - db: PostgreSQL（5432）
  - cache: Redis（6379）
  - scoring: Docker 実行（ジョブ）
- ポート競合時は `docker ps` / `lsof -i` で解消

---
本マニュアルは docs/ 配下の設計・タスクに追従して随時更新します。整合性に差分が生じた場合は、当該PRで併せて更新してください。
