/**
 * note⇄LP 相互リンク対応表
 *
 * 出典: 会議室/hojyocame刷新_2026-06-10/07_S1素材_相互リンクと信頼ブロック.md §1
 * url は全件 null（トニーがURL確定後に投入 → RelatedNoteLink が自動表示）。
 * url が null の項目は一切レンダリングしない。
 */

export type NoteArticleLink = {
  /** site側ページパス（前方一致で照合） */
  sitePath: string;
  /** note記事ID（内部管理用） */
  noteArticleId: string;
  /** リンク文言 */
  label: string;
  /** note実URL。null = 未確定（非表示） */
  url: string | null;
};

export const NOTE_ARTICLE_LINKS: NoteArticleLink[] = [
  {
    sitePath: "/lp/東京都",
    noteArticleId: "tokyo-23ku-camera-subsidy",
    label: "この数字の根拠：noteで23区の制度を公式資料と答え合わせした記事 →",
    url: null,
  },
  {
    sitePath: "/lp/東京都",
    noteArticleId: "2026-tokyo-business-camera-subsidy",
    label: "「会社のカメラは補助金が出る？」を東京都・区の公式資料で確かめた記事 →",
    url: null,
  },
  {
    sitePath: "/lp/神奈川県",
    noteArticleId: "draft-001-kanagawa",
    label: "神奈川の補助金を一枚の表に整理した記事（公式資料ベース）→",
    url: null,
  },
  {
    sitePath: "/lp/SERVICE_COMMON",
    noteArticleId: "2026-tokyo-camera-subsidy-schedule",
    label: "「いつ動けば間に合う？」申請の逆算カレンダーを公式資料で確認 →（公開後に有効化）",
    url: null,
  },
  {
    sitePath: "/match",
    noteArticleId: "dx-kekkyoku-naniкara",
    label: "「DX、結局なにから？」現場の人間が国の資料で答え合わせした出発点 →",
    url: null,
  },
  {
    sitePath: "/subsidies",
    noteArticleId: "2026-shoryokuka-camera-subsidy",
    label: "カメラは省力化補助金の対象に「なる」のか、公式要件で答え合わせ →",
    url: null,
  },
];
