/* ---- v35: iconos SVG propios + colores por area + micro-interaccion ----
   a) Reemplaza los EMOJIS de la interfaz por iconos SVG unicos (trazo redondeado,
      currentColor) — inyectado post-render sobre el DOM: no toca las plantillas
      del juego y sobrevive a los re-renders.
   b) Pinta los NODOS del Camino (data-v="area|niv|i") y los CHIPS de area con un
      color fijo por area; areas desconocidas (carreras Saber Pro) color estable.
   c) Micro-interacciones (escala al hover, latido del corazon, flicker de la
      llama) respeta prefers-reduced-motion. */
(function(){
'use strict';

/* ---------- 1) sprite de iconos (24x24) ---------- */
const P={
 camino:'<path d="M4 19c0-4 3.5-2.5 5.5-6S7 7.5 11 5c2.5-1.3 5 0 6 1"/><circle cx="4.5" cy="19" r="1.6"/><circle cx="17.5" cy="5.5" r="2"/><path d="M17.5 7.5V13l3.5 2"/>',
 cuentos:'<path d="M12 5.5C10 4 7.5 3.5 4.5 3.5V19c3 0 5.5.5 7.5 2 2-1.5 4.5-2 7.5-2V3.5c-3 0-5.5.5-7.5 2z"/><path d="M12 5.5v15.5"/>',
 repaso:'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5V8h-4.5"/>',
 carreras:'<path d="M2 9.5 12 5l10 4.5L12 14z"/><path d="M6.5 11.5v4c0 1.6 2.7 3 5.5 3s5.5-1.4 5.5-3v-4"/><path d="M20 10.5v4"/>',
 liga:'<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5.5a2.5 2.5 0 0 0 0 5H8M16 5h2.5a2.5 2.5 0 0 1 0 5H16"/><path d="M12 12v4M8.5 20h7M10 16h4"/>',
 perfil:'<circle cx="12" cy="8.2" r="3.4"/><path d="M5 20c1.3-4.4 12.7-4.4 14 0"/>',
 corazon:'<path d="M12 20S5.2 15.6 3 11.4A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 9 4.8C18.8 15.6 12 20 12 20z"/>',
 fuego:'<path d="M12 3.5c1.2 2.8 4.8 4.3 4.8 8.3a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.3 1.9-4.4.1 1.5.9 2.4 2 2.6-.9-2.7-.1-4.9.9-6.5z"/>',
 estrella:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
 estrella0:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
 diana:'<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r=".8"/>',
 pin:'<path d="M12 21s-6.5-6.6-6.5-11a6.5 6.5 0 0 1 13 0c0 4.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/>',
 plan:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9.5 4.5h5v2h-5zM9 11h6M9 15h4"/>',
 cuaderno:'<rect x="6" y="3.5" width="13" height="17" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h5M10 12h5"/>',
 idea:'<path d="M12 3.5a5.5 5.5 0 0 1 3 10.1c-.8.6-1 1.4-1 2.4h-4c0-1-.2-1.8-1-2.4a5.5 5.5 0 0 1 3-10.1z"/><path d="M10 19h4M10.8 21h2.4"/>',
 candado:'<rect x="6" y="10.5" width="12" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
 altavoz:'<path d="M4 10v4h3l4.5 3.5v-11L7 10z"/><path d="M15 9.5a3.4 3.4 0 0 1 0 5M17.5 7.5a6.4 6.4 0 0 1 0 9"/>',
 silencio:'<path d="M4 10v4h3l4.5 3.5v-11L7 10z"/><path d="M15.5 10l4 4M19.5 10l-4 4"/>',
 nube:'<path d="M7 18a4 4 0 0 1-.4-8A5.6 5.6 0 0 1 17.4 11 3.5 3.5 0 0 1 17 18z"/>',
 nuarriba:'<path d="M7 15a4 4 0 0 1-.4-8A5.6 5.6 0 0 1 17.4 8 3.5 3.5 0 0 1 17 15z"/><path d="M12 21v-6M9.6 17.4 12 15l2.4 2.4"/>',
 nudabajo:'<path d="M7 15a4 4 0 0 1-.4-8A5.6 5.6 0 0 1 17.4 8 3.5 3.5 0 0 1 17 15z"/><path d="M12 15v6l-2.4-2.4M12 21l2.4-2.4"/>',
 calendario:'<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
 alerta:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2"/><circle cx="12" cy="16.8" r=".8"/>',
 check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.5 2.5 4.9-5"/>',
 corazonroto:'<path d="M12 20S5.2 15.6 3 11.4A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 9 4.8C18.8 15.6 12 20 12 20z"/><path d="M9.5 5.5 12 9l-2.5 3 3 3"/>',
 duelo:'<path d="M4.5 4.5 12 12M12 12l7.5-7.5M12 12l-6 6M12 12l6 6M4.5 19.5 7 17M19.5 19.5 17 17"/>',
 medalla:'<circle cx="12" cy="15" r="4.5"/><path d="M8.5 11.5 6 3.5h4l2 5 2-5h4l-2.5 8"/>',
 gema:'<path d="M7 4h10l3 5-8 11-8-11z"/><path d="M4 9h16M12 20 8.5 9l3.5-5 3.5 5z"/>',
 movil:'<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M10.5 17.5h3"/>',
 ojo:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
 ocox:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><path d="M9 9.5l6 5M15 9.5l-6 5"/>',
 reloj:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9.8V13l2.6 2"/><path d="M9.5 3.5h5"/>',
 relojarena:'<path d="M7 3.5h10M7 20.5h10"/><path d="M8.3 3.5v2.8L12 10.6l3.7-4.3V3.5M8.3 20.5v-2.8l3.7-4.3 3.7 4.3v2.8"/>',
 pausa:'<path d="M9.5 6v12M14.5 6v12"/>',
 bandera:'<path d="M6.5 21V3.5"/><path d="M6.5 4.5c3.2-1.8 5.8 1.5 11-.2V13c-5.2 1.7-7.8-1.6-11 .2"/>',
 cerrar:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
 casilla:'<rect x="4.5" y="4.5" width="15" height="15" rx="3.5"/>',
 trebol:'<circle cx="12" cy="7.2" r="3.3"/><circle cx="7.2" cy="13" r="3.3"/><circle cx="16.8" cy="13" r="3.3"/><path d="M12 11.5V20"/>',
 dado:'<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.7" cy="8.7" r="1.1"/><circle cx="15.3" cy="8.7" r="1.1"/><circle cx="8.7" cy="15.3" r="1.1"/><circle cx="15.3" cy="15.3" r="1.1"/><circle cx="12" cy="12" r="1.1"/>',
 dedo:'<path d="M9 11.5V6a1.7 1.7 0 0 1 3.4 0v5"/><path d="M12.4 11.2l4.1.8a2 2 0 0 1 1.6 2.3l-.5 3.1a3 3 0 0 1-3 2.6h-3.3a3 3 0 0 1-2.5-1.4l-2.6-4 1.3-1.5c.8-.9 2.3-1 3.1-.1"/>',
 disquete:'<path d="M4.5 4.5h11.6l3.4 3.4v11.6H4.5z"/><path d="M8 4.5V10h7V4.5"/><rect x="8" y="13.5" width="8" height="6"/>',
 grafica:'<path d="M4.5 4v15.5H20"/><path d="M8.5 16v-4.5M12.5 16V7.5M16.5 16v-6"/>',
 llave:'<circle cx="8.5" cy="12" r="3.7"/><path d="M12.2 12H20M17.2 12v3.2M20 12v2.4"/>',
 impresora:'<path d="M7.5 8V3.5h9V8"/><rect x="4" y="8" width="16" height="8.5" rx="2"/><path d="M7.5 14h9v6.5h-9z"/><path d="M10 17.5h4"/>',
 escudo:'<path d="M12 3.5 5.2 6.3v5.2c0 4.4 2.9 8 6.8 9.5 3.9-1.5 6.8-5.1 6.8-9.5V6.3z"/><path d="M9.3 12.2l2 2 3.4-4"/>',
 brujula:'<circle cx="12" cy="12" r="8.5"/><path d="M15 9l-1.9 4.6L8.5 15.5l1.9-4.6z"/>',
 reproducir:'<path d="M9 6.2v11.6L18.6 12z"/>',
 'flecha-der':'<path d="M4.5 12h14"/><path d="M13 6.5l5.5 5.5-5.5 5.5"/>',
 'flecha-izq':'<path d="M19.5 12h-14"/><path d="M11 6.5 5.5 12l5.5 5.5"/>',
 moneda:'<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.6"/>',
 tienda:'<path d="M4.5 9.5h15l-1.1 9.7a1.9 1.9 0 0 1-1.9 1.7H7.5a1.9 1.9 0 0 1-1.9-1.7L4.5 9.5z"/><path d="M3.8 9.5l1.4-4.3a1.6 1.6 0 0 1 1.5-1.1h12.6a1.6 1.6 0 0 1 1.5 1.1l1.4 4.3"/><path d="M9.5 9.5v-1a2.5 2.5 0 0 1 5 0v1"/>',
 forma:'<rect x="5" y="5" width="14" height="14" rx="5"/>',
 paleta:'<path d="M12 3.5a8.5 8.5 0 1 0 .6 17c1.7 0 2.3-1 1.6-2.3-.7-1.5.3-2.7 2-2.7h1.6A3.3 3.3 0 0 0 20.5 12C20 7.2 16.6 3.5 12 3.5z"/><circle cx="8.3" cy="9.3" r="1.2"/><circle cx="13" cy="7.2" r="1.2"/><circle cx="16.6" cy="10.6" r="1.2"/>',
 boca:'<path d="M5.5 10.5q6.5 7.5 13 0"/><circle cx="5.5" cy="10.5" r="1"/><circle cx="18.5" cy="10.5" r="1"/>',
 gorra:'<path d="M6.5 15a5.5 5.5 0 0 1 11 0"/><path d="M3.5 15h17"/><path d="M12 6.8V5.2"/><circle cx="12" cy="4.8" r=".8"/>',
 vueltiao:'<path d="M3.5 16.5h17"/><path d="M7 16.5q0-7 5-7t5 7"/><path d="M7.8 13.2q4.2-2.6 8.4 0"/><path d="M7 16.5q5-3.4 10 0"/>',
 bufanda:'<path d="M6 8.5h12M6 8.5v4.5h12V8.5"/><path d="M9 13v7M11.5 13v7M14 13v7"/><path d="M6 8.5q6-4 12 0"/>'
};
const LLENOS=',corazon,fuego,estrella,gema,medalla,corazonroto,estrella0,reproducir,';

function ico(n){
  const llen=LLENOS.indexOf(','+n+',')>=0;
  const cuerpo=P[n]||P.estrella0;
  return '<svg class="rsic'+(llen?' rsf':'')+'" data-i="'+n+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+cuerpo+'</svg>';
}

/* ---------- 2) mapa emoji -> icono ---------- */
const MAP={
  '🗺':'camino','📖':'cuentos','🔁':'repaso','🎓':'carreras','🏆':'liga','👤':'perfil',
  '❤':'corazon','💔':'corazonroto','🔥':'fuego','★':'estrella','☆':'estrella0','⭐':'estrella',
  '🎯':'diana','📌':'pin','📍':'pin','\uD83C\uDCCD':'pin','📋':'plan','📓':'cuaderno','📘':'cuaderno','📗':'cuaderno',
  '💡':'idea','🔒':'candado','🔓':'candado','🔊':'altavoz','🔇':'silencio','☁':'nube',
  '📅':'calendario','🗓':'calendario','⚠':'alerta','✅':'check','⚔':'duelo','🏅':'medalla',
  '💎':'gema','📱':'movil','🌸':'cuentos','👁':'ojo','🗨':'duelo',
  '\u23F1':'reloj','\u23F3':'relojarena','\u23F8':'pausa','\u2691':'bandera',
  '\uD83E\uDE99':'diana','\u2192':'flecha-der','\u2190':'flecha-izq','\uD83D\uDCD2':'cuaderno','\uD83D\uDD58':'reloj',
  '\uD83D\uDED2':'tienda','\uD83C\uDFEA':'tienda',
  '\u2713':'check','\u2714':'check','\u2715':'cerrar','\u2716':'cerrar','\u25B6':'reproducir','\u2B1C':'casilla',
  '🍀':'trebol','🎲':'dado','👉':'dedo','💾':'disquete','📊':'grafica','📲':'movil','🔐':'candado','🔑':'llave','🖨':'impresora','🛡':'escudo','🧭':'brujula','🕘':'reloj'
};
const CLAVES=Object.keys(MAP).sort((a,b)=>b.length-a.length);
const RX=new RegExp('('+CLAVES.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?','g');
const llave=p=>p.replace(/\uFE0F/g,'');

/* ---------- 3) color por area ---------- */
const COLA=[
  [/^lectura/i,'#2563eb'],[/^matem|^razonam/i,'#ea580c'],
  [/^sociales|^competencias ciud/i,'#7c3aed'],[/^ciencias/i,'#059669'],
  [/^ingl/i,'#db2777'],[/^comunicacion escrita|^comunicación escrita/i,'#0891b2']
];
const PALETA7=['#2563eb','#ea580c','#7c3aed','#059669','#db2777','#0891b2','#d97706'];
function colorDe(area){
  const a=String(area||'');
  for(let i=0;i<COLA.length;i++)if(COLA[i][0].test(a))return COLA[i][1];
  let h=0;for(let i=0;i<a.length;i++)h=(h*31+a.charCodeAt(i))>>>0;
  return PALETA7[h%PALETA7.length];
}

/* ---------- 4) CSS de iconos + interaccion ---------- */
function css(){
  let est=document.getElementById('rs35css');
  if(est)return;
  est=document.createElement('style');est.id='rs35css';
  est.textContent=[
   '.rsic{width:1.15em;height:1.15em;vertical-align:-.18em;fill:none;stroke:currentColor;',
   'stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
   '.rsf{fill:currentColor;stroke:none}',
   '.dot.rs35a:not(.lk){background:var(--aa,#4f46e5)}',
   '.dot.rs35a:not(.lk):active{transform:scale(.96)}',
   '.chip.rs35a{border-color:var(--aa,#e3e6ee);color:var(--aa,#6b7280);font-weight:700}',
   '.top b svg{width:22px;height:22px;vertical-align:-3px}',
   '@media(prefers-reduced-motion:no-preference){',
   ' .rsic{transition:transform .18s ease}',
   ' button:hover .rsic{transform:scale(1.16)}',
   ' .dot.rs35a:not(.lk):hover{transform:scale(1.06)}',
   ' @keyframes rs35lat{0%,100%{transform:scale(1)}50%{transform:scale(1.22)}}',
   ' @keyframes rs35fl{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.12) rotate(3deg)}}',
   ' .top [data-i=corazon]{animation:rs35lat 1.6s ease-in-out infinite}',
   ' .top [data-i=fuego]{animation:rs35fl 1.3s ease-in-out infinite}',
   '}'
  ].join('');
  document.head.appendChild(est);
}

/* ---------- 5) iconificar arbol ---------- */
function frag(nom){
  const f=document.createElement('template');
  f.innerHTML=ico(nom);
  return f.content;
}
function iconificar(raiz){
  try{
    const walk=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT,null);
    const nodos=[];let n;
    while((n=walk.nextNode()))nodos.push(n);
    for(const tn of nodos){
      const txt=tn.nodeValue;if(!txt)continue;
      const pn=tn.parentNode&&tn.parentNode.nodeName;
      if(pn==='SCRIPT'||pn==='STYLE')continue;
      RX.lastIndex=0;
      if(!RX.test(txt))continue;
      const cont=tn.parentNode;if(!cont)continue;
      const f=document.createDocumentFragment();
      let ant=0,m;RX.lastIndex=0;
      while((m=RX.exec(txt))){
        if(m.index>ant)f.appendChild(document.createTextNode(txt.slice(ant,m.index)));
        const nom=MAP[llave(m[0])];
        if(nom)f.appendChild(frag(nom));
        else f.appendChild(document.createTextNode(m[0]));
        ant=m.index+m[0].length;
      }
      if(ant<txt.length)f.appendChild(document.createTextNode(txt.slice(ant)));
      cont.replaceChild(f,tn);
    }
  }catch(e){try{window.RS35err='iconificar: '+e.message+' @ '+(cont&&cont.nodeName)}catch(_){}}
}

/* ---------- 6) pintar areas ---------- */
function pintar(raiz){
  try{
    raiz.querySelectorAll('.dot[data-v]').forEach(el=>{
      const area=(el.getAttribute('data-v')||'').split('|')[0];
      if(!area)return;
      if(el.classList.contains('lk'))return;
      el.classList.add('rs35a');
      el.style.setProperty('--aa',colorDe(area));
      el.title=area;
    });
    raiz.querySelectorAll('.chip').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t.length<4||t.length>40)return;
      if(COLA.some(function(rc){return rc[0].test(t)})){
        el.classList.add('rs35a');el.style.setProperty('--aa',colorDe(t))
      }
    });
  }catch(e){try{window.RS35err=(window.RS35err||'')+' | pintar: '+e.message}catch(_){}}
}

/* ---------- 7) pase completo tras cada render ---------- */
function paseFull(){
  try{css();const r=document.body;iconificar(r);pintar(r)}catch(e){}
}

try{
  const _r35=render;
  render=function(){const r=_r35.apply(this,arguments);
    try{paseFull()}catch(e){}
    return r};
}catch(e){}

try{setTimeout(paseFull,0)}catch(e){}

/* ---------- 8) observador: cubre re-renders que no pasan por render() ----------
   Anti-bucle: solo re-pinta si queda texto sin sustituir (nodes de texto,
   saltando SCRIPT/STYLE/TEMPLATE). */
function hayPend(raiz){
  try{
    var raiz2=(raiz&&raiz.nodeType===9)?document.body:raiz;
    if(!raiz2)return false;
    var tw=document.createTreeWalker(raiz2,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      return /^(SCRIPT|STYLE|TEMPLATE)$/.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    var n;
    while((n=tw.nextNode())){RX.lastIndex=0;if(RX.test(n.nodeValue)){RX.lastIndex=0;return true}RX.lastIndex=0}
  }catch(e){}
  return false;
}
try{
  var _tm35=0;
  var mo35=new MutationObserver(function(mu){
    if(_tm35)return;
    _tm35=setTimeout(function(){_tm35=0;try{if(hayPend(document.documentElement))paseFull()}catch(e){}},50);
  });
  mo35.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
}catch(e){}

/* API para pruebas */
window.RS35={ico:ico,colorDe:colorDe,pase:paseFull,iconificar:iconificar,pintar:pintar,MAP:MAP,RX:RX,
  colorLectura:colorDe('Lectura Cr\u00edtica'),colorMat:colorDe('Matem\u00e1ticas'),
  colorIngles:colorDe('Ingl\u00e9s'),colorPro:colorDe('Ciencias de la salud')};
})();
