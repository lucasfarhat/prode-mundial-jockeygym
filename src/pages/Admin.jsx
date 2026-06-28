import { useState, useEffect } from 'react'
import {
  supabase, cargarResultado,
  getPremios, guardarPremio, borrarPremio,
  calcularGanadoresSemana, sortearGanadoresSemana, getGanadoresDeSemana,
} from '../lib/supabase'
import { PARTIDOS_GRUPOS, PARTIDOS_ELIMINATORIOS } from '../lib/fixture'
import Flag from '../components/Flag'

function lunesDeEstaSemana() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  return lunes
}

function fmtISO(d) {
  return d.toISOString().slice(0, 10)
}

export default function Admin() {
  const [partidos, setPartidos] = useState([])
  const [resultados, setResultados] = useState({})
  const [saving, setSaving] = useState(null)
  const [fase, setFase] = useState('Grupos')
  const [msg, setMsg] = useState('')

  // premios semanales
  const [premios, setPremios] = useState([])
  const [premioForm, setPremioForm] = useState({ semana: 1, premio: '', cantidad: 1 })
  const [guardandoPremio, setGuardandoPremio] = useState(false)

  // calculo de ganadores + sorteo
  const lunes = lunesDeEstaSemana()
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const [calcForm, setCalcForm] = useState({ semana: 1, inicio: fmtISO(lunes), fin: fmtISO(domingo) })
  const [ganadoresSemana, setGanadoresSemana] = useState([])
  const [calculando, setCalculando] = useState(false)
  const [sorteando, setSorteando] = useState(false)

  const todosLosPartidos = [...PARTIDOS_GRUPOS, ...PARTIDOS_ELIMINATORIOS]

  useEffect(() => {
    supabase.from('partidos').select('*').then(({ data }) => {
      if (data) {
        const map = {}
        data.forEach((p) => {
          map[p.id] = { local: p.resultado_local, visitante: p.resultado_visitante, jugado: p.jugado }
        })
        setPartidos(data)
        setResultados(map)
      }
    })
    cargarPremios()
  }, [])

  async function cargarPremios() {
    try {
      setPremios(await getPremios())
    } catch (err) {
      // tabla todavia no creada: correr supabase-premios-sorteo.sql
      console.error('getPremios:', err)
    }
  }

  async function refrescarGanadores(semana) {
    try {
      setGanadoresSemana(await getGanadoresDeSemana(semana))
    } catch (err) {
      console.error('getGanadoresDeSemana:', err)
    }
  }

  async function handleGuardarPremio() {
    if (!premioForm.premio.trim()) {
      setMsg('❌ Escribí la descripción del premio')
      setTimeout(() => setMsg(''), 4000)
      return
    }
    setGuardandoPremio(true)
    try {
      await guardarPremio({
        semana: parseInt(premioForm.semana),
        premio: premioForm.premio.trim(),
        cantidadGanadores: parseInt(premioForm.cantidad) || 1,
      })
      await cargarPremios()
      setPremioForm({ semana: parseInt(premioForm.semana) + 1, premio: '', cantidad: 1 })
      setMsg('✅ Premio guardado')
    } catch (err) {
      setMsg('❌ Error: ' + err.message)
    }
    setGuardandoPremio(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function handleBorrarPremio(semana) {
    if (!confirm(`¿Borrar el premio de la semana ${semana}?`)) return
    try {
      await borrarPremio(semana)
      await cargarPremios()
    } catch (err) {
      setMsg('❌ Error: ' + err.message)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleCalcular() {
    setCalculando(true)
    try {
      const res = await calcularGanadoresSemana({
        semana: parseInt(calcForm.semana),
        fechaInicio: calcForm.inicio,
        fechaFin: calcForm.fin,
      })
      await refrescarGanadores(parseInt(calcForm.semana))
      if (res?.ganadores === 0) {
        setMsg('⚠️ No hay partidos jugados en ese rango de fechas')
      } else if (res?.sorteo_pendiente) {
        setMsg(`⚠️ Empate total: ${res.empatados} empatados para ${res.cupos} cupo(s). Definilo por sorteo.`)
      } else {
        setMsg(`✅ ${res.ganadores} ganador(es) calculado(s) para la semana ${res.semana}`)
      }
    } catch (err) {
      setMsg('❌ Error: ' + err.message)
    }
    setCalculando(false)
    setTimeout(() => setMsg(''), 6000)
  }

  async function handleSortear() {
    const empatados = ganadoresSemana.filter((g) => g.empate_pendiente)
    if (!confirm(`Se va a sortear entre ${empatados.length} empatados. Los que no salgan sorteados se eliminan de la lista. ¿Continuar?`)) return
    setSorteando(true)
    try {
      const res = await sortearGanadoresSemana(parseInt(calcForm.semana))
      await refrescarGanadores(parseInt(calcForm.semana))
      setMsg(`🎲 Sorteo realizado: ${res.sorteados} ganador(es) elegido(s) al azar`)
    } catch (err) {
      setMsg('❌ Error: ' + err.message)
    }
    setSorteando(false)
    setTimeout(() => setMsg(''), 6000)
  }

  async function handleCargar(partidoId) {
    const r = resultados[partidoId]
    if (r?.local === undefined || r?.visitante === undefined) return
    setSaving(partidoId)
    try {
      await cargarResultado({
        partidoId,
        golesLocal: parseInt(r.local),
        golesVisitante: parseInt(r.visitante),
      })
      setMsg(`✅ Resultado del partido ${partidoId} cargado. Los puntos se calcularon automáticamente.`)
      setTimeout(() => setMsg(''), 4000)
    } catch (err) {
      setMsg('❌ Error: ' + err.message)
    }
    setSaving(null)
  }

  function handleResultado(id, side, val) {
    setResultados((prev) => ({
      ...prev,
      [id]: { ...prev[id], [side]: val },
    }))
  }

  // Grupos: del fixture estatico. Eliminatorias: de la base (las crea el sync).
  const filtrados = fase === 'Grupos'
    ? todosLosPartidos.filter((p) => p.fase === fase)
    : partidos
        .filter((p) => p.fase === fase)
        .map((p) => ({ id: p.id, fase: p.fase, local: p.equipo_local, flagLocal: p.flag_local, visitante: p.equipo_visitante, flagVisitante: p.flag_visitante }))
        .sort((a, b) => a.id - b.id)
  const fases = ['Grupos', 'R32', 'R16', 'QF', 'SF', '3P', 'F']

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>🔧 Panel de administración</h2>
      <div className="alert alert-warning">
        Este panel es solo para administradores. Acá cargás los resultados reales y los puntos se calculan automáticamente vía Supabase.
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="phase-tabs">
        {fases.map((f) => (
          <button key={f} className={`tab-btn ${fase === f ? 'active' : ''}`} onClick={() => setFase(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        {filtrados.map((p) => {
          const r = resultados[p.id] || {}
          const jugado = r.jugado
          return (
            <div className="admin-result-row" key={p.id}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flag name={p.local} emoji={p.flagLocal} /> {p.local}
              </span>
              <div className="score-inputs">
                <input
                  className="score-input"
                  type="number" min="0" max="20"
                  value={r.local ?? ''}
                  onChange={(e) => handleResultado(p.id, 'local', e.target.value)}
                  disabled={jugado}
                  style={{ width: 44 }}
                />
                <span className="score-sep">-</span>
                <input
                  className="score-input"
                  type="number" min="0" max="20"
                  value={r.visitante ?? ''}
                  onChange={(e) => handleResultado(p.id, 'visitante', e.target.value)}
                  disabled={jugado}
                  style={{ width: 44 }}
                />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                {p.visitante} <Flag name={p.visitante} emoji={p.flagVisitante} />
              </span>
              <button
                className="btn-save"
                onClick={() => handleCargar(p.id)}
                disabled={jugado || saving === p.id}
                style={{ marginLeft: 8, fontSize: 12, padding: '5px 12px' }}
              >
                {jugado ? '✅ Cargado' : saving === p.id ? '...' : 'Cargar'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>🎁 Premios semanales</h3>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
          Definí el premio de cada semana y cuántos ganadores hay. Esto se muestra en la sección Semanal.
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#666' }}>
            Semana
            <input
              className="score-input"
              type="number" min="1"
              value={premioForm.semana}
              onChange={(e) => setPremioForm((f) => ({ ...f, semana: e.target.value }))}
              style={{ width: 60, display: 'block', marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: 12, color: '#666', flex: 1, minWidth: 180 }}>
            Premio
            <input
              className="score-input"
              type="text"
              placeholder="Ej: 1 mes de gimnasio gratis"
              value={premioForm.premio}
              onChange={(e) => setPremioForm((f) => ({ ...f, premio: e.target.value }))}
              style={{ width: '100%', display: 'block', marginTop: 4, textAlign: 'left' }}
            />
          </label>
          <label style={{ fontSize: 12, color: '#666' }}>
            Ganadores
            <input
              className="score-input"
              type="number" min="1" max="20"
              value={premioForm.cantidad}
              onChange={(e) => setPremioForm((f) => ({ ...f, cantidad: e.target.value }))}
              style={{ width: 60, display: 'block', marginTop: 4 }}
            />
          </label>
          <button className="btn-save" onClick={handleGuardarPremio} disabled={guardandoPremio} style={{ fontSize: 12, padding: '8px 14px' }}>
            {guardandoPremio ? '...' : 'Guardar'}
          </button>
        </div>

        {premios.length === 0 ? (
          <div style={{ fontSize: 13, color: '#aaa' }}>Todavía no hay premios cargados.</div>
        ) : (
          premios.map((p) => (
            <div className="admin-result-row" key={p.semana}>
              <span style={{ fontSize: 13, fontWeight: 600, width: 80 }}>Semana {p.semana}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{p.premio}</span>
              <span style={{ fontSize: 12, color: '#666' }}>
                {p.cantidad_ganadores} ganador{p.cantidad_ganadores > 1 ? 'es' : ''}
              </span>
              <button
                className="btn-save"
                onClick={() => setPremioForm({ semana: p.semana, premio: p.premio, cantidad: p.cantidad_ganadores })}
                style={{ marginLeft: 8, fontSize: 12, padding: '5px 10px' }}
              >
                Editar
              </button>
              <button
                className="btn-save"
                onClick={() => handleBorrarPremio(p.semana)}
                style={{ marginLeft: 4, fontSize: 12, padding: '5px 10px', background: '#b33' }}
              >
                Borrar
              </button>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>🗓 Calcular ganadores de la semana</h3>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
          Calculá los ganadores cada domingo. Usa la cantidad de ganadores configurada en el premio de esa semana (si no hay premio cargado, 1 ganador). Si hay empate total en el corte, vas a poder definirlo por sorteo.
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#666' }}>
            Semana
            <input
              className="score-input"
              type="number" min="1"
              value={calcForm.semana}
              onChange={(e) => {
                const semana = e.target.value
                setCalcForm((f) => ({ ...f, semana }))
                if (semana) refrescarGanadores(parseInt(semana))
              }}
              style={{ width: 60, display: 'block', marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: 12, color: '#666' }}>
            Desde
            <input
              className="score-input"
              type="date"
              value={calcForm.inicio}
              onChange={(e) => setCalcForm((f) => ({ ...f, inicio: e.target.value }))}
              style={{ display: 'block', marginTop: 4 }}
            />
          </label>
          <label style={{ fontSize: 12, color: '#666' }}>
            Hasta
            <input
              className="score-input"
              type="date"
              value={calcForm.fin}
              onChange={(e) => setCalcForm((f) => ({ ...f, fin: e.target.value }))}
              style={{ display: 'block', marginTop: 4 }}
            />
          </label>
          <button className="btn-save" onClick={handleCalcular} disabled={calculando} style={{ fontSize: 12, padding: '8px 14px' }}>
            {calculando ? 'Calculando...' : 'Calcular ganadores'}
          </button>
        </div>

        {ganadoresSemana.length > 0 && (
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Resultado semana {calcForm.semana}
            </h4>
            {ganadoresSemana.map((g) => (
              <div className="admin-result-row" key={g.id}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                  {g.empate_pendiente ? '⏳' : g.definido_por_sorteo ? '🎲' : '🏆'} {g.nombre_ganador}
                </span>
                <span style={{ fontSize: 12, color: '#666' }}>
                  {g.puntos_semana} pts · {g.exactos_semana} exactos · dif {g.diferencia_semana}
                </span>
                {g.empate_pendiente && (
                  <span style={{ fontSize: 11, color: '#b8860b', marginLeft: 8 }}>empate, sorteo pendiente</span>
                )}
              </div>
            ))}

            {ganadoresSemana.some((g) => g.empate_pendiente) && (
              <div style={{ marginTop: 10 }}>
                <div className="alert alert-warning" style={{ marginBottom: 8 }}>
                  Hay empate total entre {ganadoresSemana.filter((g) => g.empate_pendiente).length} participantes.
                  El sorteo elige al azar los cupos que faltan; el resto sale de la lista.
                </div>
                <button className="btn-save" onClick={handleSortear} disabled={sorteando} style={{ fontSize: 12, padding: '8px 14px' }}>
                  {sorteando ? 'Sorteando...' : '🎲 Sortear entre empatados'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
