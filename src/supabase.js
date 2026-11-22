import { createClient } from '@supabase/supabase-js'

// Solo claves anonimas en el front: RLS en Supabase protege cada perfil.
// Si las variables no estan definidas, la app corre en MODO LOCAL
// (el progreso se guarda en este navegador como respaldo).
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudConfigured = Boolean(url && anon)
export const supa = cloudConfigured ? createClient(url, anon) : null
