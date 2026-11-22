/* ---- v25: descargar el juego como archivo (ejecutable fuera de línea) ----
   Añade en el Perfil una tarjeta con el botón «Descargar el juego (un solo archivo)».
   • En http(s): descarga el HTML exacto publicado (fetch de location.href).
   • Si fetch falla (sin conexión o desde file://): serializa el documento vivo.
   El archivo descargado se abre con doble clic y funciona sin internet. */
(function(){
'use strict';
function descargarJuego(){
 const nombre='Reto-Saber-Demo.html';
 const guardar=t=>{
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([t],{type:'text/html'}));
  a.download=nombre;document.body.appendChild(a);a.click();
  setTimeout(()=>{try{a.remove();URL.revokeObjectURL(a.href)}catch(e){}},1500);
 };
 const fin=ms=>{S.t25m=ms;S.t25e=0;render()};
 const mal=ms=>{S.t25m=ms;S.t25e=1;render()};
 let ok=false;
 try{
  if(location.protocol.indexOf('http')===0){
   (async()=>{
    try{
     const r=await fetch(location.href.split('#')[0]);
     if(r.ok){guardar(await r.text());ok=true;fin('✅ Juego descargado ('+nombre+'). Ábrelo con doble clic cuando no tengas internet.')}
    }catch(e){}
    if(!ok){
     guardar('<!DOCTYPE html>\n'+document.documentElement.outerHTML);
     fin('✅ Copia guardada desde la versión activa ('+nombre+').');
    }
   })();
  }else{
   guardar('<!DOCTYPE html>\n'+document.documentElement.outerHTML);
   fin('✅ Copia guardada ('+nombre+'). Ya estás usando el juego como archivo local.');
  }
 }catch(e){mal('⚠️ No se pudo generar el archivo en este navegador. Usa «Guardar página como…» (Ctrl/Cmd+S).')}
}
try{Object.assign(A,{'t25d':descargarJuego})}catch(e){}
function tarjeta(){return `<div class="card" data-v25="1"><b>💾 Descargar el juego</b><p class="mu">Guarda Reto Saber como un solo archivo HTML para jugar sin internet en cualquier computador o tablet: doble clic y listo, ni siquiera necesita navegador en línea. Para computador con app propia (Windows/Mac/Linux), mira la carpeta «desktop» del repositorio.</p>${S.t25m?`<p class="${S.t25e?'err':'mu'}">${esc(S.t25m)}</p>`:''}<div class="row"><button class="g" data-a="t25d">Descargar el juego (un solo archivo)</button></div></div>`}
function instalar(){try{
 if(!S||S.view!=='app'||S.tab!=='perfil')return;
 if(document.querySelector('[data-v25]'))return;
 let ref=document.querySelector('.card[data-v22]');
 if(!ref){const cards=document.querySelectorAll('.card');cards.forEach(c=>{if(/Copia de seguridad de mi cuenta/.test(c.textContent||''))ref=c})}
 if(!ref)return;
 const env=document.createElement('div');env.setAttribute('data-v25c','1');env.innerHTML=tarjeta();
 ref.insertAdjacentElement('afterend',env);
}catch(e){}}
try{const R0=render;render=function(){const r=R0.apply(this,arguments);try{instalar()}catch(e){}return r}}catch(e){}
try{window.RS25={descargar:()=>descargarJuego()}}catch(e){}
})();
