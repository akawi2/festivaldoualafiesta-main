import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Défaut = le Supabase cloud de production. Ne JAMAIS changer ces valeurs en dur
// pour tester en local — c'est exactement ce qui a failli casser la prod.
// Pour développer contre un autre projet à la place, créer un fichier
// `.env.local` (jamais commité, voir .gitignore) avec :
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_PUBLISHABLE_KEY=...
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mpjnfyppuaurbffhtocw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wam5meXBwdWF1cmJmZmh0b2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzM4MTQsImV4cCI6MjA3MTQ0OTgxNH0.ZelBmEatb9H7DoH4Ky7WCNoWyzPLop8HzfLxzmaKPxk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
