import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Active public Cobalt instances that process YouTube, Shorts, Reels, and TikTok streams
  const COBALT_INSTANCES = [
    "https://cobalt-api.kwiatekmom.tokyo",
    "https://api.cobalt.tools",
    "https://cobalt.ar2.dev",
  ];

  for (const instance of COBALT_INSTANCES) {
    try {
      const response = await fetch(instance, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          url: targetUrl,
          videoQuality: "max",
        }),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === "tunnel" || data.status === "redirect") {
        return NextResponse.json({
          success: true,
          title: data.filename || "Downloaded_Media",
          downloadUrl: data.url,
        });
      } else if (data.status === "picker" && data.picker && data.picker.length > 0) {
        return NextResponse.json({
          success: true,
          title: "Downloaded_Media",
          downloadUrl: data.picker[0].url,
        });
      }
    } catch (err) {
      console.warn(`Cobalt instance failed: ${instance}`, err.message);
    }
  }

  return NextResponse.json(
    { error: "Could not resolve stream URL. Please verify the media link and try again." },
    { status: 500 }
  );
}
