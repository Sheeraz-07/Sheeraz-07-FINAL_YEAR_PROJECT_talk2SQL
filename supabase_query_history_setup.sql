-- ==========================================
-- Talk2SQL: Query History Migration Setup Script
-- ==========================================

-- 1. Create the query_history table
CREATE TABLE IF NOT EXISTS public.query_history (
    id UUID PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(user_id) ON DELETE CASCADE,
    natural_query TEXT NOT NULL,
    generated_sql TEXT NOT NULL,
    row_count INT DEFAULT 0,
    execution_time FLOAT DEFAULT 0.0,
    is_favorite BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on query_history
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for query_history
CREATE POLICY "Users can insert their own query history" 
    ON public.query_history FOR INSERT 
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view their own query history" 
    ON public.query_history FOR SELECT 
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own query history" 
    ON public.query_history FOR UPDATE 
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can delete their own query history" 
    ON public.query_history FOR DELETE 
    USING (auth_user_id = auth.uid());
