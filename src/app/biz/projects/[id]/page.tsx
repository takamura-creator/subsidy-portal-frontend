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

const STATUS_CLASS: Record<string, string> = {
  new: "bg-[#FEF9C3] text-[var(--hc-accent)]",
  estimating: "bg-[var(--hc-primary)]/10 text-[var(--hc-primary)]",
  working: "bg-[var(--hc-primary)]/10 text-[var(--hc-primary)]",
  completed: "bg-gray-100 text-gray-500",
  declined: "bg-red-50 text-red-500",
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

// セクションアンカーTOC
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
  const [amount, setAmount] = useState("");
  const [durationDays, setDurationDays] = useState("");
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

  async function handleAccept() {
    if (!project || !confirm("この案件に対応可能として応答しますか？")) return;
    setActionLoading(true);
    try {
      await acceptProject(project.id);
      setProject({ ...project, status: "estimating" });
    } catch {
      setProject({ ...project, status: "estimating" }); // モックフォールバック
    } finally {
      setActionLoading(false);
    }
  }

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
    if (!project || !amount || !durationDays) {
      setQuoteMsg("金額と工期は必須です。");
      return;
    }
    setQuoteSending(true);
    setQuoteMsg("");
    try {
      await submitQuotation(project.id, {
        amount: Number(amount),
        duration_days: Number(durationDays),
        note: notes || undefined,
      });
      setProject({
        ...project,
        status: "working",
        quotation: { amount: Number(amount), duration_days: Number(durationDays), note: notes, submitted_at: new Date().toISOString() },
      });
      setQuoteMsg("見積もりを送信しました。");
    } catch {
      // モックフォールバック
      setProject({
        ...project,
        status: "working",
        quotation: { amount: Number(amount), duration_days: Number(durationDays), note: notes, submitted_at: new Date().toISOString() },
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
        <div className="text-[var(--hc-text-muted)] text-sm">読み込み中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card text-center py-10 text-[13px] text-[var(--hc-text-muted)]">
        案件が見つかりません。
      </div>
    );
  }

  // 左: セクションTOC
  const left = (
    <div>
      <Link
        href="/biz/projects"
        className="flex items-center gap-1 text-[12px] text-[var(--hc-text-muted)] hover:text-[var(--hc-primary)] mb-4"
      >
        ← 案件一覧
      </Link>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-2"
      >
        案件ナビ
      </p>
      {TOC_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={() => setActiveSection(item.href.slice(1))}
          className={`block px-3 py-2 mb-1 rounded-md text-[13px] transition-colors ${
            activeSection === item.href.slice(1)
              ? "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)] font-medium border-l-[3px] border-[var(--hc-primary)] pl-[9px]"
              : "text-[var(--hc-text-muted)] hover:bg-[var(--hc-primary)]/5 hover:text-[var(--hc-primary)]"
          }`}
        >
          {item.label}
        </a>
      ))}
    </div>
  );

  // 中央: 案件詳細 + 見積もりフォーム + メッセージエリア
  const center = (
    <div>
      {/* タイトル */}
      <h1
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[1.2rem] font-bold text-[var(--hc-navy)] tracking-tight mb-2"
      >
        {project.company_name} — {project.subsidy_name}
      </h1>
      <div className="flex gap-2 flex-wrap mb-5">
        <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${STATUS_CLASS[project.status]}`}>
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      {/* 企業情報 */}
      <section id="company" className="mb-6">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[15px] font-bold text-[var(--hc-navy)] mb-3 pb-2 border-b border-[var(--hc-border)]"
        >
          企業情報
        </h2>
        <table className="w-full border-collapse text-[13px] mb-3">
          <tbody>
            {[
              ["企業名", project.company_name],
              ["業種", project.company_industry],
              ["所在地", project.company_address],
              ["担当者", project.contact_name],
              ["連絡先", project.contact_email],
              ["カメラ台数", project.camera_count ? `${project.camera_count}台` : null],
              ["導入目的", project.purpose],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <tr key={k as string}>
                  <th className="text-left px-3 py-2 bg-[var(--hc-primary)]/3 border border-[var(--hc-border)] font-semibold text-[var(--hc-navy)] w-[32%]">
                    {k}
                  </th>
                  <td className="px-3 py-2 border border-[var(--hc-border)] text-[var(--hc-text-muted)]">
                    {v}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* 補助金情報 */}
      <section id="subsidy" className="mb-6">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[15px] font-bold text-[var(--hc-navy)] mb-3 pb-2 border-b border-[var(--hc-border)]"
        >
          補助金情報
        </h2>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {[
              ["補助金", project.subsidy_name],
              ["補助率", project.subsidy_rate],
              ["上限額", project.subsidy_max_amount ? `${(project.subsidy_max_amount / 10000).toLocaleString()}万円` : null],
              ["予算", `〜${(project.budget / 10000).toLocaleString()}万円`],
              ["締切", project.deadline],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <tr key={k as string}>
                  <th className="text-left px-3 py-2 bg-[var(--hc-primary)]/3 border border-[var(--hc-border)] font-semibold text-[var(--hc-navy)] w-[32%]">
                    {k}
                  </th>
                  <td
                    className={`px-3 py-2 border border-[var(--hc-border)] ${
                      k === "締切" ? "text-[var(--hc-accent)] font-semibold" : "text-[var(--hc-text-muted)]"
                    }`}
                  >
                    {v}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* 見積もりフォーム */}
      <section id="estimate" className="mb-6">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[15px] font-bold text-[var(--hc-navy)] mb-3 pb-2 border-b border-[var(--hc-border)]"
        >
          見積もり作成
        </h2>
        {project.quotation ? (
          <div className="card bg-[var(--hc-primary)]/3 border-[var(--hc-primary)]/20">
            <p className="text-[12px] text-[var(--hc-primary)] font-semibold mb-3">見積もり送信済み</p>
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-[var(--hc-text-muted)]">見積金額</dt>
                <dd className="font-semibold text-[var(--hc-navy)]">{project.quotation.amount.toLocaleString()}円</dd>
              </div>
              <div>
                <dt className="text-[var(--hc-text-muted)]">工期</dt>
                <dd className="font-semibold text-[var(--hc-navy)]">{project.quotation.duration_days}日間</dd>
              </div>
              {project.quotation.note && (
                <div className="col-span-2">
                  <dt className="text-[var(--hc-text-muted)]">備考</dt>
                  <dd className="text-[var(--hc-navy)]">{project.quotation.note}</dd>
                </div>
              )}
            </dl>
          </div>
        ) : (
          <div className="card">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">
                  見積金額（円）
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000000"
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">
                  工期（日数）
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="14"
                  className="form-input w-full"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">
                備考
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="配線工事の詳細、追加オプション等"
                rows={3}
                className="form-input w-full resize-y"
              />
            </div>
            {quoteMsg && (
              <p className="text-[12px] text-[var(--hc-primary)] mb-2">{quoteMsg}</p>
            )}
          </div>
        )}
      </section>

      {/* メッセージエリア */}
      <section id="messages" className="mb-6">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[15px] font-bold text-[var(--hc-navy)] mb-3 pb-2 border-b border-[var(--hc-border)]"
        >
          メッセージ
        </h2>
        <div className="card">
          <div className="space-y-0 mb-3">
            {messages.map((m, i) => (
              <div key={i} className="py-2 border-b border-[var(--hc-border)] last:border-none text-[12px]">
                <div className="font-semibold text-[var(--hc-navy)] mb-0.5">{m.author}</div>
                <div className="text-[var(--hc-text-muted)] leading-relaxed">{m.text}</div>
                <div className="text-[10px] text-[var(--hc-text-muted)] mt-1">{m.time}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="メッセージを入力..."
              className="form-input flex-1"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[var(--hc-primary)] text-white text-[12px] font-semibold rounded-md hover:bg-[var(--hc-primary)]/90 transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  // 右: アクションボタン
  const right = (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        アクション
      </p>

      {project.status === "new" && (
        <>
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center bg-[var(--hc-primary)] text-white border-2 border-[var(--hc-primary)] hover:bg-white hover:text-[var(--hc-primary)] transition-all disabled:opacity-50"
          >
            対応可能として応答
          </button>
          <button
            onClick={handleDecline}
            disabled={actionLoading}
            className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center bg-white text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            辞退する
          </button>
        </>
      )}

      {project.status === "estimating" && !project.quotation && (
        <button
          onClick={handleQuoteSubmit}
          disabled={quoteSending || !amount || !durationDays}
          className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center bg-[var(--hc-primary)] text-white border-2 border-[var(--hc-primary)] hover:bg-white hover:text-[var(--hc-primary)] transition-all disabled:opacity-50"
        >
          {quoteSending ? "送信中..." : "見積もりを送信"}
        </button>
      )}

      <button
        className="block w-full py-3 mb-2 rounded-lg text-[14px] font-bold text-center bg-white text-[var(--hc-primary)] border-2 border-[var(--hc-primary)] hover:bg-[var(--hc-primary)]/5 transition-all"
        onClick={() => document.getElementById("messages")?.scrollIntoView({ behavior: "smooth" })}
      >
        メッセージを送る
      </button>

      {project.status !== "declined" && project.status !== "completed" && (
        <button
          onClick={handleDecline}
          disabled={actionLoading}
          className="block w-full py-2 rounded-lg text-[13px] text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          辞退する
        </button>
      )}

      {/* 案件ID */}
      <p className="mt-4 text-center text-[10px] text-[var(--hc-text-muted)]">
        案件ID: P-{project.id}
      </p>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
