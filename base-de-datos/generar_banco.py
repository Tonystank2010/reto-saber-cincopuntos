# Reto Saber · Generador del banco de preguntas (borradores originales a partir de plantillas).
# Uso: python3 generar_banco.py [--forzar] [carpeta_contenido]  ->  banco-preguntas.db y banco-preguntas.json
# Si la base ya existe, no la reemplaza salvo con --forzar (perdería los estados de revisión).
# Todas las preguntas salen como 'borrador' y requieren doble revisión humana antes de publicarse.
import random,json,sqlite3,sys,os
R=random.Random(2026);r=R.randint;ch=R.choice;NIV=['Básico','Intermedio','Avanzado']
f=lambda x:'$'+format(x,',').replace(',','.')
def mk(n,comp,en,ok,bad,ex):
    o=[(str(ok),'',1)]+[(str(t),w,0) for t,w in bad]
    if len({x[0] for x in o})<4:return None
    R.shuffle(o)
    return dict(nivel=NIV[n],competencia=comp,enunciado=en,opciones=[dict(id='ABCD'[i],texto=t,why=w) for i,(t,w,c) in enumerate(o)],respuesta='ABCD'[[x[2] for x in o].index(1)],explicacion=ex)
def pick(bank,k,excl):return R.sample([x for x in bank if x!=excl],k)
# ---------- Matemáticas y razonamiento cuantitativo ----------
def m_per(n):
    l=r(4,9+6*n);a=r(2,l-1);k=2*(l+a)
    return mk(n,'Perímetro y área',f'Un terreno rectangular mide {l} m de largo y {a} m de ancho. ¿Cuántos metros de cerca se necesitan para rodearlo?',k,[(l+a,'Sumaste un largo y un ancho, pero faltan los otros dos lados.'),(l*a,'Calculaste el área, no el perímetro.'),(2*l+a,'Olvidaste uno de los anchos.')],f'El perímetro suma los cuatro lados: 2 × ({l} + {a}) = {k} m.')
def m_tri(n):
    b=2*r(2,6+3*n);h=r(3,9+4*n);k=b*h//2
    return mk(n,'Perímetro y área',f'Un triángulo tiene base {b} cm y altura {h} cm. ¿Cuál es su área en cm²?',k,[(b*h,'Olvidaste dividir entre 2.'),(b+h,'Sumaste base y altura en lugar de multiplicar.'),(k+b,'Error de cálculo al combinar las medidas.')],f'Área = (base × altura) ÷ 2 = ({b} × {h}) ÷ 2 = {k} cm².')
def m_desc(n):
    p=r(4,40)*1000*(n+1);d=ch([10,20,25,30,40,50]);x=p*d//100
    return mk(n,'Porcentajes',f'Un artículo cuesta {f(p)} y tiene {d} % de descuento. ¿Cuánto se paga?',f(p-x),[(f(x),'Calculaste el descuento, no el precio final.'),(f(p-d),'Restaste el porcentaje como si fueran pesos.'),(f(p+x),'Sumaste el descuento en lugar de restarlo.')],f'El descuento es {f(x)}; se paga {f(p)} − {f(x)} = {f(p-x)}.')
def m_aum(n):
    p=r(2,30)*1000*(n+1);d=ch([5,10,20,25]);x=p*d//100
    return mk(n,'Porcentajes',f'El precio de un servicio es {f(p)} y sube {d} %. ¿Cuál es el nuevo precio?',f(p+x),[(f(x),'Calculaste solo el aumento.'),(f(p-x),'Restaste el aumento en lugar de sumarlo.'),(f(p+d),'Sumaste el porcentaje como si fueran pesos.')],f'El aumento es {f(x)}; el nuevo precio es {f(p)} + {f(x)} = {f(p+x)}.')
def m_prom(n):
    k=3+n;a=[r(3,15+5*n) for _ in range(k)];a[0]+=(k-sum(a)%k)%k;t=sum(a);v=t//k
    return mk(n,'Promedio',f'Las notas de un estudiante son {", ".join(map(str,a))}. ¿Cuál es el promedio?',v,[(t,'Sumaste los datos y no dividiste.'),(max(a),'Elegiste el dato mayor, no el promedio.'),(v+k,'Dividiste mal o sumaste de más.')],f'Promedio = {t} ÷ {k} = {v}.')
def m_vel(n):
    v=r(40,90);t=r(2,5+n)
    return mk(n,'Velocidad y proporción',f'Un bus viaja a {v} km/h durante {t} horas. ¿Qué distancia recorre?',f'{v*t} km',[(f'{v+t} km','Sumaste velocidad y tiempo en lugar de multiplicar.'),(f'{round(v/t)} km','Dividiste en lugar de multiplicar.'),(f'{v*(t-1)} km','Contaste una hora menos.')],f'Distancia = velocidad × tiempo = {v} × {t} = {v*t} km.')
def m_prop(n):
    c=r(2,6);u=r(1,9)*500;m=c*r(2,4+n)+r(1,3)
    return mk(n,'Velocidad y proporción',f'{c} cuadernos cuestan {f(c*u)}. ¿Cuánto cuestan {m} cuadernos?',f(m*u),[(f((m-c)*u),'Calculaste solo los cuadernos adicionales.'),(f(c*u*m),'Multiplicaste el total por la cantidad.'),(f(m*u+u),'Contaste un cuaderno de más.')],f'Cada cuaderno cuesta {f(u)}; {m} × {f(u)} = {f(m*u)}.')
def m_ec(n):
    if n<1:return None
    x=r(2,12);a=r(1,15);m=r(2,5+n)
    return mk(n,'Ecuaciones',f'Si {m}x + {a} = {m*x+a}, ¿cuál es el valor de x?',x,[(m*x,f'Restaste {a} pero olvidaste dividir entre {m}.'),(x+a,f'Sumaste {a} en lugar de restarlo.'),(x+m,'Confundiste el coeficiente con la incógnita.')],f'Restamos {a}: {m}x = {m*x}. Dividimos entre {m}: x = {x}.')
def m_frac(n):
    d=ch([2,3,4,5,6,8]);a=r(1,d-1);t=d*r(2,12+4*n);k=t//d*a
    return mk(n,'Fracciones',f'¿Cuánto es {a}/{d} de {t}?',k,[(t//d,'Calculaste solo una parte (1/'+str(d)+').'),(t-k,'Calculaste lo que falta, no lo pedido.'),(t*a,'Multiplicaste sin dividir entre el denominador.')],f'{t} ÷ {d} = {t//d}; y {t//d} × {a} = {k}.')
def m_prob(n):
    a=r(1,6+3*n);b=r(1,8+3*n);t=a+b
    return mk(n,'Probabilidad',f'Una bolsa tiene {a} bolas rojas y {b} azules. Si se saca una al azar, ¿cuál es la probabilidad de que sea roja?',f'{a}/{t}',[(f'{a}/{b}','Comparaste las rojas con las azules, no con el total.'),(f'{b}/{t}','Calculaste la probabilidad de la bola azul.'),(f'1/{t}','Contaste una sola bola en lugar de todas las rojas.')],f'Casos favorables {a} entre casos posibles {t}: {a}/{t}.')
def m_conv(n):
    u,v2,k=ch([('km','m',1000),('h','min',60),('kg','g',1000),('m','cm',100),('min','s',60)]);v=r(2,9+6*n)
    return mk(n,'Unidades',f'¿A cuántos {v2} equivalen {v} {u}?',v*k,[(v*k*10,'Multiplicaste de más (error de escala).'),(v+k,'Sumaste en lugar de multiplicar por la equivalencia.'),(v*k//10 if (v*k)%10==0 else v*(k+1),'Usaste una equivalencia incorrecta.')],f'1 {u} = {k} {v2}; {v} × {k} = {v*k}.')
def m_lin(n):
    if n<1:return None
    a=r(2,5+n);b=r(1,9);c=r(2,8)
    return mk(n,'Funciones',f'Si f(x) = {a}x + {b}, ¿cuánto vale f({c})?',a*c+b,[(a*(c+b),'Multiplicaste el coeficiente por la suma.'),(a+b+c,'Sumaste todos los valores.'),(a*c*b,'Multiplicaste también por el término independiente.')],f'f({c}) = {a}·{c} + {b} = {a*c+b}.')
def m_med(n):
    if n<1:return None
    L=R.sample(range(3,40),5);s=sorted(L)
    return mk(n,'Estadística',f'¿Cuál es la mediana de los datos {", ".join(map(str,L))}?',s[2],[(L[2],'Tomaste el dato central sin ordenar.'),(s[3],'Tomaste otra posición al ordenar.'),(sum(L)//5,'Calculaste el promedio, no la mediana.')],f'Ordenados: {", ".join(map(str,s))}. El dato central es {s[2]}.')
def r_tab(n):
    a,b,c=[r(2,20+10*n)*10 for _ in range(3)];t=a+b+c
    return mk(n,'Lectura de tablas',f'Una tabla muestra ventas de {a}, {b} y {c} unidades en tres meses. ¿Cuántas unidades se vendieron en total?',t,[(a+b,'Dejaste por fuera el último mes.'),(t//3,'Calculaste el promedio, no el total.'),(max(a,b,c),'Elegiste el mes con más ventas.')],f'Total = {a} + {b} + {c} = {t}.')
def r_var(n):
    a=r(2,12)*100;p=ch([10,20,25,50]);b=a*(100+p)//100
    return mk(n,'Variación porcentual',f'Las ventas pasaron de {a} a {b} unidades. ¿Cuál fue el aumento porcentual?',f'{p} %',[(f'{b-a} %','Usaste la diferencia absoluta como si fuera porcentaje.'),(f'{100+p} %','Incluiste el 100 % inicial en el aumento.'),(f'{p//2} %','Dividiste el cambio entre dos.')],f'Aumento = ({b} − {a}) ÷ {a} × 100 = {p} %.')
def r_gas(n):
    k=ch([40,50,100,120]);g=r(2,6);m=r(2,4+n)
    return mk(n,'Razones y tasas',f'Un carro gasta {g} galones cada {k} km. ¿Cuántos galones necesita para recorrer {k*m} km?',g*m,[(g+m,'Sumaste en lugar de aplicar la razón.'),(g*k,'Multiplicaste por los kilómetros de la razón.'),(g*(m+1),'Contaste un tramo de más.')],f'{k*m} km son {m} tramos de {k} km: {m} × {g} = {g*m} galones.')
def r_int(n):
    c=r(2,20)*100000;p=ch([1,2,3,5]);t=r(2,6+n);i=c*p*t//100
    return mk(n,'Interés simple',f'Se invierten {f(c)} al {p} % mensual simple durante {t} meses. ¿Cuánto interés se gana?',f(i),[(f(c*p//100),'Calculaste el interés de un solo mes.'),(f(c+i),'Diste el valor total, no solo el interés.'),(f(i*10),'Error de escala en el porcentaje.')],f'Interés = capital × tasa × tiempo = {f(c)} × {p} % × {t} = {f(i)}.')
# ---------- Ciencias naturales ----------
def c_vel(n):
    t=r(2,9+2*n);v=r(3,20+5*n)
    return mk(n,'Movimiento',f'Un ciclista recorre {v*t} m en {t} s a velocidad constante. ¿Cuál es su velocidad?',f'{v} m/s',[(f'{v*t*t} m/s','Multiplicaste distancia por tiempo.'),(f'{v*t+t} m/s','Sumaste distancia y tiempo.'),(f'{round(t/(v*t),2)} m/s','Invertiste la división (tiempo entre distancia).')],f'v = d ÷ t = {v*t} ÷ {t} = {v} m/s.')
def c_dens(n):
    d=r(1,9+n);V=r(2,10+3*n);m=d*V
    return mk(n,'Materia',f'Un objeto tiene masa {m} g y volumen {V} cm³. ¿Cuál es su densidad?',f'{d} g/cm³',[(f'{m*V} g/cm³','Multiplicaste masa y volumen.'),(f'{round(V/m,2)} g/cm³','Invertiste la relación (volumen entre masa).'),(f'{m+V} g/cm³','Sumaste masa y volumen.')],f'Densidad = masa ÷ volumen = {m} ÷ {V} = {d} g/cm³.')
def c_ohm(n):
    i=r(2,9+n);R_=r(2,12+2*n)
    return mk(n,'Electricidad',f'Por una resistencia de {R_} Ω circula una corriente de {i} A. ¿Cuál es el voltaje?',f'{i*R_} V',[(f'{R_+i} V','Sumaste resistencia y corriente.'),(f'{round(R_/i,2)} V','Dividiste resistencia entre corriente.'),(f'{i*R_*2} V','Duplicaste el resultado sin razón.')],f'Ley de Ohm: V = I × R = {i} × {R_} = {i*R_} V.')
def c_fza(n):
    m=r(2,20+5*n);a=r(2,9)
    return mk(n,'Fuerzas',f'Una caja de {m} kg se acelera a {a} m/s². ¿Qué fuerza neta actúa sobre ella?',f'{m*a} N',[(f'{m+a} N','Sumaste masa y aceleración.'),(f'{m*a+m} N','Sumaste la masa al resultado.'),(f'{abs(m-a)} N','Restaste masa y aceleración.')],f'F = m × a = {m} × {a} = {m*a} N.')
def c_conc(n):
    c=r(2,9+n);V=r(2,8);g=c*V
    return mk(n,'Soluciones',f'Se disuelven {g} g de sal en {V} L de solución. ¿Cuál es la concentración en g/L?',f'{c} g/L',[(f'{g*V} g/L','Multiplicaste masa y volumen.'),(f'{g+V} g/L','Sumaste masa y volumen.'),(f'{V} g/L','Tomaste el volumen como concentración.')],f'Concentración = {g} g ÷ {V} L = {c} g/L.')
def c_temp(n):
    c=r(-10,100)
    return mk(n,'Temperatura',f'Convierte {c} °C a kelvin (usa K = °C + 273).',c+273,[(c-273,'Restaste en lugar de sumar.'),(round(c*9/5+32),'Convertiste a grados Fahrenheit.'),(c+100,'Sumaste una constante equivocada.')],f'K = {c} + 273 = {c+273}.')
def c_pun(n):
    dom,rec=ch([('flores moradas','flores blancas'),('semilla lisa','semilla rugosa'),('tallo alto','tallo bajo'),('pelaje oscuro','pelaje claro')]);g1,g2,p=ch([('Aa','Aa',25),('Aa','aa',50),('AA','aa',0),('Aa','AA',0),('AA','Aa',0)])
    o=[x for x in [0,25,50,75,100] if x!=p]
    return mk(n,'Genética',f'En una especie, {dom} (A) domina sobre {rec} (a). Si se cruzan {g1} × {g2}, ¿qué porcentaje de la descendencia tendrá {rec}?',f'{p} %',[(f'{x} %','No coincide con la proporción del cuadro de Punnett.') for x in R.sample(o,3)],f'En el cuadro de Punnett de {g1} × {g2}, el {p} % de la descendencia es aa.')
def c_ph(n):
    k=R.choice(['a','n','b']);v={'a':r(1,5),'n':7,'b':r(9,13)}[k] if n<2 else {'a':round(R.uniform(5.5,6.9),1),'n':7.0,'b':round(R.uniform(7.1,8.5),1)}[k]
    ok={'a':'Ácida','n':'Neutra','b':'Básica'}[k]
    return mk(n,'Ácidos y bases',f'Una sustancia tiene pH {v}. ¿Cómo se clasifica?',ok,[(x,'Revisa la escala: menos de 7 es ácida, 7 neutra y más de 7 básica.') for x in ['Ácida','Neutra','Básica','Salina'] if x!=ok],f'Con pH {v} la sustancia es {ok.lower()}.')
CAD=[('el pasto','productor'),('las algas','productor'),('el roble','productor'),('el conejo','consumidor primario'),('la vaca','consumidor primario'),('la oruga','consumidor primario'),('el saltamontes','consumidor primario'),('el zorro','consumidor secundario'),('la rana','consumidor secundario'),('la serpiente','consumidor secundario'),('los hongos','descomponedor'),('las bacterias del suelo','descomponedor')]
def c_cad(n):
    x,rol=ch(CAD);ro=['productor','consumidor primario','consumidor secundario','descomponedor']
    return mk(n,'Ecosistemas',f'En una cadena alimenticia, ¿qué papel cumple {x}?',rol,[(t,'Ese papel corresponde a otro nivel de la cadena.') for t in ro if t!=rol],f'{x.capitalize()} es {rol}.')
EST=[('Un cubo de hielo se derrite sobre la mesa.','fusión'),('El agua de una olla hierve y se convierte en vapor.','ebullición'),('El vapor del baño forma gotas en el espejo frío.','condensación'),('El agua líquida se convierte en hielo en el congelador.','solidificación'),('El hielo seco pasa directamente a gas.','sublimación')]
def c_est(n):
    s,a=ch(EST);ro=['fusión','ebullición','condensación','solidificación','sublimación']
    return mk(n,'Cambios de estado',f'¿Qué cambio de estado ocurre aquí? «{s}»',a,[(t,'Ese cambio describe otro paso entre estados de la materia.') for t in R.sample([x for x in ro if x!=a],3)],f'El cambio descrito es {a}.')
# ---------- Sociales y competencias ciudadanas ----------
CAP=[('Amazonas','Leticia'),('Antioquia','Medellín'),('Arauca','Arauca'),('Atlántico','Barranquilla'),('Bolívar','Cartagena'),('Boyacá','Tunja'),('Caldas','Manizales'),('Caquetá','Florencia'),('Casanare','Yopal'),('Cauca','Popayán'),('Cesar','Valledupar'),('Chocó','Quibdó'),('Córdoba','Montería'),('Cundinamarca','Bogotá'),('Guainía','Inírida'),('Guaviare','San José del Guaviare'),('Huila','Neiva'),('La Guajira','Riohacha'),('Magdalena','Santa Marta'),('Meta','Villavicencio'),('Nariño','Pasto'),('Norte de Santander','Cúcuta'),('Putumayo','Mocoa'),('Quindío','Armenia'),('Risaralda','Pereira'),('Santander','Bucaramanga'),('Sucre','Sincelejo'),('Tolima','Ibagué'),('Valle del Cauca','Cali'),('Vaupés','Mitú'),('Vichada','Puerto Carreño')]
def s_cap(n):
    d,c=ch(CAP);o=pick(CAP,3,(d,c))
    return mk(n,'Geografía de Colombia',f'¿Cuál es la capital del departamento de {d}?',c,[(y,f'{y} es la capital de {x}.') for x,y in o],f'La capital de {d} es {c}.')
def s_cap2(n):
    d,c=ch(CAP);o=pick(CAP,3,(d,c))
    return mk(n,'Geografía de Colombia',f'¿De qué departamento es capital {c}?',d,[(x,f'{x} tiene como capital a {y}.') for x,y in o],f'{c} es la capital de {d}.')
def s_par(n):
    o=R.sample(CAP,4);d,c=o[0];bad=[]
    for x,y in o[1:]:
        z=ch([w for _,w in CAP if w not in(y,)]);bad.append((f'{x}: {z}',f'La capital de {x} es {y}.'))
    return mk(n,'Geografía de Colombia','¿Cuál de estas parejas departamento–capital es correcta?',f'{d}: {c}',bad,f'La capital de {d} es {c}.')
FUN=[('Hacer y reformar las leyes','Rama legislativa'),('Ejercer control político sobre el Gobierno','Rama legislativa'),('Hacer cumplir las leyes y dirigir la administración','Rama ejecutiva'),('Ejercer la jefatura del Estado y del Gobierno','Rama ejecutiva'),('Administrar justicia y resolver conflictos mediante sentencias','Rama judicial'),('Interpretar la ley en casos concretos','Rama judicial'),('Vigilar el manejo de los recursos públicos','Órganos de control'),('Defender los derechos humanos y vigilar la conducta de los funcionarios','Órganos de control')]
RAM=['Rama legislativa','Rama ejecutiva','Rama judicial','Órganos de control']
def s_fun(n):
    fu,ra=ch(FUN)
    return mk(n,'Organización del Estado',f'¿A qué rama u órgano del poder público corresponde esta función: «{fu}»?',ra,[(x,'Esa rama cumple funciones distintas.') for x in RAM if x!=ra],f'Esa función corresponde a la {ra[0].lower()+ra[1:]}.' if ra.startswith('Rama') else f'Esa función corresponde a los {ra[0].lower()+ra[1:]}.')
def s_fun2(n):
    ra=ch(RAM);fu=ch([a for a,b in FUN if b==ra]);o=R.sample([a for a,b in FUN if b!=ra],3)
    return mk(n,'Organización del Estado',f'¿Cuál de estas funciones corresponde a: {ra.lower()}?',fu,[(x,'Pertenece a otra rama u órgano.') for x in o],f'La función «{fu}» corresponde a: {ra.lower()}.')
MEC=[('el voto','Expresión de la voluntad de elegir a quienes gobernarán','Una ciudadana acude a las urnas para escoger al alcalde de su municipio.'),('la revocatoria del mandato','Los ciudadanos pueden dar por terminado el mandato de un alcalde o gobernador antes de que concluya su periodo','Vecinos reúnen firmas para pedir que el alcalde deje el cargo antes de terminar su periodo.'),('el cabildo abierto','Reunión pública del concejo para que los habitantes discutan asuntos de interés de la comunidad','El concejo abre una sesión para que los habitantes opinen sobre el plan de basuras del barrio.'),('el referendo','Convocatoria al pueblo para que apruebe o rechace un proyecto de norma o derogue una norma vigente','Se convoca a votar si se aprueba o se rechaza una reforma a una ley.'),('el plebiscito','Pronunciamiento del pueblo para apoyar o rechazar una decisión del Presidente de la República','El Presidente pide a los ciudadanos que respalden o rechacen una decisión que tomó.'),('la consulta popular','Pregunta de carácter general sobre un asunto de trascendencia que el pueblo responde con sí o no','El municipio pregunta con un sí o no si los habitantes apoyan una obra de interés general.')]
def s_mec(n):
    m=ch(MEC);o=R.sample([x for x in MEC if x!=m],3)
    return mk(n,'Participación ciudadana',f'¿Cómo se llama el mecanismo de participación descrito así: «{m[1]}»?',m[0],[(x[0],'Ese mecanismo tiene otra definición.') for x in o],f'Se trata de {m[0]}.')
def s_sit(n):
    m=ch(MEC);o=R.sample([x for x in MEC if x!=m],3)
    return mk(n,'Participación ciudadana',f'¿Qué mecanismo de participación se está usando? «{m[2]}»',m[0],[(x[0],'No corresponde a la situación descrita.') for x in o],f'La situación corresponde a {m[0]}.')
EVT=[('el Grito de Independencia en Santafé',1810),('la Batalla de Boyacá',1819),('la abolición legal de la esclavitud en Colombia',1851),('la Constitución de 1886',1886),('la Constitución Política vigente',1991)]
def s_evt(n):
    e,y=ch(EVT);o=R.sample([x for x in [1781,1810,1819,1830,1851,1886,1930,1948,1957,1991] if x!=y],3)
    return mk(n,'Historia de Colombia',f'¿En qué año ocurrió {e}?',y,[(x,'Esa fecha corresponde a otro hecho histórico.') for x in o],f'{e[0].upper()+e[1:]} ocurrió en {y}.')
DER=[('Una clínica se niega a atender una urgencia vital de un menor.','derecho a la salud'),('Una escuela impide que una niña estudie por venir de otra región.','derecho a la educación'),('Un alcalde prohíbe a un periodista criticar su gestión.','libertad de expresión'),('Una persona es detenida sin orden de una autoridad competente.','libertad personal'),('Una empresa despide a una empleada solo por estar embarazada.','derecho al trabajo y a la igualdad'),('Un vecino es agredido y las autoridades no protegen su integridad.','derecho a la vida y a la integridad')]
def c_der(n):
    s,d=ch(DER);o=R.sample([x for _,x in DER if x!=d],3)
    return mk(n,'Derechos fundamentales',f'¿Qué derecho se vulnera en esta situación? «{s}»',d,[(x,'Ese derecho no es el que se afecta aquí.') for x in o],f'Se vulnera el {d}.' if d.startswith('derecho') else f'Se vulnera la {d}.')
RT=['la vida','la libertad de expresión','la educación','la salud','el libre desarrollo de la personalidad','la igualdad ante la ley'];NR=['recibir un automóvil del Estado','escoger qué leyes cumplir','no pagar impuestos','exigir un empleo específico']
def c_rights(n):
    d=ch(RT)
    return mk(n,'Derechos fundamentales','¿Cuál de estas opciones es un derecho fundamental?',d[0].upper()+d[1:],[(x[0].upper()+x[1:],'No es un derecho fundamental reconocido por la Constitución.') for x in R.sample(NR,3)],f'El derecho a {d} está reconocido como fundamental.')
ESC=[('Dos compañeros discuten por un balón y empiezan a gritarse.','Proponer que cada uno exponga su versión y buscar un acuerdo.',['Ponerse del lado del más fuerte.','Ignorar el conflicto y salir del salón.','Publicar la pelea en redes sociales.']),('Un vecino pone música muy alta en la noche.','Hablarle con respeto y, si no cambia, acudir a la junta comunal o a la autoridad.',['Responder con música aún más alta.','Insultarlo en la calle.','Dañar su puerta.']),('Una compañera nueva es excluida de los grupos de trabajo.','Invitarla a participar y valorar sus aportes.',['Dejarla sola para evitar problemas.','Burlarse de su forma de hablar.','Decirle que busque otro curso.']),('Pierde la propuesta que defendías en la votación del curso.','Aceptar el resultado y colaborar con la propuesta ganadora.',['Desconocer la votación.','Convencer a otros de no participar.','Culpar al resto del curso.']),('Encuentras una billetera con documentos en el parque.','Entregarla a la autoridad o buscar a su dueño.',['Quedarte con el dinero y botar los documentos.','Dejarla donde está.','Usar los documentos para tu beneficio.']),('Un grupo comparte un rumor falso sobre un docente.','No difundirlo y verificar la información antes de compartirla.',['Compartirlo para que todos sepan.','Agregarle detalles para hacerlo más creíble.','Reírte del docente en el chat.']),('Debes elegir al representante del curso.','Informarte de las propuestas y votar con criterio propio.',['Votar por quien te regale algo.','No votar para evitar problemas.','Votar por quien elijan tus amigos sin pensar.']),('Notas que un compañero es agredido verbalmente por su apariencia.','Rechazar la agresión, apoyar al compañero y avisar a un adulto responsable.',['Reírte para encajar con el grupo.','Grabarlo y compartirlo.','Mirar y no hacer nada.'])]
def c_esc(n):
    s,ok,bad=ch(ESC)
    return mk(n,'Convivencia y mediación',f'Situación: {s} ¿Cuál es la mejor respuesta?',ok,[(b,'Esa acción deteriora la convivencia o evade la responsabilidad.') for b in bad],'La mejor respuesta protege los derechos de todos y busca el diálogo.')
# ---------- Lectura crítica ----------
HEC=['El agua hierve a 100 °C al nivel del mar.','Colombia tiene costas en el mar Caribe y en el océano Pacífico.','La Tierra tarda cerca de un año en dar una vuelta al Sol.','Bogotá es la capital de Colombia.','El corazón humano bombea sangre por todo el cuerpo.','La Constitución vigente de Colombia fue promulgada en 1991.','Los mamíferos alimentan a sus crías con leche.','El río Amazonas atraviesa varios países de Suramérica.','El ser humano necesita oxígeno para respirar.','Un triángulo tiene tres lados.','Julio tiene 31 días.','Las plantas realizan la fotosíntesis.']
OPI=['El fútbol es el deporte más emocionante.','Las películas antiguas son mejores que las actuales.','Estudiar de noche es la mejor manera de aprender.','El invierno es la estación más triste.','La música clásica es aburrida.','Los gatos son mejores mascotas que los perros.','Las clases de arte son una pérdida de tiempo.','Vivir en la ciudad es mucho mejor que vivir en el campo.','Los videojuegos son demasiado peligrosos para los jóvenes.','La comida casera siempre sabe mejor.']
def l_hec(n):
    if R.random()<.5:
        a=ch(HEC);return mk(n,'Hechos y opiniones','¿Cuál de estas afirmaciones es un hecho verificable?',a,[(x,'Expresa una valoración personal; no puede comprobarse.') for x in R.sample(OPI,3)],'Un hecho se puede comprobar con evidencia; las opiniones expresan valoraciones.')
    a=ch(OPI);return mk(n,'Hechos y opiniones','¿Cuál de estas afirmaciones es una opinión?',a,[(x,'Es un dato que puede verificarse.') for x in R.sample(HEC,3)],'Una opinión expresa una valoración que no puede comprobarse con datos.')
SIN=[('ardua','difícil',['breve','agradable','confusa'],'La tarea fue ardua y nos tomó toda la tarde.'),('escasos','pocos',['muchos','grandes','baratos'],'Los recursos del pueblo eran escasos.'),('veloz','rápido',['lento','pesado','silencioso'],'El corredor era muy veloz.'),('prudente','cuidadoso',['descuidado','alegre','impaciente'],'Fue prudente al cruzar la calle.'),('sincero','honesto',['tímido','mentiroso','distraído'],'Su respuesta fue sincera.'),('diminuto','muy pequeño',['muy alto','muy pesado','muy antiguo'],'Encontró un insecto diminuto.'),('agotado','muy cansado',['muy feliz','muy rico','muy lejano'],'Llegó agotado después de la caminata.'),('valiente','audaz',['temeroso','callado','lento'],'La valiente niña se lanzó al agua.'),('apacible','tranquilo',['ruidoso','peligroso','oscuro'],'La tarde era apacible.'),('enorme','muy grande',['muy débil','muy corto','muy joven'],'Vimos un edificio enorme.')]
def l_sin(n):
    w,s,b,t=ch(SIN)
    return mk(n,'Vocabulario en contexto',f'En la oración «{t}», la palabra «{w}» significa:',s,[(x,'No se ajusta al sentido de la oración.') for x in b],f'En ese contexto, «{w}» equivale a «{s}».')
REL={'causa':['porque','ya que','debido a que'],'consecuencia':['por eso','por lo tanto','en consecuencia'],'contraste':['sin embargo','pero','no obstante'],'adición':['además','también','asimismo']}
CON=[('Llovió toda la tarde','el partido se aplazó','consecuencia'),('Estudió toda la noche','aprobó el examen','consecuencia'),('No salimos al parque','hacía mucho frío','causa'),('El museo es pequeño','tiene una colección enorme','contraste'),('Ana ahorró durante un año','compró su bicicleta','consecuencia'),('Llegó tarde','el bus se averió','causa'),('El plan era sencillo','fue difícil ejecutarlo','contraste'),('Cultivan café','cultivan cacao','adición'),('El río creció','las familias evacuaron','consecuencia'),('La película es larga','tiene un final emocionante','contraste')]
def l_con(n):
    a,b,rl=ch(CON);ok=ch(REL[rl]);o=[ch(REL[k]) for k in REL if k!=rl]
    t=f'«{a} {{}} {b}.»' if rl=='causa' else f'«{a}. {{}}, {b}.»'
    return mk(n,'Conectores y cohesión','Completa con el conector adecuado: '+t.format('___'),ok,[(x,'Ese conector expresa otra relación entre las ideas.') for x in o],f'La relación entre las ideas es de {rl}; el conector «{ok}» la expresa.')
def l_rel(n):
    a,b,rl=ch(CON)
    return mk(n,'Conectores y cohesión',f'¿Qué relación hay entre las ideas «{a}» y «{b}»?',rl,[(k,'Esa relación no describe cómo se conectan las ideas.') for k in REL if k!=rl],f'Las ideas se relacionan por {rl}.')
INF=[('Marta llegó a casa empapada y dejó el paraguas roto junto a la puerta.','¿Qué se puede inferir?','Había llovido con fuerza.',['Marta nunca salió de su casa.','Hacía mucho calor.','El paraguas era nuevo y funcionaba.'],'El estado de Marta y del paraguas sugiere una lluvia fuerte.'),('Pedro revisó tres veces la hora, caminó de un lado a otro y no probó el almuerzo mientras esperaba la llamada.','¿Cómo se sentía Pedro?','Nervioso por la llamada.',['Aburrido de esperar.','Muy tranquilo.','Enojado con su familia.'],'Sus acciones muestran inquietud.'),('En la biblioteca del pueblo ya no quedan libros de cuentos: todos los niños los han prestado este mes.','¿Qué se puede inferir?','Los niños del pueblo leen con frecuencia.',['A los niños no les gusta leer.','La biblioteca cerró.','Los libros se perdieron.'],'Que todos estén prestados indica mucho interés por la lectura.'),('Aunque el equipo perdió, los aficionados aplaudieron de pie.','¿Por qué aplaudieron?','Reconocieron el esfuerzo del equipo.',['Estaban enojados con el árbitro.','Querían irse del estadio.','Creían que habían ganado.'],'«Aunque» contrasta la derrota con el aplauso: valoraron el esfuerzo.'),('Un anuncio dice: «El 90 % de los clientes recomienda nuestro producto», pero no dice cuántos fueron consultados.','¿Qué debilidad tiene el argumento?','No indica cuántas personas respondieron, así que el porcentaje puede no ser representativo.',['Usa porcentajes, y los porcentajes siempre engañan.','Habla bien del producto.','Está escrito entre comillas.'],'Sin conocer el tamaño de la muestra no se puede valorar el dato.'),('Un texto afirma que los helados causan ahogamientos porque en verano aumentan ambos.','¿Qué error de razonamiento contiene?','Confunde una coincidencia con una relación de causa.',['Usa palabras difíciles.','Habla del verano.','Compara dos cifras.'],'Que dos hechos coincidan en el tiempo no prueba que uno cause el otro.'),('La alcaldía anunció que los buses no circularán el domingo porque se hará mantenimiento de las vías.','¿Qué se puede inferir?','Ese día habrá obras en las vías.',['Los buses se dañaron.','Habrá una fiesta en el pueblo.','Las vías están cerradas para siempre.'],'La causa del anuncio es el mantenimiento.'),('Laura guardó el instrumento en su estuche con cuidado y se despidió del maestro con una sonrisa.','¿Qué se puede inferir sobre Laura?','Valoraba su instrumento y su clase.',['Odiaba la música.','Estaba enojada con el maestro.','Perdió su instrumento.'],'Sus gestos cuidadosos y su sonrisa muestran aprecio.')]
def l_inf(n):
    t,q,ok,bad,ex=ch(INF)
    return mk(n,'Inferencia y crítica',f'Lee: «{t}» {q}',ok,[(b,'No tiene apoyo en el texto.') for b in bad],ex)
# ---------- Comunicación escrita ----------
SS=['El estudiante','La profesora','El grupo','Mi hermano','La comunidad','El equipo','Ese libro'];PP=['Los estudiantes','Las profesoras','Mis hermanos','Las comunidades','Esos libros','Los equipos']
VB=[('presentar','presenta','presentan','el informe'),('leer','lee','leen','el artículo'),('escribir','escribe','escriben','una carta'),('resolver','resuelve','resuelven','el problema'),('organizar','organiza','organizan','la actividad'),('entregar','entrega','entregan','la tarea'),('revisar','revisa','revisan','los resultados')]
def e_conc(n):
    inf,s,p,c=ch(VB);pl=R.random()<.5;sj=ch(PP if pl else SS);ok=p if pl else s;ot=s if pl else p
    return mk(n,'Concordancia',f'Elige la forma verbal que concuerda: «{sj} ___ {c}.»',ok,[(ot,'No concuerda en número con el sujeto.'),(inf,'El infinitivo no puede ser el verbo conjugado de la oración.'),({'leer':'leyendo'}.get(inf,inf[:-2]+('ando' if inf.endswith('ar') else 'iendo')),'El gerundio no funciona como verbo principal aquí.')],'El verbo debe concordar en número con el sujeto.')
ORT=[('exhibición',['exivición','exhibisión','ehibición']),('excepción',['exepción','excepsión','ecepción']),('vegetal',['begetal','vejetal','vegetál']),('bienvenida',['bienbenida','vienvenida','bienvenía']),('conocimiento',['conosimiento','konocimiento','conocimento']),('aprendizaje',['aprendisaje','aprendizage','aprehndizaje']),('decisión',['desición','decizión','decision']),('esfuerzo',['esfuerso','ezfuerzo','esfuerzó']),('ciudadanía',['ciudadania','siudadanía','ciudadanya']),('dificultad',['dificultat','difisultad','difícultad']),('vehículo',['vehiculo','behículo','vehícolo']),('mayúscula',['mayuscula','mallúscula','mayúsqula'])]
def e_ort(n):
    if n==0 or R.random()<.5:
        c,b=ch(ORT);return mk(n,'Ortografía','¿Cuál palabra está escrita correctamente?',c,[(x,f'La forma correcta es «{c}».') for x in b],f'La escritura correcta es «{c}».')
    c,b=ch(ORT);o=R.sample([x for x,_ in ORT if x!=c],3);m=ch(b)
    return mk(n,'Ortografía','¿Cuál palabra está mal escrita?',m,[(x,'Está bien escrita.') for x in o],f'La forma correcta de «{m}» es «{c}».')
REG=[('Oye, pásame ese informe ya.','Por favor, envíeme el informe cuando le sea posible.'),('No pude ir porque me dio flojera.','No pude asistir por inconvenientes personales.'),('Tu propuesta está chévere.','Su propuesta es muy pertinente.'),('Mándame el archivo ya mismo.','Le agradezco enviarme el archivo a la brevedad.'),('Eso no sirve para nada.','Considero que esa opción no resulta adecuada.'),('Nos vemos mañana, parce.','Nos reuniremos mañana.')]
def e_reg(n):
    i,fo=ch(REG);o=R.sample([x for _,x in REG if x!=fo],3)
    return mk(n,'Registro formal',f'¿Cuál es la versión más adecuada para una carta formal de: «{i}»?',fo,[(x,'Es formal, pero cambia el sentido del mensaje original.') for x in o],'El registro formal conserva el mensaje y usa un tono respetuoso.')
TEM=[('El reciclaje reduce los residuos.','Al separar materiales, llega menos basura a los rellenos sanitarios.'),('Dormir bien mejora el rendimiento escolar.','Un cerebro descansado concentra mejor la atención durante las clases.'),('Leer a diario amplía el vocabulario.','Cada lectura expone a palabras nuevas que se aprenden en contexto.'),('El deporte cuida la salud.','La actividad física regular fortalece el corazón y reduce el estrés.'),('Ahorrar agua beneficia a toda la comunidad.','Cerrar las llaves mientras no se usan evita desperdicios y baja los costos.'),('Trabajar en equipo facilita los proyectos.','Al repartir tareas, cada persona aporta según sus fortalezas.')]
IRR=['Me gustan los parques de mi ciudad.','Algunas personas viajan en bus.','El clima cambia en octubre.','Mi vecino tiene un perro grande.','Los lunes hay mercado.','La película empieza a las siete.','El libro tiene cien páginas.','En la tienda venden helados.']
def e_tem(n):
    t,a=ch(TEM)
    return mk(n,'Párrafo y coherencia',f'Un párrafo empieza con la idea «{t}» ¿Qué oración la desarrolla mejor?',a,[(x,'No se relaciona con la idea principal.') for x in R.sample(IRR,3)],'La idea de apoyo debe explicar o sustentar la idea principal.')
# ---------- Inglés ----------
SJ=[('She','s'),('He','s'),('My sister','s'),('The teacher','s'),('They','p'),('We','p'),('My friends','p'),('I','p'),('You','p')]
VE=[('go','goes','went','gone','going',['to school','to the market']),('eat','eats','ate','eaten','eating',['breakfast','an apple']),('write','writes','wrote','written','writing',['a letter','an email']),('buy','buys','bought','bought','buying',['a book','some bread']),('see','sees','saw','seen','seeing',['a movie','the doctor']),('take','takes','took','taken','taking',['the bus','a photo']),('play','plays','played','played','playing',['soccer','the guitar']),('study','studies','studied','studied','studying',['English','math']),('make','makes','made','made','making',['dinner','a cake']),('drink','drinks','drank','drunk','drinking',['water','juice'])]
def en1(n):
    s,k=ch(SJ);b,t3,pa,pp,g,ob=ch(VE);o=ch(ob);ok=t3 if k=='s' else b;ot=b if k=='s' else t3
    return mk(n,'Present simple',f'{s} ___ {o} every day.',ok,[(ot,'Revisa la -s del verbo: se usa con he, she o it.' if k=='s' else 'La -s solo se usa con he, she o it.'),(g,'Falta el auxiliar «am/is/are» para usar -ing.'),(pa,'El pasado no combina con «every day».')],'En presente simple, he/she/it lleva -s; los demás sujetos usan el verbo base.')
def en2(n):
    s,k=ch(SJ);b,t3,pa,pp,g,ob=ch(VE);o=ch(ob)
    return mk(n,'Past simple',f'Yesterday, {s if s=="I" else s[0].lower()+s[1:]} ___ {o}.',pa,[(b,'Es presente: ayer pide pasado.'),(g,'Falta «was/were» para usar -ing.'),(f'will {b}','Es futuro; «yesterday» pide pasado.')],f'«Yesterday» indica pasado: {pa}.')
def en3(n):
    s,k=ch(SJ);b,t3,pa,pp,g,ob=ch(VE);o=ch(ob);be='am' if s=='I' else 'is' if k=='s' else 'are'
    return mk(n,'Present continuous',f'Right now, {s} {be} ___ {o}.',g,[(b,'Con «am/is/are» el verbo lleva -ing.'),(pa,'El pasado no se combina con «am/is/are».'),(t3,'Con «am/is/are» el verbo lleva -ing.')],'«Right now» pide presente continuo: am/is/are + verbo con -ing.')
def en4(n):
    s,k=ch(SJ);b,t3,pa,pp,g,ob=ch(VE);o=ch(ob);h='has' if k=='s' else 'have'
    return mk(n,'Present perfect',f'{s} {h} already ___ {o}.',pp,[(b,'Con «have/has» se usa el participio pasado.'),(g,'Con «have/has» se usa el participio, no -ing.'),(f'to {b}','Con «have/has» se usa el participio pasado.')],'Present perfect = have/has + participio pasado.')
PR=[('at',"five o'clock"),('at','night'),('at','noon'),('in','July'),('in','the morning'),('in','2021'),('in','summer'),('on','Monday'),('on','my birthday'),('on','Friday evening')]
def en5(n):
    p,w=ch(PR);fr=ch(['The party is ___ {}.','We meet ___ {}.','I usually study ___ {}.','My sister travels ___ {}.'])
    return mk(n,'Prepositions',fr.format(w).replace('___','___'),p,[(x,'Esa preposición no se usa con esta expresión de tiempo.') for x in ['at','in','on','from'] if x!=p],f'Se dice «{p} {w}».')
VO=[('dog','perro'),('house','casa'),('book','libro'),('water','agua'),('friend','amigo'),('school','escuela'),('teacher','profesor'),('window','ventana'),('kitchen','cocina'),('brother','hermano'),('apple','manzana'),('rain','lluvia'),('door','puerta'),('street','calle'),('city','ciudad'),('mother','madre'),('table','mesa'),('chair','silla'),('night','noche'),('week','semana'),('month','mes'),('tree','árbol'),('river','río'),('bread','pan')]
def en6(n):
    e,s=ch(VO)
    if R.random()<.5:return mk(n,'Vocabulary',f'¿Qué significa «{e}» en español?',s,[(y,f'«{x}» se dice así en inglés.') for x,y in R.sample([v for v in VO if v!=(e,s)],3)],f'«{e}» significa «{s}».')
    return mk(n,'Vocabulary',f'¿Cómo se dice «{s}» en inglés?',e,[(x,f'«{x}» significa «{y}».') for x,y in R.sample([v for v in VO if v!=(e,s)],3)],f'«{s}» se dice «{e}».')
CP=[('big','bigger','biggest'),('tall','taller','tallest'),('cheap','cheaper','cheapest'),('fast','faster','fastest'),('heavy','heavier','heaviest'),('expensive','more expensive','the most expensive'),('interesting','more interesting','the most interesting'),('difficult','more difficult','the most difficult')]
def en7(n):
    a,c,sp=ch(CP);sup=not sp.startswith('the');sp=sp if sp.startswith('the') else 'the '+sp;long=' ' in c
    if R.random()<.5:return mk(n,'Comparatives',f'This bag is ___ than that one. ({a})',c,[(a,'Falta la forma comparativa.'),(sp,'Es la forma superlativa.'),(('more '+a) if not long else a+'er','Esa forma no es correcta para este adjetivo.')],'Con «than» se usa el comparativo.')
    return mk(n,'Comparatives',f'This is ___ book in the store. ({a})',sp,[(a,'Falta la forma superlativa.'),(c,'Es la forma comparativa.'),(('the more '+a) if not long else 'the '+a+'er','Esa forma no es correcta.')],'Con «the ... in the store» se usa el superlativo.')
CD=[('If it {} tomorrow, we will stay home.','rains',['will rain','rained','raining']),('If she {} early, she will catch the bus.','leaves',['will leave','left','leaving']),('If you {} hard, you will pass the exam.','study',['will study','studied','studying']),('If they {} the game, they will celebrate.','win',['will win','won','winning']),('If I {} time, I will call you.','have',['will have','had','having']),('If I {} a million dollars, I would travel the world.','had',['have','will have','would had']),('If he {} more, he would feel better.','slept',['sleeps','will sleep','would slept'])]
def en8(n):
    t,ok,bad=ch(CD)
    return mk(n,'Conditionals',t.format('___'),ok,[(b,'No coincide con la estructura del condicional.') for b in bad],'En el primer condicional se usa if + presente; en el segundo, if + pasado.')
def en9(n):
    if R.random()<.5:
        a=r(1,5);b=r(1,3);nm=ch(['Tom','Ana','Luis','Mary'])
        return mk(n,'Reading',f'{nm} has {a} brothers and {b} sisters. How many siblings does {nm} have?',a+b,[(a,'Solo contaste los hermanos.'),(b,'Solo contaste las hermanas.'),(a*b,'Multiplicaste en lugar de sumar.')],f'{a} + {b} = {a+b}.')
    h=r(5,9);nm=ch(['Ana','Pedro','Laura','Sam'])
    return mk(n,'Reading',f'{nm} gets up at {h}:00 and has breakfast one hour later. When does {nm} have breakfast?',f'{h+1}:00',[(f'{h}:00','Esa es la hora en que se levanta.'),(f'{h+2}:00','Contaste dos horas.'),(f'{h-1}:00','Restaste en lugar de sumar.')],f'{h}:00 + 1 hora = {h+1}:00.')
# ---------- Ensamblaje ----------
GM={0:[m_per,m_desc,m_prom,m_vel,m_prop,m_tri,m_frac,m_conv],1:[m_desc,m_prom,m_prop,m_tri,m_frac,m_prob,m_conv,m_aum,m_lin,m_med,m_ec],2:[m_ec,m_lin,m_med,m_prob,m_aum,m_frac,m_prop,m_conv,m_desc]}
GRQ={0:[m_desc,m_prom,r_tab,m_prop,m_vel],1:[m_aum,r_var,r_gas,m_prob,m_prom,r_tab],2:[r_var,r_int,r_gas,m_aum,m_lin,m_med]}
GC={0:[c_cad,c_est,c_temp,c_vel,c_ph],1:[c_dens,c_ohm,c_fza,c_conc,c_pun,c_ph,c_cad],2:[c_pun,c_ohm,c_conc,c_dens,c_fza,c_ph,c_vel]}
GS={0:[s_cap,s_fun],1:[s_cap2,s_mec,s_evt,s_fun2],2:[s_par,s_sit,s_fun2,s_mec]}
GCC={0:[s_fun,c_rights,c_esc],1:[s_mec,c_der,c_esc,s_fun2],2:[s_sit,c_der,s_mec,c_esc]}
GL={0:[l_hec,l_sin],1:[l_con,l_sin,l_hec,l_rel],2:[l_inf,l_rel,l_con,l_inf]}
GCE={0:[e_conc,e_ort],1:[e_ort,l_con,e_reg,e_tem],2:[e_tem,e_reg,l_con,e_ort]}
GEN={0:[en1,en5,en6,en9],1:[en2,en3,en5,en7,en6],2:[en4,en8,en7,en3]}
SEEN={}
def make(gens,area,code,ex,N=34):
    out=[];seen=SEEN.setdefault(ex,set())  # sin repetir preguntas dentro de un mismo examen
    for n in range(3):
        c=0;tries=0
        while c<N and tries<20000:
            tries+=1;q=R.choice(gens[n])(n)
            if not q:continue
            k=(q['enunciado'],tuple(sorted(o['texto'] for o in q['opciones'])))
            if k in seen:continue
            seen.add(k);c+=1;q.update(area=area,examen=ex,id=f'{code}-{"BIA"[n]}{c:03d}',marcaContenido='Pregunta de práctica, no oficial');out.append(q)
        assert c==N,(area,n,c)
    return out
def banco():
    s11=[];pro=[];E1,E2='Saber 11','Saber Pro / TyT'
    for g,a,c in [(GM,'Matemáticas','MAT'),(GL,'Lectura Crítica','LEC'),(GC,'Ciencias Naturales','CIE'),(GS,'Sociales y Ciudadanas','SOC'),(GEN,'Inglés','ING')]:s11+=make(g,a,'S11'+c,E1)
    for g,a,c in [(GRQ,'Razonamiento Cuantitativo','RCU'),(GL,'Lectura Crítica','LEC'),(GCE,'Comunicación Escrita','CES'),(GCC,'Competencias Ciudadanas','CCI'),(GEN,'Inglés','ING')]:pro+=make(g,a,'PRO'+c,E2)
    return s11,pro
def valida(qs):
    ids=set()
    for q in qs:
        assert q['id'] not in ids;ids.add(q['id']);t=[o['texto'] for o in q['opciones']]
        assert len(t)==4==len(set(t)) and q['respuesta'] in 'ABCD' and q['explicacion'] and sum(1 for o in q['opciones'] if o['why']=='')==1,q['id']
if __name__=='__main__':
    s11,pro=banco();valida(s11+pro)
    args=[a for a in sys.argv[1:] if not a.startswith('--')];rep=args[0] if args else ''
    here=os.path.dirname(os.path.abspath(__file__))
    if not rep and os.path.isdir(os.path.join(here,'..','contenido')):rep=os.path.join(here,'..','contenido')
    orig=[]
    if rep:
        for fn in ('preguntas.json','preguntas-niveles.json'):orig+=json.load(open(os.path.join(rep,fn),encoding='utf-8'))
    here=os.path.dirname(os.path.abspath(__file__));db=os.path.join(here,'banco-preguntas.db')
    if os.path.exists(db):
        if '--forzar' not in sys.argv:print('Ya existe banco-preguntas.db. Para reemplazarlo usa --forzar (se perderán los estados de revisión; se guarda una copia .bak).');sys.exit(1)
        os.replace(db,db+'.bak')
    c=sqlite3.connect(db);c.execute("""CREATE TABLE preguntas(id TEXT PRIMARY KEY,examen TEXT NOT NULL,area TEXT NOT NULL,nivel TEXT NOT NULL,competencia TEXT,enunciado TEXT NOT NULL,opciones_json TEXT NOT NULL,respuesta TEXT NOT NULL,explicacion TEXT NOT NULL,autor TEXT,estado TEXT NOT NULL,revisores INTEGER DEFAULT 0,version INTEGER DEFAULT 1)""")
    c.execute("CREATE VIEW v_cobertura AS SELECT examen,area,nivel,COUNT(*) AS total FROM preguntas GROUP BY examen,area,nivel")
    for q in s11+pro:c.execute('INSERT INTO preguntas VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',(q['id'],q['examen'],q['area'],q['nivel'],q['competencia'],q['enunciado'],json.dumps(q['opciones'],ensure_ascii=False),q['respuesta'],q['explicacion'],'plantilla-generada','borrador',0,1))
    for q in orig:c.execute('INSERT INTO preguntas VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',(q['id'],'Saber 11',q['area'],q['nivel'],q.get('competencia'),q['enunciado'],json.dumps(q['opciones'],ensure_ascii=False),q['respuesta'],q['explicacion'],'repositorio','repositorio',0,1))
    c.commit();json.dump(dict(saber11=s11,saberPro=pro),open(os.path.join(here,'banco-preguntas.json'),'w',encoding='utf-8'),ensure_ascii=False)
    print('generadas',len(s11)+len(pro),'| en la base',c.execute('select count(*) from preguntas').fetchone()[0])
    for row in c.execute('select examen,area,nivel,total from v_cobertura order by 1,2,3 limit 6'):print(row)
