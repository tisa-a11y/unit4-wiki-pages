# Unidad 4 — Cómo trabajan los agentes en este proyecto (Índice de trabajo de agentes R2)

Traducción de la versión en inglés (vive solo en la wiki) del 2026-11-05 (rutas actualizadas). Si algo no coincide, vale la versión en inglés. **La versión en inglés es la copia oficial.** Lugar: la carpeta compartida del proyecto
`~/Tisa AI/Agent Shared - Mini Hosted/1231 11th Avenue Unit 4/work-control/` (SMB `/Volumes/tisavo/Tisa AI/Agent Shared - Mini Hosted/1231 11th Avenue Unit 4/work-control/`; sincronizada con la carpeta de Google Drive `1231 11th Avenue Unit 4`, `https://drive.google.com/drive/folders/1NnUfcuJfnzcjJz3XRvDQDhfvtMkrlSOr).
Agentes nuevos: empiecen en `START-HERE.md` (`AGENTS.md`, `CLAUDE.md`) en la raíz del proyecto (`~/Tisa AI/Agent Shared - Mini Hosted/1231 11th Avenue Unit 4/START-HERE.md`).
Nada de aquí pasa por encima de lo que Tisa ya decidió ni de las Instrucciones del proyecto.

**Wiki (vista fácil de leer de estas páginas):** https://tisa-a11y.github.io/unit4-wiki-pages/ — lee ROADMAP.md, cada SPEC.md y este índice desde las copias sincronizadas en Drive. Sigan editando los archivos .md; la wiki los sigue. Si un SPEC.md se reemplaza con un archivo nuevo en Drive, avísenle a Claude para actualizar la wiki.

## Dónde está cada cosa
**Todo agente: lea primero `START-HERE.md`.** Es la base de todo (propósito, capacidades, formas de interactuar, a dónde va cada cosa, reglas).

**Especificaciones y plan general (empiecen aquí para el trabajo en sí):** `continuity/ROADMAP.md`, luego el `SPEC.md` de cada proyecto — `kitchen/`, `bathroom/`, `electrical/`, `laundry/`, `hvac/`, `bedroom/`, `living-dining/`, `hallway/`, `paint-floors/`.

| Qué | Dónde |
|---|---|
| Cómo trabajan los agentes en la Unidad 4 (este índice, manual de Todoist, papeles de cada sesión, listas de tareas de John) | `work-control/` |
| Continuidad: entrega de turno, decisiones, huecos conocidos, índice de fuentes, estado de Beads | `continuity/` |
| Paquetes de trabajo por oficio/cuarto | `bathroom/`, `kitchen/`, `electrical/`, `hvac/`, `interior-design/`, `sprint/`, `finance/` |
| Copias publicadas para el equipo/dueña | Esta sola carpeta `1231 11th Avenue Unit 4` (`https://drive.google.com/drive/folders/1NnUfcuJfnzcjJz3XRvDQDhfvtMkrlSOr), compartida con John (la carpeta vieja `1231 11th Ave - Unit 4 Remodel` es solo historial) |
| Todoist | `Full 1231 11th Avenue Remodel` |

## Todoist
- No hay un solo responsable. Cualquier agente puede escribir en el tablero, siguiendo las Instrucciones del proyecto. Claude puede encargarse de clasificar — no está decidido.
- El trabajo de Antigravity en Todoist no está verificado (Tisa 11/3: "isn't great so far").
- `TODOIST-PROJECT-MANAGER-RUNBOOK.md` (Antigravity, 11/2) es una foto de esa fecha, no el estado actual. Errores conocidos:
  - Tapa del subpanel `BRCOV20L` — mal; E20-R1: tapa incluida, la que corresponde es `BRPX2A20L1F`.
  - Grosor de la puerta corrediza "1-3/8 vs 1-3/4 pulg" — mal; CURRENT-DECISIONS (11/1): John 1-3/8 pulg, reemplaza las 1-1/2 pulg de Ervin.
  - El enlace de fuente de J-05 apunta al Índice de cuartos y proyectos, no a PD-01 R4.
  - Usa su propia foto del tablero como referencia — al revés de la regla de arriba.
- Pendiente: dos tarjetas asignadas a John el 11/2; estado de `td auth login` — las dos cosas sin saber.

## Huecos de estructura conocidos (11/3)
- No existe un plan general de la unidad.
- No hay una página de especificación actual por proyecto; solo `kitchen/CURRENT.md`.
- No hay documentos de Lavandería (solo dentro de eléctrico), Pasillo, Recámara, Sala y comedor, Pintura y pisos; Calefacción solo tiene una recopilación de datos.
- Las decisiones están en un solo registro con fechas (`continuity/CURRENT-DECISIONS.md`), no por proyecto.
- Decenas de archivos START-HERE / ONBOARDING-CHECKLIST duplicados en Drive de corridas anteriores de agentes.
Arreglo: ROADMAP.md + un SPEC.md por proyecto escritos el 2026-11-03 (en inglés; español después de la revisión de Tisa). Ediciones en español agregadas el 2026-11-06.

## Registro de cambios
- R2 2026-11-03: reescrito como punto de entrada para agentes; R1 → `work-control/_superseded/`. Una carpeta duplicada `13 Agent Work` en Drive se retiró al `_superseded` de esa carpeta.

## Datos de la wiki — lo que hacen los agentes después de cada sesión de Tisa + John (agregado 2026-11-03)
La wiki (https://tisa-a11y.github.io/unit4-wiki-pages/) guarda listas compartidas, que se leen y escriben con la herramienta ArtifactData:
- `decisions` — un documento por cada decisión abierta (d01…). Tisa decide una escribiendo `status: "locked"`, `outcome`, `decidedAt`, `synced: false`. **Trabajo del agente:** por cada decisión tomada con `synced: false`, copiar el resultado al `SPEC.md` del proyecto (marcar ✅, quitarla de "Decisiones que necesita"), actualizar las tarjetas de Todoist que correspondan, actualizar la edición en español, y luego poner `synced: true`. Nunca tomar ni cambiar una decisión por cuenta propia.
- `decisionNotes` — notas que John o Tisa agregan a una decisión (`decision`, `text`, `author`, `createdAt`). Léanlas; son información, no decisiones.
- `reports` — reportes de obra (`project`, `item`, `kind`, `text`, `photo` y opcionalmente `audio` (nota de voz, se puede oír en la wiki), `status: "new"`). **Trabajo del agente:** pasar el dato a la especificación (con la fecha del reporte), y luego poner `status: "recorded"`. Un reporte es un dato de obra, no una decisión.
- `sessionNotes` — notas que John o Tisa mandan después de una sesión (`date`, `topic`, `agreed`, `open`, `next`, opcional `photo`, `status: "new"`). **Trabajo del agente:** convertir lo "acordado" en cambios a la especificación solo donde Tisa ya tomó la decisión que corresponde (si no, agregarlo como nota en esa decisión), convertir lo "siguiente" en tarjetas de Todoist propuestas (sin asignar, a menos que Tisa haya nombrado a la persona), agregar lo "abierto" como decisiones nuevas, y luego poner `status: "recorded"`.
  Las notas que salen de llamadas (`source: "call"`) también traen `summary`, `proposedLocks` (decisión, resultado, cita), `updates` (proyecto, cambio) y la `transcript`. Aplicar un `update` a un SPEC.md solo cuando Tisa ya tomó la decisión que corresponde, o cuando es un dato de obra simple (una medida, una entrega); si no, dejarlo como propuesta. Las decisiones propuestas ya están puestas como notas en cada decisión para que Tisa las tome — nunca tomarlas por cuenta propia.
- `inbox` — **la fila de despacho.** Notas habladas o escritas de John/Tisa, ya ordenadas por Claude en partes (`type` tarea | dato | decisión | sin ordenar, `project`, `section` sugerida, `title`, `details`, `raw` nota original, `status: "queued"`). Las personas nunca escriben directo en Todoist; **un agente acomoda cada parte**:
  - **tarea** → crear la tarjeta de Todoist en `Full 1231 11th Avenue Remodel`, en la sección del proyecto (Kitchen Remodel / Bathroom Remodel / Electrical / General/Misc Tasks; HVAC → On hold; `unsure` → Needs triage). Título en inglés sencillo; la descripción usa la plantilla del manual (State 1 a menos que Tisa haya confirmado más, Rol/Oficio como texto, Siguiente acción física, Fuente = enlace al SPEC.md del proyecto). **Sin asignar** — nunca asignar a nadie más que a Tisa, y solo si ella se nombró. Revisar primero si ya hay una tarjeta; agregar un comentario en vez de duplicar.
  - **dato** → agregarlo al SPEC.md del proyecto con la fecha y "(John, obra)"; si cambia una tarjeta, comentar en esa tarjeta.
  - **decisión** → agregar un documento en `decisions` (siguiente id, `status: open`, prioridad 1/2/3).
  - Luego actualizar el documento del inbox: `status: "filed"` (o `"held"` con un `agentNote` que diga qué falta), `agentNote` (una línea: qué se hizo), `todoistUrl` cuando se creó una tarjeta.
  Mientras un agente no tenga acceso a Todoist (conector de Todoist en claude.ai o sesión iniciada en Todoist), acomodar los datos y las decisiones y dejar las tareas en `queued`.
Las decisiones abiertas nuevas que aparezcan en las especificaciones se agregan como documentos nuevos en `decisions` (siguiente id, `status: "open"`, `priority` 1 = detiene el trabajo, 2 = lo que sigue, 3 = después).
