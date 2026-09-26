import { ImageResponse } from "next/og";

type CardText = {
  title: string;
  accent: string;
  body: string;
  foot: string;
  code?: boolean;
};

export function renderCard(t: CardText, width = 1080, height = 1350) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background:
            "radial-gradient(circle at 30% 20%, #0e3a44 0%, #07161b 55%, #040c0f 100%)",
          color: "#e6f7fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 34, color: "#22d3ee", letterSpacing: 3, fontWeight: 700, marginBottom: 40 }}>
          LIVEPROOF
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: width > height ? 84 : 104, fontWeight: 700, lineHeight: 1.06, marginBottom: 44 }}>
          <span style={{ marginRight: 24 }}>{t.title}</span>
          <span style={{ color: "#22d3ee" }}>{t.accent}</span>
        </div>
        <div style={{ fontSize: width > height ? 36 : 46, lineHeight: 1.35, color: "#a9c7cd", marginBottom: 50 }}>
          {t.body}
        </div>
        {t.code ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: "3px solid rgba(34,211,238,0.35)",
              borderRadius: 28,
              padding: "30px 40px",
              fontSize: 38,
              lineHeight: 1.5,
              background: "#0b2229",
              marginBottom: 50,
            }}
          >
            <span>LIVE-7K2Q · 3 fingers</span>
            <span style={{ color: "#22d3ee" }}>maple orbit cotton river lamp seven</span>
          </div>
        ) : null}
        <div style={{ fontSize: 44, fontWeight: 700 }}>49 kr · liveproof.nyttolabs.com</div>
        <div style={{ marginTop: 14, fontSize: 30, color: "#7fa3aa" }}>{t.foot}</div>
      </div>
    ),
    { width, height }
  );
}

export const CARD_EN: CardText = {
  title: "Is this person",
  accent: "real?",
  body: "Send one link. They say 6 random words on camera and hold up fingers. 8 seconds.",
  foot: "No app. No account. No ID upload.",
  code: true,
};

export const CARD_SV: CardText = {
  title: "Köparen på Blocket känns",
  accent: "skum?",
  body: "Skicka en länk. De säger sex slumpade ord i kameran. 8 sekunder. Mycket svårare att fejka än en profilbild.",
  foot: "Ingen app. Inget konto. Ingen ID-uppladdning.",
};
