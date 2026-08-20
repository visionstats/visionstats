const SUPABASE_URL = "https://vyajtateflcbknzuunvq.supabase.co";
const SUPABASE_KEY = "sb_publishable_bsqa6jzIeJUv9W4wwF0KXA_IWVEk7uD";

async function cargarDatosSofaScore() {

    const url =
        SUPABASE_URL +
        "/rest/v1/sofascore_players" +
        "?select=player_id,nombre,equipo,posicion,estadisticas";

    const respuesta = await fetch(url, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    });

    if (!respuesta.ok) {
        throw new Error(
            "Error Supabase: " + respuesta.status
        );
    }

    const jugadores = await respuesta.json();

    window.delanteros = [];
    window.mediocampistas = [];
    window.defensores = [];
    window.arqueros = [];

    function v(stats, campo, defecto = 0) {
        return stats[campo] ?? defecto;
    }

    jugadores.forEach(p => {

        const s = p.estadisticas || {};

        if (p.posicion === "F") {

            window.delanteros.push({
                ID: p.player_id,
                Equipo: p.equipo,
                Nombre: p.nombre,
                "Goles": v(s, "goals"),
                "Regates con éxito": v(s, "successfulDribbles"),
                "Tiros a puerta": v(s, "shotsOnTarget"),
                "Conversión de goles %": v(s, "goalConversionPercentage"),
                "Duelos terrestres ganados %": v(s, "groundDuelsWonPercentage"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        } else if (p.posicion === "M") {

            window.mediocampistas.push({
                ID: p.player_id,
                Equipo: p.equipo,
                Nombre: p.nombre,
                "Goles": v(s, "goals"),
                "Pases precisos": v(s, "accuratePasses"),
                "Pases clave": v(s, "keyPasses"),
                "Regates con éxito": v(s, "successfulDribbles"),
                "Pases precisos en el último tercio":
                    v(s, "accurateFinalThirdPasses"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        } else if (p.posicion === "D") {

            window.defensores.push({
                ID: p.player_id,
                Equipo: p.equipo,
                Nombre: p.nombre,
                "Pases precisos %":
                    Number(v(s, "accuratePassesPercentage").toFixed(2)),
                "Entradas": v(s, "tackles"),
                "Intercepciones": v(s, "interceptions"),
                "Despejes": v(s, "clearances"),
                "Regateado": v(s, "dribbledPast"),
                "Minutos jugados": v(s, "minutesPlayed")
            });

        } else if (p.posicion === "G") {

            window.arqueros.push({
                ID: p.player_id,
                Equipo: p.equipo,
                Nombre: p.nombre,
                "Paradas": v(s, "saves"),
                "Portería a cero": v(s, "cleanSheet"),
                "Goles encajados área":
                    v(s, "goalsConcededInsideTheBox"),
                "Goles encajados fuera del área":
                    v(s, "goalsConcededOutsideTheBox"),
                "Tiros lanzados con éxito":
                    v(s, "savedShotsFromInsideTheBox") +
                    v(s, "savedShotsFromOutsideTheBox"),
                "Minutos jugados": v(s, "minutesPlayed")
            });
        }
    });

    console.log(
        "SofaScore cargado:",
        jugadores.length,
        "jugadores"
    );

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
}
