import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { usePagamentos } from '@/hooks/usePagamentos';

interface RegistrarPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegistrarPagamentoModal = ({ open, onOpenChange }: RegistrarPagamentoModalProps) => {
  const [empresaId, setEmpresaId] = useState('');
  const [planoId, setPlanoId] = useState('');
  const [valor, setValor] = useState('');
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [dataVencimento, setDataVencimento] = useState<Date>();
  const [formaPagamento, setFormaPagamento] = useState('');
  const [status, setStatus] = useState('confirmado');
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { registrarPagamento } = usePagamentos();

  const { data: empresas } = useQuery({
    queryKey: ['empresas-com-plano'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .not('plano_atual_id', 'is', null)
        .order('nome');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: planos } = useQuery({
    queryKey: ['planos-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, preco_mensal')
        .eq('ativo', true)
        .order('preco_mensal');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId || !planoId || !valor || !dataVencimento || !formaPagamento) {
      return;
    }

    registrarPagamento.mutate({
      empresa_id: empresaId,
      plano_id: planoId,
      valor: parseFloat(valor),
      data_pagamento: dataPagamento.toISOString(),
      data_vencimento: dataVencimento.toISOString(),
      forma_pagamento: formaPagamento,
      status,
      comprovante_url: comprovanteUrl || undefined,
      observacoes: observacoes || undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        setEmpresaId('');
        setPlanoId('');
        setValor('');
        setDataPagamento(new Date());
        setDataVencimento(undefined);
        setFormaPagamento('');
        setStatus('confirmado');
        setComprovanteUrl('');
        setObservacoes('');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Select value={empresaId} onValueChange={setEmpresaId} required>
              <SelectTrigger id="empresa">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas?.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano">Plano *</Label>
            <Select value={planoId} onValueChange={(value) => {
              setPlanoId(value);
              const plano = planos?.find(p => p.id === value);
              if (plano) {
                setValor(plano.preco_mensal.toString());
              }
            }} required>
              <SelectTrigger id="plano">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {planos?.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {Number(plano.preco_mensal).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Pago (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Pagamento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataPagamento, 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataPagamento}
                    onSelect={(date) => date && setDataPagamento(date)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dataVencimento && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataVencimento ? (
                      format(dataVencimento, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataVencimento}
                    onSelect={setDataVencimento}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento} required>
              <SelectTrigger id="formaPagamento">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comprovante">URL do Comprovante</Label>
            <Input
              id="comprovante"
              type="url"
              value={comprovanteUrl}
              onChange={(e) => setComprovanteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={registrarPagamento.isPending}>
              {registrarPagamento.isPending ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
