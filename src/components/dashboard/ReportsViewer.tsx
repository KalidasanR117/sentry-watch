import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Video,
  Camera,
  ChevronRight,
  X
} from "lucide-react";
import { SeverityBadge, SeverityLevel } from "@/components/ui/SeverityBadge";

interface Report {
  id: string;
  name: string;
  date: string;
  time: string;
  mode: "LIVE" | "OFFLINE" | "POSE_OFFLINE";
  eventCount: number;
  criticalCount: number;
  duration: string;
  summary?: string;
}

const mockReports: Report[] = [
  {
    id: "rpt-001",
    name: "sentry_live_report_20250124_143245.pdf",
    date: "2025-01-24",
    time: "14:32:45",
    mode: "LIVE",
    eventCount: 12,
    criticalCount: 2,
    duration: "2h 15m",
    summary: "Two critical incidents detected including a physical altercation in the lobby area and a blacklisted individual sighting at main entrance."
  },
  {
    id: "rpt-002",
    name: "sentry_pose_offline_report_20250124_120030.pdf",
    date: "2025-01-24",
    time: "12:00:30",
    mode: "POSE_OFFLINE",
    eventCount: 8,
    criticalCount: 0,
    duration: "5m 42s",
    summary: "Video analysis complete. Minor suspicious gestures detected but no immediate threats identified."
  },
  {
    id: "rpt-003",
    name: "sentry_offline_report_20250123_183012.pdf",
    date: "2025-01-23",
    time: "18:30:12",
    mode: "OFFLINE",
    eventCount: 23,
    criticalCount: 3,
    duration: "15m 20s",
    summary: "Multiple fight sequences detected. VideoMAE transformer identified high-confidence violence events."
  },
  {
    id: "rpt-004",
    name: "sentry_live_report_20250123_090000.pdf",
    date: "2025-01-23",
    time: "09:00:00",
    mode: "LIVE",
    eventCount: 5,
    criticalCount: 0,
    duration: "8h 00m",
    summary: "Normal morning shift. Routine activity with some loitering detections."
  },
];

interface ReportsViewerProps {
  onClose?: () => void;
}

export function ReportsViewer({ onClose }: ReportsViewerProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getModeIcon = (mode: Report["mode"]) => {
    switch (mode) {
      case "LIVE":
        return <Camera className="w-4 h-4" />;
      case "OFFLINE":
      case "POSE_OFFLINE":
        return <Video className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: Report["mode"]) => {
    switch (mode) {
      case "LIVE":
        return "text-primary bg-primary/10";
      case "OFFLINE":
        return "text-accent bg-accent/10";
      case "POSE_OFFLINE":
        return "text-medium bg-medium/10";
    }
  };

  return (
    <div className="space-y-4">
      {/* Report List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {mockReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedReport(report)}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all duration-200",
              "bg-card/50 hover:bg-card hover:border-primary/50",
              selectedReport?.id === report.id && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-sm truncate">
                    {report.name}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {report.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.time}
                  </span>
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full",
                    getModeColor(report.mode)
                  )}>
                    {getModeIcon(report.mode)}
                    {report.mode.replace("_", " ")}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs">
                    <span className="text-foreground font-medium">{report.eventCount}</span>
                    <span className="text-muted-foreground"> events</span>
                  </span>
                  {report.criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-critical">
                      <AlertTriangle className="w-3 h-3" />
                      {report.criticalCount} critical
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {report.duration}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Simulate download
                  }}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  title="Download Report"
                >
                  <Download className="w-4 h-4 text-primary" />
                </motion.button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Preview Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-card p-6 rounded-xl border border-primary/30"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Report Preview
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {selectedReport.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Report Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-mono">{selectedReport.date} {selectedReport.time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-mono">{selectedReport.duration}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                    <p className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm",
                      getModeColor(selectedReport.mode)
                    )}>
                      {getModeIcon(selectedReport.mode)}
                      {selectedReport.mode.replace("_", " ")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Events</p>
                    <p className="font-mono">
                      {selectedReport.eventCount} total
                      {selectedReport.criticalCount > 0 && (
                        <span className="text-critical ml-2">
                          ({selectedReport.criticalCount} critical)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                {selectedReport.summary && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-2">AI Summary</p>
                    <p className="text-sm leading-relaxed">{selectedReport.summary}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Report
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
