const URLBASE = "https://calcount.develotion.com/"
const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const REGISTROCOMIDA = document.querySelector("#pantalla-registroComida");
const LISTADOREGISTRO = document.querySelector("#pantalla-listadoRegistrosComida");
const FILTRARFECHA = document.querySelector("#pantalla-filtrarFecha");
const CALORIAS = document.querySelector("#pantalla-calorias");
const MAPA = document.querySelector("#pantalla-mapa");
const NAV = document.querySelector("ion-nav");

Inicio();

function Inicio() {
    Eventos();
    ArmarMenuDeOpciones();
    
}

function Eventos() {
   ROUTER.addEventListener("ionRouteDidChange", Navegar)
   document.querySelector("#btnRegistrar").addEventListener("click", TomarDatosRegistro);
   document.querySelector("#btnLoguear").addEventListener("click", TomarDatosLogin);
   document.querySelector("#btnRegistrarComida").addEventListener("click", TomarDatosRegistroComida);
   document.querySelector("#btnBuscarFecha").addEventListener("click", TomarDatosEntreFechas);
   document.querySelector("#btnBuscarUsuariosPorPais").addEventListener("click", ObtenerUsuariosPorPais);
}

function ArmarMenuDeOpciones() {
    let HayToken = localStorage.getItem("apiKey");

    let _menu = `<ion-item href="/" onclick="cerrarMenu()">Home</ion-item>`;
    if (HayToken) {
        _menu += ` <ion-item href="/registroComida" onclick="cerrarMenu()">Registro de Comida</ion-item>
                 <ion-item href="/listadoRegistrosComida" onclick="cerrarMenu()">Listar Registro de Comidas</ion-item>
                 <ion-item href="/filtrarFecha" onclick="cerrarMenu()">Buscar Entre Fechas</ion-item>
                 <ion-item href="/calorias" onclick="cerrarMenu()">Informe de Calorías</ion-item>
                 <ion-item href="/mapa" onclick="cerrarMenu()">Mapa</ion-item>
                 <ion-item onclick="Logout()">Cerrar sesión</ion-item>`;
    } else {
        _menu += `  <ion-item href="/login" onclick="cerrarMenu()">Login</ion-item>
        <ion-item href="/registro" onclick="cerrarMenu()">Registro</ion-item>`;
    }
    document.querySelector("#menuOpciones").innerHTML = _menu;
}

//ARRAYS GLOBALES
let PaisesConCoords = []; //array global para usar tanto como en el select del registro y luego en el mapa
let PaisesConCantUsuarios = [];
let Alimentos = [];
let RegistrosComidas = [];

//Hacer Logout
function Logout(){
    localStorage.clear();
    NAV.push("page-home");
    ArmarMenuDeOpciones();
    cerrarMenu();
}

//Login

function TomarDatosLogin() {
    let u = document.querySelector("#txtLUsuario").value;
    let p = document.querySelector("#txtLPassword").value;

    Loguear(u, p);
}

function Loguear(u, p){
    let usuario = new Object();
    usuario.usuario = u;
    usuario.password = p;

    MostrarLoader("Iniciando sesión");
    fetch(`${URLBASE}login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    }).then(function(response) {
        console.log(response);
        return response.json();
    }).then(function (data) {
        console.log(data);

        DetenerLoader(); //Una vez que ya logueó, detengo el loader

        if(data.codigo == "200") {
            localStorage.setItem("apiKey",data.apiKey);
            localStorage.setItem("idUser",data.id);
            localStorage.setItem("caloriasDiarias",data.caloriasDiarias);
            ArmarMenuDeOpciones();
            NAV.push("page-home")
        }else {
            MostrarToast(data.error, 3000)
        }
    
    }).catch(function (error) {
        console.log(error);
        DetenerLoader();
        Alertar("IMPORTANTE", "ERROR DE INICIO DE SESIÓN", "ERROR");
    })
}

//Registro de Usuario

function TomarDatosRegistro() {
    MostrarPaisesSelect();
    let u = document.querySelector("#txtRUsuario").value;
    let p = document.querySelector("#txtRPassword").value;
    let pais = document.querySelector("#slcRPaises").value;
    let cal = document.querySelector("#txtRCaloriasDiarias").value;

    Registrar(u, p, pais, cal)
}

function Registrar(u, p, pais, cal) {
    let usuario = new Object();
    usuario.usuario = u;
    usuario.password = p;
    usuario.idPais = pais;
    usuario.caloriasDiarias = cal;
    console.log("usuario a registrar: ", usuario)

    fetch(`${URLBASE}usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (data) {
        console.log(data);
        if (data.codigo == "200") {
            console.log("Calorias recibidas: ",data.caloriasDiarias)
            document.querySelector("#resReg").innerHTML = "Registro de usuario correcto";
        } else {
            document.querySelector("#resReg").innerHTML = data.error;
        }


    }).catch(function (error) {
        console.log(error);
    })

}


function MostrarPaisesSelect() {
   
    document.querySelector("#slcRPaises").innerHTML = "";
    
    fetch(`${URLBASE}paises.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function(response){
        return response.json();
    }).then(function(data){
         PaisesConCoords = data.paises;
            
         for (let p of PaisesConCoords) {
            document.querySelector("#slcRPaises").innerHTML += `<ion-select-option value="${p.id}">${p.name}</ion-select-option>`;
         }
     })
}

function Navegar(evt) {
    OcultarPantallas();
    let ruta = evt.detail.to;
    if (ruta == "/") {
        HOME.style.display = "block";
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";
    } else if (ruta == "/registro") {
        REGISTRO.style.display = "block";
        MostrarPaisesSelect();
    } else if (ruta == "/registroComida") {
        REGISTROCOMIDA.style.display = "block";
        MostrarAlimentosSelect();
    } else if (ruta == "/listadoRegistrosComida"){
        LISTADOREGISTRO.style.display = "block";
        ObtenerRegistros();
    } else if (ruta == "/filtrarFecha"){
        FILTRARFECHA.style.display = "block";
        BuscarEntreFechas();
    } else if (ruta == "/logout"){
        LOGOUT.style.display = "block";
        Logout()
    } else if (ruta == "/mapa"){
        MAPA.style.display = "block";
        getLocation();
    } else if (ruta == "/calorias"){
        CALORIAS.style.display = "block";
        CalcularCaloriasDiarias();
        //CalcularCaloriasTotales(); 
    }

}

function cerrarMenu() {
    MENU.close()
}

function OcultarPantallas() {
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    REGISTROCOMIDA.style.display = "none";
    LISTADOREGISTRO.style.display = "none";
    FILTRARFECHA.style.display = "none";
    CALORIAS.style.display = "none";
    MAPA.style.display = "none";
}

const loading = document.createElement('ion-loading');

function MostrarLoader(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function DetenerLoader() {
    loading.dismiss();
}

function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.mensaje = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}

//Registrar una comida



function TomarDatosRegistroComida() {
    let a = document.querySelector("#slcRCAlimento").value;
    let u = localStorage.getItem("idUser");
    let c = document.querySelector("#txtRCCantidad").value;
    let f = document.querySelector("#datetimeRegistro").value;
    let today = new Date();

    if(f > today) {
        document.querySelector("#resRegComida").innerHTML = "Ingrese una fecha menor o igual al día de hoy";
    }else{
        RegistrarComida(a, u, c, f);
    }
}

function RegistrarComida(a, u, c, f) {
    let registroComida = new Object();
    registroComida.idAlimento = a;
    registroComida.idUsuario = u
    registroComida.cantidad = c;
    registroComida.fecha = f;

    fetch(`${URLBASE}registros.php`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem("apiKey"),
            'iduser': localStorage.getItem("idUser")
        },
        body: JSON.stringify(registroComida),
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data);

        if(data.codigo == "200") {
            document.querySelector("#resRegComida").innerHTML = "Registro de comida exitoso";
        }else{
            document.querySelector("#resRegComida").innerHTML = data.error;
        }
    }).catch(function (error) {
        console.log(error);
    })
}

function MostrarAlimentosSelect() {
   
    document.querySelector("#slcRCAlimento").innerHTML = "";
    
    fetch(`${URLBASE}alimentos.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem("apiKey"),
            'iduser': localStorage.getItem("idUser")
        },
    }).then(function(response){
        return response.json();
    }).then(function(data){
         Alimentos = data.alimentos;
            
            for (let a of Alimentos){
                document.querySelector("#slcRCAlimento").innerHTML += `<ion-select-option value="${a.id}">${a.nombre}</ion-select-option>`;
            }
            
    })
}

//Listado de registros de comidas



async function ObtenerRegistros(){
    MostrarLoader("Obteniendo registros de comida")
    
    await fetch(`${URLBASE}registros.php?idUsuario=${localStorage.getItem("idUser")}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem("apiKey"),
            'iduser': localStorage.getItem("idUser")
        }
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
       
        console.log(data);

        let cadena = ``;

        RegistrosComidas = data.registros

        for(let p of RegistrosComidas){

            let alimentoBuscadoPorId = alimentoPorId(p.idAlimento);
            cadena += 
            `<ion-card>
                <img alt="Silhouette of mountains" src="https://calcount.develotion.com/imgs/${alimentoBuscadoPorId.imagen}.png" />
                    <ion-card-header>
                        <ion-card-subtitle>Calorías: ${alimentoBuscadoPorId.calorias}</ion-card-subtitle>
                        
                        <ion-card-title>Nombre: ${alimentoBuscadoPorId.nombre}</ion-card-title>
                    </ion-card-header>
            
                    <ion-button id="${p.id}" expand="full" onclick="EliminarRegistros(id)">Eliminar Registro</ion-button>
            </ion-card>`
        }
        document.querySelector("#lista-registrosComida").innerHTML = cadena;
        DetenerLoader();
    }).catch(function(error){
        DetenerLoader()
    })
    return RegistrosComidas;
}

function alimentoPorId(id){
    let alimento = null;

    for(let a of Alimentos){

        if(a.id == id){
            return a;
        }
        
    }
}

function EliminarRegistros(idRegistro){
    fetch(`${URLBASE}registros.php?idRegistro=${idRegistro}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem("apiKey"),
            'iduser': localStorage.getItem("idUser")
        }
        
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data)

        if (data.codigo == "200") {
            document.querySelector("#lista-registrosComida").innerHTML = "Registro de ingesta eliminado";
            ObtenerRegistros();
        } else {
            document.querySelector("#lista-registrosComida").innerHTML = data.error;
        }
    }).catch(function (error) {
        console.log(error);
    })
}

//Filtrar entre fechas

async function TomarDatosEntreFechas(){
    let fecha1 = document.querySelector("#datetime1").value;
    let fecha2 = document.querySelector("#datetime2").value;
    let today = new Date();

    if(fecha1 > today || fecha2 > today){
       //MostrarToast("Ingrese una fecha menor o igual al día de hoy", 3000);
        document.querySelector("#resfilFecha").innerHTML = "Ingrese una fecha menor o igual al día de hoy";
    }

    let listaRegistrosConFecha = await BuscarEntreFechas(fecha1, fecha2)

    let cadena = ``;

    for(let p of listaRegistrosConFecha){

        let alimentoBuscadoPorId = alimentoPorId(p.idAlimento);
        cadena += 
        `<ion-card>
            <img alt="Silhouette of mountains" src="https://calcount.develotion.com/imgs/${alimentoBuscadoPorId.imagen}.png" />
                <ion-card-header>
                    <ion-card-subtitle>Calorías: ${alimentoBuscadoPorId.calorias}</ion-card-subtitle>
                    
                    <ion-card-title>Nombre: ${alimentoBuscadoPorId.nombre}</ion-card-title>
                </ion-card-header>
        
                
        </ion-card>`
    }
    document.querySelector("#resfilFecha").innerHTML = cadena;
    DetenerLoader();
}

async function BuscarEntreFechas(fecha1, fecha2) {
    let listaRegistrosComidas = await ObtenerRegistros();
    console.log(listaRegistrosComidas);

    let listaRegistrosConFecha = [];
    for(let i = 0; i<listaRegistrosComidas.length;i++){
        let unRegistro = listaRegistrosComidas[i];

        if(unRegistro.fecha>=fecha1 && unRegistro.fecha<=fecha2){
            let ObjetoAlimento = [];
            ObjetoAlimento.idAlimento = unRegistro.idAlimento;
            ObjetoAlimento.idRegistro = unRegistro.id;
            listaRegistrosConFecha.push(ObjetoAlimento);
        }
    }
    return listaRegistrosConFecha;
}

//Informe de Calorías
async function CalcularCaloriasDiarias(){
    let caloriasTotales = await CalcularCaloriasTotales();
    let caloriasHoy = await ObtenerCaloriasDiarias();
    let caloriasDiariasRecomendadasUsuario = localStorage.getItem("caloriasDiarias");

    let colorCalorias = "";

    porcentaje = caloriasHoy / caloriasDiariasRecomendadasUsuario * 100;

    if(porcentaje > 100) {
        colorCalorias = "#Bf0c11"; //Rojo
    } else if(porcentaje >= 90){
        colorCalorias = "#E2d701";  //Amarillo
    } else {
        colorCalorias = "#11e201"; //Verde
    }

    let texto = "";
    texto += `  <ion-text color="primary">
                    <h1 style="margin-bottom: 10px;">La cantidad total de calorías que has ingerido: ${caloriasTotales}</h1>
                </ion-text>
                <ion-text style="color:${colorCalorias}">
                    <h1 style="margin-bottom: 10px;">La cantidad de calorías ingeridas en el día de hoy según este usuario son: ${caloriasHoy}</h1>
                </ion-text>`;

    return document.querySelector("#caloriasTotales").innerHTML = texto;
}

async function ObtenerCaloriasDiarias(){
    let caloriasDiarias = 0;
    let hoy = new Date().toISOString().slice(0,10);

    let RegistrosUsuario = await ObtenerRegistros();

    for(let i = 0; i<RegistrosUsuario.length;i++ ){
        let unRegistro = RegistrosUsuario[i];
        if(hoy == unRegistro.fecha){
            let caloriasAlimento = await ObtenerCaloriasPorId(unRegistro.idAlimento);
            let cantidadCalorias = unRegistro.cantidad * (caloriasAlimento/100);
            caloriasDiarias += cantidadCalorias;
        }
    }
    return caloriasDiarias;
}

async function CalcularCaloriasTotales(){
    let caloriasTotales = 0;

    let RegistrosUsuario = await ObtenerRegistros();

    for(let i = 0; i<RegistrosUsuario.length; i++){
        let unRegistro = RegistrosUsuario[i];
        let caloriasAlimento = await ObtenerCaloriasPorId(unRegistro.idAlimento);
        let cantidadCalorias = unRegistro.cantidad * (caloriasAlimento/100);
        caloriasTotales += cantidadCalorias;
    }
    return caloriasTotales;
}

async function ObtenerCaloriasPorId(id){
    for(let a of Alimentos) {
        if(a.id == id) {
            return a.calorias;
        }
    }
}

//Mapa
let MiLat = null;
let MiLong = null;

let map; //Variable global para poder agregar marcadores al mapa dinamicamente y también borrar los marcadores


function getLocation(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(mostrarMiUbicacion);
    } else {
        console.log("No soportado");
    }
}

function mostrarMiUbicacion(position) {
    MiLat = position.coords.latitude;
    MiLong = position.coords.longitude;
    setTimeout(function(){CrearMapa()},2000);
}

function CrearMapa() {
    map = L.map('map').setView([MiLat, MiLong], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19,
        attribution: '©️ OpenStreetMap'
    }).addTo(map)

    var marcador = L.marker([MiLat, MiLong]).addTo(map);
    marcador.bindPopup("<strong>Mi ubicación</strong><br><span>Usuario</span>")
}

function ObtenerUsuariosPorPais(){
    LimpiarMapa();
    let numeroIngresado = document.querySelector("#txtCantUsuariosPorPais").value;

    if(numeroIngresado == undefined || isNaN(numeroIngresado)){
        MostrarToast("Ingrese un número valido o no deje el campo vacio", 3000)
    }

    fetch(`${URLBASE}usuariosPorPais.php`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': localStorage.getItem("apiKey"),
            'iduser': localStorage.getItem("idUser")
        }
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data)
        
        PaisesConCantUsuarios = data.paises

        for(let p of PaisesConCantUsuarios){
            let paisesPorUbi = ObtenerPaisesParaUbicacion(p.id)

           
            if(numeroIngresado < p.cantidadDeUsuarios){
                AgregarMarcadorAlMapa(paisesPorUbi.latitude, paisesPorUbi.longitude);
            }
        
        }
    })

}

function ObtenerPaisesParaUbicacion(id) {
    for (let p of PaisesConCoords) {
        if (p.id == id) {
            return {
                latitude: p.latitude,
                longitude: p.longitude 
            };
        }
    }

    // Si no escuentro el país, devuelvo un objeto con valores por defecto 0
    return {
        latitude: 0,
        longitude: 0
    }
}

var greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

function AgregarMarcadorAlMapa(latitude, longitude) {
    if (map) {
        L.marker([latitude, longitude], { icon: greenIcon }).addTo(map);
    } else {
        console.error("El mapa no está inicializado.");
    }
}

function LimpiarMapa() {
    if (map) {
        map.eachLayer(function (layer) {
            // Verificar si la capa es un marcador y eliminarla
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    } else {
        console.error("El mapa no está inicializado. Asegúrate de llamar a CrearMapa() primero.");
    }
}













