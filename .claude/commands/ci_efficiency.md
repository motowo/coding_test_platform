# GitHub Actions CI/CD効率化ガイド

## 概要

Draft PR時とReady for Review時で実行するチェックを最適化し、CI/CD時間を短縮。

## 効率化戦略

### Draft時（軽量チェック）
- ✅ **Detect changes**: 変更箇所の検知
- ✅ **Markdown lint & links**: ドキュメント検証
- ✅ **Lint**: ESLint / Prettier
- ✅ **Type Check**: TypeScript型チェック

### Ready for Review時（全チェック）  
上記に加えて：
- ✅ **Unit Tests (web)**: Webフロントエンドのユニットテスト
- ✅ **Unit Tests (api)**: APIのユニットテスト  
- ✅ **Build (web)**: Webアプリケーションのビルド
- ✅ **Build (api)**: APIのビルド
- ✅ **Integration Tests (api)**: API統合テスト
- ✅ **E2E Tests**: エンドツーエンドテスト（条件付き）

## 時間短縮効果

### Before（全チェック実行）
- **Draft時**: ~8-10分（全チェック実行）
- **Ready for Review時**: ~8-10分（重複実行）
- **合計**: 16-20分

### After（最適化後）
- **Draft時**: ~2-3分（軽量チェックのみ）
- **Ready for Review時**: ~8-10分（全チェック）
- **合計**: 10-13分

**削減効果: 30-35%の時間短縮**

## 技術詳細

### 条件分岐ロジック
```yaml
# Draft状態の検知
- name: Detect draft status
  id: is_draft
  run: |
    if [ "${{ github.event.pull_request.draft }}" = "true" ]; then
      echo "is_draft=true" >> $GITHUB_OUTPUT
    else
      echo "is_draft=false" >> $GITHUB_OUTPUT
    fi

# 重いジョブの条件
if: needs.changes.outputs.docs_only != 'true' && needs.changes.outputs.is_draft != 'true'
```

### トリガーイベント
- `opened`: PR作成時
- `synchronize`: コミットプッシュ時  
- `reopened`: PR再オープン時
- `ready_for_review`: Draft → Ready変更時

### 最適化ルール

1. **Draft時は開発者フィードバック重視**: 素早いlint/typecheckで問題の早期発見
2. **Ready時は品質保証重視**: 全テスト実行でマージ準備完了を保証
3. **冗長実行の防止**: ready_for_review時のコンテンツ変更チェック

## 運用方針

### 開発フロー
1. **Draft PR作成**: 軽量チェックで素早いフィードバック
2. **コード修正**: Draft中は高速なイテレーション
3. **Ready for Review**: 全チェック通過でレビュー依頼
4. **マージ**: 品質保証済みの状態で統合

### 緊急時の対応
- `run-e2e`ラベル: E2Eテスト強制実行
- `skip-e2e`ラベル: E2Eテストスキップ
- 手動ワークフロー実行で個別チェック可能

## メリット

✅ **開発速度向上**: Draft時の高速フィードバック  
✅ **リソース効率化**: CI/CDランナーの使用時間削減  
✅ **開発者体験**: 待機時間の短縮  
✅ **品質保証**: Ready時の完全チェック維持  

## 今後の改善案

- [ ] キャッシュ最適化によるさらなる高速化
- [ ] 変更ファイルベースの部分テスト実行
- [ ] パラレル実行の最適化
- [ ] 依存関係の事前インストール（Docker Layer Cache活用）