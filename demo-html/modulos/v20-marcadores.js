/* ---- v20: corrección v18 — la tarjeta «★ Preguntas marcadas» (marcCard) estaba definida pero nunca se montaba en el Perfil ---- */
(function(){
const inyectar=()=>{try{
 if(!window.marcCard)return;
 if(document.querySelector('[data-v20]'))return;
 const u=U();if(!u)return;
 const h=window.marcCard(u);if(!h)return;
 const env=document.createElement('div');env.setAttribute('data-v20','1');env.innerHTML=h;
 const cards=document.querySelectorAll('.card');
 let ref=null;cards.forEach(c=>{if(/Historial de sesiones/.test(c.textContent||''))ref=c});
 if(!ref)ref=cards[1]||cards[0];
 if(ref)ref.insertAdjacentElement('afterend',env);
}catch(e){}};
try{
 const R0=render;
 render=function(){const r=R0.apply(this,arguments);try{(S&&S.view==='app'&&S.tab==='perfil')&&inyectar()}catch(e){}return r};
}catch(e){}
})();