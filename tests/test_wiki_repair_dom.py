"""Regression coverage for the repaired real tile plan and image audit.

These tests run the shipped page, including its SVG and print renderers. They do
not reproduce the coordinate calculations or depend on the editorial thresholds.
"""
import sys
import unittest
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import usability_gate as gate


class WikiRepairDOMTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.server, cls.base_url = gate.start_server(ROOT)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        executable = gate.find_chromium_executable()
        self.browser = await self.playwright.chromium.launch(
            **({'executable_path': executable} if executable else {}))
        self.page = await self.browser.new_page(
            viewport={'width': 390, 'height': 844})
        await gate.setup_network_stubs(self.page, self.base_url)

    async def asyncTearDown(self):
        await self.browser.close()
        await self.playwright.stop()

    async def test_bathroom_all_steps_both_languages_render_and_print(self):
        errors = []
        self.page.on('pageerror', lambda error: errors.append(str(error)))
        steps = ('field-layout', 'plumbing-stops', 'niches-trim', 'crew-steps')
        for language in ('en', 'es'):
            for step in steps:
                with self.subTest(language=language, step=step):
                    errors.clear()
                    await self.page.emulate_media(media='screen')
                    await self.page.goto(
                        self.base_url + '/plans/bathroom-tile/?standalone=1&lang=' + language
                        + '&step=' + step + '#step=' + step)
                    self.assertEqual([], errors, 'Runtime errors in real tile plan')
                    self.assertEqual(2, await self.page.locator('#u4PrintRoot .u4-print-page').count(),
                                     'Both print sheets must be generated during page render')
                    self.assertEqual(step, await self.page.locator(
                        '#u4hStepBar [data-step].active').get_attribute('data-step'))
                    body = await self.page.locator('#u4hBody').inner_text()
                    self.assertGreater(len(body.strip()), 100)
                    self.assertNotRegex(body, r'\b(?:undefined|NaN|Infinity)\b')
                    self.assertEqual(4, await self.page.locator(
                        '#u4hStepBar [data-step]').count())
                    if step != 'crew-steps':
                        self.assertGreater(await self.page.locator('#u4hBody svg').count(), 0)
                    geometry_errors = await self.page.evaluate(r'''() => {
                        const errors = [];
                        const attrs = new Set(['x','y','x1','y1','x2','y2',
                            'cx','cy','r','rx','ry','width','height',
                            'viewBox','points','d','transform']);
                        for (const el of document.querySelectorAll(
                            '#u4hBody svg, #u4hBody svg *, #u4PrintRoot svg, #u4PrintRoot svg *')) {
                            for (const attr of el.attributes) {
                                if (!attrs.has(attr.name)) continue;
                                const value = attr.value;
                                if (/NaN|undefined|Infinity/.test(value)) {
                                    errors.push(el.tagName + ' ' + attr.name + '=' + value);
                                }
                                const numbers = value.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
                                if (numbers.some(n => !Number.isFinite(Number(n)))) {
                                    errors.push(el.tagName + ' ' + attr.name + '=' + value);
                                }
                            }
                        }
                        return errors;
                    }''')
                    self.assertEqual([], geometry_errors, 'Invalid SVG coordinates')
                    self.assertEqual(3, await self.page.locator('#u4PrintRoot svg').count())
                    headings = await self.page.locator('#u4PrintRoot h2').all_text_contents()
                    self.assertEqual(2, len(headings))
                    self.assertTrue(all(('BAÑO' if language == 'es' else 'BATHROOM') in h
                                        for h in headings), headings)
                    print_text = await self.page.locator('#u4PrintRoot').text_content()
                    self.assertNotRegex(print_text, r'\b(?:undefined|NaN|Infinity)\b')
                    await self.page.emulate_media(media='print')
                    for sheet in await self.page.locator('#u4PrintRoot .u4-print-page').all():
                        self.assertTrue(await sheet.is_visible())
                        self.assertGreater(len((await sheet.inner_text()).strip()), 100)
                        bounds = await sheet.bounding_box()
                        self.assertGreater(bounds['width'], 0)
                        self.assertGreater(bounds['height'], 0)
                    self.assertEqual([], errors, 'Print rendering raised a runtime error')

    async def test_room_navigation_keeps_holds_and_clears_previous_details(self):
        await self.page.goto(self.base_url + '/?lang=en#hvac')
        await self.page.wait_for_function("document.querySelector('#sec-concept')")
        room_text = await self.page.locator('#doc').inner_text()
        self.assertIn('do not cut ceilings', room_text)
        self.assertIn('temporary NW bedroom-closet ceiling', room_text)
        self.assertEqual(1, await self.page.locator('#sec-details').count())
        self.assertEqual(1, await self.page.locator('nav#rail').count())
        await self.page.wait_for_function("document.querySelector('#u4AiFloatingDock')")
        self.assertEqual('static', await self.page.locator('#u4AiFloatingDock').evaluate(
            '(el) => getComputedStyle(el).position'))
        self.assertEqual(1, await self.page.locator('#u4AiFloatingDock').count())
        await self.page.evaluate("location.hash = 'decisions'")
        await self.page.wait_for_function("document.querySelector('#doc h1')?.textContent === 'Project Planning'")
        self.assertEqual(0, await self.page.locator('#roomTechnical > *').count(),
                         'Previous room details must not remain on the decisions page')
        await self.page.evaluate("location.hash = 'electrical'")
        await self.page.wait_for_function("document.querySelector('#sec-checklist')")
        self.assertEqual(1, await self.page.locator('#sec-details').count())
        self.assertEqual(1, await self.page.locator('nav#rail').count())
        self.assertEqual(1, await self.page.locator('#u4AiFloatingDock').count())

    async def test_image_audit_skips_hidden_lazy_but_reports_visible_broken(self):
        valid = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect width='30' height='30' fill='green'/%3E%3C/svg%3E"
        await self.page.set_content('''
            <div hidden><img id="hidden-lazy" loading="lazy" width="30" height="30"
                alt="Hidden valid photograph" src="''' + valid + '''"></div>
            <details><summary>Reference photos</summary><img id="closed-lazy"
                loading="lazy" width="30" height="30" alt="Collapsed valid photograph"
                src="''' + valid + '''"></details>
            <img id="visible-lazy" loading="lazy" width="30" height="30"
                alt="Visible valid photograph" src="''' + valid + '''">
        ''')
        self.assertEqual([], await self.page.evaluate(gate.JS_IMAGE_INTEGRITY))
        self.assertEqual('lazy', await self.page.locator('#hidden-lazy').get_attribute('loading'))
        self.assertEqual('lazy', await self.page.locator('#closed-lazy').get_attribute('loading'))
        self.assertGreater(await self.page.locator('#visible-lazy').evaluate(
            '(img) => img.naturalWidth'), 0)
        await self.page.evaluate('''() => {
            const broken = document.createElement('img');
            broken.src = 'data:image/png;base64,bm90LWFuLWltYWdl';
            broken.alt = 'Visible broken photograph';
            broken.width = broken.height = 30;
            document.body.append(broken);
        }''')
        issues = await self.page.evaluate(gate.JS_IMAGE_INTEGRITY)
        self.assertEqual(1, len(issues), issues)
        self.assertIn('Broken image (naturalWidth=0)', issues[0])
        self.assertIn('Visible broken photograph', issues[0])


if __name__ == '__main__':
    unittest.main()
