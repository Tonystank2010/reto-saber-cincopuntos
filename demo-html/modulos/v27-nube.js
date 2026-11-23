/* ---- v27: nube Supabase dentro del demo, sin React ----
   Solo actua si: (a) esta standalone (no iframe de React: ahi maneja la nube
   Game.jsx con el puente v19) y (b) window.RS_NUBE tiene url y clave anon.
   Sin configurar, el juego queda 100% local, como siempre.
   Configurar con: python3 demo-html/actualizar_nube.py --url ... --clave ...   */
(function(){
'use strict';
if(window.self!==window.parent)return;
var cfg=window.RS_NUBE||{};
var CLAVE='retosaber.v3';
var sb=null,uid=null,pendiente=false,arrancado=false;

function leerLocal(){try{return JSON.parse(localStorage.getItem(CLAVE))||null}catch(e){return null}}
function guardarLocal(db){try{localStorage.setItem(CLAVE,JSON.stringify(db))}catch(e){}}

/* Fusion al estilo del puente v19: gana el usuario con mas XP; el resto de
   claves (pref/est/tm/dst/rep) las manda la nube; cur tiene preferencia local. */
function fusionar(rem){
  try{
    if(!rem||!rem.users||typeof rem.users!=='object')return null;
    var loc=leerLocal(),out={users:{}},us=(loc&&loc.users)||{},k,a,b,cur=null;
    for(k in us)out.users[k]=us[k];
    for(k in rem.users){a=out.users[k];b=rem.users[k];out.users[k]=(a&&b)?((b.xp||0)>=(a.xp||0)?b:a):b}
    if(loc&&loc.cur&&out.users[loc.cur])cur=loc.cur;
    else if(rem.cur&&out.users[rem.cur])cur=rem.cur;
    else cur=Object.keys(out.users)[0]||null;
    out.cur=cur;
    ['pref','est','tm','dst','rep'].forEach(function(j){if(rem[j]!==undefined)out[j]=rem[j]});
    guardarLocal(out);  /* v27.5: SIN save() — save() reescribiria el DB viejo en memoria y desharia la fusion (causa del bucle de recargas) */
    return out;
  }catch(e){return null}
}

function subir(){
  if(!sb||!uid)return;
  var db=leerLocal();if(!db)return;
  var nomb=(db.users&&db.cur&&db.users[db.cur]&&db.users[db.cur].name)||null;
  sb.from('progreso').upsert({user_id:uid,datos:db,updated_at:new Date().toISOString()})
    .then(function(){pendiente=false})
    .catch(function(e){console.warn('[v27] no se pudo guardar en la nube:',(e&&e.message)||e)});
  if(nomb)sb.from('perfiles').upsert({id:uid,nombre:nomb}).catch(function(){});
}

function iniciarSincronizacion(){
  if(arrancado)return;arrancado=true;
  if(typeof save==='function'){
    var save0=save;
    window.save=function(){var r=save0.apply(this,arguments);pendiente=true;return r};
  }
  setInterval(function(){if(pendiente)subir()},30000);
  setInterval(subir,120000);
  setInterval(autoSesion,15000);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&pendiente)subir()});
  window.addEventListener('beforeunload',function(){if(pendiente)subir()});
}

/* v27.3: el juego puede arrancar ya dentro (sesion recordada v23) sin pasar
   por el formulario: si no hay sesion en la nube y DB.rec tiene credenciales,
   firma solo con esa misma cuenta. Max 3 intentos, siempre que siga activo. */
var intentosAuto=0;
/* v27.4: alta/recuperacion unificada. Si un camino falla, prueba el otro:
   signIn sin usuario -> signUp; signUp ya registrado -> signIn. */
function cloudAuth(modo,em,pw){
  var A1=(modo==='up')
    ?sb.auth.signUp({email:em,password:pw})
    :sb.auth.signInWithPassword({email:em,password:pw});
  return A1.then(function(r){
    if(r&&r.data&&r.data.session)return r;
    var err=(r&&r.error)?String(r.error.message||'').toLowerCase():'';
    var sinUsuario=err.indexOf('invalid login')>=0||err.indexOf('not found')>=0||err.indexOf('no aplica')>=0;
    var yaExiste=err.indexOf('already')>=0||err.indexOf('registered')>=0||err.indexOf('exists')>=0;
    if(sinUsuario||yaExiste){
      var A2=(modo==='up')
        ?sb.auth.signInWithPassword({email:em,password:pw})
        :sb.auth.signUp({email:em,password:pw});
      return A2.then(function(r2){
        if(r2&&r2.error&&r2.error.message)console.warn('[v27] Supabase:',r2.error.message);
        return r2;
      }).catch(function(){return null});
    }
    if(err)console.warn('[v27] Supabase:',(r&&r.error&&r.error.message)||err);
    return null;
  }).catch(function(){return null});
}

function autoSesion(){
  try{
    if(!sb||uid||arrancado||intentosAuto>2)return;
    intentosAuto++;
    var rec=(typeof DB!=='undefined'&&DB.rec)?DB.rec:null;
    if(!rec||!rec.em||!rec.pw)return;
    cloudAuth('in',rec.em,rec.pw).then(function(r){
      if(r&&r.data&&r.data.session){uid=r.data.session.user.id;pendiente=true;iniciarSincronizacion();}
    });
  }catch(e){}
}

function restaurar(){
  if(!sb)return;
  sb.auth.getSession().then(function(res){
    var s=res&&res.data&&res.data.session;
    if(!s){autoSesion();return}
    uid=s.user.id;
    sb.from('progreso').select('datos').eq('user_id',uid).single()
      .then(function(r){
        var rem=r&&r.data&&r.data.datos;
        if(rem){
          /* v27.5: comparar ANTES vs DESPUES de fusionar (no despues de save(),
             que reescribia el DB viejo y forzaba un reload eterno) */
          var antes=leerLocal();
          var nuevo=fusionar(rem);
          if(nuevo&&JSON.stringify(nuevo)!==JSON.stringify(antes)){location.reload();return}
        }
        iniciarSincronizacion();
      }).catch(function(){iniciarSincronizacion()});
  }).catch(function(){});
}

function entrarEnLaNube(modo,em,pw){
  if(!sb||typeof S==='undefined'||S.view!=='app')return;
  if(!em||!pw)return;
  cloudAuth(modo,em,pw).then(function(r){
    if(r&&r.data&&r.data.session){uid=r.data.session.user.id;pendiente=true;iniciarSincronizacion();}
  });
}

/* Login local fallo y la nube tiene la cuenta: firmar sesión, bajar progreso,
   fusionar y recargar (v27.2 — otro dispositivo). */
function recuperarDeLaNube(em,pw){
  if(!sb||!em||!pw)return;
  cloudAuth('in',em,pw).then(function(r){
    if(!r||!r.data||!r.data.session)return;
    uid=r.data.session.user.id;
    sb.from('progreso').select('datos').eq('user_id',uid).single().then(function(x){
      var rem=x&&x.data&&x.data.datos;
      if(rem){
        var antes=leerLocal();            /* v27.5: recargar solo si la fusion cambio algo */
        var nuevo=fusionar(rem);
        if(nuevo&&JSON.stringify(nuevo)!==JSON.stringify(antes))location.reload();
      }
    }).catch(function(){});
  }).catch(function(){});
}

function envolverAccion(nombre,modo){
  try{
    if(typeof A==='undefined'||!A[nombre])return;
    var orig=A[nombre];
    A[nombre]=async function(){
      var emEl=document.getElementById('em'),pwEl=document.getElementById('pw');
      var em=emEl?emEl.value.trim():'',pw=pwEl?pwEl.value:'';
      var r=await orig.apply(this,arguments);
      try{
        if(typeof S!=='undefined'&&S.view==='app')entrarEnLaNube(modo,em,pw);
        else if(modo==='in')recuperarDeLaNube(em,pw);
      }catch(e){}
      return r;
    };
  }catch(e){}
}

/* API minima para pruebas y depuracion */
window.RS27={fusionar:fusionar,estado:function(){return{uid:uid,arrancado:arrancado,configurado:!!(cfg.url&&cfg.clave)}},forzar:arrancar};

/* API minima para pruebas y depuracion */
var ya=false;
function arrancar(){
  if(ya||!window.supabase)return;
  ya=true;
  try{sb=window.supabase.createClient(cfg.url,cfg.clave)}catch(e){return}
  envolverAccion('new','up');
  envolverAccion('in','in');   /* Entrar de sesion (S.at==='in'); A.ini es "Empezar" de la leccion, no login */
  restaurar();
}

if(cfg.url&&cfg.clave){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  s.onload=arrancar;
  s.onerror=function(){/* sin red: el juego sigue funcionando local */};
  document.head.appendChild(s);
}
})();
