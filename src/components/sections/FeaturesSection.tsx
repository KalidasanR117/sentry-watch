import { motion } from "framer-motion";
import { 
  Shield, 
  Eye, 
  Brain, 
  Camera, 
  FileText, 
  Users,
  Zap,
  Lock
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Violence Detection",
    description: "Real-time fight and violence detection using VideoMAE transformer models with 99%+ accuracy.",
    color: "text-critical",
    bgColor: "bg-critical/10",
  },
  {
    icon: Users,
    title: "Face Recognition",
    description: "SCRFD face detection with ArcFace embeddings for whitelist/blacklist management.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Brain,
    title: "Pose Analysis",
    description: "Rule-based pose detection engine for identifying suspicious behaviors and gestures.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Camera,
    title: "Multi-Camera",
    description: "Intelligent camera rotation with severity-based prioritization and scheduling.",
    color: "text-medium",
    bgColor: "bg-medium/10",
  },
  {
    icon: Zap,
    title: "Real-time Alerts",
    description: "Instant severity-graded notifications with CRITICAL, HIGH, MEDIUM, LOW levels.",
    color: "text-high",
    bgColor: "bg-high/10",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description: "Automated incident reports with LLM-generated summaries and event timelines.",
    color: "text-low",
    bgColor: "bg-low/10",
  },
  {
    icon: Shield,
    title: "Event Management",
    description: "Comprehensive event tracking with screenshots, timestamps, and cause analysis.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Lock,
    title: "Secure System",
    description: "Enterprise-grade security with encrypted face databases and access controls.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Powerful</span> Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            State-of-the-art AI models combined with intelligent rule engines for comprehensive security monitoring.
          </p>
        </motion.div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-xl p-6 group cursor-pointer hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
