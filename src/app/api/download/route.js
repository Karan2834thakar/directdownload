import { NextResponse } from "next/server";
import { getDlWrapper } from "@/lib/ytdlp";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const format = searchParams.get("format") || "video";

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const ytdlp = await getDlWrapper();

    // Use robust yt-dlp arguments to bypass YouTube/Reels anti-bot checks
    const flags = [
      targetUrl,
      "--dump-json",
      "--no-warnings",
      "--no-call-home",
      "--no-check-certificates",
      "--prefer-insecure",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    ];

    const rawInfo = await ytdlp.execPromise(flags);
    const metadata = JSON.parse(rawInfo);

    let downloadUrl = null;

    if (metadata.formats && metadata.formats.length > 0) {
      if (format === "audio") {
        const audioFormat = metadata.formats.reverse().find(f => f.acodec !== "none" && f.url);
        downloadUrl = audioFormat?.url;
      } else {
        const videoFormat = metadata.formats.reverse().find(f => f.vcodec !== "none" && f.url);
        downloadUrl = videoFormat?.url;
      }
    }

    if (!downloadUrl) {
      downloadUrl = metadata.url || metadata.formats?.[0]?.url;
    }

    if (!downloadUrl) {
      return NextResponse.json({ error: "Could not extract direct stream URL." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      title: metadata.title || "Downloaded_Media",
      downloadUrl: downloadUrl,
    });

  } catch (error) {
    console.error("yt-dlp execution error:", error);
    return NextResponse.json(
      { error: "Failed to process video link.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
