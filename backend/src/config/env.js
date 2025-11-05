import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://gdbqmwfqogabovbizukp.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});