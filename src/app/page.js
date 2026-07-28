"use client";

import { useState } from "react";
import { Download, Sparkles, Video, Music, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!url) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`);
      const data = await res.json();

      if (data.success && data.downloadUrl) {
        // Trigger browser download directly from source link
        const a = document.createElement("a");
        a.href = data.downloadUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = data.title || "media";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setError(data.error || "Failed to extract video link.");
      }
    } catch (err) {
      setError("Server error or timeout. Please check link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/30 to-purple-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2 font-black text-xl tracking-wider text-white">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span>STREAM<span className="text-blue-500">GRAB</span></span>
        </div>
        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fast & Safe
          </span>
        </div>
      </header>

      <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-blue-400 mb-6 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Supports YouTube Shorts, Reels & TikTok</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Download Any Video or Audio <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Instantly in Seconds
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-xl mb-10 leading-relaxed">
          Paste any video or Instagram reel link below to extract high-quality MP4 video or pristine MP3 audio directly to your device.
        </p>

        <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-800 shadow-2xl shadow-blue-950/40 hover:border-slate-700 transition-all">
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Paste Instagram Reel or YouTube URL..." 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="flex-1 bg-slate-950/80 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3.5 border border-slate-800 focus:outline-none focus:border-blue-500/80 transition-all"
            />

            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              className="bg-slate-950/80 text-slate-200 text-sm rounded-xl px-3 py-3.5 border border-slate-800 focus:outline-none focus:border-blue-500/80 cursor-pointer"
            >
              <option value="video">MP4 Video</option>
              <option value="audio">MP3 Audio</option>
            </select>

            <button 
              onClick={handleDownload} 
              disabled={loading || !url}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {error && <p className="mt-3 text-red-400 text-xs text-center">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-16 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <Video className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">High Quality</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Extracts the best possible media resolution available directly from source streams.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <Music className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">Instant Audio Extract</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Convert video reels straight into clean MP3 files with a single click.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white text-sm mb-1">No Login Required</h3>
            <p className="text-slate-400 text-xs leading-relaxed">100% private and secure. No accounts or personal data saved anywhere.</p>
          </div>
        </div>
      </section>

      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-900/80 z-10">
        <p>Built for fast media access.</p>
      </footer>
    </main>
  );
}