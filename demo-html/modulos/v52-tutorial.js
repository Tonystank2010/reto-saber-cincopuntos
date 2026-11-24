/* ---- v52: tutorial en mini tarjetas para quien recien se registra ----
   Al crear cuenta (tuto:0), el juego abre una guia de 6 mini tarjetas,
   una por concepto central, con texto breve. Cada tarjeta tiene dos
   botones: Siguiente (avanza) y Saltar (cierra y deja jugar de una).
   Al terminar, u.tuto=1 y no vuelve a molestar; se puede reabrir desde
   Perfil > Ajustes avec \u00abVer el tutorial de nuevo\u00bb.
   Iconografia: sprite propio de v35 (svg.rsic); cero emojis. API window.RS52. */
(function(){
'use strict';
if(typeof window==='undefined')return;
var CARDS=[
 {ico:'camino',t:'El Camino',d:'Cada dia veras niveles nuevos en el mapa. Toca un punto para practicar preguntas de la materia elegida.'},
 {ico:'corazon',t:'Vidas y corazones',d:'Tienes 5 corazones. Cada error gasta uno, pero se recuperan solos con el tiempo. Sin corazones puedes practicar en Modo practica, que no gasta vidas.'},
 {ico:'diana',t:'Monedas y tienda',d:'Cada punto de XP que ganas te da una moneda. Con monedas compras protectores de racha, recuperas vidas o articulos para tu mascota en la Tienda.'},
 {ico:'fuego',t:'Tu racha',d:'Si estudias al menos un punto al dia, tu racha crece. Un protector de racha la salva si un dia no puedes entrar.'},
 {ico:'medalla',t:'Ligas y duelos',d:'Cada semana compites en una liga por XP. Puedes retar a otras personas a un duelo de 10 preguntas y defenderte de quien te reto.'},
 {ico:'cuentos',t:'Cuentos y clases',d:'Ademas de preguntas, hay cuentos por etapas para tu lectura y un plan nocturno: la app te arma el plan de manana segun tus puntos debiles.'}
];
function css(){
  if(document.getElementById('rs52css'))return;
  var s=document.createElement('style');s.id='rs52css';
  s.textContent=[
   '.rs52bk{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:95;display:flex;align-items:center;justify-content:center;padding:16px}',
   '.rs52m{background:var(--cd);color:var(--tx);border:1px solid var(--br);border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,.3);',
    'width:100%;max-width:360px;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:88vh;overflow:auto;text-align:center;align-items:center}',
   '.rs52m .rs52ic{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;',
    'background:color-mix(in srgb,var(--ac) 14%,transparent);color:var(--ac)}',
   '.rs52m .rs52ic svg.rsic{width:28px;height:28px}',
   '.rs52m h3{margin:0;font-size:18px}',
   '.rs52m p{margin:0;color:var(--mu);line-height:1.5}',
   '.rs52pts{display:flex;gap:6px;justify-content:center}',
   '.rs52pts i{width:8px;height:8px;border-radius:99px;background:var(--br)}',
   '.rs52pts i.on{background:var(--ac)}',
   '.rs52btns{display:flex;flex-direction:column;gap:10px;width:100%}',
   '.rs52btns button{width:100%;justify-content:center;min-height:40px;border-radius:999px;font-weight:800;cursor:pointer}', 
   '.rs52btns .sig{background:var(--ac);color:#fff;border:none}',
   '.rs52btns .salt{background:transparent;color:var(--mu);border:1px solid var(--br)}',
   '@media (prefers-reduced-motion: no-preference){.rs52m{animation:rs52in .18s ease-out}}',
   '@keyframes rs52in{from{transform:scale(.96);opacity:.6}to{transform:scale(1);opacity:1}}'
  ].join('');
  document.head.appendChild(s);
}
function ventana(i){
  var c=CARDS[i];
  return '<div class="rs52bk" data-rs52="1" data-a="rs52x"><div class="rs52m" role="dialog" aria-label="Tutorial del juego \u00b7 tarjeta '+(i+1)+' de '+CARDS.length+'">'+
   '<div class="rs52ic">'+(window.RS35?RS35.ico(c.ico):'')+'</div>'+
   '<h3>'+esc(c.t)+'</h3><p>'+esc(c.d)+'</p>'+
   '<div class="rs52pts" aria-hidden="true">'+CARDS.map(function(_,j){return '<i class="'+(j<=i?'on':'')+'"></i>'}).join('')+'</div>'+
   '<div class="rs52btns">'+
    (i<CARDS.length-1
      ?'<button class="sig" data-a="rs52next" data-v="'+(i+1)+'">Siguiente</button>'
      :'<button class="sig" data-a="rs52done">Empezar a jugar</button>')+
    '<button class="salt" data-a="rs52skip">Saltar</button>'+
   '</div></div></div>';
}
function abrir(i){var v=document.querySelector('[data-rs52]');if(v)try{v.remove()}catch(e){}
  document.body.insertAdjacentHTML('beforeend',ventana(i|0||0))}
function cerrar(){var v=document.querySelector('[data-rs52]');if(v)try{v.remove()}catch(e){}}
function pendiente(){try{var u=U();return !!(u&&typeof u.tuto==='number'&&u.tuto===0)}catch(e){return false}}
function revisar(){try{if(pendiente()&&!(S.L||S.R)){css();abrir(S.t52|0)}}catch(e){}}
function terminar(){try{var u=U();if(u&&u.tuto!==1){u.tuto=1;save()}}catch(e){}}
try{Object.assign(A,{
 rs52next:function(v){S.t52=+v;abrir(+v)},
 rs52skip:function(){terminar();S.t52=0;cerrar();render()},
 rs52done:function(){terminar();S.t52=0;cerrar();render()},
 rs52again:function(){try{var u=U();u.tuto=0;save()}catch(e){}render()}
})}catch(e){}
try{
  if(typeof render==='function'){
    var _r52=render;
    render=function(){var r=_r52.apply(this,arguments);try{(S.L||S.R)&&cerrar();revisar()}catch(e){}return r};
  }
  setTimeout(revisar,0);
}catch(e){}
/* botón para reabrir en Perfil/Ajustes, idempotente */
function botonAjustes(){
  try{
    var card=document.querySelector('[data-v32]');
    if(!card||card.querySelector('[data-a="rs52again"]'))return;
    var b=document.createElement('button');
    b.className='rs42pr';b.setAttribute('data-a','rs52again');b.style.marginTop='8px';
    b.textContent='Ver el tutorial de nuevo';
    card.appendChild(b);
  }catch(e){}
}
try{
  if(typeof render==='function'){
    var _r52b=render;
    render=function(){var r=_r52b.apply(this,arguments);try{botonAjustes()}catch(e){}return r};
  }
}catch(e){}
window.RS52={cards:CARDS,abrir:abrir,revisar:revisar,estado:function(){return {pendiente:pendiente(),abierta:!!document.querySelector('[data-rs52]')}}};
})();
