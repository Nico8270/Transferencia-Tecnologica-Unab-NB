"""
NivelaTec - Simulación del piloto y de la prueba de tareas del MVP (CINF113, Entregable 3).
TODOS LOS DATOS SON SIMULADOS. Los parámetros son supuestos declarados (ver PARAMS),
calibrados con fuentes secundarias citadas en el informe. No son observaciones de usuarios reales.
Semilla fija para reproducibilidad.
"""
import json
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "figuras"
import numpy as np

SEED = 2026
rng = np.random.default_rng(SEED)

PARAMS = {
    # Prueba de tareas (exploratoria)
    "n_est_prueba": 10, "n_doc_prueba": 5,
    "p_diag_sin_ayuda": 0.80,      # completa diagnóstico sin ayuda
    "tiempo_diag_media_min": 11.0, "tiempo_diag_sd_min": 3.0,
    "p_modulo": 0.75,              # completa un módulo de la ruta
    "p_doc_identifica": 0.85,      # docente identifica a los estudiantes en riesgo alto
    "tiempo_doc_media_min": 1.6, "tiempo_doc_sd_min": 0.6,
    # Piloto (2 instituciones, asignación por secciones)
    "secciones": 40, "est_por_seccion": 25,
    "p_invitacion_entregada": 0.95,
    "p_inicia_diag": 0.78,
    "p_completa_diag": 0.90,
    "p_activa": 0.70,              # completa >= 1 módulo en 14 días | completó diag
    "p_sostiene": 0.65,            # completa >= 3 módulos a la semana 6 | activó
    "reprob_control": 0.32,        # E2: reprobación ramo crítico ~32 %
    "efecto_sostenido_pp": 0.15,   # reducción de reprobación en usuarios sostenidos
    "efecto_activado_pp": 0.06,    # reducción en activados no sostenidos
    "icc": 0.05,                   # correlación intraclase por sección
    "docentes_trat": 10, "p_docente_adopta": 0.80,
    "p_satisf_4_5": 0.78, "p_responde_encuesta": 0.45,
    "costo_piloto_clp": 15_000_000,
    "min_docente_base": 45.0, "min_docente_mvp": 6.0,  # minutos/semana para identificar riesgo por sección
    "mc_reps": 5000,
}
P = PARAMS


def prueba_tareas(rng):
    n = P["n_est_prueba"]
    diag_ok = rng.random(n) < P["p_diag_sin_ayuda"]
    t = np.clip(rng.normal(P["tiempo_diag_media_min"], P["tiempo_diag_sd_min"], n), 5, 25)
    diag_ok_15 = diag_ok & (t <= 15)
    mod_ok = diag_ok & (rng.random(n) < P["p_modulo"] / P["p_diag_sin_ayuda"])
    nd = P["n_doc_prueba"]
    doc_ok = rng.random(nd) < P["p_doc_identifica"]
    td = np.clip(rng.normal(P["tiempo_doc_media_min"], P["tiempo_doc_sd_min"], nd), 0.5, 5)
    doc_ok_2 = doc_ok & (td <= 2)
    return {
        "T1_diag_sin_ayuda_15min": int(diag_ok_15.sum()), "T1_n": n,
        "tiempo_diag_mediana": float(np.median(t)),
        "T2_modulo_completado": int(mod_ok.sum()), "T2_n": n,
        "T3_docente_identifica_2min": int(doc_ok_2.sum()), "T3_n": nd,
        "tiempo_doc_mediana": float(np.median(td)),
    }


def piloto(rng):
    S, m = P["secciones"], P["est_por_seccion"]
    trat_sec = np.zeros(S, bool)
    trat_sec[rng.permutation(S)[: S // 2]] = True
    sec = np.repeat(np.arange(S), m)
    trat = trat_sec[sec]
    N = S * m
    # efecto aleatorio de sección (logit) para inducir ICC aproximado
    sd_u = np.sqrt(P["icc"] / (1 - P["icc"]) * (np.pi ** 2 / 3))
    u = rng.normal(0, sd_u, S)[sec]
    base = P["reprob_control"]
    logit = np.log(base / (1 - base)) + u
    entregada = trat & (rng.random(N) < P["p_invitacion_entregada"])
    inicia = entregada & (rng.random(N) < P["p_inicia_diag"])
    completa = inicia & (rng.random(N) < P["p_completa_diag"])
    activa = completa & (rng.random(N) < P["p_activa"])
    sostiene = activa & (rng.random(N) < P["p_sostiene"])
    p0 = 1 / (1 + np.exp(-logit))
    p = p0 - np.where(sostiene, P["efecto_sostenido_pp"], np.where(activa, P["efecto_activado_pp"], 0.0))
    reprueba = rng.random(N) < np.clip(p, 0.01, 0.99)
    nT, nC = trat.sum(), (~trat).sum()
    rT, rC = reprueba[trat].mean(), reprueba[~trat].mean()
    # IC de la diferencia con corrección por efecto de diseño
    de = 1 + (m - 1) * P["icc"]
    se = np.sqrt(rT * (1 - rT) / nT + rC * (1 - rC) / nC) * np.sqrt(de)
    diff = rC - rT
    # docentes y satisfacción
    doc_adopta = int((rng.random(P["docentes_trat"]) < P["p_docente_adopta"]).sum())
    n_act = int(activa.sum())
    resp = rng.random(n_act) < P["p_responde_encuesta"]
    satis = rng.random(resp.sum()) < P["p_satisf_4_5"]
    return {
        "N": int(N), "nT": int(nT), "nC": int(nC),
        "entregada": int(entregada.sum()), "inicia": int(inicia.sum()), "completa": int(completa.sum()),
        "activa": n_act, "sostiene": int(sostiene.sum()),
        "reprob_T": float(rT), "reprob_C": float(rC), "diff_pp": float(diff * 100),
        "ic95_pp": [float((diff - 1.96 * se) * 100), float((diff + 1.96 * se) * 100)],
        "significativo": bool(diff - 1.96 * se > 0), "design_effect": float(de),
        "doc_adopta": doc_adopta, "doc_n": P["docentes_trat"],
        "encuesta_resp": int(resp.sum()), "satisf_4_5": int(satis.sum()),
    }


def monte_carlo(reps):
    r = np.random.default_rng(SEED + 1)
    diffs, sig, adop = [], [], []
    for _ in range(reps):
        x = piloto(r)
        diffs.append(x["diff_pp"]); sig.append(x["significativo"]); adop.append(x["activa"] / x["nT"])
    diffs = np.array(diffs)
    return {"diff_p5": float(np.percentile(diffs, 5)), "diff_p50": float(np.percentile(diffs, 50)),
            "diff_p95": float(np.percentile(diffs, 95)), "potencia": float(np.mean(sig)),
            "adop_p5": float(np.percentile(adop, 5)), "adop_p95": float(np.percentile(adop, 95))}


def potencia_por_tamano(r, sizes=(40, 60, 80, 100), reps=1500):
    out = {}
    global P
    orig = P["secciones"]
    for s in sizes:
        P["secciones"] = s
        out[s] = float(np.mean([piloto(r)["significativo"] for _ in range(reps)]))
    P["secciones"] = orig
    return out


if __name__ == "__main__":
    pt = prueba_tareas(rng)
    pi = piloto(rng)
    mc = monte_carlo(P["mc_reps"])
    pw = potencia_por_tamano(np.random.default_rng(SEED + 2))
    pi["costo_por_activado"] = P["costo_piloto_clp"] / pi["activa"]
    pi["horas_docente_liberadas_sem"] = (P["min_docente_base"] - P["min_docente_mvp"]) * (P["secciones"] // 2) / 60
    res = {"params": P, "prueba_tareas": pt, "piloto": pi, "monte_carlo": mc, "potencia_secciones": pw}
    json.dump(res, open(OUT / "resultados_simulacion.json", "w"), indent=2, ensure_ascii=False)
    print(json.dumps({k: v for k, v in res.items() if k != "params"}, indent=2, ensure_ascii=False))
