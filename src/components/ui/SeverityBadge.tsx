import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NORMAL";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  pulse?: boolean;
}

const severityConfig: Record<SeverityLevel, { bg: string; text: string; glow: string }> = {
  CRITICAL: {
    bg: "bg-critical",
    text: "text-critical-foreground",
    glow: "shadow-[0_0_15px_hsl(var(--critical)/0.5)]",
  },
  HIGH: {
    bg: "bg-high",
    text: "text-high-foreground",
    glow: "shadow-[0_0_15px_hsl(var(--high)/0.5)]",
  },
  MEDIUM: {
    bg: "bg-medium",
    text: "text-medium-foreground",
    glow: "shadow-[0_0_15px_hsl(var(--medium)/0.5)]",
  },
  LOW: {
    bg: "bg-low",
    text: "text-low-foreground",
    glow: "shadow-[0_0_15px_hsl(var(--low)/0.5)]",
  },
  NORMAL: {
    bg: "bg-normal",
    text: "text-normal-foreground",
    glow: "",
  },
};

export function SeverityBadge({ severity, className, pulse = false }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider",
        config.bg,
        config.text,
        config.glow,
        pulse && severity !== "NORMAL" && "animate-pulse",
        className
      )}
    >
      {severity}
    </motion.span>
  );
}
