# テスト設計とフロー（ツール/プロセス）

本ドキュメントは、Coding Test Platform のテスト戦略（ツール選定、レイヤ別の方針、実行フロー、アーティファクト運用）を定義する。TDD を前提に、開発者の生産性と長期運用の安定性を両立する。

## 1. 目的と原則
- 明確な受入基準に基づく TDD（RED → GREEN → REFACTOR）
- テストピラミッドを遵守（単体 > 統合 > E2E）
- 冪等・再現性・高速性を重視（並列実行/キャッシュ/隔離）
- テストは実行可能な仕様書（ドキュメント）として機能

## 2. ツール選定（マトリクス）
- フロントエンド（Next.js）
  - 単体/コンポーネント: Vitest + @testing-library/react + jsdom/happy-dom + MSW（APIスタブ）
  - 型/静的解析: TypeScript（strict）+ ESLint + Prettier
  - 任意（将来）: Playwright Component Testing（採用は別途判断）
- バックエンド（Fastify）
  - 単体: Vitest（または Jest）
  - HTTPハンドラ検証: supertest もしくは Fastify の inject API
  - スキーマ検証: zod/typia 等（DTO/バリデーションを型安全に）
- 統合（API + DB/Redis）
  - Testcontainers（PostgreSQL / Redis）+ マイグレーション（Prisma/Drizzle/Knex のいずれか）
  - データセット: Factory（Test Data Builder）+ Seed（フィクスチャ）
- 受入/E2E（アプリ横断）
  - Playwright（HTMLレポート、スクショ/動画、トレース）
  - 将来オプション: MCP 連携（スクショ等アーティファクトの収集/配信）
- レポート/カバレッジ
  - c8/istanbul（LCOV/HTML）+ junit（CI集計）、Artifacts に保存

## 3. レイヤ別ポリシー
- 単体
  - 依存を極力モックし純粋ロジックを高速に検証
  - UI は Testing Library のクエリ（役割/ラベル）を優先（testidは補助）
- 統合
  - Testcontainers で実DB/Redisを起動、マイグレーション→Seed→テスト→掃除
  - トランザクション/名前空間で隔離しパラレル実行
- 受入/E2E
  - 主要ユーザーフロー（ログイン→受験→提出→採点結果閲覧 等）に限定
  - データは seed により確定値。UIアニメーションは無効化、安定化設定（auto-wait）

## 4. フロー（ローカル/TDD）
1) RED: 受入基準（Given-When-Then）に基づく失敗テストを追加
2) GREEN: 最小実装で通す（過剰実装禁止）
3) REFACTOR: 重複排除・命名整備・抽象度揃え（常に緑）
- コマンド例（概念）: `pnpm test:unit:web --watch` / `pnpm test:unit:api --watch`

## 5. フロー（CI/PR）
- pr-checks.yml の段階実行
  - markdown（docs変更時のみ）
  - lint / typecheck（必須）
  - unit（web/api, 必須）→ build（web/api, 必須）
  - integration（api, 内部PRのみ）
  - e2e（run-e2e ラベル時のみ。デフォルト不実行）
- 失敗時は早期中断、Artifacts（レポート/スクショ）を保存

## 6. Playwright と MCP の計画
- ベースライン（現行）
  - Playwright を単体で運用（レポート/スクショ/動画/トレースは Actions Artifacts へ）
  - 実行トリガ: `run-e2e` ラベル、またはスケジュール（将来）
- MCP 連携（将来）
  - 目的: スクショ/動画/トレースの収集・閲覧・共有の効率化
  - 設計: Playwright Reporter → MCP Client Adapter → MCP サービス（API）
  - 環境トグル（例）: `E2E_USE_MCP=true`, `MCP_ENDPOINT`, `MCP_API_KEY`
  - 非連携時はデフォルトReporterでArtifacts出力（フォールバック）
- 分離方針
  - MCP は任意機能。E2E は MCP 無しで自律実行可能に設計（CI/ローカル）

## 7. データ/フィクスチャ設計
- Factory + Builder パターンでテストデータ生成（ドメイン語彙を保つ）
- Seed: E2E/統合テストは事前に安定した初期データを投入
- クリーン戦略: テスト毎にトランザクションロールバック or 名前空間削除

## 8. 安定性/速度最適化
- 並列実行: テストは独立、port/DB名/Redis prefix を分離
- フレーク対策: 自動待機、リトライは最小（E2Eは1回）、固定Viewport、時計モック
- スナップショット: 構造化スナップショット（過剰依存禁止）

## 9. 構成/命名規約
- ディレクトリ
  - FE 単体: `web/src/**/*.spec.tsx`
  - API 単体: `api/src/**/*.spec.ts`
  - 統合: `api/tests/integration/**/*.spec.ts`
  - 受入/E2E: `web/tests/e2e/**/*.spec.ts`
- 命名: `<対象>.<目的>.spec.ts(x)`（例: `auth.login.flow.spec.ts`）

## 10. カバレッジ/基準
- 目標 80%（Statements/Branches/Functions/Lines）。質を優先
- 除外: 生成物/型のみの宣言/インフララッパ
- CI で閲覧可能な HTML/LCOV をArtifacts化

## 11. セキュリティ/回帰
- 入力検証・認証/認可の否定パスを単体/統合で必ず用意
- 既知の不具合は回帰テストとして残し、二度と壊さない

## 12. 役立つ参照
- 開発ガイド: `docs/developer_guide.md`（TDD、CI、ラベル運用）
- PR 自動チェック: `docs/pr_auto_checks.md`（ジョブ/スクリプト/ラベル）
- スクリプト定義: `docs/package_scripts_guide.md`
