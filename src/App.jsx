import { useState, useEffect } from 'react'
import { supabase, getSession } from './lib/supabase'
import Fixture from './pages/Fixture'
import Tabla from './pages/Tabla'
import Semanal from './pages/Semanal'
import Registro from './pages/Registro'
import Reglas from './pages/Reglas'
import Admin from './pages/Admin'

function JockeyLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Jockey Gym">
      <rect width="64" height="64" rx="10" fill="#0099CC"/>
      <path d="M14 46 L26 18 L34 18 L22 46 Z" fill="#ffffff"/>
      <path d="M30 46 L42 18 L50 18 L38 46 Z" fill="#ffffff"/>
    </svg>
  )
}

const NAV = [
  { id: 'fixture', label: 'Fixture', icon: '⚽' },
  { id: 'tabla', label: 'Tabla', icon: '🏆' },
  { id: 'semanal', label: 'Semanal', icon: '📅' },
  { id: 'reglas', label: 'Reglas', icon: 'ℹ️' },
]

export default function App() {
  const [section, setSection] = useState('fixture')
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Pase lo que pase, la app no puede quedarse colgada en "Cargando...":
    // si getSession falla o se demora, entra como deslogueado y el
    // onAuthStateChange la actualiza cuando la sesion aparezca.
    getSession()
      .then(async (s) => {
        if (!mounted) return
        setSession(s)
        if (s?.user) await fetchPerfil(s.user.id)
      })
      .catch((err) => {
        console.error('getSession fallo en la carga inicial:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return
      setSession(s)
      if (s?.user) await fetchPerfil(s.user.id)
      else setPerfil(null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function fetchPerfil(userId) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) console.error('fetchPerfil error:', error)
    setPerfil(data ?? null)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        Cargando...
      </div>
    )
  }

  const navItems = [
    ...NAV,
    ...(perfil?.es_admin ? [{ id: 'admin', label: 'Admin', icon: '🔧' }] : []),
    session
      ? { id: 'logout', label: 'Salir', icon: '🚪' }
      : { id: 'registro', label: 'Ingresar', icon: '👤' },
  ]

  async function handleNav(id) {
    if (id === 'logout') {
      await supabase.auth.signOut()
      setSection('fixture')
      return
    }
    setSection(id)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-bar">
          <JockeyLogo className="brand-logo" />
          <div className="brand-divider" />
          <div className="brand-text">
            <div className="brand-kicker">JOCKEY · GYM</div>
            <div className="brand-title">Prode Mundial <span>2026</span></div>
            <div className="brand-sub">⚽ México · EE.UU. · Canadá</div>
          </div>
          {session && perfil && (
            <div className="user-chip">Hola, {perfil.nombre.split(' ')[0]}</div>
          )}
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${section === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {section === 'fixture' && <Fixture session={session} />}
        {section === 'tabla' && <Tabla />}
        {section === 'semanal' && <Semanal />}
        {section === 'reglas' && <Reglas />}
        {section === 'registro' && <Registro onSuccess={() => setSection('fixture')} />}
        {section === 'admin' && perfil?.es_admin && <Admin />}
      </main>

      <footer className="site-footer">
        <JockeyLogo className="footer-logo" />
        <div className="footer-text">Organiza <b>Jockey Gym</b></div>
        <div className="footer-mini">Prode Mundial 2026</div>
      </footer>
    </div>
  )
}
