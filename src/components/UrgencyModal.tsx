import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const UrgencyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos

  useEffect(() => {
    // Mostrar modal após 30 segundos
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            ⚡ Oferta Relâmpago!
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            Aproveite agora! Esta oferta expira em:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-6">
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <div className="text-4xl font-bold text-primary">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground mt-2">minutos restantes</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
            Garantir Minha Oferta
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => setIsOpen(false)}
          >
            Talvez Depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
