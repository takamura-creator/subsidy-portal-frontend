import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "HOJYO CAME（マルチック株式会社）のプライバシーポリシー。個人情報の取扱い・利用目的・第三者提供・セキュリティ対策について定めています。",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
          fontWeight: 800,
          color: "var(--hc-navy)",
          letterSpacing: "-0.5px",
          margin: "0 0 8px",
        }}
      >
        プライバシーポリシー
      </h1>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 24px" }}>
        最終改定日：2026年5月10日
      </p>

      <p>
        マルチック株式会社（以下「当社」といいます。）は、当社が運営する「HOJYO CAME」（以下「本サービス」といいます。）におけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
      </p>

      <Section title="1. 取得する個人情報">
        当社は、本サービスの提供にあたり、以下の個人情報を取得することがあります。
        <ul>
          <li>氏名・代表者名・自治会長名等の名称</li>
          <li>会社名・自治会名・団体名</li>
          <li>メールアドレス・電話番号</li>
          <li>事業所所在地・設置予定場所</li>
          <li>業種・従業員数・年商等の事業情報</li>
          <li>ホームページURL（自動取得時）</li>
          <li>サービス利用履歴・アクセスログ</li>
          <li>クッキー（Cookie）等の技術情報</li>
        </ul>
      </Section>

      <Section title="2. 個人情報の利用目的">
        取得した個人情報は、以下の目的で利用します。
        <ul>
          <li>本サービスの提供・運営・改善</li>
          <li>補助金マッチング・概算見積もり・参考書類の生成</li>
          <li>ご質問・お問い合わせ対応、施工に関する商談</li>
          <li>締切リマインダー等の通知メール配信</li>
          <li>新サービス・キャンペーン等のご案内（事前同意のあるユーザーに限る）</li>
          <li>利用統計の作成、サービス品質の向上</li>
          <li>不正利用の防止、規約違反対応</li>
        </ul>
      </Section>

      <Section title="3. 第三者提供">
        当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
        <ul>
          <li>法令に基づく場合</li>
          <li>人の生命・身体・財産の保護のために必要であって、本人の同意を得ることが困難な場合</li>
          <li>裁判所・捜査機関等の公的機関からの正当な要請に応じる場合</li>
          <li>業務委託先に対し、利用目的の達成に必要な範囲で開示する場合（守秘義務契約締結のもと）</li>
        </ul>
      </Section>

      <Section title="4. 安全管理措置">
        当社は、個人情報の漏えい・滅失・毀損を防止するため、組織的・人的・物理的・技術的な安全管理措置を講じます。具体的には、アクセス権限の制限、暗号化通信（TLS）、定期的なセキュリティ監査の実施等を行います。
      </Section>

      <Section title="5. クッキー（Cookie）の使用">
        本サービスでは、ユーザー体験の向上、利用統計の取得を目的としてCookieを使用することがあります。ブラウザの設定によりCookieの送受信を拒否することができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
      </Section>

      <Section title="6. 個人情報の開示・訂正・削除等の請求">
        ユーザーは、当社に対し、保有する自己の個人情報について開示・訂正・追加・削除・利用停止・第三者提供の停止を請求することができます。請求は本ポリシー末尾のお問い合わせ窓口にて受け付けます。
      </Section>

      <Section title="7. 未成年者による利用">
        本サービスは事業者・団体向けに提供しており、未成年者による単独でのご利用は想定していません。未成年者がご利用になる場合は、保護者の同意を得てください。
      </Section>

      <Section title="8. 本ポリシーの変更">
        当社は、法令の変更・サービス内容の変更等に伴い、本ポリシーを改定することがあります。重要な変更がある場合は、本サービス上で告知します。
      </Section>

      <Section title="9. お問い合わせ窓口">
        本ポリシーに関するお問い合わせは、以下までご連絡ください。
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
