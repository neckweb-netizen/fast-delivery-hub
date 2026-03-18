import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';

const AnunciarServico = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Anunciar Serviço</h1>
            <Button asChild variant="outline" size="lg">
              <Link to="/oportunidades"><ArrowLeft className="w-5 h-5 mr-2" /> Voltar</Link>
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Funcionalidade em breve</h3>
              <p className="text-muted-foreground">O cadastro de serviços autônomos está sendo desenvolvido.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnunciarServico;
