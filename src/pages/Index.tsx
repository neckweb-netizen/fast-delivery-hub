import { HeroSection } from "@/components/HeroSection";
import { TrustSection } from "@/components/TrustSection";
import { ProductSection } from "@/components/ProductSection";
import { IncludedSection } from "@/components/IncludedSection";
import { BonusSection } from "@/components/BonusSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { UrgencySection } from "@/components/UrgencySection";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import { UrgencyModal } from "@/components/UrgencyModal";
import { SalesNotifications } from "@/components/SalesNotifications";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustSection />
      <ProductSection />
      <IncludedSection />
      <BonusSection />
      <TestimonialsSection />
      <UrgencySection />
      <GuaranteeSection />
      <Footer />
      <FloatingCTA />
      <UrgencyModal />
      <SalesNotifications />
    </div>
  );
};

export default Index;
