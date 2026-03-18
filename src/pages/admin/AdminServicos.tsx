import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export function AdminServicos() {
  // servicos_autonomos table doesn't exist in the schema
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Serviços Autônomos</h1>
        <p className="text-muted-foreground">Gerencie os serviços autônomos disponíveis</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</h3>
          <p className="text-muted-foreground text-center">
            A tabela de serviços autônomos ainda não foi criada no banco de dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
