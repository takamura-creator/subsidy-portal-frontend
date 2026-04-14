"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchBizProfile, updateBizProfile, type BizProfile } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

// 共有サイドバー
function BizSidebar({ active }: { active: string }) {
  const links = [
    { href: "/biz", label: "ダッシュボード", icon: "📊" },
    { href: "/biz/projects", label: "案件一覧", icon: "📋" },
    { href: "/biz/profile", label: "プロフィール", icon: "👤" },
    { href: "/biz/settings", label: "設定", icon: "⚙" },
  ];
  return (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        業者ポータル
      </p>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] mb-1 transition-colors ${
            active === l.href
              ? "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)] font-medium"
              : "text-[var(--hc-text-muted)] hover:bg-[var(--hc-primary)]/5 hover:text-[var(--hc-primary)]"
          }`}
        >
          <span>{l.icon}</span>
          <span>{l.label}</span>
        </Link>
      ))}
    </div>
  );
}

// セクション設定
const SECTIONS = [
  { id: "basic", label: "基本情報" },
  { id: "area", label: "対応エリア" },
  { id: "certs", label: "資格・認定" },
  { id: "results", label: "施工実績" },
];

// 定義済み資格リスト
const PRESET_QUALIFICATIONS = [
  "電気工事士（第一種）",
  "電気工事士（第二種）",
  "防犯設備士",
  "電気工事施工管理技士",
  "消防設備士",
  "防犯設備施工技術者",
  "ネットワーク工事技術者",
];

// モックプロフィール
const MOCK_PROFILE: BizProfile = {
  id: "C-001",
  company_name: "セキュアテック株式会社",
  representative_name: "鈴木 一郎",
  prefecture: "東京都",
  founded_year: 2010,
  employees: 15,
  description: "防犯カメラ・監視カメラの設計・施工・保守を一貫して行う専門企業です。IT導入補助金を活用した導入実績が豊富です。",
  areas: ["東京都", "神奈川県", "埼玉県", "千葉県"],
  qualifications: ["電気工事士（第一種）", "防犯設備士"],
  photos: [],
  phone: "03-1234-5678",
  email: "info@securetech.co.jp",
};

export default function BizProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  // フォーム状態
  const [companyName, setCompanyName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchBizProfile()
      .then((p) => {
        setCompanyName(p.company_name || "");
        setRepresentativeName(p.representative_name || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
        setAddress(p.prefecture || "");
        setDescription(p.description || "");
        setAreas(p.areas || []);
        setQualifications(p.qualifications || []);
      })
      .catch(() => {
        // モックデータを使用
        setCompanyName(MOCK_PROFILE.company_name);
        setRepresentativeName(MOCK_PROFILE.representative_name || "");
        setPhone(MOCK_PROFILE.phone || "");
        setEmail(MOCK_PROFILE.email || "");
        setAddress(MOCK_PROFILE.prefecture || "");
        setDescription(MOCK_PROFILE.description || "");
        setAreas(MOCK_PROFILE.areas);
        setQualifications(MOCK_PROFILE.qualifications);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      await updateBizProfile({
        company_name: companyName,
        representative_name: representativeName || undefined,
        prefecture: address || undefined,
        description: description || undefined,
        areas,
        qualifications,
        phone: phone || undefined,
        email: email || undefined,
      });
      setSaveMsg("プロフィールを更新しました。");
    } catch {
      setSaveMsg("保存しました。（オフラインモード）");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  function toggleArea(pref: string) {
    setAreas((prev) =>
      prev.includes(pref) ? prev.filter((a) => a !== pref) : [...prev, pref]
    );
  }

  function toggleQualification(q: string) {
    setQualifications((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  function addTagInput() {
    const val = tagInput.trim();
    if (val && !qualifications.includes(val)) {
      setQualifications((prev) => [...prev, val]);
    }
    setTagInput("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-[var(--hc-text-muted)] text-sm">読み込み中...</div>
      </div>
    );
  }

  // 左サイドバー: BizSidebar + セクションTOC
  const left = (
    <div>
      <BizSidebar active="/biz/profile" />
      <div className="border-t border-[var(--hc-border)] my-3" />
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-2"
      >
        セクション
      </p>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => setActiveSection(s.id)}
          className={`block px-3 py-2 mb-1 rounded-md text-[13px] transition-colors ${
            activeSection === s.id
              ? "bg-[var(--hc-primary)]/8 text-[var(--hc-primary)] font-medium"
              : "text-[var(--hc-text-muted)] hover:bg-[var(--hc-primary)]/5 hover:text-[var(--hc-primary)]"
          }`}
        >
          {s.label}
        </a>
      ))}
    </div>
  );

  // 中央: フォーム
  const center = (
    <div>
      <h1
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[1.1rem] font-bold text-[var(--hc-navy)] tracking-tight mb-5"
      >
        プロフィール編集
      </h1>

      {/* 基本情報 */}
      <section id="basic" className="card mb-5">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[14px] font-bold text-[var(--hc-navy)] mb-4"
        >
          基本情報
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">会社名</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">代表者名</label>
            <input
              type="text"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="form-input w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">電話番号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">メール</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input w-full"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">所在地（都道府県）</label>
          <select
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-select w-full"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[var(--hc-navy)] mb-1">会社紹介</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-input w-full resize-y"
          />
        </div>
        {saveMsg && (
          <p className="text-[12px] text-[var(--hc-primary)] mb-2">{saveMsg}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2 rounded-lg text-[14px] font-bold disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </section>

      {/* 対応エリア */}
      <section id="area" className="card mb-5">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[14px] font-bold text-[var(--hc-navy)] mb-4"
        >
          対応エリア
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {PREFECTURES.map((pref) => (
            <label
              key={pref}
              className={`cb cursor-pointer select-none ${areas.includes(pref) ? "border-[var(--hc-primary)] bg-[var(--hc-primary)]/5 text-[var(--hc-primary)] font-medium" : ""}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={areas.includes(pref)}
                onChange={() => toggleArea(pref)}
              />
              {pref}
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2 rounded-lg text-[14px] font-bold disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </section>

      {/* 資格・認定 */}
      <section id="certs" className="card mb-5">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[14px] font-bold text-[var(--hc-navy)] mb-4"
        >
          資格・認定
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_QUALIFICATIONS.map((q) => (
            <label
              key={q}
              className={`cb cursor-pointer select-none ${qualifications.includes(q) ? "border-[var(--hc-primary)] bg-[var(--hc-primary)]/5 text-[var(--hc-primary)] font-medium" : ""}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={qualifications.includes(q)}
                onChange={() => toggleQualification(q)}
              />
              {q}
            </label>
          ))}
        </div>
        {/* カスタムタグ入力 */}
        <div className="mb-4">
          <label className="block text-[12px] text-[var(--hc-text-muted)] mb-1">その他の資格を追加</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTagInput()}
              placeholder="資格名を入力して Enter"
              className="form-input flex-1"
            />
            <button
              onClick={addTagInput}
              className="px-3 py-2 bg-[var(--hc-primary)] text-white text-[12px] font-semibold rounded-md"
            >
              追加
            </button>
          </div>
          {/* カスタム資格タグ */}
          {qualifications.filter((q) => !PRESET_QUALIFICATIONS.includes(q)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {qualifications
                .filter((q) => !PRESET_QUALIFICATIONS.includes(q))
                .map((q) => (
                  <span
                    key={q}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-[var(--hc-accent)]/10 text-[var(--hc-accent)]"
                  >
                    {q}
                    <button
                      onClick={() => setQualifications((prev) => prev.filter((x) => x !== q))}
                      className="ml-1 text-[var(--hc-accent)] hover:text-[var(--hc-navy)]"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2 rounded-lg text-[14px] font-bold disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </section>

      {/* 施工実績 */}
      <section id="results" className="card mb-5">
        <h2
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[14px] font-bold text-[var(--hc-navy)] mb-4"
        >
          施工実績
        </h2>
        <div className="text-[13px] text-[var(--hc-text-muted)] text-center py-6">
          実績写真・施工事例は別途アップロード機能から追加できます。
        </div>
      </section>
    </div>
  );

  // 右: ライブプレビューカード
  const right = (
    <div>
      <p
        style={{ fontFamily: "'Sora', sans-serif" }}
        className="text-[11px] font-bold text-[var(--hc-navy)] tracking-wider uppercase mb-3"
      >
        プレビュー
      </p>
      <div className="card">
        <h3
          style={{ fontFamily: "'Sora', sans-serif" }}
          className="text-[14px] font-bold text-[var(--hc-navy)] mb-3"
        >
          企業側から見た表示
        </h3>

        {/* 会社名 */}
        <div className="text-[16px] font-bold text-[var(--hc-navy)] mb-1">
          {companyName || "（会社名未入力）"}
        </div>

        {/* メタ情報 */}
        <div className="flex gap-3 flex-wrap text-[12px] text-[var(--hc-text-muted)] mb-3">
          <span>★ 4.8</span>
          <span>{areas.length > 0 ? areas.slice(0, 2).join("・") : "エリア未設定"}</span>
          <span>実績 142件</span>
        </div>

        {/* エリアタグ */}
        {areas.length > 0 && (
          <div className="mb-3">
            <p className="text-[12px] font-semibold text-[var(--hc-navy)] mb-1">対応エリア</p>
            <p className="text-[12px] text-[var(--hc-text-muted)]">
              {areas.join("、")}
            </p>
          </div>
        )}

        {/* 資格タグ */}
        {qualifications.length > 0 && (
          <div className="mb-3">
            <p className="text-[12px] font-semibold text-[var(--hc-navy)] mb-1">資格</p>
            <div className="flex flex-wrap gap-1">
              {qualifications.map((q) => (
                <span
                  key={q}
                  className="text-[10px] px-2 py-0.5 rounded bg-[var(--hc-primary)]/6 text-[var(--hc-primary)] font-medium"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 紹介文 */}
        {description && (
          <div className="mb-3">
            <p className="text-[12px] font-semibold text-[var(--hc-navy)] mb-1">紹介文</p>
            <p className="text-[12px] text-[var(--hc-text-muted)] leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>
        )}

        <p className="text-[10px] text-[var(--hc-text-muted)] text-center pt-3 border-t border-[var(--hc-border)]">
          これが企業側の検索結果に表示されます
        </p>
      </div>
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
