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
        self.assertEqual(2, len(snapshot['blocks']))
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
