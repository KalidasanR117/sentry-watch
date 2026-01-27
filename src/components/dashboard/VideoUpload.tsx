import { useState, useRef } from "react";
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
  AlertCircle
} from "lucide-react";

type ProcessingMode = "pose" | "transformer";
type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error";

interface VideoUploadProps {
  onProcessComplete?: (results: any) => void;
}

export function VideoUpload({ onProcessComplete }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessingMode>("pose");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", mode);

    try {
      const res = await fetch("/api/analyze/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("complete");
        // Trigger parent to switch tabs
        if (onProcessComplete) {
            onProcessComplete({ mode, filename: selectedFile.name });
        }
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
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

      {/* Upload Area */}
      <motion.div
        onClick={() => status === "idle" && fileInputRef.current?.click()}
        whileHover={status === "idle" ? { scale: 1.01 } : {}}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[200px]",
          status === "idle" && "cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-border",
          status === "uploading" && "border-primary/50 bg-primary/5",
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

          {status === "idle" && selectedFile && (
            <motion.div
              key="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full"
            >
              <FileVideo className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">{selectedFile.name}</p>
              <div className="flex gap-3 mt-6 justify-center">
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start Analysis
                </motion.button>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-foreground font-medium">Uploading & Starting...</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </motion.div>
          )}

          {status === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <CheckCircle className="w-12 h-12 text-low mx-auto mb-4" />
              <p className="text-foreground font-medium">Analysis Started!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Switch to <b>Live Monitor</b> to watch the results.
              </p>
              <motion.button
                onClick={reset}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg"
              >
                Process Another
              </motion.button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <AlertCircle className="w-12 h-12 text-critical mx-auto mb-4" />
              <p className="text-foreground font-medium">Upload Failed</p>
              <motion.button
                onClick={reset}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
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