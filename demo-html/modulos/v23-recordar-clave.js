/* ---- v23: recordar contraseña en el dispositivo + sesión en otro dispositivo ----
   1) Al crear cuenta o entrar, guarda la contraseña solo en ESTE dispositivo (DB.rec).
      Nunca viaja: ni en el código de traspaso (v22), ni en la copia por archivo, ni en el puente.
   2) En la pantalla de entrar muestra «Entrar como <nombre>» para no volver a escribirla.
   3) Tras aplicar un código de traspaso en otro dispositivo, la cuenta llega con su
      hash y sal: el mismo correo + la misma contraseña entran en ese dispositivo. */
(function(){
'use strict';
const guardar=(em,pw)=>{try{if(em&&pw&&pw.length>=6)DB.rec={em:String(em).trim().toLowerCase(),pw:String(pw)};save()}catch(e){}};
const olvidar=()=>{try{delete DB.rec;save()}catch(e){}};
const pwActual=()=>{const el=document.getElementById('pw');return el?(el.value||''):''};
/* 1 · guardar al crear cuenta */
try{const NEW0=A.new;A.new=async function(){const pw0=pwActual();const r=await NEW0.apply(this,arguments);
 try{if(S.view==='app'&&DB.cur)guardar(DB.cur,pw0)}catch(e){}return r}}catch(e){}
/* 2 · guardar al entrar con la contraseña escrita */
try{const IN0=A.in;A.in=async function(){const em0=(document.getElementById('em')||{}).value||'',pw0=pwActual();
 const r=await IN0.apply(this,arguments);
 try{if(S.view==='app'&&DB.cur)guardar(DB.rec&&String(DB.rec.em)===String(em0).trim().toLowerCase()?(DB.rec.em):em0,pw0)}catch(e){}return r}}catch(e){}
/* 3 · acciones del usuario */
try{Object.assign(A,{
 'rcl':async()=>{const r=DB.rec;if(!r)return;const em=document.getElementById('em'),pw=document.getElementById('pw');S.at='in';
  if(em)em.value=r.em;if(pw)pw.value=r.pw;await A.in()},
 'rol':()=>{olvidar();S.err='';render()},
 'rco':()=>{S.v23o=S.v23o?0:1;render()},
 'rap':()=>{const el=document.getElementById('v23t');const t=el?el.value:'';if(!t)return;
  const r=window.RS22?RS22.aplicar(t,false):null;if(r===false&&!S.t22m&&el)el.value=t}
})}catch(e){}
/* 4 · tarjeta en la pantalla de entrar */
function registra(){try{
 if(!S||S.view!=='auth'||S.at!=='in')return;
 if(document.querySelector('[data-v23]'))return;
 const cont=document.querySelector('#app main');if(!cont)return;
 const rec=DB.rec,ante=rec&&DB.users[rec.em];
 let h='';
 if(ante)h+=`<div class="card" data-v23="1"><b>🔐 Contraseña guardada en este dispositivo</b><p class="mu">Hola, <b>${esc(ante.name)}</b> (${esc(rec.em)}). Puede entrar sin escribir su contraseña.</p><div class="row"><button class="g" data-a="rcl">Entrar como ${esc(ante.name)}</button><button class="g" data-a="rol">Olvidar contraseña guardada</button></div></div>`;
 h+=`<div class="card" data-v23="1"><b>📱 ¿Traspasaste tu progreso de otro dispositivo?</b><p class="mu">Cuando apliques aquí un código de traspaso (Perfil → «Generar mi código» en el dispositivo viejo), tu cuenta llega completa y vas a poder <b>entrar en este dispositivo con el mismo correo y la misma contraseña</b>. Pégalo abajo si ya lo tienes:</p>${S.v23o?`<textarea id="v23t" style="width:100%;min-height:60px;font-size:11px" placeholder="RS1.…"></textarea><div class="row"><button class="g" data-a="rap">Aplicar el código de traspaso</button></div>`:`<div class="row"><button class="g" data-a="rco">Pegar código de traspaso</button></div>`}</div>`;
 if(!h)return;
 const env=document.createElement('div');env.setAttribute('data-v23c','1');env.innerHTML=h;
 const ref=cont.querySelector('.card');
 (ref||cont).insertAdjacentElement(ref?'afterend':'afterbegin',env);
}catch(e){}}
try{const R0=render;render=function(){const r=R0.apply(this,arguments);try{(S&&S.view==='auth')&&registra()}catch(e){}return r}}catch(e){}
/* API de pruebas */
try{window.RS23={guardar:(e,p)=>guardar(e,p),olvidar:()=>olvidar(),rec:()=>DB.rec||null}}catch(e){}
})();
