"""Deterministic editorial heuristics for the rendered Unit 4 crew UI.

These findings require human editorial judgment; they never rewrite construction
facts, infer approval, or discard holds. Every finding fails Gate 13 and appears
in the report's Cut / Rewrite Queue with its exact page and DOM selector.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List

WORD_RE = re.compile(r"[^\W_]+(?:[-’'][^\W_]+)*", re.UNICODE)
MEASUREMENT_RE = re.compile(
    r"(?<![\w.])(\d+(?:\.\d+)?(?:[- ]\d+/\d+|/\d+)?)\s*"
    r"(?:[\"″′']|(?:inches|inch|in|feet|foot|ft|mm|cm|m|pulgadas|pulgada|pulg|pies)\b)", re.I)
FILLER_RE = re.compile(
    r"\b(?:this section covers|please note that|various updates|see above|"
    r"hello[,!]?\s+(?:there|team)|how can I (?:help|assist)|"
    r"esta sección (?:cubre|abarca)|tenga en cuenta que|diversas actualizaciones|"
    r"ver arriba|véase arriba|cómo puedo ayudarte)\b", re.I)
RAW_RE = re.compile(
    r"\bmagicplan(?:\s+plan)?\s+[a-f0-9]{7,}\b|\b[a-z]{2,}_[a-z0-9_]{3,}\b|\b6[A-Za-z0-9]{15}\b|\b(?:rev[-_]\d{3,}|todoist(?:\s+(?:task|tarea|id))?\s*[:#=]?\s*[A-Za-z0-9]{8,})\b|"
    r'\b[XYZ]\s*[:=]\s*-?\d+(?:[./-]\d+)?\s*[″"]?\s*,\s*[XYZ]\s*[:=]\s*-?\d+|'
    r'\b[XYZ]\s*[:=]\s*\d+(?:[./-]\d+)?\s*[″"]?\s*(?:->|→|–|—)\s*\d+', re.I)
# A bounded bilingual vocabulary, deliberately including completion verbs. A
# completed milestone is valid copy; an open item still needs an action.
VERB_RE = re.compile(
    r"\b(?:verify|check|measure|hold|keep|install|build|hang|confirm|mark|test|inspect|"
    r"replace|waterproof|tile|grout|caulk|shim|level|plumb|drill|fasten|pull|insulate|firestop|deliver|order|move|frame|weatherproof|lay out|wire|add|flag|place|receive|fabricate|published|chosen|laid|set|drafted|run|connect|route|select|choose|leave|clear|patch|paint|prime|seal|finish|close|"
    r"coordinate|reschedule|complete|execute|reconcile|review|record|photograph|"
    r"take|protect|remove|retain|use|avoid|do not|stop|cut|anchor|secure|prepare|"
    r"approved|locked|installed|settled|completed|updated|raised|mounted|"
    r"verificar|verifica|revisar|revisa|medir|mide|mantener|mantén|instalar|instala|"
    r"armar|arma|colgar|confirmar|confirma|marcar|probar|inspeccionar|tender|"
    r"conectar|trazar|elegir|seleccionar|dejar|despejar|resanar|pintar|sellar|"
    r"cerrar|coordinar|reprogramar|completar|ejecutar|conciliar|registrar|"
    r"tomar|fotografiar|proteger|retirar|usar|evitar|pausar|cortar|anclar|asegurar|"
    r"construir|enmarcar|reemplazar|terminar|reparar|hacer|recibir|fabricar|publicados|listos|elegido|elegida|colocado|retirado|preparar|cotizar|aprobado|aprobada|definido|definida|definidos|definidas|"
    r"instalado|instalada|actualizado|actualizada|asegurada|subida)\b", re.I)
CONTEXT_RE = re.compile(
    r'\d|[″"′]|\b(?:wall|door|floor|ceiling|cabinet|hood|range|hatch|duct|panel|'
    r'wire|cable|outlet|switch|room|kitchen|bathroom|attic|hall|closet|stud|'
    r'blocking|niche|tile|sink|toilet|washer|dryer|window|counter|subfloor|chimney|'
    r'moulding|molding|trim|hutch|fireplace|frame|drywall|roof|photo|clearance|inspection|approval|sign-off|release|'
    r'muro|pared|puerta|piso|plafón|techo|gabinete|campana|estufa|escotilla|ducto|'
    r'contacto|apagador|cocina|baño|ático|pasillo|clóset|poste|refuerzo|azulejo|'
    r'nicho|tarja|lavavajillas|refrigerador|moldura|marco|trinchador|boquilla|comedor|fregadero|inodoro|ventana|cubierta|subpiso|chimenea|tablaroca|foto|'
    r'inspección|aprobación)(?:s|es)?\b', re.I)

# Exclude hidden technical/print layers and UI chrome before extracting prose.
# A stable CSS path is retained; generated report content is always HTML escaped.
JS_EDITORIAL_BLOCKS = r"""
() => {
  const root = (document.querySelector('#doc') && document.querySelector('#doc').closest('main')) || document.querySelector('#doc') || document.body;
  function visible(el) {
    if (el.closest('#agent-brief, #blueprint-sheet-shell, #u4PrintRoot, nav, header, aside, .u4h-topbar, .u4h-pager, .u4h-steps, [hidden]')) return false;
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
  const elements = [...root.querySelectorAll('h1, h2, h3, h4, p, li, td, .u4h-check-row, .u4h-item-name, .u4h-item-note, .u4h-item-meta, .u4h-svg-hint, .u4h-info-title, #murGuidanceBox > div, .u4g-hold-strip, .sheet-title, .sheet-sub, .status-strip, .floor-note, .key-facts-title, .equip-name, .equip-sub, .u4b-status, .u4b-step-item-title, .u4-gal-cap, .u4-gal-sub, .banner, .callout, .lead, .photo-cap, .summary-bar, .u4-room-summary, .u4h-subtitle, .u4h-card-sub, .u4-guide-card-desc, .u4-subpage-row-desc, .u4-gal-caption, figcaption, .u4h-card-desc, .u4h-card-subtitle, .u4-doc-preview-desc, .u4h-title, .u4h-sub, .u4h-note, .u4h-callout, .u4h-hold-strip, .u4h-kpi-sub, .u4h-section-title, .u4h-status, .u4-hm-title, .u4-hm-note, .u4h-photo-cap, label.u4b-check')];
  // Each selected semantic block owns its text, including ordinary inline
  // markup, but not text owned by a nested paragraph/list/cell. In particular,
  // a TD/LI containing two short paragraphs is not one long paragraph.
  const selected = new Set(elements.filter(visible).filter(el => !elements.some(other =>
    other !== el && other.contains(el) && visible(other) && other.matches('p, h1, h2, h3, h4'))));
  function blockText(el) {
    function ownText(node) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      if (node.tagName === 'BR') return getComputedStyle(node).display === 'none' ? '' : ' ';
      if (!visible(node)) return '';
      if (node !== el && selected.has(node)) return ' ';
      return [...node.childNodes].map(ownText).join('');
    }
    return ownText(el).replace(/\s+/g, ' ').trim();
  }
  function tableContext(el) {
    const cell = el.closest('td');
    const row = cell && cell.closest('tr');
    const table = row && row.closest('table');
    if (!table) return null;
    const cells = [...row.cells];
    const rowHeader = cells.find(c => c.matches('th[scope="row"]')) || cells[0];
    const headers = [...table.rows].find(r => [...r.cells].some(c => c.matches('th:not([scope="row"])')));
    const columnHeader = headers && headers.cells[cell.cellIndex];
    return {
      table: selector(table),
      row: blockText(rowHeader) || rowHeader.innerText.trim(),
      column: columnHeader ? columnHeader.innerText.trim() : 'column ' + (cell.cellIndex + 1)
    };
  }
  function fixtureContext(el) {
    const card = el.closest('.u4b-box, .u4h-item-card, [data-fixture]');
    if (!card) return null;
    const title = card.querySelector('h1, h2, h3, h4, .u4h-item-name');
    const label = card.getAttribute('data-fixture') || (title && title.innerText.trim());
    return label ? {selector: selector(card), label} : null;
  }
  const blocks = [...selected].map(el => ({
    selector: selector(el), text: blockText(el), kind: el.matches('.u4h-title, .u4h-section-title, .sheet-title, .key-facts-title, .u4h-info-title') ? 'h2' : (el.tagName === 'DIV' || el.tagName === 'SPAN' ? 'p' : el.tagName.toLowerCase()),
    checklist: el.matches('#sec-checklist li, .u4h-check-row, label.u4b-check'),
    checklist_text: el.matches('#sec-checklist li, .u4h-check-row, label.u4b-check') ? el.innerText.trim() : null,
    table_context: tableContext(el),
    fixture_context: fixtureContext(el),
    subtitle: el.matches('.u4h-sub, .u4h-subtitle, .sheet-sub, .equip-sub, .u4-hm-note'),
    overview: el.matches('#sec-concept, .u4-room-summary'),
    y: el.getBoundingClientRect().top + scrollY
  })).filter(b => b.text || b.checklist_text);
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


def table_value_scope(block: Dict[str, Any]) -> Any:
    """Short table data repeats legitimately for distinct fixtures/columns.

    Only direct, non-sentence cell values receive this scope. Paragraphs,
    sentences and imperative instructions still compare across the page,
    including short four-versus-five-word instructions and numeric prose.
    """
    context = block.get('table_context')
    text = block['text'].strip()
    # A status label is not the imperative "Hold the wall open". Parenthetical
    # technical abbreviations (e.g. "sep. N") also do not turn a value into prose.
    status_label = bool(context and re.search(r'status|gate|estado', context.get('column', ''), re.I)
                        and re.match(r'^(?:hold|pausa)\s*:', text, re.I))
    sentence_text = re.sub(r'\([^)]*\)', '', text).strip()
    if (block['kind'] != 'td' or not context or not context.get('row')
            or block.get('checklist') or len(WORD_RE.findall(text)) > 12
            or re.search(r'[.!?](?:\s|$)', sentence_text)
            or (VERB_RE.match(text) and not status_label)):
        return None
    return tuple(str(context.get(key, '')).casefold() for key in ('table', 'row', 'column'))


def distinct_fixture_measurements(block: Dict[str, Any], part: str,
                                  previous: Dict[str, Any], previous_part: str) -> bool:
    """Different fixtures with different dimensions state different facts.

    Compare only the candidate sentence's explicit measurements, not all
    numbers elsewhere in its card. This keeps copied instructions detectable
    even when another sentence in each card gives a different measurement.
    """
    fixture = block.get('fixture_context') or {}
    prior_fixture = previous.get('fixture_context') or {}
    label, prior_label = fixture.get('label', ''), prior_fixture.get('label', '')
    if not label or not prior_label or label.casefold() == prior_label.casefold():
        return False
    values = MEASUREMENT_RE.findall(part)
    prior_values = MEASUREMENT_RE.findall(previous_part)
    return bool(values and prior_values and values != prior_values)


def audit_blocks(snapshot: Dict[str, Any], page: str, lang: str,
                 room: bool = False) -> List[Dict[str, str]]:
    findings: List[Dict[str, str]] = []
    if not snapshot.get('blocks'):
        findings.append(dict(page=page, lang=lang, selector='#doc', text='(no visible prose blocks extracted)', reason='No rendered prose inspected on view.'))

    def flag(block: Dict[str, Any], reason: str) -> None:
        findings.append(dict(page=page, lang=lang, selector=block['selector'],
                             text=block['text'], reason=reason))

    blocks = snapshot.get('blocks', [])
    for i, block in enumerate(blocks):
        text = block['text']
        validation_text = (block.get('checklist_text') or text) if block.get('checklist') else text
        words = WORD_RE.findall(validation_text)
        if block.get('subtitle') and i:
            prior = tokens(blocks[i - 1]['text'])
            current = tokens(text)
            if len(prior) >= 2 and prior <= current and len(prior) / max(1, len(current)) >= .6:
                flag(block, 'Subtitle echoes preceding title.')
        if FILLER_RE.search(text):
            flag(block, 'Cut filler or meta prose; state the action directly.')
        if RAW_RE.search(text):
            flag(block, 'Move raw coordinates or internal IDs to technical details.')
        limit = 35 if block.get('checklist') else 55
        if not block['kind'].startswith('h') and len(words) > limit:
            flag(dict(block, text=validation_text), 'Split or shorten block: {} words (limit {}).'.format(len(words), limit))
        if block.get('overview'):
            sentences = [s for s in re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])', text) if s.strip()]
            if len(sentences) > 2:
                flag(block, 'Overview exceeds two sentences.')
        if block.get('checklist') and (not VERB_RE.search(re.sub(r'\([^)]*\)', '', validation_text)) or not CONTEXT_RE.search(validation_text)):
            flag(dict(block, text=validation_text), 'Checklist needs a concrete verb plus a fixture/location or measurable check/hold.')
    # Compare sentences as well as whole bullets: a repeated sentence inside
    # an otherwise different paragraph must not escape the 80% overlap rule.
    seen = []
    for block in blocks:
        text = block['text']
        scope = table_value_scope(block)
        parts = [text] + [part.strip() for part in re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])', text) if part.strip() != text]
        current = []
        for part in parts:
            a = tokens(part)
            if not a:
                continue
            for previous, previous_part, b, previous_scope in seen + [entry for entry in current if entry[1] != text]:
                if scope != previous_scope:
                    continue
                score = len(a & b) / len(a | b)
                if score >= .8:
                    if distinct_fixture_measurements(block, part, previous, previous_part):
                        continue
                    # Repeated section headings can be navigation, but a
                    # title echoed in a subtitle adds no useful information.
                    if block['kind'].startswith('h') and previous['kind'].startswith('h'):
                        continue
                    flag(block, 'Duplicate/near-duplicate ({:.0%}) of {}: {}.'.format(score, previous['selector'], previous_part))
                    break
            current.append((block, part, a, scope))
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
