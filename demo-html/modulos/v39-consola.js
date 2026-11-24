/* ---- v39: consola de estudio (barra lateral con tiles de icono, marca propia y banner de seccion) ----
   Inspiracion general del estilo ed-tech de consola, con identidad 100% propia:
   - glifo geometrico de cinco puntos (marca) y wordmark propio; ni logos ni mascotas de terceros.
   - iconos del catalogo v35 en tiles redondeados; etiquetas propias de cada seccion.
   - banner de seccion con el acento de la paleta elegida por el usuario (var(--ac)).
   - escritorio: barra lateral ancha (icono + etiqueta en fila); movil conserva la barra inferior.
   Inyeccion idempotente tras cada render + observador ligero (mismo patron v35). */
(function(){
'use strict';

/* ---------- 1) textos propios por seccion ---------- */
var SUBT={
 camino:'Tu ruta de practica diaria',
 cuentos:'Lectura critica paso a paso',
 repaso:'Practica tus errores pasada',
 carreras:'Evalua tu nivel en cada linea',
 liga:'Tu division de esta semana',
 perfil:'Tu progreso y ajustes'
};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- 2) glifo de marca: pentagono de cinco puntos ---------- */
function glifo(){
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true" focusable="false">'
 +'<path d="M12 4.6 19.5 10.2l-2.8 8.8H7.3L4.5 10.2z" opacity=".55"/>'
 +'<circle cx="12" cy="4.6" r="2" fill="currentColor" stroke="none"/>'
 +'<circle cx="19.5" cy="10.2" r="2" fill="currentColor" stroke="none"/>'
 +'<circle cx="16.7" cy="19" r="2" fill="currentColor" stroke="none"/>'
 +'<circle cx="7.3" cy="19" r="2" fill="currentColor" stroke="none"/>'
 +'<circle cx="4.5" cy="10.2" r="2" fill="currentColor" stroke="none"/>'
 +'</svg>';
}

/* ---------- 3) CSS ---------- */
function css(){
 if(document.getElementById('rs39css'))return;
 var s=document.createElement('style');s.id='rs39css';
 s.textContent=[
  /* banner de seccion */
  '.rs39ban{display:flex;flex-direction:column;gap:2px;background:var(--ac);color:#fff;',
   'border-radius:16px;padding:14px 18px;margin:0 0 14px;',
   'box-shadow:0 6px 16px rgba(15,23,42,.16)}',
  '.rs39ban b{font-size:15px;letter-spacing:.16em;font-weight:800;text-transform:uppercase}',
  '.rs39ban span{font-size:13.5px;opacity:.92}',
  /* marca propia dentro de la barra lateral */
  '.rs39brand{display:flex;align-items:center;gap:10px;padding:2px 8px 12px;margin-bottom:8px;',
   'border-bottom:1px solid var(--br)}',
  '.rs39brand svg{width:34px;height:34px;color:var(--ac);flex:0 0 auto}',
  '.rs39brand .rs39w{font-size:12.5px;font-weight:800;letter-spacing:.16em;line-height:1.35;color:var(--tx)}',
  /* escritorio: barra lateral ancha con filas icono+etiqueta */
  '@media(min-width:768px){',
  ' nav{width:216px!important;padding:14px 12px 16px!important;justify-content:flex-start!important}',
  ' .app{padding-left:216px!important}',
  ' nav button{flex-direction:row!important;justify-content:flex-start!important;gap:12px!important;',
   'padding:9px 10px!important;border-radius:12px!important;font-size:13.5px!important;color:var(--mu)}',
  ' nav button:hover{background:rgba(127,127,127,.07)}',
  ' nav button span{width:38px!important;height:38px!important;border-radius:12px!important;',
   'display:grid!important;place-items:center!important;background:rgba(127,127,127,.10);margin:0!important;font-size:0}',
  ' nav button span svg{width:21px!important;height:21px!important}',
  ' nav button.on{color:var(--tx)}',
  ' nav button.on span{background:var(--ac)!important;color:#fff!important}',
  '}',
  /* movil: la marca no aparece en la barra inferior; tiles compactos iguales a antes */
  '@media(max-width:767px){.rs39brand{display:none}}',
  '@media(prefers-reduced-motion:no-preference){',
  ' .rs39ban{transition:transform .18s ease}',
  '}'
 ].join('\n');
 document.head.appendChild(s);
}

/* ---------- 4) inyeccion idempotente ---------- */
function inyectar(){
 try{
  css();
  /* marca solo en escritorio (en movil la barra es inferior y compacta) */
  var nav=document.querySelector('#app nav')||document.querySelector('nav');
  if(nav){
   if(!nav.querySelector('.rs39brand')){
    var b=document.createElement('div');b.className='rs39brand';b.setAttribute('data-v39','1');
    b.innerHTML=glifo()+'<span class="rs39w">CINCO<br>PUNTOS</span>';
    nav.insertBefore(b,nav.firstChild);
   }
  }
  /* banner de seccion solo en vistas de app (con .top directo), no en leccion/evaluacion */
  var main=document.querySelector('main');
  if(!main)return;
  var top=main.querySelector(':scope>.top');
  if(!top)return;
  var ya=main.querySelector('.rs39ban');
  var ab=nav&&nav.querySelector('button.on[data-a="tab"]');
  var k=ab?ab.dataset.v:null;
  if(!k||!SUBT[k])return;
  if(ya&&ya.dataset.k===k)return;
  if(ya&&ya.remove)ya.remove();
  var ban=document.createElement('div');ban.className='rs39ban';ban.setAttribute('data-v39','1');ban.dataset.k=k;
  ban.innerHTML='<b>'+esc(k)+'</b><span>'+esc(SUBT[k])+'</span>';
  top.insertAdjacentElement('afterend',ban);
 }catch(e){}
}

/* ---------- 5) cableado: wrapper de render + observador ---------- */
try{
 var _r39=render;
 render=function(){var r=_r39.apply(this,arguments);try{inyectar()}catch(e){}return r};
}catch(e){}
try{setTimeout(inyectar,0)}catch(e){}
try{
 var _t39=0;
 var mo39=new MutationObserver(function(){
  if(_t39)return;
  _t39=setTimeout(function(){_t39=0;try{inyectar()}catch(e){}},60);
 });
 mo39.observe(document.documentElement,{childList:true,subtree:true});
}catch(e){}

/* API para pruebas e integracion */
try{window.RS39={inyectar:inyectar,SUBT:SUBT,glifo:glifo}}catch(e){}

})();
