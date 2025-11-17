import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Shield, Star } from "lucide-react";

export const IncludedSection = () => {
  const included = [
    {
      icon: Package,
      title: "Embalagem Premium",
      description: "Seus pedidos chegam em embalagens de qualidade, mantendo tudo fresco e seguro"
    },
    {
      icon: Truck,
      title: "Entrega Express",
      description: "Sistema de roteamento inteligente para entregas mais rápidas"
    },
    {
      icon: Shield,
      title: "Garantia Total",
      description: "100% de garantia de satisfação ou seu dinheiro de volta"
    },
    {
      icon: Star,
      title: "Atendimento VIP",
      description: "Suporte prioritário e benefícios exclusivos para você"
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Está Incluído?
          </h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa para uma experiência perfeita
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {included.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
