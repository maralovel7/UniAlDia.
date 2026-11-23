export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  standfirst: string;
  image: string;
  time: string;
  author: string;
  sections: ArticleSection[];
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  quote: string;
  description: string;
  image: string;
};

export const articles: Article[] = [
  {
    slug: 'alquilar-habitacion-sevilla-zonas-precios',
    category: 'Vivienda',
    title: 'Alquilar una habitación en Sevilla ya cuesta más que nunca: estas son las zonas que aún respiran',
    standfirst: 'Encontrar piso cerca del campus se ha convertido en una carrera contra el precio. Te contamos qué mirar antes de firmar y dónde buscar alternativas.',
    image: 'https://images.pexels.com/photos/11829188/pexels-photo-11829188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Hace 2 h',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'El precio no es el único dato importante', paragraphs: ['Cuando buscas habitación, el anuncio suele empezar por una cifra mensual. Sin embargo, el coste real también incluye suministros, fianza, transporte y el tiempo que tardas en llegar a clase.', 'Antes de comparar dos habitaciones, pide que te indiquen por escrito qué está incluido y si el precio puede cambiar durante el curso. Una oferta algo más alejada puede salir mejor si está bien conectada y no obliga a pagar gastos inesperados.'] },
      { heading: 'Tres preguntas antes de visitar un piso', paragraphs: ['La visita sirve para confirmar que el anuncio coincide con la realidad y para conocer a quienes compartirán la vivienda. Lleva preparadas estas preguntas:'], bullets: ['¿Qué gastos están incluidos y cómo se reparten?', '¿Qué duración tiene el contrato y cómo se recupera la fianza?', '¿Hay normas sobre visitas, limpieza, ruido y uso de las zonas comunes?'] },
      { heading: 'Cómo decidir sin precipitarte', paragraphs: ['No entregues dinero sin recibir un contrato y comprobar quién alquila la habitación. Guarda el anuncio, los mensajes y los justificantes de pago. Si algo te presiona para decidir en minutos o evita enseñar la vivienda, considéralo una señal de alerta.', 'La mejor opción no siempre es la habitación más barata, sino la que puedes pagar de forma estable y te permite mantener una rutina razonable durante el curso.'] },
    ],
  },
  {
    slug: 'nuevas-ayudas-estudiantes-us-requisitos-fechas',
    category: 'Universidad',
    title: 'La US activa nuevas ayudas para estudiantes: requisitos y fechas clave',
    standfirst: 'Las convocatorias universitarias suelen tener plazos distintos y documentación específica. Esta guía te ayuda a ordenar el proceso sin dejarlo para el último día.',
    image: 'https://images.pexels.com/photos/16549991/pexels-photo-16549991.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Hace 4 h',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'Qué debes revisar primero', paragraphs: ['Antes de iniciar una solicitud, comprueba que la ayuda corresponde a tu situación académica y económica. Las bases de cada convocatoria indican quién puede pedirla, qué gastos cubre y cómo se acredita cada requisito.', 'No des por hecho que una ayuda se renueva automáticamente. Lee la convocatoria del curso actual y anota la fecha de cierre en tu calendario.'] },
      { heading: 'La documentación que suele repetirse', paragraphs: ['Aunque cada programa puede pedir documentos diferentes, es útil tener preparada una carpeta digital con:'], bullets: ['DNI o documento identificativo y datos de contacto actualizados.', 'Matrícula o acreditación de estudios del curso vigente.', 'Documentación económica o familiar cuando la convocatoria la solicite.', 'Justificantes de residencia, transporte o gastos si son parte de la ayuda.'] },
      { heading: 'Presentar la solicitud también es parte del proceso', paragraphs: ['Una solicitud iniciada no siempre equivale a una solicitud presentada. Guarda el justificante final y revisa si después se abre un periodo de subsanación. Si recibes una notificación, respóndela dentro del plazo indicado.', 'Si tienes dudas, pregunta a la secretaría o al servicio de becas de tu centro con tiempo. Una consulta temprana puede evitar que un documento incompleto deje fuera una solicitud válida.'] },
    ],
  },
  {
    slug: 'planes-baratos-sevilla-estudiantes',
    category: 'Ocio',
    title: 'Plan de finde: seis terrazas para sobrevivir al calor sin salir de Sevilla',
    standfirst: 'Salir no tiene por qué romper tu presupuesto. Reunimos ideas para quedar, descansar y conocer rincones de la ciudad gastando con cabeza.',
    image: 'https://images.pexels.com/photos/37894627/pexels-photo-37894627.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Ayer',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'Un plan puede empezar antes de sentarse', paragraphs: ['Sevilla tiene muchos espacios donde la experiencia no depende de pedir lo más caro de la carta. Quedar para dar un paseo, buscar una plaza tranquila o compartir una ración permite que el plan sea accesible para todo el grupo.', 'Antes de salir, revisa horarios y precios de la zona. En verano algunos espacios cambian su apertura y las horas de mayor afluencia pueden modificar la experiencia.'] },
      { heading: 'Ideas para gastar menos', paragraphs: ['Elige un punto de encuentro conectado con transporte público y acuerda un presupuesto aproximado. Compartir comida, llevar una botella de agua y priorizar actividades gratuitas son pequeñas decisiones que ayudan a no terminar la noche haciendo cuentas.'], bullets: ['Combina paseo y terraza en vez de encadenar consumiciones.', 'Consulta si hay actividades culturales gratuitas cerca.', 'Reserva solo cuando sea necesario y confirma las condiciones.'] },
      { heading: 'El mejor plan es el que encaja contigo', paragraphs: ['No existe una agenda perfecta para todo el mundo. Si el calor aprieta, busca sombra, evita las horas centrales y prioriza lugares donde puedas volver fácilmente a casa. Informarse también es una forma de disfrutar más.'] },
    ],
  },
  {
    slug: 'transporte-sevilla-cambios-lineas-tarifas',
    category: 'Sevilla',
    title: 'El transporte cambia: esto es lo que tienes que saber antes de subirte',
    standfirst: 'Líneas, tarifas e incidencias pueden cambiar tu camino a clase. Te damos una forma sencilla de comprobar la información antes de salir.',
    image: 'https://images.pexels.com/photos/29210948/pexels-photo-29210948.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Hace 3 h',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'Comprueba la ruta el mismo día', paragraphs: ['Una ruta que funciona de lunes a viernes puede tener horarios distintos en fin de semana, festivos u obras. Antes de salir, revisa la información del operador y calcula unos minutos extra si tienes una clase, examen o cita importante.', 'No confundas un horario programado con una predicción de llegada en tiempo real. Si la fuente no ofrece ese dato, planifica con margen.'] },
      { heading: 'Qué hacer si hay una incidencia', paragraphs: ['Cuando una línea se retrasa o cambia de recorrido, busca primero el aviso oficial y después una alternativa. Apunta la parada de conexión más cercana y comprueba si puedes combinar bus, metro, tranvía o bicicleta.'], bullets: ['Consulta el canal oficial del servicio antes de compartir capturas antiguas.', 'Guarda una segunda ruta para los trayectos importantes.', 'Si el cambio afecta a varios días, ajusta tu hora de salida habitual.'] },
      { heading: 'La información útil es la que te permite actuar', paragraphs: ['En UniAlDía no solo queremos decirte que hay un cambio. Queremos ayudarte a entender a quién afecta, qué opciones tienes y qué información todavía no se puede confirmar.'] },
    ],
  },
  {
    slug: 'becas-ayudas-requisitos-fechas-clave',
    category: 'Guía del estudiante',
    title: 'Becas y ayudas: cómo no perder una fecha clave',
    standfirst: 'Un calendario sencillo y una carpeta preparada pueden marcar la diferencia cuando se abre una convocatoria.',
    image: 'https://images.pexels.com/photos/34690994/pexels-photo-34690994.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Guía útil',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'Empieza por un calendario propio', paragraphs: ['Apunta la apertura, el cierre y la posible fecha de subsanación de cada ayuda. Activa un recordatorio varios días antes: el último día no debería ser el momento de buscar todos los documentos.'] },
      { heading: 'Lee la letra pequeña sin miedo', paragraphs: ['La convocatoria explica los requisitos, la forma de presentar la solicitud y los criterios de resolución. Si un concepto no está claro, busca la definición en la fuente oficial o pregunta en tu universidad.'], bullets: ['Diferencia entre requisitos académicos y económicos.', 'Comprueba si la solicitud exige firma o trámite adicional.', 'Guarda el resguardo y revisa las notificaciones posteriores.'] },
      { heading: 'Pedir ayuda también es avanzar', paragraphs: ['No tienes que resolver todo a solas. El servicio de becas, la secretaría y las asociaciones de estudiantes pueden orientarte sobre el procedimiento. Lleva una lista concreta de dudas para aprovechar mejor la consulta.'] },
    ],
  },
  {
    slug: 'erasmus-movilidad-guia-practica',
    category: 'Movilidad',
    title: 'Erasmus y movilidad: lo que conviene preparar antes de hacer la maleta',
    standfirst: 'Elegir destino es solo el principio. Te contamos cómo ordenar documentos, presupuesto y vida diaria para llegar con menos incertidumbre.',
    image: 'https://images.pexels.com/photos/11829188/pexels-photo-11829188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    time: 'Guía útil',
    author: 'Redacción UniAlDía',
    sections: [
      { heading: 'No todo se decide por la ciudad', paragraphs: ['Compara asignaturas, calendario académico, coste de vida y opciones de alojamiento. Un destino atractivo también tiene que encajar con tu carrera y con el presupuesto que puedes mantener durante la estancia.'] },
      { heading: 'Tu carpeta de movilidad', paragraphs: ['Reúne en un mismo espacio la documentación de la universidad, seguro, identificación, alojamiento y contactos de emergencia. Comprueba qué documentos necesitan firma y cuáles deben enviarse antes de viajar.'], bullets: ['Acuerdo académico y fechas de matrícula.', 'Presupuesto mensual realista con margen para imprevistos.', 'Direcciones, teléfonos y trámites del destino.'] },
      { heading: 'La experiencia empieza antes de despegar', paragraphs: ['Hablar con estudiantes que ya hayan estado allí ayuda a descubrir detalles que no aparecen en los folletos: barrios, transporte, compras y primeros trámites. Pregunta por experiencias concretas y contrasta siempre la información oficial.'] },
    ],
  },
];

export const teamMembers: TeamMember[] = [
  { slug: 'paula-olivero', name: 'Paula Olivero Carrasco', role: 'Coordinadora', quote: 'Yo pongo el orden, el equipo pone la magia.', description: 'Organiza el trabajo del grupo, marca prioridades y mantiene conectadas las distintas áreas para que UniAlDía avance con una misma dirección.', image: '/images/team/WhatsApp_Image_2026-11-23_at_23.15.44.jpeg' },
  { slug: 'abril-perez', name: 'Abril Pérez Márquez', role: 'Redes sociales', quote: 'Lo que te afecta, directo a tu Instagram.', description: 'Convierte la actualidad en formatos cercanos para redes, cuida la identidad de la comunidad y ayuda a que la información llegue donde están los estudiantes.', image: '/images/team/WhatsApp_Image_2026-11-23_at_23.15.51.jpeg' },
  { slug: 'laura-gallegos', name: 'Laura Gallegos Martín', role: 'Contenidos y redacción', quote: 'Lo importante, contado claro y sin rodeos.', description: 'Investiga, estructura y redacta contenidos para explicar lo que ocurre con contexto, lenguaje sencillo y una mirada centrada en la vida real.', image: '/images/team/WhatsApp_Image_2026-11-23_at_23.15.58.jpeg' },
  { slug: 'manuel-vizuete', name: 'Manuel Vizuete Trenado', role: 'Audiovisual e IA', quote: 'Creamos contenido audiovisual e IA para facilitarte la vida estudiantil de forma rápida y sencilla.', description: 'Desarrolla piezas audiovisuales y explora el uso responsable de la inteligencia artificial para hacer más clara y accesible la información.', image: '/images/project-info/Gemini_Generated_Image_rmq36prmq36prmq3.jpg' },
  { slug: 'mar-alonso', name: 'Mar Alonso Vélez', role: 'Comunidad y web', quote: 'Conectamos a los estudiantes en una comunidad web para compartir y resolver el día a día fácilmente.', description: 'Da forma a la experiencia digital, piensa en las necesidades de la comunidad y trabaja para que la web sea un lugar útil, participativo y fácil de usar.', image: '/images/project-info/Gemini_Generated_Image_rmq36prmq36prmq3_(1).jpg' },
  { slug: 'jose-antonio-moreno', name: 'Jose Antonio Moreno Lara', role: 'Redacción', quote: 'Redacto las respuestas que necesitas para que todo lo que te afecta esté en un solo lugar de forma sencilla.', description: 'Redacta noticias y respuestas prácticas para reunir en un solo espacio la información que el estudiante necesita para tomar decisiones.', image: '/images/project-info/Gemini_Generated_Image_rmq36prmq36prmq3_(2).jpg' },
];
