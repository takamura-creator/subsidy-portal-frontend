import { test, expect } from "@playwright/test";
import { validateHeaderValue } from "node:http";
import { getImplicitTags } from "next/dist/server/lib/implicit-tags";
import { PREFECTURES } from "@/lib/constants";

/**
 * 都道府県LP `/lp/{県名}` が本番（Vercel）で 500 になる不具合の回帰テスト（2026-11-01）
 *
 * 症状: `TypeError: Invalid character in header content ["x-next-cache-tags"]`（ERR_INVALID_CHAR）
 * 原因: Next.js はページの soft tag（`_N_T_/lp/福岡県` のようなパス由来のキャッシュタグ。
 *       node_modules/next/dist/docs/01-app/02-guides/how-revalidation-works.md「Soft tags」）を
 *       Vercel 上（minimal mode）でレスポンスヘッダー `x-next-cache-tags` に入れる。
 *       16.2.2 は実行時にパスの日本語をエンコードせずにタグにしていたため、Node の
 *       ヘッダー検査で例外になっていた。16.3.1 以降は `encodeHeaderSafe` でエンコードする（16.4.3 へ更新して解消）。
 *
 * 1) Next.js が作る soft tag が、47都道府県すべてで HTTP ヘッダーとして書ける（サーバー不要・常に実行）
 * 2) minimal mode の本番ビルドで、LP 本体と画面内移動用の segment が 200 で、ヘッダーに不正な文字が無い
 *    （E2E_MINIMAL_BASE_URL を渡したときだけ実行。開発サーバーではこのヘッダーが出ないので確かめられない）
 *
 * 2) の実行（backend は届かない宛先にする。本番 backend・課金 API は呼ばない）:
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next build
 *   NEXT_PRIVATE_MINIMAL_MODE=1 NEXT_PUBLIC_API_URL=http://127.0.0.1:9 npx next start -p 3100
 *   E2E_MINIMAL_BASE_URL=http://localhost:3100 npx playwright test lp-cache-tags
 */

const TAGS_HEADER = "x-next-cache-tags";
/** Node（validateHeaderValue）と fetch（ByteString）の両方が通す範囲 */
const HEADER_SAFE = /^[\t\x20-\x7e]*$/;

test.describe("都道府県LPのキャッシュタグ（Next.js の soft tag）", () => {
  for (const name of PREFECTURES) {
    test(`/lp/${name} の soft tag をヘッダーに書ける`, async () => {
      const { tags } = await getImplicitTags("/lp/[prefecture]/page", `/lp/${name}`, null);
      const value = tags.join(",");
      expect(value, "日本語のままのタグが残っていないこと").toMatch(HEADER_SAFE);
      expect(() => validateHeaderValue(TAGS_HEADER, value)).not.toThrow();
      // パス由来のタグはエンコードした形で入る（revalidatePath と同じ表記）
      expect(tags).toContain(`_N_T_/lp/${encodeURIComponent(name)}`);
    });
  }
});

const MINIMAL_BASE_URL = process.env.E2E_MINIMAL_BASE_URL;

test.describe("minimal mode の本番ビルドで都道府県LPが 500 にならない", () => {
  test.skip(!MINIMAL_BASE_URL, "E2E_MINIMAL_BASE_URL（NEXT_PRIVATE_MINIMAL_MODE=1 の next start）が無いので実行しない");
  test.use({ baseURL: MINIMAL_BASE_URL });

  for (const name of PREFECTURES) {
    const path = `/lp/${encodeURIComponent(name)}`;

    test(`${path}（${name}）`, async ({ request }) => {
      const page = await request.get(path, { maxRedirects: 0 });
      expect(page.status()).toBe(200);
      const tags = page.headers()[TAGS_HEADER];
      // minimal mode で動いていればこのヘッダーが付く（付かない＝確かめたい経路を通っていない）
      expect(tags, `${TAGS_HEADER} が無い（minimal mode で起動しているか確認）`).toBeTruthy();
      expect(tags).toMatch(HEADER_SAFE);
      expect(tags!.split(",")).toContain(`_N_T_${path}`);

      // 画面内の移動・プリフェッチで使う segment（本番では `/lp/{県}.segments/_tree.segment.rsc` でも出ていた）
      const segment = await request.get(`${path}.segments/_tree.segment.rsc`, {
        headers: { rsc: "1", "next-router-segment-prefetch": "/_tree" },
        maxRedirects: 0,
      });
      expect(segment.status()).toBe(200);
      const segmentTags = segment.headers()[TAGS_HEADER];
      if (segmentTags !== undefined) expect(segmentTags).toMatch(HEADER_SAFE);
    });
  }
});
