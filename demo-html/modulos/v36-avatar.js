/* ---- v36: avatar personalizable (ecosistema Cinco Puntos) ----
   Mascota propia en 4 formas (punto, chiguiro, zorro, robot) con color,
   ojos, boca y accesorios editables + boton Sorprendeme. Config en
   DB.pref.av (viaja con la nube porque DB.pref se sincroniza completo).
   El avatar aparece: editor en el Perfil, barra superior, tu fila del
   Liga, y reaccionando en cada retroalimentacion de leccion (feliz al
   acertar, animo al fallar). */
(function(){
'use strict';
if(window.self!==window.parent)return;

const FORMAS=['punto','chiguiro','zorro','robot'];
const OJOS=4,BOCAS=4,ACCS=5;
const COLORES=['','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#10b981','#ec4899','#14b8a6','#f97316','#64748b'];
/* geometria por forma: linea de ojos y del borde superior de cabeza */
const GEO={
 punto :{ey:50,ty:22},
 chiguiro:{ey:58,ty:48},
 zorro :{ey:46,ty:26},
 robot :{ey:47,ty:24}
};

function cfg(){
  let a;
  try{a=DB.pref&&DB.pref.av}catch(e){}
  const c={f:'punto',c:'',o:0,b:0,a:0};
  if(a&&typeof a==='object'){
    if(FORMAS.includes(a.f))c.f=a.f;
    if(typeof a.c==='string'&&(a.c===''||/^#[0-9a-fA-F]{6}$/.test(a.c)))c.c=a.c;
    const nv=x=>Number.isInteger(x)&&x>=0;
    if(nv(a.o)&&a.o<OJOS)c.o=a.o;
    if(nv(a.b)&&a.b<BOCAS)c.b=a.b;
    if(nv(a.a)&&a.a<ACCS)c.a=a.a;
  }
  return c;
}
function delta(k,v){
  try{
    const c=cfg();
    if(k==='f'){
      if(FORMAS.includes(v))c.f=v;
      else{const x=+v;if(x>=0&&x<FORMAS.length)c.f=FORMAS[x]}
    }
    else if(k==='c'&&(v===''||/^#[0-9a-fA-F]{6}$/.test(v)))c.c=v;
    else{
      const n=+v;
      if(k==='o'&&n>=0&&n<OJOS)c.o=n;
      else if(k==='b'&&n>=0&&n<BOCAS)c.b=n;
      else if(k==='a'&&n>=0&&n<ACCS)c.a=n;
    }
    DB.pref=DB.pref||{};DB.pref.av=c;save();render();
  }catch(e){}
}
function random(){
  try{
    DB.pref=DB.pref||{};
    DB.pref.av={f:FORMAS[Math.random()*FORMAS.length|0],c:COLORES[Math.random()*COLORES.length|0],
      o:(Math.random()*OJOS|0),b:(Math.random()*BOCAS|0),a:(Math.random()*ACCS|0)};
    save();render();
  }catch(e){}
}

/* ---------- piezas ---------- */
function ojoIzq(x,y,tipo,col){ /* ojo izquierdo con pupila; tipo 2 = guino */
  if(tipo===2)return`<path d="M${x-4} ${y}q2 -3 4 0" style="fill:none;stroke:${col};stroke-width:2;stroke-linecap:round"/>`;
  const gui=`<circle cx="${x+3}" cy="${y}" r="2" style="fill:${col}"/>`;
  const bri=(tipo===1)?`<circle cx="${x+1.6}" cy="${y-1.6}" r="1" style="fill:#fff"/>`:'';
  return`<circle cx="${x}" cy="${y}" r="2.6" style="fill:#fff"/>${gui}${bri}`;
}
function ojosSVG(f,tipo,col){
  const g=GEO[f],d=6.5; /* separacion ojo izq/der */
  if(f==='robot'){
    if(tipo===3)return`<path d="M36 ${g.ey+2}q4 -6 8 0" style="fill:none;stroke:${col};stroke-width:2;stroke-linecap:round"/><path d="M56 ${g.ey+2}q4 -6 8 0" style="fill:none;stroke:${col};stroke-width:2;stroke-linecap:round"/>`;
    return`<rect x="36" y="${g.ey-4}" width="8" height="8" rx="2" style="fill:${col}"/><rect x="56" y="${g.ey-4}" width="8" height="8" rx="2" style="fill:${col}"/>`;
  }
  if(tipo===3)return`<path d="M${50-d-4} ${g.ey+1}q4 -5 8 0" style="fill:none;stroke:${col};stroke-width:2;stroke-linecap:round"/><path d="M${50+d-4} ${g.ey+1}q4 -5 8 0" style="fill:none;stroke:${col};stroke-width:2;stroke-linecap:round"/>`;
  return ojoIzq(50-d,g.ey,tipo,col)+ojoIzq(50+d,g.ey,tipo,col);
}
function bocaSVG(f,tipo){
  const g=GEO[f],s='stroke:rgba(0,0,0,.55);stroke-width:2;stroke-linecap:round';
  const y=g.ey+8;
  if(tipo===1)return`<circle cx="50" cy="${y+1}" r="2.6" style="fill:rgba(0,0,0,.55)"/>`;
  if(tipo===2)return`<path d="M46 ${y}q4 5 8 0" style="fill:none;${s}"/><path d="M49.4 ${y+3.2}q2.2 3.2 4.4 .2l-1 3.4z" style="fill:#e75480"/>`;
  if(tipo===3)return`<path d="M46 ${y+1.5}h8" style="fill:none;${s}"/>`;
  return`<path d="M46 ${y}q4 4.5 8 0" style="fill:none;${s}"/>`;
}
function accesorio(tipo,f,col){
  if(!tipo)return'';
  const g=GEO[f],y=g.ey,ty=g.ty;
  if(tipo===1){ /* gorra: visera + semicúpula hasta la cabeza */
    const dom=`<path d="M28 ${y-14}a22 20 0 0 1 44 0z" style="fill:${col}"/>`;
    const vis=`<rect x="${f==='punto'?18:30}" y="${y-16}" width="${f==='punto'?64:40}" height="7" rx="3.5" style="fill:${col}"/>`;
    const btn=`<circle cx="50" cy="${y-30}" r="3.5" style="fill:rgba(255,255,255,.4)"/>`;
    return dom+vis+btn;
  }
  if(tipo===2){ /* gafas centradas en la linea de ojos */
    const h=11;
    return`<rect x="${50-19}" y="${y-h/2}" width="16" height="${h}" rx="4" style="fill:rgba(15,23,42,.15);stroke:#1f2430;stroke-width:2"/>`
     +`<rect x="${50+3}" y="${y-h/2}" width="16" height="${h}" rx="4" style="fill:rgba(15,23,42,.15);stroke:#1f2430;stroke-width:2"/>`
     +`<path d="M${50-3} ${y-1}h6M${50-19} ${y-1}l-9 1M${50+19} ${y-1}l9 1" style="fill:none;stroke:#1f2430;stroke-width:2;stroke-linecap:round"/>`;
  }
  if(tipo===3){ /* mono al costado de la cabeza */
    return`<path d="M66 ${ty+2}c7-7 16-2 12.6 4.4-2.4 5-10 5-13.6 1.6l3.4 8-8.6-5.6z" style="fill:#e75480"/>`;
  }
  if(tipo===4){ /* corona */
    return`<path d="M36 ${y-18}l5-9 6.5 7.5L54 ${y-26}l7 7.5 5-5 1.5 8.5z" style="fill:#fbbf24"/>`;
  }
  return'';
}

/* mood: neutro | happy | animo */
function avatarSVG(c,mood){
  const f=FORMAS.includes(c.f)?c.f:'punto';
  const col=(c.c&&/^#[0-9a-fA-F]{6}$/.test(c.c))?c.c:'var(--ac)';
  const colf=c.c?c.c:'#1f2430';
  const col2='rgba(0,0,0,.72)';
  let base='';
  if(f==='punto'){
    base=`<circle cx="50" cy="52" r="32" style="fill:${col}"/>`
        +`<circle cx="50" cy="18" r="5" style="fill:${col}"/><path d="M50 24v-4" style="stroke:${col};stroke-width:4;stroke-linecap:round"/>`;
  }else if(f==='chiguiro'){
    base=`<path d="M22 78q0-30 28-30t28 30z" style="fill:${col}"/>`
        +`<path d="M36 52q-1-8 4.5-8T45 52M55 52q-1-8 4.5-8T64 52" style="fill:${col}"/>`
        +`<ellipse cx="50" cy="64" rx="12" ry="8" style="fill:rgba(255,255,255,.3)"/>`;
  }else if(f==='zorro'){
    base=`<path d="M26 38 16 18l17 7q17-7 34 0l17-7-10 20q6 24-24 34-30-10-24-34z" style="fill:${col}"/>`
        +`<path d="M38 60q12 9 24 0q-12 12-24 0z" style="fill:rgba(255,255,255,.4)"/>`;
  }else{
    base=`<rect x="24" y="24" width="52" height="50" rx="12" style="fill:${col}"/>`
        +`<path d="M50 24V13" style="stroke:${col};stroke-width:4;stroke-linecap:round"/><circle cx="50" cy="10" r="4" style="fill:${col}"/>`
        +`<rect x="33" y="40" width="34" height="16" rx="6" style="fill:rgba(255,255,255,.25)"/>`;
  }
  const ojoT=(mood==='happy')?3:c.o;
  const bocT=(mood==='animo')?1:(mood==='happy'?0:c.b);
  return`<svg viewBox="0 0 100 96" role="img" aria-label="Tu avatar"><g>${base}${ojosSVG(f,ojoT,col2)}${bocaSVG(f,bocT)}${accesorio(c.a,f,colf)}</g></svg>`;
}
function miniAvatar(){return avatarSVG(cfg(),'neutro')}

/* ---------- editor en el Perfil ---------- */
function chipsRs36(k,vals,nombres,actual,swatch){
  return'<div class="row">'+vals.map((v,i)=>{
    const valor=(swatch||(k==='f'))?v:String(i);
    const on=String(valor)===String(actual)?' on':'';
    let inner=nombres[i];
    if(swatch&&v)inner=`<span aria-hidden="true" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${v};vertical-align:-2px;margin-right:5px"></span>${nombres[i]}`;
    return`<button class="chip${on}" data-a="rs36v" data-v="${k}:${valor}">${inner}</button>`;
  }).join('')+'</div>';
}
function cardAvatar(){
  const c=cfg(),act=['',`f:${c.f}`,`c:${c.c}`,`o:${c.o}`,`b:${c.b}`,`a:${c.a}`];
  return`<div class="card" data-v36="1">`
   +`<div style="display:flex;gap:14px;align-items:center"><div data-v36v="1" style="width:84px;height:80px;flex:none">${miniAvatar()}</div>`
   +`<div><b>Tu avatar</b><p class="mu">Tu compa\u00f1ero de estudio del ecosistema Cinco Puntos. Se guarda contigo y viaja con la nube.</p>`
   +`<div class="row"><button class="g" data-a="rs36r">Sorpr\u00e9ndeme</button></div></div></div>`
   +`<div class="mu" style="margin-top:8px">Forma</div>`+chipsRs36('f',FORMAS,['Punto','Chig\u00fciro','Zorro','Robot'],c.f,false)
   +`<div class="mu" style="margin-top:8px">Color</div>`+chipsRs36('c',COLORES,['Autom\u00e1tico','Miel','Rojo','Violeta','Azul','Esmeralda','Rosa','Turquesa','Naranja','Gris'],c.c,true)
   +`<div class="mu" style="margin-top:8px">Ojos</div>`+chipsRs36('o',[0,1,2,3],['Normales','Brillo','Gui\u00f1o','Felices'],c.o,false)
   +`<div class="mu" style="margin-top:8px">Boca</div>`+chipsRs36('b',[0,1,2,3],['Sonrisa','Asombro','Lengua','Seria'],c.b,false)
   +`<div class="mu" style="margin-top:8px">Accesorio</div>`+chipsRs36('a',[0,1,2,3,4],['Ninguno','Gorra','Gafas','Mo\u00f1o','Corona'],c.a,false)
   +`</div>`;
}

/* ---------- inyecciones ---------- */
function inyectarPerfil(){
  try{
    if(!(S&&S.view==='app'&&S.tab==='perfil'))return;
    if(document.querySelector('[data-v36]'))return;
    const main=document.querySelector('main');if(!main)return;
    main.insertAdjacentHTML('afterbegin',cardAvatar());
  }catch(e){}
}
function inyectarTop(){
  try{
    if(!(S&&S.view==='app'))return;
    const tb=document.querySelector('.top b');if(!tb)return;
    if(tb.querySelector('[data-v36m]'))return;
    const perf=tb.querySelector('[data-i=perfil]');
    tb.insertAdjacentHTML('afterbegin',`<span data-v36m="1" aria-hidden="true" style="display:inline-block;width:26px;height:25px;vertical-align:-8px;margin-right:2px">${miniAvatar()}</span>`);
    if(perf)perf.style.display='none';
  }catch(e){}
}
/* reaccion en la retroalimentacion de leccion */
function inyectarFB(){
  try{
    if(!(S&&S.view==='app'))return;
    const fbs=document.querySelectorAll('.fb.ok:not([data-v36]), .fb.no:not([data-v36])');
    fbs.forEach(fb=>{
      if(fb.querySelector('[data-v36m2]'))return;
      const happy=fb.classList.contains('ok');
      fb.insertAdjacentHTML('beforeend',`<div data-v36m2="1" class="rs36reac" title="${happy?'\u00a1Bien hecho!':'\u00c1nimo, t\u00fa puedes'}">${avatarSVG(cfg(),happy?'happy':'animo')}</div>`);
    });
  }catch(e){}
}
/* tu fila del Liga */
function inyectarLiga(){
  try{
    if(!(S&&S.view==='app'&&S.tab==='liga'))return;
    const me=document.querySelector('.lg.me');if(!me||me.querySelector('[data-v36m3]'))return;
    me.insertAdjacentHTML('beforeend',`<span data-v36m3="1" style="display:inline-block;width:22px;height:21px;flex:none">${miniAvatar()}</span>`);
  }catch(e){}
}

function css(){
  let est=document.getElementById('rs36css');
  if(est)return;
  est=document.createElement('style');est.id='rs36css';
  est.textContent=[
   '.rs36reac{display:flex;justify-content:flex-end;margin-top:2px}',
   '.rs36reac svg{width:64px;height:61px}',
   '.chip[data-a=rs36v] svg,.chip[data-a=rs36v] span{pointer-events:none}',
   '@media(prefers-reduced-motion:no-preference){',
   ' @keyframes rs36flot{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
   ' .rs36reac{animation:rs36flot 2.4s ease-in-out infinite}',
   ' .top [data-v36m]{transition:transform .2s ease}',
   ' .top [data-v36m]:hover{transform:scale(1.1) rotate(-4deg)}',
   '}'
  ].join('');
  document.head.appendChild(est);
}

function inyectarTodo(){
  try{
    css();inyectarPerfil();inyectarTop();inyectarLiga();
  }catch(e){}
}
function inyectarFBp(){
  try{css();inyectarFB()}catch(e){}
}

try{
  const _r36=render;
  render=function(){const r=_r36.apply(this,arguments);
    try{inyectarTodo()}catch(e){}
    try{(S&&S.view==='app')&&setTimeout(inyectarFBp,0)}catch(e){}
    return r};
}catch(e){}

try{setTimeout(function(){try{inyectarTodo();inyectarFBp()}catch(e){}},0)}catch(e){}
window.addEventListener('message',function(e){
  try{
    const m=e&&e.data;
    if(m&&m.origen==='rs-iframe'&&String(m.tipo|| '').slice(0,7)==='rs-')return;
    if(m&&m.origen==='rs-app'){ setTimeout(function(){try{inyectarFBp()}catch(x){}},0) }
  }catch(x){}
});

try{Object.assign(A,{rs36v:function(v){const p=String(v).split(':');delta(p[0],p.slice(1).join(':'))},rs36r:function(){random()}})}catch(e){}

/* API para pruebas */
window.RS36={cfg:cfg,random:random,svg:avatarSVG,mini:miniAvatar,inyectar:inyectarTodo,inyectarFB:inyectarFBp};
})();
