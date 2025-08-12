# 07: マージとクローズ（Done への遷移）

本章は、必須チェックの合格確認からマージ、Issue/Project のクローズまでを定義します。

## 目的
- 安全にマージし、タスクを確実に完了状態へ遷移
- 追跡可能な形でIssue/Projectをクローズ

## 完了条件（DoD）
- PRの必須チェック（lint/type/unit/build 等）がすべて成功
- レビュー承認が揃っている（規定数）
- マージ後、Issueが Close（自動/手動）され、Project の Status が Done

## 手順
1) 必須チェック/レビュー確認
- `docs/06_pr_auto_checks.md` に定義された必須ジョブが成功していること
- レビュー承認が所定数揃っていること

2) マージ
- Draft から Ready へ変更
- Squash または Rebase でマージ（履歴方針に従う）

3) クローズ/同期
- PR本文に `closes #<issue-number>` があれば自動Close
- Project の Status が Done に同期されていることを確認

## チェックリスト
- [ ] 必須ジョブ成功 / レビュー承認完了
- [ ] Ready へ遷移しマージ
- [ ] Issue Close / Project Done を確認

## よくある落とし穴
- 必須チェック未達での強行マージ → 回帰/不安定化
- Close/同期漏れ → タスクが終わって見えない

## 関連リンク
- PR自動チェック: `docs/06_pr_auto_checks.md`
- 開発者ガイド: 8–9章（`docs/04_developer_guide.md`）
