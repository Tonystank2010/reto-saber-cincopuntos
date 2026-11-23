/* ---- v32: cambiar contraseña ----
   Valida la clave actual con el hash local (H/salt), luego:
   1) actualiza el hash+salt del usuario en este dispositivo
   2) actualiza la clave recordada (DB.rec) si existe
   3) si hay sesión de nube, la cambia también en Supabase (auth.updateUser) */
(function(){
'use strict';
if(window.self!==window.parent)return;

function card(){
  var nube=(window.RS27&&window.RS27.estado)?window.RS27.estado():null;
  var nota=nube&&nube.uid
    ?'<p class="mu">Se actualizará también en la nube (cuenta conectada ✔).</p>'
    :'<p class="mu">Modo local: solo cambia en este dispositivo.</p>';
  return'<div class="card" data-v32="1"><b>🔑 Cambiar contraseña</b><p class="mu">La nueva debe tener al menos 6 caracteres.</p>'
  +'<label style="margin-top:6px">Contraseña actual<input id="pw32a" type="password" autocomplete="current-password"></label>'
  +'<label style="margin-top:6px">Nueva contraseña<input id="pw32b" type="password" autocomplete="new-password"></label>'
  +'<label style="margin-top:6px">Repite la nueva<input id="pw32c" type="password" autocomplete="new-password"></label>'
  +'<div class="row" style="margin-top:8px"><button data-a="pw32">Actualizar contraseña</button></div>'
  +nota+'</div>';
}

function inyectar(){
  try{
    if(document.querySelector('[data-v32]'))return;
    var sv=null;try{sv=S}catch(e){}
    var u=null;try{u=U()}catch(e){}
    if(!sv||sv.view!=='app'||sv.tab!=='perfil'||sv.L||!u)return;
    var main=document.querySelector('main');if(!main)return;
    var legal=main.querySelector('[data-v31]');
    var env=document.createElement('div');env.innerHTML=card();
    var el=env.firstElementChild;if(!el)return;
    if(legal)legal.insertAdjacentElement('beforebegin',el);
    else main.insertAdjacentElement('beforeend',el);
  }catch(e){}
}

try{
  var _r32=render;
  render=function(){var r=_r32.apply(this,arguments);try{(S&&S.view==='app'&&S.tab==='perfil')&&inyectar()}catch(e){}return r};
}catch(e){}

try{setTimeout(function(){try{inyectar()}catch(e){}},0)}catch(e){}

try{
  Object.assign(A,{
    pw32:async function(){
      try{
        var u=U();if(!u){alert('Entra a tu cuenta primero.');return}
        var a=(document.getElementById('pw32a')||{}).value||'';
        var b=(document.getElementById('pw32b')||{}).value||'';
        var c=(document.getElementById('pw32c')||{}).value||'';
        if(!a||!b||!c){alert('Llena los tres campos.');return}
        if(b.length<6){alert('La nueva contraseña debe tener al menos 6 caracteres.');return}
        if(b!==c){alert('La nueva contraseña y su repetición no coinciden.');return}
        if(b===a){alert('La nueva debe ser distinta de la actual.');return}
        var act=null;if(typeof H==='function'&&u.salt!=null)act=await H(a,u.salt);
        if(act===null||u.ph!==act){alert('La contraseña actual no es correcta.');return}
        u.salt=Math.random().toString(36).slice(2);
        u.ph=await H(b,u.salt);
        if(DB.rec&&DB.rec.em===DB.cur)DB.rec.pw=b;
        save();
        var nube=(window.RS27&&window.RS27.estado)?window.RS27.estado():null;
        var msg='Contraseña actualizada en este dispositivo.';
        if(nube&&nube.uid&&window.RS27.cambiarClave){
          try{var r=await window.RS27.cambiarClave(b);
            msg=(r&&r.error)?('Se cambió en el dispositivo, pero la nube dijo: '+(r.error.message||'error')+'. Vuelve a entrar con la nueva.'):
              'Contraseña actualizada en este dispositivo Y en la nube ✔.';
          }catch(e){msg='Se cambió en el dispositivo; no se pudo contactar la nube ahora. Al entrar de nuevo usa la nueva; si falla, usa la anterior en otro dispositivo.'}
        }
        alert(msg);
        try{
          ['pw32a','pw32b','pw32c'].forEach(function(i2){var e2=document.getElementById(i2);if(e2)e2.value=''});
        }catch(e){}
        render();
      }catch(e){alert('No se pudo actualizar: '+((e&&e.message)||e))}
    }
  });
}catch(e){}
window.RS32={version:'32'};
})();
