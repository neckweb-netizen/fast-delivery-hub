import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subMonths } from 'date-fns';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats-complete'],
    queryFn: async () => {
      const now = new Date();
      const today = startOfDay(now);
      const thisWeek = startOfWeek(now);
      const thisMonth = startOfMonth(now);

      // Usuários
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, tipo_conta, criado_em');

      // Empresas
      const { data: empresas } = await supabase
        .from('empresas')
        .select('id, aprovada, criado_em, destaque, categoria_id, cidade_id, plano_atual_id');

      const { data: empresasComPlano } = await supabase
        .from('empresas')
        .select('id')
        .not('plano_atual_id', 'is', null)
        .gte('plano_data_vencimento', now.toISOString());

      // Produtos
      const { data: produtos } = await supabase
        .from('produtos')
        .select('id, criado_em, empresa_id, ativo, destaque');

      // Eventos
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, criado_em, ativo');

      // Cupons
      const { data: cupons } = await supabase
        .from('cupons')
        .select('id, criado_em, usos, limite_uso, ativo, data_fim');

      // Avaliações
      const { data: avaliacoes } = await supabase
        .from('avaliacoes')
        .select('id, criado_em, nota, empresa_id');

      // Favoritos
      const { data: favoritos } = await supabase
        .from('favoritos')
        .select('id, criado_em, empresa_id');

      // Agendamentos
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id, criado_em, status, empresa_id');

      // Problemas
      const { data: problemas } = await supabase
        .from('problemas_cidade')
        .select('id, criado_em, status, votos');

      const { data: comentariosProblemas } = await supabase
        .from('comentarios_problema')
        .select('id, criado_em');

      // Vagas
      const { data: vagas } = await supabase
        .from('vagas')
        .select('id, criado_em, ativo');

      // Enquetes
      const { data: enquetes } = await supabase
        .from('enquetes')
        .select('id, criado_em');

      // Cidades
      const { data: cidades } = await supabase
        .from('cidades')
        .select('id, nome, ativo');

      // Categorias
      const { data: categorias } = await supabase
        .from('categorias')
        .select('id, nome, tipo');

      // Stories
      const { data: stories } = await supabase
        .from('stories')
        .select('id, criado_em, ativo');

      // Canal Informativo
      const { data: canalPosts } = await supabase
        .from('canal_informativo')
        .select('id, criado_em, ativo');

      // Banners
      const { data: banners } = await supabase
        .from('banners')
        .select('id, criado_em, ativo');

      // Lugares Públicos
      const { data: lugaresPublicos } = await supabase
        .from('lugares_publicos')
        .select('id, criado_em, ativo');

      // Cálculos
      const totalUsuarios = usuarios?.length || 0;
      const usuariosPorTipo = usuarios?.reduce((acc: any, u) => {
        acc[u.tipo_conta] = (acc[u.tipo_conta] || 0) + 1;
        return acc;
      }, {});

      const totalEmpresas = empresas?.length || 0;
      const empresasAprovadas = empresas?.filter(e => e.aprovada).length || 0;
      const empresasPendentes = empresas?.filter(e => !e.aprovada).length || 0;
      const empresasComPlanoAtivo = empresasComPlano?.length || 0;

      const totalProdutos = produtos?.length || 0;
      const produtosAtivos = produtos?.filter(p => p.ativo).length || 0;
      const produtosDestaque = produtos?.filter(p => p.destaque).length || 0;

      const totalEventos = eventos?.length || 0;
      const eventosAtivos = eventos?.filter(e => e.ativo).length || 0;

      const totalCupons = cupons?.length || 0;
      const cuponsAtivos = cupons?.filter(c => c.ativo && c.data_fim && new Date(c.data_fim) > now).length || 0;
      const cuponsUtilizados = cupons?.reduce((sum, c) => sum + (c.usos || 0), 0) || 0;

      const totalAvaliacoes = avaliacoes?.length || 0;
      const mediaNotaGeral = avaliacoes?.length ? avaliacoes.reduce((sum, a) => sum + (a.nota || 0), 0) / avaliacoes.length : 0;
      const distribuicaoNotas = avaliacoes?.reduce((acc: any, a) => {
        acc[a.nota || 0] = (acc[a.nota || 0] || 0) + 1;
        return acc;
      }, {});

      const totalFavoritos = favoritos?.length || 0;
      const totalAgendamentos = agendamentos?.length || 0;
      const agendamentosPendentes = agendamentos?.filter(a => a.status === 'pendente').length || 0;
      const agendamentosConfirmados = agendamentos?.filter(a => a.status === 'confirmado').length || 0;

      const totalProblemas = problemas?.length || 0;
      const problemasAbertos = problemas?.filter(p => p.status === 'aberto' || p.status === 'pendente').length || 0;
      const problemasResolvidos = problemas?.filter(p => p.status === 'resolvido').length || 0;
      const totalComentariosProblemas = comentariosProblemas?.length || 0;

      const totalVagas = vagas?.length || 0;
      const vagasAtivas = vagas?.filter(v => v.ativo).length || 0;

      const totalEnquetes = enquetes?.length || 0;
      const totalCidades = cidades?.filter(c => c.ativo).length || 0;
      const totalCategorias = categorias?.length || 0;
      const totalStories = stories?.filter(s => s.ativo).length || 0;
      const totalPostsCanal = canalPosts?.filter(p => p.ativo).length || 0;
      const totalBanners = banners?.filter(b => b.ativo).length || 0;
      const totalLugaresPublicos = lugaresPublicos?.filter(l => l.ativo).length || 0;

      // Crescimento
      const crescimentoUsuarios = [];
      const crescimentoEmpresas = [];
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(now, i);
        const mesInicio = startOfMonth(mes);
        const mesFim = startOfMonth(subMonths(now, i - 1));
        
        crescimentoUsuarios.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: usuarios?.filter(u => { const c = new Date(u.criado_em); return c >= mesInicio && c < mesFim; }).length || 0
        });
        crescimentoEmpresas.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: empresas?.filter(e => { const c = new Date(e.criado_em); return c >= mesInicio && c < mesFim; }).length || 0
        });
      }

      return {
        resumo: {
          totalUsuarios, totalEmpresas, totalProdutos, totalEventos,
          totalCupons, totalAvaliacoes, totalAgendamentos, totalProblemas,
          totalVagas, totalServicos: 0, totalCidades, totalCategorias, totalFavoritos,
        },
        usuarios: {
          total: totalUsuarios, porTipo: usuariosPorTipo,
          ativosHoje: 0, ativosSemana: 0, ativosMes: 0,
          distribuicaoNiveis: {}, taxaEngajamento: 0,
        },
        empresas: {
          total: totalEmpresas, aprovadas: empresasAprovadas,
          pendentes: empresasPendentes, rejeitadas: 0,
          verificadas: empresasAprovadas, taxaVerificacao: totalEmpresas > 0 ? (empresasAprovadas / totalEmpresas) * 100 : 0,
          taxaAprovacao: totalEmpresas > 0 ? (empresasAprovadas / totalEmpresas) * 100 : 0,
          comPlanoAtivo: empresasComPlanoAtivo, receitaEstimadaMensal: empresasComPlanoAtivo * 50,
          porCategoria: {}, porCidade: {},
        },
        produtos: { total: totalProdutos, ativos: produtosAtivos, destaque: produtosDestaque, mediaPorEmpresa: 0 },
        eventos: { total: totalEventos, ativos: eventosAtivos, aprovados: eventosAtivos, totalParticipantes: 0, mediaParticipantes: 0 },
        cupons: { total: totalCupons, ativos: cuponsAtivos, utilizados: cuponsUtilizados, disponiveis: 0, taxaUtilizacao: 0 },
        avaliacoes: { total: totalAvaliacoes, mediaGeral: mediaNotaGeral, distribuicaoNotas, mediaPorEmpresa: 0 },
        favoritos: { total: totalFavoritos, empresasMaisFavoritadas: {} },
        agendamentos: { total: totalAgendamentos, pendentes: agendamentosPendentes, confirmados: agendamentosConfirmados, concluidos: 0, taxaConclusao: 0 },
        vozDoPovo: {
          totalProblemas, abertos: problemasAbertos, emAnalise: 0, resolvidos: problemasResolvidos,
          taxaResolucao: totalProblemas > 0 ? (problemasResolvidos / totalProblemas) * 100 : 0,
          totalVisualizacoes: 0, totalVotos: 0, totalComentarios: totalComentariosProblemas,
          mediaComentariosPorProblema: totalProblemas > 0 ? totalComentariosProblemas / totalProblemas : 0,
        },
        vagas: { total: totalVagas, ativas: vagasAtivas },
        servicos: { total: 0, ativos: 0 },
        enquetes: { total: totalEnquetes, totalRespostas: 0, taxaParticipacao: 0 },
        gamificacao: { totalPontos: 0, totalBadges: 0, totalMissoes: 0, taxaCompletamentoMissoes: 0, acoesPorTipo: {}, mediaPontosPorUsuario: 0 },
        conteudo: { totalStories, totalPostsCanal, totalBanners, totalLugaresPublicos },
        crescimento: { usuarios: crescimentoUsuarios, empresas: crescimentoEmpresas, eventos: [], produtos: [] },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
