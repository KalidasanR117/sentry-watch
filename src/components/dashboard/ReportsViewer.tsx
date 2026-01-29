import { useState, useEffect } from "react";
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
  X,
  Loader2
} from "lucide-react";

// Updated Interface to match Backend API
interface Report {
  id: string;
  name: string;
  date: string;
  time: string;
  mode: "LIVE" | "OFFLINE" | "POSE_OFFLINE";
  url: string;      // New field for the file link
  size: string;     // New field for file size
  eventCount: number;
  criticalCount: number;
  duration: string;
  summary?: string;
}

interface ReportsViewerProps {
  onClose?: () => void;
}

export function ReportsViewer({ onClose }: ReportsViewerProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // 🔥 FETCH REPORTS FROM API
  useEffect(() => {
    fetch("http://localhost:8000/api/reports") // Ensure port matches your backend
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load reports", err);
        setLoading(false);
      });
  }, []);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "LIVE": return <Camera className="w-4 h-4" />;
      case "OFFLINE":
      case "POSE_OFFLINE": return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "LIVE": return "text-primary bg-primary/10";
      case "OFFLINE": return "text-accent bg-accent/10";
      case "POSE_OFFLINE": return "text-orange-500 bg-orange-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const handleDownload = (report: Report) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = `http://localhost:8000${report.url}`;
    link.download = report.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (report: Report) => {
    window.open(`http://localhost:8000${report.url}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading reports...
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No reports generated yet.
        </div>
      )}

      {/* Report List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {reports.map((report, index) => (
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
                  <span className="font-mono text-sm truncate" title={report.name}>
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
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(report);
                  }}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  title="Download PDF"
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
                    Report Details
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono mt-1 break-all">
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
                    <p className="text-xs text-muted-foreground mb-1">Generated On</p>
                    <p className="font-mono">{selectedReport.date} at {selectedReport.time}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">File Size</p>
                    <p className="font-mono">{selectedReport.size}</p>
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
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="font-mono text-green-500 flex items-center gap-1">
                      Ready for Download
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(selectedReport)}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleView(selectedReport)}
                    className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Open in Browser
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