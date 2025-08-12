# 開発者マニュアル（Developer Guide）

本マニュアルは、Coding Test Platform の開発に参加するエンジニア向けの実務ガイドです。開発開始からローカル実行、テスト、レビュー、リリースまでの標準フローを定義します。

本書は docs 内の設計・要件・タスク文書と整合しています。詳細仕様は以下を参照してください。
- 要件定義: docs/01_requirements.md
- 技術設計: docs/02_design.md
- 開発タスク: docs/03_tasks.md
- フロントエンド スタイルガイド: docs/08_frontend_style_guide.md

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
\n+補足: 詳細なテスト戦略・ツール/フローは `docs/testing_strategy.md` を参照。

### 5.1 TDD（テスト駆動開発）のアプローチ
- 採用方針: 本プロジェクトは原則 TDD を採用し、RED → GREEN → REFACTOR の短いサイクルで実装を進める。
- サイクル
  - RED: 受入基準（Given-When-Then）に基づく失敗するテストを先に書く
  - GREEN: 最小の実装でテストを通す（過剰実装を避ける）
  - REFACTOR: 重複排除・命名/抽象度の整合・パフォーマンス小改善（テストは常に緑）
- レベル別のTDD適用
  - 単体（FE/BE）: ピュアロジック/ビューの振る舞い、バリデーション、シリアライゼーション
  - 結合/統合（BE）: ハンドラ〜DB/Redis の協調（testcontainers 等）
  - 受入（E2E）: ユーザーストーリー単位の主要フロー（最小限）
- 成果物
  - 各PRで新規/変更仕様に対応するテストの追加を必須（REDから開始）
  - カバレッジはメトリクスとして監視（質を優先し盲目的な100%は目指さない）

### 5.2 TDD のメリット/採用理由
- 仕様の明確化: 期待振る舞い（受入基準）が先に固定され、手戻りを削減
- 設計品質の向上: 小さな単位への分解、疎結合・高凝集が促される
- 回帰防止: 変更時の安全網として自動テストが機能
- ドキュメント性: テストが実行可能な仕様書として機能し、引継ぎ容易
- 速度の最適化: 無駄な実装や過剰設計を防ぎ、MVP到達までの時間を短縮

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

### 7.1 Issue 開始ルール（可視化と同期）
- 開始の宣言
  - 担当を割り当て（assign）、必要なら `status/in-progress` ラベルを付与（自動でProjectのStatusがIn Progressに同期）
  - Issue本文のチェックリスト（タスク）を見直し、抜けがあれば追記・分割（サブIssueを作成し親Issueにリンク）
- ブランチ命名（Issue番号を必須に含める）
  - 例: `feat/issue-<number>-short-title`、`fix/issue-<number>-...`、`docs/issue-<number>-...`
  - 例: `feat/issue-27-problems-schema`（Issue #27 に対応）
- コミット規約（Issue参照を必須）
  - 進行中コミット: `refs #<number>` を本文に含める（例: `feat(api): add schema refs #27`）
  - 完了コミット（マージ時に自動Closeしたい場合）: `closes #<number>` をPR本文に含める

### 7.2 PR 作成ルール（ドラフト運用）
- 着手時にドラフトPRを作成（自動化）
  - ブランチPush時に自動でドラフトPRを作成（`auto_draft_pr.yml`）。
  - PRタイトル: `draft: #<issue-number> <issue-title>`、PR本文に `Refs #<issue-number>` を含む。
  - 初期チェックリスト: 「タスク網羅性」「計画外作業の記載」をPR本文に含める。
- 手動作成でも必須項目は同一
  - 関連Issueの明記（`#<number>`）
  - Draftで作成し、進捗に応じてReadyに変更
- 計画外作業の取り扱い
  - 一通り実装後、計画外作業があればPR本文の「計画外作業」一覧に追記
  - 併せて元Issueにも反映（チェックリスト/説明/新規Issue作成）
- 別問題の切り出し
  - 関連だが別問題は新規Issueを作成し、当該PRや元Issueからリンク

### 7.3 自動化（Actions 概要）
- `ProjectV2: Add issues to roadmap`: Issueをユーザープロジェクト（ロードマップ）に自動追加
- `ProjectV2: Sync status with issues`: Issueイベント（open/assign/label/close）に応じて Project の Status を更新
- `PR: Auto create draft from branch`: ブランチPush時に、分岐規則に合致すればドラフトPRを自動作成し、関連Issueを In Progress に設定
- PRテンプレート: `.github/pull_request_template.md`（関連Issue、タスク網羅性、計画外作業の明記を必須）

運用ヒント
- Projectのビューは「Group by: Milestone」「Filter: label:mvp or Milestone=M1/M2」「Sort by: priority/P*」を推奨
- 依存関係の真実はIssue本文（Depends on）に集約し、Projectは可視化に専念

## 8. CI/CD の基本方針（GitHub Actions 想定）
- PR: `lint` → `typecheck` → `unit` → `integration`（必要時）→ `build`
- main/develop: 上記に加え `docker build`、プレビュー/ステージングへの自動デプロイ
- ブランチ保護: PR レビュー必須、必須チェック通過、直 push 禁止
- 詳細: PR 自動チェックの運用は `docs/pr_auto_checks.md` を参照（必須/条件付きチェック、ラベル運用、ブランチ保護）
 - 期待スクリプト定義の例は `docs/package_scripts_guide.md` を参照

### 8.1 ラベル運用（Actions制御）
- `run-e2e`: E2E を実行（デフォルトは実行しない）
- `skip-e2e`: E2E を明示スキップ（緊急対応用）
- `docs-only`: 手動付与は不要（paths フィルタで自動判定）

### 8.2 想定スクリプト（package.json）
- 共通: `lint`, `format:check`, `typecheck`
- 単体: `test:unit:web`, `test:unit:api`
- ビルド: `build:web`, `build:api`
- 統合: `test:integration:api`
- E2E: `test:e2e`
- ドキュメント: `md:lint`, `md:links`
（モノレポの場合は各ワークスペースに合わせて filter/workspace 指定を実装）

### 8.3 スクリプト雛形（ガイド）
- 目的: CI のジョブ名と 1:1 で対応するスクリプトを用意し、ローカルとCIの乖離をなくす
- モノレポ例（概念）
  - web: lint/typecheck/test/build を `pnpm --filter web <script>` でスコープ
  - api: 同上 `--filter api`
- シングルリポ例（概念）
  - `lint`: `eslint .`
  - `format:check`: `prettier -c .`
  - `typecheck`: `tsc -p tsconfig.json --noEmit`
  - `test:unit:web` / `test:unit:api`: フレームワークに合わせて対象を絞り込む
  - `build:web` / `build:api`: それぞれのビルドコマンドを登録
  - `md:lint` / `md:links`: markdownlint / link-checker を呼び出す

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
