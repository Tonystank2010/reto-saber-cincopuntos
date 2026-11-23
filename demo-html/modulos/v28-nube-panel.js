/* ---- v28: panel de nube en el Perfil (estado de sincronización + "Subir ahora" / "Bajar de la nube") ----
   Requiere el módulo v27 (nube). Sin él o sin configurar, la tarjeta muestra modo local. */
(function(){
'use strict';
if(window.self!==window.parent)return;
window.RS28='cargado';

function estado(){
  try{ return (window.RS27&&window.RS27.estado)?window.RS27.estado():null }catch(e){ return null }
}

function html(){
  var st=estado();
  var t,m;
  if(!st){ t='☁️ Nube (Supabase)'; m='Panel no disponible: el módulo de nube no está activo en esta copia.'; }
  else if(!st.configurado){ t='☁️ Modo local'; m='El juego funciona sin nube. Todo tu progreso se guarda en este dispositivo.'; }
  else if(st.uid){ t='✅ Conectado a la nube'; m='Cuenta sincronizada ('+String(st.uid).slice(0,8)+'…). Tu progreso se sube solo cada 30 s y al cambiar de pestaña.'; }
  else { t='⏳ Sin sesión en la nube'; m='Buscando tu cuenta… si persiste, ve a Perfil → Salir → Entrar escribiendo tu correo y contraseña.'; }
  var botones=st&&st.configurado
    ?'<div class="row" style="margin-top:8px"><button data-a="rs28up">Subir ahora</button><button class="g" data-a="rs28dn">Bajar de la nube</button></div>'
    :'';
  var fila=st&&st.uid
    ?'<p class="mu" style="margin-top:6px">Última fila visible en Supabase → Table Editor → <b>progreso</b> (user_id: '+String(st.uid).slice(0,8)+'…)</p>'
    :'';
  return '<div class="card" data-v28="1"><b>☁️ Nube (Supabase)</b><p class="mu" style="margin-top:6px">'+t+'</p><p class="mu">'+m+'</p>'+botones+fila+'</div>';
}

function inyectar(){
  try{
    if(!window.RS27)return;
    if(document.querySelector('[data-v28]'))return;
    /* S es const del script principal (no vive en window, pero su scope léxico
       cruza bloques <script>): referenciarlo sin prefijo. */
    var sv=null;try{sv=S}catch(e){}
    if(!sv||sv.view!=='app'||sv.tab!=='perfil'||sv.L)return;
    var main=document.querySelector('main');if(!main)return;
    main.insertAdjacentHTML('afterbegin',html());
  }catch(e){try{console.warn('[v28] inyectar:',(e&&e.message)||e)}catch(_){}}
}

try{
  var _r28=render;
  render=function(){var r=_r28.apply(this,arguments);try{(S&&S.view==='app'&&S.tab==='perfil')&&inyectar()}catch(e){}return r};
}catch(e){}

try{
  Object.assign(A,{
    rs28up:function(){
      var st=estado();
      if(!st||!st.uid){alert('Aún no hay sesión en la nube. Espera unos segundos y vuelve a intentarlo (o entra con tu correo y contraseña).');return}
      window.RS27.subir();
      try{say('Enviando tu progreso a la nube…')}catch(e){}
      inyectar();render();
    },
    rs28dn:function(){
      var st=estado();
      if(!st||!st.uid){alert('Aún no hay sesión en la nube: no hay de dónde bajar. Entra primero con tu cuenta.');return}
      window.RS27.bajar();
    }
  });
}catch(e){}
})();
