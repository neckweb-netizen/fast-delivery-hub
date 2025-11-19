
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Building2, Package, Calendar, Ticket, Star, Clock, MessageSquare, Briefcase, TrendingUp, Award, Target, Map, Layers, Heart, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminEstatisticas = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Estatísticas</h2>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const resumoCards = [
    { title: 'Total Usuários', value: stats.resumo.totalUsuarios, icon: Users, color: 'text-blue-600', change: '+12%' },
    { title: 'Total Empresas', value: stats.resumo.totalEmpresas, icon: Building2, color: 'text-green-600', change: '+8%' },
    { title: 'Total Produtos', value: stats.resumo.totalProdutos, icon: Package, color: 'text-purple-600', change: '+15%' },
    { title: 'Total Eventos', value: stats.resumo.totalEventos, icon: Calendar, color: 'text-orange-600', change: '+5%' },
    { title: 'Total Cupons', value: stats.resumo.totalCupons, icon: Ticket, color: 'text-pink-600', change: '+10%' },
    { title: 'Total Avaliações', value: stats.resumo.totalAvaliacoes, icon: Star, color: 'text-yellow-600', change: '+20%' },
    { title: 'Total Agendamentos', value: stats.resumo.totalAgendamentos, icon: Clock, color: 'text-indigo-600', change: '+18%' },
    { title: 'Voz do Povo', value: stats.resumo.totalProblemas, icon: MessageSquare, color: 'text-red-600', change: '+25%' },
  ];

  const usuariosPorTipoData = Object.entries(stats.usuarios.porTipo || {}).map(([tipo, count]) => ({
    name: tipo.replace('_', ' '),
    value: count as number,
  }));

  const distribuicaoNotasData = Object.entries(stats.avaliacoes.distribuicaoNotas || {}).map(([nota, count]) => ({
    nota: `${nota} estrelas`,
    quantidade: count as number,
  }));

  const distribuicaoNiveisData = Object.entries(stats.usuarios.distribuicaoNiveis || {}).map(([nivel, count]) => ({
    nivel: `Nível ${nivel}`,
    usuarios: count as number,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Estatísticas Completas</h2>
        <p className="text-muted-foreground">
          Análise detalhada de todos os dados do sistema para marketing e tomada de decisões
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resumoCards.map((card, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{card.change}</span> vs mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
          <TabsTrigger value="gamificacao">Gamificação</TabsTrigger>
          <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
        </TabsList>

        {/* Tab Geral */}
        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Usuários por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usuariosPorTipoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usuariosPorTipoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status de Empresas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Aprovadas</span>
                    <span className="text-sm text-muted-foreground">{stats.empresas.aprovadas}</span>
                  </div>
                  <Progress value={stats.empresas.taxaAprovacao} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.empresas.taxaAprovacao.toFixed(1)}% do total</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Verificadas</span>
                    <span className="text-sm text-muted-foreground">{stats.empresas.verificadas}</span>
                  </div>
                  <Progress value={stats.empresas.taxaVerificacao} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stats.empresas.taxaVerificacao.toFixed(1)}% do total</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Com Plano Ativo</span>
                    <span className="text-sm text-muted-foreground">{stats.empresas.comPlanoAtivo}</span>
                  </div>
                  <Progress value={(stats.empresas.comPlanoAtivo / stats.empresas.total) * 100} className="h-2" />
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    Receita estimada: R$ {stats.empresas.receitaEstimadaMensal.toLocaleString('pt-BR')}/mês
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Cupons</span>
                    <span className="font-semibold">{stats.cupons.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cupons Ativos</span>
                    <span className="font-semibold">{stats.cupons.ativos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilizados</span>
                    <span className="font-semibold">{stats.cupons.utilizados}</span>
                  </div>
                  <div className="mt-3">
                    <Progress value={stats.cupons.taxaUtilizacao} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Taxa de utilização: {stats.cupons.taxaUtilizacao.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <span className="font-semibold">{stats.avaliacoes.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Média Geral</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {stats.avaliacoes.mediaGeral.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Média por Empresa</span>
                    <span className="font-semibold">{stats.avaliacoes.mediaPorEmpresa.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="font-semibold">{stats.agendamentos.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pendentes</span>
                    <span className="font-semibold text-yellow-600">{stats.agendamentos.pendentes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Concluídos</span>
                    <span className="font-semibold text-green-600">{stats.agendamentos.concluidos}</span>
                  </div>
                  <div className="mt-3">
                    <Progress value={stats.agendamentos.taxaConclusao} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Taxa de conclusão: {stats.agendamentos.taxaConclusao.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
                <CardDescription>Engajamento por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Hoje</span>
                      <span className="text-sm font-semibold">{stats.usuarios.ativosHoje}</span>
                    </div>
                    <Progress value={(stats.usuarios.ativosHoje / stats.usuarios.total) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Esta Semana</span>
                      <span className="text-sm font-semibold">{stats.usuarios.ativosSemana}</span>
                    </div>
                    <Progress value={(stats.usuarios.ativosSemana / stats.usuarios.total) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Este Mês</span>
                      <span className="text-sm font-semibold">{stats.usuarios.ativosMes}</span>
                    </div>
                    <Progress value={(stats.usuarios.ativosMes / stats.usuarios.total) * 100} />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Taxa de Engajamento Mensal: <span className="font-semibold text-foreground">{stats.usuarios.taxaEngajamento.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Níveis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribuicaoNiveisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nivel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usuarios" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Empresas */}
        <TabsContent value="empresas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Empresas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.empresas.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.empresas.aprovadas}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.empresas.pendentes}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Verificadas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.empresas.verificadas}</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Média de Produtos por Empresa</span>
                    <span className="font-semibold">{stats.produtos.mediaPorEmpresa.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Média de Avaliações por Empresa</span>
                    <span className="font-semibold">{stats.avaliacoes.mediaPorEmpresa.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita e Planos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Empresas com Plano Ativo</p>
                  <p className="text-3xl font-bold">{stats.empresas.comPlanoAtivo}</p>
                  <Progress value={(stats.empresas.comPlanoAtivo / stats.empresas.total) * 100} className="mt-2" />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Receita Estimada Mensal</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {stats.empresas.receitaEstimadaMensal.toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.produtos.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.produtos.ativos}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.produtos.destaque}</p>
                  <p className="text-sm text-muted-foreground">Em Destaque</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Engajamento */}
        <TabsContent value="engajamento" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Voz do Povo</CardTitle>
                <CardDescription>Estatísticas de problemas reportados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reportado</p>
                    <p className="text-2xl font-bold">{stats.vozDoPovo.totalProblemas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resolvidos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.vozDoPovo.resolvidos}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Taxa de Resolução</p>
                  <Progress value={stats.vozDoPovo.taxaResolucao} />
                  <p className="text-xs text-muted-foreground mt-1">{stats.vozDoPovo.taxaResolucao.toFixed(1)}%</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Visualizações</p>
                    <p className="text-lg font-semibold">{stats.vozDoPovo.totalVisualizacoes.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Votos</p>
                    <p className="text-lg font-semibold">{stats.vozDoPovo.totalVotos.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distribuicaoNotasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nota" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-semibold">{stats.eventos.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ativos</span>
                  <span className="font-semibold text-green-600">{stats.eventos.ativos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Participantes</span>
                  <span className="font-semibold">{stats.eventos.totalParticipantes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Média Participantes</span>
                  <span className="font-semibold">{stats.eventos.mediaParticipantes.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vagas de Emprego</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-semibold">{stats.vagas.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ativas</span>
                  <span className="font-semibold text-green-600">{stats.vagas.ativas}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Serviços Autônomos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-semibold">{stats.servicos.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ativos</span>
                  <span className="font-semibold text-green-600">{stats.servicos.ativos}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Gamificação */}
        <TabsContent value="gamificacao" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pontos</p>
                    <p className="text-2xl font-bold">{stats.gamificacao.totalPontos.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Badges</p>
                    <p className="text-2xl font-bold">{stats.gamificacao.totalBadges}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Missões Completadas</p>
                    <p className="text-2xl font-bold">{stats.gamificacao.totalMissoes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Média Pontos/Usuário</p>
                    <p className="text-2xl font-bold">{stats.gamificacao.mediaPontosPorUsuario.toFixed(0)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Taxa Completamento Missões</p>
                  <Progress value={stats.gamificacao.taxaCompletamentoMissoes} />
                  <p className="text-xs text-muted-foreground mt-1">{stats.gamificacao.taxaCompletamentoMissoes.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Stories Ativos</p>
                      <p className="text-xl font-bold">{stats.conteudo.totalStories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posts Canal</p>
                      <p className="text-xl font-bold">{stats.conteudo.totalPostsCanal}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Banners Ativos</p>
                      <p className="text-xl font-bold">{stats.conteudo.totalBanners}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lugares Públicos</p>
                      <p className="text-xl font-bold">{stats.conteudo.totalLugaresPublicos}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enquetes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.enquetes.total}</p>
                  <p className="text-sm text-muted-foreground">Total Enquetes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.enquetes.totalRespostas}</p>
                  <p className="text-sm text-muted-foreground">Total Respostas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.enquetes.taxaParticipacao.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Taxa Participação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Crescimento */}
        <TabsContent value="crescimento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.crescimento.usuarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" name="Novos Usuários" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Empresas</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.crescimento.empresas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" name="Novas Empresas" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Eventos</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.crescimento.eventos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Produtos</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.crescimento.produtos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
