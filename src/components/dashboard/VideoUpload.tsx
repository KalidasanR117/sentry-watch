import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  FileVideo, 
  Activity, 
  Brain, 
  Play, 
  X, 
  CheckCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";

type ProcessingMode = "pose" | "transformer";
// Expanded status types to handle the new loading state
type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error";

interface VideoUploadProps {
  onProcessComplete?: (results: any) => void;
}

export function VideoUpload({ onProcessComplete }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessingMode>("pose");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  // State to store the backend progress data
  const [serverStatus, setServerStatus] = useState({ progress: 0, status: "Initializing..." });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 POLL BACKEND FOR PROGRESS
  useEffect(() => {
    if (status !== "processing") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/offline/status");
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data);

          // If backend says 100%, we are done
          if (data.progress >= 100) {
            setStatus("complete");
            clearInterval(interval);
            
            // Wait a moment for the user to see 100%, then switch tabs
            setTimeout(() => {
              if (onProcessComplete) {
                onProcessComplete({ mode, filename: selectedFile?.name });
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [status, onProcessComplete, mode, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setStatus("uploading");
    setServerStatus({ progress: 0, status: "Uploading Video..." });
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", mode);

    try {
      // 1. Upload the file
      const res = await fetch("/api/analyze/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // 2. If upload success, switch UI to "Processing" mode to start polling
        setStatus("processing");
      } else {
        console.error("Upload failed");
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setServerStatus({ progress: 0, status: "Idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection (Only visible when idle) */}
      {status === "idle" && (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("pose")}
            className={cn(
              "flex-1 p-4 rounded-lg border-2 transition-all duration-300",
              "flex flex-col items-center gap-2",
              mode === "pose" 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
            )}
          >
            <Activity className="w-8 h-8" />
            <span className="font-semibold">Pose-Based</span>
            <span className="text-xs text-center opacity-70">
              Fast analysis using Rule Engine
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("transformer")}
            className={cn(
              "flex-1 p-4 rounded-lg border-2 transition-all duration-300",
              "flex flex-col items-center gap-2",
              mode === "transformer" 
                ? "border-accent bg-accent/10 text-accent" 
                : "border-border bg-card/50 text-muted-foreground hover:border-accent/50"
            )}
          >
            <Brain className="w-8 h-8" />
            <span className="font-semibold">Transformer</span>
            <span className="text-xs text-center opacity-70">
              Deep Scan (VideoMAE)
            </span>
          </motion.button>
        </div>
      )}

      {/* Main Content Area */}
      <motion.div
        onClick={() => status === "idle" && fileInputRef.current?.click()}
        whileHover={status === "idle" ? { scale: 1.01 } : {}}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[300px]",
          status === "idle" && "cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-border",
          (status === "uploading" || status === "processing") && "border-primary/50 bg-black/40", // Darker background for loading
          status === "complete" && "border-low/50 bg-low/5",
          status === "error" && "border-critical/50 bg-critical/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {status === "idle" && !selectedFile && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">Click to upload video</p>
              <p className="text-sm text-muted-foreground">Supports MP4, AVI, MOV</p>
            </motion.div>
          )}

          {/* FILE SELECTED STATE */}
          {status === "idle" && selectedFile && (
            <motion.div
              key="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full"
            >
              <FileVideo className="w-16 h-16 text-primary mx-auto mb-6" />
              <p className="text-xl text-foreground font-medium mb-2">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mb-8">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="flex gap-4 mt-6 justify-center">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold text-lg rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Analysis
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* UPLOADING STATE */}
          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h3 className="text-xl font-bold mb-2">Uploading Video...</h3>
              <p className="text-muted-foreground">Please wait while we prepare the file.</p>
            </motion.div>
          )}

          {/* 🔥 PROCESSING / LOADING SCREEN 🔥 */}
          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full max-w-md mx-auto"
            >
              {/* Animated Icon Ring */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div 
                    className={cn(
                      "absolute inset-0 border-4 rounded-full border-t-transparent animate-spin",
                      mode === 'transformer' ? "border-red-500" : "border-primary"
                    )}
                    style={{ animationDuration: "1.5s" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    {mode === 'pose' ? (
                         <Activity className="w-10 h-10 text-primary animate-pulse" />
                    ) : (
                         <Brain className="w-10 h-10 text-red-500 animate-pulse" />
                    )}
                </div>
              </div>

              {/* Status Text */}
              <h3 className="text-2xl font-bold mb-2 animate-pulse text-foreground">
                  {serverStatus.status || "Initializing GPU..."}
              </h3>
              <p className="text-gray-400 mb-8 text-sm">
                  Running {mode === 'pose' ? "Pose Estimation" : "VideoMAE Transformer"} on RTX 4050
              </p>

              {/* Progress Bar */}
              <div className="h-3 bg-secondary rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div 
                      className={cn(
                          "h-full transition-all duration-300 relative",
                          mode === 'transformer' ? "bg-red-500" : "bg-primary"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${serverStatus.progress}%` }}
                  >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                  </motion.div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-3 font-mono">
                  <span>START</span>
                  <span>{serverStatus.progress}% COMPLETE</span>
              </div>
            </motion.div>
          )}

          {/* COMPLETE STATE */}
          {status === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <CheckCircle className="w-20 h-20 text-low mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Analysis Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Switching to Live Monitor to view results...
              </p>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <AlertTriangle className="w-16 h-16 text-critical mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h3>
              <p className="text-muted-foreground mb-6">Something went wrong during processing.</p>
              <motion.button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}