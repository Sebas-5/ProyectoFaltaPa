// Datos del curso y funciones compartidas por index.html y logros.html

// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE FIREBASE
//  (Consola de Firebase → Configuración del proyecto → Tus apps)
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyCNElTEb8nRKmdtihGHzG8JTO0H95adtIg",
  authDomain: "faltas-2dam.firebaseapp.com",
  databaseURL: "https://faltas-2dam-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "faltas-2dam",
  storageBucket: "faltas-2dam.firebasestorage.app",
  messagingSenderId: "861140427939",
  appId: "1:861140427939:web:8c1d4f1eac986618c98b16"
};

export const MODULOS = [
  { id: "SSG",   nombre: "Sistemas de gestión empresarial",                corto: "SSG", max: 16, horas: 96 },
  { id: "PGV",   nombre: "Programación de servicios y procesos",           corto: "PGV", max: 16, horas: 96 },
  { id: "FOL",   nombre: "Itinerario personal para la empleabilidad II",   corto: "IPW", max: 16, horas: 96 },
  { id: "PROY",  nombre: "Proyecto intermodular",                          corto: "PRY", max: 13, horas: 64 },
  { id: "SOST",  nombre: "Sostenibilidad aplicada al sistema productivo",  corto: "SOS", max: 6,  horas: 32 },
  { id: "AD",    nombre: "Acceso a datos",                                 corto: "AD",  max: 29, horas: 147 },
  { id: "DI",    nombre: "Desarrollo de interfaces",                       corto: "DI",  max: 27, horas: 138 },
  { id: "PGL",   nombre: "Programación multimedia y dispositivos móviles", corto: "PGL", max: 18, horas: 110 },
  { id: "CIBER", nombre: "Ciberseguridad",                                 corto: "CIB", max: 16, horas: 96 }
];
// Ids internos de cada persona. En la base de datos:
//   faltas/{persona}/{modulo}, retrasos/{persona}/{modulo}, perfiles/{persona}
//   usuarios/{uid} → { persona }   duenos/{persona} → { uid, codigo }
export const PERSONAS = ["Sebastian", "Matías", "Ian", "Joaquín"];
// ── Calendario y horario del curso (para la proyección) ──────
// Fechas en formato AAAA-MM-DD. Si cambian, basta con editarlas aquí.
export const CALENDARIO = {
  inicio: "2026-09-17",          // primer día de clase (jueves)
  fin: "2027-02-20",             // último día de clase
  festivos: ["2026-10-12", "2026-11-02", "2026-12-07", "2026-12-08", "2027-02-02", "2027-02-09"],
  vacaciones: [["2026-12-22", "2027-01-07"]]   // Navidad (ambos días incluidos)
};

// Horario semanal: cada clase es [inicio, fin, módulo], en orden, de lunes a viernes.
// Códigos del horario del centro: IPW = FOL, AED = AD, DAD = DI, PL9 = PROY,
// SOJ = SOST, A10 = CIBER (módulo optativo de diseño propio).
export const CLASES = [
  [["14:15", "15:10", "FOL"], ["15:10", "16:05", "AD"], ["16:05", "17:00", "AD"],
   ["17:20", "18:15", "PGL"], ["18:15", "19:10", "PGL"], ["19:10", "20:00", "DI"]],      // lunes
  [["14:30", "15:20", "DI"], ["15:20", "16:10", "DI"], ["16:10", "17:00", "AD"],
   ["17:30", "18:20", "AD"], ["18:20", "19:10", "CIBER"], ["19:10", "20:00", "PROY"]],   // martes
  [["14:15", "15:10", "FOL"], ["15:10", "16:05", "FOL"], ["16:05", "17:00", "SSG"],
   ["17:20", "18:15", "PGV"], ["18:15", "19:10", "PROY"], ["19:10", "20:00", "DI"]],     // miércoles
  [["14:15", "15:10", "DI"], ["15:10", "16:05", "SSG"], ["16:05", "17:00", "PGV"],
   ["17:20", "18:15", "PGV"], ["18:15", "19:10", "AD"], ["19:10", "20:00", "AD"]],       // jueves
  [["14:15", "15:10", "PGL"], ["15:10", "16:05", "PGL"], ["16:05", "17:00", "CIBER"],
   ["17:20", "18:15", "CIBER"], ["18:15", "19:10", "SOST"], ["19:10", "20:00", "SSG"]]   // viernes
];

// Sesiones de cada módulo por día de la semana (sale de CLASES): HORARIO.AD = [2, 2, 0, 2, 0]
export const HORARIO = Object.fromEntries(MODULOS.map(m => [m.id, CLASES.map(dia => dia.filter(c => c[2] === m.id).length)]));

// Lista de todos los días lectivos (lunes a viernes que no son festivo ni vacaciones)
// con el día de la semana (0 = lunes … 4 = viernes)
export const LECTIVOS = (() => {
  const dias = [];
  const libre = f => CALENDARIO.festivos.includes(f) || CALENDARIO.vacaciones.some(([a, b]) => f >= a && f <= b);
  // Se trabaja en UTC para que el cambio de hora no descuadre los días
  for (let d = new Date(CALENDARIO.inicio + "T00:00:00Z"); ; d.setUTCDate(d.getUTCDate() + 1)) {
    const fecha = d.toISOString().slice(0, 10);
    if (fecha > CALENDARIO.fin) break;
    const dia = d.getUTCDay();
    if (dia !== 0 && dia !== 6 && !libre(fecha)) dias.push({ fecha, dia: dia - 1 });
  }
  return dias;
})();

export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fechaUTC(iso) { return new Date(iso + "T00:00:00Z"); }

export function vacio() {
  const d = {};
  PERSONAS.forEach(p => { d[p] = {}; MODULOS.forEach(m => d[p][m.id] = 0); });
  return d;
}
// Convierte lo que venga (BD o archivo) al formato completo
export function normalizar(g) {
  const base = vacio();
  if (g) PERSONAS.forEach(p => MODULOS.forEach(m => {
    const v = g[p] && g[p][m.id];
    if (Number.isFinite(v) && v >= 0) base[p][m.id] = v;
  }));
  return base;
}

// Los nombres los escribe cada usuario: hay que escaparlos antes de meterlos en innerHTML
export function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Fecha que se guarda al apuntar una falta: hoy, o el último día de clase si hoy no hay
// clase (así una falta apuntada en fin de semana cuenta para el viernes)
export function fechaFalta() {
  const hoy = hoyISO();
  if (hoy < LECTIVOS[0].fecha || LECTIVOS.some(d => d.fecha === hoy)) return hoy;
  return LECTIVOS.filter(d => d.fecha <= hoy).at(-1).fecha;
}

// Entradas del registro de una persona (registro/{persona}) en un módulo, de la más reciente a la más antigua
export function entradas(registroP, mod) {
  return Object.entries(registroP || {})
    .filter(([, e]) => e && e.modulo === mod)
    .sort(([ka, a], [kb, b]) => b.fecha.localeCompare(a.fecha) || kb.localeCompare(ka));
}

// Lista de faltas con fecha de una persona, siempre coherente con los contadores:
// si alguien todavía no ha migrado sus faltas antiguas, las que faltan cuentan como de hoy
export function eventos(faltasP, registroP) {
  const lista = [];
  MODULOS.forEach(m => {
    const total = faltasP[m.id];
    const es = entradas(registroP, m.id).reverse().slice(0, total);   // las más antiguas primero
    es.forEach(([, e]) => lista.push({ modulo: m.id, fecha: e.fecha }));
    for (let i = es.length; i < total; i++) lista.push({ modulo: m.id, fecha: fechaFalta() });
  });
  return lista;
}

// Copia local de los últimos datos (la guarda index.html) para abrir sin conexión:
// { uid, persona, datos: { faltas, retrasos }, registro, perfiles }
export const COPIA = "faltas2dam_copia";
export function leerCopia(uid) {
  try {
    const c = JSON.parse(localStorage.getItem(COPIA));
    return c && c.uid === uid && PERSONAS.includes(c.persona) ? c : null;
  } catch (e) { return null; }
}
