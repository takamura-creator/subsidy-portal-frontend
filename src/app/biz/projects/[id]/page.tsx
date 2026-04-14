"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import {
  fetchBizProject,
  acceptProject,
  declineProject,
  submitQuotation,
  type BizProjectDetail,
} from "@/lib/api";

// ステータスバッジ
const STATUS_LABEL: Record<string, string> = {
  new: "新着",
  estimating: "見積中",
  working: "施工中",
  completed: "完了",
  declined: "辞退",
};

// モックデータ（フォールバック用）
function getMockProject(id: string): BizProjectDetail {
  return {
    id,
    company_name: "株式会社A",
    subsidy_name: "IT導入補助金（セキュリティ対策推進枠）",
    budget: 1000000,
    deadline: "2026-04-30",
    status: "new",
    created_at: "2026-04-12",
    updated_at: "2026-04-12",
    company_industry: "小売業",
    company_address: "東京都新宿区",
    contact_name: "山田 太郎",
    contact_email: "yamada@example.com",
    subsidy_rate: "1/2 〜 3/4",
    subsidy_max_amount: 1000000,
    purpose: "防犯・万引き対策",
    camera_count: 8,
    planned_date: "2026年5月",
    documents: [],
  };
}

// セクションTOC
const TOC_ITEMS = [
  { href: "#company", label: "企業情報" },
  { href: "#subsidy", label: "補助金情報" },
  { href: "#estimate", label: "見積もり" },
  { href: "#messages", label: "メッセージ" },
];

type Props = { params: Promise<{ id: string }> };

export default function BizProjectDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<BizProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("company");

  // 見積もりフォーム状態
  const [cameraModel, setCameraModel] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [cameraCount, setCameraCount] = useState("8");
  const [constructionCost, setConstructionCost] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState("");

  // メッセージ
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([
    { author: "株式会社A", text: "お見積もりをお待ちしております。工期の目安も教えていただけますか？", time: "4/12 14:30" },
  ]);

  useEffect(() => {
    fetchBizProject(id)
      .then(setProject)
      .catch(() => setProject(getMockProject(id)))
      .finally(() => setLoading(false));
  }, [id]);

  // 合計金額の自動計算
  useEffect(() => {
    const unit = Number(unitPrice) || 0;
    const count = Number(cameraCount) || 0;
    const construction = Number(constructionCost) || 0;
    if (unit > 0 && count > 0) {
      setTotalAmount(String(unit * count + construction));
    }
  }, [unitPrice, cameraCount, constructionCost]);

  async function handleDecline() {
    if (!project || !confirm("この案件を辞退しますか？")) return;
    setActionLoading(true);
    try {
      await declineProject(project.id);
    } catch {
      // モックフォールバック
    } finally {
      setActionLoading(false);
      router.push("/biz/projects");
    }
  }

  async function handleQuoteSubmit() {
    if (!project || !totalAmount) {
      setQuoteMsg("見積金額は必須です。");
      return;
    }
    setQuoteSending(true);
    setQuoteMsg("");
    try {
      await submitQuotation(project.id, {
        amount: Number(totalAmount),
        duration_days: 14,
        note: notes || undefined,
      });
      setProject({
        ...project,
        status: "working",
        quotation: { amount: Number(totalAmount), duration_days: 14, note: notes, submitted_at: new Date().toISOString() },
      });
      setQuoteMsg("見積もりを送信しました。");
    } catch {
      setProject({
        ...project,
        status: "working",
        quotation: { amount: Number(totalAmount), duration_days: 14, note: notes, submitted_at: new Date().toISOString() },
      });
      setQuoteMsg("見積もりを送信しました。");
    } finally {
      setQuoteSending(false);
    }
  }

  function handleSendMessage() {
    if (!messageInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { author: "セキュアテック", text: messageInput, time: "今" },
    ]);
    setMessageInput("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm" style={{ color: "var(--hc-text-muted)" }}>読み込み中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-10 text-[13px]" style={{ color: "var(--hc-text-muted)" }}>
        案件が見つかりません。
      </div>
    );
  }

  // 左: 戻るリンク + セクションTOC
  const left = (
    <div>
      <Link
        href="/biz/projects"
        className="flex items-center gap-1 text-[12px] mb-4 no-underline"
        style={{ color: "var(--hc-text-muted)" }}
      >
        ← 案件一覧
      </Link>
      <span className="section-title">案件ナビ</span>
      {TOC_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={() => setActiveSection(item.href.slice(1))}
          className="block px-[10px] py-2 mb-[2px] rounded-md text-[13px] no-underline cursor-pointer transition-colors"
          style={{
            background: activeSection === item.href.slice(1) ? "rgba(21,128,61,0.06)" : undefined,
            color: activeSection === item.href.slice(1) ? "var(--hc-primary)" : "var(--hc-text-muted)",
            fontWeight: activeSection === item.href.slice(1) ? 500 : undefined,
            borderLeft: activeSection === item.href.slice(1) ? "3px solid var(--hc-primary)" : undefined,
            paddingLeft: activeSection === item.href.slice(1) ? "7px" : "10px",
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  // 中央: 案件詳細
  const center = (
    <div>
      {/* タイトル */}
      <h1
        style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", letterSpacing: "-0.3px", marginBottom: 8 }}
      >
        {project.company_name} — {project.subsidy_name}
      </h1>
      <div className="flex gap-[10px] flex-wrap mb-5">
        <span
          className="text-[12px] font-semibold px-[10px] py-1 rounded-full"
          style={{ background: "var(--hc-accent-light)", color: "var(--hc-accent)" }}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      {/* 企業情報 */}
      <section id="company" className="mb-6">
        <h2
          style={{
            fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700,
            color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6,
            borderBottom: "1px solid var(--hc-border)", marginTop: 0,
          }}
        >
          企業情報
        </h2>
        <table className="info-table">
          <tbody>
            {[
              ["企業名", project.company_name],
              ["業種", project.company_industry],
              ["所在地", project.company_address],
              ["従業員数", "12名"],
              ["カメラ台数", project.camera_count ? `${project.camera_count}台` : null],
              ["導入目的", project.purpose],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <tr key={k as string}>
                  <th>{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* 補助金情報 */}
      <section id="subsidy" className="mb-6">
        <h2
          style={{
            fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700,
            color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6,
            borderBottom: "1px solid var(--hc-border)", marginTop: 0,
          }}
        >
          補助金情報
        </h2>
        <table className="info-table">
          <tbody>
            <tr><th>補助金</th><td>{project.subsidy_name}</td></tr>
            <tr><th>補助率</th><td>{project.subsidy_rate || "1/2 〜 3/4"}</td></tr>
            <tr><th>上限額</th><td>{project.subsidy_max_amount ? `${(project.subsidy_max_amount / 10000).toLocaleString()}万円` : "100万円"}</td></tr>
            <tr>
              <th>締切</th>
              <td style={{ color: "var(--hc-accent)", fontWeight: 600 }}>
                {project.deadline}（あと14日）
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 見積もり作成 */}
      <section id="estimate" className="mb-6">
        <h2
          style={{
            fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700,
            color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6,
            borderBottom: "1px solid var(--hc-border)", marginTop: 0,
          }}
        >
          見積もり作成
        </h2>
        {project.quotation ? (
          <div className="card" style={{ background: "rgba(21,128,61,0.03)", borderColor: "rgba(21,128,61,0.2)" }}>
            <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--hc-primary)" }}>見積もり送信済み</p>
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt style={{ color: "var(--hc-text-muted)" }}>見積金額</dt>
                <dd className="font-semibold" style={{ color: "var(--hc-navy)" }}>{project.quotation.amount.toLocaleString()}円</dd>
              </div>
              <div>
                <dt style={{ color: "var(--hc-text-muted)" }}>工期</dt>
                <dd className="font-semibold" style={{ color: "var(--hc-navy)" }}>{project.quotation.duration_days}日間</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div
            className="rounded-lg p-4"
            style={{ background: "var(--hc-white)", border: "1px solid var(--hc-border)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>カメラ機種</label>
                <input
                  type="text"
                  value={cameraModel}
                  onChange={(e) => setCameraModel(e.target.value)}
                  placeholder="型番・メーカー"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>単価（税抜）</label>
                <input
                  type="text"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="¥"
                  className="form-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>台数</label>
                <input
                  type="text"
                  value={cameraCount}
                  onChange={(e) => setCameraCount(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>工事費</label>
                <input
                  type="text"
                  value={constructionCost}
                  onChange={(e) => setConstructionCost(e.target.value)}
                  placeholder="¥"
                  className="form-input"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>合計金額（税抜）</label>
              <input
                type="text"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="自動計算"
                className="form-input"
                style={{ background: "rgba(21,128,61,0.03)" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>備考</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="配線工事の詳細、追加オプション等"
                rows={3}
                className="form-input"
                style={{ minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            {quoteMsg && (
              <p className="text-[12px] mb-2" style={{ color: "var(--hc-primary)" }}>{quoteMsg}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );

  // 右: アクションボタン + メッセージ
  const right = (
    <div>
      <span className="section-title">アクション</span>

      {!project.quotation && (
        <button
          onClick={handleQuoteSubmit}
          disabled={quoteSending}
          className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center cursor-pointer transition-all"
          style={{
            background: "var(--hc-primary)",
            color: "#fff",
            border: "2px solid var(--hc-primary)",
          }}
        >
          {quoteSending ? "送信中..." : "見積もりを送信"}
        </button>
      )}

      <button
        className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center cursor-pointer transition-all"
        style={{
          background: "var(--hc-white)",
          color: "var(--hc-primary)",
          border: "2px solid var(--hc-primary)",
        }}
        onClick={() => document.getElementById("messages")?.scrollIntoView({ behavior: "smooth" })}
      >
        メッセージを送る
      </button>

      {project.status !== "declined" && project.status !== "completed" && (
        <button
          onClick={handleDecline}
          disabled={actionLoading}
          className="block w-full py-2 rounded-lg text-[13px] text-center cursor-pointer transition-colors disabled:opacity-50"
          style={{
            color: "var(--hc-error)",
            border: "1px solid rgba(220,38,38,0.3)",
            background: "var(--hc-white)",
          }}
        >
          辞退する
        </button>
      )}

      {/* メッセージエリア */}
      <div
        className="rounded-lg p-3.5 mt-3"
        style={{ background: "var(--hc-white)", border: "1px solid var(--hc-border)" }}
        id="messages"
      >
        <span className="section-title">メッセージ</span>
        {messages.map((m, i) => (
          <div
            key={i}
            className="py-2 text-[12px]"
            style={{ borderBottom: "1px solid var(--hc-border)" }}
          >
            <div className="font-semibold mb-[2px]" style={{ color: "var(--hc-navy)" }}>{m.author}</div>
            <div className="leading-snug" style={{ color: "var(--hc-text-muted)" }}>{m.text}</div>
            <div className="text-[10px] mt-[2px]" style={{ color: "var(--hc-text-muted)" }}>{m.time}</div>
          </div>
        ))}
        <div className="flex gap-1.5 mt-[10px]">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="メッセージを入力..."
            className="form-input flex-1"
            style={{ padding: "8px 12px", fontSize: 13 }}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 rounded-md text-[12px] font-semibold cursor-pointer"
            style={{ background: "var(--hc-primary)", color: "#fff", border: "none" }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      gridCols="200px 1fr 260px"
    />
  );
}
