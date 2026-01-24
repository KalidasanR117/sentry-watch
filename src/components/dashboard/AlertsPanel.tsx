import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bell, AlertTriangle, X } from "lucide-react";
import { SeverityBadge, SeverityLevel } from "@/components/ui/SeverityBadge";

interface Alert {
  id: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-critical text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {criticalCount}
              </span>
            )}
          </div>
          <h3 className="font-semibold">Active Alerts</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {alerts.length} total
        </span>
      </div>
      
      {/* Alerts list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              "bg-card/50 backdrop-blur-sm",
              alert.severity === "CRITICAL" && "border-critical/40 bg-critical/5 pulse-alert",
              alert.severity === "HIGH" && "border-high/40 bg-high/5"
            )}
          >
            <AlertTriangle className={cn(
              "w-4 h-4 mt-0.5 flex-shrink-0",
              alert.severity === "CRITICAL" && "text-critical",
              alert.severity === "HIGH" && "text-high",
              alert.severity === "MEDIUM" && "text-medium",
              (alert.severity === "LOW" || alert.severity === "NORMAL") && "text-muted-foreground"
            )} />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">{alert.message}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <SeverityBadge severity={alert.severity} className="scale-90 origin-left" />
                <span className="text-xs text-muted-foreground font-mono">{alert.timestamp}</span>
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </motion.div>
        ))}
        
        {alerts.length === 0 && (
          <div className="text-center py-6">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
