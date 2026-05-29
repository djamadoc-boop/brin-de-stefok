// supabase.js - Configuration de la connexion unique - Brin de Stef
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://bnugdfehnamfgkapymev.supabase.co";
const supabaseKey = "sb_publishable__qbUzq8ULFT2Ghz2si9aSw_nxQMXEcc";

// Initialisation différée + cache
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const CACHE_KEY = 'brindestef_products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProducts() {
  // 1. Vérifier le cache
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  }
  
  // 2. Fetch depuis Supabase
  const supabase = createClient(
    'https://bnugdfehnamfgkapymev.supabase.co',
    VOTRE_ANON_KEY
  );
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image, category') // Colonnes spécifiques uniquement
    .order('id', { ascending: true });
  
  if (error) throw error;
  
  // 3. Mettre en cache
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}

// Initialisation au moment opportun (après le rendu initial)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  // Attendre que l'animation d'entrée soit finie
  requestIdleCallback(async () => {
    const products = await getProducts();
    renderProducts(products);
  });
}