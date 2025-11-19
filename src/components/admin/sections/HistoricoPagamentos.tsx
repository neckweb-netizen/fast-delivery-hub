import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Calendar, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePagamentos } from '@/hooks/usePagamentos';

export const HistoricoPagamentos = () => {
  const { pagamentos, isLoading } = usePagamentos();

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: { variant: 'outline' as const, label: 'Pendente' },
      confirmado: { variant: 'default' as const, label: 'Confirmado' },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado' },
    };
    return badges[status as keyof typeof badges] || badges.pendente;
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const formas: Record<string, string> = {
      pix: 'PIX',
      boleto: 'Boleto',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      transferencia: 'Transferência',
      dinheiro: 'Dinheiro',
    };
    return formas[forma] || forma;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Histórico de Pagamentos
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

  if (!pagamentos || pagamentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum pagamento registrado no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Histórico de Pagamentos ({pagamentos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comprovante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagamentos.map((pagamento: any) => {
              const statusBadge = getStatusBadge(pagamento.status);
              
              return (
                <TableRow key={pagamento.id}>
                  <TableCell>
                    <p className="font-medium">{pagamento.empresas?.nome || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    {pagamento.planos?.nome || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatarPreco(Number(pagamento.valor))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getFormaPagamentoLabel(pagamento.forma_pagamento)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pagamento.comprovante_url ? (
                      <a
                        href={pagamento.comprovante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
