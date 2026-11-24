/* ---- v42: monedas, tienda y topbar interactivo (estilo kit de aprendizaje) ----
   Aqui vive:
   - las monedas: cada punto de XP que ganas te da una moneda; la cartera es
     XP menos gastos (u.gasto), asi la liga y la temporada siguen midiendo XP,
   - la tienda: protectores de racha, cargar vidas y articulos de avatar,
   - el topbar: Vidas / Racha / Monedas tocables, con ventanas propias,
   - la compra desde los candados del editor (rs40buy ahora compra de verdad). */
(function(){
'use strict';
if(typeof window==='undefined')return;

/* ---------- 1) estilo propio ---------- */
function css(){
  if(document.getElementById('rs42css'))return;
  var est=document.createElement('style');est.id='rs42css';
  est.textContent=[
    /* botones de estadistica del topbar */
    '.rs42st{display:inline-flex;gap:8px;align-items:center;flex:0 0 auto}',
    '.stb{display:inline-flex;align-items:center;gap:6px;border:2px solid var(--br);background:var(--cd);color:var(--tx);',
      'border-radius:999px;padding:6px 12px;font-weight:800;font-size:14px;cursor:pointer;min-height:36px}',
    '.stb:active{transform:scale(.96)}',
    '.stb svg.rsic{width:17px;height:17px}',
    /* ventana emergente (vidas / racha / tienda) */
    '.rs42bk{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:90;display:flex;align-items:center;justify-content:center;padding:16px}',
    '.rs42m{background:var(--cd);color:var(--tx);border:1px solid var(--br);border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,.25);',
      'width:100%;max-width:380px;padding:18px;display:flex;flex-direction:column;gap:12px;max-height:86vh;overflow:auto}',
    '.rs42m h3{margin:0;display:flex;align-items:center;gap:8px;font-size:17px}',
    '.rs42x{margin-left:auto;border:1px solid var(--br);background:transparent;color:inherit;border-radius:10px;',
      'padding:4px 10px;font-weight:800;cursor:pointer}',

    /* fila de tienda */
    '.rs42it{display:flex;align-items:center;gap:10px;border:1px solid var(--br);border-radius:14px;padding:10px 12px;min-width:0}',
    '.rs42ic{flex:0 0 auto;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;',
      'background:var(--ac);color:var(--ac-tx,#fff);opacity:.95}',
    '.rs42ic svg.rsic{width:20px;height:20px}',
    '.rs42tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.rs42tx b{font-size:14.5px;overflow-wrap:anywhere}',
    '.rs42tx span{font-size:12.5px;opacity:.75;overflow-wrap:anywhere}',
    '.rs42pr{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;border:0;background:var(--ac);color:var(--ac-tx,#fff);',
      'border-radius:999px;padding:8px 13px;font-weight:800;font-size:13.5px;cursor:pointer}',
    '.rs42pr[disabled]{opacity:.5;cursor:default}',
    '.rs42pr svg.rsic{width:14px;height:14px}',
    '.rs42ok{flex:0 0 auto;font-size:12.5px;font-weight:800;border:1px solid var(--br);border-radius:999px;padding:6px 10px;opacity:.7}',
    '.rs42sw{width:26px;height:26px;border-radius:8px;flex:0 0 auto;border:1px solid rgba(0,0,0,.18)}',

    /* corazones y racha dentro de las ventanas */
    '.rs42vs{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}',
    '.rs42vs .rs42c svg.rsic{width:34px;height:34px}',
    '.rs42vs .rs42c:not(.si){opacity:.25}',
    '.rs42cen{text-align:center}',
    '.rs42cen>p{margin:4px 0}',
    '.rs42big{font-size:44px;font-weight:900;line-height:1.1}',
    /* barra semanal de dias activos */
    '.rs42wk{display:flex;gap:8px;justify-content:center}',
    '.rs42wd{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:34px}',
    '.rs42wd span{font-size:11.5px;font-weight:800;opacity:.75}',
    '.rs42wd i{width:30px;height:30px;border-radius:50%;border:2px solid var(--br);display:block}',
    '.rs42wd.si i{background:var(--ac);border-color:var(--ac)}',
    '@media(max-width:480px){',
    ' .stb{padding:5px 10px;font-size:13px}',
    ' .rs42it{flex-wrap:wrap}}',

    /* tarjeta tienda del camino */
    '.rs42shop .card{display:flex;flex-direction:column;gap:10px}',
    '.rs42shop .card b{font-size:16px}'
  ].join('');
  document.head.appendChild(est);
}

/* ---------- 2) helpers de monedas ---------- */
function monedas(u){return Math.max(0,(u.xp|0)-(u.gasto|0))}
function I(n){try{return(window.RS35&&RS35.ico(n))||''}catch(e){return''}}
function pool(){if(!DB.pref)DB.pref={};if(!DB.pref.avit)DB.pref.avit={};return DB.pref.avit}
function tengo(llave){return !!(DB.pref&&DB.pref.avit&&DB.pref.avit[llave])}

var PRECIO={'pr':500,'vi':800,'a:7':1200,'a:8':1000,'a:9':1500,'a:10':1300,'c:#f5c542':900,'c:#22d3ee':900,'c:#e879f9':900};
var DOW=['L','Ma','Mi','J','V','S','D'];/* dow() 0 = lunes */
var NCOLOR={'#f5c542':'Oro real','#22d3ee':'Cian hielo','#e879f9':'Lila neon'};

/* catalogo de la tienda, segun el usuario actual */
function items(u){
  var lista=[
    {k:'pr',ico:'fuego',n:'Protector de racha',d:'Conerva tu racha si fallas un dia. Tienes '+(u.pr|0)+' de 3.',p:PRECIO.pr,on:true},
    {k:'vi',ico:'corazon',n:'Recuperar todas las vidas',d:'Vuelve a 5 corazones al instante.',p:PRECIO.vi,on:!(u.v>=5&&!u.vt)}
  ];
  Object.keys(NCOLOR).forEach(function(v){
    lista.push({k:'c:'+v,sw:v,n:'Color '+NCOLOR[v],d:'Color de avatar premium de la tienda.',p:PRECIO['c:'+v],on:!tengo('c'+v)});
  });
  lista.push({k:'a:7',ico:'ojo',n:'Bigote',d:'Articulo de avatar premium.',p:PRECIO['a:7'],on:!tengo('m')});
  lista.push({k:'a:8',ico:'estrella',n:'Diadema de estrella',d:'Articulo de avatar premium.',p:PRECIO['a:8'],on:!tengo('d')});
  lista.push({k:'a:9',ico:'vueltiao',n:'Sombrero vueltiao',d:'Articulo de avatar premium: identidad colombiana.',p:PRECIO['a:9'],on:!tengo('s')});
  lista.push({k:'a:10',ico:'bufanda',n:'Bufanda sabia',d:'Articulo de avatar premium: para las noches de estudio.',p:PRECIO['a:10'],on:!tengo('f')});
  return lista;
}

/* ---------- 3) tarjeta de la tienda en el camino ---------- */
function tiendaCard(u){
  var filas=items(u).map(function(x){
    var ic=x.sw?('<span class="rs42sw" style="--sw:'+x.sw+'"></span>'):('<span class="rs42ic">'+I(x.ico)+'</span>');
    var der=x.on
      ?('<button class="rs42pr" data-a="rs42buy" data-v="'+x.k+'" '+(monedas(u)<x.p?'disabled':'')+' title="Comprar '+x.n+'">'+x.p+' monedas</button>')
      :('<span class="rs42ok">Comprado</span>');
    return '<div class="rs42it">'+ic+'<span class="rs42tx"><b>'+x.n+'</b><span>'+x.d+'</span></span>'+der+'</div>';
  }).join('');
  return '<section class="rs42shop" data-rs42="1"><div class="card"><b>Tienda de monedas</b>'+
    '<span class="mu">Cambia tus monedas por ayudas o articulos para el avatar. Tienes '+monedas(u)+' monedas.</span>'+
    filas+'</div></section>';
}
window.tiendaCard=tiendaCard;

/* ---------- 4) ventanas: vidas, racha y tienda ---------- */
function cor(u){
  var s='';for(var i=1;i<=5;i++)s+='<span class="rs42c'+(i<=u.v?' si':'')+'">'+I('corazon')+'</span>';
  return '<span class="rs42vs">'+s+'</span>';
}
function semana(u){
  var last=u.last|0,hoy=day(),st=Math.max(0,u.streak|0),out='';
  for(var i=6;i>=0;i--){
    var d=hoy-i,dw=(d+3)%7;
    var si=st>0&&d<=last&&d>last-st;
    out+='<span class="rs42wd'+(si?' si':'')+(i===0?' ho':'')+'"><i></i><span>'+DOW[dw]+'</span></span>';
  }
  return '<span class="rs42wk">'+out+'</span>';
}
function ventana(u){
  var c='';
  if(S.rs42==='vidas'){
    c='<h3>'+I('corazon')+' Vidas</h3>'+cor(u)+'<div class="rs42cen">'+
      (u.v>=5&&!u.vt?'<p>Tus corazones estan llenos. A por ello.</p>':'<p>Siguiente vida en '+tleft(u)+'</p>')+
      '<button class="rs42pr" data-a="rs42buy" data-v="vi" '+(monedas(u)<PRECIO.vi||u.v>=5?'disabled':'')+'>Recuperar todas por '+PRECIO.vi+' monedas</button>'+
      (u.v>0?'':'<button data-a="vid">Modo practica (no gasta vidas)</button>')+'</div>';
  }else if(S.rs42==='racha'){
    c='<h3>'+I('fuego')+' Racha</h3><div class="rs42cen"><div class="rs42big">'+(u.streak|0)+'</div><p>'+((u.streak|0)===1?'dia de racha':'dias de racha')+'</p>'+
      semana(u)+
      '<p class="mu">Protecciones disponibles: '+(u.pr|0)+'</p>'+
      '<button class="rs42pr" data-a="rs42buy" data-v="pr" '+(monedas(u)<PRECIO.pr||(u.pr|0)>=3?'disabled':'')+'>Comprar protector, '+PRECIO.pr+' monedas</button>'+
      '<p class="mu">Con un protector, fallar un dia no rompe tu racha.</p></div>';
  }else{
    c='<h3>'+I('moneda')+' Tienda</h3>'+items(u).map(function(x){
      var ic=x.sw?('<span class="rs42sw" style="--sw:'+x.sw+'"></span>'):('<span class="rs42ic">'+I(x.ico)+'</span>');
      var der=x.on
        ?('<button class="rs42pr" data-a="rs42buy" data-v="'+x.k+'" '+(monedas(u)<x.p?'disabled':'')+'>'+x.p+'</button>')
        :'<span class="rs42ok">Comprado</span>';
      return '<div class="rs42it">'+ic+'<span class="rs42tx"><b>'+x.n+'</b><span>'+x.d+'</span></span>'+der+'</div>';
    }).join('');
  }
  return '<div class="rs42bk" data-rs42m="1" data-a="rs42x"><div class="rs42m" role="dialog" aria-label="Ventana de '+
    (S.rs42==='racha'?'racha':S.rs42==='vidas'?'vidas':'tienda')+'">'+
    '<button class="rs42x" data-a="rs42x" aria-label="Cerrar ventana">✕</button>'+c+'</div></div>';
}

/* ---------- 5) acciones ---------- */
function comprar(k){
  var u=U();k=String(k||'');
  if(!k){S.rs42='tienda';render();return}
  var p=PRECIO[k];
  if(p==null)return;
  if(monedas(u)<p){S.rs42='tienda';say('Te faltan monedas para ese articulo.');render();return}
  u.gasto=(u.gasto|0)+p;
  if(k==='pr'){u.pr=Math.min(3,(u.pr|0)+1);say('Protector de racha listo. Se usa solo cuando lo necesitas.')}
  else if(k==='vi'){u.v=5;u.vt=0;u.vr=0;say('Corazones recuperados.')}
  else if(k==='a:7'){pool().m=1;say('Bigote comprado. Ponlo en Perfil, Personalizar.')}
  else if(k==='a:8'){pool().d=1;say('Diadema de estrella comprada. Ponla en Perfil, Personalizar.')}
  else if(k==='a:9'){pool().s=1;say('Sombrero vueltiao comprado. Ponlo en Perfil, Personalizar.')}
  else if(k==='a:10'){pool().f=1;say('Bufanda sabia comprada. Ponla en Perfil, Personalizar.')}
  else if(k.indexOf('c:')===0){pool()['c'+k.slice(2)]=1;say('Color premium comprado. Usalo en Perfil, Personalizar.')}
  save();S.rs42='tienda';render();
}
try{
  Object.assign(A,{
    rs42v:function(){S.rs42='vidas';render()},
    rs42r:function(){S.rs42='racha';render()},
    rs42t:function(){S.rs42='tienda';render()},
    rs42x:function(){S.rs42=null;render()},
    rs42buy:comprar,
    rs40buy:comprar
  });
}catch(e){}

/* ---------- 6) inyeccion en el render ---------- */
function inyectar(){
  try{
    var main=document.querySelector('main');if(!main)return;
    /* tarjeta de tienda, solo en el camino; se refresca en cada render para
       que la cartera y los precios deshabilitados nunca queden viejos */
    var card=main.querySelector('[data-rs42]');
    var enCamino=!!main.querySelector('.rs39ban[data-k="camino"]');
    if(enCamino&&!(S.L||S.R)){
      var ancla=main.querySelector('.rs39ban[data-k="camino"]')||main.querySelector(':scope>.top');
      if(ancla){
        var htmC=tiendaCard(U());
        if(card){card.outerHTML=htmC}
        else ancla.insertAdjacentHTML('afterend',htmC);
      }
    }else if(card&&card.remove){card.remove()}
    /* ventana emergente: SIEMPRE una sola. Se quitan todas las existentes y
       se agrega una nueva; asi ningun doble toque o reentrada deja capas
       superpuestas. Se cierra sola si entra una leccion o un cuento. */
    var todas=document.querySelectorAll('.rs42bk'),i;
    for(i=0;i<todas.length;i++){if(todas[i]&&todas[i].remove)todas[i].remove()}
    if(S.rs42&&S.view==='app'&&!(S.L||S.R)){
      var dv=document.createElement('div');dv.innerHTML=ventana(U());
      var nd=dv.firstChild;if(nd)document.body.appendChild(nd);
    }
  }catch(e){}
}
try{
  css();
  if(typeof render==='function'){
    var _r42=render;
    render=function(){var r=_r42.apply(this,arguments);try{(S.L||S.R)&&(S.rs42=null);inyectar()}catch(e){}return r};
  }
  setTimeout(inyectar,0);
}catch(e){}
/* seguro extra: si por alguna razon llegaran a existir dos capas,
   el primer click del usuario deja solo la primera */
try{
  document.addEventListener('click',function(){
    try{var t=document.querySelectorAll('.rs42bk');for(var i=1;i<t.length;i++){if(t[i].remove)t[i].remove()}}catch(e){}
  },true);
}catch(e){}

/* API para pruebas */
try{window.RS42={monedas:monedas,PRECIO:PRECIO,tengo:function(k){return tengo(k)},inyectar:inyectar,ventana:ventana}}catch(e){}

})();
