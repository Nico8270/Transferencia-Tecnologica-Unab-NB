# Entregable 3 · CINF113 — Lean Canvas y MVP de NivelaTec

Código completo del tercer entregable (semana 12). Todo es reproducible con semilla fija.

| Carpeta | Contenido |
|---|---|
| `mvp/nivelatec_mvp.html` | MVP funcional (HTML/CSS/JS sin dependencias). Ábrelo con doble clic en el navegador. Versión publicada: https://claude.ai/artifact/KQ1aF4QgipYaSNd2VMcLF1 |
| `pruebas/test_mvp.js` | Prueba técnica automatizada con Playwright (recorre el flujo y toma capturas). |
| `pruebas/montaje_mvp.py` | Arma la Figura 4 a partir de las capturas. |
| `simulacion/simulacion.py` | Simulación del piloto y de la prueba de tareas (**datos simulados**, no reales). Genera `figuras/resultados_simulacion.json`. |
| `simulacion/finanzas_figuras.py` | Modelo de ingresos y costos + figuras (Lean Canvas, matriz MVP, embudo, finanzas). |
| `figuras/` | Figuras y resultados en JSON usados por el informe. `fig_flujo.mmd` es el diagrama Mermaid de la Figura 2. |
| `informe/build_informe.js` | Genera `CINF113_s12_grupo01.docx` con los datos de `figuras/`. |
| `informe/actualizar_indice.py` | Abre el .docx en LibreOffice, actualiza índice y campos y exporta el PDF. |

## Cómo regenerar todo

```bash
pip install numpy matplotlib pillow
npm install docx playwright        # una vez
python simulacion/simulacion.py
python simulacion/finanzas_figuras.py
node pruebas/test_mvp.js && python pruebas/montaje_mvp.py
mmdc -i figuras/fig_flujo.mmd -o figuras/fig_flujo.png -w 1600 -b white   # opcional (Mermaid CLI)
cd informe
node build_informe.js ../figuras CINF113_s12_grupo01.docx assets/logo_unab.png
python actualizar_indice.py CINF113_s12_grupo01.docx    # requiere LibreOffice
```

> Los resultados de usuarios son **simulados** y así se declaran en el informe. Reemplázalos con datos reales siguiendo el protocolo del Anexo B.
