import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative bg-card border-2 border-primary shadow-2xl rounded-lg p-4 max-w-sm">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-background border rounded-full p-1 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            🎁 Oferta Especial Ativa!
          </p>
          <p className="text-xs text-muted-foreground">
            Cadastre-se agora e ganhe R$ 20 OFF + frete grátis
          </p>
          <Button className="w-full" size="sm">
            Aproveitar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};
