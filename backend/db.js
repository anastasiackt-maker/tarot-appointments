const { createClient } = require('@supabase/supabase-js');

// Эти переменные мы добавим в настройки Netlify позже
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
