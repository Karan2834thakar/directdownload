import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Backup open-access scraper endpoints that rotate proxies automatically
  const API_ENDPOINTS = [
    `https://api.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`,
    `https://downloader.freemedia.workers.dev/?url=${encodeURIComponent(targetUrl)}`,
  ];

  for (const endpoint of API_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        cache: "no-store",
      });

      if (!res.ok) continue;

      const data = await res.json();

      let downloadUrl = null;
      let title = "Downloaded_Media";

      // TikWM format response
      if (data && data.data) {
        downloadUrl = data.data.play || data.data.wmplay || data.data.music;
        title = data.data.title || title;
      }
      // Freemedia worker format response
      else if (data && data.url) {
        downloadUrl = data.url;
        title = data.title || title;
      }

      if (downloadUrl) {
        return NextResponse.json({
          success: true,
          title: title,
          downloadUrl: downloadUrl,
        });
      }
    } catch (err) {
      console.warn(`Endpoint failed: ${endpoint}`, err.message);
    }
  }

  return NextResponse.json(
    { error: "Could not extract stream URL. Please try again with a YouTube Short, Reel, or TikTok link." },
    { status: 500 }
  );
}
