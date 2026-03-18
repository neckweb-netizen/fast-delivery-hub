
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NeonCard } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Briefcase, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCidadePadrao } from '@/hooks/useCidadePadrao';

export const LatestJobCoupons = () => {
  const navigate = useNavigate();
  const { data: cidadePadrao } = useCidadePadrao();

  const { data: vagasEmprego, isLoading } = useQuery({
    queryKey: ['latest-job-coupons', cidadePadrao?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregando vagas...</p>
        </CardContent>
      );
    }

    if (!vagasEmprego || vagasEmprego.length === 0) {
      return (
        <CardContent className="text-center py-8 space-y-4">
          <div className="text-4xl">💼</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Nenhuma vaga disponível</h3>
            <p className="text-muted-foreground text-sm">
              Fique atento! Em breve teremos oportunidades para você.
            </p>
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
        {vagasEmprego.map((vaga) => (
          <Card key={vaga.id} className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-bold text-sm sm:text-base truncate">{vaga.titulo}</h3>
                      {vaga.local && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">
                            {vaga.local}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {vaga.salario && (
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        {vaga.salario}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Publicada em {new Date(vaga.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px bg-border mx-2 my-3"></div>
                
                <div className="w-full sm:w-28 lg:w-32 p-3 sm:p-4 text-center space-y-2 bg-gradient-to-b from-blue-100 to-indigo-100 border-t sm:border-t-0 sm:border-l border-border/20">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-medium">
                      {vaga.tipo_contrato || 'CLT'}
                    </div>
                  </div>
                  
                  {vaga.remoto && (
                    <div className="bg-muted/50 px-2 py-1 rounded text-xs">
                      Remoto
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
      <NeonCard className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl">💼</div>
              <CardTitle className="text-base sm:text-lg">Últimas Vagas</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/oportunidades/vagas')}
              className="text-primary hover:text-primary/80 text-xs sm:text-sm"
            >
              Ver todas
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        {renderContent()}
      </NeonCard>
    </section>
  );
};
