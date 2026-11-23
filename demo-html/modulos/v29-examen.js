/* ---- v29: cuenta regresiva para el examen ----
   El usuario guarda la fecha de su examen (vive en su usuario -> se sincroniza a la nube).
   Card en Camino con días restantes y sugerencia de estudio, sin inventar fechas de ICFES. */
(function(){
'use strict';
if(window.self!==window.parent)return;

function diasRest(f){
  var t=new Date(f+'T00:00:00');
  if(isNaN(t.getTime()))return NaN;
  var h=new Date();h.setHours(0,0,0,0);
  return Math.round((t.getTime()-h.getTime())/864e5);
}

function card(u){
  var f=u.fex||'';
  if(!f)return'<div class="card" data-v29="1"><b>🎯 Mi examen</b><p class="mu">Elige la fecha de tu examen para ver tu cuenta regresiva y un recordatorio en el Camino. (El ICFES publica fechas oficiales: elige la de tu citación.)</p><div class="row"><input id="fex29" type="date" style="max-width:210px"><button data-a="fex">Guardar fecha</button></div></div>';
  var d=diasRest(f),msg,sug='concertado';
  if(isNaN(d))msg='Fecha no válida; actualízala.';
  else if(d<0)msg='Tu examen fue el '+esc(f)+'. Si tienes nueva fecha, actualízala.';
  else if(d===0)msg='¡HOY es tu examen! 🍀 Mucha suerte: lee con calma, respira y confía en tu preparación.';
  else if(d===1)msg='Tu examen es MAÑANA. Descansa bien hoy y repasa solo tus preguntas marcadas (Repaso y Perfil).';
  else msg='Tu examen es en <b>'+d+' días</b> ('+esc(f)+').';
  if(d===1)sug='Esta noche: revisa el glosario y las estrategias; no empieces temas nuevos.';
  else if(d>0&&!isNaN(d))sug='Con '+Math.max(1,Math.round(d/7))+' semana(s): mantén tu plan diario y un simulacro por semana.';
  return'<div class="card" data-v29="1"><b>🎯 Mi examen</b><p>'+msg+'</p>'+(sug?'<p class="mu">'+sug+'</p>':'')+'<div class="row" style="margin-top:6px"><input id="fex29" type="date" value="'+esc(f)+'" style="max-width:210px"><button class="g" data-a="fex">Cambiar fecha</button><button class="g" data-a="fdel">Quitar</button></div></div>';
}

function inyectar(){
  try{
    if(document.querySelector('[data-v29]'))return;
    var sv=null;try{sv=S}catch(e){}
    var u=null;try{u=U()}catch(e){}
    if(!sv||sv.view!=='app'||sv.tab!=='camino'||sv.L||!u)return;
    var main=document.querySelector('main');if(!main)return;
    main.insertAdjacentHTML('afterbegin',card(u));
  }catch(e){}
}

try{
  var _r29=render;
  render=function(){var r=_r29.apply(this,arguments);try{(S&&S.view==='app'&&S.tab==='camino')&&inyectar()}catch(e){}return r};
}catch(e){}

try{
  Object.assign(A,{
    fex:function(){var el=document.getElementById('fex29');if(!el||!el.value)return;
      var d=diasRest(el.value);
      if(isNaN(d)){alert('Fecha no válida.');return}
      if(d<0&&!confirm('Esa fecha ya pasó ('+el.value+'). ¿Guardarla de todos modos?'))return;
      var u=U();u.fex=el.value;save();render()},
    fdel:function(){var u=U();delete u.fex;save();render()}
  });
}catch(e){}
/* v31-fix: auto-inyeccion al arranque (el bootstrap inicial renderiza antes de instalar wrappers) */
try{setTimeout(inyectar,0)}catch(e){}
window.RS29={diasRest:diasRest};
})();
