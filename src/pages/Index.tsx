import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { DashboardSection } from "@/components/sections/DashboardSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-16">
        <HeroSection />
        <DashboardSection />
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
