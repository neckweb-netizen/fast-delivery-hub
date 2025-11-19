import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Calendar, CreditCard, CheckCircle, XCircle, Clock, Edit, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarPlanoEmpresaModal } from '../forms/EditarPlanoEmpresaModal';
import { RegistrarPagamentoModal } from '../forms/RegistrarPagamentoModal';

export const EmpresasComPlanos = () => {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  
  const { data: empresasComPlanos, isLoading } = useQuery({
    queryKey: ['empresas-com-planos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          id,
          nome,
          telefone,
          plano_data_vencimento,
          plano_atual_id,
          planos (
            nome,
            preco_mensal
          )
        `)
        .not('plano_atual_id', 'is', null)
        .order('plano_data_vencimento', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getStatusPlano = (dataVencimento: string | null) => {
    if (!dataVencimento) return { label: 'Sem Vencimento', variant: 'secondary' as const, icon: Clock };
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { label: 'Expirado', variant: 'destructive' as const, icon: XCircle };
    } else if (diasRestantes <= 7) {
      return { label: `Expira em ${diasRestantes}d`, variant: 'outline' as const, icon: Clock };
    } else {
      return { label: 'Ativo', variant: 'default' as const, icon: CheckCircle };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresas com Planos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!empresasComPlanos || empresasComPlanos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresas com Planos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma empresa com plano ativo no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas com Planos Ativos ({empresasComPlanos.length})
            </CardTitle>
            <Button onClick={() => setPagamentoModalOpen(true)} size="sm">
              <DollarSign className="w-4 h-4 mr-2" />
              Registrar Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasComPlanos.map((empresa) => {
                const status = getStatusPlano(empresa.plano_data_vencimento);
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={empresa.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{empresa.nome}</p>
                        {empresa.telefone && (
                          <p className="text-sm text-muted-foreground">{empresa.telefone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        {empresa.planos?.nome || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {empresa.planos?.preco_mensal 
                        ? formatarPreco(Number(empresa.planos.preco_mensal))
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {empresa.plano_data_vencimento ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(empresa.plano_data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sem vencimento</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEmpresaSelecionada(empresa.id);
                          setEditModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditarPlanoEmpresaModal
        empresaId={empresaSelecionada}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <RegistrarPagamentoModal
        open={pagamentoModalOpen}
        onOpenChange={setPagamentoModalOpen}
      />
    </>
  );
};
