import { useEffect, useState } from "react";
import { fetchEvents, fetchDashboardSummary, startLive } from "@/lib/api"; // BACKEND
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { RotatingCameraFeed } from "@/components/dashboard/RotatingCameraFeed";
import { EventTimeline, EventItem } from "@/components/dashboard/EventTimeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { FaceList } from "@/components/dashboard/FaceList";
import { VideoUpload } from "@/components/dashboard/VideoUpload";
import { ReportsViewer } from "@/components/dashboard/ReportsViewer";
import { AddFaceModal } from "@/components/dashboard/AddFaceModal";
import { SeverityLevel } from "@/components/ui/SeverityBadge";
import {
  Shield,
  Camera,
  AlertTriangle,
  Users,
  Activity, 
  Clock,
  Eye,
  Wifi,
  Upload,
  FileText,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "live" | "upload" | "reports";
const playLive = () => fetch("/api/live/start", { method: "POST" });
const pauseLive = () => fetch("/api/live/pause", { method: "POST" });
const stopLive = () => fetch("/api/live/stop", { method: "POST" });
const restartLive = () => fetch("/api/live/restart", { method: "POST" });

interface FaceEntry {
  id: string;
  name: string;
  status: "whitelist" | "blacklist";
  lastSeen?: string;
  imageUrl?: string;
}


export function DashboardSection() {
  /* ===================== BACKEND STATE ===================== */
  const [alerts, setAlerts] = useState<any[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [liveActive, setLiveActive] = useState(false);
  
  /* ===================== UI STATE (UNCHANGED) ===================== */
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [showAddFaceModal, setShowAddFaceModal] = useState(false);

  const [faces, setFaces] = useState<FaceEntry[]>([]);
  const [editingFace, setEditingFace] = useState<FaceEntry | null>(null);
  
  const [cameraState, setCameraState] = useState<
  "stopped" | "running" | "paused"
>("stopped");

  const handlePlay = async () => {
  await playLive();
  setCameraState("running");
};

const handlePause = async () => {
  await pauseLive();
  setCameraState("paused");
};

const handleStop = async () => {
  await stopLive();
  setCameraState("stopped");
};

const handleRestart = async () => {
  await restartLive();
  setCameraState("running");
};


  /* ===================== BACKEND POLLING ===================== */
  useEffect(() => {
    const load = async () => {
      try {
        const eventsRes = await fetchEvents();
        const summaryRes = await fetchDashboardSummary();

        const mappedEvents: EventItem[] = (eventsRes.events || []).map(
          (e: any, i: number) => ({
            id: `${i}-${e.time}`,
            type: e.type,
            severity: e.severity as SeverityLevel,
            timestamp: e.time,
            cameraId: e.camera ?? "LIVE",
            description: e.type,
          })
        );

        const mappedAlerts = mappedEvents
          .filter(
            (e) => e.severity === "CRITICAL" || e.severity === "HIGH"
          )
          .map((e) => ({
            id: e.id,
            message: e.type,
            severity: e.severity,
            timestamp: e.timestamp,
          }));

        setEvents(mappedEvents);
        setAlerts(mappedAlerts);
        setStats(summaryRes);
        // liveActive should reflect camera state, not events
        setLiveActive(true);

      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, []);

  /* ===================== CAMERA MODEL (REAL BACKEND STATE) ===================== */
  const cameras = [
    {
      id: "LIVE",
      name: "Live Surveillance",
      status: liveActive ? "online" : "idle",
      currentEvent: alerts[0]?.message ?? "Monitoring",
      severity: alerts[0]?.severity ?? "NORMAL",
      personCount: stats?.people_tracked ?? 0,
    },
  ];

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

 const handleAddFace = (face: {
  id?: string;
  name: string;
  status: "whitelist" | "blacklist";
  imageUrl?: string;
}) => {
  setFaces(prev => {
    // EDIT MODE
    if (editingFace) {
      return prev.map(f =>
        f.id === editingFace.id
          ? {
              ...f,
              name: face.name,
              status: face.status,
              imageUrl: face.imageUrl,
              lastSeen: "Updated just now",
            }
          : f
      );
    }

    // ADD MODE
    return [
      ...prev,
      {
        id: `f-${Date.now()}`,
        name: face.name,
        status: face.status,
        imageUrl: face.imageUrl,
        lastSeen: "Just added",
      },
    ];
  });

  setEditingFace(null);
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
            <p className="text-muted-foreground mt-1">
              Real-time security monitoring dashboard
            </p>
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

        {/* Stats Row (REAL BACKEND VALUES) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Cameras"
            value={`${stats?.active_cameras ?? 1} / ${
              stats?.total_cameras ?? 1
            }`}
            icon={<Camera className="w-5 h-5" />}
            trend="neutral"
          />
          <StatCard
            title="Active Threats"
            value={`${stats?.active_threats ?? 0}`}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="critical"
          />
          <StatCard
            title="People Tracked"
            value={`${stats?.people_tracked ?? 0}`}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Events Today"
            value={`${stats?.events_today ?? 0}`}
            icon={<Activity className="w-5 h-5" />}
            variant="success"
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: "live" as TabType, label: "Live Monitor", icon: <Eye className="w-4 h-4" /> },
            { id: "upload" as TabType, label: "Video Analysis", icon: <Upload className="w-4 h-4" /> },
            { id: "reports" as TabType, label: "Reports", icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={cn(
                "px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all duration-300",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === "live" && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard>
                   <RotatingCameraFeed
                        cameras={cameras}
                        rotationInterval={10}
                        extendOnThreat
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onStop={handleStop}
                        onRestart={handleRestart}
                      />

                  </GlassCard>
                </motion.div>
              )}

             {activeTab === "upload" && (
  <motion.div
    key="upload"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <GlassCard>
      <VideoUpload onProcessComplete={() => {
          // 🔥 Auto-switch to Live Monitor when upload finishes
          setActiveTab("live"); 
      }} />
    </GlassCard>
  </motion.div>
)}

              {activeTab === "reports" && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard>
                    <ReportsViewer />
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            <GlassCard>
              <EventTimeline events={events} maxItems={5} />
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard>
              <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
            </GlassCard>

           <GlassCard>
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold flex items-center gap-2">
      <Users className="w-5 h-5 text-primary" />
      Face Database
    </h3>
    <button
      onClick={() => setShowAddFaceModal(true)}
      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
      title="Add face"
    >
      <UserPlus className="w-4 h-4 text-primary" />
    </button>
  </div>

  <FaceList
  faces={faces}
  onEdit={(face) => {
    setEditingFace(face);
    setShowAddFaceModal(true);
  }}
  onDelete={(face) => {
    setFaces(prev => prev.filter(f => f.id !== face.id));
  }}
/>

</GlassCard>

          </div>
        </div>
      </div>

      <AddFaceModal
  isOpen={showAddFaceModal}
  editingFace={editingFace}
  onClose={() => {
    setShowAddFaceModal(false);
    setEditingFace(null);
  }}
  onAdd={handleAddFace}
/>

    </section>
  );
}
