import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  variant?: "default" | "critical" | "warning" | "success";
}

const variantStyles = {
  default: "border-border",
  critical: "border-critical/40 bg-critical/5",
  warning: "border-medium/40 bg-medium/5",
  success: "border-low/40 bg-low/5",
};

const iconVariantStyles = {
  default: "text-primary bg-primary/10",
  critical: "text-critical bg-critical/10",
  warning: "text-medium bg-medium/10",
  success: "text-low bg-low/10",
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  className,
  variant = "default" 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card rounded-xl p-5 border",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-lg",
          iconVariantStyles[variant]
        )}>
          {icon}
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-mono",
            trend === "up" && "text-critical",
            trend === "down" && "text-low",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "neutral" && <Minus className="w-3 h-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold font-mono gradient-text">{value}</p>
      </div>
    </motion.div>
  );
}
