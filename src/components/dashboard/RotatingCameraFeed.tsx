import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Camera, AlertTriangle, Users, Shield, ChevronLeft, ChevronRight, Pause, Play, RotateCw } from "lucide-react";
import { SeverityLevel } from "@/components/ui/SeverityBadge";

interface CameraData {
  id: string;
  name: string;
  status: "online" | "offline";
  currentEvent?: string;
  severity?: SeverityLevel;
  personCount?: number;
}

interface RotatingCameraFeedProps {
  cameras: CameraData[];
  rotationInterval?: number; // seconds
  extendOnThreat?: boolean;
}

const severityColors = {
  CRITICAL: "border-critical/60",
  HIGH: "border-high/60",
  MEDIUM: "border-medium/60",
  LOW: "border-low/40",
  NORMAL: "border-border",
};

const severityGlow = {
  CRITICAL: "glow-critical",
  HIGH: "",
  MEDIUM: "",
  LOW: "",
  NORMAL: "",
};

export function RotatingCameraFeed({ 
  cameras, 
  rotationInterval = 10,
  extendOnThreat = true 
}: RotatingCameraFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(rotationInterval);
  const [extendedTime, setExtendedTime] = useState(0);

  const onlineCameras = cameras.filter(c => c.status === "online");
  const currentCamera = onlineCameras[currentIndex] || cameras[0];

  // Rotation logic
  useEffect(() => {
    if (isPaused || onlineCameras.length <= 1) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Check for threat extension
          const severity = currentCamera?.severity;
          if (extendOnThreat && (severity === "CRITICAL" || severity === "HIGH")) {
            const extension = severity === "CRITICAL" ? 20 : 10;
            setExtendedTime(extension);
            return extension;
          }
          
          // Rotate to next camera
          setCurrentIndex(i => (i + 1) % onlineCameras.length);
          setExtendedTime(0);
          return rotationInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex, onlineCameras.length, rotationInterval, extendOnThreat, currentCamera?.severity]);

  const goNext = () => {
    setCurrentIndex(i => (i + 1) % onlineCameras.length);
    setTimeRemaining(rotationInterval);
    setExtendedTime(0);
  };

  const goPrev = () => {
    setCurrentIndex(i => (i - 1 + onlineCameras.length) % onlineCameras.length);
    setTimeRemaining(rotationInterval);
    setExtendedTime(0);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!currentCamera) {
    return (
      <div className="aspect-video flex items-center justify-center bg-card rounded-xl border border-border">
        <p className="text-muted-foreground">No cameras available</p>
      </div>
    );
  }

  const severity = currentCamera.severity || "NORMAL";

  return (
    <div className="space-y-4">
      {/* Main Feed */}
      <div className={cn(
        "relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-500",
        severityColors[severity],
        severityGlow[severity]
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCamera.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Feed background */}
            <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-secondary" />
            
            {/* Scan lines */}
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,136,0.03)_2px,rgba(0,255,136,0.03)_4px)]" />
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-lg font-mono text-muted-foreground">{currentCamera.name}</p>
                <p className="text-sm text-muted-foreground/60 font-mono">{currentCamera.id}</p>
              </div>
            </div>

            {/* Camera ID */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm text-foreground">{currentCamera.id}</span>
            </div>

            {/* Status */}
            <div className="absolute top-4 right-4">
              <StatusIndicator status={currentCamera.status} label={currentCamera.status} />
            </div>

            {/* Event overlay */}
            {currentCamera.currentEvent && severity !== "NORMAL" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={cn(
                    "w-6 h-6",
                    severity === "CRITICAL" && "text-critical animate-pulse",
                    severity === "HIGH" && "text-high",
                    severity === "MEDIUM" && "text-medium"
                  )} />
                  <div>
                    <p className="font-semibold text-foreground">{currentCamera.currentEvent}</p>
                    <p className="text-xs text-muted-foreground">
                      {severity === "CRITICAL" && "Immediate attention required"}
                      {severity === "HIGH" && "High priority alert"}
                      {severity === "MEDIUM" && "Monitoring situation"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Person count */}
            {currentCamera.personCount !== undefined && currentCamera.personCount > 0 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">{currentCamera.personCount}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Extended time indicator */}
        {extendedTime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-critical/90 text-white px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2"
          >
            <RotateCw className="w-3 h-3" />
            Extended due to threat
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Camera indicators */}
        <div className="flex items-center gap-2">
          {onlineCameras.map((cam, idx) => (
            <motion.button
              key={cam.id}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentIndex(idx);
                setTimeRemaining(rotationInterval);
                setExtendedTime(0);
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "bg-primary scale-125" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
          <span>Next in</span>
          <span className={cn(
            "font-bold",
            timeRemaining <= 3 && "text-primary"
          )}>
            {timeRemaining}s
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePause}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isPaused ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Camera list */}
      <div className="grid grid-cols-4 gap-2">
        {cameras.map((cam, idx) => (
          <motion.button
            key={cam.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (cam.status === "online") {
                const onlineIdx = onlineCameras.findIndex(c => c.id === cam.id);
                if (onlineIdx !== -1) {
                  setCurrentIndex(onlineIdx);
                  setTimeRemaining(rotationInterval);
                  setExtendedTime(0);
                }
              }
            }}
            className={cn(
              "p-2 rounded-lg border text-xs transition-all duration-200",
              cam.status === "offline" && "opacity-50 cursor-not-allowed",
              onlineCameras[currentIndex]?.id === cam.id 
                ? "border-primary bg-primary/10" 
                : "border-border bg-card/50 hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                cam.status === "online" ? "bg-low" : "bg-muted-foreground"
              )} />
              <span className="font-mono truncate">{cam.id}</span>
            </div>
            <p className="text-muted-foreground truncate">{cam.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
