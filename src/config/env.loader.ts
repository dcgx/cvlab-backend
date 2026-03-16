/**
 * Carga variables de entorno según SUPABASE_PROJECT (dev | prod).
 * Ejecutar al inicio de la app si se usan múltiples proyectos Supabase.
 */
export function loadSupabaseEnv(): void {
  const project = process.env.SUPABASE_PROJECT;
  if (!project) return;

  const isDev = project === 'dev';
  const urlKey = isDev ? 'SUPABASE_URL_DEV' : 'SUPABASE_URL_PROD';
  const anonKey = isDev ? 'SUPABASE_ANON_KEY_DEV' : 'SUPABASE_ANON_KEY_PROD';
  const dbKey = isDev ? 'DATABASE_URL_DEV' : 'DATABASE_URL_PROD';

  const url = process.env[urlKey];
  const anonKeyVal = process.env[anonKey];
  const dbUrl = process.env[dbKey];

  if (url) process.env.SUPABASE_URL = url;
  if (anonKeyVal) process.env.SUPABASE_ANON_KEY = anonKeyVal;
  if (dbUrl) process.env.DATABASE_URL = dbUrl;
}
