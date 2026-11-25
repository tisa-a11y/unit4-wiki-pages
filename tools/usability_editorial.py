"""Deterministic editorial heuristics for the rendered Unit 4 crew UI.

These findings require human editorial judgment; they never rewrite construction
facts, infer approval, or discard holds. Every finding fails Gate 13 and appears
in the report's Cut / Rewrite Queue with its exact page and DOM selector.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List

WORD_RE = re.compile(r"[^\W_]+(?:[-’'][^\W_]+)*", re.UNICODE)
FILLER_RE = re.compile(
    r"\b(?:this section covers|please note that|various updates|see above|"
    r"hello[,!]?\s+(?:there|team)|how can I (?:help|assist)|"
    r"esta sección (?:cubre|abarca)|tenga en cuenta que|diversas actualizaciones|"
    r"ver arriba|véase arriba|cómo puedo ayudarte)\b", re.I)
RAW_RE = re.compile(
    r"\b(?:rev[-_]\d{3,}|todoist(?:\s+(?:task|tarea|id))?\s*[:#=]?\s*[A-Za-z0-9]{8,})\b|"
    r'\b[XYZ]\s*[:=]\s*\d+(?:[./-]\d+)?\s*[″"]?\s*(?:->|→|–|—)\s*\d+', re.I)
# A bounded bilingual vocabulary, deliberately including completion verbs. A
# completed milestone is valid copy; an open item still needs an action.
VERB_RE = re.compile(
    r"\b(?:verify|check|measure|hold|keep|install|build|hang|confirm|mark|test|inspect|"
    r"frame|weatherproof|lay out|wire|add|flag|place|receive|fabricate|published|chosen|laid|set|drafted|run|connect|route|select|choose|leave|clear|patch|paint|prime|seal|finish|close|"
    r"coordinate|reschedule|complete|execute|reconcile|review|record|photograph|"
    r"take|protect|remove|retain|use|avoid|do not|stop|cut|anchor|secure|prepare|"
    r"approved|locked|installed|settled|completed|updated|raised|mounted|"
    r"verificar|verifica|revisar|revisa|medir|mide|mantener|mantén|instalar|instala|"
    r"armar|arma|colgar|confirmar|confirma|marcar|probar|inspeccionar|tender|"
    r"conectar|trazar|elegir|seleccionar|dejar|despejar|resanar|pintar|sellar|"
    r"cerrar|coordinar|reprogramar|completar|ejecutar|conciliar|registrar|"
    r"fotografiar|proteger|retirar|usar|evitar|pausar|cortar|anclar|asegurar|"
    r"construir|enmarcar|reemplazar|terminar|reparar|hacer|recibir|fabricar|publicados|listos|elegido|elegida|colocado|retirado|preparar|cotizar|aprobado|aprobada|definido|definida|definidos|definidas|"
    r"instalado|instalada|actualizado|actualizada|asegurada|subida)\b", re.I)
CONTEXT_RE = re.compile(
    r'\d|[″"′]|\b(?:wall|door|floor|ceiling|cabinet|hood|range|hatch|duct|panel|'
    r'wire|cable|outlet|switch|room|kitchen|bathroom|attic|hall|closet|stud|'
    r'blocking|tile|sink|toilet|washer|dryer|window|counter|subfloor|chimney|'
    r'moulding|molding|trim|hutch|fireplace|frame|drywall|roof|photo|clearance|inspection|approval|sign-off|release|before|until|'
    r'muro|pared|puerta|piso|plafón|techo|gabinete|campana|estufa|escotilla|ducto|'
    r'contacto|apagador|cocina|baño|ático|pasillo|clóset|poste|refuerzo|azulejo|'
    r'tarja|lavavajillas|refrigerador|moldura|marco|trinchador|boquilla|comedor|fregadero|inodoro|ventana|cubierta|subpiso|chimenea|tablaroca|foto|'
    r'inspección|aprobación|antes|hasta)(?:s|es)?\b', re.I)

# Exclude hidden technical/print layers and UI chrome before extracting prose.
# A stable CSS path is retained; generated report content is always HTML escaped.
JS_EDITORIAL_BLOCKS = r"""
() => {
  const root = document.querySelector('#doc') || document.body;
  function visible(el) {
    if (el.closest('#agent-brief, #blueprint-sheet-shell, #u4PrintRoot, nav, header, .u4h-topbar, .u4h-pager, .u4h-steps, [hidden]')) return false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
      if (n.tagName === 'DETAILS' && n !== el && !n.open && !el.closest('summary')) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function selector(el) {
    const parts = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.id) { parts.unshift('#' + CSS.escape(n.id)); break; }
      const siblings = n.parentElement ? [...n.parentElement.children].filter(x => x.tagName === n.tagName) : [n];
      parts.unshift(n.tagName.toLowerCase() + ':nth-of-type(' + (siblings.indexOf(n) + 1) + ')');
    }
    return parts.join(' > ');
  }
  const elements = [...root.querySelectorAll('h1, h2, h3, p, li, .u4-room-summary, .u4h-subtitle, .u4h-card-sub, .u4-guide-card-desc, .u4-subpage-row-desc, .u4-gal-caption, figcaption, .u4h-card-desc, .u4h-card-subtitle, .u4-doc-preview-desc, .u4h-title, .u4h-sub, .u4h-note, .u4h-callout, .u4h-hold-strip, .u4h-kpi-sub, .u4h-section-title, .u4h-status, label.u4b-check')];
  function blockText(el) {
    if (['P', 'LI'].includes(el.tagName)) return el.innerText.trim();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const words = [];
    while (walker.nextNode()) {
      const text = walker.currentNode;
      let parent = text.parentElement;
      let ownedByChild = false;
      while (parent && parent !== el) {
        if (elements.includes(parent) || !visible(parent)) { ownedByChild = true; break; }
        parent = parent.parentElement;
      }
      if (!ownedByChild) words.push(text.textContent);
    }
    return words.join(' ').replace(/\s+/g, ' ').trim();
  }
  const blocks = elements.filter(visible).filter(el => !elements.some(other => other !== el && other.contains(el) && visible(other) && ['LI','P'].includes(other.tagName))).map(el => ({
    selector: selector(el), text: blockText(el), kind: el.matches('.u4h-title, .u4h-section-title') ? 'h2' : (el.tagName === 'DIV' || el.tagName === 'SPAN' ? 'p' : el.tagName.toLowerCase()),
    checklist: (el.tagName === 'LI' && !!el.closest('#sec-checklist')) || el.matches('label.u4b-check'),
    overview: el.matches('#sec-concept, .u4-room-summary'),
    y: el.getBoundingClientRect().top + scrollY
  })).filter(b => b.text);
  const at = sel => { const el = document.querySelector(sel); return el && visible(el) ? el.getBoundingClientRect().top + scrollY : null; };
  return {blocks, rhythm: {
    overview: at('#sec-concept, .u4-room-summary'),
    hero: at('.u4-lead-pic img, #sec-renders img, #sec-visuals img, #doc img, #doc svg'),
    checklist: at('#sec-checklist'), documents: at('#sec-docs'),
    field_note: at('#sec-field-note, #sec-report, #field'),
    details: at('#sec-details'),
    details_open: !!document.querySelector('#sec-details[open]'),
    checklist_count: root.querySelectorAll('#sec-checklist li').length
  }};
}
"""


def tokens(text: str) -> set:
    return {word.casefold() for word in WORD_RE.findall(text)}


def audit_blocks(snapshot: Dict[str, Any], page: str, lang: str,
                 room: bool = False) -> List[Dict[str, str]]:
    findings: List[Dict[str, str]] = []

    def flag(block: Dict[str, Any], reason: str) -> None:
        findings.append(dict(page=page, lang=lang, selector=block['selector'],
                             text=block['text'], reason=reason))

    blocks = snapshot.get('blocks', [])
    for i, block in enumerate(blocks):
        text = block['text']
        words = WORD_RE.findall(text)
        if FILLER_RE.search(text):
            flag(block, 'Cut filler or meta prose; state the action directly.')
        if RAW_RE.search(text):
            flag(block, 'Move raw coordinates or internal IDs to technical details.')
        limit = 35 if block.get('checklist') else 55
        if (block.get('checklist') or block['kind'] == 'p') and len(words) > limit:
            flag(block, 'Split or shorten block: {} words (limit {}).'.format(len(words), limit))
        if block.get('overview'):
            sentences = [s for s in re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])', text) if s.strip()]
            if len(sentences) > 2:
                flag(block, 'Overview exceeds two sentences.')
        if block.get('checklist') and (not VERB_RE.search(text) or not CONTEXT_RE.search(text)):
            flag(block, 'Checklist needs a concrete verb plus a fixture/location or measurable check/hold.')
    # Compare sentences as well as whole bullets: a repeated sentence inside
    # an otherwise different paragraph must not escape the 80% overlap rule.
    seen = []
    for block in blocks:
        text = block['text']
        parts = [text] + [part.strip() for part in re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])', text) if part.strip() != text]
        current = []
        for part in parts:
            a = tokens(part)
            if not a:
                continue
            for previous, previous_part, b in seen + [entry for entry in current if entry[1] != text]:
                score = len(a & b) / len(a | b)
                if score >= .8:
                    # Repeated section headings can be navigation, but a
                    # title echoed in a subtitle adds no useful information.
                    if block['kind'].startswith('h') and previous['kind'].startswith('h'):
                        continue
                    flag(block, 'Duplicate/near-duplicate ({:.0%}) of {}: {}.'.format(score, previous['selector'], previous_part))
                    break
            current.append((block, part, a))
        seen.extend(current)
    if room:
        rhythm = snapshot.get('rhythm', {})
        marker = dict(selector='#doc', text='Room section order')
        if not 4 <= rhythm.get('checklist_count', 0) <= 7:
            flag(marker, 'Room needs 4–7 milestone checklist items.')
        for key in ('overview', 'hero', 'checklist', 'documents', 'field_note', 'details'):
            if rhythm.get(key) is None:
                flag(marker, 'Missing visible room section: {}.'.format(key))
        sequence = [rhythm.get(key) for key in ('overview', 'hero', 'checklist', 'documents', 'field_note', 'details')]
        present = [v for v in sequence if v is not None]
        if present != sorted(present):
            flag(marker, 'Use overview → hero → checklist → documents → field note → collapsed details.')
        if rhythm.get('details_open'):
            flag(marker, 'Technical details must start collapsed.')
    return findings


def render_queue(findings: List[Dict[str, str]]) -> str:
    import html
    rows = []
    for item in findings:
        cells = [item['page'], item['lang'], item['selector'], item['reason'], item['text']]
        rows.append('<tr>' + ''.join('<td>' + html.escape(s) + '</td>' for s in cells) + '</tr>')
    return ('<h2>Cut / Rewrite Queue</h2><p>Editorial heuristics flag review work; '
            'retain construction facts, dimensions, and active holds when rewriting.</p>'
            '<table><thead><tr><th>Page</th><th>Language</th><th>Selector</th>'
            '<th>Reason</th><th>Block</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table>')
