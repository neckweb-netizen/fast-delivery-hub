import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, ThumbsUp } from "lucide-react";

export const GuaranteeSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-card border-2 border-primary/20">
            <div className="text-center mb-8">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Garantia de 30 Dias
              </h2>
              <p className="text-lg text-muted-foreground">
                Se você não ficar 100% satisfeito com nosso serviço, 
                devolvemos seu dinheiro sem perguntas.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">30 Dias</h3>
                <p className="text-sm text-muted-foreground">Para testar sem riscos</p>
              </div>
              <div className="text-center">
                <ThumbsUp className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Sem Complicação</h3>
                <p className="text-sm text-muted-foreground">Processo simples e rápido</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">100% Garantido</h3>
                <p className="text-sm text-muted-foreground">Seu investimento protegido</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button size="lg" className="text-lg px-10 py-6">
                Começar Agora Sem Riscos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
