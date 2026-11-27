import json, functools, http.server, socketserver, threading
from playwright.sync_api import sync_playwright
ROOT='/workspace/work_office/office'; PORT=8161
Handler=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address=True
httpd=Q(('127.0.0.1',PORT),Handler); threading.Thread(target=httpd.serve_forever,daemon=True).start()
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, locale='ko-KR', is_mobile=True, has_touch=True)
    pg=ctx.new_page()
    pg.route('**zzkjwucarircmqmuhpka**', lambda r: r.abort())
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='load'); pg.wait_for_timeout(1200)
    print('labels:', pg.locator('.zlabel').count(), 'rows:', pg.locator('.part-row').count())
    # delete a map part
    pg.on('dialog', lambda d: d.accept())
    pg.click('.zlabel[data-part="family"]'); pg.wait_for_timeout(600)
    pg.click('#sheetBody [data-act="delpart"]'); pg.wait_for_timeout(800)
    print('after delete: labels', pg.locator('.zlabel').count(), 'rows', pg.locator('.part-row').count())
    pg.screenshot(path='/workspace/downloads/office_after_delete.png')
    # add a new part
    pg.click('#tabs button[data-tab="status"]'); pg.wait_for_timeout(300)
    pg.fill('#newPartName', '🧾 집안 살림·행정'); pg.click('#addPartForm button'); pg.wait_for_timeout(500)
    print('after add part:', pg.locator('.part-row').count(), pg.evaluate("window.__office.data().parts.map(p=>p.title)"))
    pg.click('#tabs button[data-tab="office"]'); pg.wait_for_timeout(400)
    pg.screenshot(path='/workspace/downloads/office_after_add.png')
    print('ERRORS:', errs[:8])
    b.close()
httpd.shutdown()
