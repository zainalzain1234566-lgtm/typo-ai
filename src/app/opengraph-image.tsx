import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Typo AI — إنشاء كاروسيل عربي بالذكاء الاصطناعي";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #EEF0FF 0%, #FFFFFF 55%, #F3F0FF 100%)",
          color: "#1C1917",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px 96px",
          width: "100%",
        }}
      >
        <div
          dir="ltr"
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#5B4EE5",
              borderRadius: 30,
              boxShadow: "0 18px 45px rgba(91, 78, 229, 0.28)",
              color: "white",
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 76,
              fontWeight: 800,
              height: 132,
              justifyContent: "center",
              marginBottom: 34,
              width: 132,
            }}
          >
            T
          </div>
          <div
            style={{
              color: "#5B4EE5",
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            Typo AI
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.35,
              maxWidth: 960,
            }}
          >
            Arabic carousel design with AI
          </div>
        </div>
      </div>
    ),
    size
  );
}
