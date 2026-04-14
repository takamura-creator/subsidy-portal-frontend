"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
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
  hasApply?: boolean;
}

const MOCK_RESULTS: ResultItem[] = [
  { id: "1", name: "IT導入補助金（セキュリティ対策推進枠）", maxAmount: "100万円", deadline: "4/30（あと14日）", ministry: "中小企業庁", percent: 92, scoreLevel: "high", isUrgent: true, hasApply: true },
  { id: "3", name: "小規模事業者持続化補助金", maxAmount: "50万円", deadline: "5/31", ministry: "商工会議所", percent: 85, scoreLevel: "high", hasApply: true },
  { id: "5", name: "東京都 防犯設備設置費助成事業", maxAmount: "10万円/台", deadline: "12/31", ministry: "東京都", percent: 72, scoreLevel: "mid", hasApply: true },
  { id: "2", name: "ものづくり補助金（省力化枠）", maxAmount: "1,250万円", deadline: "6/15", ministry: "中小企業庁", percent: 65, scoreLevel: "mid", hasApply: true },
  { id: "4", name: "省エネルギー投資促進支援事業費補助金", maxAmount: "500万円", deadline: "7/31", ministry: "経済産業省", percent: 45, scoreLevel: "low", hasApply: false },
];

const SCORE_STYLES: Record<string, React.CSSProperties> = {
  high: {
    background: "rgba(21,128,61,0.1)",
    color: "var(--hc-success)",
    border: "2px solid var(--hc-success)",
  },
  mid: {
    background: "rgba(202,138,4,0.08)",
    color: "var(--hc-accent)",
    border: "2px solid var(--hc-accent)",
  },
  low: {
    background: "rgba(0,0,0,0.04)",
    color: "var(--hc-text-muted)",
    border: "2px solid var(--hc-border)",
  },
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const industry = searchParams.get("industry") || "小売業";
  const employees = searchParams.get("employees") || "6〜20名";
  const prefecture = searchParams.get("prefecture") || "東京都";
  const purpose = searchParams.get("purpose") || "防犯・万引き対策";

  const conditions = [
    { label: "業種", value: industry },
    { label: "従業員数", value: employees },
    { label: "都道府県", value: prefecture },
    { label: "目的", value: purpose },
  ];

  /* ── Left column: Filters + Conditions ── */
  const left = (
    <div>
      <span className="section-title">絞り込み</span>

      {/* Match score filter */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--hc-text)",
            marginBottom: 4,
          }}
        >
          マッチスコア
        </label>
        <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
          <option>すべて</option>
          <option>80%以上</option>
          <option>60%以上</option>
        </select>
      </div>

      {/* Amount filter */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--hc-text)",
            marginBottom: 4,
          }}
        >
          補助上限額
        </label>
        <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
          <option>すべて</option>
          <option>〜50万円</option>
          <option>〜100万円</option>
          <option>500万円以上</option>
        </select>
      </div>

      {/* Deadline filter */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--hc-text)",
            marginBottom: 4,
          }}
        >
          締切
        </label>
        <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
          <option>すべて</option>
          <option>30日以内</option>
          <option>60日以内</option>
        </select>
      </div>

      <div className="divider" />

      <span className="section-title">診断条件</span>

      {/* Condition box */}
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
        }}
      >
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--hc-navy)",
            marginBottom: 8,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          入力内容
        </h3>
        {conditions.map(({ label, value }) => (
          <div
            key={label}
            style={{
              fontSize: 12,
              color: "var(--hc-text-muted)",
              padding: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{value}</span>
          </div>
        ))}
        <Link
          href="/match"
          style={{
            fontSize: 11,
            color: "var(--hc-primary)",
            textDecoration: "none",
            display: "block",
            marginTop: 8,
          }}
        >
          条件を変更する
        </Link>
      </div>
    </div>
  );

  /* ── Center column: Result cards ── */
  const center = (
    <div>
      {/* Results header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.3px",
            margin: 0,
          }}
        >
          診断結果
        </h1>
        <span style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>
          {MOCK_RESULTS.length}件がマッチしました
        </span>
      </div>

      {/* Result cards */}
      {MOCK_RESULTS.map((item) => (
        <div
          key={item.id}
          style={{
            background: "var(--hc-white)",
            border: "1px solid var(--hc-border)",
            borderRadius: 10,
            padding: 18,
            marginBottom: 10,
            display: "grid",
            gridTemplateColumns: "60px 1fr auto",
            gap: 14,
            alignItems: "center",
            transition: "all 0.15s",
            cursor: "pointer",
          }}
        >
          {/* Match score circle */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Sora', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              ...SCORE_STYLES[item.scoreLevel],
            }}
          >
            {item.percent}%
          </div>

          {/* Info */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--hc-navy)",
                marginBottom: 4,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--hc-text-muted)",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>最大 {item.maxAmount}</span>
              <span
                style={
                  item.isUrgent
                    ? { color: "var(--hc-accent)", fontWeight: 600 }
                    : undefined
                }
              >
                締切 {item.deadline}
              </span>
              <span>{item.ministry}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Link
              href={`/subsidies/${item.id}`}
              className="btn-primary"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                width: "auto",
                border: "1px solid var(--hc-primary)",
              }}
            >
              詳しく見る
            </Link>
            {item.hasApply && (
              <Link
                href="#"
                className="btn-secondary"
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  display: "block",
                }}
              >
                申請書作成
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Right column: Next steps + celebration ── */
  const right = (
    <div>
      <span className="section-title">次のステップ</span>

      <Link
        href="/my/applications/new"
        className="btn-primary"
        style={{
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        申請書を作成する
      </Link>
      <Link
        href="/contractors"
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-white)",
        }}
      >
        工事業者を探す
      </Link>
      <Link
        href="#"
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-white)",
        }}
      >
        結果を保存する
      </Link>
      <Link
        href="/match"
        className="btn-secondary"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          background: "var(--hc-white)",
        }}
      >
        診断をやり直す
      </Link>

      {/* Celebration box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 12,
          background: "rgba(21,128,61,0.04)",
          borderRadius: 6,
          border: "1px solid rgba(21,128,61,0.08)",
          marginTop: 12,
        }}
      >
        <Image
          src="/turtle_celebration.png"
          alt="お祝いマスコット"
          width={36}
          height={36}
          style={{ opacity: 0.6 }}
        />
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", lineHeight: 1.4, margin: 0 }}>
          {MOCK_RESULTS.length}件の補助金がマッチしました！「詳しく見る」で要件を確認しましょう。
        </p>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout
      gridCols="220px 1fr 240px"
      left={left}
      center={center}
      right={right}
    />
  );
}

export default function MatchResultsPage() {
  return (
    <Suspense
      fallback={
        <ThreeColumnLayout
          gridCols="220px 1fr 240px"
          left={
            <div style={{ color: "var(--hc-text-muted)", fontSize: 12 }}>
              読み込み中...
            </div>
          }
          center={
            <div style={{ color: "var(--hc-text-muted)", fontSize: 14 }}>
              診断結果を読み込み中...
            </div>
          }
          right={null}
          showRight={false}
        />
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
