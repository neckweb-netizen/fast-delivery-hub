import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Tag, Briefcase, Wrench, Building2, Newspaper, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BannerSection } from '@/components/home/BannerSection';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UnifiedSearchContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const { data: results, isLoading } = useUnifiedSearch(searchTerm);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const totalResults = results ? 
    Object.values(results).reduce((acc, arr) => acc + arr.length, 0) : 0;

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <BannerSection secao="busca" />
      
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 space-y-6">
        {/* Header e busca */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Busca Unificada
            </h1>
            <p className="text-muted-foreground">
              Encontre empresas, produtos, eventos, cupons, serviços e muito mais
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite sua busca..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-6 text-base"
              autoFocus
            />
          </div>

          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Buscando...' : `${totalResults} resultados encontrados`}
            </p>
          )}
        </div>

        {/* Resultados */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && searchTerm && results && (
          <div className="space-y-8">
            {/* Empresas */}
            {results.empresas.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Empresas ({results.empresas.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.empresas.map((empresa: any) => (
                    <Card key={empresa.id} className="p-4 hover:shadow-lg transition-shadow">
                      <Link to={`/local/${empresa.slug || empresa.id}`} className="space-y-3">
                        {empresa.imagem_capa_url && (
                          <img
                            src={empresa.imagem_capa_url}
                            alt={empresa.nome}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-1">{empresa.nome}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {empresa.descricao}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{empresa.cidades?.nome}</span>
                        </div>
                        {empresa.categorias && (
                          <Badge variant="secondary" className="text-xs">
                            {empresa.categorias.nome}
                          </Badge>
                        )}
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Produtos */}
            {results.produtos.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Produtos ({results.produtos.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {results.produtos.map((produto: any) => (
                    <Card key={produto.id} className="p-4 hover:shadow-lg transition-shadow">
                      <Link to={`/local/${produto.empresas?.slug}`} className="space-y-3">
                        {produto.imagem_principal_url && (
                          <img
                            src={produto.imagem_principal_url}
                            alt={produto.nome}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-1 text-sm">{produto.nome}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {produto.empresas?.nome}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            R$ {produto.preco_promocional || produto.preco_original}
                          </span>
                          {produto.preco_promocional && (
                            <span className="text-xs text-muted-foreground line-through">
                              R$ {produto.preco_original}
                            </span>
                          )}
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Eventos */}
            {results.eventos.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Eventos ({results.eventos.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.eventos.map((evento: any) => (
                    <Card key={evento.id} className="p-4 hover:shadow-lg transition-shadow">
                      <Link to={`/eventos/${evento.id}`} className="space-y-3">
                        {evento.imagem_url && (
                          <img
                            src={evento.imagem_url}
                            alt={evento.titulo}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-1">{evento.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {evento.descricao}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(evento.data_inicio), "d 'de' MMMM", { locale: ptBR })}
                          </span>
                        </div>
                        {evento.gratuito ? (
                          <Badge variant="secondary" className="text-xs">Gratuito</Badge>
                        ) : (
                          <Badge className="text-xs">R$ {evento.preco}</Badge>
                        )}
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Cupons */}
            {results.cupons.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Cupons ({results.cupons.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.cupons.map((cupom: any) => (
                    <Card key={cupom.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{cupom.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {cupom.descricao}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs">{cupom.codigo}</Badge>
                          <span className="text-sm font-bold text-primary">
                            {cupom.tipo === 'porcentagem' ? `${cupom.valor}% OFF` : `R$ ${cupom.valor}`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cupom.empresas?.nome}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Serviços */}
            {results.servicos.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Serviços Autônomos ({results.servicos.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.servicos.map((servico: any) => (
                    <Card key={servico.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {servico.foto_perfil_url && (
                            <img
                              src={servico.foto_perfil_url}
                              alt={servico.nome_prestador}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-1">{servico.nome_prestador}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {servico.descricao_servico}
                            </p>
                          </div>
                        </div>
                        {servico.categorias_oportunidades && (
                          <Badge variant="secondary" className="text-xs">
                            {servico.categorias_oportunidades.nome}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Locais Públicos */}
            {results.locais.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Lugares Públicos ({results.locais.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.locais.map((local: any) => (
                    <Card key={local.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="space-y-3">
                        {local.imagem_url && (
                          <img
                            src={local.imagem_url}
                            alt={local.nome}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-1">{local.nome}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {local.descricao}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{local.tipo}</Badge>
                          <span className="text-xs text-muted-foreground">{local.cidades?.nome}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Notícias */}
            {results.noticias.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Notícias ({results.noticias.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.noticias.map((noticia: any) => (
                    <Card key={noticia.id} className="p-4 hover:shadow-lg transition-shadow">
                      <Link to={`/canal-informativo?post=${noticia.id}`} className="space-y-3">
                        {noticia.url_midia && (
                          <img
                            src={noticia.url_midia}
                            alt={noticia.titulo}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold line-clamp-1">{noticia.titulo}</h3>
                          {noticia.conteudo && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {noticia.conteudo}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {noticia.tipo_conteudo}
                        </Badge>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Nenhum resultado */}
            {totalResults === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente buscar com outros termos
                </p>
              </div>
            )}
          </div>
        )}

        {!searchTerm && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digite algo para buscar</h3>
            <p className="text-muted-foreground">
              Você pode buscar empresas, produtos, eventos, cupons, serviços e muito mais
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
