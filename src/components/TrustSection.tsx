export const TrustSection = () => {
  const stats = [
    { number: "50K+", label: "Clientes Satisfeitos" },
    { number: "98%", label: "Taxa de Satisfação" },
    { number: "30min", label: "Tempo Médio de Entrega" },
    { number: "24/7", label: "Suporte Disponível" },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Confiança e Qualidade
          </h2>
          <p className="text-muted-foreground text-lg">
            Milhares de clientes confiam em nosso serviço todos os dias
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
