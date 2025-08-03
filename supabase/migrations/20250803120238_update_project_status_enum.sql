CREATE TYPE public.project_status_new AS ENUM ('showcase', 'NS-Only', 'Archive', 'Draft');

ALTER TABLE public.projects RENAME COLUMN status TO status_old;

ALTER TABLE public.projects ADD COLUMN status public.project_status_new;

UPDATE public.projects
SET status = 
    CASE 
        WHEN status_old = 'active' THEN 'showcase'::public.project_status_new
        WHEN status_old = 'archived' THEN 'Archive'::public.project_status_new
        WHEN status_old = 'draft' THEN 'Draft'::public.project_status_new
        ELSE 'Draft'::public.project_status_new
    END;

ALTER TABLE public.projects DROP COLUMN status_old;

ALTER TABLE public.projects ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'Draft';

