/* ---- v26: responsive refinado (movi@l<=767px y division dif) ---- */
(function(){
'use strict';
var estilo=document.createElement('style');
estilo.id='v26-resp';
estilo.textContent=[
'@media(max-width:767px){',
'nav button{font-size:12px!important;padding:9px 2px;min-width:0}',
'button{min-height:46px}',
'.card{padding:14px;margin:10px 0}',
'h1{font-size:20px;line-height:1.25}',
'.row button{flex:1 1 auto;min-width:112px}',
'.dif{flex-wrap:wrap}',
'select,textarea,input[type=text],input[type=password],input[type=email]{width:100%}',
'main p{overflow-wrap:anywhere}',
'#t22q,#t22v,#v23t{font-size:12px!important}}'
].join('\n');
document.head.appendChild(estilo);
})();
