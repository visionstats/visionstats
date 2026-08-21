function mostrarTop5() {
  // Función auxiliar para llenar un top5 específico
  function crearTop5(lista, atributo, idElemento, nombreExtra = '') {
    const top5 = [...lista]
      .sort((a, b) => b[atributo] - a[atributo])
      .slice(0, 5);

    const contenedor = document.querySelector(`#${idElemento} ol`);
    contenedor.innerHTML = '';

const maxValor = top5[0][atributo]; // mejor valor del top5

top5.forEach((jugador,index) => {

 const li = document.createElement('li');
 li.classList.add("top5-item");

 const valor = nombreExtra ? jugador[nombreExtra] : jugador[atributo];
 const porcentaje = (valor / maxValor) * 100;

 li.innerHTML = `
 <span class="top5-pos">${index+1}</span>

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
  crearTop5(mediocampistas, 'Goles', 'top5Mediocampistas');
  crearTop5(mediocampistas, 'Pases clave', 'top5MediocampistasPasesclave');
  crearTop5(defensores, 'Entradas', 'top5Defensores');
  crearTop5(defensores, 'Intercepciones', 'top5DefensoresIntercepciones');
  crearTop5(arqueros, 'Paradas', 'top5Arqueros');
  crearTop5(arqueros, 'Portería a cero', 'top5ArquerosPorteríaacero');
}

mostrarTop5();

const todasLasListas = { delanteros, mediocampistas, defensores, arqueros };

document.addEventListener("DOMContentLoaded", () => {
  const equipoSelect = document.getElementById("equipoSelect");
  const posicionSelect = document.getElementById("posicionSelect");

  // Cargar opciones de equipos
  const equiposUnicos = new Set();
  Object.values(todasLasListas).forEach(lista => {
    lista.forEach(j => equiposUnicos.add(j.Equipo));
  });

  equiposUnicos.forEach(equipo => {
    const option = document.createElement("option");
    option.value = equipo;
    option.textContent = equipo;
    equipoSelect.appendChild(option);
  });

/* SELECCION POR DEFECTO */

equipoSelect.selectedIndex = 1; // primer equipo
posicionSelect.disabled = false;
posicionSelect.value = "delanteros"; // posición inicial

mostrarTablaFiltrada("delanteros", equipoSelect.value);

equipoSelect.addEventListener("change", () => {

  const equipo = equipoSelect.value;
  const posicion = posicionSelect.value;

  mostrarTablaFiltrada(posicion, equipo);

});

 posicionSelect.addEventListener("change", () => {

  const equipo = equipoSelect.value;
  const posicion = posicionSelect.value;

  mostrarTablaFiltrada(posicion, equipo);

});
});

function ocultarTablas() {
  document.querySelectorAll("table").forEach(tabla => {
    tabla.style.display = "none";
    tabla.querySelector("tbody").innerHTML = "";
  });
}

function crearFilasJugadores(datos, tablaBody) {
  datos.forEach(jugador => {
    const fila = document.createElement("tr");
    for (const propiedad in jugador) {
      const celda = document.createElement("td");
      celda.textContent = jugador[propiedad];
      fila.appendChild(celda);
    }
    tablaBody.appendChild(fila);
  });
}

function mostrarTablaFiltrada(posicion, equipo) {
  ocultarTablas();
  const tabla = document.getElementById(`tabla${capitalizar(posicion)}`);
  const body = tabla.querySelector("tbody");
  const jugadoresFiltrados = todasLasListas[posicion].filter(j => j.Equipo === equipo);
  if (jugadoresFiltrados.length > 0) {
    crearFilasJugadores(jugadoresFiltrados, body);
    tabla.style.display = "table";
  } else {
    alert("No hay datos para esta combinación.");
  }
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

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