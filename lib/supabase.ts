import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nrhqwtsjtazoquvnknrc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHF3dHNqdGF6b3F1dm5rbnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjQ0MzksImV4cCI6MjA4NzI0MDQzOX0.hhEv8RlbAQ2Js0v1w93_Bv77A9Z1jgjAbotqW9fPze0';

export const supabase = createClient(supabaseUrl, supabaseKey);
