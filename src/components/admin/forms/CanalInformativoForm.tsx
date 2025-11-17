
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
  url_midia: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Permite vazio
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: 'URL inválida'
  }),
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
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
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
    console.log('📝 Dados do formulário recebidos:', values);
    console.log('🖼️ URL da imagem uploadada:', uploadedImageUrl);
    console.log('🔗 URL da mídia do campo:', values.url_midia);
    
    setIsSubmitting(true);
    try {
      const data: CreateCanalInformativoData = {
        titulo: values.titulo,
        conteudo: values.conteudo || undefined,
        tipo_conteudo: values.tipo_conteudo,
        url_midia: uploadedVideoUrl || uploadedImageUrl || values.url_midia || undefined,
        link_externo: values.link_externo || undefined,
      };

      console.log('📤 Dados finais para envio:', data);

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
      setUploadedVideoUrl('');
      setDataSorteio('');
      setPremios(premiosIniciais);
    } catch (error) {
      console.error('Erro ao criar publicação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    console.log('📤 Upload de imagem realizado, URL recebida:', url);
    setUploadedImageUrl(url);
    form.setValue('url_midia', '');
  };

  const handleImageRemove = () => {
    setUploadedImageUrl('');
  };

  const handleUrlChange = (url: string) => {
    console.log('🔗 URL de mídia alterada:', url);
    if (url) {
      setUploadedImageUrl('');
      setUploadedVideoUrl('');
    }
    form.setValue('url_midia', url);
  };

  const handleVideoUpload = (url: string) => {
    console.log('📹 Upload de vídeo realizado, URL recebida:', url);
    setUploadedVideoUrl(url);
    form.setValue('url_midia', '');
  };

  const handleVideoRemove = () => {
    setUploadedVideoUrl('');
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

                {tipoConteudo === 'imagem' && (
                  <div className="space-y-2">
                    <FormLabel>Imagem</FormLabel>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-2">
                        <ImageUpload
                          value={uploadedImageUrl}
                          onChange={handleImageUpload}
                          onRemove={handleImageRemove}
                          bucket="imagens_eventos"
                          folder="canal-informativo"
                          maxSize={10}
                          accept="image/*"
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
                                  placeholder="URL da imagem" 
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
                )}

                {tipoConteudo === 'video' && (
                  <div className="space-y-2">
                    <FormLabel>Vídeo</FormLabel>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-2">
                        <ImageUpload
                          value={uploadedVideoUrl}
                          onChange={handleVideoUpload}
                          onRemove={handleVideoRemove}
                          bucket="videos_canal"
                          folder="videos"
                          maxSize={500}
                          accept="video/*"
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
                                  placeholder="URL do vídeo (YouTube ou link direto)" 
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
                )}

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
