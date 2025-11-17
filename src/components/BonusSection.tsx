import { Card } from "@/components/ui/card";
import { Gift, Zap, Crown } from "lucide-react";

export const BonusSection = () => {
  const bonuses = [
    {
      icon: Gift,
      title: "Cupom de R$ 20 OFF",
      description: "Na sua primeira compra acima de R$ 50",
      highlight: "Bônus #1"
    },
    {
      icon: Zap,
      title: "Entrega Grátis por 30 Dias",
      description: "Aproveite frete grátis em todos os pedidos",
      highlight: "Bônus #2"
    },
    {
      icon: Crown,
      title: "Acesso VIP Premium",
      description: "Promoções exclusivas e prioridade no atendimento",
      highlight: "Bônus #3"
    },
  ];

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold mb-4">
            🎁 BÔNUS EXCLUSIVOS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cadastre-se Hoje e Ganhe
          </h2>
          <p className="text-muted-foreground text-lg">
            Benefícios especiais para novos clientes
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bonuses.map((bonus, index) => {
            const Icon = bonus.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-bl-lg">
                  {bonus.highlight}
                </div>
                <div className="p-6 pt-12">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {bonus.title}
                  </h3>
                  <p className="text-muted-foreground">{bonus.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
