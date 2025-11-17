import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const ProductSection = () => {
  const features = [
    "Entrega super rápida em até 30 minutos",
    "Rastreamento em tempo real do seu pedido",
    "Garantia de qualidade e frescor",
    "Suporte ao cliente 24/7",
    "Sistema de pagamento seguro",
    "Programa de fidelidade e recompensas",
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por Que Escolher Nosso Delivery?
            </h2>
            <p className="text-muted-foreground text-lg">
              Oferecemos a melhor experiência de entrega da região
            </p>
          </div>
          
          <Card className="p-8 md:p-12 bg-card">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-1 mt-1">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
