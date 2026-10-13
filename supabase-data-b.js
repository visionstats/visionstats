const SUPABASE_URL = "https://vyajtateflcbknzuunvq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_bsqa6jzIeJUv9W4wwF0KXA_IWVEk7uD";

// Tabla de la B Nacional
const SUPABASE_TABLE = "sofascore_players_bnacional";


// ============================================================
// SOFASCORE → SUPABASE → JAVASCRIPT (B NACIONAL)
// ============================================================

async function cargarDatosSofaScore() {

    console.log("SofaScore B Nacional → consultando Supabase...");


    // ========================================================
    // 1. CONSULTAR SUPABASE (por tandas de 1000)
    // ========================================================

    const TAMANIO = 1000;
    let desde = 0;
    const jugadores = [];

    while (true) {

        const url =
            SUPABASE_URL +
            "/rest/v1/" + SUPABASE_TABLE +
            "?select=player_id,nombre,equipo,posicion,estadisticas" +
            "&order=player_id" +
            "&limit=" + TAMANIO +
            "&offset=" + desde;

        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY
            }
        });

        if (!respuesta.ok) {
            const textoError = await respuesta.text();
            throw new Error(
                "Error Supabase: " + respuesta.status + " - " + textoError
            );
        }

        const tanda = await respuesta.json();
        jugadores.push(...tanda);

        if (tanda.length < TAMANIO) break;

        desde += TAMANIO;
    }

    console.log("SofaScore B Nacional → recibidos:", jugadores.length, "jugadores");


    // ========================================================
    // 2. LISTAS
    // ========================================================

    window.delanteros = [];
    window.mediocampistas = [];
    window.defensores = [];
    window.arqueros = [];


    // ========================================================
    // 3. LEER UNA ESTADÍSTICA COMO NÚMERO
    // ========================================================

    function v(stats, campo, defecto = 0) {

        const valor = stats[campo];

        if (valor === null || valor === undefined || valor === "") {
            return defecto;
        }

        const numero = Number(valor);

        return Number.isNaN(numero) ? defecto : numero;
    }

    function pct(stats, campo) {
        return Number(v(stats, campo).toFixed(1));
    }


    // ========================================================
    // 4. ARMAR JUGADORES POR POSICIÓN
    //    (los nombres coinciden con los encabezados del HTML)
    // ========================================================

    jugadores.forEach(p => {

        const s = p.estadisticas || {};

        const base = {
            ID: p.player_id,
            Equipo: p.equipo,
            Nombre: p.nombre
        };

        if (p.posicion === "F") {

            window.delanteros.push({
                ...base,
                "Goles": v(s, "goals"),
                "Regates con éxito": v(s, "successfulDribbles"),
                "Tiros a puerta": v(s, "shotsOnTarget"),
                "Conversión de goles %": pct(s, "goalConversionPercentage"),
                "Duelos terrestres ganados %": pct(s, "groundDuelsWonPercentage"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        } else if (p.posicion === "M") {

            window.mediocampistas.push({
                ...base,
                "Goles": v(s, "goals"),
                "Pases precisos": v(s, "accuratePasses"),
                "Pases clave": v(s, "keyPasses"),
                "Regates con éxito": v(s, "successfulDribbles"),
                "Pases precisos en el último tercio": v(s, "accurateFinalThirdPasses"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        } else if (p.posicion === "D") {

            window.defensores.push({
                ...base,
                "Pases precisos %": pct(s, "accuratePassesPercentage"),
                "Entradas": v(s, "tackles"),
                "Intercepciones": v(s, "interceptions"),
                "Despejes": v(s, "clearances"),
                "Regateado": v(s, "dribbledPast"),
                "Minutos jugados": v(s, "minutesPlayed"),
                // Solo para el Top 5 (no se muestra en la tabla)
                "Total duelos ganados": v(s, "totalDuelsWon")
            });

        } else if (p.posicion === "G") {

            window.arqueros.push({
                ...base,
                "Paradas": v(s, "saves"),
                "Portería a cero": v(s, "cleanSheet"),
                "Goles encajados dentro del área": v(s, "goalsConcededInsideTheBox"),
                "Goles encajados fuera del área": v(s, "goalsConcededOutsideTheBox"),
                "Tiros lanzados con éxito": v(s, "saves"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        }

    });


    // ========================================================
    // 5. RESULTADO
    // ========================================================

    console.log(
        "F:", window.delanteros.length,
        "M:", window.mediocampistas.length,
        "D:", window.defensores.length,
        "G:", window.arqueros.length
    );

    return {
        delanteros: window.delanteros,
        mediocampistas: window.mediocampistas,
        defensores: window.defensores,
        arqueros: window.arqueros
    };

}
