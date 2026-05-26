import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Config {
  id?: number;
  ping: number;
  config: string;
  channel: string;
  protocol: string;
  tested_at: string;
  created_at?: string;
}

export async function getDatabase() {
  // تابع برای سازگاری با کد قدیم
  // در Supabase نیازی به initialize ندارید
  return supabase;
}

export async function initializeDatabase() {
  // اگر جدول وجود نداشته باشد، می‌توانید آن را از Supabase Dashboard یا با CLI ایجاد کنید
  // SQL برای ایجاد جدول:
  /*
  CREATE TABLE configs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ping REAL NOT NULL,
    config TEXT NOT NULL,
    channel TEXT NOT NULL,
    protocol TEXT NOT NULL,
    tested_at TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  */
  console.log('Database is already initialized on Supabase');
}

export async function clearAndInsertConfigs(configs: Config[]) {
  try {
    // حذف تمام داده‌های قدیمی
    const { error: deleteError } = await supabase
      .from('configs')
      .delete()
      .neq('id', 0);

    if (deleteError) throw deleteError;

    // درج داده‌های جدید
    const { error: insertError, data } = await supabase
      .from('configs')
      .insert(
        configs.map(config => ({
          ping: config.ping,
          config: config.config,
          channel: config.channel,
          protocol: config.protocol,
          tested_at: config.tested_at,
        }))
      );

    if (insertError) throw insertError;
    return data;
  } catch (error) {
    console.error('Error in clearAndInsertConfigs:', error);
    throw error;
  }
}

export async function getAllConfigs(): Promise<Config[]> {
  try {
    const { data, error } = await supabase
      .from('configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Config[];
  } catch (error) {
    console.error('Error in getAllConfigs:', error);
    throw error;
  }
}
