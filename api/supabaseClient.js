import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gugursnnzngieaztnzjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Z3Vyc25uem5naWVhenRuempnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDY5NDgsImV4cCI6MjA2MjM4Mjk0OH0.ftKm50NNuKeWeDfer4zsTcqw5sIXkepzB4OA_dsL-J0';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 