/* ---- v50: voz en pesos colombianos en TODA la app ----
   v43 trajo la narracion de cuentos hablando el dinero como pesos
   colombianos. Este modulo lleva ese mismo tratamiento a todas las
   voces de la aplicacion: enunciados, explicaciones, avisos y cualquier
   texto que la voz lea en espanol.
   Como: envuelve speechSynthesis.speak; si la utterance va en idioma
   espanol, pasa su texto por el helper vozPesos del demo (idempotente:
   los pesos ya dichos no se duplican), igual que en cuentos.
   El audio en ingles (escuchar preguntas) no se toca.
   API window.RS50={estado}. */
(function(){
'use strict';
if(typeof window==='undefined')return;
function listo(){
  try{
    var ss=window.speechSynthesis;
    if(!ss||ss.__rs50)return;
    var orig=ss.speak.bind(ss);
    ss.speak=function(u){
      try{
        if(u&&typeof u.text==='string'&&String(u.lang||'').toLowerCase().indexOf('es')===0
           &&window.RS43&&RS43.vozPesos){
          var t=RS43.vozPesos(u.text);
          if(t!==u.text)u.text=t;
        }
      }catch(e){}
      return orig(u);
    };
    ss.__rs50=1;
  }catch(e){}
}
listo();
window.RS50={estado:function(){
  try{var ss=window.speechSynthesis;
    return {activo:!!(ss&&ss.__rs50),hayVozPesos:!!(window.RS43&&RS43.vozPesos)};
  }catch(e){return {activo:false,hayVozPesos:false}}
}};
})();
