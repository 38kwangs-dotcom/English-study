import sys, functools, http.server, socketserver, threading
from playwright.sync_api import sync_playwright
ROOT='/workspace/work_office/office'; PORT=8157
Handler=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address=True
httpd=Q(('127.0.0.1',PORT),Handler); threading.Thread(target=httpd.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    pg=b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,locale='ko-KR').new_page()
    pg.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle'); pg.wait_for_timeout(1200)
    pg.locator('.map-card').screenshot(path='/workspace/downloads/map_zoom.png')
    pg.screenshot(path='/workspace/downloads/office_fold_v4.png')
    b.close()
httpd.shutdown()
