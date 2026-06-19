import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- AUTH ---

export async function signUp({ email, password, nombre, apellido, telefono, sede }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, apellido, telefono, sede },
    },
  })
  if (error) throw error

  // El perfil se crea automaticamente via trigger on_auth_user_created
  // (ver supabase-registro-sede.sql). Los datos extra viajan en
  // options.data y quedan en raw_user_meta_data.
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// --- PRONÓSTICOS ---

export async function guardarPronostico({ userId, partidoId, golesLocal, golesVisitante }) {
  const { error } = await supabase
    .from('pronosticos')
    .upsert(
      {
        user_id: userId,
        partido_id: partidoId,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
      },
      { onConflict: 'user_id,partido_id' }
    )
  if (error) throw error
}

export async function getPronosticosUsuario(userId) {
  const { data, error } = await supabase
    .from('pronosticos')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

// --- PARTIDOS ---

export async function getPartidos() {
  const { data, error } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha', { ascending: true })
  if (error) throw error
  return data
}

// --- TABLA DE POSICIONES ---

export async function getTablaPosiciones() {
  // Vista de Supabase que calcula puntos por usuario (acumulado del torneo)
  const { data, error } = await supabase
    .from('tabla_posiciones')
    .select('*')
    .order('puntos', { ascending: false })
    .order('exactos', { ascending: false })
    .order('diferencia_total', { ascending: true })
  if (error) throw error
  return data
}

export async function getTablaSemanaActual() {
  // Vista que cuenta solo los partidos de la semana en curso (lun-dom ART)
  const { data, error } = await supabase
    .from('tabla_semana_actual')
    .select('*')
    .order('puntos', { ascending: false })
    .order('exactos', { ascending: false })
    .order('diferencia_total', { ascending: true })
  if (error) throw error
  return data
}

// --- GANADOR SEMANAL ---

export async function getGanadoresSemanales() {
  const { data, error } = await supabase
    .from('ganadores_semanales')
    .select('*')
    .order('semana', { ascending: false })
    .order('puntos_semana', { ascending: false })
  if (error) throw error
  return data
}

// --- PREMIOS SEMANALES ---

export async function getPremios() {
  const { data, error } = await supabase
    .from('premios_semanales')
    .select('*')
    .order('semana', { ascending: true })
  if (error) throw error
  return data
}

export async function guardarPremio({ semana, premio, cantidadGanadores }) {
  const { error } = await supabase
    .from('premios_semanales')
    .upsert({
      semana,
      premio,
      cantidad_ganadores: cantidadGanadores,
      updated_at: new Date().toISOString(),
    })
  if (error) throw error
}

export async function borrarPremio(semana) {
  const { error } = await supabase
    .from('premios_semanales')
    .delete()
    .eq('semana', semana)
  if (error) throw error
}

// --- ADMIN: ganadores semanales y sorteo ---

export async function calcularGanadoresSemana({ semana, fechaInicio, fechaFin }) {
  const { data, error } = await supabase.rpc('calcular_ganadores_semana', {
    p_semana: semana,
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  })
  if (error) throw error
  return data
}

export async function sortearGanadoresSemana(semana) {
  const { data, error } = await supabase.rpc('sortear_ganadores_semana', {
    p_semana: semana,
  })
  if (error) throw error
  return data
}

export async function getGanadoresDeSemana(semana) {
  const { data, error } = await supabase
    .from('ganadores_semanales')
    .select('*')
    .eq('semana', semana)
    .order('puntos_semana', { ascending: false })
    .order('exactos_semana', { ascending: false })
    .order('diferencia_semana', { ascending: true })
  if (error) throw error
  return data
}

// --- ADMIN: cargar resultado real ---

export async function cargarResultado({ partidoId, golesLocal, golesVisitante }) {
  const { error } = await supabase
    .from('partidos')
    .update({
      resultado_local: golesLocal,
      resultado_visitante: golesVisitante,
      jugado: true,
    })
    .eq('id', partidoId)
  if (error) throw error
}
