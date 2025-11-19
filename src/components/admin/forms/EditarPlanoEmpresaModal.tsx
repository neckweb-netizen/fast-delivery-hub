import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
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

interface EditarPlanoEmpresaModalProps {
  empresaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditarPlanoEmpresaModal = ({ empresaId, open, onOpenChange }: EditarPlanoEmpresaModalProps) => {
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: empresa } = useQuery({
    queryKey: ['empresa-plano', empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, plano_atual_id, plano_data_vencimento')
        .eq('id', empresaId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId && open,
  });

  const { data: planos } = useQuery({
    queryKey: ['planos-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, preco_mensal')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  useEffect(() => {
    if (empresa) {
      setPlanoSelecionado(empresa.plano_atual_id || '');
      if (empresa.plano_data_vencimento) {
        setDataVencimento(new Date(empresa.plano_data_vencimento));
      }
    }
  }, [empresa]);

  const atualizarPlanoMutation = useMutation({
    mutationFn: async () => {
      if (!empresaId) throw new Error('Empresa não selecionada');

      const { error } = await supabase
        .from('empresas')
        .update({
          plano_atual_id: planoSelecionado || null,
          plano_data_vencimento: dataVencimento?.toISOString() || null,
        })
        .eq('id', empresaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-com-planos'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-plano', empresaId] });
      toast({
        title: 'Plano atualizado',
        description: 'As informações do plano foram atualizadas com sucesso.',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o plano da empresa.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPlanoMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Plano da Empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input value={empresa?.nome || ''} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select value={planoSelecionado} onValueChange={setPlanoSelecionado}>
              <SelectTrigger id="plano">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem Plano</SelectItem>
                {planos?.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {Number(plano.preco_mensal).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de Vencimento</Label>
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
                    <span>Selecione uma data</span>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={atualizarPlanoMutation.isPending}>
              {atualizarPlanoMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
