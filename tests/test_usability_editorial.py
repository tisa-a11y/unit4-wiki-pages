import ast
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from usability_editorial import audit_blocks, render_queue


def block(text, kind='p', **kw):
    return dict(selector=kw.pop('selector', '#test'), text=text, kind=kind, **kw)


class EditorialTests(unittest.TestCase):
    def audit(self, *blocks, **kw):
        return audit_blocks(dict(blocks=list(blocks), **kw), '#kitchen', 'en')

    def test_actionable_bilingual_and_completed_items(self):
        for text in ('Verify the hood clearance is 30 inches before closing the wall.',
                     'Verifica la campana antes de cerrar el muro.',
                     'Replace bathroom window and casing.',
                     'Installed 28-inch hallway door; verify hinge clearance.'):
            self.assertEqual([], self.audit(block(text, 'li', checklist=True)))

    def test_missing_action_and_missing_context_fail(self):
        for text in ('Kitchen cabinet thoughts', 'Complete various updates', 'Kitchen cabinet thoughts (updated)', 'Review status items before Friday'):
            self.assertTrue(self.audit(block(text, 'li', checklist=True)))

    def test_duplicate_threshold(self):
        original = block('Verify hood clearance before closing the kitchen wall.', selector='#a')
        duplicate = block('Verify the kitchen wall hood clearance before closing.', selector='#b')
        self.assertTrue(any('Duplicate' in x['reason'] for x in self.audit(original, duplicate)))
        distinct = block('Measure the hallway door before ordering hinge hardware.', selector='#c')
        self.assertEqual([], self.audit(original, distinct))

    def test_repeated_sentence_inside_different_paragraphs(self):
        a = block('Verify the hood clearance before closing the wall. Measure the kitchen window.', selector='#a')
        b = block('Verify the hood clearance before closing the wall. Photograph the bedroom door.', selector='#b')
        self.assertTrue(self.audit(a, b))

    def test_one_paragraph_does_not_echo_its_own_sentences(self):
        self.assertEqual([], self.audit(block('Verify the hood clearance before closing the wall. Photograph the bedroom door.')))

    def test_repeated_sentence_in_one_paragraph(self):
        self.assertTrue(self.audit(block('Verify hood clearance before closing the wall. Verify hood clearance before closing the wall.')))

    def test_short_near_duplicate_is_order_independent(self):
        a = block('Check the kitchen wall clearance.', selector='#a')
        b = block('Check the kitchen wall.', selector='#b')
        self.assertTrue(self.audit(a, b))
        self.assertTrue(self.audit(b, a))

    def test_title_echo(self):
        self.assertTrue(self.audit(block('Kitchen layout', 'h1'), block('Kitchen layout', selector='#subtitle')))

    def test_empty_snapshot_is_queued(self):
        findings = audit_blocks({'blocks': []}, '/empty', 'en')
        self.assertEqual(1, len(findings))
        self.assertIn('No rendered prose', render_queue(findings))

    def test_subtitle_echo_with_extra_word(self):
        self.assertTrue(self.audit(block('Kitchen hood', 'h1'), block('Kitchen hood overview', subtitle=True)))

    def test_table_list_caption_limits(self):
        for kind in ('td', 'li', 'figcaption'):
            self.assertTrue(self.audit(block('word ' * 56, kind)))

    def test_word_limits(self):
        for kind, limit, ck in [('p', 55, False), ('li', 35, True)]:
            text = 'Verify wall ' + 'safe ' * (limit - 2)
            self.assertEqual([], self.audit(block(text, kind, checklist=ck)))
            self.assertTrue(self.audit(block(text + 'extra', kind, checklist=ck)))

    def test_filler_and_ids(self):
        for text in ('This section covers the kitchen.', 'Please note that the wall is open.',
                     'Esta sección cubre la cocina.', 'Various updates', 'See above',
                     'Todoist ID: 123456789012', 'Magicplan plan abb2d2c6', 'X=174", Y=228.5"', 'clear_between_casings', 'rev-006', '6abcdefghijklmno', 'X: 19"->30"'):
            self.assertTrue(self.audit(block(text)), text)

    def test_measurements_are_not_ids(self):
        self.assertEqual([], self.audit(block('Verify HD-1 at 83–86 inches AFF and a 6-inch duct.')))

    def test_room_rhythm(self):
        good = dict(overview=1, hero=2, checklist=3, documents=4, field_note=5,
                    details=6, checklist_count=5, details_open=False)
        self.assertEqual([], audit_blocks(dict(blocks=[block('Verify wall clearance.')], rhythm=good), '#hvac', 'en', room=True))
        bad = dict(good, hero=7, checklist_count=8, details_open=True)
        self.assertEqual(3, len(audit_blocks(dict(blocks=[block('Verify wall clearance.')], rhythm=bad), '#hvac', 'en', room=True)))

    def test_queue_escapes_and_keeps_all_findings(self):
        findings = self.audit(block('See above <script>alert(1)</script>'))
        report = render_queue(findings * 40)
        self.assertNotIn('<script>', report)
        self.assertEqual(40, report.count('&lt;script&gt;'))

    def test_python_39_grammar(self):
        root = Path(__file__).resolve().parents[1]
        for name in ('usability_gate.py', 'usability_editorial.py'):
            ast.parse((root / 'tools' / name).read_text(), feature_version=(3, 9))


if __name__ == '__main__':
    unittest.main()
