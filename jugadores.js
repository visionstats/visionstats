function iniciarEstadisticasJugadores() {

    const equipoSelect = document.getElementById("equipoSelect");
    const posicionSelect = document.getElementById("posicionSelect");

    if (!equipoSelect || !posicionSelect) {
        console.error("No se encontraron los selectores de jugadores.");
        return;
    }

    const listas = {
        delanteros,
        mediocampistas,
        defensores,
        arqueros
    };

    // Limpiar equipos
    equipoSelect.innerHTML = "";

    // Obtener equipos únicos
    const equipos = new Set();

    Object.values(listas).forEach(lista => {
        lista.forEach(jugador => {
            equipos.add(jugador.Equipo);
        });
    });

    // Orden alfabético
    [...equipos]
        .sort((a, b) => a.localeCompare(b))
        .forEach(equipo => {

            const option = document.createElement("option");

            option.value = equipo;
            option.textContent = equipo;

            equipoSelect.appendChild(option);
        });

    function ocultarTablas() {

        document.querySelectorAll("#tablas table").forEach(tabla => {

            tabla.style.display = "none";

            const tbody = tabla.querySelector("tbody");

            if (tbody) {
                tbody.innerHTML = "";
            }
        });
    }

    function capitalizar(texto) {

        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function mostrarTabla() {

        const posicion = posicionSelect.value;
        const equipo = equipoSelect.value;

        ocultarTablas();

        const tabla = document.getElementById(
            "tabla" + capitalizar(posicion)
        );

        if (!tabla) {
            console.error("Tabla no encontrada:", posicion);
            return;
        }

        const tbody = tabla.querySelector("tbody");

        const jugadores = listas[posicion].filter(
            jugador => jugador.Equipo === equipo
        );

        jugadores.forEach(jugador => {

            const fila = document.createElement("tr");

            Object.values(jugador).forEach(valor => {

                const celda = document.createElement("td");

                celda.textContent =
                    valor === null || valor === undefined
                        ? 0
                        : valor;

                fila.appendChild(celda);
            });

            tbody.appendChild(fila);
        });

        tabla.style.display = "table";
    }

    equipoSelect.addEventListener("change", mostrarTabla);
    posicionSelect.addEventListener("change", mostrarTabla);

    // Primera posición
    posicionSelect.value = "delanteros";

    // Primer equipo
    if (equipoSelect.options.length > 0) {
        equipoSelect.selectedIndex = 0;
    }

    mostrarTabla();

    console.log(
        "ESTADÍSTICAS DE JUGADORES OK",
        equipos.size,
        "equipos"
    );
}