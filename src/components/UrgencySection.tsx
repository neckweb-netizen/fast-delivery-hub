import { Button } from "@/components/ui/button";
import { Clock, TrendingUp } from "lucide-react";

export const UrgencySection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full font-semibold mb-6 animate-pulse">
            <Clock className="w-5 h-5" />
            <span>PROMOÇÃO LIMITADA</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Não Perca Esta Oportunidade!
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Cadastre-se agora e aproveite todos os bônus exclusivos. 
            Apenas <span className="text-primary font-bold">47 vagas</span> restantes hoje!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" className="text-lg px-10 py-6 animate-pulse">
              Garantir Minha Vaga Agora
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>326 pessoas cadastradas nas últimas 24 horas</span>
          </div>
        </div>
      </div>
    </section>
  );
};
