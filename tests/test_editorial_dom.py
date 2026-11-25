"""Browser fixtures for rendered-content exclusions and room section discovery."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from playwright.sync_api import sync_playwright
from usability_editorial import JS_EDITORIAL_BLOCKS, audit_blocks


class EditorialDOMTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        chrome = Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        cls.browser = cls.pw.chromium.launch(**({'executable_path': str(chrome)} if chrome.exists() else {}))

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def test_hidden_layers_and_comments_are_excluded(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('''<main><article id="doc">
          <!-- <p>Please note that this is obsolete.</p> -->
          <div id="agent-brief"><p>Please note that this is hidden.</p></div>
          <div hidden><p>Please note that this is hidden.</p></div>
          <div style="display:none"><p>Please note that this is hidden.</p></div>
          <div id="blueprint-sheet-shell"><p>Please note that this is technical.</p></div>
          <details id="sec-details"><summary>Technical details</summary><p>Please note that this is closed.</p></details>
          <p>Verify the hood clearance before closing the wall.</p>
          <ul><li>Check the panel gauge.<p>Keep the wall open until approval.</p></li></ul>
        </article></main>''')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(3, len(snapshot['blocks']))
        self.assertEqual(['Verify the hood clearance before closing the wall.', 'Check the panel gauge.', 'Keep the wall open until approval.'], [b['text'] for b in snapshot['blocks']])
        self.assertIsNotNone(snapshot['rhythm']['details'])
        self.assertEqual([], audit_blocks(snapshot, '/fixture', 'en'))
        page.locator('summary').click()
        self.assertTrue(audit_blocks(page.evaluate(JS_EDITORIAL_BLOCKS), '/fixture', 'en'))

    def test_plan_prose_outside_hidden_main_is_inspected(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<main hidden><p>Hidden blueprint</p></main><section><div class="u4h-title">Kitchen</div><div class="u4h-sub">Please note that this is the room plan.</div></section>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(2, len(snapshot['blocks']))
        self.assertTrue(audit_blocks(snapshot, '/plan', 'en'))

    def test_checklist_heading_is_not_a_milestone(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<article id="doc"><section id="sec-checklist"><h2>Checklist 0/1 done</h2><ul><li>Verify wall clearance is 30 inches.</li></ul></section></article>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual([], audit_blocks(snapshot, '#kitchen', 'en'))

    def test_nested_wrapper_does_not_duplicate_its_paragraph(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<div class="u4h-callout"><p>Verify the hood clearance before closing the wall.</p></div>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(1, len(snapshot['blocks']))
        self.assertEqual([], audit_blocks(snapshot, '/plan', 'en'))

    def test_nested_paragraphs_have_individual_limits_and_keep_parent_text(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        paragraph = 'Verify wall ' + 'safe ' * 28
        page.set_content('<table><tr><td>Fixture A<p>' + paragraph + '</p><p>Measure door ' + 'clear ' * 28 + '</p>Retain trim.</td></tr></table>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(['Fixture A Retain trim.', paragraph.strip(), ('Measure door ' + 'clear ' * 28).strip()], [b['text'] for b in snapshot['blocks']])
        self.assertEqual([], audit_blocks(snapshot, '/table', 'en'))

    def test_nested_checklist_keeps_aggregate_limit_without_duplicate_text(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<section id="sec-checklist"><ul><li>Verify wall.<p>' + 'safe ' * 18 + '</p><p>' + 'clear ' * 18 + '</p></li></ul></section>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(3, len(snapshot['blocks']))
        issues = audit_blocks(snapshot, '/checklist', 'en')
        self.assertEqual(1, len(issues), issues)
        self.assertIn('limit 35', issues[0]['reason'])
        self.assertIn('safe', issues[0]['text'])

    def test_table_context_separates_repeated_fixture_values(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<table><tr><th>Fixture</th><th>Height</th><th>Status</th></tr><tr><td>Hood</td><td>30 inches</td><td>NEW</td></tr><tr><td>Range</td><td>30 inches</td><td>NEW</td></tr></table>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual([], audit_blocks(snapshot, '/table', 'en'))
        values = [b for b in snapshot['blocks'] if b['text'] == '30 inches']
        self.assertEqual(['Hood', 'Range'], [b['table_context']['row'] for b in values])
        self.assertEqual(['Height', 'Height'], [b['table_context']['column'] for b in values])

    def test_table_paragraph_duplicates_are_not_hidden_by_context(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<table><tr><td>Hood<p>Check the kitchen wall.</p></td></tr><tr><td>Range<p>Check the kitchen wall clearance.</p></td></tr></table>')
        issues = audit_blocks(page.evaluate(JS_EDITORIAL_BLOCKS), '/table', 'en')
        self.assertTrue(any('Duplicate/near-duplicate (80%)' in i['reason'] for i in issues), issues)

    def test_fixture_measurements_keep_heading_context(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<div class="u4b-box"><h4>Tub spout</h4><p>15-1/2″ from North corner and 5-1/2″ above tub rim.</p></div><div class="u4b-box"><h4>Valve</h4><p>15-1/2″ from North corner and 27″ above tub rim.</p></div>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(['Tub spout', 'Valve'], [b['fixture_context']['label'] for b in snapshot['blocks'] if b['kind'] == 'p'])
        self.assertEqual([], audit_blocks(snapshot, '/bathroom', 'en'))

    def test_guide_card_title_subtitle_echo_is_inspected(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<article id="doc"><a class="u4-hm-packet"><span class="u4-hm-title">Kitchen layout</span><span class="u4-hm-note">Kitchen layout</span></a></article>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(2, len(snapshot['blocks']))
        self.assertTrue(any('Duplicate' in x['reason'] for x in audit_blocks(snapshot, '#kitchen', 'en')))

    def test_plan_checklist_and_guide_table_are_inspected(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<label class="u4h-check-row"><input type="checkbox"><span class="u4h-check-body"><strong>Verify platform </strong><span>X=174, Y=228.5</span></span></label><table><tr><td>See above</td></tr></table><div class="banner">Please note that the wall is open.</div>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertEqual(3, len(snapshot['blocks']))
        self.assertTrue(snapshot['blocks'][0]['checklist'])
        self.assertEqual(3, len(audit_blocks(snapshot, '/plan', 'en')))

    def test_label_checklist_is_inspected(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('<label class="u4b-check"><input type="checkbox"><span>Various updates</span></label>')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertTrue(snapshot['blocks'][0]['checklist'])
        self.assertTrue(audit_blocks(snapshot, '/plan', 'en'))

    def test_sibling_field_note_and_render_caption(self):
        page = self.browser.new_page()
        self.addCleanup(page.close)
        page.set_content('''<main><article id="doc"><p id="sec-concept">Verify the kitchen hood.</p>
        <figure class="u4-lead-pic"><img width="20" height="20" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'/%3E"><figcaption>See above</figcaption></figure>
        <section id="sec-checklist"><ul><li>Check wall 1.</li><li>Check wall 2.</li><li>Check wall 3.</li><li>Check wall 4.</li></ul></section>
        <section id="sec-docs">Documents</section></article>
        <section id="field">Field note</section>
        <details id="sec-details"><summary>Technical details</summary><p>Hidden reference</p></details></main>''')
        snapshot = page.evaluate(JS_EDITORIAL_BLOCKS)
        self.assertIsNotNone(snapshot['rhythm']['field_note'])
        issues = audit_blocks(snapshot, '#kitchen', 'en', room=True)
        self.assertEqual(1, len(issues), issues)
        self.assertIn('filler', issues[0]['reason'])


if __name__ == '__main__':
    unittest.main()
