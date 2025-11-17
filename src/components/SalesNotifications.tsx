import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const notifications = [
  { name: "Maria S.", location: "São Paulo, SP", time: "há 2 minutos" },
  { name: "João P.", location: "Rio de Janeiro, RJ", time: "há 5 minutos" },
  { name: "Ana C.", location: "Belo Horizonte, MG", time: "há 8 minutos" },
  { name: "Pedro M.", location: "Curitiba, PR", time: "há 12 minutos" },
];

export const SalesNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentNotification((prev) => (prev + 1) % notifications.length);
        }, 500);
      }, 5000);
    };

    // Primeira notificação após 10 segundos
    const initialTimer = setTimeout(showNotification, 10000);
    
    // Notificações subsequentes a cada 20 segundos
    const interval = setInterval(showNotification, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const notification = notifications[currentNotification];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-4 duration-500">
      <Card className="p-4 bg-card border-2 border-primary/20 shadow-xl max-w-xs">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {notification.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {notification.location}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Acabou de se cadastrar {notification.time}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
