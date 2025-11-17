import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Cliente desde 2023",
      content: "Melhor serviço de delivery que já usei! Sempre rápido e com produtos frescos. Recomendo demais!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Cliente VIP",
      content: "A entrega é realmente rápida e o atendimento é excelente. Virou meu delivery preferido!",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Cliente desde 2022",
      content: "Uso quase todos os dias e nunca tive problemas. A qualidade é sempre impecável!",
      rating: 5
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground text-lg">
            Avaliação média de 4.9/5 estrelas
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
