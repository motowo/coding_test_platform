# 開発環境セットアップガイド

SkillGaugコーディングテストプラットフォームの開発環境構築手順書です。

## 概要

本プラットフォームはDocker Composeを使用したマイクロサービス構成で動作します。
以下の手順に従って、開発に必要な全ての環境を構築できます。

### システム構成
- **Web Frontend**: Next.js (React) - Port 3000
- **API Backend**: Fastify (Node.js) - Port 4000  
- **Database**: PostgreSQL - Port 5432
- **Cache**: Redis - Port 6379
- **開発支援**: MCP Serena, Playwright

## 1. 必須ツールのインストール

### 1.1. Git
バージョン管理システムです。

**macOS (Homebrew)**
```bash
brew install git
```

**Windows**
[Git for Windows](https://gitforwindows.org/) からダウンロードしてインストール

**Ubuntu/Debian**
```bash
sudo apt update && sudo apt install git
```

### 1.2. Docker & Docker Compose
コンテナ実行環境です。

**Docker Desktop (推奨)**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) をダウンロードしてインストール
- Docker ComposeもDocker Desktopに含まれています

**動作確認**
```bash
docker --version
docker compose version
```

### 1.3. Node.js (v20以上)
フロントエンド/バックエンド開発に使用します。

**推奨: nvm使用**
```bash
# nvm をインストール (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Node.js v20 をインストール
nvm install 20
nvm use 20
nvm alias default 20
```

**直接インストール**
[Node.js公式サイト](https://nodejs.org/) からLTS版をダウンロード

**動作確認**
```bash
node --version  # v20.x.x であることを確認
npm --version
```

## 2. プロジェクトのクローンと設定

### 2.1. リポジトリのクローン
```bash
git clone https://github.com/motowo/coding_test_platform.git
cd coding_test_platform
```

### 2.2. 環境変数の設定
`.env` ファイルを作成してデフォルト設定を上書き（オプション）:

```bash
cp .env.example .env  # .env.exampleが存在する場合
```

**主要な環境変数（デフォルト値）**
```bash
# データベース設定
POSTGRES_DB=skillgaug
POSTGRES_USER=skillgaug  
POSTGRES_PASSWORD=skillgaug_dev
POSTGRES_PORT=5432

# Redis設定
REDIS_PASSWORD=skillgaug_redis
REDIS_PORT=6379

# JWT認証
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API設定
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

## 3. Docker Compose設定

### 3.1. docker-compose.yml 概要
プロジェクトの`docker-compose.yml`は以下のサービスを定義しています:

```yaml
services:
  skillgaug-db:      # PostgreSQL データベース
  skillgaug-redis:   # Redis キャッシュ  
  skillgaug-api:     # Fastify API サーバー
  skillgaug-web:     # Next.js Web フロントエンド
  skillgaug-serena-mcp:    # MCP開発支援 (プロファイル: development)
  skillgaug-playwright-mcp: # E2Eテスト (プロファイル: development)
```

### 3.2. カスタマイズ可能な設定

**ポート変更**
```bash
# .env ファイルで変更
POSTGRES_PORT=15432  # デフォルト: 5432
REDIS_PORT=16379     # デフォルト: 6379
```

**プロファイル指定**
```bash
# 開発支援ツールも含めて起動
docker compose --profile development up -d

# 基本サービスのみ起動 
docker compose up -d
```

## 4. 全サービス起動手順

### 4.1. 初回起動
```bash
# ビルドと起動を同時実行
docker compose up --build -d

# ログ確認
docker compose logs -f
```

### 4.2. 起動確認とヘルスチェック

**サービス状態確認**
```bash
docker compose ps
```

**各サービスの動作確認**
```bash
# Web フロントエンド
curl -f http://localhost:3000 || echo "Web service not ready"

# API バックエンド  
curl -f http://localhost:4000/health || echo "API service not ready"

# PostgreSQL データベース
docker exec skillgaug-db-1 pg_isready -U skillgaug

# Redis キャッシュ
docker exec skillgaug-redis-1 redis-cli --no-auth-warning -a skillgaug_redis ping
```

### 4.3. 起動完了の確認方法

**成功時の表示例**
```bash
$ docker compose ps
NAME                     STATUS
skillgaug-api-1          Up (healthy)
skillgaug-db-1           Up (healthy)  
skillgaug-redis-1        Up (healthy)
skillgaug-web-1          Up (healthy)
```

**ブラウザでアクセス**
- フロントエンド: http://localhost:3000
- API ドキュメント: http://localhost:4000/docs

## 5. データベース初期化とマイグレーション

### 5.1. データベースマイグレーション実行
```bash
# API コンテナ内でマイグレーション実行
docker exec skillgaug-api-1 npm run db:migrate
```

### 5.2. 初期データ (シード) 投入
```bash
# 開発用サンプルデータを投入
docker exec skillgaug-api-1 npm run db:seed
```

### 5.3. データベース接続確認
```bash
# PostgreSQL コンテナに接続
docker exec -it skillgaug-db-1 psql -U skillgaug -d skillgaug

# テーブル確認
\dt

# 接続終了
\q
```

### 5.4. データベースリセット (必要時)
```bash
# データベース完全リセット
docker exec skillgaug-api-1 npm run db:reset

# または、ボリューム削除による完全初期化
docker compose down -v
docker compose up --build -d
```

## 6. 開発ワークフロー

### 6.1. 日常の開発作業
```bash
# サービス起動
docker compose up -d

# ログ監視 (別ターミナル)
docker compose logs -f skillgaug-api skillgaug-web

# コード変更 → 自動反映（ホットリロード）
# web/, api/ ディレクトリの変更は自動でコンテナに反映
```

### 6.2. 開発用コマンド
```bash
# フロントエンド
docker exec skillgaug-web-1 npm run lint
docker exec skillgaug-web-1 npm run type-check
docker exec skillgaug-web-1 npm test

# バックエンド
docker exec skillgaug-api-1 npm run lint  
docker exec skillgaug-api-1 npm run typecheck
docker exec skillgaug-api-1 npm run test:unit
```

### 6.3. サービス停止
```bash
# 全サービス停止
docker compose down

# ボリュームも削除（データ完全削除）
docker compose down -v
```

## 7. トラブルシューティング

### 7.1. よくある問題と解決方法

**ポート衝突エラー**
```bash
# 使用中のポートを確認
lsof -i :3000  # または :4000, :5432, :6379
kill -9 <PID>  # プロセス終了

# または .env でポート変更
POSTGRES_PORT=15432
```

**Docker ビルドエラー**
```bash
# キャッシュクリア後にリビルド
docker system prune -f
docker compose build --no-cache
```

**データベース接続エラー**
```bash
# データベースコンテナの再起動
docker compose restart skillgaug-db

# コンテナログ確認
docker compose logs skillgaug-db
```

**依存関係エラー**
```bash
# node_modules リビルド
docker compose down
docker volume rm coding_test_platform_node_modules
docker compose up --build -d
```

### 7.2. パフォーマンス改善

**初回起動高速化**
```bash
# 事前にイメージをプル
docker compose pull

# 並列ビルド
docker compose build --parallel
```

**ファイル監視制限 (macOS/Linux)**
```bash
# inotify上限を増加
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 7.3. 開発支援ツール

**MCP Serena (AI開発支援)**
```bash
# プロファイル指定で起動
COMPOSE_PROFILES=development,mcp docker compose up -d

# Serena アクセス
# http://localhost:9121
```

**Playwright (E2Eテスト)**
```bash
# E2E テスト実行
docker exec skillgaug-playwright-mcp-1 npx playwright test
```

## 8. 次のステップ

環境構築が完了したら以下のドキュメントを参照してください:

- **開発者ガイド**: `docs/04_developer_guide.md`
- **テスト戦略**: `docs/05_testing_strategy.md` 
- **フロントエンドスタイルガイド**: `docs/08_frontend_style_guide.md`
- **パッケージスクリプトガイド**: `docs/07_package_scripts_guide.md`

## 9. サポート

問題が解決しない場合は以下をご確認ください:

- [Issues](https://github.com/motowo/coding_test_platform/issues) で既知の問題を検索
- システム要件: Docker 24.0+, Node.js 20+, Git 2.30+
- 推奨スペック: RAM 8GB+, 空き容量 10GB+

---

**🎉 セットアップ完了！**

環境構築が正常に完了すると、以下にアクセス可能になります:
- **フロントエンド**: http://localhost:3000
- **API ドキュメント**: http://localhost:4000/docs
- **データベース**: localhost:5432 (skillgaug/skillgaug_dev)