// Logros: se calculan siempre a partir de las faltas (con fecha), los retrasos y el
// horario; no se guardan en ningún sitio. Los usan index.html (insignias del ranking y
// aviso al conseguir uno) y logros.html (la lista completa).

import { MODULOS, PERSONAS, HORARIO, LECTIVOS, hoyISO, fechaUTC, eventos } from "./curso.js";

export const GRUPOS_LOGROS = [
  ["asistencia", "😇 Asistencia"], ["goat", "🐐 Los GOAT"], ["faltas", "😈 Faltas"], ["retrasos", "🐢 Retrasos"], ["ranking", "🏆 Grupo"]
];
const lunesDe = iso => { const d = fechaUTC(iso); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
// La racha más larga de días de la lista que no cumplen "corta"
function mejorRacha(dias, corta) {
  let n = 0, max = 0;
  dias.forEach(d => { n = corta(d) ? 0 : n + 1; max = Math.max(max, n); });
  return max;
}

// datos = { faltas, retrasos } con datos.faltas[persona][modulo]; registro = registro/{persona}/{id}
export function logros(p, datos, registro) {
  const hoy = hoyISO(), ev = eventos(datos.faltas[p], registro[p] || {}), f = id => datos.faltas[p][id];
  const retrasosDe = x => MODULOS.reduce((a, m) => a + datos.retrasos[x][m.id], 0);
  const totalDe = x => MODULOS.reduce((a, m) => a + datos.faltas[x][m.id], 0);
  const fechas = new Set(ev.map(e => e.fecha));
  const pasados = LECTIVOS.filter(d => d.fecha < hoy);   // días de clase ya terminados
  const faltasEn = id => new Set(ev.filter(e => e.modulo === id).map(e => e.fecha));
  const lista = [];
  // n / meta = progreso; mientras = se pierde si deja de cumplirse
  const add = (grupo, id, icono, titulo, desc, n, meta, mientras = false) =>
    lista.push({ grupo, id, icono, titulo, desc, n: Math.min(n, meta), meta, ok: n >= meta, mientras });

  // 😇 Asistencia
  add("asistencia", "dia_limpio", "🌱", "Primer día limpio", "Un día de clase entero sin faltar", pasados.some(d => !fechas.has(d.fecha)) ? 1 : 0, 1);
  const semanas = new Map();
  LECTIVOS.forEach(d => { const k = lunesDe(d.fecha); semanas.set(k, [...(semanas.get(k) || []), d.fecha]); });
  let semana = 0;
  semanas.forEach(dias => {
    const hechos = dias.filter(x => x < hoy);
    if (hechos.some(x => fechas.has(x))) return;
    semana = Math.max(semana, hechos.length === dias.length && dias.length >= 3 ? 5 : hechos.length);
  });
  add("asistencia", "semana", "📅", "Semana perfecta", "Una semana de clase entera sin ninguna falta", semana, 5);
  add("asistencia", "racha10", "🔥", "Racha de 2 semanas", "10 días de clase seguidos sin faltar", mejorRacha(pasados, d => fechas.has(d.fecha)), 10);
  const enRiesgo = MODULOS.some(m => f(m.id) / m.max >= .75);
  add("asistencia", "equilibrado", "⚖️", "Equilibrado", "Pasado el primer mes, ningún módulo en naranja ni en rojo", enRiesgo ? 0 : pasados.length, 20, true);

  // 🐐 El GOAT de cada asignatura: 10 clases seguidas de ese módulo sin faltar
  MODULOS.forEach(m => {
    const conFalta = faltasEn(m.id);
    const dias = pasados.filter(d => HORARIO[m.id][d.dia] > 0);
    add("goat", "goat_" + m.id, "🐐", `El GOAT de ${m.nombre}`, `10 clases seguidas de ${m.nombre} sin faltar`, mejorRacha(dias, d => conFalta.has(d.fecha)), 10);
  });

  // 😈 Faltas
  const porSemana = {}, porDia = {};
  ev.forEach(e => {
    porSemana[lunesDe(e.fecha)] = (porSemana[lunesDe(e.fecha)] || 0) + 1;
    (porDia[e.fecha] ||= new Set()).add(e.modulo);
  });
  add("faltas", "fantasma", "👻", "Fantasma", "5 faltas en una misma semana", Math.max(0, ...Object.values(porSemana)), 5);
  add("faltas", "pacto", "😈", "Pacto con el diablo", "5 faltas en Desarrollo de interfaces", f("DI"), 5);
  const cerca = MODULOS.filter(m => f(m.id) <= m.max).sort((a, b) => f(b.id) / b.max - f(a.id) / a.max)[0];
  add("faltas", "limite", "🎲", "Al límite", "Llegar justo al límite de faltas de un módulo sin pasarse", cerca ? f(cerca.id) : 0, cerca ? cerca.max : 1, true);
  const peor = MODULOS.reduce((a, m) => f(m.id) / m.max > f(a.id) / a.max ? m : a);
  add("faltas", "rip", "💀", "RIP evaluación continua", "Pasarse del límite de faltas en un módulo", f(peor.id), peor.max + 1);
  add("faltas", "huracan", "🌪️", "Huracán", "Faltar a 3 módulos distintos el mismo día", Math.max(0, ...Object.values(porDia).map(s => s.size)), 3);
  const diasDe = n => Object.keys(porDia).filter(x => fechaUTC(x).getUTCDay() === n).length;
  add("faltas", "lunes", "📆", "Lunes no", "Faltar 3 lunes distintos", diasDe(1), 3);
  add("faltas", "viernes", "🍻", "Viernes de fiesta", "Faltar 3 viernes distintos", diasDe(5), 3);
  add("faltas", "coleccionista", "🧮", "Coleccionista", "Al menos una falta en todos los módulos", MODULOS.filter(m => f(m.id) > 0).length, MODULOS.length);
  let reincide = 0;
  MODULOS.forEach(m => {
    const conFalta = faltasEn(m.id);
    const dias = LECTIVOS.filter(d => d.fecha <= hoy && HORARIO[m.id][d.dia] > 0);
    reincide = Math.max(reincide, mejorRacha(dias, d => !conFalta.has(d.fecha)));
  });
  add("faltas", "reincidente", "🔁", "Reincidente", "Faltar a un mismo módulo 3 clases seguidas", reincide, 3);

  // 🐢 Retrasos
  const ret = retrasosDe(p);
  add("retrasos", "retraso1", "🐌", "Primer retraso", "Llegar tarde por primera vez", ret, 1);
  add("retrasos", "tortuga", "🐢", "Tortuga", "5 retrasos en total", ret, 5);
  add("retrasos", "despertador", "⏰", "Despertador roto", "10 retrasos en total", ret, 10);
  const otros = Math.max(...PERSONAS.filter(x => x !== p).map(retrasosDe));
  add("retrasos", "rey_retrasos", "🕰️", "Rey de los retrasos", "Ser quien más retrasos tiene del grupo, sin empate", ret, otros + 1, true);

  // 🏆 Grupo
  const total = totalDe(p);
  add("ranking", "empate", "🤝", "Empate técnico", "Tener las mismas faltas que algún compañero", total > 0 && PERSONAS.some(x => x !== p && totalDe(x) === total) ? 1 : 0, 1, true);
  return lista;
}
