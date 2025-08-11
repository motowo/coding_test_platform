# 開発タスク

## 1. 開発マイルストーン

1.  **M1: MVP基盤構築 (Sprint 1-2)**
    *   開発環境、CI/CDパイプラインのセットアップ
    *   ユーザー認証・認可機能の実装
    *   主要なマイクロサービスの雛形作成
2.  **M2: MVPコア機能開発 (Sprint 3-4)**
    *   問題管理（作成・編集・閲覧）機能の実装
    *   コード提出・自動採点機能の実装
    *   テスト結果の閲覧機能の実装
3.  **M3: アセスメント機能と追加機能 (Sprint 5~)**
    *   アセスメント機能の実装
    *   MVPリリースと改善
    *   ヒント機能、メール配信機能などの追加開発

## 2. タスク一覧 (バックログ)

### Epic: 環境構築 (M1)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-001 | プロジェクトリポジトリの作成 (Git) | P1 | ToDo |
| T-002 | フロントエンド開発環境のセットアップ (SvelteKit) | P1 | ToDo |
| T-003 | バックエンドサービス開発環境のセットアップ (Node.js) | P1 | ToDo |
| T-004 | Dockerによるサンドボックス実行環境の構築 | P1 | ToDo |
| T-005 | CI/CDパイプラインの初期設定 (GitHub Actions) | P2 | ToDo |
| T-006 | API Gatewayのセットアップ | P2 | ToDo |
| T-007 | **Docs**: 開発環境セットアップマニュアルの作成 | P1 | ToDo |
| T-008 | 開発環境マニュアル: `docker-compose.yml` の作成と設定 | P1 | ToDo |
| T-009 | 開発環境マニュアル: 必須ツール(Git, Docker, Node.js)のインストール手順 | P1 | ToDo |
| T-010 | 開発環境マニュアル: `docker compose up`による全サービス起動手順 | P1 | ToDo |
| T-011 | 開発環境マニュアル: DBマイグレーションと初期データ投入の手順 | P2 | ToDo |

### Epic: ユーザー管理機能 (M1)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-012 | Userサービス: DBスキーマ設計とマイグレーション | P1 | ToDo |
| T-013 | Userサービス: ユーザー登録APIの実装 | P1 | ToDo |
| T-014 | Userサービス: ログインAPIとJWT発行機能の実装 | P1 | ToDo |
| T-015 | フロントエンド: ログイン・新規登録画面の実装 | P2 | ToDo |

### Epic: 問題管理機能 (M2)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-020 | **Backend**: `PROBLEMS`, `TEST_CASES` のDBスキーマ設計とマイグレーション更新 | P1 | ToDo |
| T-021 | **Backend**: 問題作成API (`POST /api/v1/problems`) の実装 (バリデーション含む) | P1 | ToDo |
| T-022 | **Backend**: 問題更新API (`PUT /api/v1/problems/:id`) の実装 | P1 | ToDo |
| T-023 | **Backend**: 問題一覧・詳細取得API (`GET`) の実装 | P1 | ToDo |
| T-024 | **Frontend**: 問題作成・編集ページのUI実装 | P1 | ToDo |

### Epic: コード採点機能 (M2)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-030 | Submission/Scoringサービス: DBスキーマ設計 | P1 | ToDo |
| T-031 | **Backend**: コード任意実行API (`POST /api/v1/execute`) の実装 | P1 | ToDo |
| T-032 | **Backend**: コード提出API (`POST /api/v1/submissions`) の実装 | P1 | ToDo |
| T-033 | Scoringサービス: 採点ロジックの実装 | P1 | ToDo |
| T-034 | **Frontend**: テスト受験画面の3ペインレイアウト実装 | P1 | ToDo |

### Epic: アセスメント機能 (M3)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-050 | **Backend**: `ASSESSMENTS`, `ASSESSMENT_PROBLEMS`, `CANDIDATE_ASSESSMENTS` のDBスキーマ設計とマイグレーション | P1 | ToDo |
| T-051 | **Backend**: `SUBMISSIONS` テーブルのスキーマ更新 (candidate_assessment_id追加) | P1 | ToDo |
| T-052 | **Backend**: アセスメント管理用のCRUD API群 (`/api/v1/assessments`) の実装 | P1 | ToDo |
| T-053 | **Backend**: 受験者へのアセスメント割当API (`/api/v1/candidate-assessments`) の実装 | P1 | ToDo |
| T-054 | **Backend**: 受験者向けアセスメント取得API (`/api/v1/candidate-assessments/me`) の実装 | P1 | ToDo |
| T-055 | **Frontend**: アセスメント作成・編集UIの実装（問題検索、順序変更含む） | P2 | ToDo |
| T-056 | **Frontend**: 受験者ダッシュボード（自分に割り当てられたアセスメント一覧）UIの実装 | P2 | ToDo |
| T-057 | **Frontend**: テスト受験画面に問題ナビゲーション機能を追加 | P1 | ToDo |
| T-058 | **Frontend**: 結果確認画面でアセスメント単位でのスコア表示に対応 | P2 | ToDo |

### Epic: 運用・保守
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-100 | **Docs**: 初心者向けk8s運用マニュアルの作成 | P2 | ToDo |
| T-101 | 運用マニュアル: `kubectl`の基本コマンドまとめ (Pod一覧、ログ確認、Pod再起動など) | P2 | ToDo |
| T-102 | 運用マニュアル: アプリケーションのデプロイ・更新手順 | P2 | ToDo |
| T-103 | 運用マニュアル: モニタリングダッシュボード(Grafana等)の確認方法 | P3 | ToDo |
| T-104 | 運用マニュアル: 基本的なトラブルシューティング手順 (Podが起動しない、エラーログが出ている等) | P2 | ToDo |
| T-110 | **Docs**: シングルサーバー向けk8sセットアップマニュアルの作成 | P3 | ToDo |
| T-111 | セットアップマニュアル: 軽量k8s(k3s等)のインストールと初期設定手順 | P3 | ToDo |
| T-112 | セットアップマニュアル: Ingress Controllerと永続ストレージの設定手順 | P3 | ToDo |
| T-113 | セットアップマニュアル: 本番用アプリケーションのデプロイ手順 | P3 | ToDo |

### Epic: 問題自動生成機能 (Post-MVP)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-200 | **R&D**: 問題生成に適したLLM APIの調査と比較検討 | P3 | ToDo |
| T-201 | **Backend**: LLMへのリクエストを構築するためのプロンプトテンプレート設計 | P3 | ToDo |
| T-202 | **Backend**: 問題生成リクエストを受け付け、LLM APIを呼び出すサービスの実装 | P3 | ToDo |
| T-203 | **Frontend**: 難易度と観点を入力し、問題生成をリクエストするUIの実装 | P3 | ToDo |
| T-204 | **Frontend**: AIが生成した問題（問題文、コード、テストケース）をレビュー・承認する画面の実装 | P3 | ToDo |

### Epic: 受験者データ分析機能 (Post-MVP)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-210 | **Backend**: パフォーマンス分析用のデータ集計バッチ、またはマテリアライズドビューの設計・実装 | P3 | ToDo |
| T-211 | **Backend**: 受験者ごとの時系列パフォーマンスデータを返すAPIの実装 | P3 | ToDo |
| T-212 | **Frontend**: 受験者詳細ページにパフォーマンス分析用のタブと画面レイアウトを実装 | P3 | ToDo |
| T-213 | **Frontend**: スコア推移などを表示するグラフコンポーネント(Chart.js等)の導入と実装 | P3 | ToDo |

### Epic: スキルマップ機能 (Post-MVP)
| ID | タスク | 優先度 | 状態 |
| :--- | :--- | :--- | :--- |
| T-220 | **Backend**: スキルマップ、スキルノードを管理するDBスキーマ設計とマイグレーション | P3 | ToDo |
| T-221 | **Backend**: スキルマップ管理用のCRUD API実装 | P3 | ToDo |
| T-222 | **Backend**: 問題とスキルノードを紐付けるAPI実装 | P3 | ToDo |
| T-223 | **Backend**: アセスメント結果を元にスキル習熟度を更新するバッチまたは非同期サービスの実装 | P3 | ToDo |
| T-224 | **Frontend**: 管理者向けスキルマップ作成・編集UIの実装 | P3 | ToDo |
| T-225 | **Frontend**: スキルマップをインタラクティブに表示するダッシュボードUIの実装 | P3 | ToDo |
