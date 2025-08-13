# Playwright MCP コンテナ 安定運用ガイド

## 概要

Playwright MCP (Model Context Protocol) コンテナの安定運用を実現するために、従来のstdin/stdout形式から **HTTP API形式** に変更し、堅牢な起動・運用体制を確立しました。

## 問題の解決

### 従来の問題
- **再起動ループ**: stdin/stdout通信形式でDocker環境での安定動作困難
- **依存関係不足**: ブラウザバイナリ・システム依存関係の欠如
- **プロセス管理不備**: 異常終了時の適切なハンドリング欠如
- **ヘルスチェック無し**: 動作状況の監視機能なし

### 解決策
1. **HTTP API形式** への変更でDocker環境対応
2. **完全な依存関係セットアップ** (Xvfb, Chromium, システムライブラリ)
3. **堅牢なエラーハンドリング** とシグナル処理
4. **ヘルスチェック機能** による動作監視
5. **段階的初期化プロセス** で確実なセットアップ

## アーキテクチャ

### コンテナ構成
```yaml
skillgaug-playwright-mcp:
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  ports: ["3001:3001"]
  healthcheck: 
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  environment:
    MCP_PORT: 3001
    DISPLAY: ":99"
  cap_add: [SYS_ADMIN]
  security_opt: [seccomp:unconfined]
```

### HTTP MCP サーバー
- **エンドポイント**: `http://localhost:3001/mcp`
- **ヘルスチェック**: `http://localhost:3001/health`
- **プロトコル**: JSON-RPC 2.0 over HTTP
- **長時間実行**: Keep-aliveで安定動作

## 利用可能なツール

### 1. screenshot
ウェブページのスクリーンショット撮影
```json
{
  "method": "tools/call",
  "params": {
    "name": "screenshot",
    "arguments": {
      "url": "https://example.com",
      "filename": "example.png",
      "fullPage": true,
      "viewport": {"width": 1280, "height": 720}
    }
  }
}
```

### 2. test
Playwright テストの実行
```json
{
  "method": "tools/call", 
  "params": {
    "name": "test",
    "arguments": {
      "config": "./playwright.config.ts",
      "testPattern": "*.spec.ts"
    }
  }
}
```

### 3. interact
ウェブページ要素の操作
```json
{
  "method": "tools/call",
  "params": {
    "name": "interact", 
    "arguments": {
      "url": "https://example.com",
      "actions": [
        {"type": "click", "selector": "#button"},
        {"type": "fill", "selector": "#input", "value": "test"}
      ]
    }
  }
}
```

## 運用コマンド

### コンテナ起動
```bash
# 開発・MCPプロファイルで起動
COMPOSE_PROFILES=development,mcp docker compose up -d skillgaug-playwright-mcp

# 状態確認
docker compose ps skillgaug-playwright-mcp
```

### ヘルスチェック
```bash
# HTTP ヘルスチェック
curl http://localhost:3001/health

# Docker ヘルスチェック状態
docker inspect skillgaug-playwright-mcp-1 --format='{{.State.Health.Status}}'
```

### ログ監視
```bash
# リアルタイムログ
docker logs -f skillgaug-playwright-mcp-1

# 初期化ログ確認
docker logs skillgaug-playwright-mcp-1 | grep "\\[INIT\\]"
```

### MCP 動作確認
```bash
# 初期化テスト
curl -X POST http://localhost:3001/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}'

# ツール一覧
curl -X POST http://localhost:3001/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

### トラブルシューティング

#### 再起動ループが発生した場合
```bash
# コンテナ停止
docker stop skillgaug-playwright-mcp-1

# ログ確認
docker logs skillgaug-playwright-mcp-1 | tail -50

# 再起動
COMPOSE_PROFILES=development,mcp docker compose up -d skillgaug-playwright-mcp
```

#### ブラウザ起動エラー
```bash
# コンテナ内での手動確認
docker exec -it skillgaug-playwright-mcp-1 bash
cd /workspace/tests/playwright-mcp
npx playwright test --list
```

#### メモリ不足の場合
```bash
# リソース確認
docker stats skillgaug-playwright-mcp-1

# メモリ制限追加 (docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 2G
    reservations:
      memory: 1G
```

## セキュリティ考慮事項

### 必要な権限
- `SYS_ADMIN`: ブラウザプロセス実行に必要
- `seccomp:unconfined`: Chromiumセキュリティ制約の回避

### ネットワーク制限
- 本番環境では内部ネットワークのみアクセス許可
- 外部URLアクセスは明示的な許可制

### ファイルアクセス
- スクリーンショット・レポートは専用ディレクトリに限定
- Workspace以外への書き込み禁止

## パフォーマンス最適化

### ブラウザインスタンス
- 複数リクエストでブラウザインスタンス再利用
- 一定時間後の自動クローズでメモリ解放

### 同時実行制限
- 同時スクリーンショット数を制限
- キューイング機能でリソース保護

### キャッシュ戦略
- Playwright ブラウザキャッシュの永続化
- npm依存関係キャッシュの活用

## 監視・メトリクス

### ヘルスチェック指標
- HTTP `/health` エンドポイント応答時間
- ブラウザ接続状態
- メモリ使用量
- 処理中リクエスト数

### ログレベル
- `[INIT]`: 初期化プロセス
- `[MCP-HTTP]`: MCP処理
- `[TEST-OUT]`: テスト標準出力  
- `[TEST-ERR]`: テストエラー

## バックアップ・復旧

### 設定バックアップ
- `docker-compose.yml` の定期バックアップ
- カスタム設定ファイルの保存

### データ保護
- スクリーンショット・レポートの定期アーカイブ
- テスト結果の長期保存

### 復旧手順
1. コンテナ停止・削除
2. ボリューム再作成
3. 設定復元
4. サービス再起動

## 今後の改善予定

- [ ] **WebSocket対応**: リアルタイム通信の実装
- [ ] **分散処理**: 複数コンテナでの負荷分散  
- [ ] **テストレポート**: 詳細なHTML/JSON レポート生成
- [ ] **パフォーマンス測定**: Core Web Vitals メトリクス収集
- [ ] **CI/CD統合**: GitHub Actions での自動テスト実行

---

**最終更新**: 2025-08-13  
**対応バージョン**: Playwright v1.40.0, Docker Compose v2+