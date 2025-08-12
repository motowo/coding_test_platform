# Issue 依存関係に基づく `blocked` ラベル自動付与/解除 設計

## 1. 背景・目的
- 目的: Issue（タスク）間の依存関係が未完了のとき、自動で `blocked` ラベルを付与し、依存が全て解消されたら自動で解除する。
- 期待効果: 着手可能なタスクの可視化、レビュー待ち/依存待ちの混在解消、プロジェクト計画の正確性向上。

## 2. スコープ / 非スコープ
- スコープ
  - GitHub Issues を前提とした自動ラベリング（本リポジトリ内、必要に応じて同組織内の公開/権限許可済みリポジトリを対象）
  - 依存記法の標準化（Issue本文の宣言、Issueリンクの使用）
  - 付与・解除のイベント駆動（opened/edited/closed/reopened/linked/unlinked ほか）
- 非スコープ
  - 外部トラッカー（Jira, ZenHub 等）との双方向同期
  - マイルストーン/プロジェクトの自動調整

## 3. 用語・前提
- 用語
  - 依存元（current/this issue）: `Depends on` を宣言する側のIssue
  - 依存先（dependency/target issue）: 依存元が参照するIssue（完了が前提）
- 前提
  - プラットフォームは GitHub を想定。
  - `blocked` ラベルは存在しなければ自動作成（色例: 赤系 `#d73a4a`）。
  - `GITHUB_TOKEN` の権限は `issues:write` を付与（必要最小）。

## 4. 依存記法（正準）
- 本文先頭または末尾に次の形式で宣言する。
  - 行頭に `Depends on:` を置き、Issue参照をカンマ区切りで記述
  - 例: `Depends on: #12, #34, org/repo#56`
- 代替: GitHub の「Issue をリンク」機能で `is blocked by`（または `blocks` の逆方向リンク）を設定
  - 実装は、本文記法とIssue間リンクの双方を依存として解釈する。

## 5. 動作仕様（MVP）
- 付与条件: 依存元Issueに1つ以上の依存先が存在し、そのうち1つでも `Open` 状態であれば `blocked` を付与。
- 解除条件: 依存先が全て `Closed`（または `Merged` に紐づくPRで実質解決）になったら `blocked` を除去。
- 耐障害性: 同じラベル付与/除去を何度行っても安全（冪等）。
- 例外
  - 参照先が存在しない/権限不足: ログに警告し、既存の `blocked` を維持（自動解除しない）。
  - クロスリポジトリ参照がPrivateで権限不足: 情報不足として扱い、`blocked` 維持。

## 6. イベント/トリガー
- `issues`: opened, edited, closed, reopened, labeled, unlabeled
- `issue_comment`: created, edited（本文の依存記法をコメントで運用している場合を補助）
- `pull_request`: closed（merged=依存先完了の扱いの同定に使用）
- `workflow_dispatch`: 手動再評価
- `repository_dispatch`: 将来の外部トリガ拡張用

## 7. 判定アルゴリズム（概要）
1) 対象Issueの本文を取得し、`Depends on:` 行をパースして参照Issue一覧を得る。
2) Issueリンク（`is blocked by`/`blocks`）を取得し、依存先として統合する。
3) 依存先一覧を正規化（重複除去、クロスレポ参照の解決）。
4) 依存先の状態を並列で取得（Open/Closed/Merged相当）。
5) 任意の依存先が Open なら `blocked` を付与、全て Closed/Merged なら `blocked` を除去。
6) ラベル作成が必要な場合は作成（存在確認の上）。

エッジケース
- 循環参照: 循環検出はMVP外。単純に現時点の依存先状態で判定。
- 存在しないIssue参照: ログ警告し、解除に用いない（保守的に `blocked` 維持）。
- リンク解除（unlinked）: 再計算して `blocked` を更新。

## 8. 権限・セキュリティ
- トークン: `GITHUB_TOKEN`（デフォルト）に `issues: write`
- 最小権限制御: PR/フォークでは権限不足が想定されるため、外部フォークのイベントでは読み取り・診断のみ（付与/解除はスキップ）。

## 9. 運用・監視
- ログ出力: 付与/解除の結果、依存先件数、スキップ理由（権限不足、参照不正）
- 手動再評価: `workflow_dispatch` で対象Issue番号を入力して再実行可能にする。
- 負荷対策: 参照件数の上限（例: 20件）とAPIコールのバッチ化。

## 10. 受入基準（サンプル）
- 依存: `Depends on: #1` を本文に記載したIssueAに `blocked` が付与される（#1がOpen）。
- 解除: #1 を Close すると、IssueA の `blocked` が自動で外れる。
- 複数依存: `#1, #2` のうち片方がOpenなら `blocked` 維持、両方Closedで解除。
- リンク運用: Issueリンク `is blocked by` のみで本文未記載でも同等に動作。
- クロスレポ: 権限がある公開リポジトリの参照は動作、権限不足は `blocked` 維持 + ログ。

## 11. 導入手順（実装タスクの概要）
1) ラベル `blocked` の作成（なければ自動作成でも可）
2) GitHub Actions ワークフローの追加（YAML）
   - トリガー/権限/ジョブ/ステップの定義
   - `github-script` などを用いたロジック実装
3) ドキュメント更新: 本書、Developer Guide、PR自動チェックガイドの整合
4) リハーサル: サンドボックスIssueで付与/解除のE2E確認

## 12. 既知の制約/リスク
- 権限不足のクロスレポ参照は正確な判定ができない（保守的運用）。
- 循環依存の解消はMVP外（将来拡張）。
- 大量依存（>20）のAPIコール制限対策が必要。

## 13. 更新履歴
- 2025-08-12: 初版作成（MVP仕様を定義）。

