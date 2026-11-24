/* ---- v43: cuentos dentro del mapa del camino + dan color propio al nodo Cuento ----
   a) El nodo del Cuento vive en la fila de puntos del Camino (clase .dot.cun).
   b) El pintar() de v35 colorea cada .dot por hash de area; aqui el color del
      cuento se fuerza con !important para que siempre sea distinto a los niveles.
   c) Expone window.RS43 con el helper vozPesos (definido en el demo base). */
(function(){
function css(){
 var st=document.createElement('style');st.id='rs43css';
 st.textContent='.dot.cun{background:#d9627c!important;border-color:#b64a64!important;color:#fff!important;box-shadow:0 3px 0 #a03c55!important}.dot.cun svg.rsic{stroke:#fff!important}';
 document.head.appendChild(st);
}
function inyectar(){try{css()}catch(e){}}
inyectar();
var _r43=render;
render=function(){var r=_r43.apply(this,arguments);try{inyectar()}catch(e){}return r};
setTimeout(inyectar,0);
window.RS43={vozPesos:(typeof vozPesos==='function')?vozPesos:null};
})();
