# SkillGaug - コーディング評価プラットフォーム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=flat&logo=fastify&logoColor=white)](https://www.fastify.io/)

技術採用とスキル評価のための現代的なコーディング評価プラットフォーム。Next.js、Fastify、PostgreSQL、Dockerで構築。

## 🚀 クイックスタート

### 前提条件

- **Docker** と **Docker Compose** がインストール済み
- **Node.js 20+** （ローカル開発用）
- **Git** バージョン管理用

### 1. クローンとセットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd coding_test_platform

# 自動セットアップ実行
./scripts/setup.sh
```

セットアップスクリプトは以下を実行します：
- `.env.example` から `.env.local` を作成
- Docker イメージのプルとビルド
- データベースと Redis の起動
- マイグレーション実行とシードデータ投入
- 全サービスの起動

### 2. アプリケーションへのアクセス

- **🌐 Web アプリケーション**: http://localhost:3000
- **🔧 API サーバー**: http://localhost:4000
- **📚 API ドキュメント**: http://localhost:4000/documentation

### 3. デフォルトログイン認証情報

| 役割 | メールアドレス | パスワード |
|------|-------|----------|
| **管理者** | admin@skillgaug.local | password123 |
| **問題作成者** | creator@skillgaug.local | password123 |
| **採用担当者** | recruiter@skillgaug.local | password123 |
| **受験者** | john.doe@example.com | password123 |

## 🛠️ 開発

### 開発用コマンド

```bash
# 全サービス開始
./scripts/dev.sh start

# 全サービス停止
./scripts/dev.sh stop

# ログ表示
./scripts/dev.sh logs

# データベースリセット
./scripts/dev.sh reset-db

# テスト実行
./scripts/dev.sh test

# 利用可能な全コマンド表示
./scripts/dev.sh help
```

### プロジェクト構成

```
skillgaug/
├── api/                    # Fastify API サーバー
│   ├── src/
│   │   ├── routes/        # API ルート
│   │   ├── middleware/    # 認証、CORS など
│   │   ├── utils/         # データベースユーティリティ、設定
│   │   └── index.ts       # メインサーバーファイル
│   ├── Dockerfile
│   └── package.json
├── web/                   # Next.js Web アプリケーション
│   ├── src/
│   │   ├── app/          # App Router ページ
│   │   ├── components/   # React コンポーネント
│   │   ├── lib/          # ユーティリティ
│   │   └── styles/       # グローバルスタイル
│   ├── Dockerfile
│   └── package.json
├── database/              # データベーススキーマとマイグレーション
│   ├── schema.prisma     # Prisma スキーマ
│   └── seeds/            # シードデータ
├── scripts/              # 開発用スクリプト
├── docs/                 # プロジェクトドキュメント
└── docker-compose.yml   # Docker サービス構成
```

## 🏗️ アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS + Radix UI
- **バックエンド**: Fastify + TypeScript + Prisma ORM
- **データベース**: PostgreSQL + Redis
- **コンテナ化**: Docker + Docker Compose
- **認証**: JWT + bcrypt
- **API ドキュメント**: OpenAPI/Swagger

### サービスアーキテクチャ

```mermaid
graph TD
    A[Web - Next.js] --> B[API - Fastify]
    B --> C[PostgreSQL]
    B --> D[Redis]
    B --> E[採点サービス]
    E --> F[Docker ランナー]
```

### 主要機能

- ✅ **ユーザー管理**: 役割ベース認証（管理者、作成者、採用担当者、受験者）
- ✅ **問題ライブラリ**: テストケース付きコーディング問題の作成・管理
- ✅ **評価構築**: 問題ライブラリから評価を作成
- ✅ **受験者ポータル**: 時間制限付き評価受験
- 🚧 **コード実行**: セキュアなコンテナ化コード実行（開発中）
- 🚧 **自動採点**: テストケース検証と採点（開発中）
- 🚧 **結果ダッシュボード**: パフォーマンス分析とレポート（開発中）

## 📊 データベーススキーマ

プラットフォームは以下をサポートする包括的なデータベーススキーマを使用：

- 役割ベースアクセス制御付き**ユーザー**
- 複数テストケースと難易度レベル付き**問題**
- カスタマイズ可能な問題セットと時間制限付き**評価**
- 実行結果と採点付き**提出物**
- 学習パス統合用**スキルマップ**（将来機能）

完全なスキーマ定義については [`database/schema.prisma`](database/schema.prisma) を参照してください。

## 🧪 テスト

```bash
# 全テスト実行
./scripts/dev.sh test

# API テストのみ実行
./scripts/dev.sh test-api

# Web テストのみ実行
./scripts/dev.sh test-web

# リンティング実行
./scripts/dev.sh lint
```

### テストスタック

- **単体テスト**: Vitest + Testing Library
- **統合テスト**: Testcontainers
- **E2E テスト**: Playwright
- **API テスト**: Fastify 組み込み

## 🔧 設定

### 環境変数

`.env.example` を `.env.local` にコピーして設定：

```env
# データベース
DATABASE_URL=postgresql://skillgaug:password@localhost:5432/skillgaug
REDIS_URL=redis://:password@localhost:6379

# 認証
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXTAUTH_SECRET=your-nextauth-secret

# API 設定
CORS_ORIGIN=http://localhost:3000

# 機能フラグ（将来）
FEATURE_AI_PROBLEM_GENERATION=false
FEATURE_SKILL_MAP_INTEGRATION=false
```

### Docker 設定

サービスは `docker-compose.yml` で設定：

- **skillgaug-web**: Next.js フロントエンド（ポート 3000）
- **skillgaug-api**: Fastify バックエンド（ポート 4000）
- **skillgaug-db**: PostgreSQL データベース（ポート 5432）
- **skillgaug-redis**: Redis キャッシュ（ポート 6379）
- **skillgaug-*-mcp**: MCP サービス（開発のみ）

## 📚 API ドキュメント

サーバー稼働時、対話型 API ドキュメントが http://localhost:4000/documentation で利用可能です。

### 主要エンドポイント

- `POST /api/v1/auth/login` - ユーザー認証
- `GET /api/v1/auth/me` - 現在のユーザープロファイル取得
- `GET /api/v1/users` - ユーザー一覧（管理者/採用担当者のみ）
- `GET /api/v1/languages` - サポートプログラミング言語取得
- `GET /api/v1/problems` - コーディング問題一覧（近日公開）
- `POST /api/v1/submissions` - 評価用コード提出（近日公開）

## 🔒 セキュリティ

- **認証**: セキュアパスワードハッシュ（bcrypt）付き JWT ベース
- **認可**: 役割ベースアクセス制御（RBAC）
- **CORS**: 設定可能なクロスオリジンリクエストポリシー
- **レート制限**: 悪用防止のリクエストスロットリング
- **入力検証**: Zod による包括的リクエスト検証
- **Docker セキュリティ**: コンテナでの非 root ユーザー実行

## 🚀 本番デプロイ

### Docker デプロイ

```bash
# 本番イメージビルド
docker-compose -f docker-compose.prod.yml build

# 本番サービス開始
docker-compose -f docker-compose.prod.yml up -d

# 本番でマイグレーション実行
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate:prod
```

### 環境セットアップ

1. 本番環境変数の設定
2. JWT とデータベースパスワードに強力なシークレットを使用
3. 適切なデータベースバックアップの設定
4. SSL/TLS 証明書の設定
5. モニタリングとログの設定

## 🤝 貢献

1. リポジトリをフォーク
2. 機能ブランチ作成（`git checkout -b feature/amazing-feature`）
3. コーディング規約に従って変更
4. 新機能にテストを追加
5. テストスイート実行（`./scripts/dev.sh test`）
6. 変更をコミット（`git commit -m 'Add amazing feature'`）
7. ブランチにプッシュ（`git push origin feature/amazing-feature`）
8. プルリクエストを開く

### 開発ガイドライン

- TypeScript strict モードに従う
- コードフォーマットに ESLint と Prettier を使用
- 新機能にテストを記述
- API 変更時はドキュメントを更新
- セマンティックコミット規約に従う

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

- 優れた React フレームワークの [Next.js](https://nextjs.org/)
- 高速で低オーバーヘッドな Web フレームワークの [Fastify](https://www.fastify.io/)
- 型安全なデータベースツールキットの [Prisma](https://www.prisma.io/)
- アクセシブルな UI コンポーネントの [Radix UI](https://www.radix-ui.com/)
- ユーティリティファースト CSS フレームワークの [Tailwind CSS](https://tailwindcss.com/)

## 📞 サポート

サポートとご質問について：

- 📧 メール: support@skillgaug.com
- 📖 ドキュメント: [docs/](docs/)
- 🐛 バグ報告: GitHub Issues
- 💬 ディスカッション: GitHub Discussions

---

**SkillGaug チームが ❤️ を込めて開発**

May the Force be with you! ✨