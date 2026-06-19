import { useState, useEffect } from 'react'
import { getTablaPosiciones, getTablaSemanaActual } from '../lib/supabase'

export default function Tabla() {
  const [vista, setVista] = useState('completa') // 'semana' | 'completa'
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetcher = vista === 'semana' ? getTablaSemanaActual : getTablaPosiciones
    fetcher().then((data) => {
      setJugadores(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [vista])

  const medals = ['🥇', '🥈', '🥉']

  const tabBtn = (activo) => ({
    flex: 1,
    padding: '10px 14px',
    border: activo ? 'none' : '1px solid #ddd',
    borderRadius: 10,
    background: activo ? 'var(--gold)' : '#fff',
    color: activo ? '#fff' : '#666',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    transition: 'all .15s',
  })

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>Tabla de posiciones</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <button onClick={() => setVista('semana')} style={tabBtn(vista === 'semana')}>
          📅 SEMANA EN CURSO
        </button>
        <button onClick={() => setVista('completa')} style={tabBtn(vista === 'completa')}>
          🏆 TABLA COMPLETA
        </button>
      </div>

      {vista === 'semana' && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          🔥 Solo cuenta los partidos de <strong>esta semana</strong>. ¡Sumate ahora y peleá el premio semanal aunque arranques tarde!
        </div>
      )}

      {loading ? (
        <div style={{ color: '#aaa', padding: '1rem' }}>Cargando tabla...</div>
      ) : jugadores.length === 0 ? (
        <div className="alert alert-info">
          Aún no hay pronósticos cargados. ¡Sé el primero en jugar!
        </div>
      ) : (
        <>
          <div className="top3-grid">
            {jugadores.slice(0, 3).map((j, i) => (
              <div className="top3-card" key={j.user_id}>
                <div className="top3-medal">{medals[i]}</div>
                <div className="top3-name">{j.nombre}</div>
                <div className="top3-pts">{j.puntos}</div>
                <div className="top3-sub">pts</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '.5rem 1rem' }}>
            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: 'center' }}>Exactos</th>
                  <th style={{ textAlign: 'center' }}>Ganadores</th>
                  <th style={{ color: 'var(--gold-deep)', textAlign: 'center' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j, i) => (
                  <tr key={j.user_id}>
                    <td className="rank-num">{i + 1}</td>
                    <td style={{ fontWeight: i < 3 ? 600 : 400 }}>{j.nombre}</td>
                    <td style={{ textAlign: 'center', color: '#555' }}>{j.exactos}</td>
                    <td style={{ textAlign: 'center', color: '#555' }}>{j.ganadores}</td>
                    <td className="rank-pts">{j.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
            🔄 Actualización en tiempo real · Desempate: exactos → menor diferencia de goles
          </div>
        </>
      )}
    </div>
  )
}
