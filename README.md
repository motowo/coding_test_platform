# Coding Test Platform ドキュメント

オンラインのコーディングテスト/スキル評価プラットフォームに関する要件定義・設計・タスクを管理するドキュメントリポジトリです。開発前段の合意形成と一貫した更新を目的に、すべて Markdown で管理します。

## 目的とスコープ（要約）
- 目的: 採用や育成の文脈で、受験者のコーディングスキルを公正かつ再現性高く評価する。
- MVP: 単一問題の作成/編集、受験、実行/提出、採点、結果閲覧、およびユーザー認証を含む最小機能。
- 非機能（抜粋）: 実行/採点の応答時間、サンドボックス実行、基礎的な信頼性・可用性。

詳細は下記ドキュメントを参照してください。

## ドキュメント
- 要件定義書: `docs/01_requirements.md`
  - ペルソナ、機能一覧（MVP明示）、非機能要件、ワークフロー
  - 例: 問題作成/編集、単一問題の受験・提出・採点、結果閲覧
- 技術設計書: `docs/02_design.md`
  - 全体アーキテクチャ、技術スタック、データモデル、API、画面定義、セキュリティ/性能設計、UIデザインシステム（トークン）
- 開発タスク: `docs/03_tasks.md`
  - エピック/ユーザーストーリー、優先度、受入基準（DoD）、見積り、リスク/ブロッカー
- 開発者マニュアル: `docs/04_developer_guide.md`
  - ローカル実行、テスト、レビュー、CI/CD、リリース手順、TDD指針
- テスト戦略: `docs/05_testing_strategy.md`
  - ツール選定（Vitest/MSW/Testcontainers/Playwright）、TDD、E2E、安定性方針
- PR 自動チェック: `docs/06_pr_auto_checks.md`
  - 必須チェック、条件付きチェック、ブランチ保護/ラベル運用
- スクリプト定義ガイド: `docs/07_package_scripts_guide.md`
  - 単一/モノレポ構成の `package.json` スクリプト例（CIジョブと対応）
- 付録: フロントエンド スタイルガイド `docs/08_frontend_style_guide.md`

あわせて、ドキュメント運用ルールは以下を参照してください。
- エージェント作業ガイドライン: `AGENTS.md`
- ドキュメント作成ポリシー（原則）: `GEMINI.md`

## リポジトリ構成
```
.
├── AGENTS.md                        # エージェント向けガイドライン
├── GEMINI.md                        # ドキュメント作成ポリシーの原則
├── README.md                        # 本ファイル（概要/ナビゲーション）
└── docs/
    ├── 01_requirements.md           # 要件定義書（最初に読む）
    ├── 02_design.md                 # 技術設計書
    ├── 03_tasks.md                  # 開発タスク
    ├── 04_developer_guide.md        # 開発者マニュアル
    ├── 05_testing_strategy.md       # テスト戦略
    ├── 06_pr_auto_checks.md         # PR 自動チェック
    ├── 07_package_scripts_guide.md  # スクリプト定義ガイド
    └── 08_frontend_style_guide.md   # フロントエンド スタイルガイド
```

## ドキュメントの編集フロー（推奨）
1) 指示・前提の確認（不明点は質問）
2) MVP/スコープの明記（仮は明示）
3) `docs/01_requirements.md` 更新
4) `docs/02_design.md` 更新（要件と整合）
5) `docs/03_tasks.md` 更新（優先度・受入基準を明確化）
6) 3文書の相互整合チェック（API/データ/画面/優先度）

運用ルール（抜粋）:
- すべて Markdown。省略記法は使わず、常にファイル全体を完全出力。
- 要件・設計・タスク間の用語/仕様/優先度の一貫性を維持。
- 仕様変更時は関連する全ファイルを同時に更新することを推奨。

## 迅速な参照
- プロダクトの背景/目的/MVP: `docs/01_requirements.md`
- API/データモデル/画面: `docs/02_design.md`
- 実装・検証に落とし込む手順: `docs/03_tasks.md`
- デザインシステム/トークン: `docs/02_design.md` 内「UIデザインシステム（トークン）」
- フロントエンド スタイルガイド（Next.js/Tailwind/cva）: `docs/08_frontend_style_guide.md`
- 開発フロー/レビュー/テスト: `docs/04_developer_guide.md`
- PR 自動チェック運用: `docs/06_pr_auto_checks.md`

ご不明点や矛盾点がある場合は、`AGENTS.md` の方針に沿って合意形成のための質問を行ってください。
