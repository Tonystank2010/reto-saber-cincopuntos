/* ---- v31: seguridad y privacidad ----
   a) Opt-out de «recordar contraseña»: checkbox en el formulario; si se desmarca,
      no se guarda la clave en este dispositivo (v23 solo guardaba siempre).
   b) Tarjeta de privacidad/legal en el Perfil (atribución ICFES, no afiliación,
      dónde viven los datos) + botón «Olvidar este dispositivo» (borra clave
      guardada + cierra sesión de nube; NO borra el progreso local). */
(function(){
'use strict';
if(window.self!==window.parent)return;

function quieroRec(){
  var el=document.getElementById('rs31rec');
  return el?!!el.checked:true;
}
function olvidar(){try{delete DB.rec;save()}catch(e){}}

/* a) Envolver DESPUES de v23 y v27: si el checkbox venia desmarcado, borrar rec.
   IMPORTANTE: leer el checkbox ANTES de ejecutar (tras la accion el formulario se desmonta). */
try{var _n31=A.new;A.new=async function(){var q0=quieroRec();var r=await _n31.apply(this,arguments);
  try{(S&&S.view==='app'&&DB.cur&&!q0)&&olvidar()}catch(e){}return r}}catch(e){}
try{var _i31=A.in;A.in=async function(){var q0=quieroRec();var r=await _i31.apply(this,arguments);
  try{(S&&S.view==='app'&&DB.cur&&!q0)&&olvidar()}catch(e){}return r}}catch(e){}

/* checkbox en el formulario de auth (despues del campo clave) */
function inyectaAuth(){
  try{
    if(document.getElementById('rs31rec'))return;
    var pw=document.getElementById('pw');if(!pw)return;
    var lbl=pw.closest('label')||pw;
    lbl.insertAdjacentHTML('afterend','<br><label style="display:flex;gap:8px;align-items:flex-start;font-weight:500"><input id="rs31rec" type="checkbox" checked style="width:auto;min-height:0;margin-top:4px"> Recordar mi contraseña en este dispositivo (solo local; nunca sale del dispositivo)</label>');
  }catch(e){}
}

/* tarjeta legal/privacidad al final del Perfil */
function perfilLegal(u){
  var rec=!!DB.rec;
  return'<div class="card" data-v31="1"><b>🛡️ Privacidad, fuentes y legal</b>'
  +'<p class="mu">Tus datos viven en <b>este dispositivo</b> (localStorage del navegador); si activaste la nube, tu correo y tu progreso viven además en <b>tu propia base de datos de Supabase</b>. Este demo no usa rastreadores ni analítica de terceros.</p>'
  +'<p class="mu">Contenido de práctica original y no oficial. La estructura de las pruebas sigue los marcos de referencia públicos del ICFES; cuando se use material de esa institución se atribuirá siempre: «Fuente: Instituto Colombiano para la Evaluación de la Educación — ICFES». Esta aplicación <b>no está</b> afiliada, respaldada ni administrada por el ICFES ni por el Ministerio de Educación.</p>'
  +'<div class="row" style="margin-top:8px"><button class="g" data-a="rs31f">Olvidar este dispositivo</button></div>'
  +'<p class="mu">«Olvidar este dispositivo» borra la contraseña recordada y cierra la sesión de nube aquí (sin borrar tu progreso local). Estado: '+(rec?'hay una clave recordada en este dispositivo.':'no hay clave recordada en este dispositivo.')+'</p></div>';
}

function inyectaPerfil(){
  try{
    if(document.querySelector('[data-v31]'))return;
    var sv=null;try{sv=S}catch(e){}
    var u=null;try{u=U()}catch(e){}
    if(!sv||sv.view!=='app'||sv.tab!=='perfil'||sv.L||!u)return;
    var main=document.querySelector('main');if(!main)return;
    main.insertAdjacentHTML('beforeend',perfilLegal(u));
  }catch(e){}
}

try{
  var _r31=render;
  render=function(){var r=_r31.apply(this,arguments);
    try{(S&&S.view==='auth')&&inyectaAuth()}
    catch(e){}
    try{(S&&S.view==='app'&&S.tab==='perfil')&&inyectaPerfil()}
    catch(e){}
    return r};
}catch(e){}

try{setTimeout(function(){try{inyectaAuth();inyectaPerfil()}catch(e){}},0)}catch(e){}

try{
  Object.assign(A,{
    rs31f:function(){
      if(!confirm('¿Borrar la contraseña recordada y cerrar tu sesión de nube en este dispositivo? Tu progreso local NO se borra.'))return;
      olvidar();
      try{window.RS27&&window.RS27.salir&&window.RS27.salir()}catch(e){}
      location.reload()
    }
  });
}catch(e){}

/* API minima para pruebas */
window.RS31={olvidar:olvidar,quieroRec:quieroRec};
})();
