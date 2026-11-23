/* ---- v34.1: selector de paleta de colores ----
   5 paletas ed-tech; el estudiante elige la suya en Perfil > Accesibilidad.
   - Se guarda en DB.pref.pal y viaja con la nube (DB.pref se sincroniza completo en v27).
   - Se aplica como custom properties en :root (inline), pisando las del CSS v34.
   - Respeta el tema: en oscuro usa la variante luminosa de cada paleta.
   - La paleta '' (vacio) es la actual de fabrica (indigo->violeta); un id
     desconocido (p. ej. traido de otro dispositivo viejo) cae a la de fabrica. */
(function(){
'use strict';
if(window.self!==window.parent)return;

var PALETAS=[
 {id:'violeta', nombre:'Indigo',   ac:'#4f46e5', ac2:'#7c3aed', acD:'#818cf8', ac2D:'#a78bfa'},
 {id:'azul',    nombre:'Azul oceano', ac:'#2563eb', ac2:'#06b6d4', acD:'#60a5fa', ac2D:'#22d3ee'},
 {id:'esmeralda',nombre:'Esmeralda', ac:'#059669', ac2:'#10b981', acD:'#34d399', ac2D:'#6ee7b7'},
 {id:'coral',   nombre:'Coral',    ac:'#ea580c', ac2:'#f59e0b', acD:'#fb923c', ac2D:'#fbbf24'},
 {id:'magenta', nombre:'Magenta',  ac:'#db2777', ac2:'#fb7185', acD:'#f472b6', ac2D:'#fda4af'}
];

function paletaAct(){
  try{
    var id=(DB.pref&&DB.pref.pal)||'';
    if(!id)return null;
    for(var i=0;i<PALETAS.length;i++)if(PALETAS[i].id===id)return PALETAS[i];
  }catch(e){}
  return null;
}
function esOscuro(){
  try{
    var th=(DB.pref&&DB.pref.th)||'';
    if(th==='dark')return true;
    if(th==='light')return false;
    return !!(window.matchMedia&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  }catch(e){return false}
}
function aplicar(){
  try{
    var p=paletaAct(),r=document.documentElement,st=r.style;
    if(!p){
      ['--ac','--ac2','--grad','--shA'].forEach(function(k){st.removeProperty(k)});
      return;
    }
    var osc=esOscuro();
    var ac=osc?p.acD:p.ac, ac2=osc?p.ac2D:p.ac2;
    st.setProperty('--ac',ac);
    st.setProperty('--ac2',ac2);
    st.setProperty('--grad','linear-gradient(135deg,'+ac+','+ac2+')');
    st.setProperty('--shA','0 2px 8px '+ac+'59');
  }catch(e){}
}

/* fila de chips de paleta en la tarjeta de Accesibilidad (Perfil) */
function inyectar(){
  try{
    if(!(S&&S.view==='app'&&S.tab==='perfil'))return;
    if(document.getElementById('rs341fila'))return;
    var ancla=document.querySelector('.card button[data-a="th"]');
    if(!ancla)return;
    var card=ancla.closest('.card');if(!card)return;
    var act=(DB.pref&&DB.pref.pal)||'';
    var fila=PALETAS.map(function(p){
      var on=(p.id==='violeta'?'':p.id)===act?' on':'';
      return '<button class="chip'+on+'" data-a="pal" data-v="'+p.id+'" title="Paleta '+p.nombre+'">'
        +'<span aria-hidden="true" style="display:inline-block;width:12px;height:12px;border-radius:50%;'
        +'background:linear-gradient(135deg,'+p.ac+','+p.ac2+');vertical-align:-1px;margin-right:6px"></span>'
        +p.nombre+'</button>';
    }).join('');
    card.insertAdjacentHTML('beforeend','<div class="row" id="rs341fila" style="margin-top:8px">'+fila+'</div>');
  }catch(e){}
}

function fijar(id){
  try{
    var val=(id==='violeta')?'':String(id).slice(0,16);
    if(val&&id!=='violeta'){
      var ok=false;for(var i=0;i<PALETAS.length;i++)if(PALETAS[i].id===id)ok=true;
      if(!ok)val='';
    }
    DB.pref=DB.pref||{};DB.pref.pal=val;save();aplicar();render();
  }catch(e){}
}

try{
  var _th341=A.th;
  A.th=function(){var r=_th341.apply(this,arguments);try{(S&&S.view==='app')&&aplicar()}catch(e){}return r};
}catch(e){}

try{
  var _r341=render;
  render=function(){var r=_r341.apply(this,arguments);
    try{aplicar()}catch(e){}
    try{(S&&S.view==='app'&&S.tab==='perfil')&&setTimeout(inyectar,0)}
    catch(e){}
    return r};
}catch(e){}

try{setTimeout(function(){try{aplicar();inyectar()}catch(e){}},0)}catch(e){}

try{
  if(window.matchMedia){
    var mq=window.matchMedia('(prefers-color-scheme: dark)');
    var fn=function(){try{aplicar()}catch(e){}};
    if(mq.addEventListener)mq.addEventListener('change',fn);
    else if(mq.addListener)mq.addListener(fn);
  }
}catch(e){}

try{Object.assign(A,{pal:function(v){fijar(v)}})}catch(e){}

/* API minima para pruebas */
window.RS341={paletas:PALETAS,aplicar:aplicar,paletaAct:paletaAct,esOscuro:esOscuro};
})();
