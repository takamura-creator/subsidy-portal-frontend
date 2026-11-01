# HOJYO CAME frontend — API・エラー処理・AI 呼び出し 現状監査

- 対象: `takamura-creator/subsidy-portal-frontend` main `9207a9d`（本番と同じ）
- 調査日: 2026-10-31
- 方法: **コードを読んだだけ**。backend（Railway）・課金 API・本番 URL は一切呼んでいない。`npm install` もしていない（`node_modules` なし）。
- 確信度ラベル: **[事実]** = コードで確認（70%以上）／**[中程度]** = コードからの推定（50〜69%）／**[推測]** = backend 側の挙動など未確認（50%未満）
- 「無い」と書いたものは、末尾「調査コマンド」の grep の範囲で見つからなかったという意味。backend 側の実装は対象外のため、backend が何をしているかはすべて [推測] 扱い。

---

## 0. サマリー

**結論（3行）**

1. backend への呼び出しは `src/lib/api.ts` に集約されていて、既定 10 秒のタイムアウトと 401 時の 1 回だけの再試行はある。**429/5xx/タイムアウトの自動リトライはどこにも無い**。タイムアウト指定の無い直書き `fetch` が 6 箇所ある。
2. AI 診断（`/match/results`）は**ページを開くたびに AI を呼ぶ**（再読み込み・戻る/進む・同じ URL の再訪でも毎回）。結果のキャッシュは無く、AI が止まると「APIエラーが発生しました（ステータス: 503）」という技術的な文言と「診断をやり直す」だけが出て、代わりの導線は無い。
3. 補助金の一覧・詳細ページは backend が落ちても同梱データで表示し、「古い可能性」の注記を出す仕組みが既にある。一方、ログイン後の画面（`/my`・ウィザード）は失敗が「0件」に見えたり、生のステータス番号が出たりする。

**改善優先度トップ5（詳細は §7）**

| # | 内容 | 利用者が困ること | 工数感 |
|---|---|---|---|
| 1 | AI・backend 失敗時の文言を統一し、代わりの導線を出す | 「ステータス: 503」「接続をご確認ください」など、何が起きたか・次に何をすればよいかが分からない | S〜M（0.5〜1日） |
| 2 | `/match/results` の AI 診断を、同じ条件ならセッション内で再利用する | 再読み込み・戻るたびに 30 秒待たされる（同時に Claude 課金も増える） | S（0.5日） |
| 3 | HP 自動取得のタイムアウト（既定 10 秒）を見直す | backend の HP 取得だけで最大 20 秒かかるのに 10 秒で「タイムアウト」と出る | XS〜S（backend の実測確認＋1行） |
| 4 | `/my` で失敗が「申請0件」に見える・期限切れで即ログイン画面に飛ぶ | 申請が消えたように見える／作業中に突然ログアウトされる | S（0.5日） |
| 5 | ウィザードの AI 生成の再読み込み時の再生成と、タイムアウト無しの呼び出しを整理 | 生成中に再読み込みすると最初からやり直し（30秒〜1分）／ボタンが「生成中…」のまま戻らない可能性 | S〜M（0.5〜1日） |

---

## 1. ページとルートの一覧

ログイン判定は**ブラウザ側だけ**で行っている。[事実] `src/proxy.ts:109-162` は `/my`・`/admin` を見ておらず、`src/app/my/layout.tsx:44-64` と `src/app/admin/layout.tsx:30-41` が `localStorage` のトークンを見て転送する。データそのものは backend が JWT を検証して守る前提（`src/lib/auth.ts:16-31` のコメント）[推測：backend 未確認]。

### 1-1. 公開ページ（未ログインで見られる）

| パス | 種別 | 用途 | backend 呼び出し（ファイル:行） |
|---|---|---|---|
| `/` | Server | トップ。URL を入れる診断（Hero） | ブラウザから `diagnosePublic`（`src/components/home/HeroV2/HeroClientShell.tsx:122`） |
| `/about` | Server | 運営者情報 | なし |
| `/articles`, `/articles/[slug]` | Server | 記事 | なし（`src/data/articles.ts`） |
| `/cases`, `/cases/[id]`, `/cases/jichikai`, `/cases/jichikai/[slug]` | Server | 導入事例 | なし（同梱データ） |
| `/contact` | Client | 問い合わせフォーム | `submitContact`（`src/app/contact/page.tsx:103`）、ログイン時だけ `fetchProfileDetailIfLoggedIn`（同:85） |
| `/industries/[slug]` | Server | 業種別 LP | `getSubsidyById`（同梱データへの切替あり） |
| `/lp/[prefecture]` | Server | 都道府県 LP | `fetchSubsidies`（`src/app/lp/[prefecture]/page.tsx:99`、失敗時はリンクを出さない 同:101-104） |
| `/match` | Server | 業種から診断の入口 | `getAllSubsidies`（`src/app/match/page.tsx:40`） |
| `/match/results` | Client | **AI 診断結果** | `matchSubsidies`・`fetchBonusItems`・`fetchIndustryContext`（`src/app/match/results/page.tsx:68,93,97`） |
| `/partners/multik` | Server | 施工パートナー紹介 | なし |
| `/privacy`, `/terms` | Server | 規約類 | なし |
| `/results` | Server＋Client | 交付実績 DB | `fetchRecipientStats`（`src/app/results/ResultsClient.tsx:24`） |
| `/results/[prefecture]` | Client | 都道府県別の交付実績 | `fetchRecipients`（`src/app/results/[prefecture]/page.tsx:43`） |
| `/subsidies` | Server＋Client | 補助金一覧・絞り込み | `getAllSubsidies`（`src/app/subsidies/page.tsx:36`）、絞り込み時 `fetchSubsidies`（`src/app/subsidies/SubsidiesBrowser.tsx:129`） |
| `/subsidies/[id]` | Server | 補助金詳細 | `getSubsidyById`（`src/app/subsidies/[id]/page.tsx:102`）、`generateMetadata` で `fetchSubsidy`（`src/app/subsidies/[id]/layout.tsx:9`）、proxy で存在確認（`src/proxy.ts:62-99`） |
| `/subsidies/[id]/templates` | Server | 自治会向け書類テンプレート | `getSubsidyById`（`src/app/subsidies/[id]/templates/page.tsx:53`） |
| `/auth/login` | Client | ログイン | `login`（`src/app/auth/login/page.tsx:32`） |
| `/auth/register` | Client | 新規登録 | `register`・`updateProfile`（`src/app/auth/register/page.tsx:149,166`） |

### 1-2. ログイン必須ページ

| パス | 必要ロール | 用途 | 判定箇所 |
|---|---|---|---|
| `/my` | owner / admin | ダッシュボード | `src/app/my/layout.tsx:28-34,44-64` |
| `/my/applications` | 同上 | `/my` へ転送するだけ | `src/app/my/applications/page.tsx:7-9` |
| `/my/applications/[id]` | 同上 | 申請詳細・PDF | 同上 layout |
| `/my/applications/new` | 同上 | 申請の新規作成（AI に相談） | 同上 layout |
| `/my/settings` | 同上 | プロフィール・パスワード・退会 | 同上 layout |
| `/my/wizard` | 同上 | 申請ウィザード（見積・書類・AI 事業計画書） | 同上 layout |
| `/admin`, `/admin/applications`, `/admin/subsidies`(`/new`, `/[id]/edit`), `/admin/users` | admin | 管理画面 | `src/app/admin/layout.tsx:30-41` |

### 1-3. ページ以外のルート

| パス | 種別 | 内容 | 外部呼び出し |
|---|---|---|---|
| `/api/subsidies/[id]/documents` | Next API (GET) | 補助金ごとの必要書類リスト | backend `/api/subsidies/{id}`（`src/app/api/subsidies/[id]/documents/route.ts:41`）。backend 不達なら同梱データ＋`stale:true`（同:42-49） |
| `/api/templates/[category]` | Next API (GET) | テンプレート定義を返す | なし（`src/app/api/templates/[category]/route.ts:10`） |
| `/api/templates/generate` | Next API (POST) | pdfkit で PDF を生成 | なし。**認証なし**（`src/app/api/templates/generate/route.ts:7-59`） |
| `/llms.txt` | Route | AI 検索エンジン向け要約 | `getAllSubsidies`（`src/app/llms.txt/route.ts:37`） |
| `/robots.txt`, `/sitemap.xml` | Metadata | — | sitemap は `getAllSubsidies` |
| `/opengraph-image`, `/lp/[prefecture]/opengraph-image` | OG 画像 | — | Google Fonts（§2-3） |
| proxy（全ページ） | `src/proxy.ts` | `*.vercel.app`→正規ドメイン 308、存在しない補助金 id を本物の 404 に | backend `/api/subsidies/{id}`（2.5 秒） |

- [事実] `src/app/api/` の 3 ルートは、`src/` と `e2e/` 内に呼び出し元が見つからなかった（調査コマンド #12）。外部や過去の画面から呼ばれている可能性は未確認。

---

## 2. 外部への呼び出し

### 2-1. 共通の仕組み（`src/lib/api.ts`）

| 項目 | 内容 | 根拠 |
|---|---|---|
| 接続先 | `NEXT_PUBLIC_API_URL`（未設定なら `http://localhost:8000`） | `src/lib/api.ts:3-14` |
| 既定タイムアウト | 10 秒（`AbortSignal.timeout`） | `src/lib/api.ts:101-104` |
| 失敗時の型 | すべて `ApiError(status, message)`。429 は専用文言、それ以外の HTTP エラーは「APIエラーが発生しました（ステータス: N）」、タイムアウトは 408、通信失敗は 0 | `src/lib/api.ts:111-126` |
| 自動リトライ | **無し**。例外は `authFetch` の 401 → リフレッシュ → 1 回だけ再送 | `src/lib/api.ts:675-696` |
| 認証 | `localStorage` の `access_token` を Bearer で付与。リフレッシュ失敗でトークンを消してログインへ転送（公開ページ用は転送しない） | `src/lib/api.ts:661-699`, `439-450` |
| 二重送信対策 | 共通層には無い（各画面のボタン無効化のみ）。Idempotency-Key 等も無い | `grep -rni idempot src` で該当なし |
| 細かい注意 | `apiFetch` は `return res.json()` を await していないため、JSON の読み取り失敗は `ApiError` にならず `SyntaxError` のまま外に出る [事実] | `src/lib/api.ts:118` |

### 2-2. backend 呼び出し一覧（実際に画面から使われているもの）

T/O = タイムアウト、「既定」= `apiFetch` の 10 秒。二重送信の欄は「呼び出し元 UI の対策」。

| 呼び出し（api.ts:行） | backend パス | T/O | リトライ | 呼び出し元と二重送信対策 |
|---|---|---|---|---|
| `fetchSubsidies` :129 | GET `/api/subsidies` | 既定 | 無 | Server 各ページ／`SubsidiesBrowser.tsx:129`（前回結果は `cancelled` で破棄）／ウィザード Step2 `Step2Subsidy.tsx:103` |
| `fetchSubsidy` :146 | GET `/api/subsidies/{id}` | 既定 | 無 | Server 詳細／`my/wizard/page.tsx:149`／API ルート |
| `login` :183 | POST `/api/auth/login` | 既定 | 無 | `auth/login/page.tsx:32`、`disabled={loading}`（:180） |
| `register` :191 | POST `/api/auth/register` | 既定 | 無 | `auth/register/page.tsx:149`、`disabled={loading}`（:323） |
| `matchSubsidies` :199 | POST `/api/subsidies/match`（**AI**） | 60 秒 | 無 | `match/results/page.tsx:68`。ボタンでなくページ表示時に自動実行。**中断（abort）しない** |
| `diagnosePublic` :246 | POST `/api/public/diagnose`（**AI**） | 90 秒 | 無（手動の再試行あり） | `HeroClientShell.tsx:122`。解析中は入力・ボタン無効（`HeroUrlInput.tsx:42,94,133`）、再送信時は前の通信を abort（`HeroClientShell.tsx:104`） |
| `fetchMyApplications` :335 | GET `/api/applications` | 既定 | 401のみ | `my/page.tsx:67` |
| `fetchApplication` :404 | GET `/api/applications/{id}` | 既定 | 401のみ | `my/applications/[id]/page.tsx:34` |
| `createApplication` :408 | POST `/api/applications` | 既定 | 401のみ | `my/applications/new/page.tsx:183`、`disabled={submitting}`（:635） |
| `generatePdf` :418 | POST `/api/applications/{id}/generate-pdf` | 30 秒 | 無 | 申請詳細・管理画面 |
| `fetchProfileDetail` :431 | GET `/api/auth/me` | 既定 | 401のみ | `/my`・設定・ウィザード・新規申請 |
| `updateProfile`/`changePassword`/`deleteAccount` :452-479 | PUT/DELETE `/api/auth/*` | 既定 | 401のみ | 設定画面 |
| 管理系 `fetchAdmin*` ほか :498-640 | `/api/admin/*` | 既定（CSV 取込 :538 は**無し**） | 401のみ | `/admin/*` |
| `fetchRecipients`/`fetchRecipientStats` :751,773 | GET `/api/recipients*` | 既定 | 無 | `/results` 系 |
| `fetchProducts`/`fetchPackages` :844,856 | GET `/api/products*` | 既定 | 無 | `Step3Products.tsx:39-40` |
| `checkArea` :868 | GET `/api/area/check` | 既定 | 無 | `Step2Subsidy.tsx:104` |
| `createEstimate` :908 | POST `/api/estimates` | 既定 | 401のみ | `Step4Estimate.tsx:89`、`disabled={generating}`（:255） |
| `generateEstimatePdf` :924 | POST `/api/estimates/{id}/generate-pdf` | 30 秒 | 無 | Step4 / Step6Preview、`disabled={pdfLoading}` |
| `submitLead` :950 | POST `/api/leads` | 既定 | 無 | `EmailCaptureForm.tsx:70`（`disabled={isSubmitting}` :214）、`Step6Preview.tsx:298` |
| `submitContact` :977 | POST `/api/contact` | 既定 | 無 | `contact/page.tsx:103`、`disabled={submitting \|\| !consent}`（:367） |
| `fetchDocumentTemplates` :1015 | GET `/api/documents/templates` | 既定 | 無 | `Step5Documents.tsx:150` |
| `generateDocument` :1027 | POST `/api/documents/generate` | 30 秒 | 無 | `Step5Documents.tsx:175`、生成中は無効（:283,305） |
| `requestDraftGeneration` :1098 | POST `/api/documents/draft`（**AI** [推測]） | 60 秒 | 無 | `Step5Documents.tsx:407`、`disabled={loading}`（:598） |
| `fetchAiStatus` :1137 | GET `/api/ai/status` | **無し** | 無 | `my/applications/new/page.tsx:85` |
| `requestDraftAssist` :1143 | POST `/api/ai/draft-assist`（**AI**） | **無し** | 無 | `my/applications/new/page.tsx:122`、項目ごとに無効（:468,511） |
| `/api/extractions/homepage`（`authFetch` 直書き） | POST（**AI**、`api.ts:1281` のコメントに「Claude LLMで会社情報を抽出」） | **既定 10 秒** | 401のみ | `Step1Company.tsx:127`、`!extracting` で無効（:214,282） |
| `generateAIDraft` :1521 | POST `/api/v1/applications/{id}/draft/generate`（**AI**） | 120 秒 | 401のみ | `useDraft.ts:16` ← `Step7Generate.tsx:50`, `Step8Draft.tsx:81,126` |
| `fetchDraft` :1533 | GET 同 `/draft/{id}` | 既定 | 401のみ | `Step8Draft.tsx:79` |
| `patchDraftChapter` :1771 | PATCH 章の保存 | 既定 | 401のみ | `useDraft.ts:58`（失敗は console のみ、利用者には見えない） |
| `scoreApplication` :1554 | POST `/api/applications/{id}/score`（AI か不明 [推測]） | 既定 | 401のみ | `Step8Draft.tsx:329`、`disabled={scoreLoading}` |
| `exportDraftBlob` :1794 | POST `/draft/{id}/export` | **無し** | 無 | `Step8Draft.tsx:110`、`disabled={exporting}` |
| `fetchDrillDownQuestions` :1815 | POST `/drill-down-questions`（AI か不明 [推測]） | **無し** | 無 | `DrillDownChat.tsx:30` |
| `fetchBonusItems`/`fetchIndustryContext` :1667,1671 | GET `/api/v1/strategy/*` | 既定 | 無 | `match/results/page.tsx:93,97`（失敗は黙って非表示） |

`src/lib/api.ts` 以外の backend 呼び出し:

| 箇所 | 先 | T/O | 備考 |
|---|---|---|---|
| `src/proxy.ts:67` | GET `/api/subsidies/{id}` | 2.5 秒（:44,69） | 結果を 5 分（存在）/60 秒（404）メモリキャッシュ（:45-59）。不達・5xx は素通し（:77,96-98） |
| `src/components/wizard/Step1Company.tsx:127` | POST `/api/extractions/homepage` | 既定 10 秒 | 上表のとおり |
| `src/components/wizard/HomepageExtractorPanel.tsx:41` | 同上 | 既定 10 秒 | 画面に出ていない部品（付録 A） |
| `src/lib/jichikai-templates.ts:175` | POST `/api/v1/jichikai/templates/generate` | **無し** | `NEXT_PUBLIC_USE_AI_TEMPLATES === "true"` の時だけ（同:144）。本番での設定値は未確認 |

### 2-3. 第三者への呼び出し

| 呼び出し先 | 箇所 | 内容 |
|---|---|---|
| Vercel Web Analytics | `src/app/layout.tsx:116` → `src/components/analytics/AnalyticsWrapper.tsx:18-43` | ページビュー送信。PII が乗るパスはクエリを全部削除、それ以外は utm_* だけ残す。カスタムイベント `track()` は `match/results/page.tsx:72,84`, `contact/page.tsx`, `match/MatchGrid.tsx`, `components/match/QuickConsultForm.tsx`。[事実] Cookie 同意（`src/components/CookieConsent.tsx`）の結果に関係なく常に読み込まれる |
| Google Fonts（CSS とフォント本体） | `src/app/opengraph-image.tsx:8-15`, `src/app/lp/[prefecture]/opengraph-image.tsx:22-29` | OG 画像生成時にサーバー側で取得。**タイムアウト無し・失敗時の代替なし**（失敗すると OG 画像が 500 になる [中程度]） |
| Google Fonts（`<link>`） | `src/app/global-error.tsx:13-16` | 致命的エラー画面のみ |
| 外部リンク（通信ではない） | `multik.jp`, `x.com/HOJYOCAME`, `note.com/hojyocame` など | 参考 |

- [事実] gtag / GTM / Clarity / Meta Pixel / `next/script` は見つからなかった（調査コマンド #9）。

---

## 3. エラー処理と表示の現状

### 3-1. 共通のファイル

| ファイル | 内容 | 気になる点 |
|---|---|---|
| `src/app/error.tsx:6-47` | 「エラーが発生しました」＋ `error.message` をそのまま表示＋「再試行」「トップに戻る」 | 開発者向けの文言がそのまま出る可能性。ルート直下の 1 つだけで、`/my`・`/match` などの区画ごとの error.tsx は無い |
| `src/app/global-error.tsx:3-42` | 「システムエラーが発生しました」＋ `error.message`＋「再試行」 | 同上 |
| `src/app/loading.tsx:13-15` | `null` を返す（何も出さない） | 画面遷移中に何も表示されない（意図的：亀のヒーロー前の白い矩形のチラつき対策） |
| `src/app/subsidies/loading.tsx` | スケルトン表示 | — |
| `src/app/not-found.tsx` | 「ページが見つかりません」 | Next.js 16.2.2 の `loading.tsx` 下では `notFound()` が 200 になる件は、`/subsidies/{id}` と `/lp/{県}` だけ proxy で 404 にしている（`src/proxy.ts:14-31`）。`/articles/[slug]`・`/cases/*`・`/industries/[slug]` は未対応 [中程度：試していない] |

### 3-2. backend が 429 / 5xx / タイムアウトを返したとき利用者に見えるもの

`apiFetch` 経由の画面で出る文言（`src/lib/api.ts:112-125`）:

- 429: 「リクエストが多すぎます。しばらく時間をおいてから再度お試しください。」
- 5xx: 「APIエラーが発生しました（ステータス: 503）」← 番号がそのまま出る
- タイムアウト: 「リクエストがタイムアウトしました（10秒）」
- 通信失敗・CORS: 「ネットワークエラーが発生しました」

| 画面 | 失敗時の表示 | 根拠 |
|---|---|---|
| トップ診断（Hero） | ステータス別の確定文言。422「ホームページの情報を読み取れませんでした。」／429「アクセスが集中しています。1分ほどおいてから…」／408「90秒以内に解析が終わりませんでした。」／**それ以外（5xx 含む）「通信エラーが発生しました。接続をご確認ください。」**。3 回続けて失敗すると「手入力で診断」が主ボタンになる | `HeroAnalysisConsole.tsx:73-94,157-160` |
| `/match/results`（AI 診断） | 見出し「結果を取得できませんでした」＋上記の共通文言＋「診断をやり直す」（`/match` に戻る）のみ。404 は「条件に合う補助金が見つかりませんでした」 | `match/results/page.tsx:78-88`, `states.tsx:38-100` |
| 補助金一覧 `/subsidies` | 同梱データに切替え、「最新情報を取得できず」の注記 | `SubsidiesBrowser.tsx:140-147`, `subsidies-server.ts:40-54`, `StaleDataNotice.tsx` |
| 補助金詳細・`/match`・業種 LP・テンプレート | Server で同梱データに切替え＋注記。404 のときだけ「存在しない」 | `subsidies-server.ts:63-81`, `match/page.tsx:56`, `industries/[slug]/page.tsx:92` |
| `/results`, `/results/[prefecture]` | 共通文言をそのまま赤字表示 | `ResultsClient.tsx:26,45`, `results/[prefecture]/page.tsx:54` |
| `/contact` | 共通文言をそのまま表示 | `contact/page.tsx:116-121` |
| ログイン | 401→「メールアドレスまたはパスワードが正しくありません。」、429→専用、5xx/タイムアウト→共通文言 | `auth/login/page.tsx:47-58` |
| `/my`（ダッシュボード） | **申請一覧の取得失敗を空配列にする → 「申請0件」に見える** | `my/page.tsx:67-69` |
| `/my/applications/[id]` | 「申請データの取得に失敗しました」 | 同:36-41 |
| ウィザード Step2/3/4 | 共通文言をそのまま表示 | `Step2Subsidy.tsx:129-135`, `Step3Products.tsx:47-56`, `Step4Estimate.tsx:113-118` |
| ウィザード AI 生成（Step6/7） | 共通文言をそのまま表示＋「再試行」 | `useDraft.ts:19-22`, `Step7Generate.tsx:108-118`, `Step8Draft.tsx:189-191` |
| 申請の新規作成「AIに相談」 | 「現在AI機能が利用できません。しばらくしてから再度お試しください。」。`/api/ai/status` が使えないと答えたらボタン自体を出さない | `my/applications/new/page.tsx:85,135-137,463,506` |
| 章の編集の保存失敗 | 何も表示しない（console のみ） | `useDraft.ts:57-61` |

### 3-3. ログインの有効期限

- [事実] `/my` は `access_token` の有効期限だけを見て、切れていればリフレッシュを試さずにログイン画面へ送る（`src/app/my/layout.tsx:45-55`, `src/lib/auth.ts:58-62`）。`authFetch` にはリフレッシュの仕組みがあるのに（`src/lib/api.ts:675-685`）、画面を開く時点では使っていない。
- [推測] access token が短命なら、ウィザード作業中に再読み込みすると、リフレッシュトークンが有効でもログイン画面に飛ぶ。有効期限は backend の設定次第で未確認。

---

## 4. AI 機能の呼び出し

backend が実際に Claude を何回呼ぶかは backend 側のコードで決まるため未確認。「AI」の判定は frontend のコメント・文言に基づく。

### 4-1. 現在画面から使える AI 操作

| # | 画面・操作 | backend | frontend 側の回数／操作 | T/O | 重複して呼ぶ経路 | AI が止まった時の表示 | 代わりの動き |
|---|---|---|---|---|---|---|---|
| A | トップ（未ログイン）で URL を入れて「診断」 | POST `/api/public/diagnose` | 1回。backend 内部は「HP取得＋HP読み取りAI＋マッチ」（`api.ts:88-93` のコメント）→ **AI 2 段** [中程度] | 90秒 | 解析中はボタン無効（[事実]）。「中止」や「もう一度試す」は**ブラウザ側の通信を切るだけ**で、backend 側の処理は続く可能性が高い [推測]。再読み込みでは自動では呼ばない | 5xx は「通信エラーが発生しました。接続をご確認ください。」（利用者の回線のせいに読める） | backend が `fallback:true` を返せば「※ 簡易診断（AI混雑のためルールベース）」と表示（`HeroLivePreview.tsx:307-311`）。3 連続失敗で手入力（`/match`）へ誘導 |
| B | `/match` で業種を選ぶ → `/match/results` | POST `/api/subsidies/match` | ページを開くたびに 1 回（`match/results/page.tsx:56-102`） | 60秒 | **再読み込み・戻る/進む・同じ URL の共有/再訪・条件変更のたびに呼ぶ**。結果のキャッシュ無し。条件変更時は前の要求の結果を捨てるだけで中断しない（`cancelled` フラグ :61,101、`matchSubsidies` に signal 引数が無い `api.ts:199`）。開発時の StrictMode では 2 回 [事実：React の仕様] | 「結果を取得できませんでした」＋「APIエラーが発生しました（ステータス: 5xx）」＋「診断をやり直す」 | **無し**。`MatchResponse` に `fallback` が無い（`api.ts:70-74`）。補助金一覧（同梱データあり）への導線も無い |
| C | ウィザード Step1「ホームページから自動取得」 | POST `/api/extractions/homepage` | ボタン 1 回で 1 回。トップ診断から URL を引き継いだ時は**表示時に自動で 1 回**（`Step1Company.tsx:186-198`） | **10秒（既定）** | 自動実行は「会社名が未保存」の間、Step1 を開くたびに走る（`Step1Company.tsx:59-63`）。会社名は「次へ」で保存されるので、その前に再読み込みすると再実行 [中程度]。10 秒で打ち切っても backend 側は処理を続ける [推測] | 手動時「ホームページの取得がタイムアウトしました…」など（:153-169）。自動時は控えめな案内 | 手入力フォームはそのまま使える |
| D | ウィザード（持続化補助金のみ）Step6「事業計画書を生成」 | POST `/api/v1/applications/{id}/draft/generate` | 画面表示時に自動 1 回（`Step7Generate.tsx:35-68`）。backend は 6 章を生成（画面文言 :98）→ 内部で複数回呼んでいる可能性 [推測] | 120秒 | 同じ表示中の二重実行は `generatingRef` で防止（:33,40,49）。**生成中に再読み込みすると step=6 が保存されているため最初から再生成**（`my/wizard/page.tsx:109-116`）。生成済み（draftId 保存後）は再生成しない（:36-39） | 共通文言＋「再試行」 | backend が `warning` を返せば Step7 で表示（`Step8Draft.tsx:168-170`） |
| E | 同 Step7「深掘り質問」回答後 | 同上 | 回答完了で 1 回（`Step8Draft.tsx:124-135`）。draftId 無しで Step7 を開いた時も自動 1 回（:68-91） | 120秒 | 意図した再生成 | 同上 | 同上 |
| F | 同 Step7「スコア確認」 | POST `/api/applications/{id}/score` | 1回 | 10秒（既定） | `disabled={scoreLoading}` | 何も表示されない（`Step8Draft.tsx:56` で `useScore` の error を受け取っていない） | — |
| G | 同 深掘り質問の取得 | POST `.../drill-down-questions` | 表示時 1 回（`DrillDownChat.tsx:30`） | **無し** | applicationId が変わらない限り 1 回 | 空リスト（エラー表示なし :32-35） | — |
| H | ウィザード Step5（持続化以外の Tier2）「下書きを生成」 | POST `/api/documents/draft` | 1回 | 60秒 | `disabled={loading}`（:598） | 共通文言（:433-438） | backend の `fallback` を表示（:649） |
| I | `/my/applications/new`「✨ AIに相談する」 | POST `/api/ai/draft-assist` | 1回 | **無し** | 押した項目だけ無効（他の項目は同時に押せる） | 「現在AI機能が利用できません。…」 | 事前に `/api/ai/status` で使えなければボタンを隠す（**唯一の事前確認**） |
| J | 自治会テンプレート（`/subsidies/[id]/templates`） | POST `/api/v1/jichikai/templates/generate` | `NEXT_PUBLIC_USE_AI_TEMPLATES=true` の時だけ | **無し** | — | `Error("AI生成エラー: 5xx")` | 既定は AI を使わず差し込みのみ（`jichikai-templates.ts:143-157`） |

### 4-2. 画面に出ていない AI 呼び出し（現状は呼ばれない）

`AIDraftBlock`（`postGenerateSection`）、`BusinessPlanWizard`（`previewBusinessPlan`/`generateAndSaveBusinessPlan`）、`ScorePanel`（表示時に自動で採点）、`HomepageExtractorPanel`（`Step5Collect`/`Step5HPExtract` 経由）は、どのページからも import されていない（調査コマンド #14）。今後つなぐ時に同じ注意が必要。

### 4-3. AI が止まった時（backend のクレジット切れ等）の見え方まとめ

- [推測] backend が Claude のクレジット切れで 5xx を返すと仮定すると: A は「接続をご確認ください」、B は「APIエラー（ステータス: 5xx）」、C/D/E/H は共通文言、I だけが「AI機能が利用できません」と正しく伝わる。
- [推測] backend が AI 失敗時に規則ベースへ切り替えて 200＋`fallback:true` を返す実装なら、A・C・H は表示が既にある。B（AI 診断）だけは frontend に受け口が無い。
- 全体として「AI が止まっていても補助金の検索・一覧・詳細・問い合わせは使える」ことを利用者に伝える導線は無い。

---

## 5. 依存パッケージとライセンス

`package-lock.json`（lockfileVersion 3）の `license` 欄から集計。460 パッケージ（prod 44／optional 37／dev 375／devOptional 4）。

### 5-1. 直接依存

| パッケージ | 版 | ライセンス | 区分 |
|---|---|---|---|
| next | 16.2.2 | MIT | prod |
| react / react-dom | 19.2.4 | MIT | prod |
| @vercel/analytics | 2.0.1 | MIT | prod |
| framer-motion | 12.38.0 | MIT | prod |
| lucide-react | 1.7.0 | ISC | prod |
| pdfkit | 0.18.0 | MIT | prod |
| react-hook-form | 7.73.1 | MIT | prod |
| @hookform/resolvers | 5.2.2 | MIT | prod |
| zod | 4.3.6 | MIT | prod |
| @playwright/test | 1.59.1 | Apache-2.0 | dev |
| typescript | 5.9.3 | Apache-2.0 | dev |
| eslint / eslint-config-next / tailwindcss / @tailwindcss/postcss / @types/* | — | MIT | dev |

全体: MIT 366、Apache-2.0 33、ISC 18、MPL-2.0 13、LGPL-3.0-or-later 10（＋LGPL 混在 4）、BSD 9、その他少数。**GPL / AGPL は 0 件** [事実：lock の license 欄]。

### 5-2. 警告欄（GPL/AGPL は無し。要注意・不明のみ）

| パッケージ | ライセンス | どこから来るか | 配布物に入るか | 評価・代替候補 |
|---|---|---|---|---|
| `@img/sharp-libvips-*`（10 件）、`@img/sharp-win32-*`/`sharp-wasm32`（4 件） | LGPL-3.0-or-later（Apache-2.0 と混在含む） | `next` の optionalDependencies → `sharp`（Apache-2.0）→ libvips | ブラウザへは配布しない。サーバーの画像最適化で使われ得る | [中程度] Web サービスとして提供するだけ（バイナリを顧客に渡さない）なら LGPL の義務は実質発生しない。**商用で自社サーバーにセルフホスト配布する場合だけ要確認**。代替: `images.unoptimized: true` にすれば sharp 不要（ただし画像最適化が無くなる） |
| `png-js` 1.1.0 | **lock に記載なし**（npm レジストリにも license 欄なし） | `pdfkit` の依存 → `/api/templates/generate` だけが使う | サーバーのみ | 上流リポジトリ（devongovett/png.js）の LICENSE は MIT [中程度：1.1.0 の配布物そのものは未確認]。代替: 呼び出し元の無い `/api/templates/generate` を廃止すれば `pdfkit` ごと外せる（§1-3） |
| `caniuse-lite` | CC-BY-4.0 | next/browserslist | ビルド時データ | 商用可（表示義務のみ）。対応不要 |
| `lightningcss*`（12 件）、`axe-core` | MPL-2.0 | tailwind・eslint（dev） | 配布物に入らない | 対応不要 |
| `argparse`（Python-2.0）、`minimatch`（BlueOak-1.0.0）、`language-subtag-registry`（CC0） | 許諾型 | dev | 入らない | 対応不要 |

---

## 6. シークレットの扱い（名前と箇所のみ。値は記載しない）

### 6-1. `NEXT_PUBLIC_` で公開される環境変数（ブラウザに埋め込まれる）

| 名前 | 用途 | 箇所 | 秘密にすべき値か |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | backend の URL | `src/lib/api.ts:3`, `src/proxy.ts:37`, `Step1Company.tsx:18`, `HomepageExtractorPanel.tsx:6`, `jichikai-templates.ts:172` | いいえ（公開 URL） |
| `NEXT_PUBLIC_SITE_URL` | 正規 URL（OGP・sitemap） | `src/app/layout.tsx:11` ほか（計 12 ファイル） | いいえ |
| `NEXT_PUBLIC_USE_AI_TEMPLATES` | 自治会テンプレートの AI 切替 | `src/lib/jichikai-templates.ts:144` | いいえ（フラグ） |

`NEXT_PUBLIC_` 以外: `HOJYOCAME_FONT_PATH`（`src/lib/templates/pdf-generator.ts:22`、フォントのパス）、`NODE_ENV`、`CI`（`playwright.config.ts`）。

### 6-2. ハードコードの有無

- [事実] API キー・トークン・秘密鍵・JWT の形をした文字列は、追跡ファイル（lock・tsbuildinfo を除く）に見つからなかった（調査コマンド #16 の正規表現）。
- [事実] 追跡されている env ファイルは `.env.production.example` だけで、中身は上の 2 つの公開 URL の例のみ。
- [事実] `e2e/owner-flow.spec.ts:4`, `e2e/contractor-flow.spec.ts:4` にテスト用のダミーパスワードがある（本番の資格情報ではない）。ただしこのテストは画面から**実際に新規登録する**ため、`NEXT_PUBLIC_API_URL` が本番を向いた状態で実行すると本番にテストユーザーができる [中程度]。
- [事実] CI（`.github/workflows/lighthouse.yml:31-33`）はビルド時の API URL・サイト URL にダミーのホストを入れている。`secrets.*` の参照は無い。
- 認証トークンは `localStorage` に保存（`src/lib/api.ts:666,679-680`）。XSS があれば読まれる設計だが、今回は方針確認のみで変更提案はしない。

---

## 7. 改善優先度トップ5

並びは「利用者が見て困ること」優先 → 課金の無駄 → 工数の順。工数は frontend だけの目安（XS=〜2時間、S=〜半日、M=〜1日）。

### 1. AI・backend 失敗時の文言を統一し、代わりの導線を出す（S〜M）

- **困ること**: AI 診断（B）で「APIエラーが発生しました（ステータス: 503）」、トップ診断（A）で 5xx なのに「接続をご確認ください」。何が起きて次に何をすればよいかが分からず、離脱する。
- **根拠**: `src/lib/api.ts:112-115`, `src/app/match/results/states.tsx:85-97`, `src/components/home/HeroV2/HeroAnalysisConsole.tsx:89-93`
- **方向性**: `ApiError` → 利用者向け文言の対応表を 1 箇所に置く（5xx/429/408/0）。AI 系の失敗には「補助金一覧から探す」「問い合わせる」を並べる（一覧は backend が落ちても同梱データで動く）。④「AI が止まった時の扱い」の設計に直結。

### 2. `/match/results` の AI 診断を同じ条件なら再利用する（S）

- **困ること**: 再読み込み・戻る・URL の再訪のたびに 30 秒待たされる（本番実測 26.8〜30.6 秒 `api.ts:88`）。同時に Claude の課金が毎回発生する。
- **根拠**: `src/app/match/results/page.tsx:56-102`（表示のたびに `matchSubsidies`）、`src/lib/api.ts:199-211`（中断の仕組み無し）
- **方向性**: 条件をキーに `sessionStorage` へ短時間（例: 30 分）保存し、あれば再利用。条件が変わったら `AbortController` で前の通信を切る。backend 側の重複抑止（同一入力のキャッシュ）は③で別途検討。

### 3. HP 自動取得のタイムアウト 10 秒を見直す（XS〜S）

- **困ること**: ウィザード Step1 の「ホームページから自動取得」が、backend の HP 取得（最大 20 秒 `api.ts:90`）＋ AI 抽出より短い 10 秒で打ち切られ、「タイムアウトしました」と出る。backend 側は処理（と課金）を続けている可能性 [推測]。トップ診断から来た人は表示時に自動実行されるため、最初の画面で失敗を見る。
- **根拠**: `src/components/wizard/Step1Company.tsx:127-134`（timeout 指定なし → `api.ts:101` の 10 秒）、`:186-198`
- **方向性**: backend の実測時間を確認してから `timeoutMs` を指定（診断の 90 秒と同じ考え方）。**実測確認が先**（本番 API は叩かず、backend ログか backend リポジトリで確認）。

### 4. `/my` で失敗が「申請0件」に見える・期限切れで即ログイン画面へ（S）

- **困ること**: backend が一時的に落ちると、ダッシュボードの申請一覧が空になり「申請が消えた」と見える。access token が切れていると、リフレッシュトークンが有効でもログイン画面へ飛ばされ、作業が中断する。
- **根拠**: `src/app/my/page.tsx:67-69`, `src/app/my/layout.tsx:45-55`, `src/lib/auth.ts:58-62`
- **方向性**: 取得失敗は「読み込めませんでした・再試行」を出す。レイアウトの判定で期限切れなら先にリフレッシュを試す。

### 5. ウィザードの AI 生成の再読み込み時の再生成と、タイムアウト無しの呼び出しを整理（S〜M）

- **困ること**: 事業計画書の生成中（30秒〜1分）に再読み込みすると最初から生成し直しになる。タイムアウトの無い呼び出しは、backend が応答しないと「生成中…」「確認中…」のまま戻らない。
- **根拠**: `src/app/my/wizard/page.tsx:109-116`（step を保存）＋`src/components/wizard/Step7Generate.tsx:35-66`。タイムアウト無し: `src/lib/api.ts:1138`（ai/status）, `:1144`（draft-assist）, `:542`（CSV 取込）, `:1303`（アップロード・未使用）, `:1800`（書き出し）, `:1820`（深掘り質問）、`src/lib/jichikai-templates.ts:175`
- **方向性**: 生成要求中の印を保存して、再読み込み時は backend 側の生成状況を先に確認（backend に取得 API があるかは要確認）。直書き `fetch` は `apiFetch` か `timeoutMs` 付きにそろえる。

### 参考（トップ5 から外したもの）

| 内容 | 根拠 | 理由 |
|---|---|---|
| `next.config.ts` で型エラーを無視してビルド | `next.config.ts:4` | 利用者に直接は見えないが、③以降の改修で型の崩れを見逃しやすい。改修前に `tsc --noEmit` の現状確認を推奨 |
| `error.tsx` が `error.message` をそのまま表示 | `src/app/error.tsx:25`, `global-error.tsx:25` | 想定外のエラー時だけ。#1 と同時に直すと安い |
| 認証なしの PDF 生成 API（呼び出し元なし） | `src/app/api/templates/generate/route.ts` | 使っていないなら廃止で pdfkit・png-js（ライセンス不明）も消える |
| Cookie 同意と無関係に解析タグを読み込む | `src/app/layout.tsx:116` | 法務判断が要るため別件 |
| 画面に出ていない API 関数・部品が多い | 付録 A | 整理は ③〜⑤ の後で十分 |
| OG 画像の Google Fonts 取得にタイムアウト無し | `src/app/opengraph-image.tsx:8-15` | SNS シェア時のみ影響 |

---

## 付録 A. 呼び出し元が見つからなかったもの（`src/` 内の grep による）

- `src/lib/api.ts` の関数: `fetchMyDashboard`, `updateApplication`, `deleteApplication`, `fetchProfile`, `fetchPrefecturesSummary`, `fetchEstimates`, `fetchEstimate`, `fetchActivities`, `fetchNotifications`, `markNotificationRead`, `fetchMatchHistory`, `saveMatchHistory`, `extractFromHomepage`, `uploadDocument`, `getCollectedInfo`, `updateCollectedInfoManual`, `saveExtractedInfo`, `getSubsidySchema`, `generateFilledDocuments`, `downloadFilledDocument`, `downloadUploadedFile`, `fetchPrefectureGuide`, `fetchUsageRemaining`
- 呼ばれてはいるが、その部品がどのページからも使われていない: `postGenerateSection`（`AIDraftBlock`）、`previewBusinessPlan`/`generateAndSaveBusinessPlan`/`fetchBPQuestions`（`BusinessPlanWizard`）、`getActionTimeline`（`ActionTimeline`）、`fetchPendingReminders`（`PendingReminderBanner`）、`getApplicationStatus`/`patchApplicationStatus`（`StatusTransitionPanel`）、`fetchDocumentGuide`/`fetchChecklist`/`updateChecklist`（`DocsGuidePanel`）、`scoreApplication` の自動実行（`ScorePanel`）、`submitContact`（`QuickConsultForm`）、`HomepageExtractorPanel`（`Step5Collect`/`Step5HPExtract`）、`fetchSubsidies`（`SubsidyCarousel` ← `_deprecatedHeroStage`）

## 付録 B. 調査コマンド

すべて読み取りのみ。backend・本番 URL・課金 API は呼んでいない。外部通信は #17・#18 の公開ライセンス情報の確認だけ。

```bash
# 1 リポジトリの状態とファイル一覧
git status && git log --oneline -5 && git branch -a && cat package.json && find src -type f | sort
# 2 主要ファイルを読む
cat -n src/lib/api.ts src/lib/auth.ts src/proxy.ts src/app/error.tsx src/app/global-error.tsx src/app/loading.tsx src/app/not-found.tsx next.config.ts vercel.json
# 3 api.ts 以外の fetch と外部 URL
grep -rn "fetch(" src --include=*.ts --include=*.tsx | grep -v "^src/lib/api.ts"
grep -rn "https\?://" src --include=*.ts --include=*.tsx | grep -v "^src/data"
# 4 環境変数の参照箇所
grep -rn "API_BASE\|apiUrl\|NEXT_PUBLIC_\|process\.env\." src next.config.ts scripts playwright.config.ts vercel.json .env.production.example .github
# 5 api.ts の各関数の呼び出し元
for fn in $(grep -oE "^export async function [a-zA-Z]+" src/lib/api.ts | awk '{print $4}'); do echo "## $fn"; grep -rnE "\b$fn\(" src --include=*.ts --include=*.tsx | grep -v "^src/lib/api.ts"; done
# 6 ページ・ルートごとの client/server・タイトル・API 呼び出し
for f in $(find src/app -name 'page.tsx' -o -name 'route.ts' | sort); do head -1 $f; grep -oE "title: *[\"'][^\"']+" $f; done
# 7 認証ガード
grep -rln "requireAuth\|isAuthenticated()" src/app src/components
# 8 各画面の catch・エラー文言・ボタン無効化
grep -n "catch\|setError\|disabled=" <各ページ・ウィザード部品>
# 9 解析タグ等の第三者
grep -rn "gtag\|googletagmanager\|clarity\|hotjar\|facebook\|pixel\|<Script\|next/script\|speed-insights" src
# 10 AI 部品が画面に組み込まれているか
for c in ScorePanel BusinessPlanWizard AIDraftBlock ...; do grep -rln "/$c\"" src; done
# 11 ウィザードの保存・自動実行
grep -n "draftId\|localStorage.setItem\|Step7Generate\|Step8Draft" src/app/my/wizard/page.tsx
# 12 Next API ルートの呼び出し元
grep -rn "api/templates\|/documents\b" src e2e --include=*.ts --include=*.tsx | grep -v "^src/app/api/"
# 13 ライセンス集計（package-lock.json の license 欄を python3 で集計）
python3 -c "import json; ...packages[*].license を集計..."
# 14 部品の import 有無
grep -rln "_deprecatedHeroStage" src
# 15 Idempotency・型チェック無視
grep -rni "idempot" src; git grep -n "ignoreBuildErrors"
# 16 シークレットらしき文字列（一致部分は伏せ字で出力）
git ls-files | grep -iE "\.env|secret|credential|\.pem|\.key$"
git grep -nIiE "(sk-[a-z0-9_-]{10,}|sk-ant|ghp_|github_pat_|AKIA|xox[bp]-|BEGIN .*PRIVATE|api[_-]?key\s*[:=]|secret\s*[:=]|password\s*[:=]|eyJ...)" -- ':!package-lock.json' ':!tsconfig.tsbuildinfo'
# 17 png-js のライセンス（npm レジストリの公開メタデータ）
npm view png-js@1.1.0 license repository.url
curl -sS https://registry.npmjs.org/png-js/1.1.0
# 18 png-js 上流の LICENSE（公開ファイル）
curl -sS https://raw.githubusercontent.com/devongovett/png.js/master/LICENSE | head -5
```
