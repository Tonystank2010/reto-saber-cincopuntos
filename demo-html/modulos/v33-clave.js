/* ---- v33: ojo para ver la clave + aviso de autocompletado ----
   Problema: el gestor de contrasenas del celular (Google/Chrome) rellena solito
   una clave ANTIGUA guardada de este sitio y el acceso falla.
   Solucion desde la app:
   a) Boton "Ver" junto al campo de clave para VER que se autocompleto y corregirlo a mano.
   b) Aviso visible en la pantalla de acceso sobre claves autocompletadas antiguas. */
(function(){
'use strict';
if(window.self!==window.parent)return;

function inyectar(){
  try{
    if(S&&S.view!=='auth')return;
    var pw=document.getElementById('pw');if(!pw)return;
    if(document.getElementById('rs33ojo'))return;
    var lbl=pw.closest('label')||pw;
    /* boton ojo: despues del label de la clave */
    lbl.insertAdjacentHTML('afterend','<div style="display:flex;gap:8px;align-items:center;margin-top:-8px"><button type="button" class="chip" id="rs33ojo" data-a="rs33ojo" aria-label="Mostrar u ocultar la contrasena">&#128065; Ver clave</button></div>');
    /* aviso de autocompletado */
    lbl.insertAdjacentHTML('afterend','<p class="mu" id="rs33aviso" style="font-size:.9em">&#9888;&#65039; Si tu navegador o Google complet&oacute; la clave y da error, puede estar poniendo una clave <b>antigua guardada</b>: pulsa &laquo;Ver clave&raquo; para revisarla, b&oacute;rrala y escr&iacute;bela a mano.</p>');
  }catch(e){}
}

function ojo(){
  try{
    var pw=document.getElementById('pw');if(!pw)return;
    var mostrar=(pw.type==='password');
    pw.type=mostrar?'text':'password';
    var b=document.getElementById('rs33ojo');
    if(b)b.innerHTML=(mostrar?'&#128064; Ocultar':'&#128065; Ver')+' clave';
  }catch(e){}
}

try{
  var _r33=render;
  render=function(){var r=_r33.apply(this,arguments);
    try{(S&&S.view==='auth')&&setTimeout(inyectar,0)}
    catch(e){}
    return r};
}catch(e){}

try{setTimeout(inyectar,0)}catch(e){}

try{Object.assign(A,{rs33ojo:function(){ojo()}})}catch(e){}

/* API minima para pruebas */
window.RS33={ver:document.getElementById.bind(document)};
})();
