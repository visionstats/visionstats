// ============================================================
// TOP 5
// ============================================================

function mostrarTop5() {

  function crearTop5(lista, atributo, idElemento) {

    const contenedor = document.querySelector(`#${idElemento} ol`);
    contenedor.innerHTML = '';

    const top5 = [...lista]
      .sort((a, b) => (b[atributo] || 0) - (a[atributo] || 0))
      .slice(0, 5);

    if (top5.length === 0) return;

    const maxValor = top5[0][atributo] || 1;

    top5.forEach((jugador, index) => {

      const valor = jugador[atributo];
      const porcentaje = (valor / maxValor) * 100;

      const li = document.createElement('li');
      li.classList.add("top5-item");

      li.innerHTML = `
        <span class="top5-pos">${index + 1}</span>
        <span class="top5-jugador">
          ${jugador.Nombre} (${jugador.Equipo})
          <div class="barra-container">
            <div class="barra" style="width:${porcentaje}%"></div>
          </div>
        </span>
        <span class="top5-valor">${valor}</span>
      `;

      contenedor.appendChild(li);
    });
  }

  crearTop5(delanteros, 'Goles', 'top5Delanteros');
  crearTop5(delanteros, 'Regates con éxito', 'top5DelanterosRegatesconéxito');
  crearTop5(mediocampistas, 'Pases precisos', 'top5Mediocampistas');
  crearTop5(mediocampistas, 'Pases clave', 'top5MediocampistasPasesclave');
  crearTop5(defensores, 'Despejes', 'top5Defensores');
  crearTop5(defensores, 'Total duelos ganados', 'top5DefensoresIntercepciones');
  crearTop5(arqueros, 'Paradas', 'top5Arqueros');
  crearTop5(arqueros, 'Portería a cero', 'top5ArquerosPorteríaacero');
}

mostrarTop5();


// ============================================================
// TABLAS POR EQUIPO Y POSICIÓN
// (este archivo se carga después de Supabase, así que corre directo,
//  sin esperar DOMContentLoaded)
// ============================================================

const todasLasListas = { delanteros, mediocampistas, defensores, arqueros };

const equipoSelect = document.getElementById("equipoSelect");
const posicionSelect = document.getElementById("posicionSelect");

const equiposUnicos = new Set();

Object.values(todasLasListas).forEach(lista => {
  lista.forEach(j => { if (j.Equipo) equiposUnicos.add(j.Equipo); });
});

[...equiposUnicos].sort((a, b) => a.localeCompare(b, 'es')).forEach(equipo => {
  const option = document.createElement("option");
  option.value = equipo;
  option.textContent = equipo;
  equipoSelect.appendChild(option);
});

equipoSelect.selectedIndex = 0;
posicionSelect.disabled = false;
posicionSelect.value = "delanteros";

mostrarTablaFiltrada(posicionSelect.value, equipoSelect.value);

equipoSelect.addEventListener("change", () => {
  mostrarTablaFiltrada(posicionSelect.value, equipoSelect.value);
});

posicionSelect.addEventListener("change", () => {
  mostrarTablaFiltrada(posicionSelect.value, equipoSelect.value);
});


function ocultarTablas() {
  document.querySelectorAll("#tablas table").forEach(tabla => {
    tabla.style.display = "none";
    tabla.querySelector("tbody").innerHTML = "";
  });
}

// Arma cada fila siguiendo el orden de los encabezados de la tabla
function crearFilasJugadores(datos, tabla) {

  const columnas = [...tabla.querySelectorAll("thead th")]
    .map(th => th.textContent.trim());

  const body = tabla.querySelector("tbody");

  datos.forEach(jugador => {
    const fila = document.createElement("tr");
    columnas.forEach(col => {
      const celda = document.createElement("td");
      celda.textContent = jugador[col] ?? "";
      fila.appendChild(celda);
    });
    body.appendChild(fila);
  });
}

function mostrarTablaFiltrada(posicion, equipo) {

  ocultarTablas();

  const tabla = document.getElementById(`tabla${capitalizar(posicion)}`);

  const jugadoresFiltrados = todasLasListas[posicion]
    .filter(j => j.Equipo === equipo)
    .sort((a, b) => (b["Minutos jugados"] || 0) - (a["Minutos jugados"] || 0));

  if (jugadoresFiltrados.length > 0) {
    crearFilasJugadores(jugadoresFiltrados, tabla);
    tabla.style.display = "table";
  } else {
    alert("No hay datos para esta combinación.");
  }
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}


// ============================================================
// RADAR DE EQUIPOS (sin cambios, usa "data" de scriptdatb.js)
// ============================================================

const labels=["GOEV","GOER","GCPP","TPCG","TPCO","GFPP","GEGR","GERG","ICTE","IGTE"]

const equipos=[...new Set(data.map(d=>d.Equipo))].sort()

const teamSelect=document.getElementById("teamSelect")

equipos.forEach(e=>{
let op=document.createElement("option")
op.value=e
op.textContent=e
teamSelect.appendChild(op)
})

const ultimaFecha=Math.max(...data.map(d=>Number(d.Fecha)))

document.getElementById("fechaInfo").innerText="Estadísticas acumuladas hasta Fecha "+ultimaFecha

function div(a,b){
return b===0?0:a/b
}

function calcularStats(team){

const rows=data.filter(d=>d.Equipo===team)

let gf=0
let gc=0
let te=0
let tec=0
let ia=0
let iac=0
let partidos=0

rows.forEach(r=>{

gf+=Number(r["Goles a favor"])||0
gc+=Number(r["Goles en contra"])||0
te+=Number(r["Tiros efectivos al arco"])||0
tec+=Number(r["Tiros efectivos a su arco"])||0
ia+=Number(r["Intentos al arco"])||0
iac+=Number(r["Intentos a su arco"])||0
partidos+=Number(r["Contador"])||0

})

const golesEvitados=tec-gc
const golesErrados=te-gf

return{

GOEV:golesEvitados,
GOER:golesErrados,
GCPP:div(gc,partidos),
TPCG:div(tec,gc),
TPCO:div(te,gf),
GFPP:div(gf,partidos),
GEGR:div(golesEvitados,gc),
GERG:div(golesErrados,gf),
ICTE:div(iac,tec),
IGTE:div(ia,te)

}

}

let ligaStats={}

equipos.forEach(e=>{
ligaStats[e]=calcularStats(e)
})

let maximos={}
let minimos={}

labels.forEach(l=>{

maximos[l]=Math.max(...equipos.map(e=>ligaStats[e][l]))
minimos[l]=Math.min(...equipos.map(e=>ligaStats[e][l]))

})

const mayorMejor=["GOEV","TPCG","GFPP","GEGR","ICTE"]

function normalizar(team){

let reales=ligaStats[team]

let porcentajes=labels.map(l=>{

let val=reales[l]

if(mayorMejor.includes(l)){
return (val/maximos[l])*100
}else{
return (minimos[l]/val)*100
}

})

return{porcentajes,reales}

}

const ctx=document.getElementById("radarChart")

let chart=new Chart(ctx,{
type:"radar",
data:{
labels:labels,
datasets:[{
label:"",
data:[]
}]
},
options:{
scales:{
r:{
min:0,
max:100,
angleLines:{color:"#334155"},
grid:{color:"#334155"},
pointLabels:{color:"white"},
ticks:{display:false}
}
},
plugins:{
legend:{labels:{color:"white"}},
tooltip:{
callbacks:{
title:function(context){

const nombres={
GOEV:"Goles evitados",
GOER:"Goles errados",
GCPP:"Goles en contra por partido",
TPCG:"Tiros para conceder 1 gol",
TPCO:"Tiros para conseguir 1 gol",
GFPP:"Goles a favor por partido",
GEGR:"Goles evitados cada 1 gol recibido",
GERG:"Goles errados cada 1 gol realizado",
ICTE:"Intentos para conceder tiro efectivo",
IGTE:"Intentos para conseguir tiro efectivo"
}

return nombres[context[0].label]

},
label:function(context){

let team=context.dataset.label
let stat=context.label

let real=ligaStats[team][stat]

return stat+": "+real.toFixed(2)

}
}
}
}
}
})

function update(){

const team=teamSelect.value

const {porcentajes,reales}=normalizar(team)

chart.data.datasets[0].label=team
chart.data.datasets[0].data=porcentajes

chart.update()

labels.forEach(stat=>{
let valor=reales[stat]
let el=document.getElementById("stat-"+stat)
if(el){
el.innerText=valor.toFixed(2)
}
})

}

teamSelect.addEventListener("change",update)

teamSelect.value=equipos[0]

update()