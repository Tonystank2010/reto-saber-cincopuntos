/* ---- v41: pestañas del perfil + texto que encaja + ligas y duelos con personas reales ----
   Aquí vive:
   (b) encaje de texto en chips/casillas sobre todo en móvil vertical,
   (c) refuerzo de las pestañas internas del perfil: Personalizar / Progreso / Ajustes
       (la barra y la acción viven en el código base; aquí se oculta/muestra el editor),
   (d) ligas y duelos con personas reales: si la nube está activa y el proyecto
       ejecutó supabase/ligas.sql, se leen filas reales de la vista liga_publica
       y se puede duelar contra ellas; sin nube, todo queda como antes (cuentas locales). */
(function(){
'use strict';
if(typeof window==='undefined')return;

/* ---------- (b) encaje de texto y ajustes visuales ---------- */
function css(){
  if(document.getElementById('rs41css'))return;
  var est=document.createElement('style');est.id='rs41css';
  est.textContent=[
    /* el editor de mascota solo vive en la pestaña Personalizar */
    'body[data-rsptab]:not([data-rsptab="perso"]) [data-v40]{display:none!important}',
    /* el texto siempre cabe dentro de botones, chips, filas y tarjetas */
    'button{min-width:0;max-width:100%;overflow-wrap:anywhere;white-space:normal}',
    '.chip{max-width:100%;min-width:0}',
    '.lg span{min-width:0;flex:1 1 auto}',
    '.lg .g{flex:0 0 auto;margin-left:8px;min-height:34px;padding:4px 10px;font-size:13px}',
    '.rs40nom,.rs40ttl{max-width:100%;overflow-wrap:anywhere}',
    '.rs39brand{max-width:100%;overflow:hidden}',
    /* móvil vertical: compactar para que nada se salga de su caja */
    '@media(max-width:480px){',
    ' .chip{font-size:13px;padding:7px 11px;min-height:40px}',
    ' .lg{font-size:14px;gap:6px;padding:9px 10px}',
    ' .lg .g{margin-left:6px;font-size:12px;padding:4px 8px}',
    ' .opt{font-size:15px}',
    ' .rs40t{width:56px;min-height:56px}',
    ' .rs40sw{width:31px;min-height:31px}}'
  ].join('');document.head.appendChild(est);
}

/* ---------- (d) personas reales de la nube (vista liga_publica) ---------- */
var REM=[],fetched=false,fetching=false,cuando=0;
var STANDALONE=true;
try{STANDALONE=window.self===window.parent}catch(e){}

function cfgNube(){var c=window.RS_NUBE||{};return (c.url&&c.clave)?c:null}

function traerNube(forzar){
  if(!STANDALONE)return;
  if(!cfgNube()||!window.supabase)return;
  if(fetching)return;
  if(fetched&&!forzar&&Date.now()-cuando<60000)return;
  fetching=true;
  try{
    var c=cfgNube();
    var sb=window.supabase.createClient(c.url,c.clave);
    sb.from('liga_publica').select('nombre,liga,wk,wxp,xp,ok,tot').limit(200)
      .then(function(r){
        fetching=false;fetched=true;cuando=Date.now();
        var d=(r&&r.data)||[];
        if(r&&r.error){REM=[];return}
        var vistos={},out=[];
        d.forEach(function(f){
          var n=(f.nombre||'').trim();
          if(!n)return;
          if(vistos[n]){var v=vistos[n];if((f.wxp||0)>(v.wxp||0))vistos[n]=f;return}
          vistos[n]={n:n,liga:f.liga|0,wk:f.wk|0,wxp:f.wxp|0,xp:f.xp|0,ok:f.ok|0,tot:f.tot|0,rs:1};
          out.push(vistos[n]);
        });
        REM=out;
        repintar();
      });
  }catch(e){fetching=false}
}

function repintar(){
  try{
    if(typeof S==='undefined'||!S||S.view!=='app'||S.L)return;
    if(S.tab!=='liga'&&S.tab!=='perfil')return;
    if(typeof render!=='function')return;
    var cont=document.querySelector('main .lg');
    if(cont&&!cont.hasAttribute('data-rs41')){cont.setAttribute('data-rs41','1');render()}
  }catch(e){}
}

/* filas reales de la semana y liga indicadas, excluyendo a quien marca me */
function reales(w,l,nombreMe){
  return REM.filter(function(r){return r.wk===w&&r.liga===l&&r.n!==nombreMe});
}

/* accesor del tablero: suma las filas de la nube a las locales */
function instalarTablero(){
  var b0=null;
  try{b0=window.board}catch(e){b0=null}
  if(typeof b0!=='function'||window.board.__rs41)return;
  var board0=b0;
  window.board=function(w,l,fr,me){
    var mi=(me&&me.length)?me[me.length-1]:null;
    var nomMe=(mi&&mi.me)?mi.n:null;
    var extra=reales(w,l,nomMe).map(function(r){return{n:r.n,xp:Math.round(r.wxp*Math.max(0,fr)),rs:1}});
    return board0(w,l,fr,extra.concat(me||[]));
  };
  window.board.__rs41=1;
}

/* 10 preguntas sin audio (equivalente a sinAudio, que no es visible desde módulos) */
function preguntasSinAudio(){
  var qs=[],t;
  AR.forEach(function(a){
    var o=draw(a,null,2).filter(function(q){return !q.audio}),k=2;t=0;
    while(o.length<k&&t++<8){var x=draw(a,null,1)[0];if(x&&!x.audio&&!o.some(function(y){return y.id===x.id}))o.push(x)}
    qs=qs.concat(o);
  });
  return qs;
}

/* duelar contra una persona real (o de este dispositivo): 10 preguntas,
   el rival contesta según su precisión real registrada en la nube */
function duelar(nom){
  var u=U();
  var r=REM.filter(function(x){return x.n===nom})[0];
  var loc=Object.values(DB.users).filter(function(x){return x!==u&&x.name===nom})[0];
  var base=[.4,.55,.7][u.liga]||.4,p=base;
  if(r&&r.tot>4)p=Math.max(.25,Math.min(.85,r.ok/r.tot));
  else if(loc&&loc.tot>4)p=Math.max(.25,Math.min(.85,loc.ok/loc.tot));
  S.L=mk('duel',preguntasSinAudio(),{bn:nom,bp:p,bs:0,su:0,bl:[],rival:1});
  render();
}

function instalarAcciones(){
  try{
    if(typeof A==='undefined')return;
    var refuerzo={};
    if(!A.ptab)refuerzo.ptab=function(v){S.ptab=v;S.L=null;S.R=null;stopTTS();render()};
    refuerzo.rs41d=function(v){
      try{duelar(decodeURIComponent(v||''))}catch(e){}
    };
    Object.assign(A,refuerzo);
  }catch(e){}
}

/* ---------- refuerzo de pestañas del perfil (si el parche base faltara) ---------- */
function reforzarPestanas(){
  try{
    if(typeof S==='undefined')return;
    if(S.view==='app'&&S.tab==='perfil'&&!S.L){
      if(!S.ptab)S.ptab='prog';
      if(typeof render==='function'){
        var main=document.querySelector('main');
        if(main&&!main.querySelector('.rs41pc')){
          main.insertAdjacentHTML('afterbegin',
            '<div class="row rs41pc" style="margin-bottom:6px">'+[['perso','Personalizar'],['prog','Progreso'],['ajus','Ajustes']]
            .map(function(t){return '<button class="chip'+(S.ptab===t[0]?' on':'')+'" data-a="ptab" data-v="'+t[0]+'" aria-pressed="'+(S.ptab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>');
        }
      }
    }
  }catch(e){}
}

function instalarRender(){
  if(window.__rs41render)return;
  if(typeof render!=='function')return;
  var r0=render;
  render=function(){
    try{if(typeof S!=='undefined'&&S&&S.view==='app'&&S.tab==='perfil'&&!S.L&&!S.ptab)S.ptab='prog'}catch(e){}
    var out=r0.apply(this,arguments);
    try{
      document.body.setAttribute('data-rsptab',(typeof S!=='undefined'&&S&&S.ptab)||'');
      if(typeof S!=='undefined'&&S&&S.view==='app')traerNube(false);
      reforzarPestanas();
    }catch(e){}
    return out;
  };
  window.__rs41render=1;
}

css();
instalarAcciones();
instalarTablero();
instalarRender();

window.RS41={
  reales:reales,
  traerNube:traerNube,
  duelar:duelar,
  estado:function(){return{rem:REM.length,fetched:fetched,configurado:!!cfgNube(),standalone:STANDALONE}}
};
})();
