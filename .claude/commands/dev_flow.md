## /dev-flow

開発者ガイド（docs/dev_guide）に沿って、開発開始からPRマージまでのフローを段階実行します。引数にステップ番号（01–07）を渡すと該当章のタスクを実行します。引数なしの場合は、以下の明確な判定手順で「次の番号」を決定して実行します。

### 使い方

```bash
/dev-flow [01|02|03|04|05|06|07]

# 例）01 を明示して開始（選定→計画→ブランチ/ドラフトPR）
/dev-flow 01

# 例）状況に応じて自動で次の処理（未指定時）
/dev-flow
```

### ステップ対応（docs/dev_guide）

- 01: タスク選定→計画作成→ブランチ作成/ドラフトPR（01_select_plan_branch_and_draft_pr.md）
- 02: RED（失敗テスト）を書く（02_tdd_write_tests.md）
- 03: 実装（GREEN→REFACTOR）と小さなコミット（03_implement_and_commit.md）
- 04: ローカル検証（lint/type/test）とプッシュ（04_run_tests_and_push.md）
- 05: UI変更時のE2Eと成果物（05_ui_e2e_and_artifacts.md）
- 06: レビュー対応と追従（06_review_and_updates.md）
- 07: マージとクローズ（07_merge_and_close.md）

各章の内容とチェックリストは以下を参照してください。

### 章リンク（必読）
- 01: docs/dev_guide/01_select_plan_branch_and_draft_pr.md
- 02: docs/dev_guide/02_tdd_write_tests.md
- 03: docs/dev_guide/03_implement_and_commit.md
- 04: docs/dev_guide/04_run_tests_and_push.md
- 05: docs/dev_guide/05_ui_e2e_and_artifacts.md
- 06: docs/dev_guide/06_review_and_updates.md
- 07: docs/dev_guide/07_merge_and_close.md

関連ガイド
- 開発者ガイド: docs/04_developer_guide.md（5.0, 7.1, 7.2, 7.3.1, 7.3.2, 8–9）
- テスト戦略: docs/05_testing_strategy.md
- PR自動チェック: docs/06_pr_auto_checks.md
- Issue依存/blocked自動化: docs/09_issue_automation.md

### オプション（引数）

- `01|02|03|04|05|06|07`: 実行するステップを明示指定します。
- 省略（未指定）: 現在の状態を把握し、次の番号を自動実行します。

未指定時の判定手順（明確な順序で最初に一致したものを採用）
1) 現在ブランチに紐づくPRの有無
   - なし: 01 を実行
   - あり: 次へ（`gh pr view --json number,isDraft,headRefName`）
2) PRがDraftか
   - Draftでない: 06（レビュー対応）または 07（マージ）へ。必須チェックと承認状況で分岐（後述）
   - Draft: 次へ
3) 直近コミットにテスト追加/更新がないか
   - ない: 02（RED作成）
   - ある: 次へ（`git diff --name-only origin/main...HEAD | egrep -i '\\.(spec|test)\\.(ts|tsx)$|/tests/e2e/'`）
4) ローカルで対象テストが RED か（Docker内で実行）
   - 失敗（RED）: 03（実装）
   - 合格（GREEN）: 次へ
5) `lint`/`typecheck`/関連テストが未実行 or 未push か
   - 未実行/未push: 04（検証→push）
   - 実行済/push済: 次へ
6) UI変更が含まれるか（差分に `web/` または UI 関連の変更があるか）
   - ある: 05（E2E/成果物）
   - ない: 06（レビュー対応）
7) 必須チェックが緑、承認が揃っていれば 07（Ready→マージ→クローズ）

### 基本例

```bash
# 01: 選定→計画→ブランチ/ドラフトPR（docs/dev_guide/01_... を参照）
# Todo のIssue候補一覧（必要に応じてラベル/検索を追加）
gh issue list --state open --limit 100
# 依存確認（本文 Depends on を抽出）
gh issue view <ISSUE> --json body -q '.body' | grep -i '^Depends on:' || true
# 依存先の状態確認（例: #12, #34）
gh issue view 12 --json state -q .state; gh issue view 34 --json state -q .state
# 担当割当 + ステータス同期用ラベル（運用に合わせて）
gh issue edit <ISSUE> --add-assignee @me --add-label status/in-progress
# ブランチ作成〜初回push→ドラフトPR
git checkout -b feat/issue-<ISSUE>-<slug>
git push -u origin HEAD
gh pr create --draft --title "draft: #<ISSUE> <title>" --body-file <(cat <<'EOF'
Refs #<ISSUE>

## 開発計画（必須）
- スコープ: 
- 分割: 
- 完了条件(DoD): 
- テスト方針(TDD): 
EOF
)

# 02: RED（失敗テスト）作成（Docker内）
docker compose run --rm web pnpm test:unit:web -- --reporter=dot || true
# or
docker compose run --rm api pnpm test:unit:api -- --reporter=dot || true
# E2E のREDが必要なら
docker compose run --rm web pnpm test:e2e || true

# 03: 実装→コミット（小さく、refs を付与）
git add -A && git commit -m "feat(...): implement minimal logic refs #<ISSUE>"

# 04: 検証（Docker内）→プッシュ
docker compose run --rm web pnpm lint && docker compose run --rm web pnpm typecheck
docker compose run --rm api pnpm typecheck
docker compose run --rm web pnpm test:unit:web && docker compose run --rm api pnpm test:unit:api
git push

# 05: UI変更時のE2Eと成果物
docker compose run --rm web pnpm test:e2e
# 取得したスクショ/動画/トレース（結果ディレクトリ）をPRに添付

# 06: レビュー対応と追従
# 指摘単位で小さくコミット、PR本文の「計画外作業」を更新、Issueにも反映

# 07: マージ/クローズ
# 必須チェックが緑、承認揃い → Draft解除→Ready→マージ
gh pr ready; gh pr merge --squash
```

### 自動判定の補助コマンド（例）

```bash
# 現在ブランチのドラフトPRの有無
gh pr view --json number,state,isDraft,mergeStateStatus --jq '.isDraft' || true

# 直近変更にテストが含まれるか
git diff --name-only origin/main...HEAD | egrep -i '\\.(spec|test)\\.(ts|tsx)$|/tests/e2e/' || true

# CI 必須ジョブの状況（要権限）
gh pr checks --watch || true
```

### Claude との連携

```bash
# 選定〜計画の下書きを作る
/dev-flow 01
「docs/dev_guide/01 のチェックリストに沿って、対象Issueと開発計画の下書きを作成して。」

# 未指定で次の処理へ（例: 04まで進行時は05へ）
/dev-flow
「現状を確認し、必要ならE2Eと成果物添付（05）を進めて。」

# レビュー対応の要点整理
/dev-flow 06
「レビューコメントを読み、必要な追従を小さいコミットに分解して提示して。」
```

### 注意事項

- Project の Status は Todo→In Progress→Done（着手時に In Progress へ更新）
- 依存（Depends on）が未解決/不明な場合は開始しない（`blocked`が自動付与・維持される）
- アプリ関連（lint/typecheck/test/build）は Docker 内で実行（例: `docker compose run --rm web ...`）
- 未指定時は本ドキュメントの「未指定時の判定手順」を厳密に適用する

### エラー/確認メッセージ方針

- 範囲外の番号（例: `08`）や無効な入力 → 「サポート外のオプションです。01–07 から指定してください。」
- 状態不整合（例: PRが無いのに 03 を指定） → 「無効な状態です。まず 01 を実行してください。」
- 判定不能（自動判定） → 「状態の自動判定に失敗しました。実行したいステップ番号を指定してください。」

### Flow完了時の進捗記録

**重要**: 各Flowが完了するごとに、対象のIssueに以下の情報を記載してください。これは次のFlow実行時の判断材料として必須です。

#### 記録方法

1. **Issueコメントに進捗を記録**
   ```bash
   gh issue comment <ISSUE_NUMBER> --body "## Dev Flow進捗
   
   ✅ **Flow 01 完了** (2025-XX-XX)
   - タスク選定: #XX (T-XXX: タスク名)  
   - 開発計画作成: 完了
   - ブランチ作成: feat/issue-XX-description
   - ドラフトPR作成: #XX
   
   **次回**: Flow 02 (REDテスト作成) から再開
   "
   ```

2. **Issue本文の更新** (必要に応じて)
   ```bash
   # 進捗セクションを追加
   gh issue edit <ISSUE_NUMBER> --body "$(gh issue view <ISSUE_NUMBER> --json body -q .body)
   
   ## Dev Flow進捗
   - [x] Flow 01: タスク選定→計画→ブランチ/PR作成
   - [ ] Flow 02: REDテスト作成
   - [ ] Flow 03: 実装 (GREEN→REFACTOR)
   ..."
   ```

#### 記録すべき内容

**Flow完了時に必須記録項目:**
- **Flow番号と完了日時**
- **実施内容の詳細** (ブランチ名、PR番号、作成したファイル等)
- **次のFlow番号** (何から再開するか)
- **課題や注意点** (もしあれば)

**例）Flow別の記録テンプレート:**

- **Flow 01完了時**: ブランチ名、ドラフトPR番号、開発計画の要点
- **Flow 02完了時**: 作成したテストファイル、失敗確認済みのテスト項目
- **Flow 03完了時**: 実装したファイル、通過したテスト、コミットハッシュ
- **Flow 04完了時**: lint/typecheck/test結果、プッシュ済みコミット
- **Flow 05完了時**: E2E実行結果、添付した成果物
- **Flow 06完了時**: レビュー対応内容、修正コミット
- **Flow 07完了時**: マージ日時、クローズ確認

#### 確認方法

再開時は以下のコマンドでIssueの進捗を確認：

```bash
# Issue進捗確認
gh issue view <ISSUE_NUMBER> --comments

# 現在のPR状態確認  
gh pr view --json number,isDraft,headRefName,state

# 最後のFlow判定
gh issue view <ISSUE_NUMBER> --json body --jq '.body' | grep -A 10 "Dev Flow進捗"
```

この進捗記録により、複数日にまたがる開発や、中断・再開時の状況把握が正確に行えます。

### 関連コマンド

- `/pr-create`, `/pr-review`, `/pr-auto-update`: PR 周辺の自動化
- `/task`, `/plan`: 計画の下書きや分解に利用
