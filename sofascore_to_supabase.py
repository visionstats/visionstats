import os
import sys
import json
import time
from pathlib import Path
from curl_cffi import requests


# ============================================================
# CONFIGURACIÓN
# ============================================================

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

BASE_DIR = Path(__file__).resolve().parent
JSON_FILE = BASE_DIR / "sofascore_data" / "sofascore_liga_argentina_2026.json"

TABLE = "sofascore_players"
BATCH_SIZE = 100

# on_conflict=player_id: el upsert actualiza por player_id
# (necesita que player_id sea PRIMARY KEY o UNIQUE en la tabla)
URL = SUPABASE_URL.rstrip("/") + "/rest/v1/" + TABLE + "?on_conflict=player_id"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}


# ============================================================
# LEER JSON
# ============================================================

print("=" * 60)
print("SOFASCORE → SUPABASE")
print("=" * 60)
print()

if not JSON_FILE.exists():
    raise FileNotFoundError(f"No existe el archivo JSON: {JSON_FILE}")

with open(JSON_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

players = data.get("players", [])
print(f"Jugadores encontrados: {len(players)}")

# Nunca reportar OK con 0 jugadores
if len(players) == 0:
    print("ERROR: el JSON no tiene jugadores. Revisar el paso de descarga.")
    sys.exit(1)


# ============================================================
# PREPARAR REGISTROS
# ============================================================

registros = []

for item in players:
    player = item.get("player", {})
    team = item.get("team", {})
    player_id = player.get("id")

    if not player_id:
        continue

    registros.append({
        "player_id": player_id,
        "nombre": player.get("name", ""),
        "equipo": team.get("name", ""),
        "posicion": item.get("position"),
        "estadisticas": {
            k: v for k, v in item.items()
            if k not in ("player", "team", "position")
        },
    })

print(f"Registros preparados: {len(registros)}")
print()


# ============================================================
# SUBIR A SUPABASE
# ============================================================

session = requests.Session()
subidos = 0
errores = []

total = len(registros)
total_lotes = (total + BATCH_SIZE - 1) // BATCH_SIZE

for inicio in range(0, total, BATCH_SIZE):
    lote = registros[inicio:inicio + BATCH_SIZE]
    numero_lote = inicio // BATCH_SIZE + 1

    try:
        r = session.post(URL, headers=HEADERS, json=lote, timeout=60)

        if r.status_code in (200, 201, 204):
            subidos += len(lote)
            print(f"Lote {numero_lote}/{total_lotes}: {len(lote)} jugadores OK")
        else:
            print(f"ERROR lote {numero_lote}/{total_lotes} | HTTP {r.status_code}")
            print(r.text[:500])
            for reg in lote:
                errores.append((reg["player_id"], r.status_code, r.text[:150]))

    except Exception as e:
        print(f"ERROR conexión lote {numero_lote}/{total_lotes}: {str(e)[:150]}")
        for reg in lote:
            errores.append((reg["player_id"], "ERROR", str(e)[:150]))

    time.sleep(0.2)


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 60)
print("RESULTADO")
print("=" * 60)
print(f"Preparados: {len(registros)}")
print(f"Subidos/actualizados: {subidos}")
print(f"Errores: {len(errores)}")

if errores:
    print()
    print("Primeros errores:")
    for error in errores[:10]:
        print(error)
    raise RuntimeError(f"Supabase devolvió {len(errores)} errores.")

print()
print("OK - TODOS LOS JUGADORES FUERON SUBIDOS/ACTUALIZADOS")
