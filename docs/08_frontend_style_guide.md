# フロントエンド スタイルガイド（Next.js + Tailwind CSS）

## 1. 目的と適用範囲
- 目的: 長期運用とエンジニアのローテーションを前提に、UIの一貫性・保守性・アクセシビリティを高水準で維持する。
- 適用範囲: Webクライアント全体（Next.js）。コンポーネント設計、配色、タイポグラフィ、モーション、状態表現、ダークモード、ユーティリティクラス運用を含む。
- 前提: CSSは Tailwind CSS、UIプリミティブは Radix UI をベース。デザイントークンは CSS変数で定義し、Tailwind テーマから参照する。

## 2. トンマナ採用方針（ハイブリッド）
- 基調: Trust & Focus（信頼・集中）。Primary は青系、Secondary は紫系、ニュートラルは高可読なグレー系。
- 限定アクセント: Energetic Learning（学習/実績箇所）。lime/cyan をバッジ/進捗/グラフ強調に限定使用。
- ガードレール:
  - lime/cyan は 1画面1系統まで。使用面積は画面のおよそ10%以内。
  - 主要CTAは常に Primary のみを使用。アクセント色で置換しない。
  - コントラストは本文4.5:1以上、ボタン前景3:1以上を担保。

## 3. デザイントークンとCSS変数
- 管理単位: 抽象トークン（grayスケール、semantic color、spacing、radius、shadow、typo、motion）を CSS変数で定義。
- テーマ切替: `[data-theme="light"]` / `[data-theme="dark"]` で値を切替。
- セマンティック色（例）:
  - 背景/面/境界: bg, surface, surface-muted, border
  - テキスト: text, text-muted, text-inverse
  - アクション: primary, on-primary; accent, on-accent; success, warning, danger
  - 限定アクセント: accent-lime, on-accent-lime; accent-cyan, on-accent-cyan
- タイポ: font-sans, font-mono; font-size（xs〜3xl）、line-height、font-weight をトークン化。
- スペーシング: 4pxベース（1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 10=40px, 12=48px）。
- 角丸: radius-sm(4), md(8), lg(12), xl(16), full。影: shadow-1〜4。フォーカスリング: focus-ring-color/width/offset。

## 4. Tailwind テーマ設計（コード不要の運用指針）
- カラー: Tailwind の colors.primary, colors.accent, colors.neutral, colors.success, colors.warning, colors.danger を CSS変数参照で拡張。
- スペーシング/角丸/影: theme.spacing, theme.borderRadius, theme.boxShadow をトークン値に揃える。
- フォント: theme.fontFamily に font-sans/font-mono を割当。サイズ/行間は theme.fontSize に定義。
- ダークモード: メディアクエリではなく data-theme 属性で切替。OS設定の追従は初期値のみ。
- プラグイン: フォーカスリング/フォーム/ラインクランプ等の公式プラグインを必要に応じて有効化。

## 5. バリアント設計（class-variance-authority の方針）
- 目的: サイズ、意図（intent）、状態（state）などの組合せを型安全かつ一貫して適用する。
- 共通バリアント軸:
  - size: xs, sm, md, lg
  - intent: primary, secondary, neutral, success, warning, danger
  - state: default, hover, focus, active, disabled, loading
- 実装ガイド（概念）:
  - ベースクラスはセマンティックトークンで表現（色値の直書き禁止）。
  - 各 intent/size/state の差分は cva の variants で宣言的に管理。
  - compoundVariants で intent×state の例外扱いを定義（例: disabled は hover/active を打ち消す）。

## 6. 主要コンポーネントのガイド
- Button
  - intent: primary（主要CTA）, secondary（二次CTA）, neutral（ユーティリティ）, success/warning/danger（セマンティック）
  - size: sm(高さ32), md(40), lg(48)。角丸は md。アイコンのみは正方形。
  - ステート: hover=影 or 背景濃度+1、focus=2pxリング+オフセット、disabled=不透明度低下+カーソル抑止。
  - 禁止: lime/cyan の利用（学習UIでもボタンには使わない）。
- Input（TextField）
  - 余白: 水平12/垂直8、角丸md、枠線1px、placeholderは text-muted。
  - エラー: border= danger、補助テキストとアイコンで冗長表現。
- Card
  - 面: surface、枠線 or 影はshadow-1。タイトル/アクション領域の余白を規定。
- Tag/Badge
  - Secondary: accent を基本。学習/実績に限り accent-lime/cyan を使用。
- Alert
  - intent に応じて semantic 色を前景/背景/アイコンで統一。アクセントの多用禁止。
- Progress
  - 背景は surface-muted、バーは primary。学習/実績のハイライト時のみ lime/cyan を許可。

## 7. ダッシュボード/ゲーミフィケーションにおけるアクセント運用
- 使用対象: バッジ、進捗バー、ハイライトされたメトリクス、チャート強調系列。
- 使用量: 1画面で lime か cyan のどちらか一方。使用面積は10%以内を目安。
- 使い分け: 実績=lime、スピード/ネットワーク=cyan を推奨。

## 8. ダークモード方針
- 切替: ヘッダーのテーマトグルで data-theme を切替。初期値は OS 設定を尊重。
- 永続化: ローカルストレージに保存し、サーバーサイドでの初期描画時に FOUC を抑止する運用を推奨。
- コントラスト: 暗背景における彩度の調整を行い、可読性を担保。

## 9. アクセシビリティと可用性
- コントラスト: 本文4.5:1以上、UI前景3:1以上。テーマ切替後も満たすこと。
- フォーカス: キーボード操作でフォーカスリングを必須表示。クリック時の outline 抑止は行わない。
- 状態冗長化: 色だけに依存せず、アイコン/テキスト/線種で状態を併記。
- ヒット領域: 44px 四方以上（モバイル考慮）。

## 10. 命名・レビュー・運用
- 命名: CSS変数は `--category-tokenName`、Tailwind テーマキーは semantic 名で統一。
- レビュー: PR テンプレートに配色使用率・アクセント使用ルール遵守・コントラスト検証をチェック項目として追加。
- バージョニング: トークン変更はマイナー、破壊的変更はメジャー扱いで変更履歴を記載。

## 11. 参照
- 技術選定・候補比較: docs/design.md の「2. 技術スタック」「2.2/2.3 候補比較」「2.5 CSS戦略」
- トークン詳細: docs/design.md の「4.2 UIデザインシステム（トークン）」「4.3 トンマナ選定と適用範囲」
