import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from "openai";

import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
export const openai = new OpenAIApi(configuration);