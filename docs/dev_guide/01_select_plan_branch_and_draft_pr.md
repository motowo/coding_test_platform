# 01: タスク選定 → 計画作成 → ブランチ作成/ドラフトPR

本章は、開発開始のトリガからドラフトPR作成までの実務手順を定義します。Project の Status は Todo → In Progress → Done で運用し、着手時に必ず In Progress へ更新します。

## 目的
- 正しい開始条件でタスクに着手し、依存未解決による手戻りを防ぐ
- 開発計画（スコープ/分割/完了条件/テスト方針）を明確化し、レビューを効率化
- ブランチ/ドラフトPRを早期に作り、継続的に進捗を可視化

## 前提
- ドキュメント一式を把握していること
  - 要件: `docs/01_requirements.md`
  - 設計: `docs/02_design.md`
  - タスク: `docs/03_tasks.md`
  - 開発者ガイド（参照元）: `docs/04_developer_guide.md`（特に 5.0, 7.1, 7.2, 7.3.1）
  - PRテンプレ: `.github/pull_request_template.md`
  - 依存/blocked 自動化: `docs/09_issue_automation.md`

## 完了条件（DoD）
- Project で対象 Issue を選定（Status=Todo）し、依存が解消されていることを確認
- Issue に自分を assign し、Project の Status を In Progress に更新
- ブランチを作成（命名規約に従う）し、初回 push を行う
- ドラフトPRを作成し、PR本文に「開発計画（必須）」を記載

## 手順
1) 対象選定（Project）
- **Project Status=Todo の確認手順**:
  ```bash
  # Method 1: Project一覧からTodoタスクを確認
  gh project item-list 2 --owner motowo --format json | \
    jq -r '.items[] | select(.status == "Todo") | "#\(.content.number)\t\(.content.title)"'
  
  # Method 2: 特定Issueの詳細確認（例: Issue #7 = T-003）
  gh issue view 7 --json body,title,assignees,state,labels
  
  # Method 3: フォールバック - 未assignで開発可能なタスク（Project利用不可時のみ）
  gh issue list --state open --assignee "" --label "mvp" --limit 10
  ```
- Project ビューで `Status=Todo` を抽出し、優先度/Milestone/label:mvp を考慮して対象を選ぶ
- Issue 本文の `Depends on:` と Issueリンク（is blocked by）を確認
  - 依存先が未完（Open）または不明（権限不足等）の場合は開始しない（`blocked` が自動付与され得る）

2) 仕様理解
- 該当箇所の要件/設計/タスクを通読し、用語・API・データ・画面に齟齬がないか確認
- 不明点があれば着手前に質問し、仮定は明示する（AGENTS.md の原則）

3) 開発計画の作成（PR本文に転記）
- スコープ: 何をやるか / やらないか（スコープ外も明記）
- 分割: 実装の小単位（コミット粒度、必要であればサブタスク）
- 完了条件（DoD）: 受入基準、確認観点、必要なドキュメント更新
- テスト方針: どの層（Unit/Integration/E2E）に何を追加するか（TDD: RED→GREEN→REFACTOR）

4) 担当割当と Status 更新
- Issue に自分を assign
- Project の `Status=In Progress` に変更（自動同期がある場合は適切にラベル/イベントを付与）

5) ブランチ作成
- 命名規約: `feat/issue-<番号>-<短い説明>`、修正は `fix/…`、ドキュメントは `docs/…`
- 例: `feat/issue-27-problems-schema`

6) 初回コミットとブランチ push
- **空のPR作成問題対応**: `git push` 時に "No commits between main and feature-branch" エラーを回避するため、初回コミット用の `.gitkeep` ファイルを作成
  ```bash
  # 対象ディレクトリに .gitkeep ファイル作成（例: api ディレクトリの場合）
  touch api/.gitkeep
  
  # または echo を使用
  echo "" > api/.gitkeep
  
  # ステージング・コミット・プッシュ
  git add .
  git commit -m "feat: 初期コミット - T-XXX 開発開始"
  git push -u origin feat/issue-X-description
  ```

7) ドラフトPR作成
- GitHub で Draft PR を作成（初回 push 後に可能になる）
- PR本文に「開発計画（必須）」を記載（PRテンプレの該当セクション）
- PR本文へ `Refs #<issue-number>` を含める
- プルリクエスト作成コマンド例:
  ```bash
  gh pr create --draft --title "feat: T-XXX タスク名" --body "開発計画:\n- 実装内容\n\nRefs #XXX"
  ```

## チェックリスト
- [ ] 対象Issueは Project で `Status=Todo`
- [ ] `Depends on` の依存先はすべて Closed/Merged（不明なし）
- [ ] Issue に assign 済み、Project を `In Progress` に更新
- [ ] ブランチ作成（命名規約準拠）
- [ ] 初回コミット用 `.gitkeep` ファイル作成・コミット・プッシュ
- [ ] ドラフトPR作成、PR本文へ「開発計画（必須）」と `Refs #<番号>` を記載

## よくある落とし穴
- 依存未解決のまま開始 → `blocked` により着手不可の状態が続く
- 計画未整備で実装開始 → 範囲逸脱やレビュー遅延につながる
- ブランチ命名/PRテンプレ不統一 → CIやオートメーションのトリガが揃わない
- **初回コミットなしでのPR作成** → "No commits between main and feature-branch" エラーが発生し、PR作成不可

## 関連リンク
- 開発者ガイド: 5.0 開発フロー、7.1 Issue開始、7.2 PRドラフト、7.3.1 Depends on 記法（`docs/04_developer_guide.md`）
- PRテンプレ: `.github/pull_request_template.md`
- 自動化仕様: `docs/09_issue_automation.md`
