import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { CameraFeed } from "@/components/dashboard/CameraFeed";
import { EventTimeline, EventItem } from "@/components/dashboard/EventTimeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { FaceList } from "@/components/dashboard/FaceList";
import { SeverityLevel } from "@/components/ui/SeverityBadge";
import { 
  Shield, 
  Camera, 
  AlertTriangle, 
  Users, 
  Activity,
  Clock,
  Eye,
  Wifi
} from "lucide-react";

// Mock data
const mockCameras = [
  { id: "CAM-001", name: "Main Entrance", status: "online" as const, currentEvent: "Normal Activity", severity: "NORMAL" as SeverityLevel, personCount: 3 },
  { id: "CAM-002", name: "Parking Lot", status: "online" as const, currentEvent: "Suspicious Gesture", severity: "MEDIUM" as SeverityLevel, personCount: 2 },
  { id: "CAM-003", name: "Lobby", status: "online" as const, currentEvent: "Fight Detected", severity: "CRITICAL" as SeverityLevel, personCount: 4 },
  { id: "CAM-004", name: "Back Exit", status: "offline" as const, personCount: 0 },
];

const mockEvents: EventItem[] = [
  { id: "1", type: "Fight Detected", severity: "CRITICAL", timestamp: "14:32:45", cameraId: "CAM-003", trackId: "12", description: "Physical altercation detected between two individuals near the reception desk." },
  { id: "2", type: "Blacklisted Person", severity: "CRITICAL", timestamp: "14:28:12", cameraId: "CAM-001", trackId: "8", description: "Known blacklisted individual 'John Doe' detected at main entrance." },
  { id: "3", type: "Suspicious Gesture", severity: "MEDIUM", timestamp: "14:25:33", cameraId: "CAM-002", trackId: "5" },
  { id: "4", type: "Running Detected", severity: "LOW", timestamp: "14:20:10", cameraId: "CAM-001", trackId: "3" },
  { id: "5", type: "Loitering", severity: "LOW", timestamp: "14:15:22", cameraId: "CAM-004", trackId: "7" },
];

const mockAlerts = [
  { id: "a1", message: "Fight detected in Lobby - Immediate attention required", severity: "CRITICAL" as SeverityLevel, timestamp: "14:32:45" },
  { id: "a2", message: "Blacklisted person detected at Main Entrance", severity: "CRITICAL" as SeverityLevel, timestamp: "14:28:12" },
  { id: "a3", message: "Suspicious gesture detected in Parking Lot", severity: "MEDIUM" as SeverityLevel, timestamp: "14:25:33" },
];

const mockFaces = [
  { id: "f1", name: "John Doe", status: "blacklist" as const, lastSeen: "14:28:12" },
  { id: "f2", name: "Jane Smith", status: "blacklist" as const, lastSeen: "Yesterday" },
  { id: "f3", name: "Admin User", status: "whitelist" as const, lastSeen: "Active" },
  { id: "f4", name: "Security Staff", status: "whitelist" as const, lastSeen: "Active" },
  { id: "f5", name: "Maintenance", status: "whitelist" as const, lastSeen: "12:00:00" },
];

export function DashboardSection() {
  const [alerts, setAlerts] = useState(mockAlerts);
  
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };
  
  return (
    <section id="dashboard" className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Command Center
            </h2>
            <p className="text-muted-foreground mt-1">Real-time security monitoring dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="w-4 h-4 text-primary" />
              Live
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </motion.div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Cameras"
            value="3 / 4"
            icon={<Camera className="w-5 h-5" />}
            trend="neutral"
          />
          <StatCard
            title="Active Threats"
            value="2"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend="up"
            trendValue="+1"
            variant="critical"
          />
          <StatCard
            title="People Tracked"
            value="9"
            icon={<Users className="w-5 h-5" />}
            trend="up"
            trendValue="+3"
          />
          <StatCard
            title="Events Today"
            value="47"
            icon={<Activity className="w-5 h-5" />}
            trend="down"
            trendValue="-12%"
            variant="success"
          />
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feeds - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Live Feeds
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {mockCameras.filter(c => c.status === "online").length} cameras online
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {mockCameras.map((camera) => (
                  <CameraFeed key={camera.id} {...camera} />
                ))}
              </div>
            </GlassCard>
            
            {/* Event Timeline */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Event Timeline
                </h3>
                <a href="#" className="text-xs text-primary hover:underline">View All</a>
              </div>
              <EventTimeline events={mockEvents} maxItems={5} />
            </GlassCard>
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <GlassCard>
              <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
            </GlassCard>
            
            {/* Face Database */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Face Database
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {mockFaces.length} entries
                </span>
              </div>
              <FaceList faces={mockFaces} />
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
