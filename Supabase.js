// supabase.js - Configuration de la connexion unique - Brin de Stef
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://bnugdfehnamfgkapymev.supabase.co";
const supabaseKey = "sb_publishable__qbUzq8ULFT2Ghz2si9aSw_nxQMXEcc";

// Initialisation du client unique
export const supabase = createClient(supabaseUrl, supabaseKey);