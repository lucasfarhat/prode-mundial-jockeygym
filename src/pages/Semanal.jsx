import { useState, useEffect } from 'react'
import { getGanadoresSemanales, getPremios } from '../lib/supabase'

export default function Semanal() {
  const [ganadores, setGanadores] = useState([])
  const [premios, setPremios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getGanadoresSemanales().catch(() => []),
      getPremios().catch(() => []),
    ]).then(([g, p]) => {
      setGanadores(g || [])
      setPremios(p || [])
      setLoading(false)
    })
  }, [])

  // Calcular semana actual (para mostrar cuándo es la próxima)
  const hoy = new Date()
  const diasHastaLunes = (hoy.getDay() + 6) % 7
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - diasHastaLunes)
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)

  const fmtFecha = (d) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  // Agrupar ganadores por semana (puede haber varios si el premio tiene mas de un cupo)
  const semanas = []
  const porSemana = {}
  ganadores.forEach((g) => {
    if (!porSemana[g.semana]) {
      porSemana[g.semana] = []
      semanas.push(g.semana)
    }
    porSemana[g.semana].push(g)
  })

  const premioDe = (semana) => premios.find((p) => p.semana === semana)

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>Ganador semanal</h2>

      <div className="alert alert-success">
        📅 El ganador se calcula cada <strong>domingo a las 23:59 hs</strong> con los partidos de esa semana.
        <br />
        Semana actual: {fmtFecha(lunes)} al {fmtFecha(domingo)}
      </div>

      {premios.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>🎁 Premios en juego</h3>
          {premios.map((p) => (
            <div key={p.semana} style={{ display: 'flex', gap: 10, fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
              <span style={{ fontWeight: 600, minWidth: 80 }}>Semana {p.semana}</span>
              <span style={{ flex: 1 }}>{p.premio}</span>
              {p.cantidad_ganadores > 1 && (
                <span style={{ color: '#666' }}>{p.cantidad_ganadores} ganadores</span>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#aaa', padding: '1rem' }}>Cargando...</div>
      ) : semanas.length === 0 ? (
        <div className="alert alert-info">
          Todavía no hay ganadores semanales. El primer ganador se anunciará el domingo {fmtFecha(domingo)}.
        </div>
      ) : (
        semanas.map((semana) => {
          const grupo = porSemana[semana]
          const premio = grupo[0].premio || premioDe(semana)?.premio
          const hayEmpate = grupo.some((g) => g.empate_pendiente)
          return (
            <div key={semana} style={{ marginBottom: '1rem' }}>
              <div className="winner-week" style={{ marginBottom: 6 }}>
                Semana {semana} · {grupo[0].fecha_inicio} al {grupo[0].fecha_fin}
                {premio ? <> · 🎁 {premio}</> : null}
              </div>
              {hayEmpate && (
                <div className="alert alert-warning" style={{ marginBottom: 6 }}>
                  ⏳ Hay empate total esta semana. El ganador se define por sorteo.
                </div>
              )}
              {grupo.map((g) => (
                <div className="winner-card" key={g.id}>
                  <div>
                    <div className="winner-name">
                      {g.empate_pendiente ? '⏳ ' : '🥇 '}
                      {g.nombre_ganador}
                      {g.definido_por_sorteo && (
                        <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 6, color: '#666' }}>🎲 por sorteo</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="winner-pts">{g.puntos_semana}</div>
                    <div className="winner-detail">{g.exactos_semana} exactos · dif {g.diferencia_semana}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        })
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Cómo se define el ganador semanal</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>1. Mayor cantidad de <strong>puntos</strong> en los partidos de la semana.</p>
          <p style={{ marginBottom: 6 }}>2. En caso de empate: más <strong>resultados exactos</strong>.</p>
          <p style={{ marginBottom: 6 }}>3. Si persiste: menor <strong>diferencia acumulada de goles</strong> (suma de |pronóstico - real| en cada partido).</p>
          <p>4. Si el empate es total, el ganador se define por <strong>sorteo</strong> 🎲.</p>
        </div>
      </div>
    </div>
  )
}
