import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Entrega Rápida,
            <span className="text-primary block">Sempre no Prazo</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            O sistema de delivery mais rápido e confiável da região. 
            Faça seu pedido agora e receba em minutos!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" className="text-lg px-8 py-6">
              Começar Agora <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Ver Como Funciona
            </Button>
          </div>
          
          <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Entrega em 30min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Garantia de Qualidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <span>Bônus Exclusivos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
