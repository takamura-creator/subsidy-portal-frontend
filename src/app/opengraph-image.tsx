import { ImageResponse } from "next/og";

export const alt = "補助金ポータル — 防犯カメラ導入の補助金をAIが無料診断";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "#FFFFFF",
            }}
          >
            🔍
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 500,
            }}
          >
            補助金ポータル
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: 500,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "12px",
          }}
        >
          防犯カメラ導入の補助金を
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: 500,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "40px",
          }}
        >
          AIが無料診断
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "20px",
              color: "#FFFFFF",
            }}
          >
            全47都道府県対応
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "20px",
              color: "#FFFFFF",
            }}
          >
            申請書自動生成
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "20px",
              color: "#FFFFFF",
            }}
          >
            完全無料
          </div>
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
