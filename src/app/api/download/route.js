import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // 1. Check if TikTok / Shorts / Reels URL and route to appropriate lightweight API
    let downloadUrl = null;
    let title = "Downloaded_Media";

    // Call public extraction gateway
    const res = await fetch(`https://api.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
    const data = await res.json();

    if (data && data.data) {
      downloadUrl = data.data.play || data.data.wmplay || data.data.music;
      title = data.data.title || "Media_File";
    }

    // Fallback: Direct metadata stream extraction fallback
    if (!downloadUrl) {
      const fallbackRes = await fetch(`https://api.vimeo.com/oembed.json?url=${encodeURIComponent(targetUrl)}`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        title = fallbackData.title || title;
      }
    }

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Could not extract stream. Please try a public YouTube Shorts, Reel, or TikTok link." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: downloadUrl,
      title: title,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process media request." },
      { status: 500 }
    );
  }
}
