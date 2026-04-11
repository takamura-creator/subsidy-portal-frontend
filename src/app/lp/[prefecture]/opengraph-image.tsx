import { ImageResponse } from "next/og";
import { LP_PREFECTURES } from "@/lib/constants";

export const alt = "補助金ポータル — 都道府県別の防犯カメラ補助金情報";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LP_PREFECTURES.map((p) => ({
    prefecture: encodeURIComponent(p),
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;
  const name = decodeURIComponent(prefecture);

  const notoSans = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500&display=swap"
  ).then((res) => res.text())
    .then((css) => {
      const url = css.match(/src: url\((.+?)\)/)?.[1];
      if (!url) throw new Error("Font URL not found");
      return fetch(url).then((res) => res.arrayBuffer());
    });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1E3A5F 0%, #0D9488 100%)",
          fontFamily: '"Noto Sans JP"',
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "999px",
            padding: "8px 28px",
            fontSize: "24px",
            color: "#FFFFFF",
            marginBottom: "28px",
          }}
        >
          {`📍 ${name}`}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "48px",
            fontWeight: 500,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "16px",
          }}
        >
          {`${name}の防犯カメラ補助金`}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: "40px",
          }}
        >
          最大75%の補助金で初期費用を大幅削減
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "18px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            AIマッチング対応
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "18px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            申請書自動生成
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "20px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          補助金ポータル
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: notoSans,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
