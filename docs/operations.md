# HOJYO CAME frontend 運用メモ

- 対象: `takamura-creator/subsidy-portal-frontend`（Next.js 16.4.3・Vercel）
- 作成: 2026-11-01（設計書 `docs/design/resilience.md` の PR-F）
- 前提: 耐障害化の PR-A〜E（[#6](https://github.com/takamura-creator/subsidy-portal-frontend/pull/6)〜[#9](https://github.com/takamura-creator/subsidy-portal-frontend/pull/9)）と PR-B を merge した後の状態を書いている。未 merge の間は「変更前」の列のとおりに動く
- このファイルには値（URL・キー・トークン）を書かない。名前と置き場所だけを書く

---

## 0. 困ったときの早見表

| 症状 | まず見る所 | 節 |
|---|---|---|
| 「ただいまAI診断を利用できません」と言われた／AI 機能だけ動かない | Anthropic のクレジット残高 → Railway のログ | §3 |
| 補助金の一覧・詳細に「最新情報を取得できず」の注記が出ている | Railway（backend）が動いているか | §4 |
| デプロイ後に画面が壊れた | Vercel で1つ前のデプロイに戻す | §5 |
| e2e テストを回したい | 本番に向けない手順 | §6 |

---

## 1. 構成

```
利用者のブラウザ ──(ページ・画像)──▶ Vercel（このリポジトリ / Next.js）
       │
       └────(API・AI を含む)──────▶ Railway（backend / FastAPI・別リポジトリ）──▶ Anthropic（Claude API）
```

- **AI の呼び出しはブラウザから Railway に直接行く**。Vercel を通らない（`src/lib/api.ts` 冒頭のコメント）。このため、AI の失敗は Vercel のログには出ない
- Vercel 側のサーバーも backend を呼ぶ。対象は補助金の一覧・詳細ページの描画と、存在しない補助金を 404 にする判定（`src/proxy.ts`）
- 補助金データの同梱コピー（`src/data/subsidies.json`）があり、backend が落ちても一覧・詳細はこれで表示する（§4）

---

## 2. 環境変数（名前と用途だけ）

Vercel の Project Settings → Environment Variables に設定する。値はここに書かない。

| 名前 | 用途 | 未設定のとき |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | backend（Railway）の URL。ブラウザに埋め込まれる（秘密ではない） | `http://localhost:8000` になり、本番ではすべての API 呼び出しが失敗する。console にエラーが出る（`src/lib/api.ts`） |
| `NEXT_PUBLIC_SITE_URL` | 正規 URL（OGP・sitemap・canonical） | `https://hojyocame.jp` を使う |
| `NEXT_PUBLIC_USE_AI_TEMPLATES` | 自治会テンプレートを AI で生成するか（`"true"` のときだけ） | AI を使わない（通常はこれ） |
| `HOJYOCAME_FONT_PATH` | サーバー側の PDF 生成（`/api/templates/generate`）の日本語フォントの場所 | Linux 標準の Noto CJK の場所を探し、無ければ Helvetica になる（日本語が文字化けする） |

例は `.env.production.example`。`NEXT_PUBLIC_` で始まる変数はブラウザから見えるので、**秘密の値（API キー等）は絶対に入れない**。Claude の API キーは backend（Railway）側にだけある。

---

## 3. AI が止まったとき（Claude のクレジット切れ・障害）

### 3-1. 利用者に見えるもの

| 機能（画面） | AI が止まったときの表示（PR-A 以降） | 代わりにできること |
|---|---|---|
| トップの URL 診断（`/`） | 「ただいま診断を利用できません。時間をおいて、もう一度お試しください。」3回続けて失敗すると「手入力で診断する」が主ボタンになる | `/match` で業種から探す |
| 業種から AI 診断（`/match/results`） | 「ただいまAI診断を利用できません」＋「同じ条件でもう一度試す」「条件に近い補助金を一覧で見る」「専門スタッフに相談する」 | 補助金一覧・問い合わせ |
| ウィザード Step1「ホームページから自動取得」 | 「自動取得できませんでした。ただいまサービスが一時的に利用できません。…」 | フォームに手で入力 |
| ウィザード Step6「事業計画書を生成」（持続化補助金） | 「ただいまサービスが一時的に利用できません。…」＋「再試行」 | — |
| ウィザード Step5「下書きを生成」（その他の補助金） | 同上 | — |
| 申請の新規作成「AIに相談する」 | 「現在AI機能が利用できません。…」。backend の `/api/ai/status` が「使えない」と答えればボタン自体を出さない | 手で入力 |

backend が AI の代わりに簡易判定（`fallback: true`）で返す場合は、トップ診断・下書き・AI 診断に「簡易診断」「簡易的な判定」の注記が出る（エラーにはならない）。ウィザード Step1 の HP 自動取得は注記を出さない。

**AI が止まっていても使える機能:** 補助金の一覧・詳細・業種別ページ、問い合わせ、交付実績、ウィザードの見積もりまで。

### 3-2. 気づき方と確認の順番

1. **Vercel Analytics の `ai_unavailable` イベント**（PR-A で追加）
   - Vercel の Project → Analytics → Events で見る
   - `feature` は `match`/`diagnose`/`extract`/`draft`/`assist`、`kind` は `unavailable`/`rate_limited`/`timeout`/`unreachable`/`offline`/`unknown`
   - 入力値（業種・地域・URL）は送っていない
   - カスタムイベントが見られるかは Vercel のプランによる [推測]
2. **Anthropic Console のクレジット残高**（Billing）。クレジットが尽きると、backend の Claude 呼び出しがエラーになる [中程度：エラーの正確な形は backend 側で確認]
3. **Railway の backend のログ**。Claude 呼び出しのエラーや 5xx を探す。ブラウザから見える失敗は backend 経由なので、原因はここにある
4. **利用者のブラウザの console**。`[match] status=503 …` の形で残る（`src/lib/errorCopy.ts` の `logApiError`）。どこにも集計されないので、問い合わせを受けたときに利用者の画面で確認する用途

`kind` の見分け方:
- `unreachable`（サーバーに届かない）が多い → Railway そのものが落ちている可能性。§4 も確認する
- `unavailable`（5xx）が多い → backend は動いていて、AI 側（クレジット・Anthropic の障害）の可能性
- `rate_limited`（429）が多い → アクセス集中か、backend・Anthropic の利用上限

### 3-3. 復旧後

frontend 側の作業は要らない。利用者が「もう一度試す」を押せば通る。AI 診断の結果は同じ条件なら 30 分ほどブラウザに残る（PR-B）ので、復旧直後でも古い失敗の表示は残らない（失敗は保存しない）。

---

## 4. backend（Railway）が止まったとき

| 画面 | 見え方 |
|---|---|
| 補助金の一覧・詳細・`/match`・業種別ページ | 同梱データで表示し、「最新情報を取得できず」の注記を出す |
| AI 診断・URL 診断・HP 取得 | §3-1 と同じ（多くは `unreachable`） |
| ログイン・新規登録・問い合わせ・ウィザード・`/my` | 「サーバーに接続できませんでした。…」など。`/my` の申請一覧は「読み込めませんでした」＋「もう一度読み込む」（PR-D） |

同梱データの更新方法（backend のデータを変えたとき）:
- `npm run sync-subsidies` で、隣に置いた backend リポジトリの `data/subsidies.json` からコピーし、コミットする
- Vercel のビルドでは backend が無いので同期は失敗するが、ビルドは止まらない（`prebuild` の `|| true`）。**手元で実行してコミットする必要がある**

---

## 5. デプロイと戻し方

- main に merge すると Vercel が本番にデプロイする。PR ごとにプレビューのデプロイが作られる
- **プレビューで AI 診断を動かすと課金される可能性がある**（プレビューの `NEXT_PUBLIC_API_URL` が本番 backend を向いている場合 [推測]）。AI の画面の確認は §6 の偽応答のテストで行う

### 壊れたときに戻す（Instant Rollback）

- ダッシュボード: Project → Deployments で、正常だった本番デプロイの「…」メニューから Instant Rollback [中程度：画面の配置は Vercel 側で変わることがある]
- CLI: `vercel rollback`（対象を指定する場合は `vercel rollback <deployment-url>`）。状態は `vercel rollback status`
- **Hobby プランでは1つ前の本番デプロイにしか戻せない**。それより前に戻すには Pro が必要（Vercel のドキュメント `docs/cli/rollback`）
- **戻した後は、main に merge しても本番のドメインが自動では切り替わらない**。直したデプロイを `vercel promote <deployment-url>`（またはダッシュボードの Promote）で本番に上げると、自動の切り替えも元に戻る（Vercel のドキュメント `docs/instant-rollback`）

---

## 6. テストの安全な回し方

### 本番に向けずに e2e を回す

1. つながらない宛先で開発サーバーを起動する（偽応答を付け忘れた通信もすぐ失敗し、本番には届かない）
2. 別の端末から、偽応答で動くテストを指定して実行する

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next dev -p 3000
```
```bash
npx playwright test ai-unavailable timeouts my-resilience wizard-regenerate results-sidebar-guest effects-refactor
```

backend の呼び出しは各テストの中で `page.route` の偽応答にしている。Claude API も backend も呼ばない。

### 都道府県LPのキャッシュタグ（`e2e/lp-cache-tags.test.ts`・2026-11-01）

本番で `/lp/{県}` が `Invalid character in header content ["x-next-cache-tags"]` で 500 になっていた件の回帰テスト（Next.js 16.2.2 の不具合。16.4.3 へ更新して解消）。

- 前半（47都道府県の soft tag がヘッダーに書けるか）はサーバー不要で、普段の `npx playwright test` で回る
- 後半は Vercel と同じ minimal mode の本番ビルドが要る。開発サーバーではこのヘッダーが出ないので確かめられない（`E2E_MINIMAL_BASE_URL` が無ければ飛ばす）

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next build
```
```bash
NEXT_PRIVATE_MINIMAL_MODE=1 NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next start -p 3100
```
```bash
E2E_MINIMAL_BASE_URL=http://localhost:3100 npx playwright test lp-cache-tags
```

### 本物の backend が要るテスト（本番に向けて実行しない）

| テスト | 必要なもの | 注意 |
|---|---|---|
| `e2e/api-auth.spec.ts` | `localhost:8000` の backend | — |
| `e2e/owner-flow.spec.ts`, `e2e/contractor-flow.spec.ts` | backend | **画面から実際に新規登録する**。本番に向けるとテストユーザーができる |
| `e2e/role-guard.spec.ts` | テストユーザーが入った DB | — |
| `e2e/public-pages-no-login-redirect.test.ts` の「/my は 401 でログインへ」 | 401 を返す backend | 届かない宛先では失敗する（コードの不具合ではない） |

### 変更を入れる前の確認（耐障害化の PR で使った手順）

| コマンド | 2026-11-01 時点の値 |
|---|---|
| `npm run lint` | 29 件（11 errors / 18 warnings）、すべて既存。**件数が増えていないこと**を見る。2026-11-01 に `eslint-config-next` 16.4.3 で増えたルールの27件（`react-hooks/set-state-in-effect` 15件・`@next/next/no-location-assign-relative-destination` 11件・`react-hooks/incompatible-library` 1件）は直した。残る `set-state-in-effect` 10件は更新前からある分 |
| `npx tsc --noEmit` | 97 件、すべて画面に組み込まれていない部品。**件数が増えていないこと**を見る（§7） |
| `npm run build` | 外部フォントの取得（OG 画像）にネットワークが要る。取得できない環境では静的生成で止まる（Vercel では成功する） |

**Playwright のブラウザの版が合わないとき:** 手元のブラウザの版が `@playwright/test` と違う場合は、ブラウザをダウンロードし直さずに一時的な設定で手元の Chromium を指定する（`use.launchOptions.executablePath`）。

---

## 7. 既知の制約

| 制約 | 影響 | 場所 |
|---|---|---|
| `notFound()` が HTTP 200 になる（Next.js 16.2.2 の `loading.tsx` の仕様） | `/subsidies/{id}` と `/lp/{県}` だけ proxy で本物の 404 にしている。記事・事例・業種ページは 200 のまま。16.4.3 では backend 不達でも `/subsidies/{存在しない id}` が 404 になることを手元で確認した（記事・事例・業種ページは未確認） | `src/proxy.ts` |
| 型エラーを無視してビルドする | 型の崩れがあってもデプロイされる。既存の 97 件はすべて画面に組み込まれていない部品 | `next.config.ts` の `typescript.ignoreBuildErrors` |
| 認証トークンは localStorage | XSS があると読まれる。画面のログイン判定はブラウザ側だけで、データは backend が JWT で守る前提 | `src/lib/auth.ts` |
| 解析タグは Cookie 同意と無関係に読み込む | 法務判断が要る（未対応） | `src/app/layout.tsx` |
| AI の「中止」はブラウザ側の待ちを止めるだけ | backend 側の処理と課金は続く可能性 [推測] | `src/lib/api.ts` の `diagnosePublic` |

### タイムアウト一覧（調査のとき用）

| 呼び出し | 打ち切り | 定数・場所 |
|---|---|---|
| 一般の API | 10 秒 | `src/lib/api.ts` の `apiFetch` |
| AI 診断 `/api/subsidies/match` | 60 秒 | `MATCH_TIMEOUT_MS` |
| URL 診断 `/api/public/diagnose` | 90 秒 | `DIAGNOSE_TIMEOUT_MS` |
| HP 自動取得 `/api/extractions/homepage` | 60 秒（PR-C） | `EXTRACT_TIMEOUT_MS` |
| 事業計画書の生成 | 120 秒 | `generateAIDraft` |
| PDF・書類の生成 | 30〜60 秒 | 各関数 |
| AI 利用可否の確認 `/api/ai/status` | 5 秒（PR-C） | `fetchAiStatus` |
| 補助金の存在確認（proxy） | 2.5 秒 | `src/proxy.ts` |

AI の呼び出しは**自動では再試行しない**（待ち時間と課金が倍になるため）。再試行は利用者がボタンで選ぶ。

---

## 8. 関連資料

- 現状監査: `docs/api-audit.md`（[#4](https://github.com/takamura-creator/subsidy-portal-frontend/pull/4)）
- 設計書: `docs/design/resilience.md`（[#5](https://github.com/takamura-creator/subsidy-portal-frontend/pull/5)）
- backend 側でやると効くこと（同じ入力の結果のキャッシュ、AI 失敗時の簡易判定、所要時間のログ等）: 設計書 §7
