import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useProblemaDetalhes } from '@/hooks/useProblemasCidade';

interface ComentarioFormProps {
  problemaId: string;
}

export const ComentarioForm = ({ problemaId }: ComentarioFormProps) => {
  const [conteudo, setConteudo] = useState('');
  const { criarComentario } = useProblemaDetalhes(problemaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;

    await criarComentario.mutateAsync({ conteudo });
    setConteudo('');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Adicione um comentário..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!conteudo.trim()}>
              Comentar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
