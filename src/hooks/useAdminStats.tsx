import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subMonths } from 'date-fns';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats-complete'],
    queryFn: async () => {
      const now = new Date();
      const today = startOfDay(now);
      const thisWeek = startOfWeek(now);
      const thisMonth = startOfMonth(now);
      const thisYear = startOfYear(now);
      const last30Days = subDays(now, 30);
      const last6Months = subMonths(now, 6);

      // Usuários
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, tipo_conta, criado_em, total_points, current_level');

      const { data: usuariosAtivosHoje } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('created_at', today.toISOString());

      const { data: usuariosAtivosSemana } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('created_at', thisWeek.toISOString());

      const { data: usuariosAtivosMes } = await supabase
        .from('user_points')
        .select('user_id')
        .gte('created_at', thisMonth.toISOString());

      // Empresas
      const { data: empresas } = await supabase
        .from('empresas')
        .select('id, status_aprovacao, criado_em, verificado, categoria_id, cidade_id, plano_atual_id');

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
        .select('id, criado_em, status_aprovacao, participantes_confirmados, ativo');

      // Cupons
      const { data: cupons } = await supabase
        .from('cupons')
        .select('id, criado_em, quantidade_usada, quantidade_total, ativo, data_fim');

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

      // Problemas/Voz do Povo
      const { data: problemas } = await supabase
        .from('problemas_cidade')
        .select('id, criado_em, status, votos_positivos, votos_negativos, visualizacoes');

      const { data: comentariosProblemas } = await supabase
        .from('comentarios_problema')
        .select('id, criado_em');

      // Vagas
      const { data: vagas } = await supabase
        .from('vagas_emprego')
        .select('id, criado_em, ativo');

      // Serviços Autônomos
      const { data: servicos } = await supabase
        .from('servicos_autonomos')
        .select('id, criado_em, ativo, status_aprovacao');

      // Enquetes
      const { data: enquetes } = await supabase
        .from('enquetes')
        .select('id, criado_em');

      const { data: respostasEnquete } = await supabase
        .from('respostas_enquete')
        .select('id, criado_em');

      // Gamificação
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('id, points, action_type, created_at');

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('id, badge_id, earned_at');

      const { data: badges } = await supabase
        .from('badges')
        .select('id, name, key');

      const { data: missions } = await supabase
        .from('missions')
        .select('id, is_active');

      const { data: userMissions } = await supabase
        .from('user_missions')
        .select('id, completed, completed_at');

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
        .from('empresa_stories')
        .select('id, criado_em, ativo, tipo_story');

      // Canal Informativo
      const { data: canalPosts } = await supabase
        .from('canal_informativo')
        .select('id, criado_em, ativo');

      // Banners
      const { data: banners } = await supabase
        .from('banners_publicitarios')
        .select('id, criado_em, ativo, secao');

      // Lugares Públicos
      const { data: lugaresPublicos } = await supabase
        .from('lugares_publicos')
        .select('id, criado_em, ativo, tipo');

      // Cálculos de estatísticas
      const totalUsuarios = usuarios?.length || 0;
      const usuariosPorTipo = usuarios?.reduce((acc: any, u) => {
        acc[u.tipo_conta] = (acc[u.tipo_conta] || 0) + 1;
        return acc;
      }, {});

      const usuariosAtivosHojeUnicos = new Set(usuariosAtivosHoje?.map(u => u.user_id)).size;
      const usuariosAtivosSemanaUnicos = new Set(usuariosAtivosSemana?.map(u => u.user_id)).size;
      const usuariosAtivosMesUnicos = new Set(usuariosAtivosMes?.map(u => u.user_id)).size;

      const totalEmpresas = empresas?.length || 0;
      const empresasAprovadas = empresas?.filter(e => e.status_aprovacao === 'aprovado').length || 0;
      const empresasPendentes = empresas?.filter(e => e.status_aprovacao === 'pendente').length || 0;
      const empresasRejeitadas = empresas?.filter(e => e.status_aprovacao === 'rejeitado').length || 0;
      const empresasVerificadas = empresas?.filter(e => e.verificado).length || 0;
      const taxaVerificacao = totalEmpresas > 0 ? (empresasVerificadas / totalEmpresas) * 100 : 0;
      const taxaAprovacao = totalEmpresas > 0 ? (empresasAprovadas / totalEmpresas) * 100 : 0;
      const empresasComPlanoAtivo = empresasComPlano?.length || 0;
      const receitaEstimadaMensal = empresasComPlanoAtivo * 50; // Exemplo: R$ 50 por plano

      const totalProdutos = produtos?.length || 0;
      const produtosAtivos = produtos?.filter(p => p.ativo).length || 0;
      const produtosDestaque = produtos?.filter(p => p.destaque).length || 0;

      const totalEventos = eventos?.length || 0;
      const eventosAtivos = eventos?.filter(e => e.ativo).length || 0;
      const eventosAprovados = eventos?.filter(e => e.status_aprovacao === 'aprovado').length || 0;
      const totalParticipantesEventos = eventos?.reduce((sum, e) => sum + (e.participantes_confirmados || 0), 0) || 0;

      const totalCupons = cupons?.length || 0;
      const cuponsAtivos = cupons?.filter(c => c.ativo && new Date(c.data_fim) > now).length || 0;
      const cuponsUtilizados = cupons?.reduce((sum, c) => sum + (c.quantidade_usada || 0), 0) || 0;
      const totalCuponsDisponiveis = cupons?.reduce((sum, c) => sum + (c.quantidade_total || 0), 0) || 0;
      const taxaUtilizacaoCupons = totalCuponsDisponiveis > 0 ? (cuponsUtilizados / totalCuponsDisponiveis) * 100 : 0;

      const totalAvaliacoes = avaliacoes?.length || 0;
      const mediaNotaGeral = avaliacoes?.length ? avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length : 0;
      const distribuicaoNotas = avaliacoes?.reduce((acc: any, a) => {
        acc[a.nota] = (acc[a.nota] || 0) + 1;
        return acc;
      }, {});

      const totalFavoritos = favoritos?.length || 0;
      const empresasMaisFavoritadas = favoritos?.reduce((acc: any, f) => {
        acc[f.empresa_id] = (acc[f.empresa_id] || 0) + 1;
        return acc;
      }, {});

      const totalAgendamentos = agendamentos?.length || 0;
      const agendamentosPendentes = agendamentos?.filter(a => a.status === 'pendente').length || 0;
      const agendamentosConfirmados = agendamentos?.filter(a => a.status === 'confirmado').length || 0;
      const agendamentosConcluidos = agendamentos?.filter(a => a.status === 'concluido').length || 0;
      const taxaConclusaoAgendamentos = totalAgendamentos > 0 ? (agendamentosConcluidos / totalAgendamentos) * 100 : 0;

      const totalProblemas = problemas?.length || 0;
      const problemasAbertos = problemas?.filter(p => p.status === 'aberto').length || 0;
      const problemasEmAnalise = problemas?.filter(p => p.status === 'em_analise').length || 0;
      const problemasResolvidos = problemas?.filter(p => p.status === 'resolvido').length || 0;
      const taxaResolucaoProblemas = totalProblemas > 0 ? (problemasResolvidos / totalProblemas) * 100 : 0;
      const totalVisualizacoesProblemas = problemas?.reduce((sum, p) => sum + (p.visualizacoes || 0), 0) || 0;
      const totalVotosProblemas = problemas?.reduce((sum, p) => sum + (p.votos_positivos || 0) + (p.votos_negativos || 0), 0) || 0;
      const totalComentariosProblemas = comentariosProblemas?.length || 0;

      const totalVagas = vagas?.length || 0;
      const vagasAtivas = vagas?.filter(v => v.ativo).length || 0;

      const totalServicos = servicos?.length || 0;
      const servicosAtivos = servicos?.filter(s => s.status_aprovacao === 'aprovado' && s.ativo).length || 0;

      const totalEnquetes = enquetes?.length || 0;
      const totalRespostasEnquete = respostasEnquete?.length || 0;
      const taxaParticipacaoEnquete = totalUsuarios > 0 ? (totalRespostasEnquete / totalUsuarios) * 100 : 0;

      const totalPontosDistribuidos = userPoints?.reduce((sum, p) => sum + p.points, 0) || 0;
      const totalBadgesConquistados = userBadges?.length || 0;
      const totalMissoesCompletadas = userMissions?.filter(m => m.completed).length || 0;
      const taxaCompletamentoMissoes = userMissions?.length ? (totalMissoesCompletadas / userMissions.length) * 100 : 0;

      const distribuicaoNiveis = usuarios?.reduce((acc: any, u) => {
        const nivel = u.current_level || 1;
        acc[nivel] = (acc[nivel] || 0) + 1;
        return acc;
      }, {});

      const totalCidades = cidades?.filter(c => c.ativo).length || 0;
      const totalCategorias = categorias?.length || 0;
      const totalStories = stories?.filter(s => s.ativo).length || 0;
      const totalPostsCanal = canalPosts?.filter(p => p.ativo).length || 0;
      const totalBanners = banners?.filter(b => b.ativo).length || 0;
      const totalLugaresPublicos = lugaresPublicos?.filter(l => l.ativo).length || 0;

      // Crescimento mensal (últimos 6 meses)
      const crescimentoUsuarios = [];
      const crescimentoEmpresas = [];
      const crescimentoEventos = [];
      const crescimentoProdutos = [];
      
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(now, i);
        const mesInicio = startOfMonth(mes);
        const mesFim = startOfMonth(subMonths(now, i - 1));
        
        const usuariosNoMes = usuarios?.filter(u => {
          const criado = new Date(u.criado_em);
          return criado >= mesInicio && criado < mesFim;
        }).length || 0;
        
        const empresasNoMes = empresas?.filter(e => {
          const criado = new Date(e.criado_em);
          return criado >= mesInicio && criado < mesFim;
        }).length || 0;
        
        const eventosNoMes = eventos?.filter(e => {
          const criado = new Date(e.criado_em);
          return criado >= mesInicio && criado < mesFim;
        }).length || 0;
        
        const produtosNoMes = produtos?.filter(p => {
          const criado = new Date(p.criado_em);
          return criado >= mesInicio && criado < mesFim;
        }).length || 0;
        
        crescimentoUsuarios.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: usuariosNoMes
        });
        
        crescimentoEmpresas.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: empresasNoMes
        });
        
        crescimentoEventos.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: eventosNoMes
        });
        
        crescimentoProdutos.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          valor: produtosNoMes
        });
      }

      // Top categorias
      const empresasPorCategoria = empresas?.reduce((acc: any, e) => {
        acc[e.categoria_id] = (acc[e.categoria_id] || 0) + 1;
        return acc;
      }, {});

      // Top cidades
      const empresasPorCidade = empresas?.reduce((acc: any, e) => {
        acc[e.cidade_id] = (acc[e.cidade_id] || 0) + 1;
        return acc;
      }, {});

      // Ações de gamificação por tipo
      const acoesPorTipo = userPoints?.reduce((acc: any, p) => {
        acc[p.action_type] = (acc[p.action_type] || 0) + 1;
        return acc;
      }, {});

      return {
        // Resumo geral
        resumo: {
          totalUsuarios,
          totalEmpresas,
          totalProdutos,
          totalEventos,
          totalCupons,
          totalAvaliacoes,
          totalAgendamentos,
          totalProblemas,
          totalVagas,
          totalServicos,
          totalCidades,
          totalCategorias,
          totalFavoritos,
        },

        // Usuários
        usuarios: {
          total: totalUsuarios,
          porTipo: usuariosPorTipo,
          ativosHoje: usuariosAtivosHojeUnicos,
          ativosSemana: usuariosAtivosSemanaUnicos,
          ativosMes: usuariosAtivosMesUnicos,
          distribuicaoNiveis,
          taxaEngajamento: totalUsuarios > 0 ? (usuariosAtivosMesUnicos / totalUsuarios) * 100 : 0,
        },

        // Empresas
        empresas: {
          total: totalEmpresas,
          aprovadas: empresasAprovadas,
          pendentes: empresasPendentes,
          rejeitadas: empresasRejeitadas,
          verificadas: empresasVerificadas,
          taxaVerificacao,
          taxaAprovacao,
          comPlanoAtivo: empresasComPlanoAtivo,
          receitaEstimadaMensal,
          porCategoria: empresasPorCategoria,
          porCidade: empresasPorCidade,
        },

        // Produtos
        produtos: {
          total: totalProdutos,
          ativos: produtosAtivos,
          destaque: produtosDestaque,
          mediaPorEmpresa: empresasAprovadas > 0 ? totalProdutos / empresasAprovadas : 0,
        },

        // Eventos
        eventos: {
          total: totalEventos,
          ativos: eventosAtivos,
          aprovados: eventosAprovados,
          totalParticipantes: totalParticipantesEventos,
          mediaParticipantes: eventosAprovados > 0 ? totalParticipantesEventos / eventosAprovados : 0,
        },

        // Cupons
        cupons: {
          total: totalCupons,
          ativos: cuponsAtivos,
          utilizados: cuponsUtilizados,
          disponiveis: totalCuponsDisponiveis,
          taxaUtilizacao: taxaUtilizacaoCupons,
        },

        // Avaliações
        avaliacoes: {
          total: totalAvaliacoes,
          mediaGeral: mediaNotaGeral,
          distribuicaoNotas,
          mediaPorEmpresa: empresasAprovadas > 0 ? totalAvaliacoes / empresasAprovadas : 0,
        },

        // Favoritos
        favoritos: {
          total: totalFavoritos,
          empresasMaisFavoritadas,
        },

        // Agendamentos
        agendamentos: {
          total: totalAgendamentos,
          pendentes: agendamentosPendentes,
          confirmados: agendamentosConfirmados,
          concluidos: agendamentosConcluidos,
          taxaConclusao: taxaConclusaoAgendamentos,
        },

        // Voz do Povo
        vozDoPovo: {
          totalProblemas,
          abertos: problemasAbertos,
          emAnalise: problemasEmAnalise,
          resolvidos: problemasResolvidos,
          taxaResolucao: taxaResolucaoProblemas,
          totalVisualizacoes: totalVisualizacoesProblemas,
          totalVotos: totalVotosProblemas,
          totalComentarios: totalComentariosProblemas,
          mediaComentariosPorProblema: totalProblemas > 0 ? totalComentariosProblemas / totalProblemas : 0,
        },

        // Vagas
        vagas: {
          total: totalVagas,
          ativas: vagasAtivas,
        },

        // Serviços
        servicos: {
          total: totalServicos,
          ativos: servicosAtivos,
        },

        // Enquetes
        enquetes: {
          total: totalEnquetes,
          totalRespostas: totalRespostasEnquete,
          taxaParticipacao: taxaParticipacaoEnquete,
        },

        // Gamificação
        gamificacao: {
          totalPontos: totalPontosDistribuidos,
          totalBadges: totalBadgesConquistados,
          totalMissoes: totalMissoesCompletadas,
          taxaCompletamentoMissoes,
          acoesPorTipo,
          mediaPontosPorUsuario: totalUsuarios > 0 ? totalPontosDistribuidos / totalUsuarios : 0,
        },

        // Conteúdo
        conteudo: {
          totalStories,
          totalPostsCanal,
          totalBanners,
          totalLugaresPublicos,
        },

        // Crescimento
        crescimento: {
          usuarios: crescimentoUsuarios,
          empresas: crescimentoEmpresas,
          eventos: crescimentoEventos,
          produtos: crescimentoProdutos,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
