"use client";

/**
 * SubsidiesBrowser.tsx — 補助金一覧（左フィルターレール + カードグリッド Apple閲覧型）
 *
 * SEO/AEO Phase 5: page.tsx をサーバー化するため、現 page.tsx の client ロジックを
 * 1文字も変えずそのまま移設（フィルタ/ソート/useEffect ライブfetch/フォールバック）。
 * `initialSubsidies` / `initialIndustry` prop を受け取り useState 初期値にする点のみ追加。
 *
 * `?industry=` クエリは page.tsx（Server Component）が `searchParams` prop 経由で解決し
 * `initialIndustry` として渡す。`useSearchParams` は Suspense 配下で SSR 出力を
 * サスペンドさせクローラーに空HTMLを返す実害があったため不使用（実装時の技術的補正）。
 *
 * Sprint 2 カードグリッド化:
 * - OUTER max1200 / 2カラム（248px レール + 右本体）
 * - SubsidiesFilterRail（左sticky） + SubsidiesCardGrid（右）
 * - SubsidiesToolbar（モバイルシートのみ）
 * - state/filter/sort ロジックは現行維持
 *
 * 2026-09-15 注文書（frontend API切替）: `@/data/subsidies.json` の直接importを廃止。
 * 初期表示は page.tsx（Server Component）が `subsidies-server.ts` 経由でAPI優先取得した
 * `initialSubsidies` / `initialStale` を使う。マウント後の絞り込みは `fetchSubsidies()` を
 * 直接叩き、失敗時は直前の一覧を保持したまま `StaleDataNotice` で「古い可能性」を明示する
 * （件数比較でAPI結果を静的データに差し替える旧ロジックは削除 — API成功時は常にAPI結果を
 * 正とする。黙って古いデータを出さないため）。
 */

import { useState, useEffect } from "react";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import { fetchSubsidies, Subsidy } from "@/lib/api";
import { filterCameraOnly } from "@/lib/subsidyFilters";
import { toApiIndustry } from "@/lib/constants";
import { compareByStatus } from "@/lib/subsidyStatus";
import { getDaysUntil } from "@/lib/deadlineUtils";
import { formatSubsidyAmount, hasAmountCap } from "@/lib/subsidyFormatters";
// getDaysUntil は sorted の sort ロジックで使用
import StaleDataNotice from "@/components/subsidies/StaleDataNotice";
import SubsidiesFilterRail from "./SubsidiesFilterRail";
import SubsidiesCardGrid from "./SubsidiesCardGrid";
import SubsidiesToolbar from "./SubsidiesToolbar";
import SubsidiesFooterNote from "./SubsidiesFooterNote";
import subsidiesJson from "@/data/subsidies.json";

/** 開発環境専用フォールバック（API・同梱データが両方空の場合の最終防衛。実データではない） */
const CAMERA_SUBSIDIES: Subsidy[] = process.env.NODE_ENV === "development" ? [
  { id: "1", name: "IT導入補助金（セキュリティ対策推進枠）", category: "国", ministry: "中小企業庁", pref_code: "", prefecture: "", max_amount: 1000000, rate_min: 0.5, rate_max: 0.75, target_industries: [], max_employees: 300, deadline: "2026/4/30", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "3", name: "小規模事業者持続化補助金", category: "国", ministry: "商工会議所", pref_code: "", prefecture: "", max_amount: 500000, rate_min: 0.667, rate_max: 0.667, target_industries: [], max_employees: 20, deadline: "2026/5/31", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "5", name: "東京都 防犯設備設置費助成事業", category: "都道府県", ministry: "東京都", pref_code: "13", prefecture: "東京都", max_amount: 100000, rate_min: 0.5, rate_max: 0.5, target_industries: [], max_employees: null, deadline: "2026/12/31", status: "open", description: "", application_tips: "", source_url: "" },
  { id: "yoko1", name: "横浜市 地域防犯カメラ設置補助金", category: "防犯", ministry: "横浜市", pref_code: "14", prefecture: "神奈川県", max_amount: 280000, rate_min: 0.9, rate_max: 0.9, target_industries: ["自治会・町会"], max_employees: null, deadline: "毎年7月末", status: "open", description: "", application_tips: "", source_url: "" },
] : [];

/**
 * 差し戻し#3 (2026-09-15): API失敗時のローカルフィルタ用フォールバック（ビルド時点の同梱スナップショット）。
 * 失敗時に「条件と無関係な直前の一覧」を残さないよう、同梱データに現在のフィルタ条件
 * （都道府県・カテゴリ・業種）を適用してから表示する。
 */
const BUNDLED_SUBSIDIES: Subsidy[] = (subsidiesJson as { subsidies: Subsidy[] }).subsidies ?? [];

function filterBundledLocally(prefecture: string, category: string, industry: string): Subsidy[] {
  // backend `/api/subsidies` のフィルタ条件（prefecture: 完全一致 or 全国／category: 完全一致）を
  // 同梱データに再現する。業種・カメラ関連・対応エリアの絞り込みは既存の filterCameraOnly に委譲。
  const scoped = BUNDLED_SUBSIDIES.filter((s) => {
    if (prefecture && s.prefecture !== prefecture && s.prefecture !== "全国") return false;
    if (category && s.category !== category) return false;
    return true;
  });
  return filterCameraOnly(scoped, industry || undefined);
}

function formatAmountDisplay(s: Subsidy): string {
  // 1台あたりの制度は「/台」・上限0は「都道府県・自治体ごとに異なる」（subsidyFormatters に集約）
  return formatSubsidyAmount(s);
}

const OUTER: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "80px 24px 120px",
};

function SubsidiesContent({
  initialSubsidies,
  initialIndustry,
  initialStale = false,
}: {
  initialSubsidies: Subsidy[];
  initialIndustry: string;
  initialStale?: boolean;
}) {
  const [subsidies, setSubsidies] = useState<Subsidy[]>(
    initialSubsidies.length > 0 ? initialSubsidies : CAMERA_SUBSIDIES,
  );
  const [stale, setStale] = useState(initialStale);
  const [prefecture, setPrefecture] = useState("");
  const [industry, setIndustry] = useState(initialIndustry);
  const [category, setCategory] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [govLevel, setGovLevel] = useState("");
  const [sort, setSort] = useState("deadline");
  // 読み込み中は「いまの条件」と「一覧が表している条件」の食い違いから導く（effect 内で同期 setState しない・2026-10-27 審査[13]）。
  // 初期一覧はサーバーが ?industry= だけを適用して作っているので、その条件を読み込み済みとして始める
  // （マウント直後の取り直しは裏で行い、サーバー描画済みの一覧を「読み込み中」に置き換えない）。
  const filterKey = `${prefecture}|${category}|${industry}`;
  const [loadedKey, setLoadedKey] = useState(`||${initialIndustry}`);
  const loading = filterKey !== loadedKey;

  useEffect(() => {
    let cancelled = false;
    const key = `${prefecture}|${category}|${industry}`;
    // 業種は表示名（例: 工場・製造業）をバックエンドの語彙（例: 製造業）へ変換して送る（2026-10-27 審査[1]）。
    // 表示名のまま送ると target_industries と一致せず0件が返り、サーバー描画の一覧が0件に置き換わっていた。
    fetchSubsidies({
      prefecture: prefecture || undefined,
      category: category || undefined,
      industry: industry ? toApiIndustry(industry) : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setSubsidies(filterCameraOnly(res.subsidies ?? [], industry || undefined));
        setStale(false);
        setLoadedKey(key);
      })
      .catch(() => {
        if (cancelled) return;
        // 差し戻し#3: API失敗時は「条件と無関係な直前の一覧」を残さない。
        // 同梱データに現在のフィルタ条件を適用した結果を表示し、StaleDataNotice で明示する。
        setSubsidies(filterBundledLocally(prefecture, category, industry));
        setStale(true);
        setLoadedKey(key);
      });
    // 差し戻し#4: フィルタを連続操作した際に古いレスポンスが後勝ちしないよう、
    // 前回の effect 実行の結果は cancelled フラグで無視する。
    return () => {
      cancelled = true;
    };
  }, [prefecture, category, industry]);

  const filtered = subsidies.filter((s) => {
    // 上限額が無い制度（国一律の上限なし）は金額の絞り込みに含めない（0円扱いで「〜50万円」に入らない）
    if (amountFilter && !hasAmountCap(s.max_amount)) return false;
    if (amountFilter === "50" && s.max_amount > 500000) return false;
    if (amountFilter === "100" && s.max_amount > 1000000) return false;
    if (amountFilter === "500" && s.max_amount > 5000000) return false;
    if (amountFilter === "500plus" && s.max_amount < 5000000) return false;
    if (govLevel === "national" && s.pref_code !== "00") return false;
    if (govLevel === "prefectural" && s.pref_code === "00") return false;
    if (deadlineFilter) {
      // 「締切N日以内」は締切を過ぎていない受付中の制度だけ（受付終了・公募予定・締切が読めない制度は含めない・審査[4]）
      if (s.status !== "open") return false;
      const days = getDaysUntil(s.deadline);
      if (days === null || days < 0 || days > parseInt(deadlineFilter)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "deadline") {
      // 受付中 → 公募予定 → 受付終了 に分けてから締切順（受付終了の制度が先頭に来ないように・審査[4]）
      const byStatus = compareByStatus(a, b);
      if (byStatus !== 0) return byStatus;
      return (getDaysUntil(a.deadline) ?? 999) - (getDaysUntil(b.deadline) ?? 999);
    }
    if (sort === "amount") return b.max_amount - a.max_amount;
    if (sort === "new") {
      const ua = a.updated_at ?? "";
      const ub = b.updated_at ?? "";
      if (ub !== ua) return ub > ua ? 1 : -1;
      return b.id.localeCompare(a.id);
    }
    return 0;
  });

  const activeFilterCount = [prefecture, industry, amountFilter, deadlineFilter, category, govLevel]
    .filter(Boolean).length;

  const handleReset = () => {
    setPrefecture(""); setCategory(""); setAmountFilter(""); setDeadlineFilter("");
    setGovLevel(""); setIndustry("");
  };

  const commonFilterProps = {
    subsidies,
    sort,
    prefecture,
    industry,
    category,
    govLevel,
    amountFilter,
    deadlineFilter,
    activeFilterCount,
    onSort: setSort,
    onPrefecture: setPrefecture,
    onIndustry: setIndustry,
    onCategory: setCategory,
    onGovLevel: setGovLevel,
    onAmountFilter: setAmountFilter,
    onDeadlineFilter: setDeadlineFilter,
    onReset: handleReset,
  };

  return (
    <div style={OUTER}>
      {/* ヘッダー帯（フル幅・CTAなし） */}
      <div style={{ marginBottom: 40 }}>
        <PublicSectionHeader
          overline="Subsidies"
          title="補助金一覧"
          sub="防犯カメラ導入に使える補助金を、業種・地域・金額でしぼり込めます。"
          as="h1"
          titleClass="hc-headline"
          align="left"
        />
      </div>

      {/* API不達フォールバック中の注記（黙って古いデータを出さない） */}
      {!loading && stale && <StaleDataNotice />}

      {/* 2カラムグリッド（≤900px はブロック） */}
      <div className="subsidies-grid">
        {/* 左: フィルターレール（デスクトップのみ・sticky） */}
        <SubsidiesFilterRail {...commonFilterProps} />

        {/* 右: 本体 */}
        <main style={{ minWidth: 0 }}>
          {/* モバイルバー（≤900px 時に表示） */}
          <SubsidiesToolbar {...commonFilterProps} />

          {/* カードグリッド（件数+ソート行 + auto-fill カード） */}
          <SubsidiesCardGrid
            sorted={sorted}
            loading={loading}
            sort={sort}
            formatAmountDisplay={formatAmountDisplay}
            onSort={setSort}
          />

          {/* フットノート（景表法注記維持） */}
          <div style={{ marginTop: 48 }}>
            <SubsidiesFooterNote />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SubsidiesBrowser({
  initialSubsidies,
  initialIndustry = "",
  initialStale = false,
}: {
  initialSubsidies: Subsidy[];
  initialIndustry?: string;
  initialStale?: boolean;
}) {
  return (
    <SubsidiesContent
      initialSubsidies={initialSubsidies}
      initialIndustry={initialIndustry}
      initialStale={initialStale}
    />
  );
}
