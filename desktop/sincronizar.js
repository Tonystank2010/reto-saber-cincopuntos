/* Copia el juego canónico (public/juego) dentro de desktop/app antes de empaquetar. */
const fs=require('fs'),path=require('path');
const origen=path.join(__dirname,'..','public','juego','Reto-Saber.html');
const destino=path.join(__dirname,'app','Reto-Saber.html');
fs.mkdirSync(path.dirname(destino),{recursive:true});
fs.copyFileSync(origen,destino);
console.log('Sincronizado:',origen,'→',destino);
