import sys, json, functools, http.server, socketserver, threading
from playwright.sync_api import sync_playwright

ROOT = '/workspace/work_office/office'
PORT = 8156
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer):
    allow_reuse_address = True
httpd = Q(('127.0.0.1', PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}/index.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/workspace/downloads'
tag = sys.argv[2] if len(sys.argv) > 2 else 'local'

errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox', '--disable-dev-shm-usage'])
    ctx = b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_timeout(1500)
    print('overflow:', pg.evaluate('[document.documentElement.scrollWidth, window.innerWidth, document.body.scrollHeight]'))
    pg.screenshot(path=f'{OUT}/office_home_{tag}.png', full_page=True)
    pg.screenshot(path=f'{OUT}/office_fold_{tag}.png')
    pg.click('.zlabel[data-part="study"]')
    pg.wait_for_timeout(800)
    pg.screenshot(path=f'{OUT}/office_panel_{tag}.png')
    print('panel visible:', pg.locator('#sheetWrap').is_visible(), 'tasks:', pg.locator('#sheetBody li[data-task]').count())
    print('errors:', errs[:8])
    b.close()
httpd.shutdown()
