import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://liveproof.nyttolabs.com";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/check`, changeFrequency: "weekly", priority: 0.95 },
    {
      url: `${base}/freelance-scam-check`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${base}/request`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/s/demo`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/check/try/macbook-crypto`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
