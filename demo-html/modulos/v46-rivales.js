/* ---- v46: rival sugerido y marcador de duelos entre personas reales ----
   En la Liga aparece una tarjeta que:
   - sugiere el rival de tu semana y liga cuyo XP semanal esta mas cerca
     del tuyo (rivales reales de la nube o cuentas de tu dispositivo);
   - guarda tu marcador contra cada rival (victorias/derrotas/empates)
     y lo muestra; los retos usan el boton Duelo de siempre (v41),
     asi que el match se juega con la precision real del rival.
   El marcador vive en u.riv (diccionario por nombre); los datos del
   usuario viajan completos en la nube (v27), nada extra que cuidar.
   API: window.RS46. Sin emojis: todo SVG propio (v35). */
(function(){
'use strict';
if(typeof window==='undefined')return;

/* ---------- CSS ---------- */
function css(){
  if(document.getElementById('rs46css'))return;
  var est=document.createElement('style');est.id='rs46css';
  est.textContent=[
   '.rs46{margin:10px 0}',
   '.rs46 .card b{font-size:16px}',
   '.rs46r{display:flex;align-items:center;gap:10px;border:1px solid var(--br);border-radius:14px;padding:9px 12px;margin-top:8px;min-width:0}',
   '.rs46r .ic{flex:0 0 auto;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--ac);color:var(--ac-tx,#fff)}',
   '.rs46r .ic svg{width:17px;height:17px}',
   '.rs46r .tx{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}',
   '.rs46r .tx b{display:block;font-size:14.5px}',
   '.rs46r .tx span{font-size:12.5px;opacity:.75}',
   '.rs46r .bt{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;border:0;background:var(--ac);color:var(--ac-tx,#fff);border-radius:999px;padding:8px 13px;font-weight:800;font-size:13.5px;cursor:pointer}',
   '.rs46r .bt svg{width:14px;height:14px}',
   '.rs46m{margin:8px 0 0;font-size:12.5px;opacity:.75;overflow-wrap:anywhere}'
  ].join('');
  document.head.appendChild(est);
}
function I(n){try{return(window.RS35&&RS35.ico(n))||''}catch(e){return''}}

/* ---------- candidatos: reales de la nube + cuentas locales de la misma liga/semana ---------- */
function candidatos(u){
  var w=wk(),l=u.liga|0,out=[],visto={};
  function add(n,wx,rs){
    n=String(n||'').trim();if(!n||n===u.name||visto[n])return;
    seen(visto,n);out.push({n:n,wxp:wx|0,rs:!!rs});
  }
  try{
    if(window.RS41&&RS41.reales)RS41.reales(w,l,u.name).forEach(function(r){add(r.n,r.wxp,r.rs===1)});
  }catch(e){}
  try{
    Object.values(DB.users).forEach(function(x){
      if(x===u||x.name===u.name)return;
      if((x.liga|0)===l&&x.wk===w)add(x.name,x.wxp,false);
    });
  }catch(e){}
  return out;
}
function seen(v,n){v[n]=1}

function marcadorRival(u){
  try{var r=u.riv;return (r&&typeof r==='object')?r:{}}catch(e){return{}}
}
/* texto del marcador contra un rival: '2V · 1D · 1E' */
function miniMarc(u,n){
  var m=marcadorRival(u)[n];if(!m)return'';
  return m.w+'V'+(m.l?'\u00b7 '+m.l+'D':'')+(m.e?'\u00b7 '+m.e+'E':'');
}

/* ---------- tarjeta inyectada en la Liga ---------- */
function tarjeta(){
  var u=U();
  var cands=candidatos(u);
  cands.sort(function(a,b){
    var da=Math.abs(a.wxp-(u.wxp|0)),db=Math.abs(b.wxp-(u.wxp|0));
    return (da-db)||(b.wxp-a.wxp);
  });
  var filas=cands.slice(0,3).map(function(c,i){
    var suf=i===0?' — tu nivel de XP ahora mismo':'';
    var mm=miniMarc(u,c.n);
    return '<div class="rs46r"><span class="ic">'+I(c.rs?'duelo':'movil')+'</span>'
      +'<span class="tx"><b>'+esc(c.n)+'</b><span>'
      +(c.rs?'Rival real (nube)':'De este dispositivo')
      +' \u00b7 '+ (c.wxp) +' XP de la semana'+suf+(mm?' | marcador '+mm:'')+'</span></span>'
      +'<button class="bt" data-a="rs41d" data-v="'+encodeURIComponent(c.n)+'" title="Duelo contra '+esc(c.n)+'">'+I('duelo')+' Duelo</button></div>';
  }).join('');
  if(!filas){
    filas='<div class="rs46r"><span class="tx"><b>Aun no hay rivales disponibles</b><span>Entra a la nube con otra cuenta (o crea usuarios en este dispositivo, mismo liga) y aca aparecen sus datos reales para duelar.</span></span></div>';
  }
  var d=(u.duel&&typeof u.duel==='object')?u.duel:{w:0,n:0};
  var total=d.n|0,gan=d.w|0;
  var resumen='<p class="rs46m">Tus duelos: <b>'+gan+'</b> de <b>'+total+'</b> '+(total===1?'ganado':'ganados')+'. El rival responde con su precision real: ganarle es ganarle de verdad.</p>';
  return '<section class="rs46" data-rs46="1"><div class="card"><b>'+I('duelo')+' Rival sugerido</b>'
    +filas+resumen+'</div></section>';
}
function inyectar(){
  try{
    if(!(S&&S.view==='app'&&S.tab==='liga'&&!S.L&&!S.R))return;
    if(typeof U!=='function')return;
    var u=U();if(!u)return;
    var main=document.querySelector('main');if(!main)return;
    var t=main.querySelector('[data-rs46]');
    var html=tarjeta();
    if(t){if(t.outerHTML!==html)t.outerHTML=html;return}
    var ancla=main.querySelector('.top')||main.firstChild;
    if(ancla&&ancla.insertAdjacentHTML)ancla.insertAdjacentHTML('afterend',html);
  }catch(e){}
}

/* ---------- marcador personal: se llena al terminar cada duelo ---------- */
function registrar(resultado,rival){
  try{
    var u=U();if(!u||!rival)return;
    if(!(u.riv&&typeof u.riv==='object'&&!Array.isArray(u.riv)))u.riv={};
    var m=u.riv[rival]||{w:0,l:0,e:0};
    if(resultado==='w')m.w=(m.w|0)+1;else if(resultado==='l')m.l=(m.l|0)+1;else m.e=(m.e|0)+1;
    u.riv[rival]=m;
    save();
  }catch(e){}
}
/* al terminar un duelo (L.kind==='duel' con L.end): registra una vez */
function chequearDuelo(){
  try{
    var L=S&&S.L;
    if(L&&L.kind==='duel'&&L.end&&L.res&&!L.__rs46){
      L.__rs46=1;
      registrar(L.res,L.bn);
    }
  }catch(e){}
}

/* ---------- render wrapper ---------- */
try{
  if(typeof render==='function'){
    var _r46=render;
    render=function(){var r=_r46.apply(this,arguments);try{chequearDuelo();inyectar()}catch(e){}return r};
  }
  setTimeout(function(){try{inyectar()}catch(e){}},0);
}catch(e){}

window.RS46={candidatos:candidatos,tarjeta:tarjeta,inyectar:inyectar,miniMarc:miniMarc,registrar:registrar,chequearDuelo:chequearDuelo,estado:function(){return{riv:(U()&&U().riv)||{}}}};
})();
