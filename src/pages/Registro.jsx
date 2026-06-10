import { useState } from 'react'
import { signUp, signIn } from '../lib/supabase'

const SEDES = [
  'DISTRITO',
  'BARRIO SUR',
  'BARRIO NORTE (MUÑECAS)',
  'CENTRO',
  'SOLAR',
  'CATALINAS',
  'PERON',
]

export default function Registro({ onSuccess }) {
  const [mode, setMode] = useState('register') // 'register' | 'login'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', sede: '', telefono: '', password: '',
  })

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit() {
    setError('')
    if (!form.email || !form.password) {
      setError('Completá email y contraseña.')
      return
    }
    if (mode === 'register' && (!form.nombre || !form.apellido || !form.telefono)) {
      setError('Completá todos los campos.')
      return
    }
    if (mode === 'register' && !form.sede) {
      setError('Elegí tu sede.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await signUp({
          email: form.email,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          sede: form.sede,
        })
        setSuccess('¡Cuenta creada! Ya podés cargar tus pronósticos. 🎉')
        setTimeout(() => onSuccess?.(), 1500)
      } else {
        await signIn({ email: form.email, password: form.password })
        onSuccess?.()
      }
    } catch (err) {
      if (err.message?.includes('already registered')) setError('Ese email ya está registrado. Intentá iniciar sesión.')
      else if (err.message?.includes('Invalid login')) setError('Email o contraseña incorrectos.')
      else setError(err.message || 'Error al procesar. Intentá de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="form-card">
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1.25rem' }}>
          {mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {mode === 'register' && (
          <>
            <div className="form-row">
              <label className="form-label">Nombre</label>
              <input className="form-input" name="nombre" placeholder="Ej: Juan" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label className="form-label">Apellido</label>
              <input className="form-input" name="apellido" placeholder="Ej: Pérez" value={form.apellido} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="form-row">
          <label className="form-label">Email</label>
          <input className="form-input" name="email" type="email" placeholder="juan@ejemplo.com" value={form.email} onChange={handleChange} />
        </div>

        {mode === 'register' && (
          <>
            <div className="form-row">
              <label className="form-label">Sede</label>
              <select className="form-input" name="sede" value={form.sede} onChange={handleChange}>
                <option value="">Elegí tu sede</option>
                {SEDES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Teléfono</label>
              <input className="form-input" name="telefono" type="tel" placeholder="+54 9 381 000-0000" value={form.telefono} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="form-row">
          <label className="form-label">Contraseña</label>
          <input className="form-input" name="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Procesando...' : mode === 'register' ? '👤 Registrarme' : '🔑 Ingresar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#888' }}>
          {mode === 'register' ? (
            <>¿Ya tenés cuenta? <span className="link-btn" onClick={() => setMode('login')}>Iniciar sesión</span></>
          ) : (
            <>¿No tenés cuenta? <span className="link-btn" onClick={() => setMode('register')}>Registrarme</span></>
          )}
        </div>
      </div>
    </div>
  )
}
