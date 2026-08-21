// ============================================================
// SCRIPT DATA C2026
// ============================================================
// SofaScore → Supabase → JavaScript
//
// Las listas de jugadores ahora se cargan automáticamente
// desde Supabase.
//
// La variable "data" de equipos se mantiene independiente.
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL = "https://vyajtateflcbknzuunvq.supabase.co";

// IMPORTANTE:
// Usar la PUBLISHABLE KEY, NO la sb_secret_...
const SUPABASE_KEY = "sb_publishable_bsqa6jzIeJUv9W4wwF0KXA_IWVEk7uD";


// ============================================================
// LISTAS DE JUGADORES
// ============================================================

const delanteros = [];
const mediocampistas = [];
const defensores = [];
const arqueros = [];


// ============================================================
// CARGAR JUGADORES DESDE SUPABASE
// ============================================================

async function cargarJugadoresSofaScore() {

    const url =
        SUPABASE_URL +
        "/rest/v1/sofascore_players" +
        "?select=player_id,nombre,equipo,posicion,estadisticas" +
        "&order=nombre.asc";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    });

    if (!response.ok) {

        const error = await response.text();

        console.error(
            "Error cargando SofaScore desde Supabase:",
            response.status,
            error
        );

        throw new Error(
            "No se pudieron cargar los jugadores desde Supabase"
        );
    }

    const jugadores = await response.json();

    console.log(
        "SofaScore cargado:",
        jugadores.length,
        "jugadores"
    );


    // ========================================================
    // LIMPIAR LISTAS
    // ========================================================

    delanteros.length = 0;
    mediocampistas.length = 0;
    defensores.length = 0;
    arqueros.length = 0;


    // ========================================================
    // CONVERTIR FORMATO SOFASCORE → FORMATO ANTIGUO
    // ========================================================

    jugadores.forEach(jugador => {

        const stats = jugador.estadisticas || {};

        const base = {
            Equipo: jugador.equipo || "",
            Nombre: jugador.nombre || ""
        };


        // ====================================================
        // DELANTEROS
        // ====================================================

        if (jugador.posicion === "F") {

            delanteros.push({

                ...base,

                "Goles":
                    stats.goals ?? 0,

                "Regates con éxito":
                    stats.successfulDribbles ?? 0,

                "Tiros a puerta":
                    stats.shotsOnTarget ?? 0,

                "Conversión de goles %":
                    stats.goalConversionPercentage ?? 0,

                "Duelos terrestres ganados %":
                    stats.groundDuelsWonPercentage ?? 0,

                "Minutos jugados":
                    stats.minutesPlayed ?? 0
            });

        }


        // ====================================================
        // MEDIOCAMPISTAS
        // ====================================================

        else if (jugador.posicion === "M") {

            mediocampistas.push({

                ...base,

                "Goles":
                    stats.goals ?? 0,

                "Pases precisos":
                    stats.accuratePasses ?? 0,

                "Pases clave":
                    stats.keyPasses ?? 0,

                "Regates con éxito":
                    stats.successfulDribbles ?? 0,

                "Pases precisos en el último tercio":
                    stats.accurateFinalThirdPasses ?? 0,

                "Minutos jugados":
                    stats.minutesPlayed ?? 0
            });

        }


        // ====================================================
        // DEFENSORES
        // ====================================================

        else if (jugador.posicion === "D") {

            defensores.push({

                ...base,

                "Pases precisos %":
                    stats.accuratePassesPercentage ?? 0,

                "Entradas":
                    stats.tackles ?? 0,

                "Intercepciones":
                    stats.interceptions ?? 0,

                "Despejes":
                    stats.clearances ?? 0,

                "Regateado":
                    stats.dribbledPast ?? 0,

                "Minutos jugados":
                    stats.minutesPlayed ?? 0
            });

        }


        // ====================================================
        // ARQUEROS
        // ====================================================

        else if (jugador.posicion === "G") {

            arqueros.push({

                ...base,

                "Paradas":
                    stats.saves ?? 0,

                "Portería a cero":
                    stats.cleanSheet ?? 0,

                "Goles encajados dentro del área":
                    stats.goalsConcededInsideTheBox ?? 0,

                "Goles encajados fuera del área":
                    stats.goalsConcededOutsideTheBox ?? 0,

                "Tiros lanzados con éxito":
                    stats.savedShotsFromInsideTheBox ??
                    stats.saves ??
                    0,

                "Minutos jugados":
                    stats.minutesPlayed ?? 0
            });

        }

    });


    // ========================================================
    // COMPATIBILIDAD CON EL CÓDIGO ANTIGUO
    // ========================================================

    window.delanteros = delanteros;
    window.mediocampistas = mediocampistas;
    window.defensores = defensores;
    window.arqueros = arqueros;


    console.log(
        "F:",
        delanteros.length,
        "M:",
        mediocampistas.length,
        "D:",
        defensores.length,
        "G:",
        arqueros.length
    );


    // ========================================================
    // AVISAR QUE SOFASCORE YA ESTÁ LISTO
    // ========================================================

    window.sofaScoreReady = true;

    document.dispatchEvent(
        new CustomEvent("sofaScoreReady")
    );

}


// ============================================================
// INICIAR CARGA
// ============================================================

cargarJugadoresSofaScore()
    .catch(error => {
        console.error(
            "ERROR cargando datos de SofaScore:",
            error
        );
    });


// ============================================================
// DATA DE EQUIPOS
// ============================================================
//
// IMPORTANTE:
//
// ACÁ PEGÁS TU "const data = [...]" ACTUAL COMPLETO.
//
// NO LO MODIFIQUES.
//
// ============================================================

const data = [

    // ========================================================
    // PEGÁ ACÁ TU DATA ACTUAL
    // ========================================================

    /*
    {'Fecha': 2,
     'Contador': 1,
     'Puntos': 3,
     'Equipo': "Banfield",
     'Goles a favor': 3,
     'Goles en contra': 2,
     'Intentos al arco': 16,
     'Intentos a su arco': 13,
     'Tiros efectivos al arco': 8,
     'Tiros efectivos a su arco': 5,
     'Posesion de balon': 0.39,
     'Ataques a favor': 99,
     'Ataques en contra': 98,
     'Saques de falta a favor': 9,
     'Saques de falta en contra': 11,
     'Corners a favor': 4,
     'Corners en contra': 4,
     'Fuera de juego propio': 1,
     'Fuera de juego del rival': 0,
     'Faltas cometidas': 11,
     'Faltas que le cometieron': 10,
     'Amarillas recibidas': 0,
     'Amarillas del rival': 1,
     'Rojas recibidas': 0,
     'Rojas del rival': 0
    },

    */

];


// ============================================================
// COMPATIBILIDAD CON CÓDIGO EXISTENTE
// ============================================================

window.data = data;