import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, CreditCard, Clock } from 'lucide-react';

interface AssignPlanoManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AssignPlanoManualModal = ({ open, onOpenChange, onSuccess }: AssignPlanoManualModalProps) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPlano, setSelectedPlano] = useState<string>('');
  const [dias, setDias] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: empresas } = useQuery({
    queryKey: ['empresas-para-plano'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, usuario_id')
        .eq('ativo', true);

      if (error) throw error;

      // Fetch user info separately
      const userIds = [...new Set((data || []).map(e => e.usuario_id).filter(Boolean))];
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, email')
        .in('id', userIds as string[]);

      const userMap = (usuarios || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {});

      return (data || []).map(e => ({
        ...e,
        usuario: userMap[e.usuario_id as string] || null
      }));
    },
    enabled: open,
  });

  const { data: planos } = useQuery({
    queryKey: ['planos-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco_mensal', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedPlano) {
      toast({ title: 'Selecione um local e um plano', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const dataInicio = new Date();
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + parseInt(dias));

      const { error } = await supabase
        .from('empresas')
        .update({
          plano_atual_id: selectedPlano,
          plano_data_inicio: dataInicio.toISOString(),
          plano_data_vencimento: dataVencimento.toISOString(),
        })
        .eq('id', selectedUser);

      if (error) throw error;

      toast({ title: 'Plano atribuído com sucesso!' });
      onSuccess?.();
      onOpenChange(false);
      setSelectedUser('');
      setSelectedPlano('');
      setDias('30');
    } catch (error) {
      toast({ title: 'Erro ao atribuir plano', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Atribuir Plano Manualmente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="usuario" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Local/Usuário
            </Label>
            <Input
              placeholder="Pesquisar local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um local" />
              </SelectTrigger>
              <SelectContent>
                {empresas
                  ?.filter((item: any) => 
                    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome} - {item.usuario?.nome || 'Sem usuário'} ({item.usuario?.email || 'Sem email'})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Plano
            </Label>
            <Select value={selectedPlano} onValueChange={setSelectedPlano}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos?.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {plano.preco_mensal}/mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dias" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duração (dias)
            </Label>
            <Input
              id="dias"
              type="number"
              min="1"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Atribuindo...' : 'Atribuir Plano'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
