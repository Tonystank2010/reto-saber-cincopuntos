/* v21: banco rotativo de 10.000 preguntas sin repetici\uFFFDon (IIFE \u00FAnica para no colisionar con globales del demo) */
(function(){
/* ---- v21: banco rotativo de 10.000 preguntas ---- */
/* Espacio por área (total 10.000): Matemáticas 2200 · Razonamiento Cuantitativo 2200 ·
   Ciencias Naturales 2164 · Sociales y Ciudadanas 1000 · Lectura Crítica 900 ·
   Inglés 936 · Comunicación Escrita 600.
   Cada usuario tiene un ciclo sembrado por área: al entrar a una lección, simulacro o
   diagnóstico recibe preguntas nuevas del ciclo, SIN repetirse hasta agotarlo; al
   agotar se vuelve a sembrar (mezcla nueva). Las preguntas fijas del banco original
   se reparten dentro del ciclo para que tampoco se repitan seguido.
   Las preguntas generadas son de práctica (no oficiales) y van marcadas como tales. */

const CUOTA={'Matemáticas':2200,'Razonamiento Cuantitativo':2200,'Ciencias Naturales':2164,'Sociales y Ciudadanas':1000,'Lectura Crítica':900,'Inglés':936,'Comunicación Escrita':600};
const NIVL=['Básico','Intermedio','Avanzado'];
const NIVX=(typeof NIV!=='undefined'&&Array.isArray(NIV)&&NIV.length>=3)?NIV:NIVL;
const f2=x=>Math.round(x*100)/100;
const num=x=>f2(x).toLocaleString('es-CO');
const mb32=s=>function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const PRE='Generada por la aplicación como práctica · no oficial';

/* ====== plantillas numéricas: (n)entero → {en, r, dis:[3], exp} ====== */
const FAM_NUM=[
 n=>{const out={};
  const p=20000+((n*7817)%180000),d=10+((n*37)%80),c=f2(p*d/100),pf=p-c;
  out.en='Un artículo cuesta $'+num(p)+' y tiene '+d+' % de descuento. ¿Cuánto se paga?';
  out.r='$'+num(pf);
  out.dis=['$'+num(f2(p+d)),'$'+num(c),'$'+num(f2(c/2))];
  out.exp='El descuento es $'+num(c)+'; se paga $'+num(p)+' − $'+num(c)+' = $'+num(pf)+'.';
  return out;},
 n=>{const out={};
  const c=4000+((n*611)%24000),p=10+((n*23)%80),v=f2(c*p/100);
  out.en='¿Cuánto es '+p+' % de $'+num(c)+'?';
  out.r='$'+num(v);
  out.dis=['$'+num(f2(c*p)),'$'+num(f2(v/2)),'$'+num(f2(v*2))];
  out.exp=p+' % de $'+num(c)+' = '+p+' × $'+num(c)+' ÷ 100 = $'+num(v)+'.';
  return out;},
 n=>{const out={};
  const v=30+((n*781)%121),t=2+((n*13)%5),d=2+((n*7)%6);
  out.en='Un bus viaja '+v+' km/h durante '+t+' horas y luego '+d+' horas a la mitad de esa velocidad. ¿Cuántos km recorre en total?';
  out.r=num(v*t+v/2*d)+' km';
  out.dis=[num(v*(t+d))+' km',num(v*t+d)+' km',num(v*t)+' km'];
  out.exp='Primera parte: '+v+'×'+t+'='+(v*t)+' km; segunda: '+(v/2)+'×'+d+'='+(v*d/2)+' km; total '+(v*t+v*d/2)+' km.';
  return out;},
 n=>{const out={};
  const a=2+((n*37)%197),b=1+((n*3)%Math.max(1,a-1));
  out.en='Un rectángulo mide '+a+' m de largo y '+b+' m de ancho. ¿Cuál es su área?';
  out.r=num(a*b)+' m²';
  out.dis=[num(2*(a+b))+' m²',num(a+b)+' m²',num(a*a)+' m²'];
  out.exp='Área = base × altura = '+a+' × '+b+' = '+(a*b)+' m². (El perímetro sería '+2*(a+b)+' m.)';
  return out;},
 n=>{const out={};
  const n1=2+((n*17)%9),n2=1+((n*29)%5),n3=3+((n*41)%7),s=n1+n2+n3,avg=f2(s/3);
  out.en='Las notas de un estudiante son '+n1+', '+n2+' y '+n3+'. ¿Cuál es su promedio?';
  out.r=num(avg);
  out.dis=[num(s),num(f2(s/2)),num(Math.max(n1,n2,n3))];
  out.exp='Promedio = ('+n1+'+'+n2+'+'+n3+') ÷ 3 = '+s+' ÷ 3 = '+num(avg)+'.';
  return out;},
 n=>{const out={};
  const km=3+((n*19)%197);
  out.en='Un corredor recorre '+km+' km. ¿Cuántos metros recorre?';
  out.r=num(km*1000)+' m';
  out.dis=[num(km*100)+' m',num(km/1000)+' m',num(km*10)+' m'];
  out.exp='1 km = 1000 m; '+km+' × 1000 = '+(km*1000)+' m.';
  return out;},
 n=>{const out={};
  const t=2+((n*31)%3),m=(n*53)%59,s=3+((n*17)%4),tot=(t*60+m)*s;
  out.en='Una actividad dura '+t+' horas y '+m+' minutos por sesión. ¿Cuántos minutos en total duran '+s+' sesiones iguales?';
  out.r=num(tot)+' minutos';
  out.dis=[num(t*60+m)+' minutos',num(t*s*60+m)+' minutos',num(tot+s*15)+' minutos'];
  out.exp='Cada sesión dura '+(t*60+m)+' minutos; '+s+' sesiones duran '+s+' × '+(t*60+m)+' = '+tot+' minutos.';
  return out;},
 n=>{const out={};
  const m=3+((n*43)%197),p=2000+((n*67)%9000);
  out.en='Cada cuaderno cuesta $'+num(p)+'. ¿Cuánto cuestan '+m+' cuadernos?';
  out.r='$'+num(m*p);
  out.dis=['$'+num(p+m*1000),'$'+num(p-m*1000),'$'+num(m*p/3)];
  out.exp=m+' × $'+num(p)+' = $'+num(m*p)+'.';
  return out;},
 n=>{const out={};
  const g=8+((n*59)%197),kg=1+((n*13)%9);
  out.en='Un paquete pesa '+g+' g y el otro '+kg+' kg. ¿Cuántos gramos pesan juntos?';
  out.r=num(g+kg*1000)+' g';
  out.dis=[num(g+kg)+' g',num(kg*100)+' g',num(g*1000)+' g'];
  out.exp='1 kg = 1000 g; '+g+' + '+(kg*1000)+' = '+(g+kg*1000)+' g.';
  return out;},
 n=>{const out={};
  const v=50000+((n*71)%200000),p=3+((n*37)%9),c=f2(v*p/100);
  out.en='De una venta de $'+num(v)+', la comisión es '+p+' %. ¿Cuánto recibe de comisión el vendedor?';
  out.r='$'+num(c);
  out.dis=['$'+num(p),'$'+num(f2(p/100)),'$'+num(v*p)];
  out.exp=p+' % de $'+num(v)+' = '+p+' × $'+num(v)+' ÷ 100 = $'+num(c)+'.';
  return out;},
 n=>{const out={};
  const km=20+((n*37)%83)*2,min=55+(n*13)%4*15;
  const hora=min/60,v=f2(km/hora);
  out.en='Un carro recorre '+km+' km en '+min+' minutos. ¿Cuál es su velocidad promedio en km/h?';
  out.r=num(v)+' km/h';
  out.dis=[num(f2(km*hora))+' km/h',num(km*2)+' km/h',num(f2(km/hora*2))+' km/h'];
  out.exp='Velocidad = distancia ÷ tiempo; '+min+' min = '+f2(hora)+' h; '+km+' ÷ '+f2(hora)+' = '+num(v)+' km/h.';
  return out;},
 n=>{const out={};
  const x=2+((n*23)%197);
  out.en='Si 3 cuadernos cuestan $'+num(x*3000)+', ¿cuánto cuestan 5 cuadernos al mismo precio unitario?';
  out.r='$'+num(x*5000);
  out.dis=['$'+num(x*3000),'$'+num(x*3000*5),'$'+num(x*3000*3/5)];
  out.exp='Cada cuaderno cuesta $'+num(x*1000)+'; 5 cuadernos = $'+num(x*5000)+'.';
  return out;}
];

/* ====== Ciencias Naturales: conversiones y cálculos verificables ====== */
const FAM_CN=[
 n=>{const out={};const c=2+((n*37)%277);
  out.en='Para una práctica, un estudiante mide '+c+' °C. ¿A cuántos kelvin equivale?';
  out.r=num(c+273)+' K';
  out.dis=[num(c)+' K',num(c+100)+' K',num(273-c)+' K'];
  out.exp='K = °C + 273; '+c+' + 273 = '+(c+273)+' K.';
  return out;},
 n=>{const out={};const m=20+((n*37)%880),v=4+((n*11)%46),d=f2(m/v);
  out.en='Un objeto tiene una masa de '+num(m)+' g y un volumen de '+v+' cm³. ¿Cuál es su densidad en g/cm³?';
  out.r=num(d);
  out.dis=[num(f2(m+v)),num(f2(Math.abs(m-v))),num(f2(m/v+2))];
  out.exp='Densidad = masa ÷ volumen = '+m+' ÷ '+v+' = '+num(d)+' g/cm³.';
  return out;},
 n=>{const out={};const ml=250+((n*37)%750),tot=1000+((n*53)%2000);
  out.en='De una botella con '+num(tot)+' mL de solución se usan '+ml+' mL. ¿Cuántos mililitros quedan?';
  out.r=num(tot-ml)+' mL';
  out.dis=[num(tot+ml)+' mL',num(ml)+' mL',num(tot)+' mL'];
  out.exp=num(tot)+' − '+ml+' = '+(tot-ml)+' mL.';
  return out;},
 n=>{const out={};const s=2+((n*37)%257),t3=2+((n*41)%9),tot=s*t3;
  out.en='En un cultivo, la población de bacterias se triplica cada hora. Si empieza con '+s+' bacterias, ¿cuántas hay después de '+t3+' horas?';
  out.r=num(s*Math.pow(3,t3));
  out.dis=[num(s*3),num(s*t3*3),num(s*3+t3)];
  out.exp='Se multiplica por 3 cada hora: '+s+' × 3^'+t3+' = '+(s*Math.pow(3,t3))+'.';
  return out;},
 n=>{const out={};const pp=40+((n*37)%197),sp=5+((n*23)%20),right=num(pp+sp)+' Mbps';
  out.en='El plan básico de internet de una casa ofrece '+pp+' Mbps de descarga. Al mejorarlo, la velocidad sube '+sp+' Mbps. ¿Cuál es la velocidad total?';
  out.r=right;
  out.dis=[num(pp*sp)+' Mbps',num(pp-sp)+' Mbps',num(pp)+' Mbps'];
  out.exp=num(pp)+' + '+sp+' = '+(pp+sp)+' Mbps.';
  return out;},
 n=>{const out={};const SUB=['limón','jugo de naranja','vinagre','leche','agua de mar','jabón líquido','amoniaco','refresco de cola','lluvia ácida','agua destilada','detergente','bicarbonato de sodio'];
  const ph=f2(((n*37)%139)/10),sust=SUB[(n*23)%SUB.length];
  out.en='El pH de '+sust+' para este cálculo es '+ph+' (escala 0 a 14). ¿Cómo se clasifica esa disolución?';
  out.r=ph<7?'Ácida (menor que 7)':(ph===7?'Neutra (igual a 7)':'Básica (mayor que 7)');
  out.dis=ph<7?['Neutra (igual a 7)','Básica (mayor que 7)','Salina']:(ph===7?['Ácida (menor que 7)','Básica (mayor que 7)','Salina']:['Neutra (igual a 7)','Ácida (menor que 7)','Salina']);
  out.exp='pH menor que 7 indica acidez; mayor que 7, basicidad; 7 es neutro.';
  return out;},
 n=>{const out={};const pp=60+((n*37)%120),sp=3+((n*11)%9);
  out.en='Un cuerpo recorre '+pp+' cm por segundo durante '+sp+' segundos. ¿Cuántos centímetros recorre en total?';
  out.r=num(pp*sp)+' cm';
  out.dis=[num(pp+sp)+' cm',num(pp-sp)+' cm',num(pp)+' cm'];
  out.exp='Distancia = velocidad × tiempo = '+pp+' × '+sp+' = '+(pp*sp)+' cm.';
  return out;},
 n=>{const out={};const k2=2+((n*37)%277);
  out.en='Una habitación mide '+k2+' m por '+k2+' m. ¿Cuántos metros cuadrados tiene su piso?';
  out.r=num(k2*k2)+' m²';
  out.dis=[num(k2*k2+k2)+' m²',num(k2*k2-k2)+' m²',num(Math.max(0,k2*k2-1))+' m²'];
  out.exp='Área de un cuadrado = lado² = '+k2+'² = '+(k2*k2)+' m².';
  return out;}
];

/* ====== Sociales y Ciudadanas: 10 escenarios × 10 personas × 10 lugares = 1000 ====== */
const SOC_P=['Ana','Camilo','Daniela','Esteban','Fernanda','Julián','Laura','Mateo','Nicolás','Valentina'];
const SOC_L=['en la esquina de su barrio','en el aula de clase','en la fila del banco','en el parque vecinal','en la terminal de transporte','en la tienda escolar','en la biblioteca pública','en una reunión comunitaria','en el servicio de urgencias','en la oficina de tránsito'];
const SOC=[
 {s:'encuentra una billetera con documentos y dinero',ok:'Intentar entregarla a su dueño o a las autoridades',m:['Guardarla hasta que alguien la reclame','Vender lo que hay dentro','Botarla a la basura'],x:'La honradez y el respeto por los bienes ajenos implican devolver lo encontrado.'},
 {s:'ve que alguien arroja basura',ok:'Llamar amablemente la atención y recoger la basura si es posible',m:['Arrojar más basura','Gritar insultos','Grabar sin permiso y difundir la imagen'],x:'La convivencia se apoya en el diálogo respetuoso y el cuidado del espacio público.'},
 {s:'es testigo de acoso a un compañero',ok:'Informar a un adulto o autoridad responsable',m:['Reírse del acoso','Ignorarlo siempre','Publicar el video en redes'],x:'Denunciar el acoso ante responsables protege a la víctima y a la comunidad.'},
 {s:'debe decidir en una votación escolar',ok:'Informarse sobre cada propuesta antes de votar',m:['Votar por el más popular sin leer propuestas','Abstenerse siempre','Copiar el voto de su amigo'],x:'La participación informada es esencial para una decisión democrática.'},
 {s:'recibe por error un billete falso',ok:'Acudir al banco o a las autoridades para informarlo',m:['Usarlo para pagar en otra tienda','Venderlo','Guardarlo para usarlo después'],x:'Circular billetes falsos es delito; lo correcto es informarlo al banco o a la autoridad.'},
 {s:'termina de comer en un espacio público',ok:'Disponer el residuo en una caneca o llevárselo',m:['Botarlo al suelo','Enterrarlo en el parque','Dejarlo en la silla'],x:'El cuidado del ambiente exige manejar los residuos adecuadamente.'},
 {s:'compra un producto dañado en un establecimiento',ok:'Solicitar el cambio o el reembolso presentando el recibo',m:['Romper el producto en la tienda','Amenazar al vendedor','Devolverlo sin avisar a nadie'],x:'Los consumidores tienen derecho a reclamo con las garantías legales.'},
 {s:'escucha un rumor dañino sobre un compañero',ok:'No difundirlo y hablar directamente con él si le preocupa',m:['Difundirlo en el grupo','Confirmarlo con más personas','Burlarse'],x:'Difundir rumores agrede la dignidad; el buen trato exige no propagarlos.'},
 {s:'usa el transporte público y ve a una persona mayor de pie',ok:'Cederle el asiento',m:['Ocupar dos puestos','Poner las piernas en el asiento libre','Subir el volumen del audio'],x:'Ceder el asiento es un gesto de respeto y ayuda mutua.'},
 {s:'encuentra una fila desordenada al entrar a un evento',ok:'Esperar su turno y respetar el orden de llegada',m:['Colarse por delante','Empujar para entrar primero','Comprar el puesto de otro'],x:'El respeto por las filas garantiza equidad en el acceso a servicios.'}
];
const socFam=i=>{
 const esc=SOC[i%SOC.length];
 const per=SOC_P[Math.floor(i/SOC.length)%SOC_P.length];
 const lug=SOC_L[Math.floor(i/(SOC.length*SOC_P.length))%SOC_L.length];
 return{en:per+' '+esc.s+' '+lug+'. ¿Cuál es la actuación más adecuada?',r:esc.ok,dis:esc.m,exp:esc.x};
};

/* ====== Lectura Crítica: 15 pares × 6 personas × 10 tiempos = 900 ====== */
const LEC_P=['Marta','Óscar','Paula','Ricardo','Sofía','Tomás'];
const LEC_T=['Ayer','La semana pasada','El lunes','Hace un mes','El viernes','El miércoles','En la mañana','Hace poco','El otro día','Recientemente'];
const LEC=[
 {a:'estudió toda la noche',b:'aprobó el examen',con:'de modo que',mal:['aunque','sin embargo','mientras que'],x:'La segunda oración es consecuencia de la primera: conector consecutivo.'},
 {a:'estaba agotado',b:'terminó el partido',con:'aunque',mal:['porque','de modo que','por lo tanto'],x:'Concesión: algo contrario no impidió que sucediera.'},
 {a:'perdió el bus',b:'llegó tarde a la reunión',con:'por lo tanto',mal:['sin embargo','aunque','mientras'],x:'La segunda oración es la consecuencia natural de la primera.'},
 {a:'ahorró durante meses',b:'compró su bicicleta sin deuda',con:'de modo que',mal:['aunque','sin embargo','porque'],x:'El ahorro fue la causa; la compra, el resultado: conector consecutivo.'},
 {a:'le encanta el ruido de la ciudad',b:'prefiere el campo los fines de semana',con:'sin embargo',mal:['por lo tanto','de modo que','porque'],x:'Contraste entre dos gustos: conector adversativo.'},
 {a:'terminó la tarea antes de salir',b:'pudo descansar tranquila',con:'de modo que',mal:['aunque','sin embargo','mientras que'],x:'Consecuencia: al terminar antes, pudo descansar.'},
 {a:'no escuchó la alarma',b:'llegó tarde al colegio',con:'porque',mal:['sin embargo','de modo que','mientras que'],x:'La causa de llegar tarde fue no escuchar la alarma: conector causal.'},
 {a:'llovió desde temprano',b:'las calles amanecieron mojadas',con:'de modo que',mal:['aunque','sin embargo','porque'],x:'Consecuencia observable de la lluvia.'},
 {a:'practicaba todos los días',b:'mejoró su tiempo al nadar',con:'porque',mal:['sin embargo','aunque','mientras que'],x:'La práctica constante explica (causa) la mejora.'},
 {a:'había preparado la presentación',b:'se dañó el proyector',con:'sin embargo',mal:['por lo tanto','de modo que','porque'],x:'Contraste entre la preparación y el contratiempo.'},
 {a:'el semáforo estaba en rojo',b:'los carros se detuvieron',con:'de modo que',mal:['aunque','sin embargo','porque'],x:'La regla de tránsito generó la consecuencia de detenerse.'},
 {a:'no le gustaba leer',b:'encontró un libro imposible de soltar',con:'hasta que',mal:['por lo tanto','de modo que','sin embargo'],x:'La serie de eventos avanza «hasta que» aparece el cambio.'},
 {a:'el colegio quedó en obra',b:'las clases empezaron virtuales',con:'de modo que',mal:['aunque','sin embargo','porque'],x:'Consecuencia de la obra: pasar a modalidad virtual.'},
 {a:'el equipo ganó el torneo',b:'se lesionó su capitán',con:'sin embargo',mal:['de modo que','porque','por lo tanto'],x:'Contraste entre el buen resultado y el contratiempo.'},
 {a:'había mucha niebla',b:'el vuelo se retrasó',con:'de modo que',mal:['aunque','sin embargo','porque'],x:'La niebla (causa) originó el retraso (efecto).'}
];
const lecFam=i=>{
 const p=LEC[i%LEC.length];
 const per=LEC_P[Math.floor(i/LEC.length)%LEC_P.length];
 const t=LEC_T[Math.floor(i/(LEC.length*LEC_P.length))%LEC_T.length];
 return{en:t+', '+per+' '+p.a+' ___ '+p.b+'. ¿Qué conector completa correctamente?',r:p.con,dis:p.mal,exp:p.x};
};

/* ====== Inglés: 26 plantillas × 3 tiempos × 12 sujetos = 936 ≥ cuota 900 ====== */
const ING_3SG=['She','He','My cousin','That student','Maria','Laura'];
const ING_PL=['My friends','They','The students','We','Carlos and Teo','The teachers'];
const ING=[
 {v:'go',s3:'goes',pp:'went',rs:'to the market every day',ps:'to the market yesterday',fs:'to the market next week'},
 {v:'study',s3:'studies',pp:'studied',rs:'English at school',ps:'for the test last night',fs:'at the university next year'},
 {v:'write',s3:'writes',pp:'wrote',rs:'a letter every month',ps:'an email this morning',fs:'the report tomorrow'},
 {v:'play',s3:'plays',pp:'played',rs:'soccer on weekends',ps:'basketball after class',fs:'in the tournament next month'},
 {v:'eat',s3:'eats',pp:'ate',rs:'fruit every day',ps:'lunch at noon',fs:'dinner with us tomorrow'},
 {v:'read',s3:'reads',pp:'read',rs:'the news online',ps:'a novel last week',fs:'the guidelines tonight'},
 {v:'clean',s3:'cleans',pp:'cleaned',rs:'the classroom on Fridays',ps:'the kitchen after lunch',fs:'the yard on Sunday'},
 {v:'visit',s3:'visits',pp:'visited',rs:'her grandmother often',ps:'the museum on Tuesday',fs:'the coast in December'},
 {v:'buy',s3:'buys',pp:'bought',rs:'fresh bread here',ps:'new shoes yesterday',fs:'a laptop next month'},
 {v:'run',s3:'runs',pp:'ran',rs:'every morning',ps:'five kilometers on Saturday',fs:'the marathon next spring'},
 {v:'teach',s3:'teaches',pp:'taught',rs:'math in this school',ps:'history for years',fs:'physics next semester'},
 {v:'watch',s3:'watches',pp:'watched',rs:'a movie on Sundays',ps:'the match last night',fs:'the ceremony tomorrow'},
 {v:'cook',s3:'cooks',pp:'cooked',rs:'dinner on weekdays',ps:'rice and chicken for lunch',fs:'a special dish for the party'},
 {v:'call',s3:'calls',pp:'called',rs:'her friend every evening',ps:'the doctor this morning',fs:'the office in the afternoon'},
 {v:'travel',s3:'travels',pp:'traveled',rs:'by bus every semester',ps:'to the capital last month',fs:'abroad next summer'},
 {v:'finish',s3:'finishes',pp:'finished',rs:'his homework early',ps:'the project yesterday',fs:'the course by December'},
 {v:'help',s3:'helps',pp:'helped',rs:'with the chores',ps:'at the canteen last Friday',fs:'with the festival next week'},
 {v:'dance',s3:'dances',pp:'danced',rs:'at school parties',ps:'all night at the wedding',fs:'in the recital next month'},
 {v:'sing',s3:'sings',pp:'sang',rs:'in the choir on Sundays',ps:'a ballad at the event',fs:'at the festival next month'},
 {v:'drive',s3:'drives',pp:'drove',rs:'to work every day',ps:'the family car last week',fs:'the new route tomorrow'},
 {v:'swim',s3:'swims',pp:'swam',rs:'in the pool on Tuesdays',ps:'in the river last summer',fs:'in the tournament in April'},
 {v:'paint',s3:'paints',pp:'painted',rs:'portraits on weekends',ps:'the fence last Saturday',fs:'a mural next month'},
 {v:'open',s3:'opens',pp:'opened',rs:'the shop at seven',ps:'the package an hour ago',fs:'a new store in May'},
 {v:'close',s3:'closes',pp:'closed',rs:'the window at night',ps:'the deal this morning',fs:'the season in October'},
 {v:'send',s3:'sends',pp:'sent',rs:'the newsletter monthly',ps:'the invoice last week',fs:'the invitations tomorrow'},
 {v:'repair',s3:'repairs',pp:'repaired',rs:'bikes on Saturdays',ps:'the roof last month',fs:'the machines next week'}
];
const ingFam=i=>{
 const item=ING[i%ING.length];
 const per=Math.floor(i/ING.length)%3;              /* 0 presente · 1 pasado · 2 futuro */
 const plural=per===0?Math.floor(i/ING.length/3)%2===1:Math.floor(i/ING.length/3)%2===1;
 const tok=Math.floor(i/(ING.length*6))%6;
 const suj=plural?ING_PL[tok]:ING_3SG[tok];
 const correct=per===0?(plural?item.v:item.s3):(per===1?item.pp:'will '+item.v);
 const rest=per===0?item.rs:(per===1?item.ps:item.fs);
 const didv='did '+item.v;
 const cand=[item.s3,item.v,item.pp,didv,'to '+item.v].filter(x=>x!==correct&&x!=='');
 const dis=[];const vi=new Set();
 for(const c of cand){if(!vi.has(c)){vi.add(c);dis.push(c)}}
 return{en:suj+' ___ '+rest+'.',r:correct,dis:dis,exp:per===0?(plural?'Presente simple con sujeto plural: se usa el verbo base.':'Presente simple: tercera persona singular añade -s.'):(per===1?'Pasado simple: forma del verbo en pasado.':'Futuro con will: will + verbo base.')};
};

/* ====== Comunicación Escrita: 12 plantillas × 10 temas × 5 adverbiales = 600 ====== */
const CE_T=['informe','artículo','comunicado','ensayo','reglamento','anexo','boletín','folleto','resumen','borrador'];
const CE_A=['a tiempo','con anticipación','en la fecha indicada','sin demoras','antes del viernes'];
const CE=[
 {tpl:'El {t} se envió {a}; ___, no obtuvo respuesta.',c:'sin embargo',m:['por lo tanto','de modo que','porque'],x:'Contraste entre el envío y la falta de respuesta: conector adversativo.'},
 {tpl:'No se aprobó el {t} que llegó {a}, ___ faltaba la firma.',c:'porque',m:['sin embargo','de modo que','mientras que'],x:'La falta de firma es la causa: conector causal.'},
 {tpl:'Recibido {a}, el {t} explica los objetivos; ___, propone un plan.',c:'además',m:['aunque','mientras','luego que'],x:'Añade información: conector aditivo.'},
 {tpl:'El {t} se publica ___ el equipo lo apruebe y se confirme que se entregó {a}.',c:'siempre que',m:['porque','aunque','sin embargo'],x:'Condición necesaria: conector condicional.'},
 {tpl:'El {t} se archivó ___ la fecha límite y se avisó {a}.',c:'antes de',m:['después de','durante','entre'],x:'Anterioridad temporal respecto de la fecha límite.'},
 {tpl:'___ las instrucciones, el {t} debe entregarse {a} e imprimirse dos veces.',c:'Según',m:['Porque','Aunque','De modo que'],x:'«Según» introduce la fuente de la instrucción.'},
 {tpl:'El {t} quedó listo {a}; ___, se notificó al coordinador.',c:'de este modo',m:['sin embargo','aunque','porque'],x:'Consecuencia del avance: conector consecutivo.'},
 {tpl:'___, el {t} resolvió el problema planteado y se archivó {a}.',c:'En resumen',m:['Porque','Sin embargo','Por lo tanto'],x:'Señala la conclusión del texto.'},
 {tpl:'El {t} avanzó más rápido ___ lo previsto y llegó {a}.',c:'de lo que',m:['de que','a lo que','por lo que'],x:'Comparación apropiada: «más rápido de lo previsto».'},
 {tpl:'___ se terminó el {t}, entregado {a}, se abrió una nueva fase.',c:'Cuando',m:['Porque','Sin embargo','Aunque'],x:'Temporalidad entre dos eventos.'},
 {tpl:'A pesar de la entrega {a}, el {t} quedó incompleto, ___ decidieron extender el plazo.',c:'de modo que',m:['sin embargo','porque','aunque'],x:'Consecuencia del retraso: conector consecutivo.'},
 {tpl:'Cuide el formato, ___ el contenido del {t}, y preséntelo {a}.',c:'así como',m:['pero','porque','además de que'],x:'Añade un elemento con igual relevancia: «así como».'}
];
const ceFam=i=>{
 const p=CE[i%CE.length];
 const t=CE_T[Math.floor(i/CE.length)%CE_T.length];
 const a=CE_A[Math.floor(i/(CE.length*CE_T.length))%CE_A.length];
 const en=p.tpl.replace('{t}',t).replace('{a}',a);
 return{en:en,r:p.c,dis:p.m,exp:p.x};
};

/* ====== c4: rotaci\u00f3n sin repetici\u00f3n \u00b7 sembrado por usuario/\\u00e1rea \u00b7 envoltura de draw ====== */
(function(){
const PRE='Generada por la aplicaci\u00f3n como pr\u00e1ctica \u00b7 no oficial';
const hsn=s=>{let h=5;for(const c of String(s))h=((h*31)+c.charCodeAt(0))>>>0;return h.toString(36)};
const nivOf=i=>NIV[i%3];

/* arma(area, datos{en,r,dis,exp}, nivel, competencia) \u2192 pregunta con opciones ABCD */
const numTxt=s=>{const m=String(s).match(/-?[\d][\d.,]*/);if(!m)return null;let t=m[0];
 if(/,/.test(t))t=t.replace(/\./g,'').replace(',','.');else if(/\./.test(t))t=t.replace(/\./g,'');
 const v=parseFloat(t);return isNaN(v)?null:v};
const arma=(a,datos,niv,comp)=>{
 const ok=String(datos.r);
 const us=new Set([ok]);
 const mal=(datos.dis||[]).filter(x=>x!=null&&String(x)!=='').slice(0,3).map(w=>{
  let w0=String(w),k=0;
  while(us.has(w0)&&k<9){k++;const v=numTxt(w0);
   if(v!=null)w0=String(w).replace(/-?[\d][\d.,]*/,num(f2(v+k)));else w0=w0+' ('+k+')'}
  us.add(w0);return w0});
 const ops=shuf([[ok,'',1]].concat(mal.map(x=>[x,'Verifica el planteamiento paso a paso.'])))
  .map((p,i)=>({id:'ABCD'[i],texto:String(p[0]),why:p[1],c:p[2]}));
 return{id:'rs10k_'+hsn(a+datos.en),area:a,nivel:niv,competencia:comp,enunciado:datos.en,
  opciones:ops.map(({id,texto,why})=>({id,texto,why})),respuesta:ops.find(x=>x.c).id,
  explicacion:datos.exp,marcaContenido:PRE};
};

/* ====== famila Razonamiento Cuantitativo (plantillas propias, distintas de Matem\u00e1ticas) ====== */
const FAM_RC=[
 n=>{const out={};const e=1+((n*17)%7),f=1+((n*23)%11),b=1+((n*31)%13),t=e*f*b;
  out.en='Un restaurante ofrece '+e+' entradas, '+f+' platos fuertes y '+b+' bebidas. \u00bfCu\u00e1ntas combinaciones con una de cada clase son posibles?';
  out.r=num(t)+' combinaciones';
  out.dis=[num(e+f+b===t?t+1:e+f+b)+' combinaciones',num(e*f+b===t?t+1:e*f+b)+' combinaciones',num(e*f*b+e)+' combinaciones'];
  out.exp='Se multiplican las opciones de cada clase: '+e+' \u00d7 '+f+' \u00d7 '+b+' = '+t+'.';
  return out;},
 n=>{const out={};const d=1+((n*19)%197),ex=250+((n*23)%7)*300,v=500*d+ex;
  out.en='Llegas a la tienda con $'+num(v)+' y compras '+d+' dulces de $500 cada uno. \u00bfDe cu\u00e1nto es tu cambio?';
  out.r='$'+num(ex);
  out.dis=['$'+num(500*d),'$'+num(v),'$'+num(500*(d+9))];
  out.exp='Total de la compra: '+d+' \u00d7 $500 = $'+num(500*d)+'; cambio: $'+num(v)+' \u2212 $'+num(500*d)+' = $'+num(ex)+'.';
  return out;},
 n=>{const out={};const pp=90000+((n*37)%899)*100,f1=f2(pp*0.8),fin=f2(f1*0.9);
  out.en='Un televisor de $'+num(pp)+' recibe un descuento de 20 % y, sobre el nuevo valor, otro del 10 %. \u00bfCu\u00e1l es el precio final?';
  out.r='$'+num(fin);
  out.dis=['$'+num(f2(pp*0.7)),'$'+num(f1),'$'+num(f2(pp-40000))];
  out.exp='Primero baja al 80 %: $'+num(f1)+'; luego al 90 % de eso: '+num(f1)+' \u00d7 0.9 = $'+num(fin)+'.';
  return out;},
 n=>{const out={};const x=(n*17)%90,y=(n*23)%71,fin=f2(0.3*x+0.7*y);
  out.en='En un curso las notas se componen as\u00ed: 30 % tareas y 70 % examen. Obtuviste '+x+' en tareas y '+y+' en el examen. \u00bfCu\u00e1l es tu nota final?';
  out.r=num(fin);
  out.dis=x===y?[num(Math.min(x,y)+1),num(Math.max(x,y)+2),num(Math.max(x,y)-1)]:[num(f2(x*0.7+y*0.3)===fin?fin+1:x*0.7+y*0.3),num(f2((x+y)/2)),num(Math.min(x,y))];
  out.exp='Nota = 0.3 \u00d7 '+x+' + 0.7 \u00d7 '+y+' = '+num(f2(0.3*x+0.7*y))+'.';
  return out;},
 n=>{const out={};const L=5+((n*17)%197),km=L*15;
  out.en='Un veh\u00edculo recorre 300 km con 20 litros de combustible. \u00bfCu\u00e1ntos kil\u00f3metros recorrer\u00e1 con '+L+' litros, manteniendo el mismo rendimiento?';
  out.r=num(km)+' km';
  out.dis=[num(L*30)+' km',num(L*10)+' km',num(300+L)+' km'];
  out.exp='Rendimiento: 300 \u00f7 20 = 15 km por litro; con '+L+' litros recorre '+L+' \u00d7 15 = '+km+' km.';
  return out;},
 n=>{const out={};const a=1+((n*17)%9),b=1+((n*23)%71);
  out.en='En una bolsa hay '+a+' bolas rojas y '+b+' bolas azules, id\u00e9nticas al tacto. \u00bfCu\u00e1l es la probabilidad de sacar una roja?';
  out.r=a+' de '+(a+b);
  out.dis=[(b===a?b+1:b)+' de '+(a+b),a+' de '+b,'1 de '+(a+b+1)];
  out.exp='Casos favorables: '+a+' (rojas); casos totales: '+(a+b)+'; por eso la probabilidad es '+a+' de '+(a+b)+'.';
  return out;},
 n=>{const out={};const x=10+((n*37)%71),y=5+((n*23)%43),t=1+((n*29)%5),d=(x+y)*t;
  out.en='Dos ciclistas salen en sentidos opuestos desde el mismo punto: uno a '+x+' km/h y el otro a '+y+' km/h. \u00bfQu\u00e9 distancia los separa tras '+t+' horas?';
  out.r=num(d)+' km';
  out.dis=[num(Math.abs(x-y)*t)+' km',num(x*y*t)+' km',num(d+t)+' km'];
  out.exp='Se alejan a '+x+' + '+y+' = '+(x+y)+' km/h; en '+t+' h la distancia es '+(x+y)+' \u00d7 '+t+' = '+d+' km.';
  return out;},
 n=>{const out={};const v=100000+((n*37)%899)*100,pc=2+((n*23)%21),y=1+((n*29)%5),it=f2(v*pc*y/100);
  out.en='Un fondo recibe un dep\u00f3sito de $'+num(v)+' a un inter\u00e9s simple del '+pc+' % anual. \u00bfCu\u00e1nto inter\u00e9s genera en '+y+' a\u00f1os?';
  out.r='$'+num(it);
  out.dis=['$'+num(f2(v*pc*1.5/100)),'$'+num(f2(v*pc*2.5/100)),'$'+num(v*2)];
  out.exp='Inter\u00e9s = capital \u00d7 tasa \u00d7 tiempo \u00f7 100 = '+num(v)+' \u00d7 '+pc+' \u00d7 '+y+' \u00f7 100 = $'+num(it)+'.';
  return out;},
 n=>{const out={};const fg=2+((n*23)%71),ex=(n*37)%79,t=fg+ex;
  out.en='En un curso hay '+t+' estudiantes y '+fg+' usan gafas. \u00bfCu\u00e1ntos NO usan gafas?';
  out.r=num(ex)+' estudiantes';
  out.dis=[num(t-fg+1)+' estudiantes',num(t+fg)+' estudiantes',num(t)+' estudiantes'];
  out.exp='No usan gafas: '+t+' \u2212 '+fg+' = '+ex+'.';
  return out;},
 n=>{const out={};const x=10+((n*37)%71),de=1+((n*23)%43),y=x+de;
  out.en='En enero una papeler\u00eda vendi\u00f3 '+x+' libretas y en febrero vendi\u00f3 '+y+'. \u00bfCu\u00e1ntas m\u00e1s vendi\u00f3 en febrero que en enero?';
  out.r=num(de)+' libretas';
  out.dis=[num(y)+' libretas',num(x+y)+' libretas',num(y-1)+' libretas'];
  out.exp='Diferencia: '+y+' \u2212 '+x+' = '+de+' libretas.';
  return out;},
 n=>{const out={};const b=3000+((n*17)%9)*500,m=1050+((n*23)%71)*50,d=1+((n*31)%79),tot=b+m*d;
  out.en='Un servicio de transporte cobra $'+num(b)+' fijo de banderazo y $'+num(m)+' por kil\u00f3metro. \u00bfCu\u00e1nto cuesta un viaje de '+d+' km?';
  out.r='$'+num(tot);
  out.dis=['$'+num(tot*2),'$'+num(tot+b),'$'+num(m*d)];
  out.exp='Costo = banderazo + kil\u00f3metros \u00d7 tarifa = '+num(b)+' + '+d+' \u00d7 '+num(m)+' = $'+num(tot)+'.';
  return out;},
 n=>{const out={};const g=2000+((n*17)%90)*1000,h=1000+((n*23)%71)*500,s=((n*29)%5)*1000,v=g+h+s;
  out.en='Ten\u00edas $'+num(v)+'. Gastaste $'+num(g)+' en el mercado y $'+num(h)+' en transporte. \u00bfCu\u00e1nto dinero te queda?';
  out.r='$'+num(s);
  out.dis=['$'+num(s+1000),'$'+num(s+500),'$'+num(v)];
  out.exp='Gasto total: '+num(g)+' + '+num(h)+' = $'+num(g+h)+'; te queda $'+num(v)+' \u2212 $'+num(g+h)+' = $'+num(s)+'.';
  return out;}
];

/* f\u00e1brica por \u00e1rea: \\u00edndice i \u2192 pregunta (determinista, enunciado \u00fanico dentro del espacio) */
const FAB={
 'Matem\u00e1ticas':i=>arma('Matem\u00e1ticas',FAM_NUM[i%FAM_NUM.length](Math.floor(i/FAM_NUM.length)+1),nivOf(i),'Razonamiento cuantitativo'),
 'Razonamiento Cuantitativo':i=>arma('Razonamiento Cuantitativo',FAM_RC[i%FAM_RC.length](Math.floor(i/FAM_RC.length)+1),nivOf(i),'Razonamiento cuantitativo'),
 'Ciencias Naturales':i=>arma('Ciencias Naturales',FAM_CN[i%FAM_CN.length](Math.floor(i/FAM_CN.length)+1),nivOf(i),'Indagaci\u00f3n y c\u00e1lculos cient\u00edficos'),
 'Sociales y Ciudadanas':i=>arma('Sociales y Ciudadanas',socFam(i),nivOf(i),'Convivencia y an\u00e1lisis de situaciones'),
 'Lectura Cr\u00edtica':i=>arma('Lectura Cr\u00edtica',lecFam(i),nivOf(i),'Comprensi\u00f3n e inferencia textual'),
 'Ingl\u00e9s':i=>arma('Ingl\u00e9s',ingFam(i),nivOf(i),'Grammar: tenses'),
 'Comunicaci\u00f3n Escrita':i=>arma('Comunicaci\u00f3n Escrita',ceFam(i),nivOf(i),'Conectores y cohesi\u00f3n textual')
};

/* copia local del token de marca del banco real */
const realesCache={};
const reales=a=>{if(!realesCache[a])realesCache[a]=(typeof BANK!=='undefined'?BANK:[]).filter(q=>q.area===a);return realesCache[a]};

/* orden(a, semilla): mezcla determinista del espacio con banco fijo intercalado */
const orden=(a,sd)=>{
 const C=CUOTA[a],rnd=mb32(Math.floor(sd*7919)+17),re=reales(a);
 const R=Math.min(re.length,Math.floor(C*0.2));
 const idx=[];for(let i=0;i<C-R;i++)idx.push(i);
 for(let i=idx.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=idx[i];idx[i]=idx[j];idx[j]=t}
 const cyc=idx.map(i=>({f:i}));
 if(R>0){
  const rid=[];for(let j=0;j<re.length;j++)rid.push(j);
  for(let i=rid.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=rid[i];rid[i]=rid[j];rid[j]=t}
  const step=C/R,usa=new Set();
  for(let j=0;j<R;j++){
   let p=Math.floor(j*step+Math.floor(rnd()*step*0.5));
   if(usa.has(p))p=(p+1)%C;
   if(usa.has(p))continue;
   usa.add(p);cyc[p]={r:re[rid[j]]};
  }
 }
 return cyc;
};

/* tomar(a,n,k): saca k del ciclo sembrado del usuario (u.b10k[area]={s,p}), filtra nivel y re-siembra al agotar */
const tomar=(a,n,k)=>{
 k=Math.max(1,Math.floor(k||1));
 const C=CUOTA[a];
 const u=typeof U==='function'?U():null;
 if(!u||!FAB[a]||!C)return D0(a,n,k);
 u.b10k=u.b10k||{};
 const st=u.b10k[a]||(u.b10k[a]={s:1+Math.floor(Math.random()*99997),p:0});
 let cyc=orden(a,st.s),p=st.p%C,out=[],ys=new Set(),guard=0;
 while(out.length<k&&guard<=C*2+10){
  if(p>=C){p=0;st.s=(st.s+1)%99991;cyc=orden(a,st.s);st.res=1}
  guard++;
  const t=cyc[p];p++;
  const q=t.r?Object.assign({},t.r):FAB[a](t.f);
  if(!q||!q.enunciado||!q.opciones||q.opciones.length!==4)continue;
  const key=q.enunciado;
  if(ys.has(key))continue;
  if(n!=null&&q.nivel!==NIV[n])continue;
  ys.add(key);out.push(q);
 }
 st.p=p%C;
 if(out.length<k)out=out.concat(D0(a,n,k-out.length));
 if(typeof save==='function')try{save()}catch(e){}
 return out;
};

const TOTAL=Math.round(Object.keys(CUOTA).reduce((s,a)=>s+CUOTA[a],0));
window.RS10K={tomar,orden,fabrica:FAB,cuota:CUOTA,total:TOTAL,reales,arma};

/* envoltura global: los flujos (les, diag, sim, rev, vid, ds, des...) pasan por aqu\u00ed */
const D0=window.draw;
window.draw=function(a,n,k){
 if(typeof a!=='string'||!FAB[a])return D0(a,n,k);
 const o=tomar(a,n,k||5);
 if(a==='Ingl\u00e9s'&&k>=5&&o.length>2&&Math.random()<.4)o[o.length-1]=escucha(n);
 return o;
};
})();
})();
