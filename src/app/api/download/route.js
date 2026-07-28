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

    // Use mweb client and user-agent impersonation to bypass YouTube bot checks
    const flags = [
      targetUrl,
      "--no-warnings",
      "--no-call-home",
      "--extractor-args", "youtube:player_client=mweb,android",
      "--user-agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
    ];

    const metadata = await ytdlp.getVideoInfo(flags);

    let downloadUrl = null;

    if (metadata.formats && metadata.formats.length > 0) {
      if (format === "audio") {
        const audioFormat = metadata.formats.slice().reverse().find(f => f.acodec !== "none" && f.url);
        downloadUrl = audioFormat?.url;
      } else {
        const videoFormat = metadata.formats.slice().reverse().find(f => f.vcodec !== "none" && f.acodec !== "none" && f.url);
        downloadUrl = videoFormat?.url || metadata.formats.slice().reverse().find(f => f.url)?.url;
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
      { error: "Failed to process video link. Please try again or check URL.", details: error.message },
      { status: 500 }
    );
  }
}
