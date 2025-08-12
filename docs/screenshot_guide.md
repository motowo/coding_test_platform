# スクリーンショット取得ガイド

## 概要

開発・テスト・デバッグ時にWebアプリケーションのスクリーンショットを取得するためのツールとガイドです。

## 利用可能なツール

### 1. シンプルスクリーンショットスクリプト（推奨）

```bash
# 基本的な使用方法
node simple-screenshot.js <URL> <basename>

# 例：ホームページのスクリーンショット取得
node simple-screenshot.js http://localhost:3000 home_page

# 例：特定のページのスクリーンショット取得  
node simple-screenshot.js http://localhost:3000/dashboard dashboard_page
```

### 2. 高機能スクリーンショットスクリプト

```bash
# 詳細情報付きでスクリーンショット取得
./scripts/take-screenshot.sh <URL> <basename> [description]

# 例：
./scripts/take-screenshot.sh http://localhost:3000 main_page "メインページのスクリーンショット"
```

## 出力ファイル

- **保存場所**: `screenshot/` ディレクトリ
- **ファイル名形式**: `YYYYMMDDHHMMSS_<basename>.png`
- **例**: `20250812120617_home_page.png`

## 技術仕様

- **エンジン**: Puppeteer (Chrome/Chromium)
- **画像形式**: PNG
- **解像度**: 1280x720（フルページ）
- **待機**: NetworkIdle0（ネットワーク完全停止まで待機）

## 設定オプション

### ビューポート
デフォルト: 1280x720
カスタマイズ可能（`simple-screenshot.js`内で調整）

### 待機条件
デフォルト: `networkidle0`（全ネットワークリクエスト完了）
タイムアウト: 30秒

## トラブルシューティング

### よくある問題

1. **スクリーンショットが空白**
   - アプリケーションが起動していることを確認
   - URLが正しいことを確認
   - ネットワーク接続を確認

2. **タイムアウトエラー**
   - アプリケーションの応答が遅い場合
   - URL が存在しない場合
   - 30秒以内にページが読み込まれない場合

3. **権限エラー**
   - `screenshot/`ディレクトリの書き込み権限を確認
   - Puppeteerが実行できる環境か確認

### デバッグ方法

```bash
# ログ付きで実行
DEBUG=puppeteer:* node simple-screenshot.js http://localhost:3000 debug_test
```

## 開発環境での利用

### T-002での成果物として
```bash
# Next.jsアプリケーション起動後
./scripts/take-screenshot.sh http://localhost:3000 T002_nextjs_setup "T-002: Next.js基本セットアップ確認"
```

### E2Eテスト時の成果物として
```bash
# テスト実行前にベースライン取得
node simple-screenshot.js http://localhost:3000 baseline_before_test

# テスト実行後に結果取得  
node simple-screenshot.js http://localhost:3000 result_after_test
```

## 統合ワークフロー

### Development Flow 05での利用
1. UI変更実装完了
2. アプリケーション起動確認
3. スクリーンショット取得
4. PRに成果物として添付

```bash
# 一連のスクリーンショット取得例
./scripts/take-screenshot.sh http://localhost:3000 main_page
./scripts/take-screenshot.sh http://localhost:3000/dashboard dashboard  
./scripts/take-screenshot.sh http://localhost:3000/profile profile
```

## 改善履歴

### 2025-08-12
- ✅ Puppeteerベースのスクリーンショット機能実装
- ✅ タイムスタンプ付きファイル名対応
- ✅ エラーハンドリング改善
- ✅ スクリプト化と使いやすさ向上
- ❌ Playwright MCP コンテナ不安定問題解決（代替案採用）