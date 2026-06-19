-- ==========================================
-- Talk2SQL: Reports Migration Setup Script
-- ==========================================

-- 1. Create the reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL,
    report_data JSONB NOT NULL,
    raw_data_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Users can insert their own reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view their own reports" 
    ON public.reports FOR SELECT 
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can delete their own reports" 
    ON public.reports FOR DELETE 
    USING (auth_user_id = auth.uid());

-- ==========================================
-- 2. Create the Storage Bucket for raw data
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-data', 'report-data', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the storage bucket
CREATE POLICY "Users can upload their own report data"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'report-data' AND auth.uid() = owner);

CREATE POLICY "Users can read their own report data"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'report-data' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own report data"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'report-data' AND auth.uid() = owner);
