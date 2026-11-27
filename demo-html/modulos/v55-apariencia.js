/* ---- v55: camino interactivo (linea de ruta, pulso en la leccion de hoy), fondos de pantalla y selector de fondo ----
   - CSS del nuevo mapa por etapas: conectores punteados entre nodos, hover/activo con escala,
     anillo pulsante en la siguiente leccion (respeta prefers-reduced-motion).
   - Sistema de fondos: 9 fondos translucidos sobre var(--bg) via html[data-fondo]; el clasico
     (vacio) conserva el aspecto original. Se guarda en DB.pref.fondo y viaja con la nube.
   - Fila de chips de fondo en Perfil > Accesibilidad, igual que las paletas (v34.1).
   - API window.RS55={FONDOS,aplicar,fondo}. */
(function(){
'use strict';
var FONDOS=[
 ['','Cl\u00e1sico'],
 ['aurora','Aurora'],
 ['atardecer','Atardecer'],
 ['oceano','Oc\u00e9ano'],
 ['bosque','Bosque'],
 ['noche','Noche estrellada'],
 ['dunas','Dunas'],
 ['malla','Malla'],
 ['puntos','Puntos']
];
var CSS=[
 '.rs55area{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;width:100%}',
 '.rs55area .bar{width:100%}',
 '.rs55ets{gap:6px}',
 '.node{position:relative;z-index:1}',
 '.node::after{content:"";position:absolute;top:38px;left:calc(100% + 3px);width:12px;border-top:3px dashed var(--br);pointer-events:none}',
 '.node:last-child::after{display:none}',
 '.dot{transition:transform .15s ease,box-shadow .15s ease}',
 '.dot:not(.lk):hover{transform:scale(1.07)}',
 '.dot:not(:disabled):active{transform:scale(.93)}',
 '.dot.hoy{box-shadow:0 0 0 4px var(--ac)}',
 '@media(prefers-reduced-motion:no-preference){.dot.hoy{animation:rs55p 1.6s ease-in-out infinite}@keyframes rs55p{0%,100%{box-shadow:0 0 0 4px var(--ac)}50%{box-shadow:0 0 0 9px rgba(127,127,127,.18)}}}',
 'html[data-fondo="aurora"] body{background:radial-gradient(900px 500px at 15% -10%,rgba(16,185,129,.16),transparent 60%),radial-gradient(800px 500px at 90% 10%,rgba(59,130,246,.14),transparent 60%),radial-gradient(700px 400px at 50% 110%,rgba(139,92,246,.12),transparent 60%),var(--bg)}',
 'html[data-fondo="atardecer"] body{background:radial-gradient(900px 500px at 80% -10%,rgba(249,115,22,.16),transparent 60%),radial-gradient(700px 400px at 10% 0%,rgba(244,63,94,.12),transparent 55%),radial-gradient(800px 500px at 50% 110%,rgba(250,204,21,.10),transparent 60%),var(--bg)}',
 'html[data-fondo="oceano"] body{background:radial-gradient(900px 500px at 10% 0%,rgba(14,165,233,.15),transparent 60%),radial-gradient(700px 400px at 90% 100%,rgba(6,182,212,.12),transparent 55%),radial-gradient(800px 400px at 50% 50%,rgba(59,130,246,.08),transparent 65%),var(--bg)}',
 'html[data-fondo="bosque"] body{background:radial-gradient(800px 500px at 10% 10%,rgba(22,163,74,.13),transparent 60%),radial-gradient(700px 450px at 85% 90%,rgba(5,150,105,.12),transparent 55%),radial-gradient(600px 350px at 60% 20%,rgba(132,204,22,.08),transparent 60%),var(--bg)}',
 'html[data-fondo="noche"] body{background:radial-gradient(rgba(148,163,184,.4) 1px,transparent 1.6px),radial-gradient(900px 500px at 20% -10%,rgba(79,70,229,.18),transparent 60%),radial-gradient(800px 500px at 80% 110%,rgba(30,58,138,.16),transparent 60%),var(--bg);background-size:30px 30px,auto,auto,auto}',
 'html[data-fondo="dunas"] body{background:radial-gradient(1000px 500px at 20% 120%,rgba(217,119,6,.14),transparent 60%),radial-gradient(900px 450px at 90% 110%,rgba(180,83,9,.12),transparent 55%),radial-gradient(700px 400px at 50% -20%,rgba(250,204,21,.10),transparent 60%),var(--bg)}',
 'html[data-fondo="malla"] body{background:repeating-linear-gradient(0deg,rgba(100,116,139,.09) 0 1px,transparent 1px 28px),repeating-linear-gradient(90deg,rgba(100,116,139,.09) 0 1px,transparent 1px 28px),var(--bg)}',
 'html[data-fondo="puntos"] body{background:radial-gradient(rgba(100,116,139,.18) 1.5px,transparent 2px),var(--bg);background-size:26px 26px,auto}'
];
try{
  var st=document.createElement('style');st.id='rs55css';
  st.textContent=CSS.join('');
  document.head.appendChild(st);
}catch(e){}
if(window.self===window.parent){
  function fondoAct(){try{return (DB.pref&&DB.pref.fondo)||''}catch(e){return ''}}
  function aplicar(){try{document.documentElement.setAttribute('data-fondo',fondoAct())}catch(e){}}
  function inyectar(){
    try{
      if(!(S&&S.view==='app'&&S.tab==='perfil'))return;
      if(document.getElementById('rs55fondos'))return;
      var ancla=document.querySelector('.card button[data-a="th"]');
      if(!ancla)return;
      var card=ancla.closest('.card');if(!card)return;
      var act=fondoAct();
      var fila=FONDOS.map(function(f){
        var on=f[0]===act?' on':'';
        return '<button class="chip'+on+'" data-a="rs55f" data-v="'+f[0]+'" title="Fondo '+f[1]+'">'+f[1]+'</button>';
      }).join('');
      card.insertAdjacentHTML('beforeend','<div class="row" id="rs55fondos" style="margin-top:8px;flex-wrap:wrap"><b style="width:100%">Fondo</b>'+fila+'</div>');
    }catch(e){}
  }
  try{
    A.rs55f=function(v){try{
      var val=String(v==null?'':v).slice(0,16),ok=false;
      for(var i=0;i<FONDOS.length;i++)if(FONDOS[i][0]===val)ok=true;
      if(!ok)val='';
      DB.pref=DB.pref||{};DB.pref.fondo=val;save();aplicar();render();
    }catch(e){}};
  }catch(e){}
  try{
    var _r55=render;
    render=function(){var r=_r55.apply(this,arguments);
      try{aplicar()}catch(e){}
      try{(S&&S.view==='app'&&S.tab==='perfil')&&setTimeout(inyectar,0)}catch(e){}
      return r};
  }catch(e){}
  aplicar();
  window.RS55={FONDOS:FONDOS,aplicar:aplicar,fondo:fondoAct};
}
})();
