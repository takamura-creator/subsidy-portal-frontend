import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "HOJYO CAME（マルチック株式会社）の利用規約。本サービスのご利用条件・禁止事項・免責事項について定めています。",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "32px 16px 64px",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "var(--hc-text)",
        lineHeight: 1.8,
        fontSize: 14,
      }}
    >
      <h1
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--hc-navy)",
          letterSpacing: "-0.5px",
          margin: "0 0 8px",
        }}
      >
        利用規約
      </h1>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 24px" }}>
        最終改定日：2026年5月10日
      </p>

      <p>
        本利用規約（以下「本規約」といいます。）は、マルチック株式会社（以下「当社」といいます。）が運営する「HOJYO CAME」（以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーは、本規約に同意の上、本サービスを利用するものとします。
      </p>

      <Section title="第1条（適用）">
        本規約は、本サービスの利用に関する一切の関係に適用されます。本規約に同意できない場合は本サービスをご利用いただけません。
      </Section>

      <Section title="第2条（提供される情報の性質）">
        本サービスが提供する補助金情報・概算見積もり・参考書類は、すべて<strong>参考情報</strong>であり、補助金の採択・交付を保証するものではありません。実際の申請にあたっては、各補助金の所管機関の公式情報を必ずご確認ください。
      </Section>

      <Section title="第3条（アカウント登録）">
        <ul>
          <li>ユーザーは、正確な情報をもってアカウント登録を行うものとします。</li>
          <li>登録情報の管理責任はユーザーに帰属します。</li>
          <li>当社は、ユーザーが本規約に違反した場合、アカウントを停止または削除することができます。</li>
        </ul>
      </Section>

      <Section title="第4条（禁止事項）">
        ユーザーは以下の行為を行ってはなりません。
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>当社、他のユーザー、第三者の権利を侵害する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>不正アクセス・スクレイピング・自動化ツールによる過度なリクエスト</li>
          <li>虚偽の情報を登録する行為</li>
          <li>本サービスを商業的に再販する行為</li>
        </ul>
      </Section>

      <Section title="第5条（知的財産権）">
        本サービスに関する著作権、商標権その他の知的財産権は、当社または正当な権利者に帰属します。ユーザーは、当社の事前の書面による許諾なく、本サービスのコンテンツを複製・転載・改変することはできません。
      </Section>

      <Section title="第6条（免責事項）">
        <ul>
          <li>当社は、本サービスの内容について、正確性・完全性・有用性を保証するものではありません。</li>
          <li>掲載情報の最新性は各補助金の所管機関の公表内容により変動します。利用前に必ず公式情報をご確認ください。</li>
          <li>本サービスの利用に起因してユーザーに生じた損害について、当社は一切の責任を負いません（当社の故意または重大な過失による場合を除く）。</li>
          <li>補助金の申請結果、採択・不採択の判定は所管機関の判断によるものであり、当社は関知しません。</li>
        </ul>
      </Section>

      <Section title="第7条（サービスの変更・中断・終了）">
        当社は、ユーザーへの事前の通知なく、本サービスの内容を変更・追加・中断・終了することができます。
      </Section>

      <Section title="第8条（規約の変更）">
        当社は、必要と判断した場合、本規約を変更することがあります。変更後の規約は、本サービス上に掲載した時点で効力を生じます。
      </Section>

      <Section title="第9条（準拠法・管轄）">
        本規約は日本法に準拠します。本サービスに関連して当社とユーザーとの間に生じた紛争については、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
      </Section>

      <Section title="第10条（お問い合わせ）">
        本規約に関するお問い合わせは、以下までご連絡ください。
        <p style={{ marginTop: 12 }}>
          マルチック株式会社
          <br />
          メール：contact@multik.jp
          <br />
          お問い合わせフォーム：
          <a href="/contact" style={{ color: "var(--hc-primary)" }}>
            /contact
          </a>
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ margin: "24px 0" }}>
      <h2
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--hc-navy)",
          letterSpacing: "-0.3px",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
