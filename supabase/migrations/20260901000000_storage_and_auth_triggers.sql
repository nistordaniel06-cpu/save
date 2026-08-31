-- ============================================================================
-- SAVE Platform — Private Storage & Auth Profile Trigger Migration
-- ============================================================================

-- 1. Create Private Storage Bucket 'documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- STRICTLY PRIVATE
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- 2. Storage RLS Policies
DROP POLICY IF EXISTS "Org members can upload private documents" ON storage.objects;
CREATE POLICY "Org members can upload private documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  public.is_org_member(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Org members can read private documents" ON storage.objects;
CREATE POLICY "Org members can read private documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  public.is_org_member(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Org members can delete private documents" ON storage.objects;
CREATE POLICY "Org members can delete private documents" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  public.is_org_member(((storage.foldername(name))[1])::uuid)
);

-- 3. Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Director Financiar (CFO)')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Additional RLS Table Policies for Complete Multi-Tenant Protection
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can add organization members when creating an org" ON public.organization_members;
CREATE POLICY "Users can add organization members when creating an org" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    public.is_org_member(organization_id)
  );

DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON public.profiles;
CREATE POLICY "Users can view profiles in their organizations" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    id IN (
      SELECT om.user_id 
      FROM public.organization_members om
      WHERE om.organization_id IN (
        SELECT my_om.organization_id 
        FROM public.organization_members my_om 
        WHERE my_om.user_id = auth.uid()
      )
    )
  );
