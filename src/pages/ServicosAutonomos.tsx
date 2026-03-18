import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicosAutonomos = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // servicos_autonomos table doesn't exist - show placeholder
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary">Serviços Autônomos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Conecte-se com profissionais qualificados</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg"><Link to="/oportunidades/anunciar-servico"><Sparkles className="w-5 h-5 mr-2" /> Anunciar Serviço</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/oportunidades"><ArrowLeft className="w-5 h-5 mr-2" /> Voltar</Link></Button>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg"><Filter className="w-5 h-5 text-primary" /></div>
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou serviço..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-12 border-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Funcionalidade em breve</h3>
            <p className="text-muted-foreground">O módulo de serviços autônomos está sendo desenvolvido.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicosAutonomos;
