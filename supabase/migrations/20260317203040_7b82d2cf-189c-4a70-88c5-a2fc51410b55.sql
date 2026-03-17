
-- Add autor_id to avisos_sistema (was missing)
ALTER TABLE public.avisos_sistema ADD COLUMN IF NOT EXISTS autor_id uuid;

-- Add FK for avisos_sistema.autor_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'avisos_sistema_autor_id_fkey' AND table_name = 'avisos_sistema'
  ) THEN
    ALTER TABLE public.avisos_sistema 
      ADD CONSTRAINT avisos_sistema_autor_id_fkey 
      FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
  END IF;
END $$;
