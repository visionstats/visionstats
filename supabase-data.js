const SUPABASE_URL = "https://vyajtateflcbknzuunvq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_bsqa6jzIeJUv9W4wwF0KXA_IWVEk7uD";


// ============================================================
// SOFASCORE → SUPABASE → JAVASCRIPT
// ============================================================

async function cargarDatosSofaScore() {

    console.log("SofaScore → consultando Supabase...");


    // ========================================================
    // 1. CONSULTAR SUPABASE
    // ========================================================

    const url =
        SUPABASE_URL +
        "/rest/v1/sofascore_players" +
        "?select=player_id,nombre,equipo,posicion,estadisticas" +
        "&limit=1000";


    const respuesta = await fetch(url, {

        method: "GET",

        headers: {

            "apikey": SUPABASE_KEY,

            "Authorization":
                "Bearer " + SUPABASE_KEY

        }

    });


    if (!respuesta.ok) {

        const textoError = await respuesta.text();

        throw new Error(
            "Error Supabase: " +
            respuesta.status +
            " - " +
            textoError
        );

    }


    const jugadores = await respuesta.json();


    console.log(
        "SofaScore → recibidos:",
        jugadores.length,
        "jugadores"
    );


    // ========================================================
    // 2. CREAR LAS CUATRO LISTAS
    // ========================================================

    window.delanteros = [];

    window.mediocampistas = [];

    window.defensores = [];

    window.arqueros = [];


    // ========================================================
    // 3. FUNCIÓN PARA OBTENER ESTADÍSTICAS
    // ========================================================

    function v(stats, campo, defecto = 0) {

        const valor = stats[campo];


        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return defecto;

        }


        const numero = Number(valor);


        if (Number.isNaN(numero)) {

            return defecto;

        }


        return numero;

    }


    // ========================================================
    // 4. RECORRER JUGADORES
    // ========================================================

    jugadores.forEach(p => {

        const s = p.estadisticas || {};


        // ====================================================
        // DELANTEROS
        // ====================================================

        if (p.posicion === "F") {

            window.delanteros.push({

                ID: p.player_id,

                Equipo: p.equipo,

                Nombre: p.nombre,

                "Goles":
                    v(s, "goals"),

                "Regates con éxito":
                    v(s, "successfulDribbles"),

                "Tiros a puerta":
                    v(s, "shotsOnTarget"),

                "Conversión de goles %":
                Number(v(s, "goalConversionPercentage").toFixed(1)),

                "Duelos terrestres ganados %":
                Number(v(s, "groundDuelsWonPercentage").toFixed(1)),

                "Minutos jugados":
                    v(s, "minutesPlayed")

            });

        }


        // ====================================================
        // MEDIOCAMPISTAS
        // ====================================================

        else if (p.posicion === "M") {

            window.mediocampistas.push({

                ID: p.player_id,

                Equipo: p.equipo,

                Nombre: p.nombre,

                "Goles":
                    v(s, "goals"),

                "Pases precisos":
                    v(s, "accuratePasses"),

                "Pases clave":
                    v(s, "keyPasses"),

                "Regates con éxito":
                    v(s, "successfulDribbles"),

                "Pases precisos en el último tercio":
                    v(s, "accurateFinalThirdPasses"),

                "Minutos jugados":
                    v(s, "minutesPlayed")

            });

        }


        // ====================================================
        // DEFENSORES
        // ====================================================

        else if (p.posicion === "D") {

            window.defensores.push({

                ID: p.player_id,

                Equipo: p.equipo,

                Nombre: p.nombre,

                "Pases precisos %":
                    Number(
                        v(
                            s,
                            "accuratePassesPercentage"
                        ).toFixed(1)
                    ),

                "Entradas":
                    v(s, "tackles"),

                "Intercepciones":
                    v(s, "interceptions"),

                "Despejes":
                    v(s, "clearances"),

                "Regateado":
                    v(s, "dribbledPast"),

                "Minutos jugados":
                    v(s, "minutesPlayed")

            });

        }


        // ====================================================
        // ARQUEROS
        // ====================================================

        else if (p.posicion === "G") {

            window.arqueros.push({

                ID: p.player_id,

                Equipo: p.equipo,

                Nombre: p.nombre,

                "Paradas":
                    v(s, "saves"),

                "Portería a cero":
                    v(s, "cleanSheet"),

                "Goles encajados dentro del área":
                    v(
                        s,
                        "goalsConcededInsideTheBox"
                    ),

                "Goles encajados fuera del área":
                    v(
                        s,
                        "goalsConcededOutsideTheBox"
                    ),

                "Tiros lanzados con éxito":
                    v(s, "saves"),

                "Minutos jugados":
                    v(s, "minutesPlayed")

            });

        }

    });


    // ========================================================
    // 5. RESULTADO FINAL
    // ========================================================

    console.log("");

    console.log(
        "SofaScore cargado:",
        jugadores.length,
        "jugadores"
    );


    console.log(
        "F:",
        window.delanteros.length,
        "M:",
        window.mediocampistas.length,
        "D:",
        window.defensores.length,
        "G:",
        window.arqueros.length
    );


    console.log(
        "Total:",
        window.delanteros.length +
        window.mediocampistas.length +
        window.defensores.length +
        window.arqueros.length
    );


    console.log(
        "Supabase → arrays de jugadores preparados."
    );


    // ========================================================
    // 6. DEVOLVER LOS ARRAYS
    // ========================================================

    return {

        delanteros:
            window.delanteros,

        mediocampistas:
            window.mediocampistas,

        defensores:
            window.defensores,

        arqueros:
            window.arqueros

    };

}