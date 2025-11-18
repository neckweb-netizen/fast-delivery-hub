import { supabase } from '@/integrations/supabase/client';

const categoriasParaCriar = [
  { nome: 'Atendimento ao Cliente', slug: 'atendimento-ao-cliente', tipo: 'vaga' },
  { nome: 'Marketing', slug: 'marketing', tipo: 'vaga' },
  { nome: 'Recursos Humanos', slug: 'recursos-humanos', tipo: 'vaga' },
  { nome: 'Financeiro e Contabilidade', slug: 'financeiro-e-contabilidade', tipo: 'vaga' },
  { nome: 'Produção e Operações', slug: 'producao-e-operacoes', tipo: 'vaga' },
  { nome: 'Serviços Gerais', slug: 'servicos-gerais', tipo: 'vaga' },
  { nome: 'Jurídico', slug: 'juridico', tipo: 'vaga' },
  { nome: 'Suporte Técnico', slug: 'suporte-tecnico', tipo: 'vaga' },
  { nome: 'Design e Criação', slug: 'design-e-criacao', tipo: 'vaga' },
  { nome: 'Imobiliário', slug: 'imobiliario', tipo: 'vaga' },
  { nome: 'Autônomos e Freelancers', slug: 'autonomos-e-freelancers', tipo: 'vaga' },
];

export async function populateCategorias() {
  console.log('Iniciando população de categorias...');
  
  for (const categoria of categoriasParaCriar) {
    try {
      const { data, error } = await supabase
        .from('categorias_oportunidades')
        .insert({
          nome: categoria.nome,
          slug: categoria.slug,
          tipo: categoria.tipo,
          ativo: true
        })
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar categoria "${categoria.nome}":`, error);
      } else {
        console.log(`✓ Categoria "${categoria.nome}" criada com sucesso!`);
      }
    } catch (err) {
      console.error(`Erro ao criar categoria "${categoria.nome}":`, err);
    }
  }
  
  console.log('População de categorias concluída!');
}
