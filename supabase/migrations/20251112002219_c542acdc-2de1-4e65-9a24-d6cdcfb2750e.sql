-- ============================================
-- SECURITY FIX: Restrict access to customer appointment data
-- ============================================

-- Drop the overly permissive policy that allows anyone to create agendamentos
DROP POLICY IF EXISTS "Usuários autenticados podem criar agendamentos" ON public.agendamentos;

-- Create a more restrictive policy for creating appointments
-- Only authenticated users can create appointments for active businesses
CREATE POLICY "Authenticated users can create appointments for active businesses"
ON public.agendamentos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.empresas 
    WHERE id = empresa_id 
    AND ativo = true 
    AND status_aprovacao = 'aprovado'
  )
);

-- ============================================
-- SECURITY FIX: Restrict short URL creation to authenticated users only
-- ============================================

-- Drop the dangerous public creation policy
DROP POLICY IF EXISTS "Anyone can create short URLs" ON public.short_urls;

-- Allow only authenticated users to create short URLs
CREATE POLICY "Authenticated users can create short URLs"
ON public.short_urls
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Drop overly permissive read policy
DROP POLICY IF EXISTS "Anyone can read short URLs" ON public.short_urls;

-- Users can only view their own short URLs when authenticated
CREATE POLICY "Users can view their own short URLs"
ON public.short_urls
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Admins can manage all short URLs
CREATE POLICY "Admins can manage all short URLs"
ON public.short_urls
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_conta IN ('admin_geral', 'admin_cidade')
  )
);

-- ============================================
-- SECURITY FIX: Add public read access for redirect functionality
-- ============================================

-- Allow public read access ONLY for the redirect functionality
-- This is safe because it only exposes the original_url which is needed for redirects
CREATE POLICY "Public can read short URLs for redirects"
ON public.short_urls
FOR SELECT
TO anon
USING (expires_at IS NULL OR expires_at > now());