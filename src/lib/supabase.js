import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if these variables are initialized and not placeholder values
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here';

if (!isConfigured) {
  console.warn("Supabase URL hoặc Anon Key chưa được cấu hình hoặc đang dùng giá trị mặc định. Ứng dụng sẽ hoạt động ở chế độ Local Storage.");
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
