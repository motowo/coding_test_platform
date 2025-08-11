# PR 自動チェック運用ガイド（GitHub Actions 想定）

本ドキュメントは、Pull Request に対して自動実行される品質ゲート（CI チェック）の項目、基準、運用ルールを定義します。ブランチ保護の必須チェックとして設定することで、一定品質を継続的に担保します。

関連: docs/developer_guide.md（全体の開発フロー）、docs/design.md（設計整合性）

## 1. 目的と対象
- 目的: 変更の早期検知と安定供給（品質/セキュリティ/ドキュメント整合）
- 対象: Pull Request（外部フォーク含む）、main/develop ブランチへの push
 - 開発プロセス整合: TDD の実践を促し、各PRでテスト追加（RED→GREEN→REFACTOR）を前提とする

## 2. チェック構成（推奨）
優先度順に段階実行し、失敗時は後続を省略します。

1) 速いチェック（必須）
- lint: ESLint/Prettier の静的解析・整形確認
- typecheck: TypeScript の型チェック（web/api）
- markdown-lint: docs/*.md の体裁確認、リンクの死活確認

2) 単体テスト（必須）
- test:unit:web（Next.js コンポーネント/ロジック）
- test:unit:api（Fastify のサービス/ハンドラ）
- coverage: 目標 80%（MVP 期間中は情報共有・監視に留めても可）
 - TDD 整合: 変更仕様に対応するテストケースが追加/更新されていること

3) ビルド（必須）
- build:web（Next.js）
- build:api（Fastify）
- docker-build（任意/ステージングのみ）

4) 統合テスト（条件付き必須）
- test:integration:api（DB/Redis 連携、testcontainers 等）
- 対象: 内部 PR と main/develop のみ（外部フォークは secrets 不使用のため除外）

5) E2E テスト（条件付き）
- test:e2e（Playwright、主要フロー）
- ラベル/変更差分で制御（docs-only 変更時はスキップ可）
- 再試行: 1 回まで許可（flaky に対するバッファ）

6) セキュリティ/品質補助（任意 → 将来必須）
- dep-audit（依存脆弱性チェック）
- a11y-smoke（アクセシビリティ簡易チェック: axe/Playwright-axe）
- bundle-size（web バンドル予算チェック）

スクリプト（package.json）の想定名
- 共通: `lint`, `format:check`, `typecheck`
- 単体: `test:unit:web`, `test:unit:api`
- ビルド: `build:web`, `build:api`
- 統合: `test:integration:api`
- E2E: `test:e2e`
- ドキュメント: `md:lint`, `md:links`
各リポジトリ構成に合わせて実体を実装してください（モノレポの場合は `-w web` や `--filter web` などでスコープ）。

## 3. 必須チェック（ブランチ保護に設定）
- lint
- typecheck
- test:unit:web
- test:unit:api
- build:web
- build:api
- （内部 PR のみ）test:integration:api
- （プロジェクト合意後）test:e2e、dep-audit、a11y-smoke、bundle-size

GitHub の Settings → Branches → Branch protection rules で上記を Required status checks として登録してください。

## 4. 実行トリガと分岐（ラベル制御・paths フィルタ）
- pull_request: デフォルト（from fork を含む）
- push: main / develop
- path フィルタ例
  - docs のみ変更: unit/build のみ実行、integration/E2E をスキップ
  - api 配下のみ: web 関連の unit/build をスキップ
- ラベル制御（メンテナが付与）
  - run-e2e: E2E を実行（デフォルトは実行しない）
  - skip-e2e: E2E を明示スキップ（緊急対応用。濫用禁止）
  - docs-only: 手動指定は不要（paths フィルタで自動判定）

実装済みワークフロー
- `.github/workflows/pr-checks.yml`
  - `changes` ジョブで paths フィルタとラベル/フォーク判定を行い、各ジョブの実行条件に反映
  - `markdown` は docs 変更時のみ、その他は docs-only でない場合に実行
  - `integration-api` はフォーク PR では不実行、`e2e` は `run-e2e` ラベルが付与されたときのみ実行
  - 期待スクリプト名の詳細は `docs/package_scripts_guide.md` を参照

## 5. 実行環境・キャッシュ・アーティファクト
- ランナー: ubuntu-latest（Node.js 20）
- キャッシュ: pnpm/npm のパッケージキャッシュ、Playwright ブラウザキャッシュ
- DB/Redis: integration ではコンテナで起動（testcontainers 推奨）
- アーティファクト
  - 失敗時のスクリーンショット/動画（E2E）
  - カバレッジレポート（lcov/html）
  - junit 形式のテスト結果（CI で要約可）

## 6. シークレット/権限の扱い
- 外部フォークの PR では secrets を使用しない（integration/E2E はスキップ）
- OIDC/クラウド権限は main/develop のみで付与（PR では無効）
- GITHUB_TOKEN: 必要最小権限（contents: read、pull-requests: write など）

## 7. タイムアウトとリトライ
- 各ジョブのタイムアウトを明示（目安: 15〜20分）
- E2E は 1 回まで自動リトライを許可
- flaky テストは隔離・安定化を優先（恒常的リトライは不可）

## 8. 成果物の可視化と失敗時の対応
- 失敗時: どのチェックが落ちたかを PR に自動コメント（要約）
- テスト失敗: 最小再現手順、ログ、スクリーンショットを添付
- バンドル超過: どのチャンクが超過したかを提示し、しきい値と対処方針を共有

## 9. 命名規約とジョブ分割（ガイド）
- ジョブ名は短く明確に（例: `lint`, `typecheck`, `test:unit:web`）
- 並列化: `lint`/`typecheck` と unit を並列、build は unit 後に実行
- integration/E2E は build 後に直列で実行（環境競合回避）

## 10. 合格基準とブロッカー
- 必須チェックが全て成功＝マージ可
- 既知の flaky で暫定許容する場合は、Issue 登録 + 期限付きの一時免除ルールを明記
- セキュリティ重大度（High 以上）はブロック（例外はセキュリティレビュア承認が必要）

## 11. 運用上のベストプラクティス
- 小さく早い PR（レビューと CI 時間を短縮）
- PR 作成前にローカルで `lint`/`typecheck`/`test` を通す
- CI の所要時間をダッシュボードで監視し、10〜15分以内を目標に改善
- 定期的に Node/ランナー/ブラウザを更新（半年に一度の見直し）

## 12. よくある質問（FAQ）
Q. docs しか変更していないのに E2E が走る
- A. `docs-only` ラベルを付与、または CI の path フィルタを見直してください。

Q. 外部コントリビューターの PR で integration が失敗する
- A. secrets を使わない構成で落ちている可能性。外部 PR では integration をスキップし、メンテナが内部ブランチで再実行してください。

Q. E2E が時々落ちる
- A. 1 回までの自動リトライを許容し、再現性の低いテストは隔離/安定化のために改善 Issue を作成してください。

---
このガイドは運用しながら更新していきます。新しいチェックを追加する場合は、本書を更新し、branch protection の Required status checks にも反映してください。
