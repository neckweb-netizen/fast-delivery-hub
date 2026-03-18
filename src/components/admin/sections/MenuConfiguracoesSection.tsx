
import { useState } from 'react';
import { useMenuConfiguracoes } from '@/hooks/useMenuConfiguracoes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MenuConfiguracoesSection = () => {
  const { configuracoes, isLoading, updateConfiguracao, isUpdating } = useMenuConfiguracoes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEdit = (config: any) => {
    setEditingId(config.id);
    setEditForm({
      ativo: config.ativo,
      config: config.config,
    });
  };

  const handleSave = () => {
    if (editingId && editForm) {
      updateConfiguracao({ id: editingId, updates: editForm });
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Menu</h2>
        <p className="text-muted-foreground">
          Configure os itens do menu do sistema
        </p>
      </div>

      <div className="grid gap-4">
        {configuracoes.map((config: any) => {
          const isEditing = editingId === config.id;
          
          return (
            <Card key={config.id} className={cn(
              "transition-all duration-200",
              isEditing && "ring-2 ring-primary"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {config.nome}
                    <Badge variant={config.ativo ? "default" : "secondary"}>
                      {config.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isUpdating}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(config)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editForm.ativo ?? false}
                        onCheckedChange={(checked) => 
                          setEditForm((prev: any) => ({ ...prev, ativo: checked }))
                        }
                        id={`ativo-${config.id}`}
                      />
                      <label htmlFor={`ativo-${config.id}`} className="text-sm">
                        Ativo
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
