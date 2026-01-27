  import { useState, useEffect, useRef } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import { cn } from "@/lib/utils";
  import { StatusIndicator } from "@/components/ui/StatusIndicator";
  import { Square } from "lucide-react";
  import { useWebRTC } from "@/lib/useWebRTC";

  import {
    Camera,
    AlertTriangle,
    Users,
    Pause,
    Play,
    RotateCw,
  } from "lucide-react";
  import { SeverityLevel } from "@/components/ui/SeverityBadge";

  interface CameraData {
    id: string;
    name: string;
    status: "online" | "offline" | "idle"; // ✅ FIX 1
    currentEvent?: string;
    severity?: SeverityLevel;
    personCount?: number;
  }

  interface RotatingCameraFeedProps {
    cameras: CameraData[];
    rotationInterval?: number;
    extendOnThreat?: boolean;

    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onRestart: () => void;
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
    extendOnThreat = true,
    onPlay,
    onPause,
    onStop,
    onRestart,
  }: RotatingCameraFeedProps) {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [cameraState, setCameraState] = useState<
    "stopped" | "running" | "paused"
  >("stopped");

    const [timeRemaining, setTimeRemaining] = useState(rotationInterval);
    const [extendedTime, setExtendedTime] = useState(0);

    const onlineCameras = cameras.filter((c) => c.status === "online");

// ✅ FIX 2
const activeCameras =
  onlineCameras.length > 0 ? onlineCameras : cameras;

const currentCamera = activeCameras[currentIndex];

// ✅ WebRTC only when valid camera + running
const videoRef = useWebRTC(
  cameraState === "running" && !!currentCamera
);


    // ✅ FIX 3
    const currentSeverity = currentCamera?.severity || "NORMAL";
    const manualActionRef = useRef<null | "play" | "pause" | "stop">(null);

    const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (cameraState !== "running") {
      setTimeRemaining(rotationInterval);
      setExtendedTime(0);
    }
  }, [cameraState, rotationInterval]);
  
    
    useEffect(() => {
      if (cameraState !== "running" || activeCameras.length <= 1) return;

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (
              extendOnThreat &&
              (currentSeverity === "CRITICAL" ||
                currentSeverity === "HIGH")
            ) {
              const extension = currentSeverity === "CRITICAL" ? 20 : 10;
              setExtendedTime(extension);
              return extension;
            }

            setCurrentIndex((i) => (i + 1) % activeCameras.length);
            setExtendedTime(0);
            return rotationInterval;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [
    cameraState,
    activeCameras.length,
    rotationInterval,
    extendOnThreat,
    currentSeverity,
  ]);


    const goNext = () => {
      setCurrentIndex((i) => (i + 1) % activeCameras.length);
      setTimeRemaining(rotationInterval);
      setExtendedTime(0);
    };

    const goPrev = () => {
      setCurrentIndex(
        (i) => (i - 1 + activeCameras.length) % activeCameras.length
      );
      setTimeRemaining(rotationInterval);
      setExtendedTime(0);
    };

    

    useEffect(() => {
  if (cameraState !== "running") {
    setVideoReady(false);
  }
}, [cameraState]);



  // useEffect(() => {
  //   startLive().then(() => setCameraState("running"));
  // }, []);
  useEffect(() => {
    const syncStatus = async () => {
      const res = await fetch("/api/live/status");
      const s = await res.json();

    setCameraState(() => {
    if (manualActionRef.current === "stop") return "stopped";
    if (manualActionRef.current === "pause") return "paused";
    if (manualActionRef.current === "play") return "running";

    if (!s.running) return "stopped";
    if (s.paused) return "paused";
    return "running";
  });

  manualActionRef.current = null;


    };

    syncStatus();
    const id = setInterval(syncStatus, 1500);
    return () => clearInterval(id);
  }, []);


    if (!currentCamera) {
      return (
        <div className="aspect-video flex items-center justify-center bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No cameras available</p>
        </div>
      );
    }

    const severity = currentSeverity;
  


    return (
      <div className="space-y-4">
        {/* Main Feed */}
        <div className={cn(
          "relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-500",
          severityColors[severity],
          severityGlow[severity]
        )}>
          <div className="absolute inset-0">
            <motion.div
              
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {cameraState === "running" && !videoReady && (
  <div className="absolute inset-0 flex items-center justify-center
                  bg-black/40 text-muted-foreground text-xs font-mono">
    Connecting to camera…
  </div>
)}


              
    {cameraState === "running" ? (
   
<video
  ref={videoRef}
  className="w-full h-full object-cover" // Removed opacity-0 logic
  autoPlay
  playsInline
  muted={true}        // 🔥 FORCE MUTED (Required for Chrome/Firefox Autoplay)
  controls={true}     // 🔥 ADD CONTROLS (So you can manually hit play if needed)
  onPlaying={() => {
      console.log("📺 Video Started Playing!");
      setVideoReady(true);
  }}
  onLoadedMetadata={() => console.log("📺 Metadata Loaded")}
  onError={(e) => console.error("📺 Video Error:", e)}
/>

) : (
  <div className="absolute inset-0 bg-black" />
  )}




  {cameraState === "paused" && (
    <div className="absolute inset-0 flex items-center justify-center
                    bg-black/70 text-yellow-400 text-sm font-mono">
      Camera paused
    </div>
  )}

  {cameraState === "stopped" && (
    <div className="absolute inset-0 flex items-center justify-center
                    bg-black/80 text-red-400 text-sm font-mono">
      Camera stopped
    </div>
  )}



              {/* Camera ID */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm text-foreground">{currentCamera.id}</span>
              </div>

              {/* Status */}
              <div className="absolute top-4 right-4">
                <StatusIndicator
                    status={
                      cameraState === "running"
                        ? "online"
                        : cameraState === "paused"
                        ? "idle"
                        : "offline"
                    }
                    label={cameraState}
                  />

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
  <div className="text-xs font-mono text-muted-foreground text-center">
    Camera status:{" "}
    <span className={cn(
      cameraState === "running" && "text-green-400",
      cameraState === "paused" && "text-yellow-400",
      cameraState === "stopped" && "text-red-400"
    )}>
      {cameraState.toUpperCase()}
    </span>
  </div>

              {/* Person count */}
              {currentCamera.personCount !== undefined && currentCamera.personCount > 0 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">{currentCamera.personCount}</span>
                </div>
              )}
            </motion.div>
        </div>

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
            {activeCameras.map((cam, idx) => (
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
            {/* PLAY */}
  <motion.button
    onClick={() => {
      manualActionRef.current = "play";
      onPlay();
    }}

    className={cn(
      "p-2 rounded-lg",
      cameraState === "running"
        ? "opacity-40"
        : "bg-primary text-primary-foreground"
    )}
  >
    <Play className="w-4 h-4" />
    
  </motion.button>


  {/* PAUSE */}
  <motion.button
    // disabled={cameraState !== "running"}
    onClick={() => {
      manualActionRef.current = "pause";
      onPause();
    }}

    className={cn(
      "p-2 rounded-lg",
      cameraState !== "running"
        ? "opacity-40"
        : "bg-secondary"
    )}
  >

    <Pause className="w-4 h-4" />
  </motion.button>

  {/* STOP */}
  <motion.button
    // disabled={cameraState === "stopped"}
    onClick={() => {
      manualActionRef.current = "stop";
      onStop();
    }}
    className={cn(
      "p-2 rounded-lg",
      cameraState === "stopped"
        ? "opacity-40"
        : "bg-destructive text-white"
    )}
  >
    <Square className="w-4 h-4" />
  </motion.button>



  {/* RESTART */}
  <motion.button
    onClick={onRestart}
    className="p-2 rounded-lg bg-secondary"
  >

    <RotateCw className="w-4 h-4" />
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
                  const idx = activeCameras.findIndex(c => c.id === cam.id);
                  if (idx !== -1) {
                    setCurrentIndex(idx);

                  // const onlineIdx = onlineCameras.findIndex(c => c.id === cam.id);
                  // if (onlineIdx !== -1) {
                    // setCurrentIndex(onlineIdx);
                    setTimeRemaining(rotationInterval);
                    setExtendedTime(0);
                  }
                }
              }}
              className={cn(
                "p-2 rounded-lg border text-xs transition-all duration-200",
                cam.status === "offline" && "opacity-50 cursor-not-allowed",
                activeCameras[currentIndex]?.id === cam.id
  
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
