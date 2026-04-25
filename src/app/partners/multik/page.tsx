import type { Metadata } from "next";
import Link from "next/link";
import { MULTIK_COMPANY, SERVICE_PREFECTURES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "施工パートナー マルチック株式会社 | HOJYO CAME",
  description:
    "HOJYO CAMEの施工実施主体、マルチック株式会社（AVTECH日本正規代理店）。東京・神奈川・静岡・埼玉・千葉・山梨の6都県で防犯カメラ設置工事に対応。",
  alternates: { canonical: "/partners/multik" },
  openGraph: {
    title: "施工パートナー マルチック株式会社 | HOJYO CAME",
    description:
      "AVTECH日本正規代理店のマルチック株式会社。6都県での防犯カメラ設置施工を担当。",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: MULTIK_COMPANY.name,
  alternateName: MULTIK_COMPANY.nameEn,
  url: MULTIK_COMPANY.website,
  email: MULTIK_COMPANY.email,
  description:
    "AVTECH Technology Corporation の日本正規代理店。防犯カメラの販売と施工を行う。",
  areaServed: SERVICE_PREFECTURES.map((p) => ({
    "@type": "State",
    name: p,
  })),
  address: {
    "@type": "PostalAddress",
    addressCountry: "JP",
    addressRegion: "東京都",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "防犯カメラ設置工事",
  provider: {
    "@type": "Organization",
    name: MULTIK_COMPANY.name,
    url: MULTIK_COMPANY.website,
  },
  areaServed: SERVICE_PREFECTURES.map((p) => ({ "@type": "State", name: p })),
  description:
    "AVTECH製品（カメラ・NVR・XVR）の販売、配線・取付・初期設定を含む現場施工、アフター保守までワンストップで提供する。",
};

export default function PartnersMultikPage() {
  return (
    <main className="bg-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[12px] font-medium tracking-widest text-white/60 mb-3">
            SERVICE PARTNER
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
          >
            施工実施主体：マルチック株式会社
          </h1>
          <p className="text-white/80 text-[15px] leading-relaxed max-w-[720px]">
            HOJYO CAMEで見積もり・施工をご依頼いただいた場合は、
            {MULTIK_COMPANY.name}（{MULTIK_COMPANY.relationship}）が工事を担当します。
            対応エリアは東京・神奈川・静岡・埼玉・千葉・山梨の6都県です。
          </p>
        </div>
      </section>

      {/* 会社概要 */}
      <section className="py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2
            className="text-xl font-bold text-navy mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            会社概要
          </h2>
          <div className="bg-white border border-border rounded-[10px] overflow-hidden">
            <dl className="divide-y divide-border">
              <CompanyRow label="社名" value={MULTIK_COMPANY.name} />
              <CompanyRow label="英文社名" value={MULTIK_COMPANY.nameEn} />
              <CompanyRow
                label="事業内容"
                value="防犯カメラ（AVTECH製品）の販売および設置工事"
              />
              <CompanyRow
                label="メーカー代理店契約"
                value={`${MULTIK_COMPANY.manufacturer} ／ ${MULTIK_COMPANY.relationship}`}
              />
              <CompanyRow
                label="対応エリア"
                value="東京都 / 神奈川県 / 静岡県 / 埼玉県 / 千葉県 / 山梨県（6都県）"
              />
              <CompanyRow
                label="ウェブサイト"
                value={
                  <a
                    href={MULTIK_COMPANY.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {MULTIK_COMPANY.website}
                  </a>
                }
              />
              <CompanyRow
                label="連絡先"
                value={
                  <a
                    href={`mailto:${MULTIK_COMPANY.email}`}
                    className="text-primary hover:underline"
                  >
                    {MULTIK_COMPANY.email}
                  </a>
                }
              />
            </dl>
          </div>
        </div>
      </section>

      {/* 対応エリアマップ */}
      <section className="py-14 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2
            className="text-xl font-bold text-navy mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            対応エリア（施工）
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <AreaMap />
            <div>
              <p className="text-[14px] text-text-muted leading-relaxed mb-4">
                施工はマルチックが直接担当します。6都県のいずれかに拠点・物件を
                お持ちのお客様は、HOJYO CAMEのウィザードから見積もり〜施工依頼まで
                お進みいただけます。
              </p>
              <ul className="space-y-2 text-[14px] text-text">
                {SERVICE_PREFECTURES.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block w-2 h-2 rounded-full bg-primary"
                    />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] text-text-muted leading-relaxed">
                東京本社・支社体制のお客様は、系列支社への導入もご相談ください。
                6都県以外の地域にある支社への導入可否は、個別に現場調査の上で判断します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 施工実績 */}
      <section className="py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2
            className="text-xl font-bold text-navy mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            施工実績
          </h2>
          <div className="bg-accent-light border border-border rounded-[10px] p-6">
            <p className="text-[14px] text-text leading-relaxed">
              当ポータル経由の施工実績は、案件確定後に顧客同意を得た上で
              <Link href="/cases" className="text-primary hover:underline mx-1">
                導入事例ページ
              </Link>
              に掲載予定です。件数・業種・導入台数・工期を事実列挙で記録します。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-border">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2
            className="text-xl font-bold text-navy mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            補助金と見積もりを一度に進めたい方へ
          </h2>
          <p className="text-[14px] text-text-muted mb-6 leading-relaxed">
            HOJYO CAMEのウィザードで、会社情報の入力から補助金選定・製品構成・
            見積書PDF出力までを一連で進められます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/match"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] border-2 border-primary bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
            >
              補助金を診断する
            </Link>
            <Link
              href="/my/wizard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[8px] border-2 border-primary bg-white text-primary font-semibold hover:bg-[var(--hc-primary-subtle)] transition"
            >
              見積もりウィザードへ進む
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-text-muted">
            お問い合わせは{" "}
            <a href={`mailto:${MULTIK_COMPANY.email}`} className="text-primary hover:underline">
              {MULTIK_COMPANY.email}
            </a>{" "}
            まで。メール対応のみ（電話営業は行いません）。
          </p>
        </div>
      </section>
    </main>
  );
}

function CompanyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 px-5 py-4 text-[14px]">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}

function AreaMap() {
  const dots: Record<string, { x: number; y: number; label: string }> = {
    "山梨県": { x: 230, y: 240, label: "山梨" },
    "埼玉県": { x: 300, y: 190, label: "埼玉" },
    "東京都": { x: 305, y: 230, label: "東京" },
    "千葉県": { x: 350, y: 235, label: "千葉" },
    "神奈川県": { x: 295, y: 260, label: "神奈川" },
    "静岡県": { x: 260, y: 290, label: "静岡" },
  };
  return (
    <div
      className="relative bg-bg border border-border rounded-[10px] overflow-hidden"
      style={{ aspectRatio: "16 / 10" }}
    >
      <svg
        viewBox="0 0 480 330"
        className="w-full h-full"
        role="img"
        aria-label="対応エリア6都県（東京・神奈川・静岡・埼玉・千葉・山梨）"
      >
        {/* 日本列島のシンプルな形状（関東〜中部） */}
        <path
          d="M110 240 Q140 190 190 180 Q230 160 280 165 Q335 155 380 170 Q420 190 430 220 Q425 260 400 285 Q360 305 320 300 Q280 310 240 305 Q200 315 170 295 Q130 280 110 240Z"
          fill="var(--hc-primary-muted)"
          stroke="var(--hc-primary-border)"
          strokeWidth="1.5"
        />
        {/* 6都県のピン */}
        {Object.values(dots).map((d) => (
          <g key={d.label}>
            <circle cx={d.x} cy={d.y} r="6" fill="var(--hc-primary)" />
            <circle cx={d.x} cy={d.y} r="11" fill="var(--hc-primary-pin)" aria-hidden="true" />
            <text
              x={d.x}
              y={d.y - 14}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="var(--hc-navy)"
            >
              {d.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="absolute bottom-3 left-3 text-[11px] text-text-muted bg-white/80 px-2 py-1 rounded">
        ※ 位置関係の概念図です
      </p>
    </div>
  );
}
