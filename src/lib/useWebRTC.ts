import { useEffect, useRef } from "react";

export function useWebRTC(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. Initialize PeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    // 2. Setup Video Handling
    pc.addTransceiver("video", { direction: "recvonly" });

    // 🔥 FIXED ONTRACK HANDLER
    pc.ontrack = (event) => {
      console.log("✅ TRACK RECEIVED:", event.track.kind);
      if (videoRef.current) {
        // If streams[0] is missing (common in aiortc), we create one manually.
        if (event.streams && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        } else {
          console.log("🛠️ Creating manual stream for track");
          const stream = new MediaStream();
          stream.addTrack(event.track);
          videoRef.current.srcObject = stream;
        }
      }
    };

    const startConnection = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE to ensure connection
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve();
          } else {
            const checkState = () => {
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", checkState);
                resolve();
              }
            };
            pc.addEventListener("icegatheringstatechange", checkState);
          }
        });

        // Send Offer
        const res = await fetch("/api/webrtc/offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pc.localDescription),
        });

        const answer = await res.json();
        await pc.setRemoteDescription(answer);
        
      } catch (e) {
        console.error("❌ Signaling failed:", e);
      }
    };

    startConnection();

    return () => {
      pc.close();
    };
  }, [enabled]);

  return videoRef;
}