// Genera CINF113_s12_grupo01.docx (Entregable 3 · Lean Canvas de NivelaTec)
// Uso: node build_informe.js <carpeta_figuras> <salida.docx> [logo.png]
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType,
  HeadingLevel, TableOfContents, PageBreak, Footer, PageNumber, ShadingType, BorderStyle, LevelFormat,
  SequentialIdentifier, SimpleField, LineRuleType, VerticalAlign, ExternalHyperlink,
} = require("docx");

const FIG = process.argv[2] || "../figuras";
const OUT = process.argv[3] || "CINF113_s12_grupo01.docx";
const LOGO = process.argv[4];
const SIM = JSON.parse(fs.readFileSync(path.join(FIG, "resultados_simulacion.json"), "utf8"));
const FIN = JSON.parse(fs.readFileSync(path.join(FIG, "finanzas.json"), "utf8"));
const MVP_URL = "https://claude.ai/artifact/KQ1aF4QgipYaSNd2VMcLF1";

const FONT = "Calibri";
const W = 9360; // ancho útil carta con márgenes de 1"
const fmt = (x, d = 1) => x.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
const pct = (a, b, d = 1) => fmt((100 * a) / b, d) + " %";
const clp = (x) => "CLP " + Math.round(x).toLocaleString("es-CL");

// ---------- texto con **negrita** e *itálica* ----------
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ ...base, text: t.slice(2, -2), bold: true }));
    else out.push(new TextRun({ ...base, text: t.slice(1, -1), italics: true }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}
const P = (t, o = {}) => new Paragraph({ children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, ...o });
const B = (t) => new Paragraph({ children: runs(t), numbering: { reference: "bul", level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 60 } });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });

// ---------- títulos APA para tablas y figuras ----------
const CNT = { Tabla: 0, Figura: 0 };
function caption(kind, title) {
  CNT[kind]++;
  const f = new SimpleField(`SEQ ${kind} \\* ARABIC`, String(CNT[kind]));
  return [
    new Paragraph({ keepNext: true, spacing: { before: 160, after: 0 }, run: { bold: true }, children: [new TextRun({ text: kind + " ", bold: true }), f] }),
    new Paragraph({ keepNext: true, spacing: { after: 80 }, children: [new TextRun({ text: title, italics: true })] }),
  ];
}
const nota = (t) => new Paragraph({ children: [new TextRun({ text: "Nota. ", italics: true, size: 18 }), ...runs(t, { size: 18 })], spacing: { before: 60, after: 160 }, alignment: AlignmentType.JUSTIFIED });

const border = { style: BorderStyle.SINGLE, size: 4, color: "9AA5AD" };
const borders = { top: border, bottom: border, left: border, right: border };
function cell(text, w, opts = {}) {
  const lines = String(text).split("\n");
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: lines.map((l) => new Paragraph({ spacing: { after: 0, line: 240 }, alignment: opts.align || AlignmentType.LEFT, children: runs(l, opts.bold ? { size: 18, bold: true } : { size: 18 }) })),
  });
}
function table(headers, rows, widths, opts = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const trs = [new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, widths[i], { fill: "DCEFE6", bold: true })) })];
  rows.forEach((r) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { fill: opts.firstColFill && i === 0 ? "F3F5F4" : undefined, align: opts.alignRight && opts.alignRight.includes(i) ? AlignmentType.RIGHT : undefined })) })));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: trs });
}
function img(file, widthPx) {
  const buf = fs.readFileSync(path.join(FIG, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 40, line: 240, lineRule: LineRuleType.AUTO }, children: [new ImageRun({ type: "png", data: buf, transformation: { width: widthPx, height: Math.round((widthPx * h) / w) } })] });
}

// ---------- datos de simulación ----------
const pt = SIM.prueba_tareas, pi = SIM.piloto, mc = SIM.monte_carlo, pw = SIM.potencia_secciones;
const A1 = pi.activa / pi.nT, A2 = pi.activa / pi.inicia, C1 = pi.completa / pi.inicia, A3 = pi.doc_adopta / pi.doc_n;
const U2 = pi.sostiene / pi.activa, S1 = pi.satisf_4_5 / pi.encuesta_resp, S2 = pi.encuesta_resp / pi.activa;
const p28 = FIN.proj["2028"], p29 = FIN.proj["2029"];

// ================== CONTENIDO ==================
const body = [];
const push = (...x) => x.forEach((e) => (Array.isArray(e) ? body.push(...e) : body.push(e)));

// ---- 1 Introducción ----
push(H1("1. Introducción"));
push(P("El presente informe corresponde al tercer entregable del proyecto de asignatura y traduce el diagnóstico de los entregables anteriores en una propuesta de valor evaluable mediante un Lean Canvas (Maurya, 2012). El caso es NivelaTec, plataforma de nivelación adaptativa con alerta temprana para estudiantes de primer año de centros de formación técnica (CFT) e institutos profesionales (IP), seleccionada en el primer entregable por su puntaje en la matriz de evaluación (Barrientos et al., 2026a) y analizada en el segundo desde la inteligencia estratégica (Barrientos et al., 2026b)."));
push(P("El documento desarrolla los nueve bloques del lienzo, define un producto mínimo viable (MVP) funcional y propone su validación con hipótesis, canales y métricas fijados antes de medir, siguiendo el ciclo construir-medir-aprender (Ries, 2011). **Alcance de la evidencia:** el equipo no realizó aún pruebas con estudiantes reales. Por ello, la validación combina tres fuentes declaradas de forma explícita: (a) evidencia documental publicada sobre el problema y sobre soluciones comparables; (b) una prueba técnica automatizada del MVP; y (c) una simulación reproducible del piloto con parámetros declarados (Anexo A). Los resultados simulados se rotulan como tales y no se presentan como observaciones de usuarios."));

// ---- 2 Lean Canvas ----
push(H1("2. Lean Canvas de NivelaTec"));
push(P("La Figura 1 sintetiza el modelo; cada bloque se desarrolla en las secciones 3 a 11."));
push(caption("Figura", "Lean Canvas de NivelaTec"), img("fig_lean_canvas.png", 590), nota("Elaboración propia con base en Maurya (2012). Cifras de costos e ingresos desarrolladas en las secciones 9 y 10."));

// ---- 3 Problema ----
push(H1("3. Problema"));
push(P("Se identifican tres problemas que enfrenta el estudiante de primer año del sector técnico-profesional (TP), expresados desde su experiencia:"));
push(B("**P1. “Llego sin la base que el ramo da por sabida”.** El estudiante enfrenta Matemática I y la lectura de manuales técnicos con vacíos de enseñanza media. En la última medición de competencias de adultos de la OCDE, el 44 % de los adultos chilenos no alcanzó el nivel suficiente y Chile obtuvo 214 puntos en matemática frente a 263 del promedio OCDE (Saavedra Ortega, 2024)."));
push(B("**P2. “Me entero de que voy mal cuando ya reprobé”.** La primera señal de riesgo suele ser la nota de la primera prueba, cuando el margen de recuperación es menor. La deserción de primer año alcanza 31,1 % en CFT y 29,4 % en IP, frente a 17,2 % en universidades (Consejo Nacional de Educación [CNED], s. f.; Gálvez, 2022)."));
push(B("**P3. “La nivelación es igual para todos”.** Los programas disponibles son masivos y presenciales; no distinguen si el vacío está en fracciones, porcentajes o álgebra, y compiten con el trabajo y los traslados del estudiante (Universidad Mayor, 2026)."));
push(P("La Tabla 1 resume la evidencia. La brecha de retención entre universidades y el sector TP se estancó cerca de 10 puntos porcentuales (pp) desde 2016, lo que indica que no se cerrará por inercia (Servicio de Información de Educación Superior [SIES], 2023; Barrientos et al., 2026b)."));
push(caption("Tabla", "Evidencia que respalda el problema"));
push(table(["Indicador", "Valor", "Fuente"], [
  ["Matrícula de 1.er año en el sector TP (2026)", "209.775 estudiantes (56,5 % del sistema)", "SIES (2026)"],
  ["Retención de 1.er año, cohorte 2022", "CFT 71,7 % · IP 72,1 % · Universidades 81,6 %", "SIES (2023)"],
  ["Brecha de retención universidades – TP", "14,0 pp (2007) → 9,6 pp (2022), estancada desde 2016", "SIES (2023); Barrientos et al. (2026b)"],
  ["Deserción de 1.er año por tipo de institución", "CFT 31,1 % · IP 29,4 % · Universidades 17,2 %", "CNED (s. f.); Gálvez (2022)"],
  ["Deserción por dependencia del colegio de origen", "Municipal 30,6 % · Subvencionado 27,0 % · Pagado 22,3 %", "Psicometrix (2024)"],
  ["Competencias de adultos (OCDE)", "44 % bajo el nivel suficiente; matemática 214 vs. 263", "Saavedra Ortega (2024)"],
], [3300, 3560, 2500]));
push(nota("pp = puntos porcentuales. Las cifras de retención provienen de la serie oficial del SIES verificada en el segundo entregable."));
push(P("**Alternativas actuales del usuario:** tutorías presenciales voluntarias, videos genéricos y tutores de inteligencia artificial (IA) gratuitos. Ninguna conecta el diagnóstico del estudiante con la acción del docente antes de la primera evaluación, que fue el momento crítico identificado en el Customer Journey Map del primer entregable."));

// ---- 4 Segmento ----
push(H1("4. Segmento de clientes"));
push(P("El modelo es B2B: quien paga no es quien usa. Por ello se distinguen el usuario final, el usuario operativo y el tomador de decisión (Tabla 2), priorizando a los estudiantes con mayor riesgo según la evidencia de la sección 3."));
push(caption("Tabla", "Segmentos primarios y secundarios, necesidades y rol en la adopción"));
push(table(["Segmento", "Perfil", "Necesidad específica", "Rol"], [
  ["**Primario: estudiante de 1.er año TP**", "18–24 años, primera generación en educación superior, egresado de liceo municipal o subvencionado; suele trabajar; estudia desde el celular.", "Saber qué le falta antes de la Prueba 1 y practicarlo en sesiones cortas, sin exponerse frente al curso.", "Usuario final y beneficiario"],
  ["**Primario: docente de ramo crítico**", "Docente de Matemática I o Comunicación en cursos de 30–45 estudiantes, frecuentemente a honorarios.", "Identificar a quién apoyar en pocos minutos, sin revisar planillas.", "Usuario operativo"],
  ["**Cliente que paga: CFT o IP mediano**", "Institución de 1.000 a 5.000 estudiantes de 1.er año; vicerrectoría académica (VRA), dirección de asuntos estudiantiles (DAE) o unidad de retención.", "Mejorar la aprobación del primer semestre y la retención con evidencia que pueda reportar.", "Tomador de decisión y comprador"],
  ["**Secundario: jefatura de carrera**", "Responsable de indicadores de progresión por carrera.", "Ver el estado de riesgo por sección para asignar tutorías.", "Influenciador"],
  ["**Adoptantes tempranos**", "IP o CFT con programa de retención activo y aula virtual con soporte LTI.", "Herramienta que se integre al proceso existente.", "Primeros pilotos"],
], [2050, 2900, 2860, 1550], { firstColFill: true }));
push(nota("LTI = Learning Tools Interoperability, estándar para integrar herramientas en aulas virtuales. Perfil del estudiante basado en la persona “Nicolás” del primer entregable."));

// ---- 5 Solución y MVP ----
push(H1("5. Solución y diseño del MVP"));
push(H2("5.1 Funcionamiento de la solución"));
push(P("NivelaTec actúa en las cuatro semanas previas a la primera prueba (Figura 2): el estudiante rinde un diagnóstico adaptativo, recibe una ruta de práctica ordenada por sus brechas y obtiene retroalimentación específica para cada error frecuente; el docente recibe un semáforo de riesgo que combina diagnóstico, avance y días sin actividad, y registra su intervención. Cada acción genera un evento que alimenta las métricas de la sección 10."));
push(caption("Figura", "Flujo de la solución por actor"), img("fig_flujo.png", 380), nota("Elaboración propia."));
push(H2("5.2 Hipótesis priorizadas"));
push(P("Siguiendo la pauta de hipótesis del curso, se priorizan los supuestos cuyo error tendría mayor impacto y que cuentan con menor evidencia (Tabla 3)."));
push(caption("Tabla", "Hipótesis críticas del MVP"));
push(table(["Tipo", "Hipótesis (formato del curso)", "Evidencia previa", "Prioridad"], [
  ["Deseabilidad", "**H1.** En estudiantes de 1.er año TP, si el diagnóstico se ofrece desde el aula virtual, al menos 7 de 10 lo completarán sin ayuda en 15 minutos o menos, porque es breve y se adapta a su nivel.", "Baja", "1"],
  ["Deseabilidad", "**H2.** Al menos 50 % de los elegibles completará un módulo de su ruta en 14 días (adopción efectiva).", "Baja", "1"],
  ["Factibilidad", "**H3.** Al menos 4 de 5 docentes identificarán a sus estudiantes en riesgo alto en 2 minutos o menos usando el panel.", "Media (benchmarks)", "2"],
  ["Viabilidad", "**H4.** Los estudiantes que usan la ruta reprobarán el ramo crítico al menos 5 pp menos que el grupo de comparación.", "Media (literatura)", "3"],
], [1250, 5050, 1700, 1360]));
push(nota("H4 es la hipótesis de impacto; por su costo de validación se aborda después de H1–H3."));
push(H2("5.3 Matriz de funcionalidades frente a valor"));
push(P("Para acotar el MVP se evaluó cada funcionalidad según su valor para probar H1–H3 y su esfuerzo de construcción (Figura 3). Se incluyeron las cinco funciones de alto valor y bajo esfuerzo. La retroalimentación con IA generativa se pospone a la versión 2: en el MVP se reemplaza por retroalimentación basada en reglas para cada distractor (enfoque “Mago de Oz”), lo que permite probar si los estudiantes usan la ruta sin invertir antes en el modelo."));
push(caption("Figura", "Matriz de funcionalidades según valor y esfuerzo"), img("fig_matriz_mvp.png", 370), nota("Puntajes asignados por el equipo en una escala de 1 a 5."));
push(H2("5.4 MVP funcional"));
push(P("Se construyó un prototipo web navegable y funcional, publicado en línea (enlace en el Anexo C), con tres vistas: estudiante (diagnóstico adaptativo de 12 ítems en cuatro habilidades, mapa de dominio, ruta y módulos con retroalimentación), docente (panel de alerta temprana con 23 estudiantes ficticios y registro de contacto) y registro de eventos (instrumentación de métricas). El banco tiene 24 ítems en tres niveles de dificultad, contextualizados en mecánica, enfermería y administración (Figura 4)."));
push(caption("Figura", "Pantallas del MVP de NivelaTec"), img("fig_mvp.png", 600), nota("Capturas del prototipo v0.3 con datos ficticios. (A) Resultado y ruta tras el diagnóstico; (B) retroalimentación ante un error; (C) panel docente con alertas."));
push(H2("5.5 Validación del MVP"));
push(P("**Prueba técnica (real).** Un recorrido automatizado con Playwright completó el flujo extremo a extremo: 12 ítems adaptativos, un módulo de 4 ejercicios, el registro de una alerta docente y 11 eventos registrados, con 39 interacciones en total, sin errores de ejecución y sin desplazamiento horizontal a 400 px de ancho (uso en celular). Esto verifica que el MVP es funcional; no mide la conducta de usuarios."));
push(P("**Prueba de tareas (simulada).** La Tabla 4 presenta la ficha de la prueba exploratoria definida para 10 estudiantes y 5 docentes, con umbrales fijados antes de observar y resultados obtenidos mediante simulación (Anexo A)."));
push(caption("Tabla", "Ficha y resultados de la prueba de tareas del MVP"));
push(table(["Tarea", "Umbral previo", "Resultado simulado", "Lectura"], [
  ["T1. Completar el diagnóstico sin ayuda en ≤ 15 min (H1)", "≥ 7 de 10", `${pt.T1_diag_sin_ayuda_15min} de ${pt.T1_n} (mediana ${fmt(pt.tiempo_diag_mediana)} min)`, "Cumple"],
  ["T2. Completar un módulo de la ruta", "≥ 7 de 10", `${pt.T2_modulo_completado} de ${pt.T2_n}`, "Cumple"],
  ["T3. Docente identifica a sus estudiantes en riesgo alto en ≤ 2 min (H3)", "≥ 4 de 5", `${pt.T3_docente_identifica_2min} de ${pt.T3_n} (mediana ${fmt(pt.tiempo_doc_mediana)} min)`, "No cumple"],
], [3700, 1400, 2560, 1700]));
push(nota("Participantes sintéticos: no corresponde a personas reales. Protocolo aplicable a usuarios reales en el Anexo B. La prueba exploratoria detecta dificultades; no estima efectos."));
push(P("**Decisión.** El flujo del estudiante se mantiene. En el flujo docente se ajustará la vista para mostrar primero los tres estudiantes prioritarios y se agregará un resumen semanal por correo, para repetir T3 con docentes reales antes del piloto."));

// ---- 6 PVU ----
push(H1("6. Propuesta de valor única"));
push(P("Con la estructura del curso, [solución] para [segmento] que [beneficio], la propuesta de valor única es:"));
push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 160 }, indent: { left: 600, right: 600 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: "1F6F54", space: 8 } }, children: runs("*“NivelaTec, para estudiantes de primer año técnico-profesional, detecta en la primera semana qué le falta a cada uno y lo nivela antes de su primera prueba, avisando al docente a tiempo para intervenir.”*") }));
push(P("El beneficio principal es llegar a la primera evaluación con las brechas trabajadas, no la tecnología. La diferenciación está en el momento (antes de la Prueba 1, no después de reprobar) y en el vínculo entre la práctica del estudiante y la acción del docente, que los tutores de IA gratuitos no ofrecen. Para la institución, el valor se expresa así: una licencia para 1.500 estudiantes cuesta " + clp(FIN.costo_inst_1500) + " al año, equivalente al arancel de " + fmt(FIN.retenidos_equivalentes, 0) + " estudiantes con un arancel de referencia supuesto de CLP 2.000.000; si la plataforma contribuye a retener a 18 estudiantes de cada 1.500 (1,2 pp), la inversión se recupera. **Concepto de alto nivel:** “el GPS de la nivelación para el primer año TP”."));

// ---- 7 Canales ----
push(H1("7. Canales"));
push(P("Los canales se diseñan por actor y por etapa del recorrido. Como el cliente es institucional, la adquisición ocurre con el decisor y la activación con el estudiante, a través del docente y del aula virtual que ya usa (Tabla 5)."));
push(caption("Tabla", "Mapa de canales por etapa"));
push(table(["Campo", "Adquisición", "Activación", "Fidelización"], [
  ["Usuario y necesidad", "VRA/DAE: reducir reprobación del 1.er semestre con evidencia.", "Estudiante: saber qué le falta antes de la Prueba 1.", "Institución: renovar si hay resultados; docente: seguir usando el panel."],
  ["Canal y alternativa asistida", "Reunión con VRA/DAE + demostración del MVP; jornadas de retención y redes de directivos TP.", "Enlace en el aula virtual (LTI) + 15 minutos del docente en la primera clase para rendir el diagnóstico en sala.", "Informe de resultados por cohorte; resumen semanal al docente; reunión de cierre de semestre."],
  ["Mensaje y acción solicitada", "“Piloto de un semestre en un ramo crítico, con grupo de comparación y métricas acordadas.”", "“En 10 minutos sabrás qué repasar antes de la Prueba 1. No afecta tu nota.”", "“Tus secciones con NivelaTec: adopción, alertas atendidas y aprobación.”"],
  ["Beneficio observable", "Convenio de piloto firmado.", "Diagnóstico completado y primer módulo terminado.", "Renovación anual y ampliación a otros ramos."],
  ["Responsable y aliado", "Equipo NivelaTec; aliado: unidad de retención.", "Docente del ramo; soporte TI de la institución.", "Equipo NivelaTec; jefatura de carrera."],
  ["Indicador con denominador", "Pilotos firmados ÷ demostraciones realizadas.", "Estudiantes que inician el diagnóstico ÷ estudiantes asignados.", "Instituciones que renuevan ÷ instituciones con contrato vigente."],
], [1700, 2560, 2550, 2550], { firstColFill: true }));
push(nota("Elaboración propia con base en la guía de canales del curso."));
push(P("**Justificación.** El canal en sala responde a la barrera principal del segmento: el estudiante que trabaja y estudia desde el celular difícilmente abre una invitación por correo, mientras que la clase es un momento en que ya está presente. Además, la alerta solo genera valor cuando una persona actúa: en Georgia State University más del 90 % del costo del sistema correspondió a asesores y no al software (NPR, 2016)."));
push(P("**Experimento de canal (pendiente de medición).** *Para estudiantes de 1.er año TP, creemos que rendir el diagnóstico en los primeros 15 minutos de clase aumentará la tasa de inicio frente a la sola invitación por aula virtual. Lo probaremos asignando secciones a cada vía durante la primera semana del piloto. Mediremos estudiantes que inician ÷ asignados por vía. Continuaremos si la diferencia es ≥ 15 pp; ajustaremos el mensaje si es menor.*"));

// ---- 8 Ingresos ----
push(H1("8. Fuentes de ingresos"));
push(P("El modelo combina ingresos recurrentes por licencia con ingresos de implementación y financiamiento no dilutivo para la etapa de validación (Tabla 6)."));
push(caption("Tabla", "Fuentes de ingresos y financiamiento"));
push(table(["Fuente", "Modelo y precio", "Justificación"], [
  ["Licencia SaaS institucional (principal)", "CLP 24.000 por estudiante de 1.er año al año, facturación anual.", "La licencia de 100 estudiantes (CLP 2,4 MM) equivale al arancel de 1,2 estudiantes retenidos (ver sección 6). Los tutores IA gratuitos para docentes (El Comercio, 2025) presionan el precio a la baja, por lo que el cobro se asocia al panel y la evidencia, no al contenido."],
  ["Implementación y capacitación", "CLP 2.500.000 por institución nueva (pago único).", "Cubre integración LTI, carga de nóminas y capacitación docente."],
  ["Piloto pagado", "CLP 6.000.000 por semestre (~500 estudiantes), descontable de la primera licencia.", "Compromete a la institución y valida la disposición a pagar con una conducta, no con una declaración."],
  ["Financiamiento público", "CORFO Semilla Inicia: hasta CLP 15 MM con cofinanciamiento de hasta 75 % (CORFO, 2026).", "Financia la validación sin ceder propiedad."],
], [2100, 3130, 4130], { firstColFill: true }));
push(nota("MM = millones. Precio en revisión hasta medir la disposición a pagar en los pilotos."));
push(P(`**Sostenibilidad.** Con 8 instituciones y 13.000 estudiantes en 2028 (6,2 % de la matrícula de 1.er año TP) los ingresos proyectados son CLP ${fmt(p28.ing, 0)} MM, cifra consistente con la mediana de CLP 335,5 MM estimada por Monte Carlo en el segundo entregable. En 2029, con 14 instituciones y 22.000 estudiantes (10,5 %), alcanzan CLP ${fmt(p29.ing, 0)} MM. El margen por estudiante es CLP 21.000 (precio menos costo variable), y el punto de equilibrio operacional se alcanza con ${Math.round(FIN.break_even_est_2028).toLocaleString("es-CL")} estudiantes, aproximadamente seis instituciones medianas. **Validación del modelo:** pendiente; el primer indicador será la firma de los dos pilotos pagados.`));

// ---- 9 Costos ----
push(H1("9. Estructura de costos"));
push(P("Los costos se separan en la etapa de validación (seis meses, 2027) y la operación (2028–2029). La Tabla 7 detalla el presupuesto de validación, alineado con las recomendaciones R1–R4 del segundo entregable."));
push(caption("Tabla", "Presupuesto preliminar de la etapa de validación (CLP millones)"));
const valRows = [];
Object.entries(FIN.validacion).forEach(([g, items]) => { const tot = Object.values(items).reduce((a, b) => a + b, 0); valRows.push(["**" + g + "**", Object.entries(items).map(([k, v]) => `${k}: ${fmt(v)}`).join("; "), fmt(tot)]); });
valRows.push(["", "Imprevistos (5 %)", fmt(FIN.imprevistos)]);
valRows.push(["**Total**", "", "**" + fmt(FIN.total_val) + "**"]);
valRows.push(["**Financiamiento**", Object.entries(FIN.financ_val).map(([k, v]) => `${k}: ${fmt(v)}`).join("\n"), "**32,0**"]);
push(table(["Categoría", "Ítem y supuesto de cálculo", "Monto"], valRows, [2200, 5960, 1200], { alignRight: [2] }));
push(nota("JC = jornada completa. Remuneraciones estimadas con la referencia de mercado de Chiletrabajos (2026) para programador full-stack (CLP 987.539 mensuales) más costo empleador."));
push(P(`Para la operación (detalle en la Tabla 11 del Anexo A), los costos fijos de 2028 suman CLP ${fmt(p28.fijos)} MM, de los cuales CLP ${fmt(p28.personal)} MM son personal (${p28.fte} jornadas completas); con el costo variable, el costo total es CLP ${fmt(p28.costos)} MM y el resultado operacional, CLP ${fmt(p28.resultado)} MM (CLP ${fmt(p29.resultado)} MM en 2029). El costo variable de CLP 3.000 por estudiante al año incluye consumo de API de IA (1.500), nube (500) y soporte (1.000). El ${fmt(100*p28.personal/p28.fijos,0)} % del costo fijo corresponde a personal, lo que coincide con la experiencia de Georgia State de que el valor depende de las personas que operan el sistema (NPR, 2016).`));

// ---- 10 Métricas ----
push(H1("10. Métricas clave"));
push(P("Las métricas priorizan conducta observable sobre opinión y se definen antes de medir. Se elige como KPI principal del piloto la **adopción efectiva (A1)**; la Tabla 8 presenta su ficha técnica."));
push(caption("Tabla", "Ficha técnica del KPI A1 (adopción efectiva)"));
push(table(["Campo", "Definición"], [
  ["Objetivo y decisión", "Comprobar la primera adopción real; decidir si ampliar el piloto."],
  ["Población y período", "Estudiantes asignados a secciones con NivelaTec al inicio del semestre; cohorte cerrada; 14 días."],
  ["Evento de éxito", "Diagnóstico completado y al menos un módulo terminado con constancia (evento modulo_completado)."],
  ["Numerador / denominador", "Estudiantes únicos con el evento de éxito ÷ todos los asignados, incluidos los no contactados."],
  ["Fuente y responsable", "Nómina del curso y registro de eventos con identificador seudónimo; analista del piloto; revisión semanal."],
  ["Meta y decisión", "≥ 50 %: considerar ampliación; < 50 %: diagnosticar barreras por paso del embudo y por canal."],
  ["Limitación", "No mide aprendizaje ni retención; un activado puede no sostener el uso."],
], [2400, 6960], { firstColFill: true }));
push(new Paragraph({ spacing: { after: 0 }, children: [] }), P(`**Resultados (simulación del piloto).** Se simuló un piloto en dos instituciones con 1.000 estudiantes en 40 secciones, asignadas al azar por sección (500 con NivelaTec y 500 de comparación), con parámetros calibrados en la literatura y en el segundo entregable (Anexo A). La Figura 5 muestra el embudo y la Tabla 9, el tablero.`));
push(caption("Figura", "Embudo de adopción del grupo con NivelaTec (simulación)"), img("fig_embudo.png", 440), nota("Datos simulados (semilla 2026). No corresponden a estudiantes reales."));
push(caption("Tabla", "Tablero de métricas del piloto con resultados simulados"));
push(table(["Código y dimensión", "Fórmula", "Meta", "Resultado simulado", "Lectura"], [
  ["A1 Adopción efectiva (KPI)", "Activados ÷ asignados", "≥ 50 %", `${pi.activa}/${pi.nT} = ${pct(pi.activa, pi.nT)}`, "Revisar"],
  ["A2 Activación", "Activados ÷ inician diagnóstico", "≥ 70 %", `${pi.activa}/${pi.inicia} = ${pct(pi.activa, pi.inicia)}`, "Revisar"],
  ["C1 Completitud del diagnóstico", "Completan ÷ inician", "≥ 85 %", `${pi.completa}/${pi.inicia} = ${pct(pi.completa, pi.inicia)}`, "Cumple"],
  ["U2 Uso sostenido", "≥ 3 módulos a sem. 6 ÷ activados", "≥ 50 %", `${pi.sostiene}/${pi.activa} = ${pct(pi.sostiene, pi.activa)}`, "Cumple"],
  ["A3 Adopción docente (KPI)", "Docentes que atienden ≥ 1 alerta ÷ docentes habilitados", "≥ 80 %", `${pi.doc_adopta}/${pi.doc_n} = ${pct(pi.doc_adopta, pi.doc_n, 0)}`, "No cumple"],
  ["S1 Satisfacción", "Respuestas 4 o 5 ÷ respuestas válidas", "≥ 80 %", `${pi.satisf_4_5}/${pi.encuesta_resp} = ${pct(pi.satisf_4_5, pi.encuesta_resp)}`, "Cumple"],
  ["S2 Respuesta a encuesta", "Respuestas ÷ activados invitados", "≥ 40 %", `${pi.encuesta_resp}/${pi.activa} = ${pct(pi.encuesta_resp, pi.activa)}`, "Cumple"],
  ["P1 Tiempo docente", "Min./semana para identificar riesgo por sección", "≤ 10 min", "45 → 6 min (supuesto)", "Pendiente de medición"],
  ["I1 Reprobación del ramo crítico (KPI)", "Reprobados ÷ inscritos, por grupo", "≥ 5 pp menos e IC95 > 0", `${fmt(pi.reprob_C * 100)} % vs. ${fmt(pi.reprob_T * 100)} %; dif. ${fmt(pi.diff_pp)} pp (IC95 ${fmt(pi.ic95_pp[0])} a ${fmt(pi.ic95_pp[1])})`, "Inconcluso"],
  ["V1 Costo por activado", "Costo del piloto ÷ activados", "≤ CLP 50.000", clp(pi.costo_por_activado), "No cumple"],
], [2050, 2350, 1250, 2410, 1300]));
push(nota("IC95 = intervalo de confianza al 95 %, corregido por efecto de diseño de 2,2 (correlación intraclase 0,05). Las metas son propuestas del equipo, no estándares."));
push(P(`**Interpretación.** (1) La adopción efectiva (${pct(pi.activa, pi.nT)}) queda bajo la meta y la mayor pérdida ocurre entre la invitación y el inicio del diagnóstico (${pi.entregada - pi.inicia} estudiantes), lo que apunta al canal de activación y no al producto: el diagnóstico, una vez iniciado, se completa en ${pct(pi.completa, pi.inicia)} de los casos. (2) Solo la mitad de los docentes actuó sobre las alertas, coincidiendo con la prueba de tareas; sin acción docente la alerta temprana no genera valor. (3) La diferencia en reprobación favorece a NivelaTec, pero el intervalo incluye el cero. En 5.000 repeticiones de Monte Carlo la diferencia mediana fue ${fmt(mc.diff_p50)} pp (p5 ${fmt(mc.diff_p5)}; p95 ${fmt(mc.diff_p95)}) y la potencia estadística, ${pct(mc.potencia, 1, 0).replace(" %", "")} %; con 100 secciones subiría solo a ${fmt(pw["100"] * 100, 0)} %. El piloto, por lo tanto, puede validar adopción pero no impacto, tal como advirtió el riesgo R-01 del segundo entregable. (4) El costo por activado supera la meta porque el costo fijo del piloto se reparte entre pocos usuarios; mejora al aumentar A1.`));
push(P("El caso de Course Signals en Purdue mostró que la asociación entre uso y retención puede deberse a que quienes persisten usan más la herramienta (Straumsheim, 2013); por ello el diseño exige grupo de comparación asignado al azar."));
push(P("**Mapa de validación y decisión.** *Creemos que los estudiantes de 1.er año TP completarán un módulo de su ruta al usar el MVP v0.3. Lo probaremos con dos pilotos de un semestre y 1.000 estudiantes. Mediremos A1. Continuaremos si A1 ≥ 50 % y A3 ≥ 80 %, y ajustaremos si alguno no se alcanza. Esta prueba permite concluir sobre adopción y no permite concluir todavía sobre reducción de la reprobación.* Con los resultados simulados la decisión es **ajustar antes de ampliar**: incorporar el diagnóstico en sala, el resumen semanal al docente y repetir la medición."));

// ---- 11 Ventaja ----
push(H1("11. Ventaja competitiva"));
push(P("La Tabla 10 compara NivelaTec con las alternativas disponibles. La combinación de diagnóstico adaptativo, contexto técnico-profesional y alerta al docente integrada a la institución no aparece en ninguna de ellas."));
push(caption("Tabla", "Benchmarking de soluciones de nivelación"));
const Y = "Sí", N = "No", Pa = "Parcial";
push(table(["Solución", "Segmento", "Diagnóstico adaptativo", "Alerta al docente", "Contexto TP", "Integración institucional"], [
  ["**NivelaTec**", "CFT/IP, 1.er año", Y, Y, Y, "LTI (v2)"],
  ["SofIA, U. de Chile (CNN Chile, s. f.)", "Universitario propio", Y, "No informado", N, "Interna"],
  ["Tutor de nivelación UACh (Ciencia en Chile, 2024)", "Ingeniería, universitario", Pa, "No informado", N, "Interna"],
  ["ALEKS, McGraw Hill (CaseStudies.com, s. f.)", "Educación superior EE. UU.", Y, Pa, N, Y],
  ["Khanmigo (El Comercio, 2025)", "Docentes, gratuito", N, N, N, N],
  ["Programas presenciales (Universidad Mayor, 2026)", "Institución propia", N, Pa, Pa, Y],
  ["Tutores IA genéricos", "Abierto, gratuito", N, N, N, N],
], [2600, 1700, 1250, 1250, 1060, 1500]));
push(nota("Elaboración propia a partir de la información pública de cada solución; “No informado” indica que la fuente no lo menciona."));
push(P("**Fuentes de ventaja difícil de replicar.** (1) *Datos propios:* cada piloto calibra el banco de ítems y la regla de riesgo con datos del sector TP, un activo que crece con el uso y que un competidor nuevo no posee. (2) *Conocimiento especializado:* ítems contextualizados por especialidad técnica validados por docentes del sector. (3) *Acceso institucional:* los convenios y la integración con el aula virtual elevan el costo de cambio. (4) *Cumplimiento desde el diseño* con la Ley N.º 21.719, vigente desde diciembre de 2026 (Biblioteca del Congreso Nacional de Chile, 2024), que exige a los competidores genéricos una adaptación que NivelaTec ya incorpora."));
push(P("**Validación.** La ventaja está respaldada por benchmarking y por la evidencia de que el aprendizaje adaptativo mejora el desempeño en la mayoría de los estudios revisados (du Plooy et al., 2024) y de que su adopción institucional puede elevar la aprobación de matemática de nivelación (de 52 % a 61 % en Triton College, caso reportado por el proveedor; CaseStudies.com, s. f.). La validación experta queda pendiente: se entrevistará a tres jefaturas de carrera y a una DAE con una pauta de evaluación de la propuesta. El análisis FODA (Tabla 13, Anexo D) resume la posición."));
// ---- 12 Conclusiones ----
push(H1("12. Conclusiones"));
push(P("El Lean Canvas muestra un modelo coherente: un problema respaldado por cifras oficiales, un segmento con usuario, operador y comprador diferenciados, una solución acotada a un MVP funcional y una propuesta de valor centrada en el momento previo a la primera evaluación. El modelo B2B alcanza el equilibrio con unas seis instituciones medianas."));
push(P("La simulación anticipa que el riesgo principal es que el estudiante no inicie el diagnóstico y que el docente no actúe sobre la alerta, y que un piloto de 1.000 estudiantes no bastará para demostrar impacto. Los próximos pasos son aplicar la prueba del Anexo B con usuarios reales, ajustar la activación en sala, validar la ventaja con jefaturas de carrera y firmar dos pilotos con A1 y A3 como criterios."));

// ---- Referencias ----
const refs = [
  "Barrientos, N., Araya, B., Pinto, S. y Quiroz, S. (2026a). *Nivelación adaptativa con inteligencia artificial para reducir la reprobación y la deserción de primer año en la educación técnica y profesional en Chile* [Primer entregable, CINF113]. Universidad Andrés Bello.",
  "Barrientos, N., Araya, B., Pinto, S. y Quiroz, S. (2026b). *Inteligencia estratégica y vigilancia tecnológica para NivelaTec* [Segundo entregable, CINF113]. Universidad Andrés Bello.",
  "Biblioteca del Congreso Nacional de Chile. (2024). *Ley N.º 21.719 que regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales*. https://www.bcn.cl/leychile/navegar?idNorma=1209272",
  "CaseStudies.com. (s. f.). *Case study: Triton College achieves higher developmental math pass rates and greater equity with McGraw Hill ALEKS*. https://www.casestudies.com/company/mc-graw-hill/case-study/triton-college-customer-case-study",
  "Chiletrabajos. (2026). *Sueldo promedio de programador fullstack*. Recuperado el 8 de noviembre de 2026, de https://www.chiletrabajos.cl/sueldos/programador/fullstack",
  "Ciencia en Chile. (2024, 28 de marzo). *Crean tutor de nivelación matemática para estudiantes de ingeniería de la UACh*. https://www.cienciaenchile.cl/crean-tutor-de-nivelacion-matematica-para-estudiantes-de-ingenieria-de-la-uach/",
  "CNN Chile. (s. f.). *Universidad de Chile presenta SofIA, tutoría inteligente para fortalecer el razonamiento matemático*. Recuperado el 8 de noviembre de 2026, de https://www.cnnchile.com/pais/universidad-chile-presenta-sofia-tutoria-inteligente-fortalecer-razonamiento-matematico/",
  "Consejo Nacional de Educación. (s. f.). *Retención de primer año*. Índices CNED. Recuperado el 5 de septiembre de 2026, de https://cned.cl/indices/retencion-primer-ano/",
  "Corporación de Fomento de la Producción. (2026, 26 de mayo). *Concurso Semilla Inicia* [Aviso de apertura]. https://legales.cooperativa.cl/wp-content/uploads/2026/05/VERSIÓN-IMPRESA-CONCURSO-SEMILLA-INICIA.pdf",
  "du Plooy, E., Casteleijn, D. y Franzsen, D. (2024). Personalized adaptive learning in higher education: A scoping review of key characteristics and impact on academic performance and engagement. *Heliyon, 10*(21), e39630. https://doi.org/10.1016/j.heliyon.2024.e39630",
  "El Comercio. (2025, 5 de febrero). *Khanmigo para maestros, asistente educativo con IA, ahora está disponible de forma gratuita y en español*. https://elcomercio.pe/tecnologia/inteligencia-artificial/khanmigo-para-maestros-asistente-educativo-con-ia-ahora-esta-disponible-de-forma-gratuita-y-en-espanol-inteligencia-artificial-noticia/",
  "Gálvez, R. (2022, 10 de agosto). Educación superior: Retención de estudiantes de primer año es de 75,4 %, la segunda tasa más alta de los últimos 15 años. *La Tercera*. https://www.latercera.com/nacional/noticia/educacion-superior-retencion-de-estudiantes-de-primer-ano-es-de-754-la-segunda-tasa-mas-alta-de-los-ultimos-15-anos/MMAAPA42YVHGFIZAPEBOTUJTBA/",
  "Harris, C. R., Millman, K. J., van der Walt, S. J., Gommers, R., Virtanen, P., Cournapeau, D., … Oliphant, T. E. (2020). Array programming with NumPy. *Nature, 585*(7825), 357–362. https://doi.org/10.1038/s41586-020-2649-2",
  "Hunter, J. D. (2007). Matplotlib: A 2D graphics environment. *Computing in Science & Engineering, 9*(3), 90–95. https://doi.org/10.1109/MCSE.2007.55",
  "Maurya, A. (2012). *Running lean: Iterate from plan A to a plan that works* (2.ª ed.). O’Reilly Media.",
  "Microsoft. (2026). *Playwright* [Software]. https://playwright.dev",
  "NPR. (2016, 30 de octubre). *How one university used big data to boost graduation rates*. https://www.npr.org/sections/ed/2016/10/30/499200614/how-one-university-used-big-data-to-boost-graduation-rates",
  "Osterwalder, A. y Pigneur, Y. (2010). *Business model generation*. John Wiley & Sons.",
  "Psicometrix. (2024, 11 de septiembre). *Abandono de los estudios: Datos sobre la deserción universitaria en Chile*. https://psicometrix.cl/abandono-de-los-estudios-datos-sobre-la-desercion-universitaria-en-chile/",
  "Ries, E. (2011). *The lean startup*. Crown Business.",
  "Saavedra Ortega, C. (2024, 16 de diciembre). *Chile lidera el déficit en comprensión lectora según resultados de la OCDE*. Universidad Católica de la Santísima Concepción. https://educacion.ucsc.cl/noticias/chile-lidera-el-deficit-en-comprension-lectora-segun-resultados-de-la-ocde/",
  "Servicio de Información de Educación Superior. (2023, agosto). *Informe de retención de 1er año de pregrado: Cohortes 2018–2022*. Subsecretaría de Educación Superior. https://www.mifuturo.cl/wp-content/uploads/2023/09/Retencion_de_Pregrado_2023_SIES.pdf",
  "Servicio de Información de Educación Superior. (2026, julio). *Matrícula en educación superior en Chile: Informe 2026*. Subsecretaría de Educación Superior. https://educacionsuperior.mineduc.cl/wp-content/uploads/sites/49/2026/07/Informe-de-Matricula-2026.pdf",
  "Straumsheim, C. (2013, 11 de noviembre). Student retention software comes under microscope. *Times Higher Education*. https://www.timeshighereducation.com/news/student-retention-software-comes-under-microscope/2008904.article",
  "Universidad Mayor. (2026, 17 de marzo). *U. Mayor consolida su Programa Intensivo de Nivelación para estudiantes de primer año*. Diario Mayor. https://www.diariomayor.cl/lo-ultimo/pregrado/u-mayor-consolida-su-programa-intensivo-de-nivelacion-para-estudiantes-de-primer-ano",
];
push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun("Referencias")] }));
refs.forEach((r) => push(new Paragraph({ children: runs(r), indent: { left: 720, hanging: 720 }, spacing: { after: 100 }, alignment: AlignmentType.LEFT })));

// ---- Anexos ----
push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun("Anexo A. Supuestos de la simulación y del modelo financiero")] }));
push(caption("Tabla", "Proyección de ingresos y costos de operación (CLP millones)"));
const ofk = Object.keys(p28.otros_fijos);
push(table(["Concepto", "2028", "2029"], [
  ["Instituciones / estudiantes", `${p28.inst} / ${p28.est.toLocaleString("es-CL")}`, `${p29.inst} / ${p29.est.toLocaleString("es-CL")}`],
  ["**Ingresos totales**", "**" + fmt(p28.ing) + "**", "**" + fmt(p29.ing) + "**"],
  ["Personal", `${fmt(p28.personal)} (${p28.fte} JC)`, `${fmt(p29.personal)} (${p29.fte} JC)`],
  ...ofk.map((k) => [k, fmt(p28.otros_fijos[k]), fmt(p29.otros_fijos[k])]),
  ["Costo variable (CLP 3.000 por estudiante)", fmt(p28.var), fmt(p29.var)],
  ["**Costos totales**", "**" + fmt(p28.costos) + "**", "**" + fmt(p29.costos) + "**"],
  ["**Resultado operacional**", "**" + fmt(p28.resultado) + "**", "**" + fmt(p29.resultado) + "**"],
], [4760, 2300, 2300], { alignRight: [1, 2] }));
push(nota("Proyección con supuestos del equipo; no incluye impuestos ni depreciación. Cálculo en simulacion/finanzas_figuras.py (Anexo C)."));


push(P("La simulación (archivo simulacion.py) genera una cohorte sintética con semilla fija (2026) para que los resultados sean reproducibles. La Tabla 12 lista los parámetros y su respaldo. Cambiar un parámetro y volver a ejecutar el código actualiza todas las cifras del informe."));
push(caption("Tabla", "Parámetros de la simulación y respaldo"));
const pr = SIM.params;
push(table(["Parámetro", "Valor", "Respaldo"], [
  ["Secciones × estudiantes por sección", `${pr.secciones} × ${pr.est_por_seccion}`, "Tamaño de curso típico TP; asignación aleatoria por sección."],
  ["Invitación entregada / inicia diagnóstico", `${fmt(pr.p_invitacion_entregada * 100, 0)} % / ${fmt(pr.p_inicia_diag * 100, 0)} %`, "Supuesto del equipo para canal de aula virtual."],
  ["Completa diagnóstico / activa / sostiene", `${fmt(pr.p_completa_diag * 100, 0)} % / ${fmt(pr.p_activa * 100, 0)} % / ${fmt(pr.p_sostiene * 100, 0)} %`, "Supuestos condicionales al paso anterior."],
  ["Reprobación del ramo crítico sin intervención", `${fmt(pr.reprob_control * 100, 0)} %`, "Segundo entregable (Barrientos et al., 2026b)."],
  ["Efecto en usuarios sostenidos / activados", `−${fmt(pr.efecto_sostenido_pp * 100, 0)} pp / −${fmt(pr.efecto_activado_pp * 100, 0)} pp`, "Orden de magnitud de Triton College (+9 pp en aprobación; CaseStudies.com, s. f.)."],
  ["Correlación intraclase por sección", fmt(pr.icc, 2), "Valor conservador habitual en estudios por conglomerados."],
  ["Docentes habilitados / probabilidad de actuar", `${pr.docentes_trat} / ${fmt(pr.p_docente_adopta * 100, 0)} %`, "Supuesto del equipo."],
  ["Satisfacción 4–5 / tasa de respuesta", `${fmt(pr.p_satisf_4_5 * 100, 0)} % / ${fmt(pr.p_responde_encuesta * 100, 0)} %`, "Supuesto del equipo."],
  ["Costo atribuible del piloto", clp(pr.costo_piloto_clp), "Recomendación R1 del segundo entregable."],
  ["Prueba de tareas: éxito diagnóstico / módulo / docente", `${fmt(pr.p_diag_sin_ayuda * 100, 0)} % / ${fmt(pr.p_modulo * 100, 0)} % / ${fmt(pr.p_doc_identifica * 100, 0)} %`, "Supuesto del equipo; 10 estudiantes y 5 docentes sintéticos."],
], [3400, 2300, 3660]));
push(nota("Repeticiones de Monte Carlo: 5.000 para la distribución del efecto y 1.500 por tamaño para la curva de potencia (40 secciones: 23 %; 60: 35 %; 80: 43 %; 100: 54 %)."));

push(H1("Anexo B. Protocolo de la prueba de tareas con usuarios reales"));
push(B("**Participantes:** 10 estudiantes de 1.er año de un CFT o IP, ajenos al equipo y con distintos perfiles (incluidos quienes trabajan), y 5 docentes de ramos críticos. Consentimiento informado y datos seudonimizados."));
push(B("**Procedimiento (15 min por estudiante):** abrir el MVP desde un enlace, rendir el diagnóstico sin ayuda, completar el primer módulo de la ruta y explicar qué haría después. El moderador no orienta; el observador registra tiempo, errores y el primer punto de duda."));
push(B("**Procedimiento docente (10 min):** identificar a los estudiantes en riesgo alto y registrar un contacto; luego, explicar la regla de riesgo con sus palabras."));
push(B("**Registro:** planilla con éxito por tarea, tiempo, paso del error, solicitudes de ayuda y una cita textual breve con permiso."));
push(B("**Decisión previa:** los umbrales de la Tabla 4. Si T1 o T2 no se cumplen, simplificar el paso donde se concentran los errores y repetir; si T3 no se cumple, rediseñar la vista docente."));
push(B("**Pregunta de satisfacción:** “Pensando en lo que acabas de hacer, ¿qué tan fácil fue?” (escala 1–5) y “¿Qué te dificultó completar la tarea?”."));

push(H1("Anexo C. Código y herramientas"));
push(P("Todo el código está en el repositorio del grupo, carpeta entregable3: mvp/nivelatec_mvp.html (prototipo HTML, CSS y JavaScript sin dependencias), simulacion/simulacion.py (simulación con NumPy; Harris et al., 2020), simulacion/finanzas_figuras.py (modelo financiero y figuras con Matplotlib; Hunter, 2007), pruebas/test_mvp.js (prueba técnica con Playwright; Microsoft, 2026) e informe/build_informe.js (generación de este documento). El prototipo publicado está disponible en " + MVP_URL + ".", { alignment: AlignmentType.LEFT }));

push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun("Anexo D. Análisis FODA")] }));
push(caption("Tabla", "Análisis FODA de NivelaTec"));
push(table(["Fortalezas", "Debilidades"], [
  ["MVP funcional e instrumentado; foco exclusivo en el sector TP; vínculo estudiante-docente antes de la Prueba 1.", "Sin evidencia primaria de usuarios aún; dependencia de la acción docente (A3); equipo reducido."],
  ["**Oportunidades**", "**Amenazas**"],
  ["209.775 estudiantes de 1.er año TP; brecha de retención estancada; fondos CORFO para validación.", "Tutores IA gratuitos en español; presupuestos ajustados en el sector TP; exigencias de la Ley N.º 21.719 y de la futura ley de IA."],
], [4680, 4680]));
push(nota("Actualizado a partir del FODA del segundo entregable."));



// ================== DOCUMENTO ==================
const cover = [];
if (LOGO && fs.existsSync(LOGO)) {
  const lb = fs.readFileSync(LOGO);
  const lw = lb.readUInt32BE(16), lh = lb.readUInt32BE(20);
  cover.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new ImageRun({ type: "png", data: lb, transformation: { width: 170, height: Math.round((170 * lh) / lw) } })] }));
} else cover.push(new Paragraph({ spacing: { before: 1200 }, children: [] }));
const c = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after ?? 120 }, children: [new TextRun({ text: t, bold: o.bold, size: o.size || 22, italics: o.italics })] });
cover.push(c("UNIVERSIDAD ANDRÉS BELLO", { bold: true, size: 26 }), c("FACULTAD DE INGENIERÍA", { bold: true }), c("(Ingeniería Civil Informática)", { after: 600 }));
cover.push(c("ENTREGABLE UNIDAD 3 · SUMATIVA 3 (SEMANA 12)", { bold: true, size: 24, after: 300 }));
cover.push(c("Evaluación de la propuesta de valor de NivelaTec: Lean Canvas, diseño del producto mínimo viable y plan de validación para la nivelación de primer año en el sector técnico-profesional", { bold: true, size: 30, after: 900 }));
cover.push(c("Integrantes: Nicolás Barrientos · Benjamín Araya · Sebastián Pinto · Sebastián Quiroz"), c("Docente: Hugo Beltrán Alejos"), c("Taller de Transferencia Tecnológica (CINF113)"), c("N° de grupo: 1", { after: 900 }), c("Santiago, noviembre de 2026"));
cover.push(new Paragraph({ children: [new PageBreak()] }));

const doc = new Document({
  creator: "Grupo 1 CINF113", title: "CINF113_s12_grupo01 — Lean Canvas NivelaTec", features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 276, lineRule: LineRuleType.AUTO } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 28, bold: true, color: "1F4E3D" }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 24, bold: true, color: "1F4E3D" }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
      { id: "TOCHeading", name: "Indice Titulo", basedOn: "Normal", paragraph: { spacing: { after: 160 } }, run: { font: FONT, size: 28, bold: true, color: "1F4E3D" } },
    ],
  },
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: cover },
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, pageNumbers: { start: 2 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
      children: [
        new Paragraph({ style: "TOCHeading", children: [new TextRun("Índice")] }),
        new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),
        ...body,
      ],
    },
  ],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("OK", OUT); });
