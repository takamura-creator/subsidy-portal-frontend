# 設計書: 耐障害化・AI 停止時の扱い・運用ドキュメント（③④⑤）

- 対象: `takamura-creator/subsidy-portal-frontend`（main `9207a9d` 時点）
- 前提資料: 現状監査 [takamura-creator/subsidy-portal-frontend#4](https://github.com/takamura-creator/subsidy-portal-frontend/pull/4)（`docs/api-audit.md`）。本書の「監査§n」はその節を指す
- 優先順位: 監査のトップ5の順番どおり（オーナー承認済み 2026-11-01）
- 期限: 2026-11-05 16:59 JST（クラウドセッションのクレジット失効）までに ③④⑤ を出し切る
- この PR は**設計書だけ**。コードは変えない。承認後に ③ から実装 PR を1本ずつ出す
- 確信度ラベル: [事実] コードで確認／[中程度] コードからの推定／[推測] backend など未確認

---

## 0. サマリー

**結論**

1. 実装は **5本の小さい PR（A〜E）＋運用ドキュメント1本**に分ける。順番は監査のトップ5のまま。新しい依存ライブラリは入れない。backend は変更しない。
2. AI が止まったときの方針は「**自動では再試行しない・技術用語を出さない・AI を使わない導線（補助金一覧・問い合わせ）を必ず出す**」。frontend からは、backend の 5xx と `fallback:true` のどちらが来ても同じように扱えるようにする（backend がどちらを返すかは未確認のため）。
3. テストは Playwright で **backend をすべて `page.route` の偽応答に置き換えて**行う。本番 backend と Claude API はテストでもプレビュー確認でも呼ばない。

**オーナーに決めてほしいこと（§6。各項目に推奨あり）**

| # | 決めること | 推奨 |
|---|---|---|
| D1 | AI 診断が止まったとき、結果ページに出す「代わりの動き」 | A: 導線だけ（補助金一覧・相談） |
| D2 | HP 自動取得のタイムアウト | A: 60秒 |
| D3 | 診断結果を再利用する期間と保存先 | A: 30分・sessionStorage |
| D4 | 事業計画書の生成中に再読み込みしたときの扱い | A: 離脱警告＋再読み込み後は自動で生成せずボタンを出す |
| D5 | AI が使えなかった回数を計測するか | A: 計測する（既存の Vercel Analytics の `track`） |

---

## 1. スコープ

### やること

| 監査の順位 | 実装 PR | 中身 | 工数感 |
|---|---|---|---|
| 1 | **PR-A** | 失敗時の文言を1箇所にまとめ、AI が使えないときの表示部品を作る（④の本体） | M（約1日） |
| 2 | **PR-B** | `/match/results` で同じ条件の診断結果を再利用し、古い通信は中断する | S（約半日） |
| 3 | **PR-C** | HP 自動取得のタイムアウトを延ばす＋タイムアウト指定の無い呼び出しに上限を付ける | XS〜S |
| 4 | **PR-D** | `/my` の取得失敗を「0件」と見せない＋期限切れのときに先にトークン更新を試す | S |
| 5 | **PR-E** | 事業計画書の生成中に再読み込みしたとき、黙って作り直さない | S |
| ⑤ | **PR-F** | 運用ドキュメント `docs/operations.md` | S |

### やらないこと（理由）

| 項目 | 理由 |
|---|---|
| backend の変更（結果のキャッシュ、`/match` の規則ベース代替、二重送信を防ぐキー、生成状況の取得 API） | 別リポジトリで今回の対象外。§7 に「backend 側でやると効くこと」として残す |
| AI の死活監視（定期的に状態を確認する仕組み） | 失敗したときに正しく見せれば十分。確認の呼び出しが増え、backend の負荷と運用の手間も増える |
| 自動リトライ | AI は1回 30 秒かかり、呼ぶたびに課金される。待ち時間と費用が倍になるので入れない。再試行は利用者がボタンで選ぶ |
| エラー監視サービス（Sentry 等）の導入 | 新しい依存と契約が要る。今回は Vercel Analytics の `track` で足りる（D5） |
| トークンの保存先変更・Cookie 同意と解析タグの連動 | 影響範囲が広い、または法務判断が要る。別件 |
| 画面に出ていない部品（監査 付録A）の整理 | 利用者には見えない。③〜⑤の後で十分 |

---

## 2. 共通方針（④ AI が止まったときの扱い）

### 2-1. 失敗の分類と文言

新しいファイル `src/lib/errorCopy.ts` に、`ApiError` から「種類」と「利用者向けの文言」を返す関数を1つ置く。画面ごとに文言を書かない。

| 種類 | 判定 | 汎用の文言 | AI 機能の画面での見出し |
|---|---|---|---|
| `rate_limited` | 429 | アクセスが集中しています。1分ほどおいてから、もう一度お試しください。 | ただいまAI診断が混み合っています |
| `timeout` | 408（frontend の打ち切り） | 時間内に処理が終わりませんでした。混み合っている可能性があります。 | AI診断に時間がかかっています |
| `unavailable` | 5xx | ただいまサービスが一時的に利用できません。時間をおいてもう一度お試しください。 | ただいまAI診断を利用できません |
| `offline` | 0 かつ `navigator.onLine === false` | インターネットに接続されていないようです。接続を確認してください。 | （汎用と同じ） |
| `unreachable` | 0 かつ オンライン | サーバーに接続できませんでした。時間をおいてもう一度お試しください。 | ただいまAI診断を利用できません |
| `not_found` | 404 | 画面ごとに決める（例: 診断は「条件に合う補助金が見つかりませんでした」） | — |
| `auth` | 401/403 | 今の動きを変えない | — |
| `bad_request` | その他の 4xx | 入力内容を処理できませんでした。内容を確認してもう一度お試しください。 | — |

- **ステータス番号は画面に出さない**。調査用には `console.warn` で残す。
- `unreachable` を分けるのは、Railway が落ちて CORS ヘッダーの無いエラーを返すと、ブラウザからは「通信失敗（0）」に見えるため [中程度]。そのとき利用者の回線のせいにする文言（今の Hero の「接続をご確認ください」）は出さない。
- 既存の `apiFetch` の `message`（`src/lib/api.ts:112-125`）は変えない。画面側が `message` ではなく `errorCopy` を使うように切り替える（`api.ts` を呼ぶ他の箇所に影響を出さないため）。

### 2-2. AI が使えないときの表示部品

新しい部品 `src/components/shared/AiUnavailableNotice.tsx` を作る。

```
┌───────────────────────────────────────────┐
│ ただいまAI診断を利用できません                  │ ← 見出し（§2-1）
│ ただいまサービスが一時的に利用できません。…      │ ← 本文（§2-1）
│ AIを使わなくても、補助金の検索と相談はご利用いただけます。│
│ [ 同じ条件でもう一度試す ]  ← 再試行（押した時だけ AI を呼ぶ）│
│ [ 条件に近い補助金を一覧で見る ] → /subsidies?industry=… │
│ [ 専門スタッフに相談する ]       → /contact            │
└───────────────────────────────────────────┘
```

- `/subsidies?industry=` は既にある導線と同じ形（`src/app/match/MatchGrid.tsx:198`）。一覧は backend が落ちていても同梱データで表示される（`src/app/subsidies/SubsidiesBrowser.tsx:140-147`）[事実]。
- `/contact` は今は URL で問い合わせ種別を指定できない（`src/app/contact/page.tsx:40-45`）。リンクだけにする。
- 再試行ボタンは、押している間は無効にする。

### 2-3. 使う画面

| 画面 | 今（監査§3-2, §4） | 変更後 |
|---|---|---|
| `/match/results`（AI 診断） | 「結果を取得できませんでした」＋「APIエラー（ステータス: 5xx）」＋「診断をやり直す」 | 429/408/5xx/0 は `AiUnavailableNotice`。404 は今の「見つかりませんでした」のまま |
| トップ診断（Hero） | 5xx は「通信エラーが発生しました。接続をご確認ください。」 | `ERROR_COPY.other`（`HeroAnalysisConsole.tsx:89-93`）を `unavailable`/`unreachable` の文言に差し替える。台本で決めた見た目と導線（3回失敗で手入力を主ボタンに）は変えない |
| ウィザード Step6/7（事業計画書） | 共通文言＋「再試行」 | 見出しと本文を `errorCopy` に。「再試行」はそのまま |
| ウィザード Step5 の下書き生成・Step1 の HP 取得 | 共通文言 | `errorCopy` の汎用文言に |
| `/results`・`/contact`・ウィザード Step2〜4 | `err.message` をそのまま表示 | `errorCopy` の汎用文言に |
| `src/app/error.tsx`, `global-error.tsx` | `error.message` をそのまま表示（`error.tsx:25`） | 決まった文言＋エラーID（`digest`）。`error.message` は console のみに出す |

### 2-4. backend の返し方が分からない点への備え

- backend が 5xx を返す場合 → §2-1 の `unavailable`
- backend が 200 で `fallback:true` を返す場合 → Hero・HP 取得・Step5 の下書きは既に表示がある（監査§4-1）。`/match/results` は型（`MatchResponse`, `src/lib/api.ts:70-74`）に `fallback?: boolean` を足しておき、`true` なら結果の上に「※ AIが混み合っているため、簡易的な判定で表示しています」と出す。**backend が返さなければ何も起きない**ので、安全に先に入れておける。

### 2-5. 計測（D5 で A を選んだ場合）

- AI の呼び出しが失敗したとき `track("ai_unavailable", { feature, kind })` を送る。`feature` は `match`/`diagnose`/`extract`/`draft`/`assist`、`kind` は §2-1 の種類。
- 業種・地域・URL などの入力値は送らない（`AnalyticsWrapper.tsx` の PII 方針に合わせる）。
- `track` は既に使っている（`src/app/match/results/page.tsx:72`）ので新しい依存は要らない。Vercel のプランによってカスタムイベントが見られない可能性がある [推測]。その場合も害はない。

---

## 3. 実装 PR ごとの設計（③）

### PR-A: 失敗時の文言の統一と AI 停止時の表示（監査 #1）

| 変更するファイル | 内容 |
|---|---|
| `src/lib/errorCopy.ts`（新規） | §2-1 の判定と文言 |
| `src/components/shared/AiUnavailableNotice.tsx`（新規） | §2-2 |
| `src/app/match/results/page.tsx`, `states.tsx` | `ErrorState` を `AiUnavailableNotice` に置き換え。「同じ条件でもう一度試す」で `doneKey` を戻して再取得 |
| `src/lib/api.ts` | `MatchResponse` に `fallback?: boolean` を追加（§2-4） |
| `src/components/home/HeroV2/HeroAnalysisConsole.tsx` | `ERROR_COPY.other` の文言だけ差し替え |
| `src/app/error.tsx`, `src/app/global-error.tsx` | `error.message` を画面に出さない |
| `src/app/results/ResultsClient.tsx`, `src/app/results/[prefecture]/page.tsx`, `src/app/contact/page.tsx`, `src/components/wizard/Step2Subsidy.tsx`, `Step3Products.tsx`, `Step4Estimate.tsx`, `Step5Documents.tsx`, `Step1Company.tsx`, `src/lib/useDraft.ts` | 表示文言を `errorCopy` 経由に |
| `e2e/ai-unavailable.test.ts`（新規） | §5 |

- 受け入れ条件:
  - `/match/results` で偽の 503・429・通信失敗を返すと、§2-1 の見出しと3つのボタンが出る
  - 画面のどこにも「ステータス: 」が出ない
  - 一覧へのリンクに業種が付いている
  - 404 は今の空状態のまま

### PR-B: AI 診断の結果を再利用する（監査 #2）

- 保存先と期間は D3（推奨: `sessionStorage`、30分）。キーは `hc_match_cache_v1:` ＋ 条件（`queryKey`, `src/app/match/results/page.tsx:50`）。保存する値は `{ savedAt, matches }`。
- 表示時の流れ:
  1. 有効な保存があれば、それを表示して API は呼ばない
  2. 無ければ `matchSubsidies` を呼び、成功したら保存
  3. 失敗（404 以外）は保存しない
  4. 404（該当なし）は保存して空状態を出す
- `matchSubsidies(req, signal?)` に中断用の引数を足し、effect の後片付けで `abort()` する。**中断はブラウザ側の待ちを止めるだけで、backend の課金は止まらない** [推測]。主な効果は保存による再利用のほう。
- `sessionStorage` が使えない環境（プライベートモードの一部など）では、今と同じく毎回呼ぶ。例外は投げない。
- 加点項目・業種別の戦略（`fetchBonusItems`/`fetchIndustryContext`）は AI ではない [推測] ので保存しない。
- 受け入れ条件:
  - 偽応答で、同じ条件の再読み込みでは `/api/subsidies/match` が1回しか呼ばれない
  - 条件を変えると呼ばれる
  - 31分後（時計を進めて確認）は呼ばれる

### PR-C: タイムアウトを見直す（監査 #3, #5 の一部）

| 呼び出し | 今 | 変更後 |
|---|---|---|
| HP 自動取得 `/api/extractions/homepage`（`Step1Company.tsx:127`、画面に出ていない `HomepageExtractorPanel.tsx:41` も同じに） | 10秒（既定） | **D2（推奨 60秒）**。`api.ts` に定数 `EXTRACT_TIMEOUT_MS` を置く |
| `fetchAiStatus`（`api.ts:1138`） | 無し | 5秒。失敗時は「使えない」扱い（今と同じ） |
| `requestDraftAssist`（`api.ts:1144`） | 無し | 60秒 |
| `importSubsidiesCSV`（`api.ts:542`） | 無し | 60秒 |
| `exportDraftBlob`（`api.ts:1800`） | 無し | 60秒 |
| `fetchDrillDownQuestions`（`api.ts:1820`） | 無し | 60秒 |
| `uploadDocument`（`api.ts:1303`）・`generateTemplateViaAI`（`jichikai-templates.ts:175`） | 無し | 画面で使われていない、または機能フラグが無効なので今回は触らない |

- `authFetch` の型（`FetchOptions`, `api.ts:654`）に `timeoutMs` を足し、`apiFetch` にそのまま渡す。
- 60秒の根拠: HP 取得の打ち切りが 20 秒（`api.ts:90` のコメント）＋ AI の読み取り。診断（HP 取得＋AI 読み取り＋マッチ）が 90 秒なので、それより短い。**backend の実測時間を Railway のログで確認できれば、その約2倍に直す**。
- 待ち時間が長くなるので、Step1 の取得中の表示に「最大60秒ほどかかります」を添える。
- 受け入れ条件: 偽応答を 15 秒遅らせても、Step1 でタイムアウトにならない。

### PR-D: `/my` の失敗の見せ方とトークン更新（監査 #4）

- `src/app/my/page.tsx:67-69`: 失敗したら空配列にせず `appsError` を立てて「申請一覧を読み込めませんでした」＋「再読み込み」を出す（文言は `errorCopy`）。
- `src/app/my/layout.tsx:44-64`: access token が期限切れでも refresh token があれば、先に `refreshToken()`（`api.ts:644`）を1回試す。
  - 成功: 新しいトークンを保存して表示する
  - 失敗: 今と同じくログイン画面へ（戻り先も今と同じ）
  - 試している間は今の空の `div` を出す（チラつき対策を崩さない）
- 同時に何本も更新を走らせないよう、更新中の Promise を1つに共有する小さな関数（`ensureFreshToken`）を `src/lib/api.ts` に置き、`authFetch` の 401 処理（`api.ts:675-685`）もこれを使う。
- `/admin` は今回は変えない（オーナー自身が使う画面のため）。必要なら同じ関数で後から直せる。
- 受け入れ条件:
  - 期限切れの access token と有効な refresh token（偽応答）で `/my` を開くと、ログイン画面に飛ばずに表示される
  - 申請一覧の偽 503 で「0件」ではなく読み込み失敗の表示が出る

### PR-E: 事業計画書の生成中の再読み込み（監査 #5）

- D4 の推奨 A:
  1. 生成中は `beforeunload` で離脱の確認を出す（ブラウザ標準の確認画面。文言はブラウザが決める）
  2. 生成を始めたら、ウィザードの状態に `draftGenerationStartedAt`（時刻）を保存する。保存は既存の仕組み（`src/app/my/wizard/page.tsx:109-116`）をそのまま使う。成功・失敗で消す
  3. Step6 を開いたとき、`draftId` が無く、`draftGenerationStartedAt` が3分以内なら**自動では生成しない**。「前回の生成が途中で止まりました。もう一度生成しますか？（最初から作り直します。30秒〜1分ほどかかります）」と「生成する」ボタンを出す
  4. 3分を過ぎた印は無視して、今どおり自動で生成する
- 変更するファイル: `src/components/wizard/types.ts`（項目追加）、`src/app/my/wizard/page.tsx`（印の保存と受け渡し）、`src/components/wizard/Step7Generate.tsx`
- `Step8Draft.tsx:68-91` の「draftId 無しで開いたら生成」も同じ印を見る。
- 受け入れ条件: 偽応答を遅らせて生成中に再読み込みすると、生成 API が呼ばれず、ボタンが出る。押すと1回だけ呼ばれる。

---

## 4. 運用ドキュメントの構成（⑤ / PR-F）

`docs/operations.md`（Markdown 1ファイル。値は書かず、名前と場所だけ）

1. **構成**: ブラウザ → Vercel（このリポジトリ）／ブラウザ → Railway（backend）→ Anthropic。AI の呼び出しはブラウザから Railway に直接行き、Vercel を通らない（`src/lib/api.ts:88-93`）
2. **環境変数**: 名前と用途だけ（監査§6-1）
3. **AI が止まったとき**
   - 利用者に見えるもの（画面ごとの表。③で変えた後の状態）
   - 確認する順番: Vercel Analytics の `ai_unavailable` が増えているか → Railway のログ → Anthropic Console のクレジット残高
   - AI が止まっていても使える機能: 補助金の一覧・詳細・問い合わせ・交付実績
4. **backend が止まったとき**: 一覧・詳細は同梱データで表示され、「古い可能性」の注記が出る（監査§3-2）。同梱データの更新は `npm run sync-subsidies`
5. **デプロイと戻し方**: Vercel の Instant Rollback の手順
6. **テストの安全な回し方**:
   - `NEXT_PUBLIC_API_URL` を届かない宛先にして `page.route` で偽応答を返す（§5）
   - 実際に新規登録する既存のテスト（`e2e/owner-flow.spec.ts` ほか）は本番に向けて実行しない
7. **既知の制約**: `notFound()` が 200 になる件（`/subsidies/{id}` と `/lp/{県}` だけ proxy で対応済み）、`typescript.ignoreBuildErrors: true`（`next.config.ts:4`）

---

## 5. テスト方針

- **本番 backend と Claude API は呼ばない**:
  - テスト用サーバーは `NEXT_PUBLIC_API_URL=http://127.0.0.1:9`（つながらない宛先）で起動する
  - ブラウザからの呼び出しは `page.route("**/api/...")` で偽応答を返す（既存の `e2e/results-sidebar-guest.test.ts:49` と同じ方法）
  - サーバー側の取得はつながらないので、同梱データの表示になる（それで問題ない画面だけを対象にする）
- **新しいテスト**: `e2e/ai-unavailable.test.ts`（PR-A）、`e2e/match-cache.test.ts`（PR-B）、`e2e/my-resilience.test.ts`（PR-D）、`e2e/wizard-regenerate.test.ts`（PR-E）。PR-C は Step1 の遅延応答テストを PR-A のファイルに入れる
- **タイムアウトの確認**: 60〜90 秒待つテストは作らない。偽応答を「遅らせても打ち切られない」側だけ確かめる。打ち切り時の文言は `errorCopy` の対応表をコードレビューで確認する
- **各 PR で確認するコマンド**（push 前に実行し、結果を PR に貼る）:
  - `npm run lint`
  - `npx tsc --noEmit`（型エラーの無視設定があるため。PR の前後で件数が増えないことだけを見る）
  - `npm run build`
  - 該当する e2e
- **プレビュー環境で確認するときの注意**: Vercel のプレビューが本番 backend を向いている場合 [推測]、AI 診断を手で試すと課金される。AI の画面はテスト（偽応答）で確認し、プレビューでは AI を呼ばない画面だけを見る

---

## 6. オーナーに決めてほしいこと

| # | 選択肢 A（推奨） | 選択肢 B | 推奨の理由 |
|---|---|---|---|
| D1 AI 診断が止まったときの代わりの動き | 導線だけ（一覧・相談・再試行） | 結果ページの中に、同梱データから条件で絞った簡易一覧を出す | A は既にある画面を使うので工数が小さい。B は「AI の結果」と誤解されないための見せ方の設計が追加で要る。必要なら③の後に B へ広げられる |
| D2 HP 自動取得のタイムアウト | 60秒 | 90秒（診断と同じ） | 自動取得は Step1 の最初の画面で走るので、待たせすぎない。実測が分かれば直す |
| D3 診断結果の再利用 | 30分・sessionStorage（タブを閉じたら消える） | 24時間・localStorage | 補助金の状況は日単位で変わる。同じ端末の別の人に診断条件が残らない |
| D4 生成中の再読み込み | 離脱警告＋再読み込み後はボタンで再生成 | 離脱警告だけ | B だと、警告を無視して再読み込みすると今と同じく黙って作り直す（課金も2回） |
| D5 失敗の計測 | `track("ai_unavailable")` を入れる | 入れない | クレジット切れに利用者より先に気づける。新しい依存は要らない |

返事の例: 「全部 A」「D1 だけ B」。返事が無い項目は推奨の A で進める。

---

## 7. backend 側でやると効くこと（今回は対象外・メモ）

| 項目 | 効果 |
|---|---|
| `/api/subsidies/match` に同じ入力の結果のキャッシュ | 端末をまたいだ重複でも課金されない（PR-B は同じタブ内だけ） |
| `/api/subsidies/match` の AI 失敗時に規則ベースの結果＋`fallback:true` | §2-4 の受け口がそのまま使える |
| HP 抽出・診断の所要時間をログに出す | D2 のタイムアウトを実測で決められる |
| 問い合わせの二重送信を防ぐキー | 10 秒のタイムアウト後に再送されても問い合わせが重複しない |
| 事業計画書の生成状況の取得 API | PR-E で「途中のものを取りに行く」ことができる |
| Claude のクレジット切れを専用のステータス（例: 503＋理由）で返す | frontend で「混雑」と「停止」を分けて表示できる |

---

## 8. 進め方と日程（目安）

| 日 | 作業 |
|---|---|
| 11/1 | 本設計書の確認・D1〜D5 の回答 |
| 11/2 | PR-A |
| 11/3 | PR-B・PR-C |
| 11/4 | PR-D・PR-E |
| 11/5 午前 | PR-F（運用ドキュメント）、予備 |

- 各 PR は main から切る。前の PR が merge されていなくても進められるよう、ファイルの重なりを小さくする（PR-B は PR-A の部品を使うので、PR-A の merge 後に出す）
- main への直接 push はしない。merge はオーナーが行う
