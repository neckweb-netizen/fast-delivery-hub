import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Eye, Search, Filter, ArrowLeft, Briefcase, Building, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { VagaFormModal } from '@/components/forms/VagaFormModal';

const VagasEmprego = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('todos');
  const [isVagaModalOpen, setIsVagaModalOpen] = useState(false);
  
  const isEmpresa = profile?.tipo_conta === 'empresa';

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ['vagas-emprego', searchTerm, selectedTipo],
    queryFn: async () => {
      let query = supabase
        .from('vagas')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (searchTerm) {
        query = query.ilike('titulo', `%${searchTerm}%`);
      }

      if (selectedTipo !== 'todos') {
        query = query.eq('tipo_contrato', selectedTipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'clt': 'CLT', 'temporario': 'Temporário', 'estagio': 'Estágio', 'freelance': 'Freelance'
    };
    return labels[tipo] || tipo || 'Não informado';
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'clt': 'bg-green-100 text-green-800', 'temporario': 'bg-blue-100 text-blue-800',
      'estagio': 'bg-yellow-100 text-yellow-800', 'freelance': 'bg-purple-100 text-purple-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary">Vagas de Emprego</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Descubra oportunidades de carreira na sua região</p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/oportunidades" className="flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg"><Filter className="w-5 h-5 text-primary" /></div>
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar vagas por título..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-12 border-2 focus:border-primary/50 transition-colors duration-300" />
              </div>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger className="h-12 border-2"><SelectValue placeholder="Tipo de contrato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="temporario">Temporário</SelectItem>
                  <SelectItem value="estagio">Estágio</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6">
              {[1,2,3].map(i => (
                <Card key={i} className="animate-pulse shadow-lg">
                  <CardContent className="p-8"><div className="h-6 bg-muted/50 rounded w-2/3 mb-4"></div><div className="h-4 bg-muted/50 rounded w-full"></div></CardContent>
                </Card>
              ))}
            </div>
          ) : vagas.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-16 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Nenhuma vaga encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {vagas.map((vaga) => (
                <Card key={vaga.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{vaga.titulo}</h3>
                          <p className="text-muted-foreground line-clamp-3">{vaga.descricao}</p>
                        </div>
                        <Badge className={`text-sm px-4 py-2 ${getTipoColor(vaga.tipo_contrato || '')}`}>
                          {getTipoLabel(vaga.tipo_contrato || '')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {vaga.salario && <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {vaga.salario}</div>}
                        {vaga.local && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {vaga.local}</div>}
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(vaga.criado_em || '').toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEmpresa && (
        <>
          <Button onClick={() => setIsVagaModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl z-50">
            <Plus className="w-6 h-6" />
          </Button>
          <VagaFormModal open={isVagaModalOpen} onOpenChange={setIsVagaModalOpen} />
        </>
      )}
    </div>
  );
};

export default VagasEmprego;
