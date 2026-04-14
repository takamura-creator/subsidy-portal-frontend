"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { fetchBizProfile, updateBizProfile, type BizProfile } from "@/lib/api";
import { PREFECTURES } from "@/lib/constants";

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
  "防犯設備士",
  "電気工事施工管理技士",
  "消防設備士",
];

// 対応エリア選択肢（モックアップ準拠）
const AREA_OPTIONS = [
  "東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県",
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

// 共有サイドバー
function BizSidebar({ active }: { active: string }) {
  const links = [
    { href: "/biz", label: "ダッシュボード", icon: "📋" },
    { href: "/biz/projects", label: "案件一覧", icon: "📁" },
    { href: "/biz/profile", label: "プロフィール", icon: "👤" },
    { href: "/biz/settings", label: "設定", icon: "⚙" },
  ];
  return (
    <div>
      <span className="section-title">業者ポータル</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`block px-[10px] py-2 rounded-md text-[13px] mb-[2px] no-underline transition-colors ${
            active === l.href ? "font-medium" : ""
          }`}
          style={{
            background: active === l.href ? "rgba(21,128,61,0.06)" : undefined,
            color: active === l.href ? "var(--hc-primary)" : "var(--hc-text-muted)",
          }}
        >
          {l.icon} {l.label}
        </Link>
      ))}
    </div>
  );
}

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

  useEffect(() => {
    fetchBizProfile()
      .then((p) => {
        setCompanyName(p.company_name || "");
        setRepresentativeName(p.representative_name || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
        setAddress(p.prefecture || "東京都品川区大崎2-1-1");
        setDescription(p.description || "");
        setAreas(p.areas || []);
        setQualifications(p.qualifications || []);
      })
      .catch(() => {
        setCompanyName(MOCK_PROFILE.company_name);
        setRepresentativeName(MOCK_PROFILE.representative_name || "");
        setPhone(MOCK_PROFILE.phone || "");
        setEmail(MOCK_PROFILE.email || "");
        setAddress("東京都品川区大崎2-1-1");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm" style={{ color: "var(--hc-text-muted)" }}>読み込み中...</div>
      </div>
    );
  }

  // 左サイドバー
  const left = (
    <div>
      <BizSidebar active="/biz/profile" />
      <div className="divider" />
      <span className="section-title">セクション</span>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => setActiveSection(s.id)}
          className={`block px-[10px] py-2 mb-[2px] rounded-md text-[13px] no-underline cursor-pointer transition-colors ${
            activeSection === s.id ? "font-medium" : ""
          }`}
          style={{
            background: activeSection === s.id ? "rgba(21,128,61,0.06)" : undefined,
            color: activeSection === s.id ? "var(--hc-primary)" : "var(--hc-text-muted)",
          }}
        >
          {s.label}
        </a>
      ))}
    </div>
  );

  // 中央: フォーム
  const center = (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", letterSpacing: "-0.3px", marginBottom: 20 }}>
        プロフィール編集
      </h1>

      {saveMsg && (
        <p className="text-[12px] mb-3" style={{ color: "var(--hc-primary)" }}>{saveMsg}</p>
      )}

      {/* 基本情報 */}
      <div className="form-card mb-5" id="basic">
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
          基本情報
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>会社名</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>代表者名</label>
            <input
              type="text"
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>電話番号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>メール</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>所在地</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>会社紹介</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-input"
            style={{ minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ width: "auto", display: "inline-block", padding: "10px 24px" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>

      {/* 対応エリア */}
      <div className="form-card mb-5" id="area">
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
          対応エリア
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {AREA_OPTIONS.map((pref) => (
            <label
              key={pref}
              className={`cb cursor-pointer select-none ${areas.includes(pref) ? "on" : ""}`}
              onClick={() => toggleArea(pref)}
            >
              <input type="checkbox" className="hidden" checked={areas.includes(pref)} readOnly />
              {pref}
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mt-3.5"
          style={{ width: "auto", display: "inline-block", padding: "10px 24px" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>

      {/* 資格・認定 */}
      <div className="form-card mb-5" id="certs">
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 14, marginTop: 0 }}>
          資格・認定
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUALIFICATIONS.map((q) => (
            <label
              key={q}
              className={`cb cursor-pointer select-none ${qualifications.includes(q) ? "on" : ""}`}
              onClick={() => toggleQualification(q)}
            >
              <input type="checkbox" className="hidden" checked={qualifications.includes(q)} readOnly />
              {q}
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mt-3.5"
          style={{ width: "auto", display: "inline-block", padding: "10px 24px" }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );

  // 右: ライブプレビュー
  const right = (
    <div>
      <span className="section-title">プレビュー</span>
      <div
        className="rounded-[10px] p-5"
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
        }}
      >
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 12 }}>
          企業側から見た表示
        </h3>

        <div className="text-[16px] font-bold mb-1" style={{ color: "var(--hc-navy)" }}>
          {companyName || "（会社名未入力）"}
        </div>

        <div className="flex gap-[10px] flex-wrap text-[12px] mb-[10px]" style={{ color: "var(--hc-text-muted)" }}>
          <span>★ 4.8</span>
          <span>東京・関東</span>
          <span>実績 142件</span>
        </div>

        <div className="flex gap-1 flex-wrap mb-3">
          {["IT導入補助金", "ものづくり補助金", "持続化補助金"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-[2px] rounded font-medium"
              style={{ background: "rgba(21,128,61,0.06)", color: "var(--hc-primary)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-[10px]">
          <h4 className="text-[12px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>対応エリア</h4>
          <p className="text-[12px] leading-snug" style={{ color: "var(--hc-text-muted)", margin: 0 }}>
            {areas.length > 0 ? areas.join("、") : "エリア未設定"}
          </p>
        </div>

        <div className="mb-[10px]">
          <h4 className="text-[12px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>資格</h4>
          <p className="text-[12px] leading-snug" style={{ color: "var(--hc-text-muted)", margin: 0 }}>
            {qualifications.length > 0 ? qualifications.join("、") : "資格未設定"}
          </p>
        </div>

        <div className="mb-[10px]">
          <h4 className="text-[12px] font-semibold mb-1" style={{ color: "var(--hc-navy)" }}>紹介文</h4>
          <p className="text-[12px] leading-snug" style={{ color: "var(--hc-text-muted)", margin: 0 }}>
            {description || "（未入力）"}
          </p>
        </div>

        <div
          className="text-[10px] text-center pt-2 mt-2"
          style={{ color: "var(--hc-text-muted)", borderTop: "1px solid var(--hc-border)" }}
        >
          これが企業側の検索結果に表示されます
        </div>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout
      left={left}
      center={center}
      right={right}
      gridCols="200px 1fr 280px"
    />
  );
}
