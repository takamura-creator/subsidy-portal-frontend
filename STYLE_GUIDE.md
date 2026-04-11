# STYLE_GUIDE.md — 補助金ポータル

> AIエージェントが正確な日本語UIを生成するためのスタイルガイド。
> セクションヘッダーは英語、値の説明は日本語で記述。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 中立的で信頼感のある補助金マッチングプラットフォーム。特定メーカーを推さず、公共性と専門性を感じさせるクリーンなUI
- **密度**: 公開ページはゆったり、管理画面は情報密度の高い業務UI
- **キーワード**: 中立・信頼・専門性・クリーン・アクセシブル
- **対象ユーザー**: 防犯カメラ導入を検討する中小企業、防犯カメラ設置業者、管理者
- **ダークモード**: 初期はライトモードのみ

---

## 2. Color Palette & Roles

### Brand Colors

- **Primary** (`#0D9488`): メインアクセント。CTAボタン、アクティブ状態、信頼感の表現
- **Secondary** (`#1E3A5F`): ヘッダー、ナビゲーション、見出し。権威性・専門性の表現
- **Accent** (`#D97706`): 工事業者向け要素、注目ポイント、差別化カラー

### Semantic

- **Success** (`#16A34A`): マッチング成立、承認、完了
- **Warning** (`#CA8A04`): 締切間近、注意喚起
- **Error** (`#DC2626`): エラー、募集終了、却下

### Neutral

| Token | Value | 用途 |
|-------|-------|------|
| Text | `#1A1A1A` | 本文テキスト、見出し |
| Text2 | `#6B6B7B` | 補足テキスト、ラベル、プレースホルダー |
| Border | `#E5E5E5` | 区切り線、入力欄の枠 |
| BG | `#FFFFFF` | ページ背景 |
| Surface | `#F7F7F8` | カード背景、セクション背景 |
| Surface Alt | `#ECECF1` | ホバー状態、選択状態の背景 |

### CSS変数マッピング

```css
:root {
  --portal-bg: #FFFFFF;
  --portal-bg-card: #F7F7F8;
  --portal-bg-surface: #ECECF1;
  --portal-text: #1A1A1A;
  --portal-text2: #6B6B7B;
  --portal-border: #E5E5E5;
  --portal-primary: #0D9488;
  --portal-secondary: #1E3A5F;
  --portal-accent: #D97706;
  --portal-success: #16A34A;
  --portal-warning: #CA8A04;
  --portal-error: #DC2626;
  --portal-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08);
  --portal-shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.06);
}
```

---

## 3. Typography Rules

### フォント

- **ゴシック体**: Noto Sans JP（Google Fonts / Next.js `next/font`）
- ウェイト: 300 (Light), 400 (Regular), 500 (Medium)
- **等幅**: Geist Mono（コードブロック用）

### font-family 指定

```css
font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
```

### 文字サイズ・ウェイト階層

| Role | Size | Weight | Line Height | 備考 |
|------|------|--------|-------------|------|
| Display | 32-40px | 500 | 1.2 | ヒーロー見出し、KPI大数値 |
| Heading 1 | 24-28px | 500 | 1.3 | ページタイトル |
| Heading 2 | 18-20px | 500 | 1.4 | セクション見出し |
| Body | 14-16px | 400 | 1.6 | 本文、フォーム |
| Caption | 12-13px | 400 | 1.5 | ラベル、補足 |
| Small | 10-11px | 400-500 | 1.4 | タグ、バッジ |

---

## 4. Component Stylings

### Buttons

**Primary（CTA）**
- Background: `var(--portal-primary)`
- Text: `#FFFFFF`
- Padding: `12px 20px`
- Border Radius: `10px`
- Font: 15px / weight 500

**Secondary / Outline**
- Background: `transparent`
- Text: `var(--portal-text)`
- Border: `1px solid var(--portal-border)`
- Border Radius: `10px`

**Accent（工事業者向けCTA）**
- Background: `var(--portal-accent)`
- Text: `#FFFFFF`
- Border Radius: `10px`

**共通**
- Disabled: `opacity: 0.5; pointer-events: none`
- Transition: `transition-all`
- Focus: `ring-2 ring-offset-2`

### Inputs

- Background: `var(--portal-bg-card)`
- Border: `1.5px solid var(--portal-border)`
- Border (focus): `1.5px solid var(--portal-primary)`
- Border Radius: `10px`
- Padding: `12px 14px`
- Font Size: `16px`（モバイルズーム防止）
- Height: `48px`

### Cards

- Background: `var(--portal-bg-card)`
- Border: `1px solid var(--portal-border)`
- Border Radius: `10px`
- Padding: `16px`
- Shadow: `var(--portal-shadow)`

### Tables

- Header Background: `var(--portal-secondary)`
- Header Text: `#FFFFFF`
- Row Border: `1px solid var(--portal-border)`
- Cell Padding: `10px 14px`
- Hover Row: `rgba(13, 148, 136, 0.04)`
- Alternating Rows: 使用しない（ボーダーで区切り）

### Badges

- 補助金ステータス: `open`=Success, `closed`=Error, `upcoming`=Warning
- ロール: `owner`=Primary, `contractor`=Accent, `admin`=Secondary
- 共通: rounded-full, px: 8px, py: 2px, text: 11px

### Navigation（ヘッダー）

- Height: `64px`
- Background: `#FFFFFF`
- Border Bottom: `1px solid var(--portal-border)`
- Logo: 左寄せ
- Nav Links: 中央
- Auth Buttons: 右寄せ
- モバイル: ハンバーガーメニュー

---

## 5. Layout Principles

### Spacing Scale（8px ベース）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンとテキストの隙間 |
| S | 8px | カード内の要素間 |
| M | 16px | カードのパディング |
| L | 24px | セクション区切り |
| XL | 32px | ページセクション間 |
| XXL | 48-64px | ヒーローセクション余白 |

### Container

- **公開ページ**: `max-width: 1200px`（ゆったり）
- **管理画面**: `max-width: 1400px`
- **マイページ/業者ポータル**: `max-width: 960px`
- Padding (horizontal): `16px`（モバイル）/ `24px`（デスクトップ）

### Grid

- **KPIカード**: `grid-cols-2 lg:grid-cols-4`
- **業者カード一覧**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **補助金カード一覧**: `grid-cols-1 lg:grid-cols-2`
- Gutter: `16px`（`gap-4`）

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | フラット要素 |
| 1 | `var(--portal-shadow)` | カード、ヘッダー |
| 2 | `var(--portal-shadow-md)` | モーダル、ドロップダウン |
| Focus | `0 0 0 2px rgba(13,148,136,0.2)` | フォーカスリング |

---

## 7. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 768px | モバイルレイアウト |
| Tablet | ≤ 1024px | タブレット |
| Desktop | > 1024px | デスクトップ |

### レスポンシブルール

- ヘッダー: デスクトップ=水平ナビ → モバイル=ハンバーガー
- カードグリッド: デスクトップ=3列 → タブレット=2列 → モバイル=1列
- テーブル: モバイルではカード型に変換
- タッチターゲット: 最小 `44px × 44px`

---

## 8. Do's and Don'ts

### Do（推奨）

- CSS変数 `var(--portal-*)` を使用する
- 入力フォントは `16px` 以上（iOS ズーム防止）
- 日本語本文の `line-height` は `1.5` 以上
- カラーコントラストは WCAG AA 以上を確保
- 8px ベースの Spacing Scale に従う
- 企業向け=Primary色、業者向け=Accent色で視覚的に区別
- 中立的なトーン（特定メーカーを推さない）

### Don't（禁止）

- テキストに `#000000` を使わない（`#1A1A1A` を使う）
- ハードコードされた色を直接使わない（CSS変数経由）
- `border-radius` を `10px` 以上にしない（`rounded-full` を除く）
- `font-weight: 700` を多用しない（500 で十分）
- 特定メーカーのロゴや製品名を目立たせない
- ダーク背景をメインに使わない

---

## 9. Agent Prompt Guide

### クイックリファレンス

```
Primary: #0D9488
Secondary: #1E3A5F
Accent: #D97706
Text: #1A1A1A
Background: #FFFFFF
Surface: #F7F7F8
Border: #E5E5E5
Font: "Noto Sans JP", sans-serif
Body Size: 14-16px
Line Height: 1.6
Border Radius: 10px
Spacing Unit: 8px
```
