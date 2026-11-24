/* ---- v48: recordatorio del plan nocturno ----
   Si la app queda abierta, avisa sin que tengas que refrescar:
   - a partir de las 19:00, si el plan de manana todavia no se ha armado,
     invita a verlo (el plan se arma en cuanto el render lo nota, pero
     si la pestana esta quieta nadie lo provoca);
   - a partir de las 20:00, si el plan de manana ya esta armado pero
     tiene bloques pendientes, lo recuerda una vez al dia.
   Nadie guarda estado en el usuario: es un aviso de sesion (una vez por
   dia). API: window.RS48 (revisar/hora/estado), window.RS48HORA para
   fijar la hora en pruebas. Sin emojis. */
(function(){
'use strict';
if(typeof window==='undefined')return;

var aviso=null;/* dia ya avisado (lo que se hizo hoy) */
function hora(){
  try{if(window.RS48HORA!=null)return +window.RS48HORA}catch(e){}
  try{return new Date().getHours()}catch(e){return 12}
}

function revisar(){
  try{
    if(!(typeof S!=='undefined'&&S&&S.view==='app'))return 0;
    if(S.L||S.R)return 0;
    if(!window.RS44||!window.RS44.diaPlan)return 0;
    var u=U();if(!u)return 0;
    var h=hora(),diap=RS44.diaPlan()|0,cons=(h>=19?'1':'')+(h>=20?'2':'');
    if(!cons)return 0;
    var pn=u.pn;
    if(!pn||((pn.d|0)!==diap)){
      if(aviso===1+diap*10)return 0;
      aviso=1+diap*10;
      try{say('Son las '+h+' h: ya se puede armar tu plan nocturno para manana. Un vistazo al Camino y listo.')}catch(e){}
      return 1;
    }
    if(!pn.r&&(pn.h||[]).some(function(x){return !x})){
      if(aviso===2+diap*10)return 0;
      aviso=2+diap*10;
      var faltan=(pn.h||[]).filter(function(x){return !x}).length;
      try{say('Tu plan nocturno para manana tiene '+faltan+' bloque'+(faltan===1?'':'s')+' pendiente'+(faltan===1?'':'s')+'. Aun estas a tiempo.')}catch(e){}
      return 2;
    }
    return 0;
  }catch(e){return 0}
}

try{
  if(typeof render==='function'){
    var _r48=render;
    render=function(){var r=_r48.apply(this,arguments);try{(S.L||S.R)?0:revisar()}catch(e){}return r};
  }
  setTimeout(function(){try{revisar()}catch(e){}},2000);
  setInterval(function(){try{revisar()}catch(e){}},60000);
}catch(e){}

window.RS48={revisar:revisar,hora:hora,estado:function(){return{aviso:aviso}}};
})();
