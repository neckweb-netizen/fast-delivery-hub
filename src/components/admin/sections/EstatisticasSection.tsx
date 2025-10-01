
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminStats } from '@/hooks/useAdminData';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const EstatisticasSection = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard / Estatísticas</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Locais', value: stats?.totalEmpresas || 0 },
    { name: 'Usuários', value: stats?.totalUsuarios || 0 },
    { name: 'Eventos', value: stats?.totalEventos || 0 },
    { name: 'Avaliações', value: stats?.totalAvaliacoes || 0 },
    { name: 'Cupons', value: stats?.totalCupons || 0 },
  ];

  const empresasData = [
    { name: 'Verificadas', value: stats?.empresasVerificadas || 0, color: '#22c55e' },
    { name: 'Em Destaque', value: stats?.empresasDestaque || 0, color: '#f59e0b' },
    { name: 'Normais', value: (stats?.totalEmpresas || 0) - (stats?.empresasVerificadas || 0) - (stats?.empresasDestaque || 0), color: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard / Estatísticas</h2>
        <p className="text-muted-foreground">
          Visualize estatísticas detalhadas do sistema
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Locais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={empresasData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {empresasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span>Taxa de Verificação</span>
                  <span className="font-bold">
                    {stats?.totalEmpresas ? 
                      Math.round((stats.empresasVerificadas / stats.totalEmpresas) * 100) : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{
                      width: `${stats?.totalEmpresas ? 
                        Math.round((stats.empresasVerificadas / stats.totalEmpresas) * 100) : 0
                      }%`
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span>Média de Avaliações</span>
                  <span className="font-bold">{stats?.mediaAvaliacoes}/5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{
                      width: `${((parseFloat(stats?.mediaAvaliacoes || '0') / 5) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalAvaliacoes || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avaliações totais
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.totalCupons || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Cupons ativos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span>Usuários Locais</span>
                  <span className="font-bold">
                    {stats?.totalUsuarios ? 
                      Math.round((stats.usuariosEmpresa / stats.totalUsuarios) * 100) : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{
                      width: `${stats?.totalUsuarios ? 
                        Math.round((stats.usuariosEmpresa / stats.totalUsuarios) * 100) : 0
                      }%`
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.totalUsuarios || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de usuários
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
