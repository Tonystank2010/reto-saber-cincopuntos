/* ---- v22: traspaso de progreso con código (método práctico además del archivo) ----
   Método práctico para pasar el progreso a otro dispositivo o navegador:
   1) Genera un código «RS1.» comprimido con la cuenta actual.
   2) Se copia el código o un enlace #rstr=… (WhatsApp/correo/Notas).
   3) En el otro dispositivo se pega en Perfil, o se abre el enlace y la app lo ofrece aplicar.
   Reutiliza impCuenta() y KP del demo para validar y aplicar la misma estructura
   que el respaldo por archivo (cbx/cbi). */
(function(){
'use strict';
const P='RS1', LIM=65000;
const chk=t=>{let r=0;for(let i=0;i<t.length;i++)r=(r*31+t.charCodeAt(i))%1679616;let x=r.toString(36).toUpperCase();while(x.length<4)x='0'+x;return x};
function iniE(){const d=new Map();for(let i=0;i<256;i++)d.set(String.fromCharCode(i),i);return[d,256]}
function iniD(){const d=new Map();for(let i=0;i<256;i++)d.set(i,String.fromCharCode(i));return[d,256]}
function lzwC(t){let[d,n]=iniE(),w='',out=[];for(let i=0;i<t.length;i++){const ch=t[i],wc=w+ch;if(d.has(wc)){w=wc;continue}out.push(d.get(w));if(n<LIM){d.set(wc,n++)}else{[d,n]=iniE()}w=ch}if(w)out.push(d.get(w));return out}
function lzwD(codes){let[d,n]=iniD(),w=null,out='';for(let i=0;i<codes.length;i++){const c=codes[i];let e;
 if(d.has(c))e=d.get(c);else if(c===n&&w!==null)e=w+w[0];else return null;
 out+=e;if(w!==null){if(n<LIM){d.set(n++,w+e[0])}else{[d,n]=iniD()}}w=e}return out}
function lzwP(codes){let s='';for(let i=0;i<codes.length;i+=1024){let b='';const cs=codes.slice(i,i+1024);for(let j=0;j<cs.length;j++){const c=cs[j];b+=String.fromCharCode((c>>8)&255,c&255)}s+=b}return s}
function codigo() {
  const u=U();if(!u)return null;
  const c={};KP.forEach(k=>{if(u[k]!==undefined&&k!=='name')c[k]=u[k]});
  c.name=u.name;
  /* v22.1: los literales del compresor van de U+0000 a U+00FF; todo carácter mayor
     (p. ej. el «−» U+2212 de las explicaciones de Matemáticas) se escapa como \uXXXX
     antes de comprimir, para que el JSON descomprimido sea idéntico en ambos lados. */
  const t=JSON.stringify({reto_saber:'cuenta',version:1,cuenta:c}).replace(/[\u0100-\uFFFF]/g,ch=>'\\u'+ch.charCodeAt(0).toString(16).padStart(4,'0'));
  const body=(()=>{let b=lzwP(lzwC(t));try{b=window.btoa?btoa(b):Buffer.from(b,'binary').toString('base64')}catch(e){return null}return b})().replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  if(body===null||body.length>200000)return'GRANDE';
  return P+'.'+body+'.'+chk(t);
}
function decodifica(crudo){
 crudo=String(crudo==null?'':crudo).trim().replace(/\s+/g,'');
 if(crudo.indexOf(P+'.')!==0)return{err:'El código no tiene el formato de traspaso de Reto Saber (debe empezar por «'+P+'.»).'};
 const p=crudo.split('.');if(p.length!==3||!p[1])return{err:'El código está incompleto: revisa que se haya copiado completo.'};
 let b=p[1].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';
 let bytes;try{bytes=window.atob?atob(b):Buffer.from(b,'base64').toString('binary')}catch(e){return{err:'El código está dañado (no se pudo leer). Vuelve a generarlo.'}}
 if(bytes.length%2)return{err:'El código está dañado (longitud inválida). Vuelve a generarlo.'};
 const cs=[];for(let i=0;i<bytes.length;i+=2)cs.push((bytes.charCodeAt(i)<<8)|bytes.charCodeAt(i+1));
 const t=lzwD(cs);if(t===null)return{err:'El código está dañado (no se pudo descomprimir). Vuelve a generarlo.'};
 if(chk(t)!==p[2])return{err:'El código alteró su contenido o está incompleto. No lo reescribas a mano: pulsa «Generar mi código» otra vez y usa el botón «Copiar código» o el enlace.'};
 let o=null;try{o=JSON.parse(t)}catch(e){}
 if(!o||o.reto_saber!=='cuenta'||!o.cuenta)return{err:'El código no contiene una cuenta de Reto Saber válida.'};
 return{cuenta:o.cuenta};
}
function aplicarTexto(txt,sinConfirm){
 const r=decodifica(txt);
 if(r.err){S.t22m='⚠️ '+r.err;S.t22me=1;render();return false}
 const c=r.cuenta,em=String(c.email||'').toLowerCase();
 if(!sinConfirm){let ok=true;try{ok=confirm('¿Aplicar el traspaso de la cuenta «'+(c.name||'')+'» ('+em+', '+ (c.xp||0)+' XP) en este dispositivo? Tu progreso local de ese correo se reemplazará.')}catch(e){ok=!DB.users[em]}if(!ok)return false}
 const m=impCuenta({reto_saber:'cuenta',version:1,cuenta:c});
 if(m&&String(m).indexOf('Cuenta cargada')!==0){S.t22m='⚠️ '+m;S.t22me=1;render();return false}
 S.t22m='✅ Traspaso aplicado: '+(c.name||'')+'. Tu progreso ya está en este dispositivo.';
 S.t22me=0;S.t22c='';S.t22l='';render();
 return true;
}
function enlace(crudo){const c=decodifica(crudo);if(c.err)return null;return (location.href.split('#')[0])+'#rstr='+String(crudo).replace(/\s+/g,'')}
/* ---- tarjeta en el Perfil, después de la tarjeta de copia de seguridad ---- */
function tarjeta(){return `<div class="card" data-v22="1"><b>📲 Traspasar progreso con un código</b><p class="mu">Forma práctica de llevar tu progreso a otro dispositivo o navegador, sin archivos ni cuentas de nube. <b>1)</b> Genera tu código aquí. <b>2)</b> Cópialo o manda el <em>enlace</em> por WhatsApp, correo o Notas. <b>3)</b> En el otro dispositivo, ábrelo en este mismo juego y pégalo abajo; si abriste el enlace, la app misma te ofrecerá aplicarlo.</p><div class="row"><button class="g" data-a="t22g">1 · Generar mi código</button>${S.t22c?`<button class="g" data-a="t22cc">Copiar código</button><button class="g" data-a="t22ec">Copiar enlace</button>`:''}</div>${S.t22c?`<textarea readonly id="t22q" style="width:100%;min-height:80px;font-size:11px" onclick="this.select()">${esc(S.t22c)}</textarea><p class="mu">Código de ${S.t22c.length} caracteres generados a partir de tu cuenta ${esc(String(U()&&U().name||''))}. Incluye progreso, racha, insignias, errores para repasar y ajustes. Guárdalo privado: contiene tu correo.</p>`:''}<p class="mu"><b>2 · ¿Estás en el otro dispositivo?</b> Pega aquí el código que generaste:</p><textarea id="t22v" style="width:100%;min-height:70px;font-size:11px" placeholder="${P}.…">${esc(S.t22v||'')}</textarea><div class="row"><button class="g" data-a="t22a">3 · Aplicar el código</button></div>${S.t22m?`<p class="${S.t22me?'err':'mu'}">${esc(S.t22m)}</p>`:''}</div>`}
function inyectar(){try{
 if(document.querySelector('[data-v22]'))return;
 const cards=document.querySelectorAll('.card');let ref=null;
 cards.forEach(c=>{if(/Copia de seguridad de mi cuenta/.test(c.textContent||''))ref=c});
 if(!ref)return;
 const env=document.createElement('div');env.setAttribute('data-v22c','1');env.innerHTML=tarjeta();
 ref.insertAdjacentElement('afterend',env);
}catch(e){}}
function copiar(t,elem){const fin=()=>{S.t22m='✅ Copiado. Pégalo en el otro dispositivo (o mándalo por WhatsApp/correo).';S.t22me=0;render()};
 try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(fin,()=>{fin()});return}}catch(e){}
 try{if(elem){elem.focus();elem.select();document.execCommand('copy');fin();return}}catch(e){}
 S.t22m='⚠️ No se pudo copiar automáticamente: selecciona el código y cópialo a mano (Ctrl/Cmd+C).';S.t22me=1;render()}
try{Object.assign(A,{
 't22g':()=>{const c= codigo(); if(c==='GRANDE'){S.t22c='';S.t22m='⚠️ Tu progreso es muy grande para un código. Usa «Descargar mi copia» (archivo) que está justo arriba.';S.t22me=1;render();return}if(!c){S.t22c='';S.t22m='⚠️ No hay una cuenta activa de la cual generar el código.';S.t22me=1;render();return}S.t22c=c;S.t22l=enlace(c);S.t22m='';render()},
 't22cc':()=>{if(S.t22c)copiar(S.t22c,document.getElementById('t22q'))},
 't22ec':()=>{if(S.t22l)copiar(S.t22l)},
 't22a':()=>{const el=document.getElementById('t22v');aplicarTexto(el?el.value:'', false)}
})}catch(e){}
try{const R0=render;render=function(){const r=R0.apply(this,arguments);try{(S&&S.view==='app'&&S.tab==='perfil')&&inyectar()}catch(e){}return r}}catch(e){}
/* enlace de traspaso (#rstr=…) */
try{const h=location.hash||'';
 if(h.indexOf('#rstr=')===0){
   const crudo=decodeURIComponent(h.slice(6));
   try{try{history.replaceState&&history.replaceState(null,'',location.pathname+location.search)}catch(e){}}catch(e){}
   aplicarTexto(crudo,false);
 }
}catch(e){}
/* API para pruebas e integración */
try{window.RS22={generar: codigo, decodificar:decodifica, aplicar:(t,sc)=>aplicarTexto(t,!!sc), enlace:(t)=>enlace(t), tarjeta:()=>tarjeta(), lzwC, lzwD}}catch(e){}
})();
