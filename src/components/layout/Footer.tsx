import { Shield, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg gradient-text">SENTRY</span>
            </a>
            <p className="text-sm text-muted-foreground max-w-md">
              Advanced AI-powered surveillance system with real-time violence detection, 
              facial recognition, and intelligent pose analysis for comprehensive security monitoring.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">System</h4>
            <ul className="space-y-2">
              <li>
                <a href="#dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
          
          {/* Status */}
          <div>
            <h4 className="font-semibold mb-4">Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                v1.0.0 • PyTorch • ONNX Runtime
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Sentry AI Security. Built with advanced AI models.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
