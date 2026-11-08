# Transferencia Tecnológica UNAB · NivelaTec

Repositorio del proyecto de **CINF113 – Taller de Transferencia Tecnológica** (Universidad Andrés Bello), Grupo 1.
Integrantes: Nicolás Barrientos · Benjamín Araya · Sebastián Pinto · Sebastián Quiroz. Docente: Hugo Beltrán Alejos.

**NivelaTec** es una plataforma de nivelación adaptativa con alerta temprana para estudiantes de primer año de CFT e IP: diagnóstico adaptativo → ruta de práctica con retroalimentación → alerta al docente antes de la primera prueba.

## Contenido

| Ruta | Qué es |
|---|---|
| [`entregable3/`](entregable3/) | Entregable 3 (semana 12): Lean Canvas, MVP, simulación, informe y presentación. Ver su [README](entregable3/README.md). |
| [`entregable3/informe/`](entregable3/informe/) | Informe `CINF113_s12_grupo01` en Word y PDF, más el código que lo genera. |
| [`entregable3/mvp/nivelatec_mvp.html`](entregable3/mvp/nivelatec_mvp.html) | MVP funcional usado en el informe (vistas estudiante, docente y registro de eventos). |
| [`entregable3/simulacion/`](entregable3/simulacion/) | Simulación del piloto y modelo de ingresos/costos (datos **simulados**, semilla 2026). |
| [`entregable3/presentacion/`](entregable3/presentacion/) | Fuente de las diapositivas de la presentación oral. |
| [`index.html`](index.html) | Versión alternativa del MVP trabajada por Benjamín. |
| `CINF113_s12_grupo01.docx` (raíz) | Versión del informe editada por Benjamín ("arreglando documento"). |

## Comparar los dos MVP (para decidir en grupo)

**En GitHub Pages (enlaces públicos para todo el grupo):**

- Página para comparar: https://nico8270.github.io/Transferencia-Tecnologica-Unab-NB/mvps.html
- [MVP A](https://benja2030.github.io/MVP-Transferencia-Tec/mvp-nico/)
- [MVP B](https://benja2030.github.io/MVP-Transferencia-Tec/mvp-benja/)

También están publicadas en Claude (requieren que el dueño las comparta):

| Versión | Ver en línea | Archivo en el repo |
|---|---|---|
| MVP A · Nicolás (usado en el informe actual) | https://claude.ai/artifact/KQ1aF4QgipYaSNd2VMcLF1 | `entregable3/mvp/nivelatec_mvp.html` |
| MVP B · Benjamín | https://claude.ai/artifact/G1DP1vxTwBPNscFNRrkHQi | `index.html` |

Diferencias rápidas para la discusión:

| | MVP A | MVP B |
|---|---|---|
| Diagnóstico | 12 ítems adaptativos: fracciones, porcentajes, álgebra y lectura técnica | 12 ítems adaptativos: álgebra, fracciones/porcentajes, funciones lineales y comprensión de enunciados |
| Práctica | Módulos de 4 ejercicios con retroalimentación por error específico | Práctica continua con dominio que sube o baja hasta 75 %, pistas por tema |
| IA | Simulada con reglas (“Mago de Oz”) | Botón “Explícamelo de otra forma” con IA (requiere activar permisos en la publicación) |
| Panel docente | 23 estudiantes ficticios, semáforo de riesgo y registro de contacto | Datos reales de quienes lo usan, alertas y descarga CSV |
| Métricas | Pestaña de registro de eventos (embudo A1/A2) | Estadísticas del curso en el panel |

> Los enlaces son privados hasta que el dueño los comparte desde el menú **Compartir** de cada página. Si no te abren, pídele a Nicolás que te dé acceso.

También puedes descargar cualquiera de los dos archivos `.html` y abrirlo con doble clic.

## Cómo regenerar figuras e informe

Instrucciones paso a paso en [`entregable3/README.md`](entregable3/README.md).

## Pendientes

- **MVP vibecodeado, revisar** (nota de Benjamín): definir cuál MVP queda como versión final (`index.html` o `entregable3/mvp/`) y que el informe y la presentación apunten al mismo.
- Unificar el informe: hay dos .docx (raíz y `entregable3/informe/`); dejar uno solo como versión final.
- Reemplazar los resultados simulados por una prueba real con estudiantes (protocolo en el Anexo B del informe).
