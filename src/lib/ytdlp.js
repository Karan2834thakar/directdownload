import YTDLPWrapper from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import os from "os";
import { execSync } from "child_process";

const isWin = process.platform === "win32";
const binaryName = isWin ? "yt-dlp.exe" : "yt-dlp";

// Use OS temporary directory (/tmp on Vercel Linux, C:\Users\...\AppData\Local\Temp on Windows)
const binaryPath = path.join(os.tmpdir(), binaryName);

export async function getDlWrapper() {
  if (!fs.existsSync(binaryPath)) {
    try {
      await YTDLPWrapper.downloadFromGithub(binaryPath);
      if (!isWin) {
        execSync(`chmod +x "${binaryPath}"`);
      }
    } catch (err) {
      console.error("Failed to download or prepare yt-dlp binary:", err);
      throw err;
    }
  }
  return new YTDLPWrapper(binaryPath);
}
