import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Briefcase, Users } from 'lucide-react';
import { useAdminCategoriasOportunidades, CategoriaOportunidade } from '@/hooks/useAdminCategoriasOportunidades';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminCategoriasOportunidades() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaOportunidade | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'vaga',
    ativo: true
  });

  const {
    categorias = [],
    isLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleAtivo
  } = useAdminCategoriasOportunidades();

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'vaga',
      ativo: true
    });
  };

  const handleCreate = () => {
    createCategoria.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEdit = (categoria: CategoriaOportunidade) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      ativo: categoria.ativo
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCategoria) return;
    
    updateCategoria.mutate(
      { id: editingCategoria.id, ...formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingCategoria(null);
          resetForm();
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCategoria.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      }
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'vaga': 'Vaga de Emprego',
      'servico': 'Serviço Autônomo'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'vaga': 'bg-blue-500',
      'servico': 'bg-green-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  const categoriasFiltradas = filtroTipo === 'todos' 
    ? categorias 
    : categorias.filter(c => c.tipo === filtroTipo);

  const vagasCount = categorias.filter(c => c.tipo === 'vaga').length;
  const servicosCount = categorias.filter(c => c.tipo === 'servico').length;

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias de Oportunidades</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as categorias de vagas de emprego e serviços autônomos
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nome">Nome da Categoria</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Tecnologia, Saúde, Educação..."
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaga">Vaga de Emprego</SelectItem>
                    <SelectItem value="servico">Serviço Autônomo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Categoria ativa</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!formData.nome.trim()}>
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filtroTipo === 'todos' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFiltroTipo('todos')}
            >
              Todas ({categorias.length})
            </Badge>
            <Badge
              variant={filtroTipo === 'vaga' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFiltroTipo('vaga')}
            >
              <Briefcase className="w-3 h-3 mr-1" />
              Vagas ({vagasCount})
            </Badge>
            <Badge
              variant={filtroTipo === 'servico' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFiltroTipo('servico')}
            >
              <Users className="w-3 h-3 mr-1" />
              Serviços ({servicosCount})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriasFiltradas.map((categoria) => (
          <Card key={categoria.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getTipoColor(categoria.tipo)}>
                      {getTipoLabel(categoria.tipo)}
                    </Badge>
                    <Badge variant={categoria.ativo ? 'default' : 'secondary'}>
                      {categoria.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Switch
                  checked={categoria.ativo}
                  onCheckedChange={(checked) => 
                    toggleAtivo.mutate({ id: categoria.id, ativo: checked })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {categoria.ativo ? 'Desativar' : 'Ativar'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(categoria)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm(categoria.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma categoria encontrada
          </CardContent>
        </Card>
      )}

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-nome">Nome da Categoria</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaga">Vaga de Emprego</SelectItem>
                  <SelectItem value="servico">Serviço Autônomo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="edit-ativo">Categoria ativa</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.nome.trim()}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
