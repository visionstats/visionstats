function iniciarEstadisticasJugadores() {

    const equipoSelect = document.getElementById("equipoSelect");
    const posicionSelect = document.getElementById("posicionSelect");

    if (!equipoSelect || !posicionSelect) {
        console.error("No se encontraron equipoSelect o posicionSelect.");
        return;
    }

    const listas = {
        delanteros: delanteros,
        mediocampistas: mediocampistas,
        defensores: defensores,
        arqueros: arqueros
    };

    // =========================================================
    // CARGAR EQUIPOS
    // =========================================================

    equipoSelect.innerHTML = "";

    const equipos = new Set();

    Object.values(listas).forEach(lista => {

        lista.forEach(jugador => {

            if (jugador.Equipo) {
                equipos.add(jugador.Equipo);
            }

        });

    });

    [...equipos]
        .sort((a, b) => a.localeCompare(b))
        .forEach(equipo => {

            const option = document.createElement("option");

            option.value = equipo;
            option.textContent = equipo;

            equipoSelect.appendChild(option);

        });


    // =========================================================
    // OCULTAR TODAS LAS TABLAS
    // =========================================================

    function ocultarTablas() {

        document.querySelectorAll("#tablas table").forEach(tabla => {

            tabla.style.display = "none";

            const tbody = tabla.querySelector("tbody");

            if (tbody) {
                tbody.innerHTML = "";
            }

        });

    }


    // =========================================================
    // CAPITALIZAR
    // =========================================================

    function capitalizar(texto) {

        return texto.charAt(0).toUpperCase() + texto.slice(1);

    }


    // =========================================================
    // MOSTRAR TABLA
    // =========================================================

    function mostrarTabla() {

        const posicion = posicionSelect.value;
        const equipo = equipoSelect.value;

        ocultarTablas();

        const tablaId = "tabla" + capitalizar(posicion);

        const tabla = document.getElementById(tablaId);

        if (!tabla) {

            console.error("No existe la tabla:", tablaId);

            return;

        }

        const tbody = tabla.querySelector("tbody");

        if (!tbody) {

            console.error("La tabla no tiene tbody:", tablaId);

            return;

        }


        // Jugadores del equipo seleccionado
        const jugadores = listas[posicion].filter(
            jugador => jugador.Equipo === equipo
        );


        // =====================================================
        // CREAR FILAS
        // =====================================================

        jugadores.forEach(jugador => {

            const fila = document.createElement("tr");


            // -------------------------------------------------
            // EQUIPO
            // -------------------------------------------------

            let celdaEquipo = document.createElement("td");

            celdaEquipo.textContent = jugador.Equipo ?? "";

            fila.appendChild(celdaEquipo);


            // -------------------------------------------------
            // NOMBRE
            // -------------------------------------------------

            let celdaNombre = document.createElement("td");

            celdaNombre.textContent = jugador.Nombre ?? "";

            fila.appendChild(celdaNombre);


            // -------------------------------------------------
            // RESTO DE ESTADÍSTICAS
            // -------------------------------------------------

            Object.entries(jugador).forEach(([propiedad, valor]) => {

                // No mostrar ID
                if (propiedad === "ID") {
                    return;
                }

                // Equipo y Nombre ya fueron agregados
                if (propiedad === "Equipo") {
                    return;
                }

                if (propiedad === "Nombre") {
                    return;
                }

                const celda = document.createElement("td");

                if (valor === null || valor === undefined) {
                    celda.textContent = "0";
                } else {
                    celda.textContent = valor;
                }

                fila.appendChild(celda);

            });


            tbody.appendChild(fila);

        });


        // Mostrar tabla
        tabla.style.display = "table";


        console.log(
            "Tabla:",
            posicion,
            "| Equipo:",
            equipo,
            "| Jugadores:",
            jugadores.length
        );

    }


    // =========================================================
    // CAMBIO DE EQUIPO
    // =========================================================

    equipoSelect.addEventListener("change", () => {

        mostrarTabla();

    });


    // =========================================================
    // CAMBIO DE POSICIÓN
    // =========================================================

    posicionSelect.addEventListener("change", () => {

        mostrarTabla();

    });


    // =========================================================
    // CONFIGURACIÓN INICIAL
    // =========================================================

    if (equipoSelect.options.length > 0) {

        equipoSelect.selectedIndex = 0;

    }

    posicionSelect.value = "delanteros";


    // Mostrar primera tabla
    mostrarTabla();


    console.log(
        "TABLAS DE JUGADORES OK | Equipos:",
        equipos.size
    );

}
