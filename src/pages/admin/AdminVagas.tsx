import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Briefcase, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminVagas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: vagas, isLoading } = useQuery({
    queryKey: ['admin-vagas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (vaga: any) => {
      const { error } = await supabase.from('vagas').insert([vaga]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vagas'] });
      toast.success('Vaga criada!');
      setIsDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('vagas').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vagas'] });
      toast.success('Vaga atualizada!');
      setIsDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vagas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vagas'] });
      toast.success('Vaga excluída!');
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const vaga = {
      titulo: fd.get('titulo') as string,
      descricao: fd.get('descricao') as string || null,
      requisitos: fd.get('requisitos') as string || null,
      salario: fd.get('salario') as string || null,
      tipo_contrato: fd.get('tipo_contrato') as string || null,
      local: fd.get('local') as string || null,
      ativo: fd.get('ativo') === 'true',
    };
    if (editingVaga) {
      updateMutation.mutate({ id: editingVaga.id, ...vaga });
    } else {
      createMutation.mutate(vaga);
    }
  };

  if (isLoading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vagas de Emprego</h1>
          <p className="text-muted-foreground">Gerencie as vagas disponíveis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVaga(null)}><Plus className="h-4 w-4 mr-2" /> Nova Vaga</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVaga ? 'Editar Vaga' : 'Nova Vaga'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Título</Label><Input name="titulo" defaultValue={editingVaga?.titulo} required /></div>
              <div><Label>Descrição</Label><Textarea name="descricao" defaultValue={editingVaga?.descricao || ''} rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Salário</Label><Input name="salario" defaultValue={editingVaga?.salario || ''} placeholder="Ex: R$ 2.500" /></div>
                <div><Label>Local</Label><Input name="local" defaultValue={editingVaga?.local || ''} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo Contrato</Label>
                  <Select name="tipo_contrato" defaultValue={editingVaga?.tipo_contrato || 'clt'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="temporario">Temporário</SelectItem>
                      <SelectItem value="estagio">Estágio</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Status</Label>
                  <Select name="ativo" defaultValue={editingVaga?.ativo !== false ? 'true' : 'false'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativa</SelectItem>
                      <SelectItem value="false">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Requisitos</Label><Textarea name="requisitos" defaultValue={editingVaga?.requisitos || ''} rows={3} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingVaga ? 'Atualizar' : 'Criar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {vagas?.map((vaga) => (
          <Card key={vaga.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> {vaga.titulo}</CardTitle>
                  <div className="flex gap-2">
                    {vaga.tipo_contrato && <Badge variant="outline">{vaga.tipo_contrato}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={vaga.ativo ? "default" : "secondary"}>{vaga.ativo ? "Ativa" : "Inativa"}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingVaga(vaga); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(vaga.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{vaga.descricao}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {vaga.salario && <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {vaga.salario}</div>}
                {vaga.local && <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {vaga.local}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!vagas || vagas.length === 0) && (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma vaga encontrada</h3>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
