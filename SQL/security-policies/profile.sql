ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_select on public.profile;
CREATE POLICY profile_select
ON public.profile
AS PERMISSIVE
FOR SELECT TO authenticated USING (
  true
);

DROP POLICY IF EXISTS profile_update on public.profile;
CREATE POLICY profile_update
ON public.profile
AS PERMISSIVE
FOR UPDATE TO authenticated USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

DROP POLICY IF EXISTS profile_insert on public.profile;
CREATE POLICY profile_insert
ON public.profile
AS PERMISSIVE
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = id
);

DROP POLICY IF EXISTS profile_delete on public.profile;
CREATE POLICY profile_delete
ON public.profile
AS PERMISSIVE
FOR DELETE TO authenticated 
USING (
  auth.uid() = id
);

