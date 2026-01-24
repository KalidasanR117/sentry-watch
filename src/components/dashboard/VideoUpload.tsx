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
  onProcessComplete?: (results: ProcessingResults) => void;
}

interface ProcessingResults {
  mode: ProcessingMode;
  filename: string;
  events: number;
  duration: string;
  threats: number;
}

export function VideoUpload({ onProcessComplete }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessingMode>("pose");
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setStatus("idle");
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      setStatus("idle");
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const simulateProcessing = () => {
    if (!selectedFile) return;
    
    setStatus("uploading");
    setProgress(0);
    
    // Simulate upload
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 30) {
          clearInterval(uploadInterval);
          setStatus("processing");
          return 30;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate processing
    setTimeout(() => {
      const processInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(processInterval);
            setStatus("complete");
            onProcessComplete?.({
              mode,
              filename: selectedFile.name,
              events: Math.floor(Math.random() * 10) + 2,
              duration: "2:34",
              threats: Math.floor(Math.random() * 3)
            });
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }, 700);
  };

  const reset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            Rule engine with keypoint detection
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
            VideoMAE deep learning model
          </span>
        </motion.button>
      </div>

      {/* Upload Area */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => status === "idle" && fileInputRef.current?.click()}
        whileHover={status === "idle" ? { scale: 1.01 } : {}}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[200px]",
          status === "idle" && "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
          status === "idle" && "border-border",
          status === "processing" && "border-primary/50 bg-primary/5",
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
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Drop video file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-4">
                Supports MP4, AVI, MOV, WebM
              </p>
            </motion.div>
          )}

          {status === "idle" && selectedFile && (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center w-full"
            >
              <FileVideo className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1 truncate px-4">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateProcessing();
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Process Video
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {(status === "uploading" || status === "processing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center w-full"
            >
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-foreground font-medium mb-1">
                {status === "uploading" ? "Uploading..." : `Analyzing with ${mode === "pose" ? "Pose Engine" : "VideoMAE"}...`}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {progress}% complete
              </p>
              <div className="w-full max-w-xs mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          )}

          {status === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <CheckCircle className="w-12 h-12 text-low mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Processing Complete!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Results added to timeline
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg"
              >
                Process Another
              </motion.button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <AlertCircle className="w-12 h-12 text-critical mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Processing Failed</p>
              <p className="text-sm text-muted-foreground mb-4">
                Please try again
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mode Info */}
      <div className={cn(
        "p-4 rounded-lg border text-sm",
        mode === "pose" ? "border-primary/30 bg-primary/5" : "border-accent/30 bg-accent/5"
      )}>
        <p className="font-medium mb-1">
          {mode === "pose" ? "Pose-Based Analysis" : "Transformer Analysis"}
        </p>
        <p className="text-muted-foreground text-xs">
          {mode === "pose" 
            ? "Uses YOLO keypoint detection with rule engine for gesture recognition, fighting detection, and behavioral analysis."
            : "Uses VideoMAE transformer model for deep violence detection with dance filtering support."
          }
        </p>
      </div>
    </div>
  );
}
