/* Test de unicidad e integridad del módulo v21 (banco de 10.000) */
const fs = require('fs');
const path = require('path');

global.NIV = ['Básico', 'Intermedio', 'Avanzado'];
global.shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
global.BANK = [];
global.U = () => usu;
global.save = () => {};
global.window = global;

const ruta = path.join(__dirname, '..', 'public', 'demo', 'Reto-Saber-Demo.html');
const html = fs.readFileSync(ruta, 'utf8');
const cortes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const mod = cortes.map(m => m[1]).find(s => s.includes('v21: banco rotativo'));
if (!mod) { console.error('FAIL: módulo v21 no inyectado en el demo'); process.exit(1); }
eval(mod);

const RS = window.RS10K;
const CU = RS.cuota;
const TOT = Object.values(CU).reduce((a, b) => a + b, 0);
let fails = 0;
const F = m => { fails++; console.error('FAIL:', m); };

if (TOT !== 10000) F('cuota total = ' + TOT);
for (const a of Object.keys(CU)) {
  const fabrica = RS.fabrica[a];
  if (!fabrica) { F('sin fábrica para ' + a); continue; }
  const vistos = new Set();
  let nInteg = 0, nDup = 0;
  for (let i = 0; i < CU[a]; i++) {
    const q = fabrica(i);
    if (!q || !q.id || !q.enunciado || !q.explicacion || !Array.isArray(q.opciones) || q.opciones.length !== 4) { nInteg++; continue; }
    if (new Set(q.opciones.map(o => o.texto)).size !== 4) { nInteg++; continue; }
    if (!q.opciones.some(o => o.id === q.respuesta)) { nInteg++; continue; }
    if (!NIV.includes(q.nivel)) { nInteg++; continue; }
    if (vistos.has(q.enunciado)) nDup++;
    vistos.add(q.enunciado);
  }
  console.log(a + ': espacio ' + CU[a] + ' | integridad: ' + nInteg + ' | duplicados: ' + nDup + ' | únicos: ' + vistos.size);
  if (nInteg) F(a + ': ' + nInteg + ' fallas de integridad');
  if (nDup) F(a + ': ' + nDup + ' duplicados internos');
}

/* rotación completa sin repetición (usuario simulado) */
const usu = {}; // hoisting: U() la usa tras eval
usu.b10k = undefined;
for (const a of Object.keys(CU)) {
  for (const k of Object.keys(usu)) delete usu[k];
  const vistos = new Set(); let rep = 0, quedan = CU[a];
  while (quedan > 0) {
    const k = Math.min(8, quedan); quedan -= k;
    for (const q of RS.tomar(a, null, k)) {
      if (vistos.has(q.enunciado)) rep++;
      vistos.add(q.enunciado);
    }
  }
  console.log(a + ': rotación ' + vistos.size + ' vistas, repetidas ' + rep);
  if (rep) F(a + ': repeticiones dentro del ciclo');
}
/* repetir una lección no repite preguntas */
const primera = RS.tomar('Matemáticas', null, 5).map(q => q.enunciado);
const segunda = RS.tomar('Matemáticas', null, 5).map(q => q.enunciado);
if (primera.filter(x => segunda.includes(x)).length) F('lección repetida trajo repetidos');

if (fails) { console.error('\n✗ ' + fails + ' fallo(s)'); process.exit(1); }
console.log('\n✓ v21 OK: ' + TOT + ' preguntas únicas, rotación sin repetición');
