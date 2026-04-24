# STYLE_GUIDE.md — 補助金ポータル（HOJYO CAME）

> AIエージェントが正確な日本語UIを生成するためのスタイルガイド。
> デザインシステム: **j3_earth** — 自然・大地をモチーフとしたグリーン基調の業務UI。
> セクションヘッダーは英語、値の説明は日本語で記述。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: j3_earth — 自然・大地を感じさせるアーストーン。中立的で信頼感のある補助金マッチングプラットフォーム。特定メーカーを推さず、公共性と専門性を感じさせるクリーンな業務UI
- **密度**: 公開ページはゆったり、管理画面・マイページは情報密度の高い3カラム業務UI
- **キーワード**: 自然・信頼・専門性・クリーン・アースカラー
- **対象ユーザー**: 防犯カメラ導入を検討する中小企業、防犯カメラ設置業者、管理者
- **ダークモード**: 初期はライトモードのみ

---

## 2. Color Palette & Roles

### Brand Colors

- **Primary** (`#15803D` / `--hc-primary`): メインアクセント。CTAボタン、アクティブ状態、信頼感の表現（グリーン）
- **Primary Hover** (`#0d6c4a` / `--hc-primary-hover`): Primary のホバー状態
- **Navy** (`#1C1917` / `--hc-navy`): ヘッダー、見出し、権威性・専門性の表現（ほぼ黒のウォームトーン）
- **Accent** (`#CA8A04` / `--hc-accent`): 工事業者向け要素、注目ポイント、差別化カラー（ゴールド）
- **Accent Light** (`#FEF9C3` / `--hc-accent-light`): Accent の薄い背景。バッジ背景、注目バナー

### Brand Identity — ロゴ専用トークン（Sprint 2.5 追加 / トニー承認済み）

HOJYO_CAME_design_spec_v1 §1 のロゴ仕様で使用する色。サイト全体の Primary（`#15803D`）とは **意図的に別系統**（teal / navy）として管理する。ロゴマーク・ヘッダーのサイト名以外には使わない。

- **HOJYO 色** (`#0D9488` / `--hc-brand-hojyo`): 「HOJYO」文字 / teal
- **CAME 色** (`#1E3A5F` / `--hc-brand-came`): 「CAME」文字 / navy

使用箇所: `components/Header.tsx`, `components/layout/HCHeader.tsx` のロゴテキストのみ。

### Semantic

- **Success** (`#16A34A` / `--hc-success`): マッチング成立、承認、完了
- **Warning** (`#EAB308` / `--hc-warning`): 締切間近、注意喚起。Accent（ゴールド）より明度が高い黄色で「警戒・注意」のニュアンスを持つ。テキスト表示時は `#92400E`（amber-800相当）との組み合わせを推奨（WCAG AA確保）
- **Error** (`#DC2626` / `--hc-error`): エラー、募集終了、却下

### Neutral

| Token | Variable | Value | 用途 |
|-------|----------|-------|------|
| BG | `--hc-bg` | `#FAFAF5` | ページ背景（ウォームホワイト） |
| BG Dark | `--hc-bg-dark` | `#1C1917` | ダーク背景（フッター等） |
| White | `--hc-white` | `#FFFFFF` | カード背景、入力フィールド背景 |
| Text | `--hc-text` | `#1C1917` | 本文テキスト、見出し |
| Text Muted | `--hc-text-muted` | `#57534E` | 補足テキスト、ラベル、プレースホルダー |
| Border | `--hc-border` | `#E7E5E4` | 区切り線、入力欄の枠 |

### CSS変数マッピング

```css
:root {
  /* Brand Colors */
  --hc-primary: #15803D;
  --hc-primary-hover: #0d6c4a;
  --hc-navy: #1C1917;
  --hc-accent: #CA8A04;
  --hc-accent-light: #FEF9C3;

  /* Semantic Colors */
  --hc-success: #16A34A;
  --hc-warning: #EAB308;
  --hc-error: #DC2626;

  /* Neutral Colors */
  --hc-bg: #FAFAF5;
  --hc-bg-dark: #1C1917;
  --hc-text: #1C1917;
  --hc-text-muted: #57534E;
  --hc-border: #E7E5E4;
  --hc-white: #FFFFFF;

  /* Elevation */
  --hc-shadow: rgba(13,82,95,0.08) 0px 12px 28px -12px, rgba(0,0,0,0.04) 0px 4px 12px -4px, rgba(0,0,0,0.02) 0px 1px 4px;
  --hc-shadow-md: rgba(13,82,95,0.12) 0px 16px 36px -16px, rgba(0,0,0,0.06) 0px 6px 16px -6px;
  --hc-focus-ring: 0 0 0 3px rgba(21,128,61,0.15);
}
```

### Transparency Variants — 透過トークン（Sprint 4 追加 / 2026-04-24）

RGBA ハードコード一掃（キョウカイ L-4）のため、各ブランド色・セマンティック色・テキスト色の透過バリエーションをトークン化。`color-mix(in srgb, ...)` で基色から算出し、基色変更時に自動追従する。新規コードで RGBA を直接書くことは禁止し、下記トークンを参照すること。

#### Primary Variants（グリーン系）

| Token | 算出式 | 用途 |
|-------|--------|------|
| `--hc-primary-faint` | primary 3% | 最弱のホバー背景、フォーム面の淡いアクセント |
| `--hc-primary-light` | primary 12% | 選択中チェックボックス・ピル・アクティブタブの背景 |
| `--hc-primary-line` | primary 15% | Primary 色系の枠線（選択状態のボーダー等） |

> 既存: `--hc-primary-subtle` / `--hc-primary-muted` / `--hc-primary-soft` / `--hc-primary-border` / `--hc-primary-edge` / `--hc-primary-pin`（globals.css 定義済）

#### Success Variants（承認・完了系）

| Token | 算出式 | 用途 |
|-------|--------|------|
| `--hc-success-subtle` | success 4% | 承認通知・成功ステータスバッジの背景 |
| `--hc-success-edge` | success 8% | 承認通知のボーダー |

#### Accent Variants（ゴールド系）

| Token | 算出式 | 用途 |
|-------|--------|------|
| `--hc-accent-line` | accent 20% | 注目通知・Accent 系パネルのボーダー |

#### Error Variants（エラー・却下・募集終了系）

| Token | 算出式 | 用途 |
|-------|--------|------|
| `--hc-error-subtle` | error 6% | エラーボックス背景 |
| `--hc-error-edge` | error 8% | エラー系ピル・タグ背景 |
| `--hc-error-line` | error 20% | エラーボックスの内側ボーダー |
| `--hc-error-border` | error 30% | Danger Zone（削除系操作）の強調ボーダー |

#### Text / Black Variants（本文・区切り線系）

| Token | 算出式 | 用途 |
|-------|--------|------|
| `--hc-text-faint` | text 2% | テーブル行のゼブラ・超淡い面塗り |
| `--hc-text-divider` | text 5% | テーブルヘッダー背景・薄い区切り面 |
| `--hc-text-line` | text 8% | 罫線・中間ボーダー |

> 既存: `--hc-text-subtle`（globals.css 定義済）

#### CSS変数マッピング（追加分）

```css
:root {
  /* Primary Variants */
  --hc-primary-faint:  color-mix(in srgb, var(--hc-primary)  3%, transparent);
  --hc-primary-light:  color-mix(in srgb, var(--hc-primary) 12%, transparent);
  --hc-primary-line:   color-mix(in srgb, var(--hc-primary) 15%, transparent);

  /* Success Variants */
  --hc-success-subtle: color-mix(in srgb, var(--hc-success)  4%, transparent);
  --hc-success-edge:   color-mix(in srgb, var(--hc-success)  8%, transparent);

  /* Accent Variants */
  --hc-accent-line:    color-mix(in srgb, var(--hc-accent)  20%, transparent);

  /* Error Variants */
  --hc-error-subtle:   color-mix(in srgb, var(--hc-error)    6%, transparent);
  --hc-error-edge:     color-mix(in srgb, var(--hc-error)    8%, transparent);
  --hc-error-line:     color-mix(in srgb, var(--hc-error)   20%, transparent);
  --hc-error-border:   color-mix(in srgb, var(--hc-error)   30%, transparent);

  /* Text / Black Variants */
  --hc-text-faint:     color-mix(in srgb, var(--hc-text)     2%, transparent);
  --hc-text-divider:   color-mix(in srgb, var(--hc-text)     5%, transparent);
  --hc-text-line:      color-mix(in srgb, var(--hc-text)     8%, transparent);
}
```

> **運用ルール**: 新規コードで `rgba(21,128,61,...)` 等の RGBA 直書きは禁止。上記トークンで近似値が存在しない場合は、当該色のバリアント追加を先に STYLE_GUIDE §2 に提案し、キョウカイ Lint を通過させてから使用すること。

### --portal-* エイリアス（後方互換）

既存TSXコンポーネントが `--portal-*` 変数を参照しているため、globals.css にエイリアスを維持する。新規コードでは `--hc-*` を使用すること。

```css
--portal-shadow: var(--hc-shadow);
--portal-shadow-md: var(--hc-shadow-md);
--portal-focus-ring: var(--hc-focus-ring);
--portal-primary: var(--hc-primary);
/* 他省略 — globals.css 参照 */
```

### Tailwind テーマトークン

globals.css の `@theme inline` で以下をマッピング済み:

| Tailwind クラス | CSS変数 | 例 |
|----------------|---------|-----|
| `bg-primary` | `--hc-primary` | `bg-primary` |
| `text-navy` | `--hc-navy` | `text-navy` |
| `bg-accent` | `--hc-accent` | `bg-accent` |
| `bg-accent-light` | `--hc-accent-light` | `bg-accent-light` |
| `text-text` | `--hc-text` | `text-text` |
| `text-text-muted` | `--hc-text-muted` | `text-text-muted` |
| `border-border` | `--hc-border` | `border-border` |
| `bg-bg` | `--hc-bg` | `bg-bg` |
| `bg-success` | `--hc-success` | `bg-success` |
| `bg-warning` | `--hc-warning` | `bg-warning` |
| `bg-error` | `--hc-error` | `bg-error` |

---

## 3. Typography Rules

### フォント

- **本文**: Noto Sans JP（Google Fonts / `@theme inline --font-sans`）
- **見出し・ディスプレイ**: Sora（`@theme inline --font-display`）— 英数字に鋭さを出す
- **等幅**: Geist Mono（コードブロック用）
- ウェイト（Noto Sans JP）: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- ウェイト（Sora）: 400, 500, 600, 700

### font-family 指定

```css
/* 本文 */
font-family: 'Noto Sans JP', sans-serif;

/* 見出し */
font-family: 'Sora', 'Noto Sans JP', sans-serif;
```

### 文字サイズ・ウェイト階層

| Role | Size | Weight | Font | Line Height | 備考 |
|------|------|--------|------|-------------|------|
| Display | 1.5rem (24px) | 700 | Sora | 1.3 | h1。ページタイトル |
| Heading 2 | 1.25rem (20px) | 700 | Sora | 1.4 | セクション見出し |
| Heading 3 | 1rem (16px) | 700 | Sora | 1.4 | サブセクション |
| Body | 13px | 400 | Noto Sans JP | 1.6 | 本文、フォーム |
| Input | 16px | 400 | Noto Sans JP | 1.5 | 入力フィールド（iOS ズーム防止） |
| Caption | 11-12px | 400-500 | Noto Sans JP | 1.4 | ラベル、補足、ステータスバー |
| Small | 10-11px | 400-500 | Noto Sans JP | 1.4 | タグ、バッジ |

### 見出しの追加スタイル

```css
h1, h2, h3 {
  letter-spacing: -0.3px;
  color: var(--hc-navy);
}
```

---

## 4. Component Stylings

### Buttons

**Primary（CTA）**
- Background: `var(--hc-primary)`
- Text: `#FFFFFF`
- Padding: `12px 24px`
- Border: `2px solid var(--hc-primary)`
- Border Radius: `8px`
- Font: 14px / weight 600
- Hover: 背景白・テキストPrimary色（反転）

**Secondary / Outline**
- Background: `transparent`
- Text: `var(--hc-text)`
- Border: `1px solid var(--hc-border)`
- Padding: `10px 20px`
- Border Radius: `8px`
- Font: 13px / weight 500
- Hover: ボーダーとテキストがPrimary色に

**Accent（工事業者向けCTA）**
- Background: `var(--hc-accent)`
- Text: `#FFFFFF`
- Border Radius: `8px`

**共通**
- Disabled: `opacity: 0.5; pointer-events: none`
- Transition: `all 0.2s`
- Focus: `outline: 2px solid var(--hc-primary); outline-offset: 2px`

### Inputs

- Background: `var(--hc-white)`
- Border: `1px solid var(--hc-border)`
- Border (focus): `border-color: var(--hc-primary)` + `box-shadow: var(--hc-focus-ring)`
- Border Radius: `8px`
- Padding: `10px 14px`
- Font Size: `13px`（CSS クラス使用時）/ `16px`（Tailwind inline 使用時、iOS ズーム防止）

### Cards

- Background: `var(--hc-white)`
- Border: `1px solid var(--hc-border)`
- Border Radius: `10px`
- Padding: `16px`
- Shadow: `var(--hc-shadow)`
- Hover: `var(--hc-shadow-md)` + `translateY(-2px)`
- Transition: `box-shadow 0.25s ease, transform 0.25s ease`

### Tables

- Header Background: `var(--hc-navy)`（`bg-navy`）
- Header Text: `#FFFFFF`
- Row Border: `1px solid var(--hc-border)`
- Cell Padding: `10px 14px`
- Hover Row: `rgba(21, 128, 61, 0.04)`（Primary の 4% 透過）
- Alternating Rows: 使用しない（ボーダーで区切り）

### Badges

- 補助金ステータス: `open`=Success, `closed`=Error, `upcoming`=Warning (`--hc-warning`)
- ロール: `owner`=Primary, `contractor`=Accent, `admin`=Navy
- 注目バッジ: bg=`var(--hc-accent-light)`, text=`var(--hc-accent)`
- 共通: rounded-full, px: 8px, py: 2px, text: 11px

### Checkbox（カスタム）

- Border: `1px solid var(--hc-border)`
- Border Radius: `8px`
- Padding: `10px 14px`
- Gap: `10px`
- Hover: `border-color: var(--hc-primary)`, bg=`rgba(21,128,61,0.04)`
- Selected: `border-color: var(--hc-primary)`, bg=`rgba(21,128,61,0.08)`, weight=600

### Step Dots（ウィザード）

- Size: `28px × 28px`
- Border: `2px solid var(--hc-border)`
- Font: Sora, 12px, 700
- Active/Done: bg + border = `var(--hc-primary)`, text = white

### Navigation（ヘッダー）

- Height: `52px`（`--hc-header-h`）
- Background: `rgba(250,250,245,0.85)` + `backdrop-filter: blur(12px)`
- Border Bottom: `1px solid var(--hc-border)`
- Logo: 左寄せ
- Nav Links: 中央
- Auth Buttons: 右寄せ
- モバイル: ハンバーガーメニュー

### Status Bar（フッター相当）

- Height: `28px`（`--hc-status-h`）
- Font: 10-11px

---

## 5. Layout Principles

### Spacing Scale（8px ベース）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンとテキストの隙間 |
| S | 8px | カード内の要素間 |
| M | 16px | カードのパディング、サイドバーパディング |
| L | 24px | セクション区切り |
| XL | 32px | メインカラムのパディング（上下） |
| XXL | 40px | メインカラムのパディング（左右） |

### 3カラムレイアウト

| エリア | Variable | Width | 用途 |
|--------|----------|-------|------|
| Left | `--hc-left-w` | `240px` | サイドナビゲーション |
| Center | — | `1fr`（残り） | メインコンテンツ |
| Right | `--hc-right-w` | `260px` | コンテキストパネル |

- グリッド: `grid-template-columns: var(--hc-left-w) 1fr var(--hc-right-w)`
- 全体: `grid-template-rows: var(--hc-header-h) 1fr var(--hc-status-h)`, `height: 100vh`

### Container

- **ホーム（`/`）**: 1カラム中央寄せ（CTA一点型）
- **公開ページ（/about, /match, /subsidies, /contractors 等）**: 3カラムレイアウト可。デスクトップアプリ風UIとして情報量を確保
- **管理画面・マイページ・業者ポータル**: 3カラムレイアウト

### Grid

- **KPIカード**: `grid-cols-2 lg:grid-cols-4`
- **業者カード一覧**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **補助金カード一覧**: `grid-cols-1 lg:grid-cols-2`
- Gutter: `16px`（`gap-4`）

---

## 6. Depth & Elevation

| Level | Variable | Value | 用途 |
|-------|----------|-------|------|
| 0 | — | `none` | フラット要素 |
| 1 | `--hc-shadow` | `rgba(13,82,95,0.08) 0px 12px 28px -12px, ...` | カード、ヘッダー |
| 2 | `--hc-shadow-md` | `rgba(13,82,95,0.12) 0px 16px 36px -16px, ...` | モーダル、ドロップダウン、ホバー |
| Focus | `--hc-focus-ring` | `0 0 0 3px rgba(21,128,61,0.15)` | フォーカスリング |

---

## 7. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 640px | 1カラム。サイドバー非表示、パディング 16px |
| Tablet | ≤ 1024px | 2カラム（左サイドバー非表示） |
| Desktop | > 1024px | 3カラム |

### レスポンシブルール

- ヘッダー: デスクトップ=水平ナビ → モバイル=ハンバーガー
- 3カラム: デスクトップ=3列 → タブレット=2列（左非表示） → モバイル=1列
- テーブル: モバイルではカード型に変換
- タッチターゲット: 最小 `44px × 44px`

---

## 8. Background

j3_earth テーマは背景にグラデーションパターンを使用:

```css
body {
  background-color: var(--hc-bg); /* #FAFAF5 */
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(21,128,61,0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(202,138,4,0.04) 0%, transparent 50%),
    linear-gradient(180deg, rgba(21,128,61,0.03) 0%, rgba(202,138,4,0.02) 40%, var(--hc-bg) 100%);
  background-attachment: fixed;
}
```

---

## 9. Animations

- **フェードスライドイン**: `fadeSlideIn 0.3s ease-out`（ページ遷移、カード表示）
- **スケルトン**: `shimmer 1.5s infinite`（ローディング表示）
- **カードホバー**: `box-shadow 0.25s ease, transform 0.25s ease`
- **Reduced Motion**: `prefers-reduced-motion: reduce` でアニメーション無効化

---

## 10. Do's and Don'ts

### Do（推奨）

- CSS変数 `var(--hc-*)` を使用する（新規コード）
- 入力フォントは `16px`（Tailwind inline 使用時、iOS ズーム防止）
- 日本語本文の `line-height` は `1.5` 以上
- カラーコントラストは WCAG AA 以上を確保
- 8px ベースの Spacing Scale に従う
- 企業向け=Primary色、業者向け=Accent色で視覚的に区別
- 中立的なトーン（特定メーカーを推さない）
- 見出しには Sora フォントを使用
- 補助金名称・制度名は公式名称を使用する（略称・俗称を避ける）

### Don't（禁止）

- テキストに `#000000` を使わない（`var(--hc-text)` = `#1C1917` を使う）
- ハードコードされた色を直接使わない（CSS変数 or Tailwindテーマトークン経由）
- `border-radius` を `10px` より大きくしない（`rounded-full` を除く）
- カード = `10px`、ボタン・入力 = `8px` を守る
- `font-weight: 700` は見出し（Sora）のみ。本文では `400-500` を使う
- 特定メーカーのロゴや製品名を目立たせない
- ダーク背景をメインに使わない（フッター・OGP除く）
- `--portal-*` を新規コードで使わない（`--hc-*` を使うこと）
- 煽り表現（「今すぐ！」「最後のチャンス！」等）を使わない — 公共性の高い補助金ポータルのトーンに不適切

---

## 11. OGP画像のカラー方針

ImageResponse API は CSS変数を使用できないため、OGP画像ではHEX値を直接使用する。
使用するカラーは本 STYLE_GUIDE の定義値（j3_earth）に準拠すること:

- 背景グラデーション: `linear-gradient(135deg, #1C1917 0%, #16A34A 100%)`（Success色。Primary より明度が高くSNSタイムラインでの視認性向上）
- テキスト: `#FFFFFF`

---

## 12. Agent Prompt Guide

### クイックリファレンス

```
Design System: j3_earth
Primary: #15803D (green)
Navy: #1C1917 (warm black)
Accent: #CA8A04 (gold)
Accent Light: #FEF9C3
Success: #16A34A
Warning: #EAB308 (yellow)
Error: #DC2626
Text: #1C1917
Text Muted: #57534E
Background: #FAFAF5 (warm white)
White: #FFFFFF
Border: #E7E5E4
CSS Variable Prefix: --hc-*
Font Body: "Noto Sans JP", sans-serif (13px)
Font Display: "Sora", sans-serif (headings, 700)
Line Height: 1.6
Border Radius: Card=10px, Button/Input=8px
Spacing Unit: 8px
Header Height: 52px
Layout: 3-column (240px / 1fr / 260px)
```

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-04-07 | 初版作成（teal系 `--portal-*`） |
| 2026-04-14 | j3_earth 準拠に全面書き換え（`--hc-*` 正式採用）。キョウカイ Lint 報告書に基づく |
| 2026-04-14 | Ashitaka レビュー反映: Warning色分離(`#EAB308`)、OGPグラデ終点変更(`#16A34A`)、Do/Don't 2項目追加 |
| 2026-04-24 | §2 Transparency Variants 追加（13 トークン）。Sprint 4 Task 2（キョウカイ L-4 / `my/*` 系 RGBA 一掃）に伴う正式登録。primary-faint/light/line、success-subtle/edge、accent-line、error-subtle/edge/line/border、text-faint/divider/line |
