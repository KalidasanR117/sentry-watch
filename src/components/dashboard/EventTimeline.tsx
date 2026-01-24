import { motion } from "framer-motion";
import { SeverityBadge, SeverityLevel } from "@/components/ui/SeverityBadge";
import { Clock, User, Camera, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventItem {
  id: string;
  type: string;
  severity: SeverityLevel;
  timestamp: string;
  cameraId: string;
  trackId?: string;
  description?: string;
  screenshot?: string;
}

interface EventTimelineProps {
  events: EventItem[];
  maxItems?: number;
}

export function EventTimeline({ events, maxItems = 10 }: EventTimelineProps) {
  const displayedEvents = events.slice(0, maxItems);
  
  return (
    <div className="space-y-3">
      {displayedEvents.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ x: 4, backgroundColor: "hsl(var(--secondary))" }}
          className={cn(
            "relative flex items-start gap-4 p-4 rounded-lg",
            "bg-card/50 border border-border/50 cursor-pointer",
            "transition-all duration-200",
            event.severity === "CRITICAL" && "border-critical/30 bg-critical/5",
            event.severity === "HIGH" && "border-high/30 bg-high/5"
          )}
        >
          {/* Timeline dot */}
          <div className={cn(
            "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
            event.severity === "CRITICAL" && "bg-critical shadow-[0_0_10px_hsl(var(--critical))]",
            event.severity === "HIGH" && "bg-high shadow-[0_0_10px_hsl(var(--high))]",
            event.severity === "MEDIUM" && "bg-medium shadow-[0_0_10px_hsl(var(--medium))]",
            event.severity === "LOW" && "bg-low",
            event.severity === "NORMAL" && "bg-muted-foreground"
          )} />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h4 className="font-medium text-foreground truncate">{event.type}</h4>
              <SeverityBadge severity={event.severity} />
            </div>
            
            {event.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {event.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {event.cameraId}
              </span>
              {event.trackId && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Track #{event.trackId}
                </span>
              )}
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </motion.div>
      ))}
      
      {events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground font-mono text-sm">No events recorded</p>
        </div>
      )}
    </div>
  );
}
