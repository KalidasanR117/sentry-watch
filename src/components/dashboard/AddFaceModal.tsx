import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  X, 
  Upload, 
  Camera, 
  User, 
  Shield, 
  Ban,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";

interface AddFaceModalProps {
  isOpen: boolean;
  editingFace?: {
    id: string;
    name: string;
    status: "whitelist" | "blacklist";
    imageUrl?: string;
  } | null;
  onClose: () => void;
  onAdd: (face: {
    name: string;
    status: "whitelist" | "blacklist";
    imageUrl?: string;
  }) => void;
}


export function AddFaceModal({
  isOpen,
  editingFace,
  onClose,
  onAdd,
}: AddFaceModalProps) {

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"whitelist" | "blacklist">("whitelist");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(videoRef.current, 0, 0);
  setImagePreview(canvas.toDataURL("image/jpeg"));

  stopCapture();
};

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

const handleSubmit = async () => {
  if (!name.trim()) return;

  // 🔥 EDIT MODE: no image upload
  if (editingFace) {
    onAdd({
      name: name.trim(),
      status,
      imageUrl: editingFace.imageUrl,
    });

    resetForm();
    onClose();
    return;
  }

  // 🔥 ADD MODE: image required
  if (!imagePreview) return;

  const blob = await fetch(imagePreview).then(r => r.blob());

  const formData = new FormData();
  formData.append("name", name.trim());
  formData.append("status", status);
  formData.append("image", blob, "face.jpg");

  await fetch("/api/faces/add", {
    method: "POST",
    body: formData,
  });

  onAdd({
    name: name.trim(),
    status,
    imageUrl: imagePreview,
  });

  resetForm();
  onClose();
};

  const resetForm = () => {
    setName("");
    setStatus("whitelist");
    setImagePreview(null);
    stopCapture();
  };

  const handleClose = () => {
    stopCapture();
    onClose();
  };
const startCapture = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    streamRef.current = stream;
    setIsCapturing(true); // 🔥 trigger render
  } catch (err) {
    console.error("Camera access failed:", err);
  }
};
useEffect(() => {
  if (!isCapturing) return;
  if (!videoRef.current) return;
  if (!streamRef.current) return;

  const video = videoRef.current;

  video.srcObject = streamRef.current;
  video.onloadedmetadata = () => {
    video.play();
  };

  return () => {
    video.srcObject = null;
  };
}, [isCapturing]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!isCapturing) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card p-6 rounded-xl border border-primary/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {editingFace ? "Edit Face Entry" : "Add to Face Database"}
              </h3>
              <button
                onClick={() => {
                            if (!isCapturing) handleClose();
                          }}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Image Upload/Capture */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Face Image
                </label>
                
                {isCapturing ? (
  <div className="space-y-3">
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg object-cover"
        playsInline
        muted
        autoPlay
      />
    </div>

    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={capturePhoto}
        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        Capture
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={stopCapture}
        className="px-4 py-2 bg-secondary rounded-lg"
      >
        Cancel
      </motion.button>
    </div>
  </div>
)
: imagePreview ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => fileInputRef.current?.click()}
    className="flex-1 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
  >
    <Upload className="w-6 h-6 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Upload</span>
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={startCapture}
    className="flex-1 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
  >
    <Camera className="w-6 h-6 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Capture</span>
  </motion.button>
</div>

                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Name Input */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  List Status
                </label>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStatus("whitelist")}
                    className={cn(
                      "flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      status === "whitelist"
                        ? "border-low bg-low/10 text-low"
                        : "border-border text-muted-foreground hover:border-low/50"
                    )}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Whitelist</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStatus("blacklist")}
                    className={cn(
                      "flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      status === "blacklist"
                        ? "border-critical bg-critical/10 text-critical"
                        : "border-border text-muted-foreground hover:border-critical/50"
                    )}
                  >
                    <Ban className="w-5 h-5" />
                    <span className="font-medium">Blacklist</span>
                  </motion.button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!name.trim()}
                className={cn(
                  "w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
                  name.trim()
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-5 h-5" />
                {editingFace ? "Save Changes" : "Add to Database"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
