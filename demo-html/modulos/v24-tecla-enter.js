/* ---- v24: tecla Enter ----
   1) En el formulario de entrar/crear cuenta, la tecla Enter envía el formulario
      (Entrar o Crear cuenta y jugar). Con un pequeño anti-doble-envío.
   2) En el textarea del código de traspaso, Ctrl/Cmd+Enter aplica el código.
   No modifica nada del demo original: solo agrega un listener global. */
(function(){
'use strict';
let ult=0;
document.addEventListener('keydown',function(e){
 try{
  if(!e||e.key!=='Enter')return;
  const el=e.target,tag=(el&&el.tagName||'').toLowerCase();
  /* Ctrl/Cmd+Enter en un textarea de traspaso → aplicar el código */
  if((e.ctrlKey||e.metaKey)&&tag==='textarea'){
   const idA=el.id==='t22v'?'t22a':(el.id==='v23t'?'rap':null);
   if(idA){const b=document.querySelector('[data-a="'+idA+'"]');if(b){e.preventDefault();b.click()}}
   return}
  if(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)return;
  /* Enter dentro de los campos del formulario de autenticación → enviar */
  if(typeof S!=='undefined'&&S&&S.view==='auth'&&tag==='input'&&(el.id==='em'||el.id==='pw'||el.id==='nm')){
   if(e.isComposing)return;
   if(Date.now()-ult<800){e.preventDefault();return}   /* anti doble envío */
   ult=Date.now();
   const b=document.querySelector(S.at==='new'?'[data-a="new"]':'[data-a="in"]');
   if(b){e.preventDefault();b.click()}
  }
 }catch(e){}
});
})();
