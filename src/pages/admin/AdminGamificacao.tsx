import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminGamificacao() {
  // Tables badges/missions don't exist yet - show placeholder UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 md:pb-4">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <h1 className="text-4xl font-bold">Gerenciar Gamificação</h1>
          </div>
          <p className="text-muted-foreground">Configure badges, missões e gerencie o sistema de gamificação</p>
        </div>

        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="badges" className="gap-2"><Award className="h-4 w-4" /> Badges</TabsTrigger>
            <TabsTrigger value="missions" className="gap-2"><Target className="h-4 w-4" /> Missões</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Badges</CardTitle>
                <CardDescription>Sistema de badges será implementado em breve</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  As tabelas de badges ainda não foram criadas no banco de dados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Missões</CardTitle>
                <CardDescription>Sistema de missões será implementado em breve</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  As tabelas de missões ainda não foram criadas no banco de dados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
