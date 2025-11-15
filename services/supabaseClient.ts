
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjoakqgzzxdgenhjnghb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqb2FrcWd6enhkZ2VuaGpuZ2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTcxMDMsImV4cCI6MjA3ODc5MzEwM30.vCsa0a4Y8w5Ypuf2G67AdUMZQ2ggCI0N4PnF6tiIoXk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
