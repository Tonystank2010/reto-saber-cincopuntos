/* Reto Saber · Cinco Puntos — app de escritorio (Electron)
   Carga el demo single-file local y guarda el progreso en el disco del usuario
   (localStorage de la ventana, persistente entre sesiones). */
const {app,BrowserWindow,Menu,shell}=require('electron');
const path=require('path');
let win=null;
function crear(){
 win=new BrowserWindow({
  width:1080,height:800,minWidth:380,minHeight:560,
  title:'Reto Saber · Cinco Puntos',
  autoHideMenuBar:false,
  webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}
 });
 Menu.setApplicationMenu(Menu.buildFromTemplate([
  {label:'Juego',submenu:[
   {label:'Recargar',accelerator:'F5',click:()=>win&&win.reload()},
   {label:'Pantalla completa',accelerator:'F11',click:()=>win&&win.setFullScreen(!win.isFullScreen())},
   {type:'separator'},
   {label:'Salir',accelerator:'Ctrl+Q',role:'quit'}]},
  {label:'Ver',submenu:[{role:'zoomIn'},{role:'zoomOut'},{role:'resetZoom'}]},
  {label:'Ayuda',submenu:[
   {label:'Juego en línea',click:()=>shell.openExternal('https://tonystank2010.github.io/reto-saber-cincopuntos/public/demo/Reto-Saber-Demo.html')},
   {label:'Sobre el proyecto',click:()=>shell.openExternal('https://github.com/Tonystank2010/reto-saber-cincopuntos')}]}
 ]));
 win.loadFile(path.join(__dirname,'app','Reto-Saber-Demo.html'));
 win.on('closed',()=>{win=null});
}
app.whenReady().then(crear);
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(!win)crear()});
