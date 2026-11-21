/**
 * NivelaTec · Encuesta a estudiantes de primer año (CINF113, Grupo 1)
 * Crea el formulario de Google Forms y una hoja de cálculo para las respuestas.
 *
 * Cómo usarlo:
 *  1. Entra a https://script.google.com con tu cuenta de Google y pulsa "Nuevo proyecto".
 *  2. Borra el contenido y pega este archivo completo.
 *  3. Pulsa "Ejecutar" (función crearEncuesta) y acepta los permisos.
 *  4. Abre "Registro de ejecución": ahí aparecen el enlace para responder y el de edición.
 *     El formulario y la hoja quedan también en tu Google Drive.
 */
function crearEncuesta() {
  var form = FormApp.create('NivelaTec · Encuesta sobre el primer año en CFT e IP');
  form.setDescription(
    'Somos estudiantes de la Universidad Andrés Bello (curso CINF113, Taller de Transferencia Tecnológica). ' +
    'Estamos estudiando cómo viven los estudiantes de primer año de CFT e IP sus primeras evaluaciones de matemática ' +
    'y comprensión lectora, para diseñar una herramienta de nivelación.\n\n' +
    'Toma unos 4 minutos. Es anónima: no pedimos tu nombre ni tu RUT. Puedes dejarla en cualquier momento.');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);
  form.setConfirmationMessage('¡Gracias! Tus respuestas nos ayudan a diseñar una nivelación más útil para el primer año.');

  // ---------- Consentimiento ----------
  var consent = form.addMultipleChoiceItem()
    .setTitle('¿Aceptas participar y tienes 18 años o más?')
    .setHelpText('Las respuestas se usan solo con fines académicos y se analizan de forma agregada.')
    .setRequired(true);
  var pPerfil = form.addPageBreakItem().setTitle('Sobre ti');
  consent.setChoices([
    consent.createChoice('Sí, acepto y tengo 18 años o más', pPerfil),
    consent.createChoice('No', FormApp.PageNavigationType.SUBMIT)
  ]);

  // ---------- Perfil ----------
  form.addMultipleChoiceItem().setTitle('¿Dónde estudias actualmente?').setRequired(true)
    .setChoiceValues(['Centro de Formación Técnica (CFT)', 'Instituto Profesional (IP)', 'Universidad', 'No estoy estudiando']);
  form.addMultipleChoiceItem().setTitle('¿En qué año de tu carrera estás?').setRequired(true)
    .setChoiceValues(['Primer año', 'Segundo año', 'Tercer año o más']);
  form.addMultipleChoiceItem().setTitle('¿A qué área pertenece tu carrera?').setRequired(true).showOtherOption(true)
    .setChoiceValues(['Administración y negocios', 'Tecnología e informática', 'Mecánica, electricidad o industria',
                      'Salud', 'Construcción', 'Educación o social']);
  form.addMultipleChoiceItem().setTitle('¿Qué tipo de establecimiento fue tu liceo o colegio?').setRequired(true)
    .setChoiceValues(['Municipal o SLEP (público)', 'Particular subvencionado', 'Particular pagado', 'Prefiero no decir']);
  form.addMultipleChoiceItem().setTitle('¿Eres la primera persona de tu familia en estudiar en la educación superior?').setRequired(true)
    .setChoiceValues(['Sí', 'No', 'No estoy seguro/a']);
  form.addMultipleChoiceItem().setTitle('¿Trabajas mientras estudias?').setRequired(true)
    .setChoiceValues(['No', 'Sí, menos de 20 horas a la semana', 'Sí, 20 horas o más a la semana']);

  // ---------- El problema ----------
  form.addPageBreakItem().setTitle('Tus primeras evaluaciones')
    .setHelpText('Piensa en tu primer semestre de educación superior.');
  form.addMultipleChoiceItem().setTitle('En tu primera prueba de matemática (o del ramo con más cálculo), ¿cómo te fue?').setRequired(true)
    .setChoiceValues(['Me fue bien', 'Aprobé justo', 'Reprobé', 'No tuve ramos de matemática']);
  form.addMultipleChoiceItem().setTitle('¿Cuándo te diste cuenta de que te faltaban bases en algún tema?').setRequired(true)
    .setChoiceValues(['Antes de empezar las clases', 'En las primeras semanas de clases', 'Al recibir la nota de la primera prueba',
                      'Más adelante en el semestre', 'No me faltaron bases']);
  form.addGridItem().setTitle('¿Qué tan seguro/a te sentías en estos temas al entrar a la carrera?')
    .setHelpText('1 = nada seguro/a · 5 = muy seguro/a').setRequired(true)
    .setRows(['Fracciones y operatoria', 'Porcentajes y proporciones', 'Ecuaciones (álgebra)', 'Funciones y gráficos',
              'Comprensión de enunciados y textos técnicos'])
    .setColumns(['1', '2', '3', '4', '5']);
  form.addMultipleChoiceItem().setTitle('¿Tu institución te ofreció algún apoyo o nivelación en esos temas?').setRequired(true)
    .setChoiceValues(['Sí, y lo usé', 'Sí, pero no lo usé', 'No me ofrecieron', 'No sé']);
  form.addCheckboxItem().setTitle('Si no usaste la nivelación o no te sirvió, ¿por qué?')
    .setHelpText('Puedes marcar más de una.').showOtherOption(true)
    .setChoiceValues(['Horario incompatible con trabajo o traslados', 'Era igual para todos, no se enfocaba en lo que me faltaba',
                      'Me daba vergüenza ir', 'No sabía que existía', 'Pensé que no la necesitaba', 'Sí la usé y me sirvió']);

  // ---------- La solución ----------
  form.addPageBreakItem().setTitle('Una posible solución')
    .setHelpText('Imagina una herramienta así: en la primera semana de clases haces un diagnóstico de 10 minutos desde el celular, ' +
                 'recibes una ruta de ejercicios cortos enfocada solo en lo que te falta, y tu docente recibe un aviso si vas ' +
                 'quedando atrás antes de la primera prueba.');
  form.addScaleItem().setTitle('¿Qué tan útil te habría sido esta herramienta en tu primer semestre?').setRequired(true)
    .setBounds(1, 5).setLabels('Nada útil', 'Muy útil');
  form.addMultipleChoiceItem().setTitle('¿Te parecería bien que tu docente reciba un aviso si vas quedando atrás?').setRequired(true)
    .setChoiceValues(['Sí', 'Solo si yo lo autorizo', 'No']);
  form.addMultipleChoiceItem().setTitle('¿Dónde preferirías hacer el diagnóstico inicial?').setRequired(true)
    .setChoiceValues(['En los primeros minutos de una clase', 'En mi casa, cuando tenga tiempo', 'Me da lo mismo']);
  form.addMultipleChoiceItem().setTitle('¿Desde qué dispositivo lo usarías principalmente?').setRequired(true)
    .setChoiceValues(['Celular', 'Computador o notebook', 'Tablet']);
  form.addParagraphTextItem().setTitle('¿Qué te habría ayudado más a no quedarte atrás en tu primer semestre?');

  // ---------- Prueba del prototipo (opcional) ----------
  form.addPageBreakItem().setTitle('Prueba del prototipo (opcional)');
  form.addMultipleChoiceItem().setTitle('¿Te gustaría probar nuestro prototipo durante 15 minutos (en línea)?').setRequired(true)
    .setChoiceValues(['Sí', 'No']);
  form.addTextItem().setTitle('Si respondiste que sí, déjanos un correo o Instagram para coordinar')
    .setHelpText('Opcional. Solo lo usaremos para coordinar la prueba y lo borraremos al terminar el curso.');

  // ---------- Hoja de respuestas ----------
  var ss = SpreadsheetApp.create('NivelaTec · Respuestas encuesta');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  form.setAcceptingResponses(true);
  try { form.setPublished(true); } catch (e) { /* versiones antiguas de Apps Script no lo requieren */ }

  Logger.log('Enlace para responder (compártelo): ' + form.getPublishedUrl());
  Logger.log('Enlace para editar el formulario: ' + form.getEditUrl());
  Logger.log('Hoja de respuestas: ' + ss.getUrl());
}
