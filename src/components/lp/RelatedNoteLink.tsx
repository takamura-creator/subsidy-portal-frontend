/**
 * RelatedNoteLink — note根拠記事リンク（URL確定後に自動表示）
 *
 * url が null の項目は一切レンダリングしない。
 * トニーが NOTE_ARTICLE_LINKS の url を埋めた時点で自動表示される。
 */

import type { NoteArticleLink } from "@/data/note-article-links";

type Props = {
  /** 現在のページパス（例: "東京都" → "/lp/東京都" として照合） */
  prefecture: string;
  links: NoteArticleLink[];
};

export default function RelatedNoteLink({ prefecture, links }: Props) {
  const sitePath = `/lp/${prefecture}`;
  const matched = links.filter(
    (l) => l.url !== null && (l.sitePath === sitePath || l.sitePath === "/lp/SERVICE_COMMON")
  );

  if (matched.length === 0) return null;

  return (
    <section className="py-6 bg-white border-t border-border">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="text-sm font-bold text-navy mb-3 hc-heading-sora">
          根拠記事（公式資料との答え合わせ）
        </h2>
        <ul className="space-y-2">
          {matched.map((l) => (
            <li key={l.noteArticleId}>
              <a
                href={l.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-primary hover:underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
