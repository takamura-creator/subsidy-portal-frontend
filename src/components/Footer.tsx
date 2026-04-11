import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/60 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* ブランド */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-white text-lg font-medium mb-3">
              <span className="text-primary">補助金</span>ポータル
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              防犯カメラ導入に使える補助金をAIが最適マッチング。全47都道府県対応。
            </p>
            <div className="flex gap-3">
              {["X", "YouTube", "LINE"].map((sns) => (
                <span
                  key={sns}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 hover:bg-primary/30 hover:text-primary transition cursor-pointer"
                  title={sns}
                >
                  {sns[0]}
                </span>
              ))}
            </div>
          </div>

          {/* サービス */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">サービス</h4>
            <ul className="text-sm space-y-2">
              <li><Link href="/match" className="hover:text-white transition">補助金診断</Link></li>
              <li><Link href="/subsidies" className="hover:text-white transition">補助金一覧</Link></li>
              <li><Link href="/about" className="hover:text-white transition">運営者情報</Link></li>
            </ul>
          </div>

          {/* 地域別 */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">地域別</h4>
            <ul className="text-sm space-y-2">
              {["東京都", "大阪府", "神奈川県", "愛知県", "福岡県"].map((p) => (
                <li key={p}>
                  <Link href={`/lp/${p}`} className="hover:text-white transition">
                    {p}の補助金
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 運営会社 */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">運営会社</h4>
            <p className="text-sm leading-relaxed mb-3">
              マルチック株式会社
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://multik.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                multik.jp
              </a>
              <a
                href="mailto:contact@multik.jp"
                className="flex items-center gap-2 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@multik.jp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-sm text-center text-white/40">
          &copy; 2026 マルチック株式会社 All rights reserved.
        </div>
      </div>
    </footer>
  );
}
