
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, AlertTriangle, Shield } from 'lucide-react';

export const AuditLogsSection = () => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      const userIds = [...new Set([
        ...logs?.map(log => log.changed_by).filter(Boolean) || [],
        ...logs?.map(log => log.record_id).filter(Boolean) || []
      ])];

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome')
        .in('id', userIds as string[]);

      const userMap = (usuarios || []).reduce((acc: any, user: any) => {
        acc[user.id] = user.nome;
        return acc;
      }, {});

      return (logs || []).map(log => ({
        ...log,
        usuario_nome: userMap[log.changed_by as string] || 'Sistema',
        target_usuario_nome: userMap[log.record_id as string] || log.record_id || 'N/A',
      }));
    },
  });

  const formatRoleChange = (oldData: any, newData: any) => {
    if (!oldData && !newData) return '';
    const oldRole = typeof oldData === 'object' ? JSON.stringify(oldData) : '';
    const newRole = typeof newData === 'object' ? JSON.stringify(newData) : '';
    if (oldRole && newRole) return `${oldRole} → ${newRole}`;
    return newRole || oldRole;
  };

  const getActionBadge = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'update':
      case 'atualização':
        return { variant: 'default' as const, label: 'Atualização', icon: AlertTriangle };
      case 'insert':
      case 'criação':
        return { variant: 'secondary' as const, label: 'Criação', icon: Shield };
      case 'delete':
      case 'exclusão':
        return { variant: 'destructive' as const, label: 'Exclusão', icon: AlertTriangle };
      default:
        return { variant: 'outline' as const, label: action || 'Ação', icon: Shield };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h2>
        <p className="text-muted-foreground">
          Histórico de alterações no sistema
        </p>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {auditLogs?.map((log: any) => {
            const badgeInfo = getActionBadge(log.action);
            const IconComponent = badgeInfo.icon;
            
            return (
              <Card key={log.id} className="bg-white border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeInfo.variant} className="flex items-center gap-1">
                          <IconComponent className="w-3 h-3" />
                          {badgeInfo.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatRoleChange(log.old_data, log.new_data)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-blue-700">
                            <User className="w-4 h-4" />
                            <strong>Alterado por:</strong> {log.usuario_nome}
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <strong>Registro:</strong> {log.target_usuario_nome}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <strong>Data:</strong> {new Date(log.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tabela: {log.table_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {(!auditLogs || auditLogs.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum log de auditoria encontrado.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
