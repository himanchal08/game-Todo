-- Run this SQL in your Supabase SQL editor to add parent_task_id to tasks
-- This creates a nullable self-referencing column for subtasks
ALTER TABLE IF EXISTS public.tasks
ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES public.tasks(id);

-- Optional: index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);
