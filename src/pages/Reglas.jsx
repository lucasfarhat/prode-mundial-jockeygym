export default function Reglas() {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>Reglas del prode</h2>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Sistema de puntos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
          <div style={{ background: '#f0f0e8', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a4fa0' }}>3</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>puntos</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Resultado exacto<br />Ej: pronosticás 2-1 y sale 2-1
            </div>
          </div>
          <div style={{ background: '#f0f0e8', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1a4fa0' }}>1</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>punto</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Resultado general correcto<br />Ej: pronosticás victoria local y acertás
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p><strong>Resultado general</strong> = quién gana o si hay empate. Si pronosticás 3-1 y sale 2-0, te llevas 1 punto (acertaste el ganador).</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>⏱ Resultado en fases eliminatorias</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>En las fases eliminatorias, el resultado que vale es el del <strong>final de la prórroga</strong> (si la hay), no el de los 90 minutos.</p>
          <p style={{ marginBottom: 6 }}>Si el partido va a <strong>penales</strong>, el resultado oficial del prode es el <strong>empate</strong> con el que terminó la prórroga: los penales no cuentan para los puntos.</p>
          <p>Ejemplo: termina 1-1 tras la prórroga y se define por penales → el resultado es 1-1. Quien puso 1-1 se lleva 3 puntos, quien puso otro empate 1 punto, y quien eligió un ganador no suma.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Desempate en tabla general</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>Cuando dos jugadores tienen los mismos puntos:</p>
          <p style={{ marginBottom: 6 }}>1. Gana quien tenga más <strong>resultados exactos</strong> (3 puntos).</p>
          <p style={{ marginBottom: 6 }}>2. Si persiste, se suma la <strong>diferencia absoluta de goles</strong> en cada partido: <code>|pronosticado - real|</code>. El que tenga la diferencia más baja (estuvo más cerca) gana.</p>
          <p>3. Si aún empatan, comparten el puesto.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>🔒 Cierre de pronósticos</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          Los pronósticos se bloquean automáticamente <strong>1 minuto antes</strong> del inicio de cada partido. Una vez cerrado el partido, no se puede modificar el pronóstico.
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>📅 Ganador semanal</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>Cada domingo a las 23:59 hs se calcula quién sumó más puntos con los partidos jugados esa semana (lunes a domingo).</p>
          <p>El desempate semanal sigue la misma lógica: más exactos → menor diferencia de goles.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>📋 Fases del torneo</h3>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>El Mundial 2026 tiene 48 selecciones divididas en 12 grupos de 4. Los dos primeros de cada grupo y los 8 mejores terceros avanzan a los 16avos de final.</p>
          <p>Los partidos de fases eliminatorias se habilitan a medida que se conocen los clasificados.</p>
        </div>
      </div>
    </div>
  )
}
