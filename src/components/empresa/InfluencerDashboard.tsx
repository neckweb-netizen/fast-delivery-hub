import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone, Globe, Mail, Settings, Star, Calendar, Instagram, Youtube, Twitter, CreditCard } from 'lucide-react';
import { useMinhaEmpresa } from '@/hooks/useMinhaEmpresa';
import { InfluencerEditForm } from './InfluencerEditForm';
import { EmpresaEventos } from './EmpresaEventos';
import { MuralAvisos } from './MuralAvisos';
import { EmpresaActions } from './EmpresaActions';
import { PlanosDisponiveis } from './PlanosDisponiveis';

export const InfluencerDashboard = () => {
  const { user, profile } = useAuth();
  const { empresa, empresas, isLoading } = useMinhaEmpresa();
  const [activeTab, setActiveTab] = useState('overview');
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');

  // Filtrar apenas empresas da categoria influencer
  const influencerEmpresas = empresas.filter(emp => emp.categoria_id === 'categoria-influencers');
  
  // Determina qual empresa exibir (selecionada ou primeira disponível)
  const empresaAtual = selectedEmpresaId 
    ? influencerEmpresas.find(emp => emp.id === selectedEmpresaId) || influencerEmpresas[0]
    : influencerEmpresas[0];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Carregando painel do criador...</p>
        </div>
      </div>
    );
  }

  if (!empresaAtual) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Perfil de criador não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa ter um perfil de criador de conteúdo cadastrado para acessar este painel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parseRedesSociais = (site?: string) => {
    if (!site) return {};
    
    try {
      // Se for um JSON válido, parsear
      if (site.startsWith('{')) {
        return JSON.parse(site);
      }
      // Se for uma URL simples, retornar como site
      return { site };
    } catch {
      return { site };
    }
  };

  const redesSociais = parseRedesSociais(empresaAtual.website);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'twitter': case 'x': return <Twitter className="w-4 h-4" />;
      case 'tiktok': return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mural de Avisos no Topo */}
      <div className="mb-8">
        <MuralAvisos />
      </div>

      {/* Seletor de Perfis (se houver múltiplos) */}
      {influencerEmpresas.length > 1 && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Selecionar Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedEmpresaId || empresaAtual?.id || ''} 
                onValueChange={setSelectedEmpresaId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {influencerEmpresas.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{emp.nome}</span>
                        {emp.aprovada && (
                          <Badge variant="secondary" className="text-xs">
                            Aprovado
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {empresaAtual.capa_url && (
              <img
                src={empresaAtual.capa_url}
                alt={empresaAtual.nome}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {empresaAtual.nome}
                {empresaAtual.aprovada && (
                  <Badge variant="default" className="bg-blue-600">
                    <Star className="w-3 h-3 mr-1" />
                    Aprovado
                  </Badge>
                )}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Criador de Conteúdo
                </span>
                {empresaAtual.endereco && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {empresaAtual.endereco}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant={empresaAtual.aprovada ? 'default' : 'secondary'}>
              Status: {empresaAtual.aprovada ? 'Aprovado' : 'Pendente'}
            </Badge>
            <Badge variant={empresaAtual.ativo ? 'default' : 'secondary'}>
              {empresaAtual.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
        
        <EmpresaActions empresa={empresaAtual} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">
            <Users className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="eventos">
            <Calendar className="w-4 h-4 mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="planos">
            <CreditCard className="w-4 h-4 mr-2" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Criador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {empresaAtual.descricao && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{empresaAtual.descricao}</p>
                  </div>
                )}
                
                {empresaAtual.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{empresaAtual.telefone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais & Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(redesSociais).map(([platform, url]) => (
                  <div key={platform} className="flex items-center gap-2">
                    {getSocialIcon(platform)}
                    <a 
                      href={typeof url === 'string' ? url : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline capitalize"
                    >
                      {platform}: {typeof url === 'string' ? url : 'N/A'}
                    </a>
                  </div>
                ))}
                
                {/* Email de contato sempre disponível */}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Email: {profile?.email || 'Não informado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Status do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{empresaAtual.aprovada ? '✓' : '⏳'}</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{empresaAtual.aprovada ? '⭐' : '○'}</div>
                    <div className="text-sm text-muted-foreground">Aprovado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{empresaAtual.destaque ? '🔥' : '○'}</div>
                    <div className="text-sm text-muted-foreground">Destaque</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{empresaAtual.ativo ? '✅' : '❌'}</div>
                    <div className="text-sm text-muted-foreground">Ativo</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Criado em: {new Date(empresaAtual.criado_em).toLocaleDateString('pt-BR')}</p>
                  <p>Atualizado em: {new Date(empresaAtual.atualizado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eventos" className="mt-6">
          <EmpresaEventos />
        </TabsContent>

        <TabsContent value="planos" className="mt-6">
          <PlanosDisponiveis empresaId={empresaAtual.id} />
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">
                    Gerencie as informações do seu perfil de criador, atualize suas redes sociais e dados de contato.
                  </p>
                  
                  <Button
                    onClick={() => setEditFormOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Perfil de Criador
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Informações Básicas</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Nome do criador</p>
                      <p>• Descrição e bio</p>
                      <p>• Foto de perfil</p>
                      <p>• Localização</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Redes Sociais</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Instagram</p>
                      <p>• YouTube</p>
                      <p>• TikTok</p>
                      <p>• Outras redes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <InfluencerEditForm 
        empresa={empresaAtual} 
        open={editFormOpen} 
        onOpenChange={setEditFormOpen} 
      />
    </div>
  );
};
