const btnIniciar = document.getElementById('btnIniciar');
const btnDetener = document.getElementById('btnDetener');
const btnLimpiar = document.getElementById('btnLimpiar');
const estado = document.getElementById('estado');
const listaHistorial = document.getElementById('listaHistorial');

let watchId = null;
let historialPosiciones = [];
let marcadorActual = null;
let linea = null;

const map = L.map('map').setView([-24.7829, -65.4232], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

linea = L.polyline([], { color: 'red', weight: 4 }).addTo(map);

btnIniciar.addEventListener('click', iniciarSeguimiento);
btnDetener.addEventListener('click', detenerSeguimiento);
btnLimpiar.addEventListener('click', limpiarHistorial);

btnDetener.disabled = true;

function iniciarSeguimiento() {
  if (!navigator.geolocation) {
    estado.textContent = 'Tu navegador no soporta geolocalización.';
    return;
  }

  estado.textContent = 'Obteniendo ubicación...';
  btnIniciar.disabled = true;
  btnDetener.disabled = false;

  const opciones = {
    enableHighAccuracy: false,
    maximumAge: 10000,
    timeout: 20000
  };

  // Primero se pide una posición rápida y luego se inicia el seguimiento continuo
  navigator.geolocation.getCurrentPosition(onNuevaPosicion, onErrorGeolocalizacion, opciones);

  watchId = navigator.geolocation.watchPosition(
    onNuevaPosicion,
    onErrorGeolocalizacion,
    opciones
  );
}

function detenerSeguimiento() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  btnIniciar.disabled = false;
  btnDetener.disabled = true;
  estado.textContent = 'Seguimiento detenido.';
}

function limpiarHistorial() {
  historialPosiciones = [];
  listaHistorial.innerHTML = '';
  linea.setLatLngs([]);

  if (marcadorActual) {
    map.removeLayer(marcadorActual);
    marcadorActual = null;
  }

  estado.textContent = 'Historial limpiado.';
}

function onNuevaPosicion(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  historialPosiciones.push({ lat, lng });

  if (marcadorActual) {
    marcadorActual.setLatLng([lat, lng]);
  } else {
    marcadorActual = L.marker([lat, lng]).addTo(map);
  }

  linea.addLatLng([lat, lng]);
  map.setView([lat, lng], map.getZoom());

  agregarAlHistorial(lat, lng);

  estado.textContent = `Última posición: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function onErrorGeolocalizacion(error) {
  const mensajes = {
    1: 'Permiso de ubicación denegado por el usuario.',
    2: 'Ubicación no disponible.',
    3: 'Se agotó el tiempo de espera. Verificá que la ubicación esté activada en tu equipo y volvé a intentar.'
  };
  estado.textContent = mensajes[error.code] || 'Error al obtener la ubicación.';
}

function agregarAlHistorial(lat, lng) {
  const numero = historialPosiciones.length;
  const item = document.createElement('li');
  item.textContent = `#${numero} → Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  listaHistorial.appendChild(item);
  listaHistorial.scrollTop = listaHistorial.scrollHeight;
}
