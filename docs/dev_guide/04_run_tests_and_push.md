# 04: ローカル検証（lint/type/test）とプッシュ

本章は、ローカルで品質ゲートを通し、緑を確認してからプッシュする手順です。ドラフトPRに進捗を反映します。

## 目的
- 破損した状態をリモートへ上げない
- PRの自動チェック（CI）をスムーズに通過させる

## 完了条件（DoD）
- ローカルで `lint`/`typecheck`/対象テストがすべて緑
- 最初に作成したテスト（RED起点）を含む関連テストが緑
- プッシュによりドラフトPRが更新される

## 手順
1) ローカル検証
- `pnpm lint` / `pnpm format:check`
- `pnpm typecheck`
- 必要なテスト: `pnpm test:unit` / `pnpm test:integration` / `pnpm test:e2e`

2) プッシュ
- 緑であることを確認後、ブランチへ push
- PRの自動チェック（`pr-checks.yml`）が起動
  - docs のみ変更時: 一部ジョブはスキップ
  - フォークPR等: integration/E2E は条件付き

## チェックリスト
- [ ] lint/format/typecheck を通過
- [ ] RED起点のテスト群が緑
- [ ] push 済み、ドラフトPR更新を確認

## よくある落とし穴
- ローカル未確認で push → CI落ちで手戻り
- テストのスコープ過不足 → 実行時間/信頼性の不均衡

## 関連リンク
- 開発者ガイド: 5.0/8章（`docs/04_developer_guide.md`）
- PR 自動チェック: `docs/06_pr_auto_checks.md`
