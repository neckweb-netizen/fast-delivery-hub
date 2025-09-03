
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { useCanalInformativo, CreateCanalInformativoData } from '@/hooks/useCanalInformativo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultadoSorteioForm } from './ResultadoSorteioForm';

const formSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  conteudo: z.string().optional(),
  tipo_conteudo: z.enum(['noticia', 'video', 'imagem', 'resultado_sorteio']),
  url_midia: z.string().url('URL inválida').optional().or(z.literal('')),
  link_externo: z.string().url('URL inválida').optional().or(z.literal('')),
});

const premiosIniciais = [
  { premio: '1º', milhar: '', grupo: '' },
  { premio: '2º', milhar: '', grupo: '' },
  { premio: '3º', milhar: '', grupo: '' },
  { premio: '4º', milhar: '', grupo: '' },
  { premio: '5º', milhar: '', grupo: '' }
];

export const CanalInformativoForm = () => {
  const { createItem } = useCanalInformativo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [dataSorteio, setDataSorteio] = useState<string>('');
  const [premios, setPremios] = useState(premiosIniciais);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      tipo_conteudo: 'noticia',
      url_midia: '',
      link_externo: '',
    },
  });

  const tipoConteudo = form.watch('tipo_conteudo');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const data: CreateCanalInformativoData = {
        titulo: values.titulo,
        conteudo: values.conteudo || undefined,
        tipo_conteudo: values.tipo_conteudo,
        url_midia: uploadedImageUrl || values.url_midia || undefined,
        link_externo: values.link_externo || undefined,
      };

      // Se for resultado de sorteio, adicionar os dados específicos
      if (values.tipo_conteudo === 'resultado_sorteio') {
        data.resultado_sorteio = {
          data_sorteio: dataSorteio,
          premios: premios
        };
      }
      
      createItem(data);
      form.reset();
      setUploadedImageUrl('');
      setDataSorteio('');
      setPremios(premiosIniciais);
    } catch (error) {
      console.error('Erro ao criar publicação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
    form.setValue('url_midia', '');
  };

  const handleImageRemove = () => {
    setUploadedImageUrl('');
  };

  const handleUrlChange = (url: string) => {
    if (url) {
      setUploadedImageUrl('');
    }
    form.setValue('url_midia', url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Publicação no Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da publicação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conteúdo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="noticia">Notícia</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="imagem">Imagem</SelectItem>
                      <SelectItem value="resultado_sorteio">Resultado de Sorteio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipoConteudo === 'resultado_sorteio' ? (
              <ResultadoSorteioForm
                dataSorteio={dataSorteio}
                premios={premios}
                onDataSorteioChange={setDataSorteio}
                onPremiosChange={setPremios}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="conteudo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite o conteúdo da publicação" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Mídia (Opcional)</FormLabel>
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Enviar do Dispositivo</TabsTrigger>
                      <TabsTrigger value="url">URL da Mídia</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-2">
                      <ImageUpload
                        value={uploadedImageUrl}
                        onChange={handleImageUpload}
                        onRemove={handleImageRemove}
                        bucket="imagens_eventos"
                        folder="canal-informativo"
                        maxSize={10}
                        accept="image/*,video/*"
                      />
                    </TabsContent>
                    
                    <TabsContent value="url" className="space-y-2">
                      <FormField
                        control={form.control}
                        name="url_midia"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="https://exemplo.com/imagem.jpg ou https://youtube.com/watch?v=..." 
                                {...field}
                                onChange={(e) => handleUrlChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <FormField
                  control={form.control}
                  name="link_externo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Externo (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://exemplo.com/link-para-abrir" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
