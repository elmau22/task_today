import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://vydtiijkcnpholfzukas.supabase.co';
const defaultKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZHRpaWprY25waG9sZnp1a2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4OTU1OTAsImV4cCI6MjEwODQ3MTU5MH0.eUdnMTHx87fWO1EiY6gDyzDyS9FFTwW0FMUZkmT4ODY';

let supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || defaultUrl;
const supabaseKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || defaultKey;

// Bersihkan akhiran /rest/v1 atau garis miring berlebih agar PostgREST tidak mengembalikan error 404
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

export const supabase = createClient(supabaseUrl, supabaseKey);
