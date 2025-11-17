-- Criar bucket para vídeos do canal informativo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos_canal',
  'videos_canal',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
);

-- Políticas RLS para o bucket de vídeos
CREATE POLICY "Vídeos do canal são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos_canal');

CREATE POLICY "Admins podem fazer upload de vídeos do canal"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos_canal' 
  AND auth.uid() IN (
    SELECT id FROM public.usuarios 
    WHERE tipo_conta IN ('admin_geral', 'admin_cidade')
  )
);

CREATE POLICY "Admins podem atualizar vídeos do canal"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos_canal' 
  AND auth.uid() IN (
    SELECT id FROM public.usuarios 
    WHERE tipo_conta IN ('admin_geral', 'admin_cidade')
  )
);

CREATE POLICY "Admins podem deletar vídeos do canal"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos_canal' 
  AND auth.uid() IN (
    SELECT id FROM public.usuarios 
    WHERE tipo_conta IN ('admin_geral', 'admin_cidade')
  )
);