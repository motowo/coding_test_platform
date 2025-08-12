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
1) ローカル検証（Docker内で実行）
- `docker compose run --rm web npm run lint`
- `docker compose run --rm web npm run type-check`
- `docker compose run --rm web npm test`
- API側: `docker compose run --rm api npm run lint && docker compose run --rm api npm run type-check`

2) プッシュ
- 緑であることを確認後、ブランチへ push
- PRの自動チェック（`pr-checks.yml`）が起動
  - docs のみ変更時: 一部ジョブはスキップ
  - フォークPR等: integration/E2E は条件付き

## チェックリスト
- [ ] Docker内でlint/typecheck を通過
- [ ] Docker内でRED起点のテスト群が緑
- [ ] push 済み、ドラフトPR更新を確認

## よくある落とし穴
- Docker環境での未確認でpush → CI落ちで手戻り
- ローカル環境とDocker環境の差異 → 依存関係やNode.jsバージョンの相違
- テストのスコープ過不足 → 実行時間/信頼性の不均衡

## 関連リンク
- 開発者ガイド: 5.0/8章（`docs/04_developer_guide.md`）
- PR 自動チェック: `docs/06_pr_auto_checks.md`
