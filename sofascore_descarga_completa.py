import sys
import json
import time
from pathlib import Path
from curl_cffi import requests


# ============================================================
# CONFIGURACIÓN
# ============================================================

TOURNAMENT_ID = 155
SEASON_ID = 87913

# Se prueban en orden; el primero que responda queda fijo
HOSTS = [
    "https://api.sofascore.com/api/v1",
    "https://www.sofascore.com/api/v1",
]

LIMIT = 100

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "sofascore_data"
OUTPUT_FILE = OUTPUT_DIR / "sofascore_liga_argentina_2026.json"


# ============================================================
# CAMPOS ESTADÍSTICOS
# ============================================================

FIELDS = [
    "rating", "totalRating", "countRating",
    "goals", "bigChancesCreated", "bigChancesMissed", "assists",
    "expectedAssists", "goalsAssistsSum", "expectedGoals",
    "accuratePasses", "inaccuratePasses", "totalPasses",
    "accuratePassesPercentage",
    "accurateOwnHalfPasses", "accurateOppositionHalfPasses",
    "accurateFinalThirdPasses",
    "keyPasses", "passToAssist",
    "successfulDribbles", "successfulDribblesPercentage",
    "tackles", "tacklesWon", "tacklesWonPercentage", "interceptions",
    "yellowCards", "yellowRedCards", "directRedCards", "redCards",
    "accurateCrosses", "accurateCrossesPercentage", "totalCross",
    "totalShots", "shotsOnTarget", "shotsOffTarget",
    "groundDuelsWon", "groundDuelsWonPercentage",
    "aerialDuelsWon", "aerialDuelsWonPercentage",
    "totalDuelsWon", "totalDuelsWonPercentage",
    "minutesPlayed", "appearances", "matchesStarted",
    "goalConversionPercentage",
    "penaltiesTaken", "penaltyGoals", "penaltyWon", "penaltyConceded",
    "attemptPenaltyMiss", "attemptPenaltyPost", "attemptPenaltyTarget",
    "shotFromSetPiece", "freeKickGoal",
    "goalsFromInsideTheBox", "goalsFromOutsideTheBox",
    "shotsFromInsideTheBox", "shotsFromOutsideTheBox",
    "headedGoals", "leftFootGoals", "rightFootGoals",
    "accurateLongBalls", "accurateLongBallsPercentage", "totalLongBalls",
    "clearances",
    "errorLeadToGoal", "errorLeadToShot",
    "dispossessed", "dribbledPast",
    "possessionLost", "possessionWonAttThird",
    "touches", "wasFouled", "fouls",
    "hitWoodwork", "ownGoals",
    "offsides", "blockedShots",
    "saves", "cleanSheet",
    "penaltyFaced", "penaltySave",
    "savedShotsFromInsideTheBox", "savedShotsFromOutsideTheBox",
    "goalsConcededInsideTheBox", "goalsConcededOutsideTheBox",
    "goalsConceded",
    "punches", "runsOut", "successfulRunsOut", "highClaims",
    "crossesNotClaimed",
    "duelLost", "aerialLost",
    "savesCaught", "savesParried",
    "totwAppearances",
    "goalKicks", "ballRecovery", "outfielderBlocks",
]


# ============================================================
# SESIÓN
# ============================================================
# Sin User-Agent manual: impersonate="chrome" pone uno que coincide
# con su huella TLS. Si no coinciden, Cloudflare lo detecta como bot.

session = requests.Session(impersonate="chrome")

session.headers.update({
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
})

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

host_activo = None


# ============================================================
# FUNCIÓN GET
# ============================================================

def _pedir(url, params):
    for intento in range(3):
        try:
            r = session.get(url, params=params, timeout=40)
            if r.status_code == 200:
                return r.json()
            print(f"ERROR HTTP {r.status_code}: {url}")
            print(f"  server={r.headers.get('server')} | cuerpo={r.text[:200]!r}")
            if r.status_code == 404:
                return None
        except Exception as e:
            print(f"ERROR conexión: {str(e)[:150]}")
        time.sleep(2 * (intento + 1))
    return None


def get_json(path, params=None):
    """path sin host, ej: '/player/123'."""
    global host_activo

    if host_activo:
        return _pedir(f"{host_activo}{path}", params)

    for host in HOSTS:
        data = _pedir(f"{host}{path}", params)
        if data is not None:
            host_activo = host
            print(f"Host en uso: {host}")
            return data
    return None


# ============================================================
# 1. DESCARGAR ESTADÍSTICAS
# ============================================================

print("=" * 60)
print("SOFASCORE | DESCARGA COMPLETA")
print("=" * 60)
print(f"Torneo: {TOURNAMENT_ID} | Temporada: {SEASON_ID}")
print()

todos = []
offset = 0
pagina = 1
total_paginas = None

stats_path = (
    f"/unique-tournament/{TOURNAMENT_ID}"
    f"/season/{SEASON_ID}/statistics"
)

while True:
    params = {
        "limit": LIMIT,
        "order": "-rating",
        "offset": offset,
        "accumulation": "total",
        "fields": ",".join(FIELDS),
        "filters": "position.in.G~D~M~F",
    }

    data = get_json(stats_path, params)

    if not data:
        print("ERROR: no se recibió información.")
        break

    resultados = data.get("results", [])
    pagina_actual = data.get("page", pagina)
    total_paginas = data.get("pages", total_paginas)

    if not resultados:
        break

    todos.extend(resultados)
    print(f"Página {pagina_actual}/{total_paginas}: {len(resultados)} jugadores")

    offset += LIMIT
    pagina += 1

    if total_paginas and pagina_actual >= total_paginas:
        break

    time.sleep(0.15)

print()
print(f"Jugadores descargados: {len(todos)}")

# Si no hay datos, cortar con error: no se pisa el JSON
# y el job de GitHub queda en rojo (te llega un mail).
if len(todos) == 0:
    print("ERROR: 0 jugadores descargados. No se guarda el JSON.")
    sys.exit(1)


# ============================================================
# 2. OBTENER POSICIONES
# ============================================================

print()
print("OBTENIENDO POSICIONES...")
print()

procesados = 0
errores_posicion = 0

for jugador in todos:
    player_id = jugador.get("player", {}).get("id")

    if not player_id:
        errores_posicion += 1
        continue

    data = get_json(f"/player/{player_id}")

    if not data:
        errores_posicion += 1
        jugador["position"] = None
        continue

    position = data.get("player", {}).get("position")
    if position not in ("G", "D", "M", "F"):
        position = None

    jugador["position"] = position
    procesados += 1

    if procesados % 100 == 0:
        print(f"Posiciones: {procesados}/{len(todos)}")

    time.sleep(0.08)


# ============================================================
# 3. ELIMINAR DUPLICADOS
# ============================================================

unicos = {}
duplicados = 0

for jugador in todos:
    player_id = jugador.get("player", {}).get("id")
    if not player_id:
        continue
    if player_id in unicos:
        duplicados += 1
    else:
        unicos[player_id] = jugador

todos = list(unicos.values())


# ============================================================
# 4. CONTEO DE POSICIONES
# ============================================================

conteo = {"F": 0, "M": 0, "D": 0, "G": 0, "SIN": 0}

for jugador in todos:
    posicion = jugador.get("position")
    if posicion in conteo:
        conteo[posicion] += 1
    else:
        conteo["SIN"] += 1


# ============================================================
# 5. GUARDAR JSON
# ============================================================

resultado = {
    "tournament_id": TOURNAMENT_ID,
    "season_id": SEASON_ID,
    "total_players": len(todos),
    "positions": conteo,
    "players": todos,
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(resultado, f, ensure_ascii=False, indent=2)


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 60)
print("RESULTADO")
print("=" * 60)
print(f"Jugadores: {len(todos)}")
print(f"Delanteros: {conteo['F']}")
print(f"Mediocampistas: {conteo['M']}")
print(f"Defensores: {conteo['D']}")
print(f"Arqueros: {conteo['G']}")
print(f"Sin posición: {conteo['SIN']}")
print(f"Duplicados eliminados: {duplicados}")
print(f"Errores posición: {errores_posicion}")
print()
print("Archivo generado:")
print(OUTPUT_FILE)
print()
print("OK")
