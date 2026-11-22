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
    guardarLocal(out);
    if(typeof save==='function')save();
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
  document.addEventListener('visibilitychange',function(){if(document.hidden&&pendiente)subir()});
  window.addEventListener('beforeunload',function(){if(pendiente)subir()});
}

function restaurar(){
  if(!sb)return;
  sb.auth.getSession().then(function(res){
    var s=res&&res.data&&res.data.session;
    if(!s)return;
    uid=s.user.id;
    sb.from('progreso').select('datos').eq('user_id',uid).single()
      .then(function(r){
        var rem=r&&r.data&&r.data.datos;
        if(rem){
          var nuevo=fusionar(rem);
          var mismo=nuevo&&JSON.stringify(nuevo)===JSON.stringify(leerLocal());
          if(!mismo){location.reload();return}
        }
        iniciarSincronizacion();
      }).catch(function(){iniciarSincronizacion()});
  }).catch(function(){});
}

function entrarEnLaNube(modo,em,pw){
  if(!sb||typeof S==='undefined'||S.view!=='app')return;
  if(!em||!pw)return;
  var p=(modo==='up')
    ?sb.auth.signUp({email:em,password:pw})
    :sb.auth.signInWithPassword({email:em,password:pw});
  p.then(function(r){
    if(r&&r.data&&r.data.session){uid=r.data.session.user.id;pendiente=true;iniciarSincronizacion();}
    else if(r&&r.error)console.warn('[v27] Supabase:',r.error.message);
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
      try{entrarEnLaNube(modo,em,pw)}catch(e){}
      return r;
    };
  }catch(e){}
}

/* API minima para pruebas y depuracion */
window.RS27={fusionar:fusionar,estado:function(){return{uid:uid,arrancado:arrancado,configurado:!!(cfg.url&&cfg.clave)}}};

function arrancar(){
  try{sb=window.supabase.createClient(cfg.url,cfg.clave)}catch(e){return}
  envolverAccion('new','up');
  envolverAccion('ini','in');
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
