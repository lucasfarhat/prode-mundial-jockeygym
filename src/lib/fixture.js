// Fixture REAL del Mundial 2026 (fase de grupos).
// Fuentes: sorteo final FIFA (05/12/2025, verificado con Wikipedia) +
// calendario de ESPN. Horarios convertidos a hora de Argentina (UTC-3),
// guardados con offset -03:00 explicito para que el cierre de pronosticos
// (1h antes) sea exacto sin importar la zona horaria del navegador.
// Las banderas se resuelven por nombre de pais en src/lib/flags.js.

export const PARTIDOS_GRUPOS = [
  // GRUPO A
  { id: 1, fase: 'Grupos', grupo: 'A', local: 'México', visitante: 'Sudáfrica', fecha: '2026-06-11T16:00:00-03:00', estadio: 'Estadio Azteca', ciudad: 'Ciudad de México' },
  { id: 2, fase: 'Grupos', grupo: 'A', local: 'Corea del Sur', visitante: 'República Checa', fecha: '2026-06-11T23:00:00-03:00', estadio: 'Estadio Akron', ciudad: 'Guadalajara' },
  { id: 3, fase: 'Grupos', grupo: 'A', local: 'República Checa', visitante: 'Sudáfrica', fecha: '2026-06-18T13:00:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },
  { id: 4, fase: 'Grupos', grupo: 'A', local: 'México', visitante: 'Corea del Sur', fecha: '2026-06-18T22:00:00-03:00', estadio: 'Estadio Akron', ciudad: 'Guadalajara' },
  { id: 5, fase: 'Grupos', grupo: 'A', local: 'República Checa', visitante: 'México', fecha: '2026-06-24T22:00:00-03:00', estadio: 'Estadio Azteca', ciudad: 'Ciudad de México' },
  { id: 6, fase: 'Grupos', grupo: 'A', local: 'Sudáfrica', visitante: 'Corea del Sur', fecha: '2026-06-24T22:00:00-03:00', estadio: 'Estadio BBVA', ciudad: 'Monterrey' },

  // GRUPO B
  { id: 7, fase: 'Grupos', grupo: 'B', local: 'Canadá', visitante: 'Bosnia y Herzegovina', fecha: '2026-06-12T16:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto' },
  { id: 8, fase: 'Grupos', grupo: 'B', local: 'Qatar', visitante: 'Suiza', fecha: '2026-06-13T16:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco' },
  { id: 9, fase: 'Grupos', grupo: 'B', local: 'Suiza', visitante: 'Bosnia y Herzegovina', fecha: '2026-06-18T16:00:00-03:00', estadio: 'SoFi Stadium', ciudad: 'Los Angeles' },
  { id: 10, fase: 'Grupos', grupo: 'B', local: 'Canadá', visitante: 'Qatar', fecha: '2026-06-18T19:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver' },
  { id: 11, fase: 'Grupos', grupo: 'B', local: 'Suiza', visitante: 'Canadá', fecha: '2026-06-24T16:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver' },
  { id: 12, fase: 'Grupos', grupo: 'B', local: 'Bosnia y Herzegovina', visitante: 'Qatar', fecha: '2026-06-24T16:00:00-03:00', estadio: 'Lumen Field', ciudad: 'Seattle' },

  // GRUPO C
  { id: 13, fase: 'Grupos', grupo: 'C', local: 'Brasil', visitante: 'Marruecos', fecha: '2026-06-13T19:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'Nueva York' },
  { id: 14, fase: 'Grupos', grupo: 'C', local: 'Haití', visitante: 'Escocia', fecha: '2026-06-13T22:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston' },
  { id: 15, fase: 'Grupos', grupo: 'C', local: 'Escocia', visitante: 'Marruecos', fecha: '2026-06-19T19:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston' },
  { id: 16, fase: 'Grupos', grupo: 'C', local: 'Brasil', visitante: 'Haití', fecha: '2026-06-19T21:30:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },
  { id: 17, fase: 'Grupos', grupo: 'C', local: 'Escocia', visitante: 'Brasil', fecha: '2026-06-24T19:00:00-03:00', estadio: 'Hard Rock Stadium', ciudad: 'Miami' },
  { id: 18, fase: 'Grupos', grupo: 'C', local: 'Marruecos', visitante: 'Haití', fecha: '2026-06-24T19:00:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },

  // GRUPO D
  { id: 19, fase: 'Grupos', grupo: 'D', local: 'EE.UU.', visitante: 'Paraguay', fecha: '2026-06-12T22:00:00-03:00', estadio: 'SoFi Stadium', ciudad: 'Los Angeles' },
  { id: 20, fase: 'Grupos', grupo: 'D', local: 'Australia', visitante: 'Turquía', fecha: '2026-06-14T01:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver' },
  { id: 21, fase: 'Grupos', grupo: 'D', local: 'EE.UU.', visitante: 'Australia', fecha: '2026-06-19T16:00:00-03:00', estadio: 'Lumen Field', ciudad: 'Seattle' },
  { id: 22, fase: 'Grupos', grupo: 'D', local: 'Turquía', visitante: 'Paraguay', fecha: '2026-06-20T00:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco' },
  { id: 23, fase: 'Grupos', grupo: 'D', local: 'Turquía', visitante: 'EE.UU.', fecha: '2026-06-25T23:00:00-03:00', estadio: 'SoFi Stadium', ciudad: 'Los Angeles' },
  { id: 24, fase: 'Grupos', grupo: 'D', local: 'Paraguay', visitante: 'Australia', fecha: '2026-06-25T23:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco' },

  // GRUPO E
  { id: 25, fase: 'Grupos', grupo: 'E', local: 'Alemania', visitante: 'Curazao', fecha: '2026-06-14T14:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston' },
  { id: 26, fase: 'Grupos', grupo: 'E', local: 'Costa de Marfil', visitante: 'Ecuador', fecha: '2026-06-14T20:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },
  { id: 27, fase: 'Grupos', grupo: 'E', local: 'Alemania', visitante: 'Costa de Marfil', fecha: '2026-06-20T17:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto' },
  { id: 28, fase: 'Grupos', grupo: 'E', local: 'Ecuador', visitante: 'Curazao', fecha: '2026-06-20T21:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City' },
  { id: 29, fase: 'Grupos', grupo: 'E', local: 'Ecuador', visitante: 'Alemania', fecha: '2026-06-25T17:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'Nueva York' },
  { id: 30, fase: 'Grupos', grupo: 'E', local: 'Curazao', visitante: 'Costa de Marfil', fecha: '2026-06-25T17:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },

  // GRUPO F
  { id: 31, fase: 'Grupos', grupo: 'F', local: 'Países Bajos', visitante: 'Japón', fecha: '2026-06-14T17:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas' },
  { id: 32, fase: 'Grupos', grupo: 'F', local: 'Suecia', visitante: 'Túnez', fecha: '2026-06-14T23:00:00-03:00', estadio: 'Estadio BBVA', ciudad: 'Monterrey' },
  { id: 33, fase: 'Grupos', grupo: 'F', local: 'Países Bajos', visitante: 'Suecia', fecha: '2026-06-20T14:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston' },
  { id: 34, fase: 'Grupos', grupo: 'F', local: 'Túnez', visitante: 'Japón', fecha: '2026-06-21T01:00:00-03:00', estadio: 'Estadio BBVA', ciudad: 'Monterrey' },
  { id: 35, fase: 'Grupos', grupo: 'F', local: 'Japón', visitante: 'Suecia', fecha: '2026-06-25T20:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas' },
  { id: 36, fase: 'Grupos', grupo: 'F', local: 'Túnez', visitante: 'Países Bajos', fecha: '2026-06-25T20:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City' },

  // GRUPO G
  { id: 37, fase: 'Grupos', grupo: 'G', local: 'Bélgica', visitante: 'Egipto', fecha: '2026-06-15T16:00:00-03:00', estadio: 'Lumen Field', ciudad: 'Seattle' },
  { id: 38, fase: 'Grupos', grupo: 'G', local: 'Irán', visitante: 'Nueva Zelanda', fecha: '2026-06-15T22:00:00-03:00', estadio: 'SoFi Stadium', ciudad: 'Los Angeles' },
  { id: 39, fase: 'Grupos', grupo: 'G', local: 'Bélgica', visitante: 'Irán', fecha: '2026-06-21T16:00:00-03:00', estadio: 'SoFi Stadium', ciudad: 'Los Angeles' },
  { id: 40, fase: 'Grupos', grupo: 'G', local: 'Nueva Zelanda', visitante: 'Egipto', fecha: '2026-06-21T22:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver' },
  { id: 41, fase: 'Grupos', grupo: 'G', local: 'Egipto', visitante: 'Irán', fecha: '2026-06-27T00:00:00-03:00', estadio: 'Lumen Field', ciudad: 'Seattle' },
  { id: 42, fase: 'Grupos', grupo: 'G', local: 'Nueva Zelanda', visitante: 'Bélgica', fecha: '2026-06-27T00:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver' },

  // GRUPO H
  { id: 43, fase: 'Grupos', grupo: 'H', local: 'España', visitante: 'Cabo Verde', fecha: '2026-06-15T13:00:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },
  { id: 44, fase: 'Grupos', grupo: 'H', local: 'Arabia Saudita', visitante: 'Uruguay', fecha: '2026-06-15T19:00:00-03:00', estadio: 'Hard Rock Stadium', ciudad: 'Miami' },
  { id: 45, fase: 'Grupos', grupo: 'H', local: 'España', visitante: 'Arabia Saudita', fecha: '2026-06-21T13:00:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },
  { id: 46, fase: 'Grupos', grupo: 'H', local: 'Uruguay', visitante: 'Cabo Verde', fecha: '2026-06-21T19:00:00-03:00', estadio: 'Hard Rock Stadium', ciudad: 'Miami' },
  { id: 47, fase: 'Grupos', grupo: 'H', local: 'Cabo Verde', visitante: 'Arabia Saudita', fecha: '2026-06-26T21:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston' },
  { id: 48, fase: 'Grupos', grupo: 'H', local: 'Uruguay', visitante: 'España', fecha: '2026-06-26T21:00:00-03:00', estadio: 'Estadio Akron', ciudad: 'Guadalajara' },

  // GRUPO I
  { id: 49, fase: 'Grupos', grupo: 'I', local: 'Francia', visitante: 'Senegal', fecha: '2026-06-16T16:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'Nueva York' },
  { id: 50, fase: 'Grupos', grupo: 'I', local: 'Irak', visitante: 'Noruega', fecha: '2026-06-16T19:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston' },
  { id: 51, fase: 'Grupos', grupo: 'I', local: 'Francia', visitante: 'Irak', fecha: '2026-06-22T18:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },
  { id: 52, fase: 'Grupos', grupo: 'I', local: 'Noruega', visitante: 'Senegal', fecha: '2026-06-22T21:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'Nueva York' },
  { id: 53, fase: 'Grupos', grupo: 'I', local: 'Noruega', visitante: 'Francia', fecha: '2026-06-26T16:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston' },
  { id: 54, fase: 'Grupos', grupo: 'I', local: 'Senegal', visitante: 'Irak', fecha: '2026-06-26T16:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto' },

  // GRUPO J
  { id: 55, fase: 'Grupos', grupo: 'J', local: 'Argentina', visitante: 'Argelia', fecha: '2026-06-16T22:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City' },
  { id: 56, fase: 'Grupos', grupo: 'J', local: 'Austria', visitante: 'Jordania', fecha: '2026-06-17T01:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco' },
  { id: 57, fase: 'Grupos', grupo: 'J', local: 'Argentina', visitante: 'Austria', fecha: '2026-06-22T14:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas' },
  { id: 58, fase: 'Grupos', grupo: 'J', local: 'Jordania', visitante: 'Argelia', fecha: '2026-06-23T00:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco' },
  { id: 59, fase: 'Grupos', grupo: 'J', local: 'Argelia', visitante: 'Austria', fecha: '2026-06-27T23:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City' },
  { id: 60, fase: 'Grupos', grupo: 'J', local: 'Jordania', visitante: 'Argentina', fecha: '2026-06-27T23:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas' },

  // GRUPO K
  { id: 61, fase: 'Grupos', grupo: 'K', local: 'Portugal', visitante: 'RD Congo', fecha: '2026-06-17T14:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston' },
  { id: 62, fase: 'Grupos', grupo: 'K', local: 'Uzbekistán', visitante: 'Colombia', fecha: '2026-06-17T23:00:00-03:00', estadio: 'Estadio Azteca', ciudad: 'Ciudad de México' },
  { id: 63, fase: 'Grupos', grupo: 'K', local: 'Portugal', visitante: 'Uzbekistán', fecha: '2026-06-23T14:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston' },
  { id: 64, fase: 'Grupos', grupo: 'K', local: 'Colombia', visitante: 'RD Congo', fecha: '2026-06-23T23:00:00-03:00', estadio: 'Estadio Akron', ciudad: 'Guadalajara' },
  { id: 65, fase: 'Grupos', grupo: 'K', local: 'Colombia', visitante: 'Portugal', fecha: '2026-06-27T20:30:00-03:00', estadio: 'Hard Rock Stadium', ciudad: 'Miami' },
  { id: 66, fase: 'Grupos', grupo: 'K', local: 'RD Congo', visitante: 'Uzbekistán', fecha: '2026-06-27T20:30:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },

  // GRUPO L
  { id: 67, fase: 'Grupos', grupo: 'L', local: 'Inglaterra', visitante: 'Croacia', fecha: '2026-06-17T17:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas' },
  { id: 68, fase: 'Grupos', grupo: 'L', local: 'Ghana', visitante: 'Panamá', fecha: '2026-06-17T20:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto' },
  { id: 69, fase: 'Grupos', grupo: 'L', local: 'Inglaterra', visitante: 'Ghana', fecha: '2026-06-23T17:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston' },
  { id: 70, fase: 'Grupos', grupo: 'L', local: 'Panamá', visitante: 'Croacia', fecha: '2026-06-23T20:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto' },
  { id: 71, fase: 'Grupos', grupo: 'L', local: 'Panamá', visitante: 'Inglaterra', fecha: '2026-06-27T18:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'Nueva York' },
  { id: 72, fase: 'Grupos', grupo: 'L', local: 'Croacia', visitante: 'Ghana', fecha: '2026-06-27T18:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },
]

// Fases eliminatorias: placeholders hasta que se definan los cruces.
// (El Mundial 2026 arranca con dieciseisavos / Ronda de 32.)
export const PARTIDOS_ELIMINATORIOS = []

export const TODAS_FASES = ['Grupos', 'R32', 'R16', 'QF', 'SF', 'F']
