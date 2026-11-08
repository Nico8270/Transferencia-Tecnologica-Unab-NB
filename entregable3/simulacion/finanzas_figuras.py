"""Modelo de ingresos/costos y figuras del Entregable 3 (NivelaTec)."""
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

from pathlib import Path
OUT = str(Path(__file__).resolve().parent.parent / "figuras") + "/"
R = json.load(open(OUT + "resultados_simulacion.json"))
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
INK, ACC, MID, RISK, GREY = "#18232e", "#1f6f54", "#b9770e", "#b4372f", "#8a979f"

# ------------------ Finanzas (CLP millones) ------------------
PRECIO = 24_000          # CLP por estudiante de 1er año por año
IMPL = 2.5               # MM por institución nueva (pago único)
VAR = 3_000              # CLP por estudiante-año (IA 1.500 + hosting 500 + soporte 1.000)
validacion = {
    "Equipo (6 meses)": {"Desarrollador/a full-stack 1,0 JC (1,4 × 6)": 8.4, "Pedagogo/a de matemática 0,5 JC (0,8 × 6)": 4.8, "Coordinación y producto 0,5 JC (0,6 × 6)": 3.6},
    "Tecnología": {"Nube, dominio y respaldos": 0.9, "API de IA (pruebas y piloto)": 0.6, "Herramientas de software": 0.6},
    "Legal y cumplimiento": {"Asesoría Ley 21.719 y evaluación de impacto": 3.0, "Constitución SpA y contratos": 0.6},
    "Contenido": {"Banco de 300 ítems TP validado por 2 expertos": 3.0},
    "Evaluación del piloto": {"Evaluador/a externo/a": 2.5, "Incentivos para entrevistas y encuesta": 0.5},
    "Difusión y ventas": {"Eventos y reuniones con vicerrectorías": 1.5, "Material de demostración": 0.5},
}
sub = sum(v for g in validacion.values() for v in g.values())
imprev = round(0.05 * sub, 1)
total_val = round(sub + imprev, 1)
financ_val = {"CORFO Semilla Inicia (75 %)": 15.0, "Dos pilotos pagados (6,0 c/u)": 12.0, "Aporte del equipo (25 % del proyecto CORFO)": 5.0}

years = {
    2028: {"inst": 8, "est": 13_000, "nuevas": 6, "fte": 8, "costo_fte": 1.6, "otros_fijos": {"Nube base": 6, "Legal y DPO externo": 8, "Marketing y ventas": 14, "Administración y oficina": 10, "Evaluación e I+D": 6}},
    2029: {"inst": 14, "est": 22_000, "nuevas": 6, "fte": 12, "costo_fte": 1.7, "otros_fijos": {"Nube base": 10, "Legal y DPO externo": 10, "Marketing y ventas": 25, "Administración y oficina": 18, "Evaluación e I+D": 12}},
}
proj = {}
for y, d in years.items():
    lic = d["est"] * PRECIO / 1e6
    impl = d["nuevas"] * IMPL
    personal = d["fte"] * d["costo_fte"] * 12
    fijos = personal + sum(d["otros_fijos"].values())
    var = d["est"] * VAR / 1e6
    proj[y] = {"lic": lic, "impl": impl, "ing": lic + impl, "personal": personal, "fijos": fijos, "var": var,
               "costos": fijos + var, "resultado": lic + impl - fijos - var, **d}
be_2028 = proj[2028]["fijos"] * 1e6 / (PRECIO - VAR)
ARANCEL = 2_000_000
inst_1500 = 1500 * PRECIO
retenidos_eq = inst_1500 / ARANCEL
fin = {"validacion": validacion, "subtotal_val": sub, "imprevistos": imprev, "total_val": total_val,
       "financ_val": financ_val, "proj": proj, "break_even_est_2028": be_2028,
       "costo_inst_1500": inst_1500, "retenidos_equivalentes": retenidos_eq,
       "pct_mercado_2028": 13_000 / 209_775 * 100, "pct_mercado_2029": 22_000 / 209_775 * 100}
json.dump(fin, open(OUT + "finanzas.json", "w"), indent=2, ensure_ascii=False, default=float)
print(json.dumps({k: v for k, v in fin.items() if k != "validacion"}, indent=1, ensure_ascii=False, default=float))

# ------------------ Figura: Lean Canvas ------------------
def lean_canvas(path):
    fig, ax = plt.subplots(figsize=(13, 7.6), dpi=200)
    ax.set_xlim(0, 10); ax.set_ylim(0, 6); ax.axis("off")
    W = 2.0
    boxes = [
        # x, y, w, h, n, título, texto, color
        (0, 2, W, 4, "1", "PROBLEMA", "1. Llegan a 1.er año sin las bases de matemática y lectura que exigen los ramos críticos.\n2. El riesgo se detecta tarde: tras reprobar la 1.ª prueba.\n3. La nivelación disponible es masiva e igual para todos.\n\nAlternativas actuales: tutorías presenciales voluntarias, videos genéricos, tutores IA gratuitos sin vínculo con el docente.", "#f8e1de"),
        (W, 4, W, 2, "3", "SOLUCIÓN", "Diagnóstico adaptativo de 12 preguntas → ruta personalizada con retroalimentación por error → alerta temprana al docente antes de la 1.ª prueba.", "#dcefe6"),
        (W, 2, W, 2, "8", "MÉTRICAS CLAVE", "A1 adopción efectiva (activados/elegibles)\nA2 activación · A3 docentes que actúan\nS1 satisfacción · V1 costo por activado\nI1 reprobación del ramo crítico", "#e6ecf3"),
        (2 * W, 2, W, 4, "4", "PROPUESTA DE\nVALOR ÚNICA", "\"NivelaTec detecta en la semana 1 qué le falta a cada estudiante de primer año técnico-profesional y lo nivela antes de su primera prueba, avisando al docente a tiempo para intervenir.\"\n\nConcepto de alto nivel: el GPS de la nivelación para el primer año TP.", "#fdf3cf"),
        (3 * W, 4, W, 2, "9", "VENTAJA\nCOMPETITIVA", "Banco de ítems contextualizado por especialidad TP + datos de piloto propios para calibrar el riesgo; integración LTI con el aula virtual; cumplimiento Ley 21.719 desde el diseño.", "#efe3f5"),
        (3 * W, 2, W, 2, "5", "CANALES", "Adquisición: reunión con VRA/DAE + demo + piloto.\nActivación: enlace en el aula virtual y aviso del docente.\nFidelización: informe de resultados por cohorte y renovación anual.", "#e6ecf3"),
        (4 * W, 2, W, 4, "2", "SEGMENTOS DE\nCLIENTES", "Usuario: estudiante de 1.er año de CFT/IP, primera generación, egresado de liceo municipal o subvencionado (209.775 matriculados de 1.er año TP en 2026).\n\nCliente que paga: CFT/IP medianos (VRA, DAE, unidad de retención).\n\nUsuario operativo: docente de ramo crítico.\n\nAdoptantes tempranos: IP/CFT con programa de retención activo.", "#dcefe6"),
        (0, 0, 5, 2, "7", "ESTRUCTURA DE COSTOS", "Validación (6 meses): CLP 32,0 MM — equipo 53 %%, legal 11 %%, contenido 9 %%, evaluación 9 %%.\nOperación 2028: fijos CLP %.0f MM (personal %.0f MM) + variable CLP 3.000/estudiante (IA, nube, soporte).\nPunto de equilibrio: ~%s estudiantes." % (proj[2028]["fijos"], proj[2028]["personal"], f"{be_2028:,.0f}".replace(",", ".")), "#f3f5f4"),
        (5, 0, 5, 2, "6", "FUENTES DE INGRESOS", "Licencia anual: CLP 24.000 por estudiante de 1.er año (B2B).\nImplementación y capacitación: CLP 2,5 MM por institución.\nPiloto pagado: CLP 6 MM por semestre (convertible a licencia).\nNo dilutivo: CORFO Semilla Inicia (CLP 15 MM).\nProyección: CLP %.0f MM (2028) y %.0f MM (2029)." % (proj[2028]["ing"], proj[2029]["ing"]), "#f3f5f4"),
    ]
    for x, y, w, h, n, t, txt, col in boxes:
        ax.add_patch(FancyBboxPatch((x + .03, y + .03), w - .06, h - .06, boxstyle="round,pad=0,rounding_size=.06", fc=col, ec=INK, lw=1.1))
        ax.text(x + .12, y + h - .14, f"{n}  {t}", fontsize=9.2, weight="bold", color=INK, va="top")
        import textwrap
        width = int(w * 15.5)
        wrapped = "\n".join("\n".join(textwrap.wrap(p, width)) if p else "" for p in txt.split("\n"))
        ax.text(x + .12, y + h - (.62 if "\n" in t else .45), wrapped, fontsize=7.6, color=INK, va="top", linespacing=1.3)
    ax.text(0, 6.12, "Lean Canvas — NivelaTec", fontsize=13, weight="bold", color=INK)
    ax.text(10, 6.12, "Números = orden recomendado de llenado (Maurya, 2012)", fontsize=8, color=GREY, ha="right")
    fig.savefig(path, bbox_inches="tight"); plt.close(fig)

lean_canvas(OUT + "fig_lean_canvas.png")

# ------------------ Figura: matriz funcionalidades vs valor ------------------
feat = [  # nombre, valor para hipótesis (1-5), esfuerzo (1-5), en MVP
    ("Diagnóstico adaptativo", 5, 2.5, True), ("Ruta personalizada", 4.6, 2.2, True), ("Retroalimentación por error", 4.2, 2.0, True),
    ("Panel docente con alertas", 4.8, 2.8, True), ("Registro de eventos", 4.0, 1.4, True), ("Retroalimentación con IA generativa", 3.6, 4.0, False),
    ("Integración LTI completa", 3.2, 4.4, False), ("App móvil nativa", 2.0, 4.6, False), ("Gamificación", 1.7, 3.0, False),
    ("Chat tutor 24/7", 2.6, 4.2, False), ("Reportes institucionales", 3.0, 3.0, False)]
fig, ax = plt.subplots(figsize=(7.2, 4.6), dpi=200)
ax.axhline(3, color=GREY, lw=.8, ls="--"); ax.axvline(3, color=GREY, lw=.8, ls="--")
for n, v, e, m in feat:
    ax.scatter(e, v, s=70, color=ACC if m else GREY, edgecolor=INK, zorder=3)
    ax.annotate(n, (e, v), xytext=(6, 4), textcoords="offset points", fontsize=7.5, color=INK)
ax.set_xlim(1, 5.6); ax.set_ylim(1.2, 5.4)
ax.set_xlabel("Esfuerzo de construcción (1 bajo – 5 alto)"); ax.set_ylabel("Valor para probar la hipótesis crítica (1–5)")
ax.text(1.1, 5.25, "Incluir en el MVP", color=ACC, fontsize=8.5, weight="bold"); ax.text(4.0, 5.25, "Versión 2", color=MID, fontsize=8.5, weight="bold")
ax.text(1.1, 1.35, "Descartar por ahora", color=GREY, fontsize=8.5, weight="bold"); ax.text(4.0, 1.35, "Evitar", color=RISK, fontsize=8.5, weight="bold")
ax.scatter([], [], color=ACC, label="En el MVP v0.3"); ax.scatter([], [], color=GREY, label="Fuera del MVP")
ax.legend(loc="lower left", bbox_to_anchor=(0.01, 0.12), fontsize=7.5, frameon=False)
for s in ["top", "right"]: ax.spines[s].set_visible(False)
fig.savefig(OUT + "fig_matriz_mvp.png", bbox_inches="tight"); plt.close(fig)

# ------------------ Figura: embudo simulado ------------------
pi = R["piloto"]
stages = [("Asignados (grupo tratamiento)", pi["nT"]), ("Invitación entregada", pi["entregada"]), ("Inician diagnóstico", pi["inicia"]),
          ("Completan diagnóstico", pi["completa"]), ("Activan (≥1 módulo en 14 días)", pi["activa"]), ("Sostienen (≥3 módulos a sem. 6)", pi["sostiene"])]
fig, ax = plt.subplots(figsize=(7.2, 3.4), dpi=200)
names = [s[0] for s in stages][::-1]; vals = [s[1] for s in stages][::-1]
cols = [ACC if "Activan" in n else "#9cc7b4" for n in names]
ax.barh(names, vals, color=cols, edgecolor=INK, lw=.6)
for i, v in enumerate(vals):
    ax.text(v + 6, i, f"{v}  ({v / pi['nT'] * 100:.1f} %)".replace(".", ","), va="center", fontsize=8)
ax.set_xlim(0, 620); ax.set_xlabel("Estudiantes (datos simulados, semilla 2026)")
for s in ["top", "right"]: ax.spines[s].set_visible(False)
fig.savefig(OUT + "fig_embudo.png", bbox_inches="tight"); plt.close(fig)

# ------------------ Figura: ingresos y costos ------------------
fig, ax = plt.subplots(figsize=(7.2, 3.3), dpi=200)
labs = ["2027 (validación)", "2028", "2029"]
ing = [12.0, proj[2028]["ing"], proj[2029]["ing"]]
cost = [total_val, proj[2028]["costos"], proj[2029]["costos"]]
import numpy as np
x = np.arange(3)
ax.bar(x - .18, ing, .36, color=ACC, label="Ingresos operacionales")
ax.bar(x + .18, cost, .36, color=MID, label="Costos totales")
for i in range(3):
    ax.text(x[i] - .18, ing[i] + 8, f"{ing[i]:.0f}", ha="center", fontsize=8)
    ax.text(x[i] + .18, cost[i] + 8, f"{cost[i]:.0f}", ha="center", fontsize=8)
ax.set_xticks(x, labs); ax.set_ylabel("CLP millones"); ax.legend(frameon=False, fontsize=8)
for s in ["top", "right"]: ax.spines[s].set_visible(False)
fig.savefig(OUT + "fig_finanzas.png", bbox_inches="tight"); plt.close(fig)
