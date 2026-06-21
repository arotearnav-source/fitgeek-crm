// =====================================================================
//  The Fit Geek — Global Cloud Database configuration (Supabase)
// =====================================================================
//
//  1. Create a free project at https://supabase.com
//  2. In the project, open  SQL Editor  and run the script in
//     supabase-setup.sql  (creates the "clients" table + access rules).
//  3. Open  Project Settings -> API  and copy:
//       - Project URL          ->  paste into SUPABASE_URL below
//       - Project API key (anon / public)  ->  paste into SUPABASE_ANON_KEY
//
//  The "anon public" key is SAFE to put here — it is designed to be used
//  in the browser. Do NOT paste the "service_role" secret key.
//
//  Until both values are filled in, the app keeps working exactly as
//  before (local-only, per-device). Once filled in, signups sync globally.
// =====================================================================

window.SUPABASE_URL = "https://wvgiqbhsbswngtqhidmq.supabase.co";       // e.g. https://abcdxyz.supabase.co
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2lxYmhzYnN3bmd0cWhpZG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjkwODQsImV4cCI6MjA5NzU0NTA4NH0.pmzs8KeUNFAE0oqVYAg3GrDRXtKMu7LgpoZ47hehmvc";
