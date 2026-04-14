"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

interface ResultItem {
  id: string;
  name: string;
  maxAmount: string;
  deadline: string;
  ministry: string;
  percent: number;
  scoreLevel: "high" | "mid" | "low";
  isUrgent?: boolean;
}

const MOCK_RESULTS: ResultItem[] = [
  { id: "1", name: "IT導入補助金（セキュリティ対策推進枠）", maxAmount: "100万円", deadline: "4/30（あと14日）", ministry: "中小企業庁", percent: 92, scoreLevel: "high", isUrgent: true },
  { id: "3", name: "小規模事業者持続化補助金", maxAmount: "50万円", deadline: "5/31", ministry: "商工会議所", percent: 85, scoreLevel: "high" },
  { id: "5", name: "東京都 防犯設備設置費助成事業", maxAmount: "10万円/台", deadline: "12/31", ministry: "東京都", percent: 72, scoreLevel: "mid" },
  { id: "2", name: "ものづくり補助金（省力化枠）", maxAmount: "1,250万円", deadline: "6/15", ministry: "中小企業庁", percent: 65, scoreLevel: "mid" },
  { id: "4", name: "省エネルギー投資促進支援事業費補助金", maxAmount: "500万円", deadline: "7/31", ministry: "経済産業省", percent: 45, scoreLevel: "low" },
];

const SCORE_CONFIG = {
  high: { border: "var(--hc-primary)", bg: "rgba(21,128,61,0.1)", text: "var(--hc-primary)" },
  mid: { border: "var(--hc-accent)", bg: "rgba(202,138,4,0.08)", text: "var(--hc-accent)" },
  low: { border: "var(--hc-border)", bg: "rgba(0,0,0,0.04)", text: "var(--hc-text-muted)" },
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const industry = searchParams.get("industry") || "小売業";
  const employees = searchParams.get("employees") || "6〜20名";
  const prefecture = searchParams.get("prefecture") || "東京都";
  const purpose = searchParams.get("purpose") || "防犯・万引き対策";

  const left = (
    <div>
      <p
        className="text-xs font-bold uppercase mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        絞り込み
      </p>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>マッチスコア</label>
        <select className="form-select text-xs w-full">
          <option>すべて</option>
          <option>80%以上</option>
          <option>60%以上</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>補助上限額</label>
        <select className="form-select text-xs w-full">
          <option>すべて</option>
          <option>〜50万円</option>
          <option>〜100万円</option>
          <option>500万円以上</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>締切</label>
        <select className="form-select text-xs w-full">
          <option>すべて</option>
          <option>30日以内</option>
          <option>60日以内</option>
        </select>
      </div>

      <hr style={{ borderColor: "var(--hc-border)", margin: "14px 0" }} />

      <p
        className="text-xs font-bold uppercase mb-2"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        診断条件
      </p>
      <div className="rounded-lg border p-3" style={{ borderColor: "var(--hc-border)", background: "#fff" }}>
        <p className="text-xs font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)" }}>
          入力内容
        </p>
        {[
          ["業種", industry],
          ["従業員数", employees],
          ["都道府県", prefecture],
          ["目的", purpose],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-1 text-xs">
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span className="font-medium" style={{ color: "var(--hc-navy)" }}>{value}</span>
          </div>
        ))}
        <Link
          href="/match"
          className="block text-xs mt-2 hover:underline"
          style={{ color: "var(--hc-primary)" }}
        >
          条件を変更する
        </Link>
      </div>
    </div>
  );

  const center = (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1
          className="text-lg font-bold"
          style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
        >
          診断結果
        </h1>
        <span className="text-xs" style={{ color: "var(--hc-text-muted)" }}>
          {MOCK_RESULTS.length}件がマッチしました
        </span>
      </div>

      <div className="space-y-2.5">
        {MOCK_RESULTS.map((item) => {
          const scoreConfig = SCORE_CONFIG[item.scoreLevel];
          return (
            <div
              key={item.id}
              className="rounded-lg border p-4 transition-all cursor-pointer"
              style={{
                borderColor: "var(--hc-border)",
                background: "#fff",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Score circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: scoreConfig.bg,
                    border: `2px solid ${scoreConfig.border}`,
                  }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ fontFamily: "'Sora', sans-serif", color: scoreConfig.text }}
                  >
                    {item.percent}%
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1 leading-snug" style={{ color: "var(--hc-navy)" }}>
                    {item.name}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--hc-text-muted)" }}>
                    <span>最大 {item.maxAmount}</span>
                    <span style={{ color: item.isUrgent ? "var(--hc-accent)" : undefined, fontWeight: item.isUrgent ? 600 : undefined }}>
                      締切 {item.deadline}
                    </span>
                    <span>{item.ministry}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link
                    href={`/subsidies/${item.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded text-center text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--hc-primary)" }}
                  >
                    詳しく見る
                  </Link>
                  <Link
                    href={`/auth/login?redirect=/my/applications/new?subsidy_id=${item.id}`}
                    className="text-xs font-medium px-3 py-1.5 rounded border text-center transition-colors"
                    style={{ borderColor: "var(--hc-border)", color: "var(--hc-text-muted)" }}
                  >
                    申請書作成
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const right = (
    <div>
      <p
        className="text-xs font-bold uppercase mb-3"
        style={{ fontFamily: "'Sora', sans-serif", color: "var(--hc-navy)", letterSpacing: "-0.3px" }}
      >
        次のステップ
      </p>

      <Link
        href="/auth/login?redirect=/my/applications/new"
        className="block w-full text-center text-xs font-bold px-3 py-2.5 rounded mb-2 transition-opacity hover:opacity-90"
        style={{ background: "var(--hc-primary)", color: "#fff" }}
      >
        申請書を作成する
      </Link>
      <Link
        href="/contractors"
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        工事業者を探す
      </Link>
      <button
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        結果を保存する
      </button>
      <Link
        href="/match"
        className="block w-full text-left text-xs font-medium px-3 py-2.5 rounded border mb-2 transition-colors"
        style={{ borderColor: "var(--hc-border)", color: "var(--hc-navy)", background: "#fff" }}
      >
        診断をやり直す
      </Link>

      <div
        className="rounded-lg border p-3 mt-3"
        style={{ borderColor: "rgba(21,128,61,0.08)", background: "rgba(21,128,61,0.04)" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--hc-text-muted)" }}>
          {MOCK_RESULTS.length}件の補助金がマッチしました！「詳しく見る」で要件を確認しましょう。
        </p>
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}

export default function MatchResultsPage() {
  return (
    <Suspense fallback={
      <ThreeColumnLayout
        left={<div className="text-xs" style={{ color: "var(--hc-text-muted)" }}>読み込み中...</div>}
        center={<div className="text-sm" style={{ color: "var(--hc-text-muted)" }}>診断結果を読み込み中...</div>}
        right={null}
        showRight={false}
      />
    }>
      <ResultsContent />
    </Suspense>
  );
}
