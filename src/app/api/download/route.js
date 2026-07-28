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
    
    // Extract metadata using yt-dlp binary
    const metadata = await ytdlp.getVideoInfo([
      targetUrl,
      "--no-warnings",
      "--no-call-home",
    ]);

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
      return NextResponse.json({ error: "Could not extract playable stream URL." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      title: metadata.title || "Downloaded_Media",
      downloadUrl: downloadUrl,
    });

  } catch (error) {
    console.error("yt-dlp execution error:", error);
    return NextResponse.json(
      { error: "Failed to process video link.", details: error.message },
      { status: 500 }
    );
  }
}
