import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Camera, AlertTriangle, Users, Shield } from "lucide-react";

interface CameraFeedProps {
  id: string;
  name: string;
  status: "online" | "offline";
  currentEvent?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  personCount?: number;
}

const severityColors = {
  CRITICAL: "border-critical/60",
  HIGH: "border-high/60",
  MEDIUM: "border-medium/60",
  LOW: "border-low/40",
  NORMAL: "border-border",
};

export function CameraFeed({ 
  id, 
  name, 
  status, 
  currentEvent,
  severity = "NORMAL",
  personCount = 0 
}: CameraFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "camera-feed aspect-video relative group cursor-pointer",
        "border-2 transition-all duration-300",
        // severityColors[severity],
        // severity === "CRITICAL" && "glow-critical"
        "border-border"
      )}
    >
      {/* Simulated feed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-secondary" />
      
      {/* Scan lines overlay */}
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,136,0.03)_2px,rgba(0,255,136,0.03)_4px)]" />
      
      {/* Camera ID watermark */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-primary" />
        <span className="font-mono text-xs text-muted-foreground">{id}</span>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        <StatusIndicator status={status} />
      </div>
      
      {/* Center placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-mono">FEED: {name}</p>
        </div>
      </div>
      
      {/* Event overlay */}
      {currentEvent && severity !== "NORMAL" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3",
            "bg-gradient-to-t from-black/90 to-transparent"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "w-4 h-4",
              severity === "CRITICAL" && "text-critical",
              severity === "HIGH" && "text-high",
              severity === "MEDIUM" && "text-medium"
            )} />
            <span className="text-xs font-mono text-foreground truncate">
              {currentEvent}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Person count */}
      {personCount > 0 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
          <Users className="w-3 h-3 text-primary" />
          <span className="text-xs font-mono text-foreground">{personCount}</span>
        </div>
      )}
      
      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/50 flex items-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-mono text-muted-foreground">{name}</span>
      </div>
    </motion.div>
  );
}
