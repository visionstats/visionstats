import json
import time
from pathlib import Path
from curl_cffi import requests


# ============================================================
# CONFIGURACIÓN
# ============================================================

TOURNAMENT_ID = 155
SEASON_ID = 87913

BASE_URL = "https://api.sofascore.com/api/v1"

LIMIT = 100

# Carpeta donde se guardará el JSON
BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "sofascore_data"

OUTPUT_FILE = (
    OUTPUT_DIR /
    "sofascore_liga_argentina_2026.json"
)


# ============================================================
# CAMPOS ESTADÍSTICOS
# ============================================================

FIELDS = [
    "rating",
    "totalRating",
    "countRating",

    "goals",
    "bigChancesCreated",
    "bigChancesMissed",
    "assists",
    "expectedAssists",
    "goalsAssistsSum",
    "expectedGoals",

    "accuratePasses",
    "inaccuratePasses",
    "totalPasses",
    "accuratePassesPercentage",

    "accurateOwnHalfPasses",
    "accurateOppositionHalfPasses",
    "accurateFinalThirdPasses",

    "keyPasses",
    "passToAssist",

    "successfulDribbles",
    "successfulDribblesPercentage",

    "tackles",
    "tacklesWon",
    "tacklesWonPercentage",
    "interceptions",

    "yellowCards",
    "yellowRedCards",
    "directRedCards",
    "redCards",

    "accurateCrosses",
    "accurateCrossesPercentage",
    "totalCross",

    "totalShots",
    "shotsOnTarget",
    "shotsOffTarget",

    "groundDuelsWon",
    "groundDuelsWonPercentage",
    "aerialDuelsWon",
    "aerialDuelsWonPercentage",
    "totalDuelsWon",
    "totalDuelsWonPercentage",

    "minutesPlayed",
    "appearances",
    "matchesStarted",

    "goalConversionPercentage",

    "penaltiesTaken",
    "penaltyGoals",
    "penaltyWon",
    "penaltyConceded",
    "attemptPenaltyMiss",
    "attemptPenaltyPost",
    "attemptPenaltyTarget",

    "shotFromSetPiece",
    "freeKickGoal",

    "goalsFromInsideTheBox",
    "goalsFromOutsideTheBox",

    "shotsFromInsideTheBox",
    "shotsFromOutsideTheBox",

    "headedGoals",
    "leftFootGoals",
    "rightFootGoals",

    "accurateLongBalls",
    "accurateLongBallsPercentage",
    "totalLongBalls",

    "clearances",

    "errorLeadToGoal",
    "errorLeadToShot",

    "dispossessed",
    "dribbledPast",

    "possessionLost",
    "possessionWonAttThird",

    "touches",
    "wasFouled",
    "fouls",

    "hitWoodwork",
    "ownGoals",

    "offsides",
    "blockedShots",

    "saves",
    "cleanSheet",

    "penaltyFaced",
    "penaltySave",

    "savedShotsFromInsideTheBox",
    "savedShotsFromOutsideTheBox",

    "goalsConcededInsideTheBox",
    "goalsConcededOutsideTheBox",
    "goalsConceded",

    "punches",
    "runsOut",
    "successfulRunsOut",
    "highClaims",
    "crossesNotClaimed",

    "duelLost",
    "aerialLost",

    "savesCaught",
    "savesParried",

    "totwAppearances",

    "goalKicks",
    "ballRecovery",
    "outfielderBlocks"
]


# ============================================================
# SESIÓN
# ============================================================

session = requests.Session(
    impersonate="chrome"
)

session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/145.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
})

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# FUNCIÓN GET
# ============================================================

def get_json(url, params=None):

    for intento in range(3):

        try:

            r = session.get(
                url,
                params=params,
                timeout=40
            )

            if r.status_code == 200:
                return r.json()

            print(
                f"ERROR HTTP {r.status_code}: "
                f"{url}"
            )

        except Exception as e:

            print(
                f"ERROR conexión: "
                f"{str(e)[:100]}"
            )

        time.sleep(1)

    return None


# ============================================================
# 1. DESCARGAR ESTADÍSTICAS
# ============================================================

print("=" * 60)
print("SOFASCORE | DESCARGA COMPLETA")
print("=" * 60)

print(
    f"Torneo: {TOURNAMENT_ID} | "
    f"Temporada: {SEASON_ID}"
)

print()


todos = []

offset = 0
pagina = 1
total_paginas = None


while True:

    url = (
        f"{BASE_URL}/unique-tournament/"
        f"{TOURNAMENT_ID}/season/"
        f"{SEASON_ID}/statistics"
    )

    params = {
        "limit": LIMIT,
        "order": "-rating",
        "offset": offset,
        "accumulation": "total",
        "fields": ",".join(FIELDS),
        "filters": "position.in.G~D~M~F"
    }

    data = get_json(url, params)

    if not data:
        print("ERROR: no se recibió información.")
        break

    resultados = data.get(
        "results",
        []
    )

    pagina_actual = data.get(
        "page",
        pagina
    )

    total_paginas = data.get(
        "pages",
        total_paginas
    )

    if not resultados:
        break

    todos.extend(resultados)

    print(
        f"Página {pagina_actual}/"
        f"{total_paginas}: "
        f"{len(resultados)} jugadores"
    )

    offset += LIMIT
    pagina += 1

    if (
        total_paginas
        and pagina_actual >= total_paginas
    ):
        break

    time.sleep(0.15)


print()

print(
    f"Jugadores descargados: {len(todos)}"
)


# ============================================================
# 2. OBTENER POSICIONES
# ============================================================

print()
print("OBTENIENDO POSICIONES...")
print()


procesados = 0
errores_posicion = 0


for jugador in todos:

    player = jugador.get(
        "player",
        {}
    )

    player_id = player.get(
        "id"
    )

    if not player_id:

        errores_posicion += 1

        continue

    url = (
        f"{BASE_URL}/player/"
        f"{player_id}"
    )

    data = get_json(url)

    if not data:

        errores_posicion += 1

        jugador["position"] = None

        continue

    p = data.get(
        "player",
        {}
    )

    position = p.get(
        "position"
    )

    if position not in (
        "G",
        "D",
        "M",
        "F"
    ):

        position = None

    jugador["position"] = position

    procesados += 1

    if procesados % 100 == 0:

        print(
            f"Posiciones: "
            f"{procesados}/{len(todos)}"
        )

    time.sleep(0.08)


# ============================================================
# 3. ELIMINAR DUPLICADOS
# ============================================================

unicos = {}

duplicados = 0


for jugador in todos:

    player = jugador.get(
        "player",
        {}
    )

    player_id = player.get(
        "id"
    )

    if not player_id:
        continue

    if player_id in unicos:

        duplicados += 1

    else:

        unicos[player_id] = jugador


todos = list(
    unicos.values()
)


# ============================================================
# 4. CONTEO DE POSICIONES
# ============================================================

conteo = {
    "F": 0,
    "M": 0,
    "D": 0,
    "G": 0,
    "SIN": 0
}


for jugador in todos:

    posicion = jugador.get(
        "position"
    )

    if posicion in conteo:

        conteo[posicion] += 1

    else:

        conteo["SIN"] += 1


# ============================================================
# 5. PREPARAR RESULTADO
# ============================================================

resultado = {

    "tournament_id": TOURNAMENT_ID,

    "season_id": SEASON_ID,

    "total_players": len(todos),

    "positions": conteo,

    "players": todos

}


# ============================================================
# 6. GUARDAR JSON
# ============================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        resultado,
        f,
        ensure_ascii=False,
        indent=2
    )


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 60)
print("RESULTADO")
print("=" * 60)

print(
    f"Jugadores: {len(todos)}"
)

print(
    f"Delanteros: {conteo['F']}"
)

print(
    f"Mediocampistas: {conteo['M']}"
)

print(
    f"Defensores: {conteo['D']}"
)

print(
    f"Arqueros: {conteo['G']}"
)

print(
    f"Sin posición: {conteo['SIN']}"
)

print(
    f"Duplicados eliminados: {duplicados}"
)

print(
    f"Errores posición: {errores_posicion}"
)

print()
print("Archivo generado:")
print(OUTPUT_FILE)

print()
print("OK")
