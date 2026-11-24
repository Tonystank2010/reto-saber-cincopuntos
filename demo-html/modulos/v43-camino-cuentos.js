/* ---- v43: cuentos dentro del mapa del camino + contraste e identidad de ventanas ----
   a) El nodo del Cuento vive en la fila de puntos del Camino (clase .dot.cun).
   b) El pintar() de v35 colorea cada .dot por hash de area; aqui el color del
      cuento se fuerza con !important para que siempre sea distinto a los niveles.
   c) La ventana emergente de v42 (Vidas/Racha/Tienda) tenia fondo transparente
      (var(--cv) nunca definida) y se confundia con la app: v43 le da franja
      superior de color propia por tipo, icono de titulo coloreado, backdrop mas
      oscuro y filas de tienda diferenciadas.
   d) El texto sobre acento se definió en el base con --ac-tx (claro->blanco,
      oscuro-> navy) para que blanco no quede sobre acentos claros del tema oscuro.
   e) Expone window.RS43 con el helper vozPesos (definido en el demo base). */
(function(){
function css(){
 var st=document.createElement('style');st.id='rs43css';
 st.textContent=[
  '.dot.cun{background:#c74f6c!important;border-color:#a83857!important;color:#fff!important;box-shadow:0 3px 0 #93304b!important}',
  '.dot.cun svg.rsic{stroke:#fff!important}',
  '.rs42bk{background:rgba(2,6,23,.62)}',
  '.rs42m{border:2px solid var(--br);box-shadow:0 24px 70px rgba(2,6,23,.5)}',
  '.rs42m[aria-label="Ventana de vidas"]{border-top:5px solid #e11d48}',
  '.rs42m[aria-label="Ventana de vidas"] h3 svg.rsic{color:#e11d48}',
  '.rs42m[aria-label="Ventana de racha"]{border-top:5px solid #d97706}',
  '.rs42m[aria-label="Ventana de racha"] h3 svg.rsic{color:#d97706}',
  '.rs42m[aria-label="Ventana de tienda"]{border-top:5px solid var(--ac)}',
  '.rs42m[aria-label="Ventana de tienda"] h3 svg.rsic{color:var(--ac)}',
  '.rs42it{background:var(--bg)}'
 ].join('');
 document.head.appendChild(st);
}
function inyectar(){try{css()}catch(e){}}
inyectar();
var _r43=render;
render=function(){var r=_r43.apply(this,arguments);try{inyectar()}catch(e){}return r};
setTimeout(inyectar,0);
window.RS43={vozPesos:(typeof vozPesos==='function')?vozPesos:null};
})();
