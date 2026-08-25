// ============================================================
// TOP 5 DE JUGADORES
// ============================================================

function mostrarTop5() {

  function crearTop5(lista, atributo, idElemento, nombreExtra = '') {

    const contenedor = document.querySelector(`#${idElemento} ol`);

    if (!contenedor || !lista || lista.length === 0) {
      return;
    }

    const top5 = [...lista]
      .filter(jugador => Number(jugador[atributo]) >= 0)
      .sort((a, b) => Number(b[atributo]) - Number(a[atributo]))
      .slice(0, 5);

    contenedor.innerHTML = '';

    if (top5.length === 0) {
      return;
    }

    const maxValor = Number(top5[0][atributo]) || 1;

    top5.forEach((jugador, index) => {

      const li = document.createElement('li');

      li.classList.add("top5-item");

      const valor = nombreExtra
        ? jugador[nombreExtra]
        : jugador[atributo];

      const valorNumerico = Number(valor) || 0;

      const porcentaje =
        maxValor > 0
          ? (valorNumerico / maxValor) * 100
          : 0;

      li.innerHTML = `
        <span class="top5-pos">
          ${index + 1}
        </span>

        <span class="top5-jugador">
          ${jugador.Nombre} (${jugador.Equipo})

          <div class="barra-container">
            <div
              class="barra"
              style="width:${porcentaje}%">
            </div>
          </div>

        </span>

        <span class="top5-valor">
          ${valor}
        </span>
      `;

      contenedor.appendChild(li);

    });

  }


  crearTop5(
    delanteros,
    'Goles',
    'top5Delanteros'
  );

  crearTop5(
    delanteros,
    'Regates con éxito',
    'top5DelanterosRegatesconéxito'
  );

  crearTop5(
    mediocampistas,
    'Goles',
    'top5Mediocampistas'
  );

  crearTop5(
    mediocampistas,
    'Pases clave',
    'top5MediocampistasPasesclave'
  );

  crearTop5(
    defensores,
    'Entradas',
    'top5Defensores'
  );

  crearTop5(
    defensores,
    'Intercepciones',
    'top5DefensoresIntercepciones'
  );

  crearTop5(
    arqueros,
    'Paradas',
    'top5Arqueros'
  );

  crearTop5(
    arqueros,
    'Portería a cero',
    'top5ArquerosPorteríaacero'
  );

}


// ============================================================
// LISTAS GENERALES
// ============================================================

const todasLasListas = {
  delanteros,
  mediocampistas,
  defensores,
  arqueros
};


// ============================================================
// FILTROS DE JUGADORES
// ============================================================

const equipoSelect =
  document.getElementById("equipoSelect");

const posicionSelect =
  document.getElementById("posicionSelect");


if (equipoSelect && posicionSelect) {

  // ----------------------------------------------------------
  // OBTENER EQUIPOS ÚNICOS
  // ----------------------------------------------------------

  const equiposUnicos = new Set();

  Object.values(todasLasListas).forEach(lista => {

    lista.forEach(jugador => {

      if (jugador.Equipo) {
        equiposUnicos.add(jugador.Equipo);
      }

    });

  });


  // ----------------------------------------------------------
  // CARGAR EQUIPOS EN SELECT
  // ----------------------------------------------------------

  [...equiposUnicos]
    .sort((a, b) => a.localeCompare(b))
    .forEach(equipo => {

      const option =
        document.createElement("option");

      option.value = equipo;
      option.textContent = equipo;

      equipoSelect.appendChild(option);

    });


  // ----------------------------------------------------------
  // SELECCIÓN INICIAL
  // ----------------------------------------------------------

  if (equipoSelect.options.length > 0) {

    equipoSelect.selectedIndex = 0;

  }

  posicionSelect.disabled = false;

  posicionSelect.value = "delanteros";


  if (equipoSelect.value) {

    mostrarTablaFiltrada(
      "delanteros",
      equipoSelect.value
    );

  }


  // ----------------------------------------------------------
  // CAMBIO DE EQUIPO
  // ----------------------------------------------------------

  equipoSelect.addEventListener("change", () => {

    mostrarTablaFiltrada(
      posicionSelect.value,
      equipoSelect.value
    );

  });


  // ----------------------------------------------------------
  // CAMBIO DE POSICIÓN
  // ----------------------------------------------------------

  posicionSelect.addEventListener("change", () => {

    mostrarTablaFiltrada(
      posicionSelect.value,
      equipoSelect.value
    );

  });

}


// ============================================================
// OCULTAR TABLAS
// ============================================================

function ocultarTablas() {

  document.querySelectorAll("#tablas table")
    .forEach(tabla => {

      tabla.style.display = "none";

      const tbody =
        tabla.querySelector("tbody");

      if (tbody) {
        tbody.innerHTML = "";
      }

    });

}


// ============================================================
// CREAR FILAS DE JUGADORES
// ============================================================

function crearFilasJugadores(datos, tablaBody) {

  const tabla =
    tablaBody.closest("table");

  const tablaId = tabla.id;

  let columnas = [];


  // ----------------------------------------------------------
  // DELANTEROS
  // ----------------------------------------------------------

  if (tablaId === "tablaDelanteros") {

    columnas = [

      ["Equipo", "Equipo"],

      ["Nombre", "Nombre"],

      ["Goles", "Goles"],

      ["Regates con éxito", "Regates con éxito"],

      ["Tiros a puerta", "Tiros a puerta"],

      ["Conversión de goles %", "Conversión de goles %"],

      [
        "Duelos terrestres ganados %",
        "Duelos terrestres ganados %"
      ],

      ["Minutos jugados", "Minutos jugados"]

    ];

  }


  // ----------------------------------------------------------
  // MEDIOCAMPISTAS
  // ----------------------------------------------------------

  else if (tablaId === "tablaMediocampistas") {

    columnas = [

      ["Equipo", "Equipo"],

      ["Nombre", "Nombre"],

      ["Goles", "Goles"],

      ["Pases precisos", "Pases precisos"],

      ["Pases clave", "Pases clave"],

      ["Regates con éxito", "Regates con éxito"],

      [
        "Pases precisos en el último tercio",
        "Pases precisos en el último tercio"
      ],

      ["Minutos jugados", "Minutos jugados"]

    ];

  }


  // ----------------------------------------------------------
  // DEFENSORES
  // ----------------------------------------------------------

  else if (tablaId === "tablaDefensores") {

    columnas = [

      ["Equipo", "Equipo"],

      ["Nombre", "Nombre"],

      ["Pases precisos %", "Pases precisos %"],

      ["Entradas", "Entradas"],

      ["Intercepciones", "Intercepciones"],

      ["Despejes", "Despejes"],

      ["Regateado", "Regateado"],

      ["Minutos jugados", "Minutos jugados"]

    ];

  }


  // ----------------------------------------------------------
  // ARQUEROS
  // ----------------------------------------------------------

  else if (tablaId === "tablaArqueros") {

    columnas = [

      ["Equipo", "Equipo"],

      ["Nombre", "Nombre"],

      ["Paradas", "Paradas"],

      ["Portería a cero", "Portería a cero"],

      [
        "Goles encajados dentro del área",
        "Goles encajados dentro del área"
      ],

      [
        "Goles encajados fuera del área",
        "Goles encajados fuera del área"
      ],

      [
        "Tiros lanzados con éxito",
        "Tiros lanzados con éxito"
      ],

      ["Minutos jugados", "Minutos jugados"]

    ];

  }


  // ----------------------------------------------------------
  // CREAR FILAS
  // ----------------------------------------------------------

  datos.forEach(jugador => {

    const fila =
      document.createElement("tr");


    columnas.forEach(([nombre, propiedad]) => {

      const celda =
        document.createElement("td");

      let valor =
        jugador[propiedad];


      if (
        valor === undefined ||
        valor === null ||
        valor === ""
      ) {

        valor = "-";

      }


      celda.textContent = valor;

      fila.appendChild(celda);

    });


    tablaBody.appendChild(fila);

  });

}


// ============================================================
// MOSTRAR TABLA FILTRADA
// ============================================================

function mostrarTablaFiltrada(posicion, equipo) {

  ocultarTablas();


  const tabla =
    document.getElementById(
      `tabla${capitalizar(posicion)}`
    );


  if (!tabla) {
    return;
  }


  const body =
    tabla.querySelector("tbody");


  const lista =
    todasLasListas[posicion];


  if (!lista) {
    return;
  }


  const jugadoresFiltrados =
    lista.filter(
      jugador => jugador.Equipo === equipo
    );


  if (jugadoresFiltrados.length > 0) {

    crearFilasJugadores(
      jugadoresFiltrados,
      body
    );

    tabla.style.display = "table";

  }

  else {

    tabla.style.display = "table";

    body.innerHTML = `
      <tr>
        <td colspan="8">
          No hay datos para esta combinación.
        </td>
      </tr>
    `;

  }

}


// ============================================================
// CAPITALIZAR
// ============================================================

function capitalizar(texto) {

  return texto.charAt(0).toUpperCase() +
         texto.slice(1);

}


// ============================================================
// MOSTRAR TOP 5
// ============================================================

mostrarTop5();


// ============================================================
// RADAR DE EQUIPOS
// ============================================================

const labels = [
  "GOEV",
  "GOER",
  "GCPP",
  "TPCG",
  "TPCO",
  "GFPP",
  "GEGR",
  "GERG",
  "ICTE",
  "IGTE"
];


const equipos =
  [...new Set(
    data.map(d => d.Equipo)
  )].sort();


const teamSelect =
  document.getElementById("teamSelect");


equipos.forEach(equipo => {

  const option =
    document.createElement("option");

  option.value = equipo;

  option.textContent = equipo;

  teamSelect.appendChild(option);

});


const ultimaFecha =
  Math.max(
    ...data.map(
      d => Number(d.Fecha)
    )
  );


document.getElementById(
  "fechaInfo"
).innerText =
  "Estadísticas acumuladas hasta Fecha " +
  ultimaFecha;


// ============================================================
// DIVISIÓN SEGURA
// ============================================================

function div(a, b) {

  return b === 0
    ? 0
    : a / b;

}


// ============================================================
// CALCULAR ESTADÍSTICAS
// ============================================================

function calcularStats(team) {

  const rows =
    data.filter(
      d => d.Equipo === team
    );


  let gf = 0;
  let gc = 0;
  let te = 0;
  let tec = 0;
  let ia = 0;
  let iac = 0;
  let partidos = 0;


  rows.forEach(r => {

    gf +=
      Number(
        r["Goles a favor"]
      ) || 0;


    gc +=
      Number(
        r["Goles en contra"]
      ) || 0;


    te +=
      Number(
        r["Tiros efectivos al arco"]
      ) || 0;


    tec +=
      Number(
        r["Tiros efectivos a su arco"]
      ) || 0;


    ia +=
      Number(
        r["Intentos al arco"]
      ) || 0;


    iac +=
      Number(
        r["Intentos a su arco"]
      ) || 0;


    partidos +=
      Number(
        r["Contador"]
      ) || 0;

  });


  const golesEvitados =
    tec - gc;


  const golesErrados =
    te - gf;


  return {

    GOEV:
      golesEvitados,

    GOER:
      golesErrados,

    GCPP:
      div(gc, partidos),

    TPCG:
      div(tec, gc),

    TPCO:
      div(te, gf),

    GFPP:
      div(gf, partidos),

    GEGR:
      div(golesEvitados, gc),

    GERG:
      div(golesErrados, gf),

    ICTE:
      div(iac, tec),

    IGTE:
      div(ia, te)

  };

}


// ============================================================
// ESTADÍSTICAS DE TODA LA LIGA
// ============================================================

let ligaStats = {};


equipos.forEach(equipo => {

  ligaStats[equipo] =
    calcularStats(equipo);

});


// ============================================================
// MÁXIMOS Y MÍNIMOS
// ============================================================

let maximos = {};

let minimos = {};


labels.forEach(label => {

  maximos[label] =
    Math.max(
      ...equipos.map(
        equipo =>
          ligaStats[equipo][label]
      )
    );


  minimos[label] =
    Math.min(
      ...equipos.map(
        equipo =>
          ligaStats[equipo][label]
      )
    );

});


// ============================================================
// MÉTRICAS DONDE MAYOR = MEJOR
// ============================================================

const mayorMejor = [

  "GOEV",
  "TPCG",
  "GFPP",
  "GEGR",
  "ICTE"

];


// ============================================================
// NORMALIZAR
// ============================================================

function normalizar(team) {

  const reales =
    ligaStats[team];


  const porcentajes =
    labels.map(label => {

      const valor =
        reales[label];


      if (mayorMejor.includes(label)) {

        if (maximos[label] === 0) {
          return 0;
        }

        return (
          valor /
          maximos[label]
        ) * 100;

      }


      else {

        if (valor === 0) {
          return 0;
        }

        if (minimos[label] === 0) {
          return 100;
        }

        return (
          minimos[label] /
          valor
        ) * 100;

      }

    });


  return {
    porcentajes,
    reales
  };

}


// ============================================================
// CREAR RADAR
// ============================================================

const ctx =
  document.getElementById(
    "radarChart"
  );


let chart =
  new Chart(ctx, {

    type: "radar",

    data: {

      labels: labels,

      datasets: [{

        label: "",

        data: []

      }]

    },

    options: {

      scales: {

        r: {

          min: 0,

          max: 100,

          angleLines: {
            color: "#334155"
          },

          grid: {
            color: "#334155"
          },

          pointLabels: {
            color: "white"
          },

          ticks: {
            display: false
          }

        }

      },

      plugins: {

        legend: {

          labels: {
            color: "white"
          }

        },

        tooltip: {

          callbacks: {

            title: function(context) {

              const nombres = {

                GOEV:
                  "Goles evitados",

                GOER:
                  "Goles errados",

                GCPP:
                  "Goles en contra por partido",

                TPCG:
                  "Tiros para conceder 1 gol",

                TPCO:
                  "Tiros para conseguir 1 gol",

                GFPP:
                  "Goles a favor por partido",

                GEGR:
                  "Goles evitados cada 1 gol recibido",

                GERG:
                  "Goles errados cada 1 gol realizado",

                ICTE:
                  "Intentos para conceder tiro efectivo",

                IGTE:
                  "Intentos para conseguir tiro efectivo"

              };


              return nombres[
                context[0].label
              ];

            },


            label: function(context) {

              const team =
                context.dataset.label;

              const stat =
                context.label;

              const real =
                ligaStats[team][stat];


              return (
                stat +
                ": " +
                real.toFixed(2)
              );

            }

          }

        }

      }

    }

  });


// ============================================================
// ACTUALIZAR RADAR
// ============================================================

function update() {

  const team =
    teamSelect.value;


  if (!team || !ligaStats[team]) {
    return;
  }


  const {
    porcentajes,
    reales
  } =
    normalizar(team);


  chart.data.datasets[0].label =
    team;


  chart.data.datasets[0].data =
    porcentajes;


  chart.update();


  labels.forEach(stat => {

    const valor =
      reales[stat];


    const elemento =
      document.getElementById(
        "stat-" + stat
      );


    if (elemento) {

      elemento.innerText =
        Number(valor).toFixed(2);

    }

  });

}


// ============================================================
// EVENTO RADAR
// ============================================================

teamSelect.addEventListener(
  "change",
  update
);


// ============================================================
// EQUIPO INICIAL
// ============================================================

if (equipos.length > 0) {

  teamSelect.value =
    equipos[0];

  update();

}