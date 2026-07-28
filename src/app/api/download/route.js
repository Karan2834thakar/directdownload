import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const format = searchParams.get("format") || "video";

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Extract YouTube Video ID
  const videoIdMatch = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL format." }, { status: 400 });
  }

  // Public Invidious and Piped instance gateways
  const instances = [
    `https://inv.tux.pizza/api/v1/videos/${videoId}`,
    `https://invidious.nerdvpn.de/api/v1/videos/${videoId}`,
    `https://pipedapi.kavin.rocks/streams/${videoId}`,
  ];

  for (const endpoint of instances) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      let downloadUrl = null;
      let title = data.title || "YouTube_Video";

      // 1. Invidious format handling
      if (data.formatStreams || data.adaptiveFormats) {
        if (format === "audio") {
          const audio = (data.adaptiveFormats || []).reverse().find(f => f.type?.includes("audio"));
          downloadUrl = audio?.url;
        } else {
          const video = (data.formatStreams || []).reverse().find(f => f.url);
          downloadUrl = video?.url;
        }
      } 
      // 2. Piped format handling
      else if (data.videoStreams || data.audioStreams) {
        if (format === "audio") {
          const audio = (data.audioStreams || []).reverse().find(f => f.url);
          downloadUrl = audio?.url;
        } else {
          const video = (data.videoStreams || []).reverse().find(f => f.url);
          downloadUrl = video?.url;
        }
      }

      if (downloadUrl) {
        return NextResponse.json({
          success: true,
          title: title,
          downloadUrl: downloadUrl,
        });
      }

    } catch (err) {
      console.warn(`Gateway failed: ${endpoint}`, err.message);
    }
  }

  return NextResponse.json(
    { error: "Media extraction gateways are currently rate-limited. Please retry in a few seconds." },
    { status: 503 }
  );
}
