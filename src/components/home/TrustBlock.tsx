/**
 * TrustBlock — 「現場の本当の話・一次ソース主義」共有コンポーネント
 *
 * 設置位置:
 *   - トップ（FV直下）
 *   - InformationLP（CTAセクション直前）
 *
 * コピー出典: 会議室/hojyocame刷新_2026-06-10/07_S1素材_相互リンクと信頼ブロック.md §3
 * 遵守事項: 実績数値の捏造禁止・「非中国製」不使用・煽りなし・会社名は正式名
 */

const TRUST_ITEMS = [
  {
    icon: "📄",
    heading: "公式資料が出典",
    body: "制度・上限額・締切は一次ソースで確認",
  },
  {
    icon: "❓",
    heading: "要確認は要確認と書く",
    body: "曖昧なまま断定しない",
  },
  {
    icon: "📷",
    heading: "現場で売ってきた会社",
    body: "机上ではなく施工の現場を知る運営者",
  },
] as const;

export default function TrustBlock() {
  return (
    <section className="trust-block" aria-label="運営方針">
      <h2 className="trust-block-heading">
        現場の本当の話だけを、公式資料で答え合わせして書いています。
      </h2>
      <p className="trust-block-body">
        このサイトの数字や制度の説明は、国・自治体の公式資料を一次ソースとして確認したものだけを載せています。
        確認しきれていないことは「要確認」とはっきり書きます。
        私たちは現場で防犯カメラを売ってきた会社（マルチック株式会社／AVTECH日本正規代理店）が運営しています。
      </p>
      <ul className="trust-block-items">
        {TRUST_ITEMS.map((item) => (
          <li key={item.heading} className="trust-block-item">
            <span className="trust-block-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="trust-block-item-text">
              <strong className="trust-block-item-heading">{item.heading}</strong>
              <span className="trust-block-item-body">{item.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
