import YTDLPWrapper from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import os from "os";

const binaryPath = path.join(os.tmpdir(), "yt-dlp");

export async function getDlWrapper() {
  if (!fs.existsSync(binaryPath)) {
    console.log("Downloading latest yt-dlp binary...");
    await YTDLPWrapper.downloadFromGithub(binaryPath);
    fs.chmodSync(binaryPath, "755");
  }
  return new YTDLPWrapper(binaryPath);
}
