/* ---- v45: evolucion de la mascota con el XP ----
   La mascota crece contigo: cada etapa llega por el XP total de tu
   cuenta (el mismo que alimenta la liga y la temporada) y se dibuja
   como una capa SVG propia sobre el avatar, en todas partes (topbar,
   Perfil, Liga, reacciones). La etapa NO se guarda: se deduce del XP,
   asi sobrevive a fusiones de nube sin estado extra y no puede
   destensincronizarse. 5 etapas: Destello, Chispa, Cometa, Estrella
   y Constelacion. Sin emojis: todo es SVG dibujado a mano.
   API: window.RS45. */
(function(){
'use strict';
if(typeof window==='undefined')return;

/* ---------- etapas (umbral de XP total de la cuenta) ---------- */
var ETAPAS=[
 {xp:0,   n:'Destello',     d:'Tu mascota llega con su brillo propio. Cada leccion alimenta su luz.'},
 {xp:150, n:'Chispa',       d:'Nace una chispa compañera que orbita a tu lado.'},
 {xp:400, n:'Cometa',       d:'Tu mascota deja una estela de cometa: el estudio ya es camino.'},
 {xp:900, n:'Estrella',     d:'Recibe la insignia de estrella en el pecho. Vas en serio.'},
 {xp:1800,n:'Constelación', d:'Halos y constelación completa: tu mascota es puro brillo.'}
];

function etapaDe(xp){
  xp=xp|0;var i=0;
  for(var j=0;j<ETAPAS.length;j++)if(xp>=ETAPAS[j].xp)i=j;
  return i;
}
function miXP(){
  try{var u=U();return (u&&u.xp)|0}catch(e){return 0}
}
function sig(idx){
  return ETAPAS[idx+1]||null;
}
/* progreso 0..1 dentro de la etapa idx */
function progreso(idx,xp){
  var a=ETAPAS[idx].xp,b=sig(idx);
  if(!b)return 1;
  return Math.min(1,Math.max(0,(xp-a)/(b.xp-a)));
}

/* ---------- capas SVG (viewBox 0 0 100 96; piso en y=89) ---------- */
var ORO='#f5c542',ORO2='#fbbf24';
function estrella4(cx,cy,r,fill){
  return '<path d="M'+cx+' '+(cy-r)+'L'+(cx+r*0.3)+' '+(cy-r*0.3)+'L'+(cx+r)+' '+cy+
   'L'+(cx+r*0.3)+' '+(cy+r*0.3)+'L'+cx+' '+(cy+r)+'L'+(cx-r*0.3)+' '+(cy+r*0.3)+
   'L'+(cx-r)+' '+cy+'L'+(cx-r*0.3)+' '+(cy-r*0.3)+'z" style="fill:'+fill+'"/>';
}
function estrella5(cx,cy,r,fill,rot){
  rot=rot||0;var p='',i,a;
  for(i=0;i<10;i++){
    a=rot-90+i*36;var rr=i%2?r*0.45:r;
    p+=(i?'L':'M')+(cx+rr*Math.cos(a*Math.PI/180)).toFixed(1)+' '+(cy+rr*Math.sin(a*Math.PI/180)).toFixed(1);
  }
  return '<path d="'+p+'z" style="fill:'+fill+'"/>';
}
/* chispa compañera con anillo de brillo */
function chispa(cx,cy){
  return '<circle cx="'+cx+'" cy="'+cy+'" r="4.4" style="fill:'+ORO+';opacity:.28"/>'
   +estrella4(cx,cy,2.6,ORO2);
}
/* estela de cometa que pasa por detras de la cabeza */
function cometa(){
  return '<path d="M6 22 C 22 6, 62 2, 88 10" style="fill:none;stroke:'+ORO+';stroke-width:2;opacity:.5;stroke-linecap:round;stroke-dasharray:1 5"/>'
   +'<circle cx="88" cy="10" r="3.4" style="fill:'+ORO2+'"/><circle cx="88" cy="10" r="1.4" style="fill:#fffbe9"/>'
   +estrella4(74,6.5,1.7,ORO);
}
/* insignia de estrella en el pecho */
function insignia(){
  return '<g><circle cx="50" cy="79" r="6.4" style="fill:'+ORO2+';stroke:rgba(0,0,0,.22);stroke-width:1.4"/>'
   +estrella5(50,79,3.6,'rgba(120,64,10,.85)',-90)
   +'<path d="M46.5 74.6a6.4 6.4 0 0 1 7 0" style="fill:none;stroke:rgba(255,255,255,.55);stroke-width:1.2;stroke-linecap:round"/></g>';
}
/* halo suave detras y dos estrellas de constelacion unidas */
function constelacion(mood){
  var cls=mood==='happy'?' rs45tw':'';
  return '<ellipse cx="50" cy="50" rx="43" ry="36" style="fill:none;stroke:'+ORO+';stroke-width:1;opacity:.35;stroke-dasharray:2 6;stroke-linecap:round"/>'
   +'<g class="rs45orb'+cls+'">'+chispa(12,30)+chispa(89,44)+'</g>'
   +'<path d="M12 30L89 44" style="fill:none;stroke:'+ORO+';stroke-width:.7;opacity:.3;stroke-dasharray:2 4"/>';
}

/* capa segun la etapa; acumulativa: cada etapa suma la anterior */
function capa(c,mood){
  var n=etapaDe(miXP());
  if(n<=0)return'';
  var out='';
  if(n>=1)out+=chispa(90,26);
  if(n>=2)out+=cometa();
  if(n>=3)out+=insignia();
  if(n>=4)out+=constelacion(mood);
  return '<g class="rs45evo" aria-hidden="true">'+out+'</g>';
}

/* ---------- CSS de la tarjeta de progreso ---------- */
function css(){
  if(document.getElementById('rs45css'))return;
  var est=document.createElement('style');est.id='rs45css';
  est.textContent=[
   '.rs45evo[data-rs45]{width:100%;display:block;text-align:center;margin-top:6px}',
   '.rs45et{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--br);border-radius:999px;',
    'padding:3px 10px;font-size:12px;font-weight:800;color:var(--tx);background:var(--cd)}',
   '.rs45et svg{width:13px;height:13px;color:'+ORO2+'}',
   '.rs45bar{height:9px;border-radius:999px;background:rgba(127,127,127,.18);overflow:hidden;margin:8px auto 4px;max-width:220px}',
   '.rs45bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,'+ORO2+','+ORO+');',
    'transition:width .4s ease}',
   '.rs45sig{margin:0;font-size:12px;opacity:.75;overflow-wrap:anywhere}',
   '.rs45etapa{display:block;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.65;margin-bottom:2px}',
   '@media(prefers-reduced-motion:no-preference){',
    '@keyframes rs45tw{0%,100%{opacity:1}50%{opacity:.35}}',
    '.rs45orb.tw{animation:rs45tw 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}}'
  ].join('');
  document.head.appendChild(est);
}

/* ---------- tarjeta de progreso en el editor de la mascota ---------- */
function tarjeta(){
  var xp=miXP(),n=etapaDe(xp),e=ETAPAS[n],sg=sig(n);
  var ico='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3l2.2 6.5L21 12l-6.8 2.5L12 21l-2.2-6.5L3 12l6.8-2.5z"/></svg>';
  var barra,abajo;
  if(sg){
    var falta=Math.max(1,sg.xp-xp);
    barra='<div class="rs45bar"><i style="width:'+Math.round(progreso(n,xp)*100)+'%"></i></div>'
     +'<p class="rs45sig">Te faltan <b>'+falta+' XP</b> para que tu mascota se convierta en <b>'+sg.n+'</b>.</p>';
  }else{
    barra='<div class="rs45bar"><i style="width:100%"></i></div>'
     +'<p class="rs45sig">Tu mascota alcanzo su constelación completa. Siguela brillando.</p>';
  }
  return '<div class="rs45evo" data-rs45="1">'
   +'<span class="rs45etapa">Evolucion '+(n+1)+' de '+ETAPAS.length+'</span>'
   +'<span class="rs45et">'+ico+' '+e.n+'</span>'
   +barra+'</div>';
}
function inyectar(){
  try{
    if(!(S&&S.view==='app'&&S.tab==='perfil'))return;
    var nom=document.querySelector('[data-v37] .rs40prev .rs40nom');if(!nom)return;
    var prev=nom.closest('.rs40prev');if(!prev)return;
    var t=prev.querySelector('[data-rs45]');
    var html=tarjeta();
    if(t){t.outerHTML=html}
    else nom.insertAdjacentHTML('afterend',html);
  }catch(e){}
}

/* ---------- render wrapper + acciones ---------- */
try{
  css();
  if(typeof render==='function'){
    var _r45=render;
    render=function(){var r=_r45.apply(this,arguments);try{inyectar()}catch(e){}return r};
  }
  setTimeout(function(){try{inyectar()}catch(e){}},0);
}catch(e){}

/* API para pruebas */
try{
  window.RS45={ETAPAS:ETAPAS,etapaDe:etapaDe,progreso:progreso,capa:capa,inyectar:inyectar,tarjeta:tarjeta,
    deXP:function(xp){return capa(null,'neutro')}};/* deXP se usa en tests: capa ya lee U() */
}catch(e){}

})();
