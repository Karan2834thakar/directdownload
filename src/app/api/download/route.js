import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const format = searchParams.get("format") || "video";

  if (!targetUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Validate YouTube URL
    if (!ytdl.validateURL(targetUrl)) {
      return NextResponse.json({ error: "Invalid YouTube URL provided." }, { status: 400 });
    }

    // Get video info using ytdl-core
    const info = await ytdl.getInfo(targetUrl, {
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      },
    });

    let chosenFormat;
    if (format === "audio") {
      chosenFormat = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
    } else {
      // Pick highest quality format with both video and audio combined
      chosenFormat = ytdl.chooseFormat(info.formats, { filter: "audioandvideo", quality: "highestvideo" });
      
      // Fallback if combined stream is unavailable
      if (!chosenFormat) {
        chosenFormat = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
      }
    }

    if (!chosenFormat || !chosenFormat.url) {
      return NextResponse.json({ error: "Could not find a valid stream URL for this video." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      title: info.videoDetails.title || "YouTube_Video",
      downloadUrl: chosenFormat.url,
    });

  } catch (error) {
    console.error("YTDL Error:", error);
    return NextResponse.json(
      { error: "YouTube blocked the server request. Try again in a moment.", details: error.message },
      { status: 500 }
    );
  }
}
