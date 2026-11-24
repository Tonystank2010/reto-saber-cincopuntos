/* ---- v44: plan nocturno — se prepara de noche para aplicarse al dia siguiente ----
   a) Cubre TODAS las areas del examen: repaso de errores, una leccion por area
      y un cuento. Las 2 areas mas debiles (segun el diagnostico y los errores
      guardados en Repaso) se marcan como "Profundizar"; las demas, "Reforzar".
   b) Se genera de noche (despues de las 19:00) para el dia siguiente; si el
      estudiante abre la app de dia, el plan queda para ese mesmo dia. Al
      cambiar el dia se re-arma con los datos mas recientes.
   c) Cada bloque es tachable; al completar todo el plan del dia el estudiante
      gana 60 monedas (una sola vez por plan).
   d) window.RS44HORA permite fijar la hora para las pruebas.
   e) Expone window.RS44 para pruebas (construir, generar, tarjeta, rotulo).
   f) v44.1: cajones/chips con aire y sin texto recortado; ventana emergente
      (Vidas/Racha/Tienda) mas aireada y con botones al ancho en las centradas. */
(function(){
var DIAS=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
function hora(){try{if(window.RS44HORA!=null)return+window.RS44HORA}catch(e){}try{return new Date().getHours()}catch(e){return 12}}
function diaPlan(){return hora()>=19?day()+1:day()}
function I(n){try{return RS35.ico(n)}catch(e){return ''}}
function css(){
 var st=document.createElement('style');st.id='rs44css';
 st.textContent=[
  '.rs44sub{margin:2px 0 6px;font-size:13px;color:var(--mu)}',
  '.rs44r{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid var(--br);min-width:0}',
  '.rs44r.si .rs44tx{opacity:.55;text-decoration:line-through}',
  '.rs44chk{flex:0 0 auto;width:30px;min-width:30px;height:30px;border-radius:9px;border:2px solid var(--br);background:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:transparent}',
  '.rs44chk.si{background:var(--ac);border-color:var(--ac);color:var(--ac-tx,#fff)}',
  '.rs44chk svg.rsic{width:16px;height:16px}',
  '.rs44tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}',
  '.rs44tx b{font-size:14px;overflow-wrap:anywhere}',
  '.rs44tx span{font-size:12.5px;color:var(--mu);overflow-wrap:anywhere}',
  '.rs44bd{flex:0 0 auto;align-self:center;font-size:11px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap}',
  '.rs44bd.p{background:var(--ac);color:var(--ac-tx,#fff)}',
  '.rs44bd.r{border:1.5px solid var(--br);color:var(--mu)}',
  '.rs44btn{min-height:34px;border-radius:10px;padding:6px 12px;font-size:13px;font-weight:800}',
  '.rs44bar{height:8px;border-radius:999px;background:var(--cv2,var(--br));overflow:hidden;margin:6px 0 2px}',
  '.rs44bar i{display:block;height:100%;background:var(--ac)}',
  '.rs44ic{flex:0 0 auto;width:30px;min-width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--ac)}',
  '.rs44ic svg.rsic{width:17px;height:17px}',
  '.rs44pi{display:flex;align-items:center;gap:10px}',
  '.rs44pi b{font-size:16px}',
  '@media(max-width:480px){.rs44bd{align-self:flex-start;margin-top:6px}.rs44r{flex-wrap:wrap}.rs44btn{flex:1 1 auto}}',
  /* v44.1: los cajones (chips) con aire y sin texto recortado */
  '.row.sc{flex-wrap:wrap;overflow-x:visible}',
  '.row.sc .chip{flex:0 0 auto;max-width:none}',
  /* v44.1: ventana emergente mas aireada y funcional */
  '.rs42m{padding:20px;gap:14px;max-width:400px}',
  '.rs42m h3{margin:0 0 2px;font-size:18px}',
  '.rs42vs{gap:10px}',
  '.rs42vs .rs42c svg.rsic{width:36px;height:36px}',
  '.rs42cen>button,.rs42cen .rs42pr{width:100%;justify-content:center}',
  '.rs42it{padding:11px 13px}'
 ].join('');
 document.head.appendChild(st);
}
function areasPlan(){var as=(CAT.areas||[]).filter(function(a){return a.examen===S.exam}).map(function(a){return a.id});return as.length?as:AR.slice()}
function construir(u){
 var d=ST(u).diag;
 var errs={};(u.rev||[]).forEach(function(x){if(x&&x.q&&x.q.area)errs[x.q.area]=(errs[x.q.area]||0)+1});
 var fil=areasPlan().map(function(a,i){
  var x=d&&d[a],prop=x&&x.tot?Math.max(0,Math.min(1,x.ok/x.tot)):null;
  var s=prop==null?50:Math.max(1,Math.round(prop*100));
  return{a:a,s:s-2*(errs[a]||0),i:i,prop:prop};
 });
 fil.sort(function(x,y){return x.s-y.s||x.i-y.i});
 return{d:diaPlan(),r:0,
  h:[false].concat(fil.map(function(){return false})).concat([false]),
  ar:fil.map(function(f){return f.a}),
  dp:fil.map(function(f,j){return j<2?1:0}),
  nv:fil.map(function(f){return f.prop==null?1:rec(f.prop)}),
  cu:Math.min(((u.cu&&u.cu.e)|0)||0,3)};
}
function generar(u){
 u.pn=construir(u);save();
 if(hora()>=19)say('Tu plan nocturno para manana ya esta listo en el Camino.');
 return u.pn;
}
function rotulo(pn){return pn.d===day()+1?'para mañana':pn.d===day()?'de hoy':''}
function fila(i,ico,tit,sub,btn,badge){
 var si=U().pn.h[i];
 return '<div class="rs44r r'+i+(si?' si':'')+'">'+
  '<button class="rs44chk'+(si?' si':'')+'" data-a="r44b" data-v="'+i+'" aria-label="'+(si?'Marcar como pendiente':'Marcar como listo')+': '+esc(tit)+'">'+I('check')+'</button>'+
  '<span class="rs44ic">'+I(ico)+'</span>'+
  '<span class="rs44tx"><b>'+esc(tit)+'</b><span>'+sub+'</span></span>'+
  (badge?'<span class="rs44bd '+(badge==='Profundizar'?'p':'r')+'">'+badge+'</span>':'')+
  (btn||'')+'</div>';
}
function tarjeta(u){
 var pn=u.pn;var rv=(u.rev||[]).filter(function(x){return x&&x.due<=Date.now()}).length;
 if(rv===0&&!pn.h[0]){pn.h[0]=true;save()}
 var hecho=pn.h.filter(function(x){return x}).length,total=pn.h.length;
 var box='';
 box+=fila(0,'bandera',rv?('Repasa tus errores ('+Math.min(rv,7)+')'):'Repaso al dia',
  rv?'Sin limite de tiempo y sin gastar vidas.':(pn.h[0]?'Nada pendiente: excelente senal.':''),
  rv?'<button class="rs44btn" data-a="rev">Repasar</button>':'');
 pn.ar.forEach(function(a,j){var i=j+1;
  box+=fila(i,'cuaderno',(pn.dp[j]?'Profundizar · ':'Reforzar · ')+a,
   'Leccion '+NIV[pn.nv[j]]+' del area, con explicacion de cada error.',
   '<button class="rs44btn" data-a="sug" data-v="'+esc(a+'|'+pn.nv[j])+'">Ir ahi</button>',
   pn.dp[j]?'Profundizar':'Reforzar')});
 box+=fila(total-1,'cuentos','Lectura critica · cuento',
  'Etapa '+(pn.cu+1)+' de 4: menos ayudas, mas atencion.',
  '<button class="rs44btn" data-a="ro" data-v="'+pn.cu+'">Leer</button>');
 var rot=rotulo(pn),ttl=rot==='para mañana'?('Plan nocturno para '+DIAS[(dow()+1)%7]):('Plan de hoy · '+DIAS[dow()%7]);
 return '<section class="card rs44" data-rs44="1">'+
  '<div class="rs44pi">'+I('reloj')+'<b>'+ttl+'</b></div>'+
  '<p class="rs44sub">Preparado de noche con tus diagnosticos y tus errores: '+hecho+' de '+total+' bloques listos. Al completar el plan del dia ganas 60 monedas.</p>'+
  '<div class="rs44bar"><i style="width:'+(hecho/total*100)+'%"></i></div>'+box+
  (pn.r?'<p class="rs44sub">Plan completo: ganaste tus 60 monedas. Buen cierre.</p>':'<p class="rs44sub">Se rehace solo cuando cambia el dia.</p>')+
  '<button class="g rs44btn" data-a="r44g">Rehacer el plan con lo ultimo</button></section>';
}
function inyectar(){
 if(S.view!=='app'||S.L||S.R||S.tab!=='camino')return;
 var u=U();if(!u)return;
 if(!u.pn||!u.pn.ar||u.pn.d<diaPlan())u.pn=generar(u);
 var pan=u.pn;
 if(pan.r!==1&&pan.d===day()&&pan.h.every(function(x){return x})){pan.r=1;u.xp=(u.xp|0)+60;save();say('Plan nocturno completo: +60 monedas.')}
 var main=document.querySelector('#app main');if(!main)return;
 var html=tarjeta(u);
 var old=main.querySelector('[data-rs44]');
 if(old){if(old._rs44===html)return;var d1=document.createElement('div');d1.innerHTML=html;var n1=d1.firstChild;n1._rs44=html;main.replaceChild(n1,old);return}
 var d2=document.createElement('div');d2.innerHTML=html;var n2=d2.firstChild;n2._rs44=html;
 var ref=main.children[1]||null; /* justo despues del topbar */
 main.insertBefore(n2,ref);
}
css();
try{Object.assign(A,{
 r44b:v=>{const u=U();if(!u.pn)return;const i=+v;if(i>=0&&i<u.pn.h.length){u.pn.h[i]=!u.pn.h[i];save()}render()},
 r44g:()=>{const u=U();u.pn=null;generar(u);render()}
})}catch(e){}
window.RS44={construir:construir,generar:generar,tarjeta:tarjeta,diaPlan:diaPlan,rotulo:rotulo};
var _r44=render;
render=function(){var r=_r44.apply(this,arguments);try{inyectar()}catch(e){}return r};
setTimeout(inyectar,0);
})();
