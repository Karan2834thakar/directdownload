import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Active Cobalt public instances
  const COBALT_ENDPOINTS = [
    "https://api.cobalt.tools/",
    "https://cobalt-api.kwiatekmom.tokyo/",
    "https://co.wuk.sh/api/json",
  ];

  for (const endpoint of COBALT_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "Origin": "https://cobalt.tools",
          "Referer": "https://cobalt.tools/",
        },
        body: JSON.stringify({
          url: targetUrl,
          videoQuality: "720",
          filenamePattern: "basic",
        }),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data = await response.json();

      let streamUrl = data.url || (data.picker && data.picker[0]?.url);

      if (streamUrl) {
        return NextResponse.json({
          success: true,
          title: data.filename || "Downloaded_Media",
          downloadUrl: streamUrl,
        });
      }
    } catch (err) {
      console.warn(`Cobalt endpoint ${endpoint} failed:`, err.message);
    }
  }

  // Rapid Fallback Engine for Shorts/Reels/TikTok
  try {
    const fallbackRes = await fetch(`https://api.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
    const fallbackData = await fallbackRes.json();
    if (fallbackData?.data?.play) {
      return NextResponse.json({
        success: true,
        title: fallbackData.data.title || "Downloaded_Media",
        downloadUrl: fallbackData.data.play,
      });
    }
  } catch (err) {
    console.warn("Fallback engine failed:", err.message);
  }

  return NextResponse.json(
    { error: "Could not resolve stream URL. Please verify the media link and try again." },
    { status: 500 }
  );
}
