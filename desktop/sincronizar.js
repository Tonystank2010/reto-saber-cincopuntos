/* Copia el demo canónico (public/demo) dentro de desktop/app antes de empaquetar. */
const fs=require('fs'),path=require('path');
const origen=path.join(__dirname,'..','public','demo','Reto-Saber-Demo.html');
const destino=path.join(__dirname,'app','Reto-Saber-Demo.html');
fs.mkdirSync(path.dirname(destino),{recursive:true});
fs.copyFileSync(origen,destino);
console.log('Sincronizado:',origen,'→',destino);
